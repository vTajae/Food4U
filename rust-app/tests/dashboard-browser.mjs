// Native Windows Chrome; WSL runner owns the application and strict loopback mock.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../frontend/node_modules/playwright-core/index.mjs';
import { base, seedFixture, session, logout } from './auth-fixtures.mjs';
export { base };
export const root = fileURLToPath(new URL('../../', import.meta.url));
export const profile = { diets: [], attributes: ["Crohn's disease", 'No dairy', 'Low residue', 'Under $12'].map(attribute_name => ({ attribute_name, attribute_category: 'restriction' })) };
export const foods = [
  { fdcId: 701, description: 'Congee with poached chicken', brandOwner: 'Food4U Test Kitchen', additionalDescriptions: 'Soft, low-fibre rice porridge', ingredients: 'white rice, water, chicken breast, ginger (fresh), salt', foodNutrients: [{ nutrientName: 'Protein', value: 12.4, unitName: 'G' }, { nutrientName: 'Fiber, total dietary', value: 0.6, unitName: 'G' }, { nutrientName: 'Energy', value: 210, unitName: 'KCAL' }] },
  { fdcId: 702, description: 'Baked salmon with mashed potato', scientificName: 'Salmo salar', ingredients: 'salmon, potato', foodNutrients: [{ nutrientName: 'Protein', value: 20, unitName: 'G' }] },
];
export async function command(path, body) {
  const control = process.env.FOOD4U_MOCK_CONTROL_URL;
  assert.ok(control, 'Run through dashboard-mock.mjs');
  assert.equal(new URL(control).hostname, '127.0.0.1');
  const res = await fetch(new URL(path, control), { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json' } : {}, ...(body ? { body: JSON.stringify(body) } : {}) });
  assert.equal(res.status, 200, `mock control ${path}`); return res.json();
}
export const expectProfile = user => command('expect', { user: user.row.public_id, method: 'GET', path: '/backend/user/profile', response: profile });
export const expectMeal = (user, text, result = foods, delay = 0) => command('expect', { user: user.row.public_id, method: 'POST', path: '/backend/api/suggestion', body: { action: 'meal', queryKey: 'general', text }, response: { status: true, result }, delay });
const listen = server => new Promise((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
const close = server => new Promise(ok => { server.closeAllConnections(); server.close(ok); });
export async function launchProof(kind) {
  const report = { kind, status: 'starting', checks: [], pageErrors: [], consoleErrors: [], networkFailures: [], blockedRequests: [], expectedHttpErrors: [], onrender: 0 };
  const expectHttpError = (url, status) => report.expectedHttpErrors.push({ url, status, responses: 0, consoleMessages: [] });
  const check = (name, pass) => { report.checks.push({ name, pass: !!pass }); assert.ok(pass, name); };
  const deny = createServer((req, res) => { res.writeHead(403); res.end('External access denied'); });
  deny.on('connect', (_, socket) => socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'));
  await listen(deny);
  const proxy = { server: `http://127.0.0.1:${deny.address().port}`, bypass: '127.0.0.1,localhost' };
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, proxy });
  report.browser = await browser.version();
  // Canary proves redirects cannot escape the proxy, independently of route hooks.
  let hits = 0;
  const target = createServer((_, res) => { hits++; res.end('canary'); }); await listen(target);
  const source = createServer((req, res) => { if (req.url === '/redirect') res.writeHead(302, { location: `http://127.0.0.1:${target.address().port}/landed` }); res.end('<title>Safety canary</title>'); }); await listen(source);
  const canary = await browser.newContext({ proxy: { ...proxy, bypass: 'localhost' }, serviceWorkers: 'block' });
  try {
    await fetch(`http://127.0.0.1:${target.address().port}`); hits = 0;
    const page = await canary.newPage(); const origin = `http://localhost:${source.address().port}`;
    await page.goto(`${origin}/redirect`).catch(() => {}); check('redirect navigation denied', hits === 0);
    await page.goto(origin);
    const denied = await page.evaluate(async url => { try { await fetch(url); return false; } catch { return true; } }, `${origin}/redirect`);
    check('redirect fetch denied', denied && hits === 0);
  } finally { await canary.close(); await close(source); await close(target); }
  async function contextFor(options = {}) {
    const context = await browser.newContext({ colorScheme: 'light', serviceWorkers: 'block', proxy, ...options });
    context.on('request', request => { if (/(^|\.)onrender\.com$/.test(new URL(request.url()).hostname)) report.onrender++; });
    await context.route('**/*', async route => {
      const req = route.request();
      if (new URL(req.url()).origin === base) return route.continue();
      report.blockedRequests.push(req.url()); await route.abort('blockedbyclient');
    });
    context.on('page', page => {
      page.on('pageerror', error => report.pageErrors.push(String(error)));
      page.on('console', message => {
        if (message.type() !== 'error') return;
        const expected = report.expectedHttpErrors.find(e => e.url === message.location().url && message.text() === `Failed to load resource: the server responded with a status of ${e.status} (Unauthorized)`);
        if (expected) expected.consoleMessages.push(message.text());
        else report.consoleErrors.push(message.text());
      });
      page.on('requestfailed', req => report.networkFailures.push({ url: req.url(), error: req.failure()?.errorText }));
      page.on('response', res => {
        if (res.status() < 400) return;
        const expected = report.expectedHttpErrors.find(e => e.url === res.url() && e.status === res.status());
        if (expected) expected.responses++;
        else report.networkFailures.push({ url: res.url(), status: res.status() });
      });
    });
    return context;
  }
  async function finish(error) {
    try {
      if (error) throw error;
      assert.equal(report.onrender, 0); assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.consoleErrors, []); assert.deepEqual(report.networkFailures, []); assert.deepEqual(report.blockedRequests, []);
      for (const expected of report.expectedHttpErrors) { assert.equal(expected.responses, 1, 'Each expected HTTP error occurred exactly once'); assert.ok(expected.consoleMessages.length <= 1, 'No repeated expected-error console noise'); }
      const mock = await command('report'); assert.deepEqual(mock.pending, []); assert.deepEqual(mock.violations, []);
      report.status = 'PASS';
    } catch (failure) { report.status = 'FAIL'; report.error = String(failure.stack || failure); process.exitCode = 1; }
    finally {
      await browser.close(); await close(deny);
      await mkdir(resolve(root, 'rust-app/.evidence'), { recursive: true });
      await writeFile(resolve(root, `rust-app/.evidence/${process.env.FOOD4U_EVIDENCE_PREFIX || (kind.startsWith('welcome-') ? '008' : '007')}-${kind}.json`), JSON.stringify(report, null, 2));
      console.log(JSON.stringify(report, null, 2));
      console.log(`ONRENDER_REQUESTS_OBSERVED=${report.onrender}`);
    }
  }
  return { browser, contextFor, check, report, finish, expectHttpError };
}
export async function loginUI(page) {
  const user = await seedFixture();
  // Hold the genuine login response only long enough to register its actual token.
  // No synthetic authentication response, cookie, profile or suggestion is served by Playwright.
  await page.route(`${base}/api/login`, async route => {
    const response = await route.fetch();
    assert.equal(response.status(), 200);
    const cookie = response.headers()['set-cookie'].match(/__session=([^;]+)/)[1];
    const id = cookie.slice(0, cookie.lastIndexOf('.'));
    const data = await session(id);
    await command('token', { publicId: user.row.public_id, username: user.row.username, role: user.row.user_role, token: data.token });
    await expectProfile(user);
    await route.fulfill({ response });
  });
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill(user.row.username);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL(`${base}/dashboard`);
  await page.getByRole('heading', { name: 'What should I eat?', exact: true }).waitFor();
  await page.unroute(`${base}/api/login`);
  return user;
}
export async function ask(page, user, text, result = foods, delay = 0) {
  await expectMeal(user, text, result, delay);
  await page.getByLabel('Ask about food', { exact: true }).fill(text);
  await page.getByLabel('Ask about food', { exact: true }).press('Enter');
}
export async function theme(page, name) {
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitemradio', { name: new RegExp(name) }).click();
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const proof = await launchProof('dashboard-browser'); let failure;
  try {
    const context = await proof.contextFor({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage(); const user = await loginUI(page);
    for (const label of profile.attributes.map(a => a.attribute_name)) proof.check(`profile chip ${label}`, await page.getByText(label, { exact: true }).isVisible());
    const input = page.getByLabel('Ask about food', { exact: true });
    const suggestionRequests = [];
    page.on('request', request => { if (request.url() === `${base}/api/suggestion`) suggestionRequests.push(request.method()); });
    await input.fill(''); await input.press('Enter');
    await page.getByRole('alert').filter({ hasText: 'Type a question to get suggestions.' }).waitFor();
    proof.check('blank Enter focuses invalid field', await input.evaluate(el => el === document.activeElement && el.getAttribute('aria-invalid') === 'true'));
    proof.check('blank error described by visible alert', await input.evaluate(el => (el.getAttribute('aria-describedby') || '').split(/\s+/).some(id => { const alert = document.getElementById(id); return alert?.getAttribute('role') === 'alert' && alert.getClientRects().length > 0 && alert.textContent.includes('Type a question to get suggestions.'); })));
    await input.fill('x'.repeat(101)); await input.press('Enter');
    await page.getByText('Keep it under 100 characters.', { exact: true }).waitFor();
    proof.check('overlong query invalid', await input.getAttribute('aria-invalid') === 'true');
    await input.fill('Dinner');
    proof.check('editing clears validation and description', await input.evaluate(el => el.getAttribute('aria-invalid') !== 'true' && !el.hasAttribute('aria-describedby')));
    await input.press('Shift+Enter');
    proof.check('Shift+Enter adds newline', (await input.inputValue()).includes('\n'));
    proof.check('invalid queries and Shift+Enter make no suggestion request', suggestionRequests.length === 0);
    await ask(page, user, 'A gentle dinner', foods, 1500);
    await page.getByText('Finding meals that fit your plan…', { exact: true }).waitFor();
    proof.check('loading disables Ask', await page.getByRole('button', { name: 'Ask', exact: true }).isDisabled());
    await page.getByRole('heading', { name: foods[0].description, exact: true }).waitFor();
    await page.getByRole('button', { name: 'Ingredients', exact: true }).first().click();
    proof.check('ingredients disclosure expanded', await page.getByRole('button', { name: 'Hide ingredients', exact: true }).getAttribute('aria-expanded') === 'true');
    await page.getByRole('button', { name: 'Nutrients', exact: true }).first().click();
    proof.check('nutrient table present', await page.getByRole('columnheader', { name: 'Amount' }).isVisible());
    await ask(page, user, 'No local matches', []);
    await page.getByText('No matches for that', { exact: true }).waitFor();
    proof.check('successful empty meal displays no matches', await page.getByText('Try different words, or one of the suggestions above.', { exact: true }).isVisible());
    for (const [label, action, queryKey, text] of [
      ['Suggest a meal', 'suggest', 'randomMeal', "I'm hungry"],
      ['Find a recipe', 'recipie', 'newRecipie', "Let's cook something"],
      ['Which diets fit me?', 'diet', 'dietSuggest', 'What diets support my eating habits?'],
    ]) {
      const description = `Local ${action} result`;
      await command('expect', { user: user.row.public_id, method: 'POST', path: '/backend/api/suggestion', body: { action, queryKey, text }, response: { status: true, result: [{ description }] } });
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('heading', { name: description, exact: true }).waitFor();
      proof.check(`${label}: exact upstream action/queryKey/text and real rendered card`, true);
    }
    const malicious = '<img id="injected-food" src="x" onerror="globalThis.foodInjection=true">';
    await ask(page, user, 'Text safety fixture', [{ description: malicious }]);
    await page.getByRole('heading', { name: malicious, exact: true }).waitFor();
    proof.check('upstream markup renders only as literal text', await page.locator('#injected-food').count() === 0 && await page.evaluate(() => globalThis.foodInjection === undefined));
    await theme(page, 'Dark');
    proof.check('dark preference stored', await page.evaluate(() => localStorage.getItem('food4u-theme') === 'dark' && document.documentElement.dataset.theme === 'dark'));
    await expectProfile(user); await page.reload();
    proof.check('dark survives reload', await page.evaluate(() => document.documentElement.dataset.theme === 'dark'));
    await theme(page, 'Light'); proof.check('explicit light', await page.evaluate(() => document.documentElement.dataset.theme === 'light'));
    await theme(page, 'Match device');
    proof.check('system clears override and persistence', await page.evaluate(() => !document.documentElement.hasAttribute('data-theme') && localStorage.getItem('food4u-theme') === null));
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: 'dark' });
    proof.check('system tracks dark media', await page.evaluate(() => getComputedStyle(document.body).backgroundColor) !== light);
    const menu = page.getByRole('button', { name: 'Account menu' });
    await menu.focus(); await page.keyboard.press('Enter');
    await page.getByRole('menuitem', { name: 'Sign out' }).waitFor();
    await page.keyboard.press('Escape'); proof.check('Escape restores menu trigger focus', await menu.evaluate(el => el === document.activeElement));
    await page.keyboard.press('Enter'); await page.keyboard.press('End');
    proof.check('End focuses sign out', await page.getByRole('menuitem', { name: 'Sign out' }).evaluate(el => el === document.activeElement));
    await page.keyboard.press('Enter'); await page.waitForURL(`${base}/login`);
    proof.check('logout clears session cookie', !(await context.cookies()).some(c => c.name === '__session'));
    await page.goto(`${base}/dashboard`); proof.check('logout protects dashboard', new URL(page.url()).pathname === '/login');
    await context.close();
    // Delete the genuine session via the real logout endpoint without navigating the
    // already rendered dashboard: this exercises the actual API401/UI error branch.
    const expiredContext = await proof.contextFor();
    const expiredPage = await expiredContext.newPage(); const expiredUser = await loginUI(expiredPage);
    await ask(expiredPage, expiredUser, 'Keep this result', [foods[0]]);
    await expiredPage.getByRole('heading', { name: foods[0].description, exact: true }).waitFor();
    const cookie = (await expiredContext.cookies()).find(c => c.name === '__session');
    assert.ok(cookie);
    const expiredLogout = await logout(cookie.value);
    assert.ok([302, 303].includes(expiredLogout.status), 'Real logout invalidates session');
    proof.expectHttpError(`${base}/api/suggestion`, 401);
    const unauthorized = expiredPage.waitForResponse(res => res.url() === `${base}/api/suggestion` && res.status() === 401);
    await expiredPage.getByLabel('Ask about food').fill('Expired local session');
    await expiredPage.getByLabel('Ask about food').press('Enter');
    await unauthorized;
    await expiredPage.getByRole('status').filter({ hasText: 'Please log in.' }).waitFor();
    proof.check('real401 error retains previous recommendation', await expiredPage.getByRole('heading', { name: foods[0].description, exact: true }).isVisible());
    proof.check('real401 restores enabled Ask', await expiredPage.getByRole('button', { name: 'Ask', exact: true }).isEnabled());
    await expiredContext.close();
  } catch (error) { failure = error; }
  await proof.finish(failure);
}
