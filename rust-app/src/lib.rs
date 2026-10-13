//! Isolated compatibility check, not the Food4U application replacement.

mod auth;
mod auth_probe;

use topcoat::{
    Result,
    asset::{AssetConfig, RouterBuilderAssetExt, asset},
    context::Cx,
    cookie::RouterBuilderCookieExt,
    router::{Router, RouterBuilderDiscoverExt, page},
    runtime::{RouterBuilderRuntimeExt, signal},
    view::{View, view},
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

#[page("/")]
async fn home(cx: &Cx) -> Result<impl View> {
    let count = signal(cx, || 0u32);

    Ok(view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>"Food4U compatibility spike"</title>
                <link rel="stylesheet" href=(asset!("../assets/spike.css"))>
                <link rel="icon" href="data:,">
                topcoat::runtime::script()
            </head>
            <body>
                <main>
                    <p class="eyebrow">"Rust · Topcoat · Local Workers"</p>
                    <h1>"Food4U compatibility spike"</h1>
                    <p>"An isolated framework check. No accounts, profiles, or production resources."</p>
                    <section aria-labelledby="counter-heading">
                        <h2 id="counter-heading">"Browser signal counter"</h2>
                        <p>"Count: " <output id="count" aria-live="polite">$(count.get())</output></p>
                        <button type="button" @click=$(|_event| count.increment())>"Increment"</button>
                    </section>
                </main>
            </body>
        </html>
    })
}
