//! D1 credentials and wire-compatible KV authentication.

use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
#[cfg(feature = "debug-fixtures")]
use topcoat::router::content::{Form, Json};
use topcoat::{
    Result,
    context::Cx,
    cookie::{Cookie, Cookies, SameSite, cookies, time::Duration},
    router::{
        error::{SeeOther, see_other},
        route,
    },
    runtime::procedure,
};
#[cfg(feature = "debug-fixtures")]
use topcoat::{
    asset::asset,
    router::page,
    view::{View, view},
};
use worker::send::SendFuture;

pub(crate) const SESSION_TTL: u64 = 2_592_000;
type HmacSha256 = Hmac<Sha256>;

#[derive(Deserialize, Serialize)]
pub(crate) struct UserRow {
    pub user_id: i64,
    pub public_id: String,
    pub username: String,
    pub user_password: String,
    pub user_role: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionAuth {
    username: String,
    id: i64,
    public_id: String,
    role: String,
    created_at: i64,
    updated_at: i64,
}

#[derive(Deserialize, Serialize)]
struct SessionData {
    #[serde(skip_serializing_if = "Option::is_none")]
    auth: Option<SessionAuth>,
    #[serde(skip_serializing_if = "Option::is_none")]
    token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    welcome: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    flash: Option<serde_json::Value>,
}

fn sign(key: &str, message: &str) -> Result<String> {
    let mut mac = HmacSha256::new_from_slice(key.as_bytes())?;
    mac.update(message.as_bytes());
    Ok(URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes()))
}

pub(crate) fn uuid() -> Result<String> {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes).map_err(|e| topcoat::Error::msg(e.to_string()))?;
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    let hex: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
    Ok(format!(
        "{}-{}-{}-{}-{}",
        &hex[..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..]
    ))
}

pub(crate) async fn find_user(cx: &Cx, username: &str) -> Result<Option<UserRow>> {
    let db = topcoat_cloudflare::env(cx).d1("cloudflare_db")?;
    let statement = db
        .prepare("SELECT * FROM user WHERE username = ?")
        .bind(&[username.into()])?;
    Ok(SendFuture::new(statement.first(None)).await?)
}

async fn session_id(cx: &Cx) -> Result<Option<String>> {
    let Some(cookie) = cookies(cx).get("__session") else {
        return Ok(None);
    };
    let Some((id, signature)) = cookie.value().rsplit_once('.') else {
        return Ok(None);
    };
    if id.is_empty() {
        return Ok(None);
    }
    let Ok(signature) = URL_SAFE_NO_PAD.decode(signature) else {
        return Ok(None);
    };
    let secret = topcoat_cloudflare::env(cx)
        .secret("USER_SESSION_SECRET")?
        .to_string();
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())?;
    mac.update(id.as_bytes());
    Ok(mac.verify_slice(&signature).is_ok().then(|| id.to_owned()))
}

async fn read_session(cx: &Cx) -> Result<Option<SessionData>> {
    let Some(id) = session_id(cx).await? else {
        return Ok(None);
    };
    let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
    let data = SendFuture::new(kv.get(&format!("session:{id}")).text()).await?;
    Ok(data.map(|json| serde_json::from_str(&json)).transpose()?)
}

pub(crate) async fn is_authenticated(cx: &Cx) -> Result<bool> {
    Ok(read_session(cx)
        .await?
        .is_some_and(|session| session.auth.is_some()))
}

pub(crate) struct ApiSession {
    pub token: Option<String>,
}

pub(crate) async fn api_session(cx: &Cx) -> Result<Option<ApiSession>> {
    Ok(read_session(cx)
        .await?
        .filter(|session| session.auth.is_some())
        .map(|session| ApiSession {
            token: session.token,
        }))
}

