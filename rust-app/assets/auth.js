// Plain DOM enhancement of Rust SSR; server procedures enforce the same validation.
try {
  const theme = localStorage.getItem('food4u-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch { /* Storage is optional. */ }

const form = document.getElementById('auth-form');
if (form) {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const submit = document.getElementById('auth-submit');
  const alert = document.getElementById('auth-error');
  const status = document.getElementById('auth-status');
  // Exact Zod v3 email rule: validate raw values before the schema's trim transform.
  const emailPattern = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
  let mode = 'login';
  let submitted = false;
  let pending = false;
  let toastTimer;

  function validateField(field) {
    const invalid = field === username ? !emailPattern.test(field.value) : field.value.length < 6;
    field.setAttribute('aria-invalid', String(invalid));
    const error = document.getElementById(`${field.id}-error`);
    error.hidden = !invalid;
    field.previousElementSibling.dataset.error = String(invalid);
    if (invalid) field.setAttribute('aria-describedby', error.id);
    else field.removeAttribute('aria-describedby');
    return !invalid;
  }

  function selectTab(next, focus = false) {
    if (pending || next === mode) return;
    mode = next;
    submitted = false;
    form.reset();
    alert.hidden = true;
    for (const field of [username, password]) {
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
      field.previousElementSibling.dataset.error = 'false';
      document.getElementById(`${field.id}-error`).hidden = true;
    }
    for (const tab of tabs) {
      const selected = tab.dataset.mode === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    document.getElementById('auth-panel').setAttribute('aria-labelledby', `${mode}-tab`);
    document.getElementById('auth-heading').textContent = mode === 'login' ? 'Welcome back' : 'Create your account';
    password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    password.placeholder = mode === 'login' ? 'Your password' : 'At least 6 characters';
    submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => selectTab(tab.dataset.mode));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = mode === 'login' ? 'register' : 'login';
      if (event.key === 'Home') next = 'login';
      if (event.key === 'End') next = 'register';
      if (next) {
        event.preventDefault();
        if (next === mode) tab.focus();
        else selectTab(next, true);
      }
    });
  }
  for (const field of [username, password]) field.addEventListener('input', () => {
    if (submitted) validateField(field);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    submitted = true;
    const emailValid = validateField(username);
    const passwordValid = validateField(password);
    if (!emailValid || !passwordValid) {
      (!emailValid ? username : password).focus();
      return;
    }
    pending = true;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    submit.textContent = mode === 'login' ? 'Logging in…' : 'Creating account…';
    alert.hidden = true;
    try {
      const response = await fetch(`/api/${mode}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        // Preserve raw inputs so the server can apply checks before trim too.
        body: JSON.stringify([username.value, password.value]),
      });
      if (!response.ok) throw new Error('Unable to complete the request. Please try again.');
      const message = await response.json();
      if (typeof message !== 'string') throw new Error('Unable to complete the request. Please try again.');
      if (message) throw new Error(message);
      if (mode === 'login') {
        window.location.assign('/dashboard');
      } else {
        pending = false;
        selectTab('login');
        status.textContent = 'Account created. Log in to continue.';
        status.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { status.hidden = true; }, 5000);
      }
    } catch (error) {
      alert.querySelector('span').textContent = error.message;
      alert.hidden = false;
    } finally {
      pending = false;
      submit.disabled = false;
      submit.setAttribute('aria-busy', 'false');
      submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
    }
  });
  // The SSR button stays disabled if enhancement fails; credentials never use GET.
  submit.disabled = false;
}
