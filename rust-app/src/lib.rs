//! Food4U authentication, JSON APIs and signed-in Ask web layer.

mod api;
mod auth;
#[cfg(feature = "debug-fixtures")]
mod auth_probe;
mod auth_ui;
mod backend;
mod dashboard;
mod dashboard_ui;
mod pages;
mod welcome;
mod welcome_ui;

use topcoat::{
    asset::{AssetConfig, RouterBuilderAssetExt},
    cookie::RouterBuilderCookieExt,
    router::{Router, RouterBuilderDiscoverExt},
    runtime::RouterBuilderRuntimeExt,
};

topcoat_cloudflare::entrypoint!(router);

fn router(assets: AssetConfig) -> Router {
    Router::builder()
        .discover()
        .assets(assets)
        .runtime()
        .cookies()
        .build()
}
