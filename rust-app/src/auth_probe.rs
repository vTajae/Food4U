//! Compile-time opt-in fixtures. Never included in normal app/release builds.

use crate::auth::{SESSION_TTL, UserRow, find_user};
use serde::Deserialize;
use serde_json::{Value, json};
use topcoat::{
    Result,
    context::Cx,
    router::{content::Json, request::uri, route},
};
use worker::send::SendFuture;

pub(crate) fn require_debug(cx: &Cx) -> Result<()> {
    let enabled = topcoat_cloudflare::env(cx)
        .var("SPIKE_DEBUG")
        .is_ok_and(|flag| flag.to_string() == "1");
    if !enabled {
        return Err(topcoat::router::error::not_found().into());
    }
    Ok(())
}

fn query(cx: &Cx, name: &str) -> Result<String> {
    let values: std::collections::HashMap<String, String> =
        serde_urlencoded::from_str(uri(cx).query().unwrap_or_default())?;
    values
        .get(name)
        .cloned()
        .ok_or_else(|| topcoat::Error::msg("Missing fixture query parameter"))
}

#[derive(Deserialize)]
struct SeedUser {
    username: String,
    user_password: String,
    public_id: String,
    user_role: String,
    #[serde(rename = "createdAt")]
    created_at: i64,
    #[serde(rename = "updatedAt")]
    updated_at: i64,
}

#[route(POST "/_spike/seed-user")]
async fn seed(cx: &Cx, Json(row): Json<SeedUser>) -> Result<Json<Value>> {
    require_debug(cx)?;
    let db = topcoat_cloudflare::env(cx).d1("cloudflare_db")?;
    let statement = db.prepare("INSERT INTO user (public_id, username, user_password, user_role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(&[row.public_id.into(), row.username.into(), row.user_password.into(), row.user_role.into(),
            (row.created_at as f64).into(), (row.updated_at as f64).into()])?;
    SendFuture::new(statement.run()).await?;
    Ok(Json(json!({"seeded": true})))
}

#[route(GET "/_spike/user")]
async fn user(cx: &Cx) -> Result<Json<Option<UserRow>>> {
    require_debug(cx)?;
    Ok(Json(find_user(cx, &query(cx, "username")?).await?))
}

#[route(GET "/_spike/session")]
async fn session(cx: &Cx) -> Result<Json<Value>> {
    require_debug(cx)?;
    let key = format!("session:{}", query(cx, "id")?);
    let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
    let json = SendFuture::new(kv.get(&key).text()).await?;
    Ok(Json(match json {
        Some(value) => serde_json::from_str(&value)?,
        None => Value::Null,
    }))
}

#[derive(Deserialize)]
struct SeedSession {
    id: String,
    data: Value,
}

#[route(PUT "/_spike/session")]
async fn seed_session(cx: &Cx, Json(record): Json<SeedSession>) -> Result<Json<Value>> {
    require_debug(cx)?;
    let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
    SendFuture::new(
        kv.put(
            &format!("session:{}", record.id),
            serde_json::to_string(&record.data)?,
        )?
        .expiration_ttl(SESSION_TTL)
        .execute(),
    )
    .await?;
    Ok(Json(json!({"seeded": true})))
}

#[route(GET "/_spike/sessions")]
async fn sessions(cx: &Cx) -> Result<Json<Value>> {
    require_debug(cx)?;
    let kv = topcoat_cloudflare::env(cx).kv("cloudflare_KV")?;
    let list = SendFuture::new(kv.list().prefix("session:".to_owned()).execute()).await?;
    Ok(Json(serde_json::to_value(list)?))
}

#[derive(Deserialize)]
struct BcryptProbe {
    password: String,
    hash: String,
}

#[route(POST "/_spike/bcrypt")]
async fn bcrypt_probe(cx: &Cx, Json(input): Json<BcryptProbe>) -> Result<Json<Value>> {
    require_debug(cx)?;
    let start = js_sys::Date::now();
    let valid = bcrypt::verify(input.password, &input.hash)
        .map_err(|e| topcoat::Error::msg(e.to_string()))?;
    let elapsed = js_sys::Date::now() - start;
    Ok(Json(json!({"valid": valid, "elapsed_ms": elapsed})))
}

#[route(GET "/_spike/backend-error")]
async fn backend_error(cx: &Cx) -> Result<(topcoat::router::StatusCode, Json<Value>)> {
    require_debug(cx)?;
    let Some(authenticated) = crate::auth::api_session(cx).await? else {
        return Ok((
            topcoat::router::StatusCode::UNAUTHORIZED,
            Json(json!({"message":"Please log in."})),
        ));
    };
    let case = query(cx, "case")?;
    if !matches!(
        case.as_str(),
        "403" | "500" | "nonjson" | "timeout" | "body-timeout"
    ) {
        return Err(topcoat::router::error::not_found().into());
    }
    let value =
        match crate::backend::get(cx, &format!("probe/{case}"), authenticated.token.as_deref())
            .await
        {
            Ok(_) => json!({"kind":"success","status":200,"detail":null}),
            Err(error) => json!({"kind":error.kind,"status":error.status,"detail":error.detail}),
        };
    Ok((topcoat::router::StatusCode::OK, Json(value)))
}
