//! Wire-compatible authentication for the local compatibility spike.

use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use topcoat::{
    Result,
    asset::asset,
    context::Cx,
    cookie::{Cookie, Cookies, SameSite, cookies, time::Duration},
    router::{
        content::{Form, Json},
        error::{SeeOther, see_other},
        page, route,
    },
    runtime::{Event, procedure, signal},
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

#[procedure("/api/login")]
async fn login(cx: &Cx, username: String, password: String) -> Result<String> {
    let Some(user) = find_user(cx, &username).await? else {
        return Ok("User does not exist.".to_owned());
    };
    if !bcrypt::verify(&password, &user.user_password)
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
        welcome: None,
        flash: None,
    };
    let id = uuid()?;
    let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
    SendFuture::new(
        kv.put(&format!("session:{id}"), serde_json::to_string(&session)?)?
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
    Ok(String::new())
}

#[page("/login")]
async fn login_page(cx: &Cx) -> Result<impl View> {
    let username = signal(cx, String::new);
    let password = signal(cx, String::new);
    let error = signal(cx, String::new);
    Ok(view! {
        <!DOCTYPE html><html lang="en"><head>
            <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
            <title>"Local Food4U login"</title>
            <link rel="stylesheet" href=(asset!("../assets/spike.css"))>
            <link rel="icon" href="data:,">
            topcoat::runtime::script()
        </head><body><main>
            <h1>"Local Food4U login"</h1><p>"Compatibility spike — fake local data only."</p>
            <form @submit=$(async |e: Event| {
                e.prevent_default();
                let message = login(username.get(), password.get()).await;
                error.set(message);
                if error.get().is_empty() { raw!("window.location.assign('/me')"); }
            })>
                <p><label for="username">"Username"</label>
                    <input id="username" name="username" type="text" required=""
                        autocomplete="username" :value=$(username.get())
                        @input=$(|e: Event| username.set(e.target.value))></p>
                <p><label for="password">"Password"</label>
                    <input id="password" name="password" type="password" required=""
                        autocomplete="current-password" :value=$(password.get())
                        @input=$(|e: Event| password.set(e.target.value))></p>
                <button type="submit">"Log in"</button>
                <p role="alert" aria-live="polite">$(error.get())</p>
            </form>
        </main></body></html>
    })
}

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

#[derive(Deserialize)]
struct Credentials {
    username: String,
    password: String,
}

#[route(POST "/register")]
async fn register(cx: &Cx, Form(form): Form<Credentials>) -> Result<Json<serde_json::Value>> {
    crate::auth_probe::require_debug(cx)?;
    let password =
        bcrypt::hash(&form.password, 10).map_err(|e| topcoat::Error::msg(e.to_string()))?;
    let id = uuid()?;
    let now = (js_sys::Date::now() / 1000.0) as i64;
    let db = topcoat_cloudflare::env(cx).d1("cloudflare_db")?;
    let stmt = db.prepare("INSERT INTO user (public_id, username, user_password, user_role, createdAt, updatedAt) VALUES (?, ?, ?, '2', ?, ?)")
        .bind(&[id.clone().into(), form.username.into(), password.into(), (now as f64).into(), (now as f64).into()])?;
    SendFuture::new(stmt.run()).await?;
    Ok(Json(
        serde_json::json!({"registered": true, "public_id": id}),
    ))
}
