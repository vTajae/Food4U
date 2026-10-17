//! Onboarding shell; page-local state and reference search are in welcome.js.
use topcoat::{
    Result,
    view::{View, component, view},
};

#[component]
pub(crate) async fn stepper() -> Result<impl View> {
    Ok(view! {
        <div id="welcome-stepper" class="welcome-stepper">
            <header class="welcome-header">
                <p id="welcome-step" class="welcome-step">"Step 1 of 5"</p>
                <div id="welcome-progress" role="progressbar" aria-label="Onboarding progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div></div></div>
                <h1 id="welcome-heading" tabindex="-1">"Tell us about you"</h1>
            </header>
            <div id="welcome-content"></div>
            <div class="welcome-actions">
                <button id="welcome-back" class="welcome-back" type="button" disabled="">"Back"</button>
                <button id="welcome-next" class="primary-button" type="button" aria-busy="false">"Continue"</button>
            </div>
            <div class="welcome-mobile-spacer" aria-hidden="true"></div>
            <noscript><p>"Enable JavaScript to complete your profile."</p></noscript>
        </div>
    })
}
