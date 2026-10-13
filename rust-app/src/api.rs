//! Public JSON endpoints, preserving the frontend route contract.

use std::collections::{HashMap, HashSet};

use serde_json::{Map, Value, json};
use topcoat::{
    Result,
    context::Cx,
    router::{
        Body, StatusCode,
        content::Json,
        request::{Bytes, FromRequest, content_type, uri},
        route,
    },
};

use crate::{auth, backend};

type Reply = (StatusCode, Json<Value>);

fn reply(status: StatusCode, body: Value) -> Reply {
    (status, Json(body))
}

#[derive(Debug)]
enum Field {
    Text(String),
    File,
}

type Fields = HashMap<String, Field>;

// Read only inside the handler: clinical authentication must precede parsing.
async fn form(cx: &Cx, body: Body) -> Result<Fields> {
    let bytes = Bytes::from_request(cx, body).await?;
    let content_type = content_type(cx).unwrap_or_default().to_owned();
    // Use the Workers platform form parser, not a hand-written multipart parser.
    // This synthetic Request is never fetched; its URL only satisfies construction.
    worker::send::SendFuture::new(async move {
        let headers = worker::Headers::new();
        headers.set("Content-Type", &content_type)?;
        let mut init = worker::RequestInit::new();
        init.with_method(worker::Method::Post)
            .with_headers(headers)
            .with_body(Some(js_sys::Uint8Array::from(bytes.as_ref()).into()));
        let mut request = worker::Request::new_with_init("https://form.invalid/", &init)?;
        let data = request.form_data().await?;
        let mut fields = Fields::new();
        for name in [
            "query",
            "code",
            "description",
            "action",
            "key",
            "queryKey",
            "text",
        ] {
            if let Some(value) = data.get(name) {
                fields.insert(
                    name.to_owned(),
                    match value {
                        worker::FormEntry::Field(value) => Field::Text(value),
                        worker::FormEntry::File(_) => Field::File,
                    },
                );
            }
        }
        Ok(fields)
    })
    .await
}
fn text<'a>(fields: &'a Fields, key: &str) -> Option<&'a str> {
    match fields.get(key) {
        Some(Field::Text(value)) => Some(value),
        _ => None,
    }
}

fn truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(value) => *value,
        Value::Number(value) => value.as_f64() != Some(0.0),
        Value::String(value) => !value.is_empty(),
        _ => true,
    }
}

async fn autocomplete(cx: &Cx, query: &str, max: usize, route: &str) -> Result<Vec<Value>> {
    let mut params = vec![("terms", query.to_owned()), ("maxList", max.to_string())];
    if route == "conditions" {
        params.push(("ef", "icd10cm".to_owned()));
    } else {
        params.push(("sf", "name".to_owned()));
    }
    let path = format!("{route}/v3/search?{}", serde_urlencoded::to_string(params)?);
    let data = backend::clinical_get(cx, &path).await?;
    let mut results = Vec::new();
    if route == "conditions" {
        let Some(entries) = data
            .get(2)
            .and_then(|value| value.get("icd10cm"))
            .and_then(Value::as_array)
        else {
            return Ok(results);
        };
        let mut seen = HashSet::new();
        for entry in entries {
            let first = entry
                .get(0)
                .ok_or_else(|| topcoat::Error::msg("Invalid clinical condition"))?;
            let code = first
                .get("code")
                .and_then(Value::as_str)
                .ok_or_else(|| topcoat::Error::msg("Invalid clinical code"))?;
            if seen.insert(code.to_owned()) {
                let mut result = Map::new();
                result.insert("code".into(), json!(code));
                if let Some(name) = first.get("name") {
                    result.insert("name".into(), name.clone());
                }
                results.push(Value::Object(result));
            }
        }
    } else if let Some(entries) = data.get(3).and_then(Value::as_array) {
        for entry in entries {
            let mut result = Map::new();
            if let Some(code) = entry.get(0) {
                result.insert("code".into(), code.clone());
            }
            if let Some(name) = entry.get(1) {
                result.insert("name".into(), name.clone());
            }
            results.push(Value::Object(result));
        }
    }
    Ok(results)
}