// Equivalent to Zod 3.25.76's email regex, without adding a regex dependency.
fn valid_email(email: &str) -> bool {
    let Some((local, domain)) = email.split_once('@') else {
        return false;
    };
    let local_end = |b: u8| b.is_ascii_alphanumeric() || b"_+-".contains(&b);
    if local.starts_with('.')
        || email.contains("..")
        || !local.bytes().all(|b| local_end(b) || b"'.".contains(&b))
        || !local.bytes().last().is_some_and(local_end)
    {
        return false;
    }
    let Some((labels, tld)) = domain.rsplit_once('.') else {
        return false;
    };
    tld.len() >= 2
        && tld.bytes().all(|b| b.is_ascii_alphabetic())
        && labels.split('.').all(|label| {
            label
                .bytes()
                .next()
                .is_some_and(|b| b.is_ascii_alphanumeric())
                && label
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b == b'-')
        })
}

pub(crate) fn js_trim(value: &str) -> &str {
    value.trim_matches(|c| {
        matches!(c,
        '\u{0009}'..='\u{000d}' | '\u{0020}' | '\u{00a0}' | '\u{1680}'
        | '\u{2000}'..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}'
        | '\u{205f}' | '\u{3000}' | '\u{feff}')
    })
}

fn validate_credentials<'a>(
    username: &'a str,
    password: &'a str,
) -> std::result::Result<(&'a str, &'a str), &'static str> {
    if !valid_email(username) {
        return Err("Enter a valid email address.");
    }
    // Zod applies checks before trim; JS String.length counts UTF-16 code units.
    if password.encode_utf16().count() < 6 {
        return Err("Use at least 6 characters.");
    }
    Ok((js_trim(username), js_trim(password)))
}

#[procedure("/api/register")]
async fn register_account(cx: &Cx, username: String, password: String) -> Result<String> {
    let (username, password) = match validate_credentials(&username, &password) {
        Ok(credentials) => credentials,
        Err(message) => return Ok(message.to_owned()),
    };
    if find_user(cx, username).await?.is_some() {
        return Ok("User already exists.".to_owned());
    }
    insert_user(cx, username, password).await?;
    let mut session = read_session(cx).await?.unwrap_or(SessionData {
        auth: None,
        token: None,
        welcome: None,
        flash: None,
    });
    session.welcome = Some(serde_json::json!({"isComplete": false}));
    write_session(cx, &session).await?;
    Ok(String::new())
}

