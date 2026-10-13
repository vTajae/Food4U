//! Request-scoped HTTP client. Tokens are arguments, never shared worker state.
use std::{
    cell::Cell,
    fmt,
    future::{Future, poll_fn},
    pin::pin,
    task::Poll,
    time::Duration,
};

use serde::Serialize;
use serde_json::Value;
use topcoat::context::Cx;
use worker::send::SendFuture;
use worker::{AbortController, Fetch, Headers, Method, Request, RequestInit, RequestRedirect};

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum ApiErrorKind {
    Http,
    Timeout,
    Transport,
    InvalidJson,
    Configuration,
}

#[derive(Debug, Serialize)]
pub(crate) struct ApiError {
    pub kind: ApiErrorKind,
    pub status: Option<u16>,
    pub detail: Option<String>,
    #[serde(skip)]
    message: String,
}

impl ApiError {
    fn new(kind: ApiErrorKind, status: Option<u16>, message: impl Into<String>) -> Self {
        Self {
            kind,
            status,
            detail: None,
            message: message.into(),
        }
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.status {
            Some(status) => write!(f, "HTTP {status}: {}", self.message),
            None => f.write_str(&self.message),
        }
    }
}

impl std::error::Error for ApiError {}

type ApiResult = std::result::Result<Value, ApiError>;

pub(crate) async fn get(cx: &Cx, path: &str, token: Option<&str>) -> ApiResult {
    request(cx, "API_BASE_URL", path, Method::Get, token, None).await
}

pub(crate) async fn post(cx: &Cx, path: &str, token: Option<&str>, body: &Value) -> ApiResult {
    request(cx, "API_BASE_URL", path, Method::Post, token, Some(body)).await
}

pub(crate) async fn clinical_get(cx: &Cx, path: &str) -> ApiResult {
    request(
        cx,
        "CLINICAL_TABLES_BASE_URL",
        path,
        Method::Get,
        None,
        None,
    )
    .await
}

async fn request(
    cx: &Cx,
    base_name: &str,
    path: &str,
    method: Method,
    token: Option<&str>,
    body: Option<&Value>,
) -> ApiResult {
    let result = request_inner(cx, base_name, path, method, token, body).await;
    if let Err(error) = &result {
        // Log configuration and compatibility-swallowed failures too. Never log
        // a URL, bearer, body, upstream detail or health query.
        worker::console_error!(
            "Upstream request failed: kind={:?} status={:?}",
            error.kind,
            error.status
        );
    }
    result
}

async fn request_inner(
    cx: &Cx,
    base_name: &str,
    path: &str,
    method: Method,
    token: Option<&str>,
    body: Option<&Value>,
) -> ApiResult {
    let base = topcoat_cloudflare::env(cx)
        .var(base_name)
        .map_err(|_| {
            ApiError::new(
                ApiErrorKind::Configuration,
                None,
                format!("Missing {base_name}"),
            )
        })?
        .to_string();
    let parsed = worker::Url::parse(&base).map_err(|_| {
        ApiError::new(
            ApiErrorKind::Configuration,
            None,
            format!("Invalid {base_name}"),
        )
    })?;
    if !matches!(parsed.scheme(), "http" | "https")
        || parsed.host_str().is_none()
        || parsed.query().is_some()
        || parsed.fragment().is_some()
        || !parsed.username().is_empty()
        || parsed.password().is_some()
    {
        return Err(ApiError::new(
            ApiErrorKind::Configuration,
            None,
            format!("Invalid {base_name}"),
        ));
    }
    // Unlike URL::join with a leading slash, this preserves configured /backend prefixes.
    let url = format!(
        "{}/{}",
        base.trim_end_matches('/'),
        path.trim_start_matches('/')
    );
    SendFuture::new(async move {
        let headers = Headers::new();
        headers
            .set("Accept", "application/json")
            .map_err(transport)?;
        if let Some(token) = token {
            headers
                .set("Authorization", &format!("Bearer {token}"))
                .map_err(transport)?;
        }
        let mut init = RequestInit::new();
        init.with_method(method)
            .with_redirect(RequestRedirect::Manual);
        if let Some(body) = body {
            headers
                .set("Content-Type", "application/json")
                .map_err(transport)?;
            init.with_body(Some(body.to_string().into()));
        }
        init.with_headers(headers);
        let request = Request::new_with_init(&url, &init).map_err(transport)?;
        let controller = AbortController::default();
        let signal = controller.signal();
        let status = Cell::new(None);
        let operation = async {
            let mut response = Fetch::Request(request)
                .send_with_signal(&signal)
                .await
                .map_err(transport)?;
            let code = response.status_code();
            status.set(Some(code));
            // Read within the same deadline; a response can stall after headers arrive.
            let text = response.text().await.map_err(|error| {
                ApiError::new(ApiErrorKind::Transport, Some(code), error.to_string())
            })?;
            let json = serde_json::from_str::<Value>(&text);
            if !(200..300).contains(&code) {
                let detail = json
                    .as_ref()
                    .ok()
                    .and_then(|value| value.get("detail"))
                    .and_then(Value::as_str)
                    .map(str::to_owned);
                let message = detail
                    .clone()
                    .unwrap_or_else(|| format!("Backend returned HTTP {code}"));
                return Err(ApiError {
                    kind: ApiErrorKind::Http,
                    status: Some(code),
                    detail,
                    message,
                });
            }
            json.map_err(|_| {
                ApiError::new(
                    ApiErrorKind::InvalidJson,
                    Some(code),
                    "Backend returned invalid JSON",
                )
            })
        };
        let mut operation = pin!(operation);
        let mut timeout = pin!(topcoat_cloudflare::sleep(Duration::from_secs(20)));
        // Poll the deadline first so sustained response activity cannot extend the budget.
        let outcome = poll_fn(|cx| {
            if let Poll::Ready(timer) = timeout.as_mut().poll(cx) {
                return Poll::Ready(Err(match timer {
                    Ok(()) => ApiError::new(
                        ApiErrorKind::Timeout,
                        status.get(),
                        "Backend request timed out after 20 seconds",
                    ),
                    Err(error) => transport(error),
                }));
            }
            operation.as_mut().poll(cx)
        })
        .await;
        // Also abort on completion/error, releasing any unread response stream.
        controller.abort();
        outcome
    })
    .await
}

fn transport(error: worker::Error) -> ApiError {
    ApiError::new(ApiErrorKind::Transport, None, error.to_string())
}
