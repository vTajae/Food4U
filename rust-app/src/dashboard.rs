//! Signed-in dashboard: upstream failures never masquerade as missing answers.
use serde_json::{Value, json};
use topcoat::{
    Result,
    context::Cx,
    router::{error::see_other, page},
    view::{View, view},
};

use crate::{auth, backend, dashboard_ui};

enum Loaded {
    Profile(Value),
    Unavailable(Option<String>),
}

fn http_detail(error: &backend::ApiError) -> Option<String> {
    error.status.map(|status| format!("HTTP {status}"))
}

async fn load_profile(cx: &Cx, session: &mut auth::SessionData) -> Result<Loaded> {
    let mut refreshed = false;
    let mut ensured = false;
    for _ in 0..3 {
        match backend::get(cx, "user/profile", session.token.as_deref()).await {
            Ok(profile) => return Ok(Loaded::Profile(profile)),
            Err(error)
                if error.status == Some(403)
                    && error.detail.as_deref() == Some("Token has expired")
                    && !refreshed =>
            {
                refreshed = true;
                // Like refreshUser, all refresh failures return to login. The
                // session is persisted before the retry uses its new JWT.
                let refreshed_token = match auth::refresh_backend_token(cx, session).await {
                    Ok(success) => success,
                    Err(_) => {
                        worker::console_error!("Backend token refresh failed");
                        false
                    }
                };
                if !refreshed_token {
                    // An authenticated stale session would make /login send
                    // the browser straight back here, creating a redirect loop.
                    auth::retire_session(cx).await?;
                    return Err(see_other("/login").into());
                }
            }
            Err(error)
                if error.status == Some(403)
                    && error.detail.as_deref() == Some("User not found")
                    && !ensured =>
            {
                ensured = true;
                if let Err(error) =
                    backend::post(cx, "profile", session.token.as_deref(), &Value::Null).await
                {
                    return Ok(Loaded::Unavailable(http_detail(&error)));
                }
            }
            Err(error) => return Ok(Loaded::Unavailable(http_detail(&error))),
        }
    }
    Ok(Loaded::Unavailable(None))
}

fn has_answers(profile: &Value) -> bool {
    ["attributes", "diets", "medical_history"]
        .iter()
        .any(|key| {
            profile
                .get(key)
                .and_then(Value::as_array)
                .is_some_and(|items| !items.is_empty())
        })
}

// The legacy regex is unanchored and case-insensitive only for the category;
// names remain exact, deduplicated in diet-medical-attribute insertion order.
fn profile_chips(profile: &Value) -> Vec<String> {
    let mut chips = Vec::new();
    if let Some(diets) = profile.get("diets").and_then(Value::as_array) {
        for diet in diets {
            if let Some(name) = diet
                .pointer("/diet_type/diet_name")
                .and_then(Value::as_str)
                .filter(|name| !name.is_empty())
            {
                chips.push(name.to_owned());
            }
        }
    }
    if let Some(history) = profile.get("medical_history").and_then(Value::as_array) {
        for entry in history {
            let label = entry
                .pointer("/icd_details/description")
                .and_then(Value::as_str)
                .filter(|name| !name.is_empty())
                .or_else(|| {
                    entry
                        .pointer("/icd_details/code")
                        .and_then(Value::as_str)
                        .filter(|code| !code.is_empty())
                });
            if let Some(label) = label {
                chips.push(label.to_owned());
            }
        }
    }
    if let Some(attributes) = profile.get("attributes").and_then(Value::as_array) {
        for attribute in attributes {
            let category = attribute
                .get("attribute_category")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_lowercase();
            if ["condition", "allerg", "restriction", "icd"]
                .iter()
                .any(|part| category.contains(part))
                && let Some(name) = attribute
                    .get("attribute_name")
                    .and_then(Value::as_str)
                    .filter(|name| !name.is_empty())
            {
                chips.push(name.to_owned());
            }
        }
    }
    let mut seen = std::collections::HashSet::new();
    chips
        .into_iter()
        .filter(|name| seen.insert(name.clone()))
        .take(8)
        .collect()
}

#[page("/dashboard")]
async fn dashboard(cx: &Cx) -> Result<impl View> {
    let Some(mut session) = auth::read_session(cx)
        .await?
        .filter(|session| session.auth.is_some())
    else {
        return Err(see_other("/login").into());
    };
    if session
        .welcome
        .as_ref()
        .and_then(|welcome| welcome.get("isComplete"))
        == Some(&Value::Bool(false))
    {
        return Err(see_other("/welcome").into());
    }
    let username = session
        .auth
        .as_ref()
        .expect("authenticated session")
        .username
        .clone();
    let loaded = load_profile(cx, &mut session).await?;
    let (chips, unavailable) = match loaded {
        Loaded::Unavailable(detail) => (Vec::new(), Some(detail)),
        Loaded::Profile(profile) => {
            let complete = session
                .welcome
                .as_ref()
                .and_then(|welcome| welcome.get("isComplete"))
                == Some(&Value::Bool(true));
            if !has_answers(&profile) && !complete {
                session.welcome = Some(json!({"isComplete": false}));
                if !auth::update_authenticated_session(cx, &session).await? {
                    return Err(see_other("/login").into());
                }
                return Err(see_other("/welcome").into());
            }
            if session.welcome.take().is_some()
                && !auth::update_authenticated_session(cx, &session).await?
            {
                return Err(see_other("/login").into());
            }
            (profile_chips(&profile), None)
        }
    };
    Ok(view! {
        cx =>
        crate::auth_ui::document(title: "Ask · Food4U",
            dashboard_ui::app_shell(username: username,
                if let Some(detail) = unavailable {
                    dashboard_ui::backend_unavailable(detail: detail)
                } else {
                    dashboard_ui::ask_screen(profile_chips: chips)
                }
            )
        )
    })
}