#[procedure("/api/login")]
async fn login(cx: &Cx, username: String, password: String) -> Result<String> {
    let (username, password) = match validate_credentials(&username, &password) {
        Ok(credentials) => credentials,
        Err(message) => return Ok(message.to_owned()),
    };
    let Some(user) = find_user(cx, username).await? else {
        return Ok("User does not exist.".to_owned());
    };
    if !bcrypt::verify(password, &user.user_password)
        .map_err(|e| topcoat::Error::msg(e.to_string()))?
    {
        return Ok("Incorrect password.".to_owned());
    }
    let secret = topcoat_cloudflare::env(cx)
        .secret("JWT_SECRET_KEY")?
        .to_string();
    let header = URL_SAFE_NO_PAD.encode(br#"{"alg":"HS256","typ":"JWT"}"#);
    let claims = serde_json::json!({
        "user_id": user.public_id,
        "username": user.username,
        "role": user.user_role,
        "exp": (js_sys::Date::now() / 1000.0) as u64 + 1800,
    });
    let unsigned = format!(
        "{header}.{}",
        URL_SAFE_NO_PAD.encode(serde_json::to_vec(&claims)?)
    );
    let token = format!("{unsigned}.{}", sign(&secret, &unsigned)?);
    let previous = read_session(cx).await?;
    let session = SessionData {
        auth: Some(SessionAuth {
            username: user.username,
            id: user.user_id,
            public_id: user.public_id,
            role: user.user_role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }),
        token: Some(token),
        welcome: previous.as_ref().and_then(|s| s.welcome.clone()),
        flash: previous.and_then(|s| s.flash),
    };
    write_session(cx, &session).await?;
    Ok(String::new())
}

async fn write_session(cx: &Cx, session: &SessionData) -> Result<()> {
    let id = match session_id(cx).await? {
        Some(id) => id,
        None => uuid()?,
    };
    let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
    SendFuture::new(
        kv.put(&format!("session:{id}"), serde_json::to_string(session)?)?
            .expiration_ttl(SESSION_TTL)
            .execute(),
    )
    .await?;
    let secret = topcoat_cloudflare::env(cx)
        .secret("USER_SESSION_SECRET")?
        .to_string();
    cookies(cx).add(
        Cookie::build(("__session", format!("{id}.{}", sign(&secret, &id)?)))
            .http_only(true)
            .same_site(SameSite::Lax)
            .secure(true)
            .path("/")
            .max_age(Duration::seconds(SESSION_TTL as i64))
            .build(),
    );
    Ok(())
}

#[cfg(feature = "debug-fixtures")]
#[page("/me")]
async fn me(cx: &Cx) -> Result<impl View> {
    let Some(session) = read_session(cx).await? else {
        return Err(see_other("/login").into());
    };
    let Some(auth) = session.auth else {
        return Err(see_other("/login").into());
    };
    Ok(view! {
        <!DOCTYPE html><html lang="en"><head>
            <meta charset="utf-8"><title>"Local Food4U session"</title>
            <link rel="stylesheet" href=(asset!("../assets/spike.css"))>
            <link rel="icon" href="data:,">
        </head><body><main>
            <h1>"Signed in"</h1><p id="username">(auth.username)</p>
            <p>"Compatibility spike — fake local data only."</p>
            <form method="post" action="/logout"><button type="submit">"Log out"</button></form>
        </main></body></html>
    })
}

#[route(POST "/logout")]
async fn logout(cx: &Cx) -> Result<SeeOther> {
    destroy_session(cx).await
}

#[route(POST "/api/auth/logout")]
async fn public_logout(cx: &Cx) -> Result<SeeOther> {
    destroy_session(cx).await
}

async fn destroy_session(cx: &Cx) -> Result<SeeOther> {
    if let Some(id) = session_id(cx).await? {
        let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
        SendFuture::new(kv.delete(&format!("session:{id}"))).await?;
    }
    cookies(cx).remove(
        Cookie::build(("__session", ""))
            .path("/")
            .http_only(true)
            .same_site(SameSite::Lax)
            .secure(true)
            .build(),
    );
    Ok(see_other("/login"))
}

#[cfg(feature = "debug-fixtures")]
#[derive(Deserialize)]
struct Credentials {
    username: String,
    password: String,
}

#[cfg(feature = "debug-fixtures")]
#[route(POST "/register")]
async fn register(cx: &Cx, Form(form): Form<Credentials>) -> Result<Json<serde_json::Value>> {
    crate::auth_probe::require_debug(cx)?;
    let id = insert_user(cx, &form.username, &form.password).await?;
    Ok(Json(
        serde_json::json!({"registered": true, "public_id": id}),
    ))
}

async fn insert_user(cx: &Cx, username: &str, password: &str) -> Result<String> {
    let password = bcrypt::hash(password, 10).map_err(|e| topcoat::Error::msg(e.to_string()))?;
    let id = uuid()?;
    let now = (js_sys::Date::now() / 1000.0) as i64;
    let db = topcoat_cloudflare::env(cx).d1("cloudflare_db")?;
    let stmt = db.prepare("INSERT INTO user (public_id, username, user_password, user_role, createdAt, updatedAt) VALUES (?, ?, ?, '2', ?, ?)")
        .bind(&[id.clone().into(), username.into(), password.into(), (now as f64).into(), (now as f64).into()])?;
    SendFuture::new(stmt.run()).await?;
    Ok(id)
}
