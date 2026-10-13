//! Pantry Label authentication UI, preserving the public form contract.
use topcoat::{
    Result,
    asset::{asset, asset_config},
    context::Cx,
    router::{error::see_other, page},
    view::{Child, View, component, view},
};

#[component]
pub(crate) async fn document(
    cx: &Cx,
    title: &'static str,
    #[default] child: Child<'_>,
) -> Result<impl View> {
    Ok(view! {
        <!DOCTYPE html><html lang="en"><head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
            <title>(title)</title>
            <link rel="icon" href="data:,">
            <style>
                "@font-face{font-family:'Young Serif';font-style:normal;font-weight:400;font-display:swap;src:url("
                (asset_config(cx).resolve(asset!("../assets/fonts/young-serif-latin.woff2")))
                ") format('woff2')}@font-face{font-family:'Atkinson Hyperlegible Next';font-style:normal;font-weight:200 800;font-display:swap;src:url("
                (asset_config(cx).resolve(asset!("../assets/fonts/atkinson-hyperlegible-next-latin.woff2")))
                ") format('woff2')}"
            </style>
            <link rel="stylesheet" href=(asset!("../assets/auth.css"))>
            <link rel="stylesheet" href=(asset!("../assets/dashboard.css"))>
            <link rel="stylesheet" href=(asset!("../assets/welcome.css"))>
            <script src=(asset!("../assets/dashboard.js"))></script>
            <script src=(asset!("../assets/welcome.js")) defer=""></script>
            topcoat::runtime::script()
            <script src=(asset!("../assets/auth.js")) defer=""></script>
        </head><body>(child)</body></html>
    })
}

#[component]
pub(crate) async fn brand() -> Result<impl View> {
    Ok(view! {
        <a class="brand" href="/">
            <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
                <path d="M4 11.5 13.2 4.9a3 3 0 0 1 3.5 0l9.9 7.1a3 3 0 0 1 1.2 2.4v9.6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-12.5Z" fill="var(--color-primary)"></path>
                <circle cx="16" cy="12" r="2.2" fill="var(--color-on-primary)"></circle>
                <path d="M9.5 19h13M9.5 22.5h8" stroke="var(--color-on-primary)" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.5 2.5"></path>
            </svg><span>"Food4U"</span>
        </a>
    })
}

#[component]
async fn check(label: &'static str) -> Result<impl View> {
    Ok(view! {
        <li><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>
        </svg>(label)</li>
    })
}

#[component]
async fn alert_icon() -> Result<impl View> {
    Ok(view! {
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle><path d="M12 8v4m0 4h.01"></path>
        </svg>
    })
}

#[page("/login")]
async fn login_page(cx: &Cx) -> Result<impl View> {
    if crate::auth::is_authenticated(cx).await? {
        return Err(see_other("/dashboard").into());
    }
    Ok(view! {
        document(title: "Log in · Food4U",
            <main class="auth-layout">
                <section class="auth-promise">
                    brand()
                    <div class="promise-copy">
                        <h1>"Know what you can eat tonight."</h1>
                        <p>"Ask in plain words. Every suggestion is checked against the things that matter for you, and you can see exactly what was checked."</p>
                        <ul aria-label="What Food4U checks against">
                            check(label: "Your conditions")
                            check(label: "Allergies and intolerances")
                            check(label: "Diet and budget")
                        </ul>
                    </div>
                    <p class="auth-disclaimer">"Food4U suggests food, not treatment."</p>
                </section>
                <section class="auth-form-pane"><div class="auth-tabs">
                    <div role="tablist" aria-label="Log in or create an account" aria-orientation="horizontal">
                        <button id="login-tab" type="button" role="tab" aria-selected="true" aria-controls="auth-panel" tabindex="0" data-mode="login">"Log in"</button>
                        <button id="register-tab" type="button" role="tab" aria-selected="false" aria-controls="auth-panel" tabindex="-1" data-mode="register">"Create account"</button>
                    </div>
                    <div id="auth-panel" role="tabpanel" aria-labelledby="login-tab" tabindex="0">
                        <h2 id="auth-heading">"Welcome back"</h2>
                        <form id="auth-form" method="post" action="/login" novalidate="">
                            <noscript><p>"Enable JavaScript to log in or create an account."</p></noscript>
                            <div class="form-field">
                                <label for="username">"Email"</label>
                                <input id="username" name="username" type="email" inputmode="email" autocomplete="username" placeholder="you@example.com" aria-invalid="false">
                                <p id="username-error" class="field-error" hidden="">alert_icon()<span>"Enter a valid email address."</span></p>
                            </div>
                            <div class="form-field">
                                <label for="password">"Password"</label>
                                <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Your password" aria-invalid="false">
                                <p id="password-error" class="field-error" hidden="">alert_icon()<span>"Use at least 6 characters."</span></p>
                            </div>
                            <p id="auth-error" class="field-error" role="alert" hidden="">alert_icon()<span></span></p>
                            <button id="auth-submit" class="primary-button" type="submit" aria-busy="false" disabled="">"Log in"</button>
                        </form>
                    </div>
                </div></section>
            </main>
            <div id="auth-status" class="toast" role="status" hidden=""></div>
        )
    })
}