#[route(GET "/api/refs")]
async fn refs(cx: &Cx) -> Result<Reply> {
    // URLSearchParams.get returns the first duplicate key, not the last.
    let pairs: Vec<(String, String)> =
        serde_urlencoded::from_str(uri(cx).query().unwrap_or_default())?;
    let get = |key: &str| {
        pairs
            .iter()
            .find(|(name, _)| name == key)
            .map(|(_, value)| value.as_str())
            .unwrap_or_default()
    };
    let (query, kind) = (get("query"), get("type"));
    if query.is_empty() || kind.is_empty() {
        return Ok(reply(StatusCode::OK, json!({"suggestions":[]})));
    }
    let Some(session) = auth::api_session(cx).await? else {
        return Ok(reply(
            StatusCode::UNAUTHORIZED,
            json!({"suggestions":[],"message":"Please log in."}),
        ));
    };
    if matches!(kind, "conditions" | "icd10cm") {
        return Ok(match autocomplete(cx, query, 10, "conditions").await {
            Ok(suggestions) => reply(StatusCode::OK, json!({"suggestions":suggestions})),
            Err(_) => reply(
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"suggestions":[],"error":"Error fetching medical codes"}),
            ),
        });
    }
    // Like RefService, fetch diets for every non-clinical type and swallow errors.
    let diets = backend::get(cx, "refs?queryKey=diets", session.token.as_deref())
        .await
        .ok();
    let bundled: Value =
        serde_json::from_str(include_str!("../../frontend/lib/refs/allergies.json"))?;
    let suggestions: Vec<Value> = if kind == "diets" {
        diets
            .as_ref()
            .and_then(Value::as_array)
            .map(|items| {
                items
                    .iter()
                    .map(|item| {
                        let mut mapped = Map::new();
                        if let Some(name) = item.get("diet_name") {
                            mapped.insert("name".into(), name.clone());
                        }
                        if let Some(description) = item.get("description") {
                            mapped.insert("description".into(), description.clone());
                        }
                        Value::Object(mapped)
                    })
                    .collect()
            })
            .unwrap_or_default()
    } else {
        bundled
            .get("autocomplete")
            .and_then(|data| data.get(kind))
            .and_then(Value::as_array)
            .map(|items| {
                items
                    .iter()
                    .map(|item| {
                        if item.is_string() {
                            json!({"name":item})
                        } else if let Some(name) = item.get("name") {
                            json!({"name":name})
                        } else {
                            json!({})
                        }
                    })
                    .collect()
            })
            .unwrap_or_default()
    };
    let query = query.to_lowercase();
    let suggestions: Vec<Value> = suggestions
        .into_iter()
        .filter(|value| {
            value
                .get("name")
                .and_then(Value::as_str)
                .is_some_and(|name| !name.is_empty() && name.to_lowercase().contains(&query))
        })
        .collect();
    Ok(reply(StatusCode::OK, json!({"suggestions":suggestions})))
}

fn enum_error(field: Option<&Field>, options: &[&str]) -> Option<String> {
    let expected = options
        .iter()
        .map(|value| format!("'{value}'"))
        .collect::<Vec<_>>()
        .join(" | ");
    match field {
        None => Some(format!("Expected {expected}, received null")),
        Some(Field::File) => Some(format!("Expected {expected}, received object")),
        Some(Field::Text(value)) if !options.contains(&value.as_str()) => Some(format!(
            "Invalid enum value. Expected {expected}, received '{value}'"
        )),
        _ => None,
    }
}

