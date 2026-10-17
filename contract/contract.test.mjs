import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { runPagesAndApi } from './pages-api.mjs';

test('Food4U observable web contract', async t => {
  const harness = await createHarness();
  const { base, withContext, register, login, email, assertRedirect } = harness;
  try {
    await harness.verifyRedirectDenial(); // A failed prerequisite aborts the parent, not just a subtest.
    // This is deliberately the first check; interception exists before navigation.
    let safetyPassed = false;
    await t.test('SAFETY: local target and no browser requests to onrender.com', async () => {
      await withContext(async ({ page }) => {
        assert.equal((await page.goto(`${base}/login`, { waitUntil: 'networkidle' })).status(), 200);
      });
      safetyPassed = true;
    });
    assert.ok(safetyPassed, 'failed safety check stops all application tests');
    await t.test('login screen exposes named login/create-account tabs', () => withContext(async ({ page }) => {
      await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
      await page.getByRole('tablist', { name: 'Log in or create an account' }).waitFor();
      await page.getByRole('heading', { name: 'Welcome back', exact: true }).waitFor();
      await page.getByRole('tab', { name: 'Create account', exact: true }).click();
      await page.getByRole('heading', { name: 'Create your account', exact: true }).waitFor();
      await page.getByRole('tab', { name: 'Log in', exact: true }).click();
      await page.getByRole('heading', { name: 'Welcome back', exact: true }).waitFor();
    }));
    for (const mode of ['Log in', 'Create account']) {
      for (const [label, value, expected] of [
        ['Email', '', 'Enter a valid email address.'],
        ['Email', 'not-an-email', 'Enter a valid email address.'],
        ['Password', '', 'Use at least 6 characters.'],
        ['Password', '12345', 'Use at least 6 characters.'],
      ]) {
        await t.test(`${mode}: ${label} ${value ? 'invalid' : 'empty'} validation`, () => withContext(async ({ page }) => {
          await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
          await page.getByRole('tab', { name: mode, exact: true }).click();
          await page.getByLabel('Email', { exact: true }).fill(email());
          await page.getByLabel('Password', { exact: true }).fill('Contract-pass-004!');
          const field = page.getByLabel(label, { exact: true });
          await field.fill(value);
          await page.getByRole('button', { name: mode, exact: true }).click();
          await page.getByText(expected, { exact: true }).waitFor();
          assert.equal(await field.getAttribute('aria-invalid'), 'true');
          const described = (await field.getAttribute('aria-describedby')).split(/\s+/);
          const descriptions = await Promise.all(described.map(async id => {
            const description = page.locator(`[id="${id}"]`);
            return await description.count() ? await description.textContent() : '';
          }));
          assert.ok(descriptions.some(text => text === expected), 'visible validation must describe the input');
          assert.equal(new URL(page.url()).pathname, '/login');
        }));
      }
    }
    await t.test('registration succeeds and duplicate account is visible', () => withContext(async ({ page }) => {
      const account = email();
      await register(page, account);
      await page.getByRole('tab', { name: 'Create account', exact: true }).click();
      await page.getByLabel('Email', { exact: true }).fill(account);
      await page.getByLabel('Password', { exact: true }).fill('Contract-pass-004!');
      await page.getByRole('button', { name: 'Create account', exact: true }).click();
      await page.getByRole('alert').getByText('User already exists.', { exact: true }).waitFor();
    }));
    for (const [kind, expected] of [['unknown user', 'User does not exist.'], ['wrong password', 'Incorrect password.']]) {
      await t.test(`login: ${kind} error`, () => withContext(async ({ page }) => {
        const account = email();
        if (kind === 'wrong password') await register(page, account);
        await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
        await page.getByLabel('Email', { exact: true }).fill(account);
        await page.getByLabel('Password', { exact: true }).fill('Wrong-pass-004!');
        await page.getByRole('button', { name: 'Log in', exact: true }).click();
        await page.getByRole('alert').getByText(expected, { exact: true }).waitFor();
        assert.equal(new URL(page.url()).pathname, '/login');
        assertRedirect(await page.request.get(`${base}/dashboard`, { maxRedirects: 0 }), 307, '/login');
      }));
    }
    await t.test('login, cookie wire attributes, authenticated redirects, logout and replay rejection', () => withContext(async ({ context, page }) => {
      const headers = [];
      const pending = [];
      page.on('response', response => pending.push(response.headersArray().then(all => {
        for (const header of all) if (header.name.toLowerCase() === 'set-cookie' && header.value.startsWith('__session=')) headers.push(header.value);
      })));
      const account = email();
      await register(page, account);
      await login(page, account);
      assert.ok(['/dashboard', '/welcome'].includes(new URL(page.url()).pathname));
      await Promise.all(pending);
      const raw = headers.find(value => /Max-Age=2592000/i.test(value));
      assert.ok(raw, 'real UI response sets the session cookie with 30-day max age');
      for (const attribute of [/;\s*HttpOnly(?:;|$)/i, /;\s*Secure(?:;|$)/i, /;\s*SameSite=Lax(?:;|$)/i, /;\s*Path=\/(?:;|$)/i]) assert.match(raw, attribute);
      const cookie = (await context.cookies()).find(cookie => cookie.name === '__session');
      assert.ok(cookie);
      assert.match(cookie.value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[A-Za-z0-9_-]{43}$/i);
      assert.equal(cookie.httpOnly, true);
      assert.equal(cookie.secure, true);
      assert.equal(cookie.sameSite, 'Lax');
      assert.equal(cookie.path, '/');
      // APIRequestContext doesn't send Secure cookies over local plain HTTP.
      // Send the exact real UI cookie explicitly, only to this loopback target.
      const cookieHeaders = { cookie: `__session=${cookie.value}` };
      assertRedirect(await context.request.get(base, { maxRedirects: 0, headers: cookieHeaders }), 307, '/dashboard');
      assertRedirect(await context.request.get(`${base}/login`, { maxRedirects: 0, headers: cookieHeaders }), 307, '/dashboard');
      const logout = await context.request.post(`${base}/api/auth/logout`, { maxRedirects: 0, headers: cookieHeaders });
      assertRedirect(logout, 307, '/login');
      assert.equal((await context.cookies()).some(cookie => cookie.name === '__session'), false);
      const replay = await context.request.get(`${base}/dashboard`, { maxRedirects: 0, headers: { cookie: `__session=${cookie.value}` } });
      assertRedirect(replay, 307, '/login');
    }));
    await t.test('dashboard backend outage is an explicit alert, not a missing profile', async () => {
      const account = email();
      await withContext(async ({ page }) => register(page, account));
      await withContext(async ({ page }) => {
        await login(page, account);
        const alert = page.getByRole('alert');
        await alert.getByRole('heading', { name: "The food service isn't responding", exact: true }).waitFor();
        await alert.getByText('Your account is fine. The suggestion service may be waking up; this usually takes under a minute.', { exact: true }).waitFor();
        assert.equal(await alert.getByRole('link', { name: 'Try again', exact: true }).getAttribute('href'), '/dashboard');
      });
    });
    await t.test('welcome backend save failure is an explicit alert and preserves review', () => withContext(async ({ page }) => {
      const account = email();
      await register(page, account);
      await login(page, account);
      await page.goto(`${base}/welcome`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Tell us about you', exact: true }).waitFor();
      await page.getByRole('progressbar', { name: 'Onboarding progress' }).waitFor();
      await page.getByText('Step 1 of 5', { exact: true }).waitFor();
      for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByRole('button', { name: 'Review', exact: true }).click();
      await page.getByRole('heading', { name: "Here's what we'll check against", exact: true }).waitFor();
      await page.getByRole('button', { name: 'Save profile', exact: true }).click();
      await page.getByRole('alert').getByText("Couldn't save your profile. Please try again.", { exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/welcome');
    }));
    await runPagesAndApi(t, harness);
  } finally { await harness.close(); }
});
