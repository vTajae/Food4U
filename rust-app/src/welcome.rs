//! Onboarding page and validated request-scoped profile submission.
use serde_json::{Map, Value, json};
use topcoat::{
    Result,
    context::Cx,
    router::{
        Body,
        content::Json,
        error::see_other,
        page,
        request::{Bytes, FromRequest, headers},
        route,
    },
    view::{View, view},
};

use crate::{auth, backend, dashboard_ui, welcome_ui};

const INVALID: &str = "Some answers look invalid. Please review them.";
const FAILED: &str = "Couldn't save your profile. Please try again.";

// Zod's object schemas strip unknown keys. Do not impose additional question IDs,
// array bounds, integer restrictions, nonempty answers or price formatting.
fn parse_submission(payload: Value) -> Option<Value> {
    let submission = payload.as_object()?.get("submission")?.as_array()?;
    let parsed = submission
        .iter()
        .map(|question| {
            let question = question.as_object()?;
            let id = question.get("questionId")?.as_number()?;
            // Zod numbers are finite JavaScript numbers, not bools or strings.
            if !id.as_f64()?.is_finite() {
                return None;
            }
            let key = question.get("queryKey")?.as_str()?;
            if !matches!(
                key,
                "cuisines" | "icd10cm" | "conditions" | "price" | "allergies" | "diets"
            ) {
                return None;
            }
            let answers = question
                .get("answers")?
                .as_array()?
                .iter()
                .map(|answer| {
                    let answer = answer.as_object()?;
                    let mut fields = Map::new();
                    for key in ["name", "value", "code"] {
                        if let Some(value) = answer.get(key) {
                            fields.insert(key.into(), json!(value.as_str()?));
                        }
                    }
                    Some(Value::Object(fields))
                })
                .collect::<Option<Vec<_>>>()?;
            Some(json!({"questionId":id,"queryKey":key,"answers":answers}))
        })
        .collect::<Option<Vec<_>>>()?;
    Some(json!({"submission":parsed}))
}

#[page("/welcome")]
async fn welcome(cx: &Cx) -> Result<impl View> {
    let Some(session) = auth::read_session(cx)
        .await?
        .filter(|session| session.auth.is_some())
    else {
        return Err(see_other("/login").into());
    };
    if session
        .welcome
        .as_ref()
        .and_then(|value| value.get("isComplete"))
        == Some(&Value::Bool(true))
    {
        return Err(see_other("/dashboard").into());
    }
    let username = session.auth.expect("authenticated session").username;
    Ok(view! { cx =>
        crate::auth_ui::document(title: "Your profile · Food4U",
            dashboard_ui::app_shell(username: username, profile_active: true,
                welcome_ui::stepper()
            )
        )
    })
}

fn redirect(cx: &Cx, path: &'static str) -> Result<Json<Value>> {
    // Same-origin client enhancement mirrors a server action without fetching
    // the dashboard twice. Ordinary HTTP clients retain the redirect contract.
    if headers(cx)
        .get("x-requested-with")
        .and_then(|value| value.to_str().ok())
        == Some("XMLHttpRequest")
    {
        Ok(Json(json!({"ok":path == "/dashboard","redirect":path})))
    } else {
        Err(see_other(path).into())
    }
}

#[route(POST "/welcome")]
async fn submit(cx: &Cx, body: Body) -> Result<Json<Value>> {
    // Authentication precedes parsing, as in the source server action.
    let Some(mut session) = auth::read_session(cx)
        .await?
        .filter(|session| session.auth.is_some())
    else {
        return redirect(cx, "/login");
    };
    let bytes = Bytes::from_request(cx, body).await?;
    let Some(payload) = serde_json::from_slice(&bytes)
        .ok()
        .and_then(parse_submission)
    else {
        return Ok(Json(json!({"ok":false,"message":INVALID})));
    };
    if backend::post(cx, "welcome", session.token.as_deref(), &payload)
        .await
        .is_err()
    {
        return Ok(Json(json!({"ok":false,"message":FAILED})));
    }
    session.welcome = Some(json!({"isComplete":true}));
    if !auth::update_authenticated_session(cx, &session).await? {
        return redirect(cx, "/login");
    }
    redirect(cx, "/dashboard")
}
