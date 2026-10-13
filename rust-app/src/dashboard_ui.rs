//! Signed-in Pantry Label shell and Ask screen; data stays request-scoped.
use topcoat::{
    Result,
    context::Cx,
    view::{Child, View, component, view},
};

#[component]
async fn icon(path: &'static str) -> Result<impl View> {
    Ok(
        view! { <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=(path)></path></svg> },
    )
}

#[component]
pub(crate) async fn app_shell(
    cx: &Cx,
    username: String,
    #[default] profile_active: bool,
    #[default] child: Child<'_>,
) -> Result<impl View> {
    let initial = username
        .trim()
        .chars()
        .next()
        .map(|c| c.to_uppercase().to_string())
        .unwrap_or_else(|| "?".into());
    Ok(view! { cx =>
        <div class="app-shell">
            <header class="app-header"><div class="shell-width header-inner">
                <a class="brand" href="/dashboard">
                    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path d="M4 11.5 13.2 4.9a3 3 0 0 1 3.5 0l9.9 7.1a3 3 0 0 1 1.2 2.4v9.6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-12.5Z" fill="var(--color-primary)"></path><circle cx="16" cy="12" r="2.2" fill="var(--color-on-primary)"></circle><path d="M9.5 19h13M9.5 22.5h8" stroke="var(--color-on-primary)" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.5 2.5"></path></svg><span>"Food4U"</span>
                </a>
                <nav class="desktop-nav" aria-label="Primary"><a href="/dashboard" aria-current=(if profile_active { None } else { Some("page") })>"Ask"</a><a href="/welcome" aria-current=(if profile_active { Some("page") } else { None })>"Profile"</a></nav>
                <div class="account">
                    <button id="account-trigger" class="secondary-button account-trigger" type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded="false" aria-controls="account-menu"><span aria-hidden="true">(initial)</span></button>
                    <div id="account-menu" role="menu" aria-label="Account menu" hidden="">
                        <div class="account-label">icon(path: "M20 21v-2a7 7 0 0 0-14 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8")<span>(username)</span></div>
                        <div role="separator"></div><p class="menu-heading">"Appearance"</p>
                        <button type="button" role="menuitemradio" tabindex="-1" aria-checked="true" data-theme-choice="system">icon(path: "M3 3h18v13H3zM8 21h8M12 16v5")"Match device"</button>
                        <button type="button" role="menuitemradio" tabindex="-1" aria-checked="false" data-theme-choice="light">icon(path: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1")"Light"</button>
                        <button type="button" role="menuitemradio" tabindex="-1" aria-checked="false" data-theme-choice="dark">icon(path: "M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z")"Dark"</button>
                        <div role="separator"></div><form action="/api/auth/logout" method="post"><button type="submit" role="menuitem" tabindex="-1" class="sign-out">icon(path: "M9 21H3V3h6M16 17l5-5-5-5M21 12H9")"Sign out"</button></form>
                    </div>
                </div>
            </div></header>
            <main class="shell-width app-main">(child)</main>
            <footer class="app-footer"><div class="shell-width footer-inner"><p>"Food4U suggests food, not treatment. Check diet changes with your care team, especially during a flare."</p><nav aria-label="Legal"><a href="/privacy">"Privacy"</a><a href="/privacy#health-data">"How we use your health data"</a><a href="mailto:support@food4u.app">"Support"</a></nav></div></footer>
            <nav class="mobile-nav" aria-label="Primary"><a href="/dashboard" aria-current=(if profile_active { None } else { Some("page") })>icon(path: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5ZM10 8a2 2 0 0 1 4 0c0 2-2 2-2 3m0 3h.01")"Ask"</a><a href="/welcome" aria-current=(if profile_active { Some("page") } else { None })>icon(path: "M20 21v-2a8 8 0 0 0-16 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8")"Profile"</a></nav>
        </div>
    })
}

#[component]
pub(crate) async fn backend_unavailable(detail: Option<String>) -> Result<impl View> {
    Ok(view! { <section class="backend-unavailable" role="alert">
        icon(path: "m2 2 20 20M8 8a7 7 0 0 1 12 5h1a4 4 0 0 1 1 7M6 6a7 7 0 0 0-1 7 4 4 0 0 0 0 8h12")
        <div><h1>"The food service isn't responding"</h1><p>"Your account is fine. The suggestion service may be waking up; this usually takes under a minute."</p>
        if let Some(detail) = detail { <p class="data-text">(detail)</p> }</div>
        <a href="/dashboard" class="secondary-button">"Try again"</a>
    </section> })
}

#[component]
pub(crate) async fn ask_screen(cx: &Cx, profile_chips: Vec<String>) -> Result<impl View> {
    Ok(
        view! { cx => <div class="ask-screen"><section class="ask-intro">
            <h1>"What should I eat?"</h1>
            <form id="ask-form" action="/api/suggestion" method="post"><div class="ask-input-wrap"><label class="sr-only" for="ask">"Ask about food"</label><textarea id="ask" name="query" rows="2" maxlength="120" placeholder="Talk to me about food…"></textarea><button class="primary-button" id="ask-submit" type="submit" aria-label="Ask" aria-busy="false">icon(path: "m5 12 7-7 7 7M12 19V5")</button></div><p id="ask-error" class="field-error" role="alert" hidden=""></p></form>
            <ul class="suggestion-chips" aria-label="Suggestions"><li><button type="button" data-suggestion="suggest">"Suggest a meal"</button></li><li><button type="button" data-suggestion="recipie">"Find a recipe"</button></li><li><button type="button" data-suggestion="diet">"Which diets fit me?"</button></li></ul>
            if !profile_chips.is_empty() { <p class="profile-chips" aria-label="Your profile"><span>"Your profile:"</span>for chip in profile_chips { <span class="constraint-chip">(chip)</span> }<a href="/welcome">"Edit"</a></p> }
        </section><section id="ask-results" aria-live="polite">
            <div class="empty-results"><svg aria-hidden="true" viewBox="0 0 96 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40c0 11 18 18 40 18s40-7 40-18H8ZM14 40c2-6 9-10 16-12M48 12c-6 0-10 4-10 9h20c0-5-4-9-10-9ZM30 30c6-4 12-6 18-6s12 2 18 6M62 24c3-4 7-6 12-6M56 8v4M48 4v6M40 8v4"></path></svg><div><p class="state-heading">"No suggestions yet"</p><p>"Ask a question above, or tap one of the suggestions to get started."</p></div></div>
        </section><div id="suggestion-error" class="toast" role="status" hidden=""></div></div> },
    )
}