async fn clinicals_inner(cx: &Cx, body: Body) -> Result<Reply> {
    let Some(session) = auth::api_session(cx).await? else {
        return Ok(reply(
            StatusCode::UNAUTHORIZED,
            json!({"message":"Please log in."}),
        ));
    };
    let fields = form(cx, body).await?;
    if matches!(fields.get("query"), Some(Field::File)) {
        // The frontend calls .trim() before Zod and a File has no trim method.
        return Err(topcoat::Error::msg("Query is not text"));
    }
    let query = text(&fields, "query")
        .map(auth::js_trim)
        .unwrap_or_default();
    let mut errors = Map::new();
    if query.encode_utf16().count() > 100 {
        errors.insert("query".into(), json!(["Search query is too long"]));
    }
    for key in ["code", "description"] {
        if matches!(fields.get(key), Some(Field::File)) {
            errors.insert(key.into(), json!(["Expected string, received object"]));
        }
    }
    for (key, options) in [
        ("action", &["autocomplete", "search", "consider"][..]),
        ("key", &["conditions", "icd10cm"][..]),
    ] {
        if let Some(error) = enum_error(fields.get(key), options) {
            errors.insert(key.into(), json!([error]));
        }
    }
    if !errors.is_empty() {
        return Ok(reply(StatusCode::BAD_REQUEST, json!({"errors":errors})));
    }
    match text(&fields, "action").unwrap_or_default() {
        "autocomplete" | "search" => {
            if query.is_empty() {
                return Ok(reply(
                    StatusCode::BAD_REQUEST,
                    json!({"message":"Query is required for this action"}),
                ));
            }
            Ok(
                match autocomplete(cx, query, 5, text(&fields, "key").unwrap_or_default()).await {
                    Ok(suggestions) if suggestions.is_empty() => reply(
                        StatusCode::OK,
                        json!({"message":"No suggestions found","suggestions":[]}),
                    ),
                    Ok(suggestions) => reply(StatusCode::OK, json!({"suggestions":suggestions})),
                    Err(_) => reply(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        json!({"message":"An error occurred while fetching suggestions."}),
                    ),
                },
            )
        }
        "consider" => {
            let code = text(&fields, "code").unwrap_or_default();
            let description = text(&fields, "description").unwrap_or_default();
            if code.is_empty() || description.is_empty() {
                return Ok(reply(
                    StatusCode::BAD_REQUEST,
                    json!({"message":"Both description and medical code are required"}),
                ));
            }
            Ok(
                match backend::post(
                    cx,
                    "user/medical",
                    session.token.as_deref(),
                    &json!({"icd10cm":code,"description":description}),
                )
                .await
                {
                    Ok(value) if !truthy(&value) => reply(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        json!({"message":"An error occurred while posting the medical code."}),
                    ),
                    Ok(_) => reply(
                        StatusCode::OK,
                        json!({"message":format!("Medical code {code} has been successfully submitted."),"isLoading":false}),
                    ),
                    Err(_) => reply(
                        StatusCode::INTERNAL_SERVER_ERROR,
                        json!({"message":"An error occurred while submitting the medical code."}),
                    ),
                },
            )
        }
        _ => Ok(reply(
            StatusCode::BAD_REQUEST,
            json!({"message":"Unknown action"}),
        )),
    }
}

#[route(POST "/api/clinicals")]
async fn clinicals(cx: &Cx, body: Body) -> Result<Reply> {
    Ok(clinicals_inner(cx, body).await.unwrap_or_else(|_| {
        reply(
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"error":"An unexpected error occurred."}),
        )
    }))
}

// JavaScript type assertions don't convert File objects: JSON.stringify(File) is {}.
fn suggestion_value(fields: &Fields, key: &str) -> Option<Value> {
    fields.get(key).map(|value| match value {
        Field::Text(value) => json!(value),
        Field::File => json!({}),
    })
}

async fn suggestion_inner(cx: &Cx, body: Body) -> Result<Reply> {
    let fields = form(cx, body).await?;
    let action = suggestion_value(&fields, "action").unwrap_or(Value::Null);
    let query_key = suggestion_value(&fields, "queryKey").unwrap_or(Value::Null);
    if !truthy(&action) || !truthy(&query_key) {
        return Ok(reply(
            StatusCode::BAD_REQUEST,
            json!({"error":"Missing required parameters: action or queryKey"}),
        ));
    }
    let Some(session) = auth::api_session(cx).await? else {
        return Ok(reply(
            StatusCode::UNAUTHORIZED,
            json!({"error":"Please log in."}),
        ));
    };
    if !matches!(
        action.as_str(),
        Some("meal" | "suggest" | "diets" | "diet" | "recipie")
    ) {
        return Ok(reply(
            StatusCode::BAD_REQUEST,
            json!({"message":"Unknown action"}),
        ));
    }
    let text = suggestion_value(&fields, "query")
        .or_else(|| suggestion_value(&fields, "text"))
        .unwrap_or(json!(""));
    let response = backend::post(
        cx,
        "api/suggestion",
        session.token.as_deref(),
        &json!({"queryKey":query_key,"text":text,"action":action}),
    )
    .await
    .ok();
    let mut body = json!({"message":"Suggestion fetched"});
    if let Some(response) = response
        .filter(truthy)
        .filter(|value| value.get("status") != Some(&Value::Bool(false)))
        && let Some(result) = response.get("result")
    {
        body["meal"] = result.clone();
    }
    Ok(reply(StatusCode::OK, body))
}

#[route(POST "/api/suggestion")]
async fn suggestion(cx: &Cx, body: Body) -> Result<Reply> {
    Ok(suggestion_inner(cx, body).await.unwrap_or_else(|_| {
        reply(
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"error":"An error occurred while processing your request"}),
        )
    }))
}
