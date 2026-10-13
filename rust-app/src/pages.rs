use topcoat::{
    Result,
    context::Cx,
    router::{
        error::{SeeOther, see_other},
        page, route,
    },
    view::{View, view},
};

#[route(GET "/")]
async fn home(cx: &Cx) -> Result<SeeOther> {
    Ok(see_other(if crate::auth::is_authenticated(cx).await? {
        "/dashboard"
    } else {
        "/login"
    }))
}

#[page("/privacy")]
async fn privacy() -> Result<impl View> {
    Ok(view! {
        crate::auth_ui::document(title: "Privacy · Food4U",
            <main class="page-content">
                crate::auth_ui::brand()
                <h1>"Privacy"</h1>
                <p>"Food4U stores your account, your answers to the profile questions and your session so it can check meals against them. We don't sell or share this information."</p>
                <h2 id="health-data">"How we use your health data"</h2>
                <p>"Conditions, allergies and diets you enter are used only to filter and explain suggestions. You can change or remove them from your profile at any time."</p>
                <p>"Full policy pending. Questions: "<a href="mailto:support@food4u.app">"support@food4u.app"</a>"."</p>
                <a href="/dashboard">"Back to the app"</a>
            </main>
        )
    })
}
