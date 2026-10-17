// Live acceptance client. No deployment, profile deletion, or secret output.
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const diets = ['Gluten Free', 'Ketogenic', 'Vegetarian', 'Lacto-Vegetarian', 'Ovo-Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Primal', 'Low FODMAP', 'Whole30'];
const result = {
  result: 'FAIL', username: null, public_id: null, screenshots: [],
  steps: Object.fromEntries(['arguments', 'backend', 'browser', 'register', 'login', 'welcome', 'dashboard', 'logout', 'fresh_login'].map(name => [name, { result: 'SKIP' }])),
  observed_5xx: [],
};
let browser, proxyServer, page, current = 'arguments', exitCode = 1, settings;
class AcceptanceError extends Error {}
function check(value, message) { if (!value) throw new AcceptanceError(message); }
function diagnostic(error) {
  // Only messages authored in this file are safe. Playwright call logs can contain inputs.
  if (error instanceof AcceptanceError) return { reason: error.message, category: 'assertion' };
  if (error?.name === 'TimeoutError') return { reason: 'timed out waiting for the expected UI or navigation', category: 'timeout' };
  if (error?.code === 'ERR_MODULE_NOT_FOUND') return { reason: 'local Playwright module is unavailable', category: 'dependency' };
  return { reason: current === 'browser' ? 'Chrome launch or browser setup failed' : 'operation failed; inspect the step and screenshots', category: current === 'browser' ? 'browser_setup' : 'operation' };
}
function base(value) {
  check(typeof value === 'string' && /^https?:\/\//i.test(value), 'absolute HTTP(S) URLs required');
  let url;
  try { url = new URL(value); } catch { throw new AcceptanceError('absolute HTTP(S) URLs required'); }
  check(['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password && !url.search && !url.hash, 'URLs must not contain credentials, query, or fragment');
  return url.href.replace(/\/+$/, '');
}
function options(args) {
  const values = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    check(['--frontend', '--backend', '--evidence', '--backend-timeout', '--headed'].includes(key) && !(key in values), 'unknown or duplicate argument');
    if (key === '--headed') values[key] = true;
    else { check(args[i + 1] && !args[i + 1].startsWith('--'), 'argument value required'); values[key] = args[++i]; }
  }
  const timeout = Number(values['--backend-timeout'] ?? 180);
  check(Number.isFinite(timeout) && timeout > 0 && timeout <= 3600, 'backend timeout must be seconds in (0, 3600]');
  return { frontend: base(values['--frontend'] ?? 'https://food4u-frontend.qias-webdev.workers.dev'), backend: base(values['--backend'] ?? 'https://food4u-qxcn.onrender.com'), evidence: resolve(values['--evidence'] ?? 'live-check-evidence'), timeout, headed: !!values['--headed'] };
}
function no5xx() { check(result.observed_5xx.length === 0, 'observed app/backend HTTP 5xx'); }
async function step(name, action) {
  current = name;
  result.steps[name] = { result: 'RUNNING' };
  const details = await action();
  no5xx();
  result.steps[name] = { result: 'PASS', ...details };
}
async function backendGate() {
  const deadline = Date.now() + settings.timeout * 1000;
  let attempts = 0, last = 'unreachable', missing = diets;
  while (Date.now() < deadline) {
    attempts++;
    try {
      const response = await fetch(`${settings.backend}/refs?queryKey=diets`, {
        redirect: 'manual', signal: AbortSignal.timeout(Math.max(1, Math.min(15000, deadline - Date.now()))),
      });
      last = `HTTP ${response.status}`;
      if (response.status >= 500) {
        result.observed_5xx.push({ source: 'backend_gate', status: response.status });
        break; // Any observed 5xx is a failure, not a silently healed retry.
      }
      if (response.ok) {
        const data = await response.json();
        const names = new Set(Array.isArray(data) ? data.map(row => row?.diet_name) : []);
        missing = diets.filter(name => !names.has(name));
        if (!missing.length) return { attempts, standard_diets_present: 11 };
        last = 'standard diet names missing';
      }
    } catch { last = 'unreachable or invalid JSON'; }
    const remaining = deadline - Date.now();
    if (remaining > 0) await delay(Math.min(2000, remaining));
  }
  result.steps.backend = { result: 'FAIL', attempts, reason: last, missing_diets: missing };
  throw new Error('backend gate failed');
}
async function screenshot(label) {
  const path = resolve(settings.evidence, `live-${stamp}-${label}.png`);
  await page.screenshot({ path, fullPage: true });
  result.screenshots.push(path);
}
async function login() {
  await page.goto(`${settings.frontend}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email', { exact: true }).fill(result.username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL(url => ['/dashboard', '/welcome'].includes(url.pathname));
}
async function choose(heading, query, label) {
  await page.getByRole('combobox', { name: heading, exact: true }).click();
  await page.getByPlaceholder('Type to search', { exact: true }).fill(query);
  const option = page.getByRole('option').filter({ hasText: label }).first();
  await option.waitFor();
  const text = (await option.innerText()).trim();
  if (heading === 'Do you have a medical condition?') check(text.includes('J30.9'), 'expected J30.9 option');
  await option.click();
  await page.keyboard.press('Escape');
}
async function chips() {
  await page.waitForURL(url => url.pathname === '/dashboard');
  await page.getByRole('heading', { name: 'What should I eat?', exact: true }).waitFor();
  const region = page.locator('p').filter({ hasText: 'Your profile:' });
  await region.waitFor();
  const labels = await region.locator('span').allTextContents();
  check(['Vegetarian', 'Allergic rhinitis, unspecified'].every(label => labels.includes(label)), 'required persisted chips missing');
  return { chips: ['Vegetarian', 'Allergic rhinitis, unspecified'] };
}
const stamp = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const password = `Lc!9-${randomBytes(24).toString('base64url')}`; // Memory only; never serialized.
try {
  settings = options(process.argv.slice(2));
  result.steps.arguments = { result: 'PASS' };
  current = 'backend';
  try { await step('backend', backendGate); } catch { exitCode = 2; throw new Error('backend gate failed'); }
  await mkdir(settings.evidence, { recursive: true });
  result.username = `livecheck-${stamp}@food4u.test`;
  current = 'browser';
  // Deny-only proxy also guards redirects/popups; no third-party upstream is opened.
  proxyServer = createServer((_, res) => { res.writeHead(403); res.end('Not an acceptance target'); });
  proxyServer.on('connect', (_, socket) => socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'));
  await new Promise((ok, fail) => { proxyServer.once('error', fail); proxyServer.listen(0, '127.0.0.1', ok); });
  const allowed = new Set([new URL(settings.frontend).origin, new URL(settings.backend).origin]);
  const proxy = { server: `http://127.0.0.1:${proxyServer.address().port}`, bypass: [...new Set([...allowed].map(origin => new URL(origin).hostname))].join(',') };
  const { chromium } = await import('../frontend/node_modules/playwright-core/index.mjs');
  browser = await chromium.launch({ channel: 'chrome', headless: !settings.headed, proxy });
  async function newPage() {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', proxy });
    await context.route('**/*', route => allowed.has(new URL(route.request().url()).origin) ? route.continue() : route.abort('blockedbyclient'));
    context.on('response', response => {
      if (allowed.has(new URL(response.url()).origin) && response.status() >= 500) {
        result.observed_5xx.push({ source: new URL(response.url()).origin === new URL(settings.frontend).origin ? 'app' : 'backend', status: response.status() });
      }
    });
    const next = await context.newPage();
    next.setDefaultTimeout(60000);
    next.setDefaultNavigationTimeout(120000);
    return next;
  }
  page = await newPage();
  result.steps.browser = { result: 'PASS', engine: 'real Chrome via Playwright' };
  await step('register', async () => {
    await page.goto(`${settings.frontend}/login`, { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Create account', exact: true }).click();
    await page.getByLabel('Email', { exact: true }).fill(result.username);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await page.getByRole('heading', { name: 'Welcome back', exact: true }).waitFor();
    await page.getByText('Account created. Log in to continue.', { exact: true }).waitFor();
  });
  await step('login', login);
  await step('welcome', async () => {
    await page.waitForURL(url => url.pathname === '/welcome');
    await choose('What cuisines do you enjoy?', 'Italian', 'Italian');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await choose('Do you follow a particular diet?', 'Vegetarian', /^\s*Vegetarian\s*$/);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await choose('Do you have a medical condition?', 'allergy', 'Allergic rhinitis, unspecified');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByPlaceholder('Enter price', { exact: true }).fill('12.50');
    await page.getByRole('button', { name: 'Review', exact: true }).click();
    await page.getByRole('heading', { name: "Here's what we'll check against", exact: true }).waitFor();
    await screenshot('welcome-review');
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/dashboard');
    return { cuisine: 'Italian', diet: 'Vegetarian', budget: '12.50', condition: 'J30.9' };
  });
  await step('dashboard', async () => { const details = await chips(); await screenshot('dashboard'); return details; });
  await step('logout', async () => {
    await page.getByRole('button', { name: 'Account menu', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/login');
    await page.goto(`${settings.frontend}/dashboard`, { waitUntil: 'networkidle' });
    check(new URL(page.url()).pathname === '/login', 'logout did not revoke dashboard access');
    await page.context().close();
  });
  await step('fresh_login', async () => {
    page = await newPage();
    await login();
    const details = await chips();
    await screenshot('fresh-login-dashboard');
    return { ...details, fresh_browser_context: true };
  });
  // public_id is deliberately null: the public profile/UI does not expose it.
  result.result = 'PASS';
  exitCode = 0;
} catch (error) {
  if (result.steps[current].result !== 'FAIL') result.steps[current] = { result: 'FAIL', ...diagnostic(error) };
  // Never screenshot a failed login/registration: password fields may be populated.
  if (page && ['welcome', 'dashboard', 'logout', 'fresh_login'].includes(current) && new URL(page.url()).pathname !== '/login') await screenshot('failure').catch(() => {});
} finally {
  try { if (browser) await browser.close(); } catch { result.result = 'FAIL'; exitCode = 1; }
  if (proxyServer?.listening) await new Promise(ok => proxyServer.close(ok));
  if (result.observed_5xx.length) { result.result = 'FAIL'; if (exitCode === 0) exitCode = 1; }
  console.log(`LIVE_CHECK ${JSON.stringify(result)}`);
  process.exitCode = exitCode;
}
