//! Food4U auth web layer. Backend-backed screens are not migrated yet.

mod auth;
#[cfg(feature = "debug-fixtures")]
mod auth_probe;
mod auth_ui;
mod pages;

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
