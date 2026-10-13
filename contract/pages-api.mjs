import assert from 'node:assert/strict';

// Only public HTTP and accessible UI contracts; no framework transport details.
export async function runPagesAndApi(t, harness) {
  const { base, withContext, register, login, email, assertRedirect } = harness;
  const json = async (response, status, body) => {
    assert.equal(response.status(), status);
    assert.match(response.headers()['content-type'], /application\/json/);
    assert.deepEqual(await response.json(), body);
  };
  const authed = (callback) => withContext(async ({ context, page }) => {
    const account = email();
    await register(page, account);
    await login(page, account, 'Contract-pass-004!');
    const session = (await context.cookies()).find((cookie) => cookie.name === '__session');
    assert.ok(session, 'Real UI login must issue the session cookie');
    // APIRequestContext does not share Chromium's Secure-cookie exception for
    // HTTP loopback. Replay only the actual cookie issued by this test's UI login.
    await callback(context, page, { cookie: `__session=${session.value}` });
  });

  for (const path of ['/', '/dashboard', '/welcome']) {
    await t.test(`anonymous ${path} redirects to /login`, async () => {
      await withContext(async ({ context, page }) => {
        // Pin the public redirect status, independently of browser auto-following.
        await assertRedirect(await context.request.get(`${base}${path}`, { maxRedirects: 0 }), 307, '/login');
        await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
        await page.waitForURL((url) => url.pathname === '/login');
        await page.getByRole('tab', { name: 'Log in', exact: true }).waitFor();
      });
    });
  }

  await t.test('login exposes Log in and Create account tabs', async () => {
    await withContext(async ({ page }) => {
      const response = await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const tab = page.getByRole('tab', { name: 'Log in', exact: true });
      assert.equal(await tab.getAttribute('aria-selected'), 'true');
      await page.getByRole('heading', { name: 'Welcome back', exact: true }).waitFor();
      await page.getByRole('tab', { name: 'Create account', exact: true }).click();
      await page.getByRole('heading', { name: 'Create your account', exact: true }).waitFor();
    });
  });

  await t.test('privacy is public and describes health-data use', async () => {
    await withContext(async ({ page }) => {
      const response = await page.goto(`${base}/privacy`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      await page.getByRole('heading', { name: 'Privacy', exact: true }).waitFor();
      await page.getByRole('heading', { name: 'How we use your health data', exact: true }).waitFor();
      await page.getByText("Food4U stores your account, your answers to the profile questions and your session so it can check meals against them. We don't sell or share this information.", { exact: true }).waitFor();
      await page.getByText('Conditions, allergies and diets you enter are used only to filter and explain suggestions. You can change or remove them from your profile at any time.', { exact: true }).waitFor();
      assert.equal(await page.getByRole('link', { name: 'support@food4u.app' }).getAttribute('href'), 'mailto:support@food4u.app');
      assert.equal(await page.getByRole('link', { name: 'Back to the app' }).getAttribute('href'), '/dashboard');
    });
  });

  await t.test('authenticated root and login redirect to dashboard', async () => {
    await authed(async (context, _page, headers) => {
      for (const path of ['/', '/login']) {
        await assertRedirect(await context.request.get(`${base}${path}`, { headers, maxRedirects: 0 }), 307, '/dashboard');
      }
    });
  });

  await t.test('anonymous refs checks missing query/type before authentication', async () => {
    await withContext(async ({ context }) => {
      for (const suffix of ['', '?query=asthma', '?type=conditions', '?query=&type=conditions']) {
        await json(await context.request.get(`${base}/api/refs${suffix}`, { maxRedirects: 0 }), 200, { suggestions: [] });
      }
      await json(await context.request.get(`${base}/api/refs?query=asthma&type=conditions`, { maxRedirects: 0 }), 401, { suggestions: [], message: 'Please log in.' });
    });
  });

  await t.test('anonymous clinicals checks authentication before validation', async () => {
    await withContext(async ({ context }) => {
      for (const form of [{}, { action: 'search', key: 'conditions', query: 'asthma' }]) {
        await json(await context.request.post(`${base}/api/clinicals`, { form, maxRedirects: 0 }), 401, { message: 'Please log in.' });
      }
    });
  });

  await t.test('suggestion checks required parameters before authentication', async () => {
    await withContext(async ({ context }) => {
      for (const form of [{}, { action: 'meal' }, { queryKey: 'meal' }, { action: '', queryKey: 'meal' }]) {
        await json(await context.request.post(`${base}/api/suggestion`, { form, maxRedirects: 0 }), 400, { error: 'Missing required parameters: action or queryKey' });
      }
      await json(await context.request.post(`${base}/api/suggestion`, { form: { action: 'meal', queryKey: 'meal' }, maxRedirects: 0 }), 401, { error: 'Please log in.' });
    });
  });

  const clinicalCases = [
    ['missing action/key', {}, { errors: {
      action: ["Expected 'autocomplete' | 'search' | 'consider', received null"],
      key: ["Expected 'conditions' | 'icd10cm', received null"],
    } }],
    ['invalid action/key', { action: 'invalid', key: 'invalid' }, { errors: {
      action: ["Invalid enum value. Expected 'autocomplete' | 'search' | 'consider', received 'invalid'"],
      key: ["Invalid enum value. Expected 'conditions' | 'icd10cm', received 'invalid'"],
    } }],
    ['query over 100 characters', { action: 'search', key: 'conditions', query: 'a'.repeat(101) }, { errors: { query: ['Search query is too long'] } }],
    ...['search', 'autocomplete'].flatMap((action) => [
      [`${action} missing query`, { action, key: 'conditions' }, { message: 'Query is required for this action' }],
      [`${action} whitespace query`, { action, key: 'icd10cm', query: '   ' }, { message: 'Query is required for this action' }],
    ]),
    ...[{}, { code: 'A00' }, { description: 'Example' }].map((fields, index) => [
      `consider missing description/code ${index + 1}`, { action: 'consider', key: 'icd10cm', ...fields }, { message: 'Both description and medical code are required' },
    ]),
  ];
  for (const [label, form, body] of clinicalCases) {
    await t.test(`authenticated clinicals rejects ${label} without a backend`, async () => {
      await authed(async (context, _page, headers) => {
        await json(await context.request.post(`${base}/api/clinicals`, { form, headers, maxRedirects: 0 }), 400, body);
      });
    });
  }

  await t.test('authenticated suggestion rejects unknown action without a backend', async () => {
    await authed(async (context, _page, headers) => {
      await json(await context.request.post(`${base}/api/suggestion`, { form: { action: 'invalid', queryKey: 'meal' }, headers, maxRedirects: 0 }), 400, { message: 'Unknown action' });
    });
  });

  for (const name of [
    'dashboard displays backend profile and meal data',
    'welcome saves profile answers and completes onboarding',
    'refs returns backend-backed clinical and diet suggestions',
    'clinicals search/autocomplete returns backend suggestions',
    'clinicals consider persists a medical code',
    'suggestion returns generated meal/diet/recipe results',
  ]) {
    await t.test(name, { skip: 'Requires a separately authorized non-production backend and isolated profile data; this contract run deliberately uses an unreachable backend.' }, () => {});
  }
}
