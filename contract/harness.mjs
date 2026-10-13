import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';

export function localBase(value) {
  const url = new URL(value);
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname), 'BASE_URL must be localhost or 127.0.0.1');
  assert.ok(['http:', 'https:'].includes(url.protocol), 'BASE_URL must be HTTP(S)');
  assert.equal(url.username + url.password + url.search + url.hash, '', 'BASE_URL must not contain credentials/query/fragment');
  assert.equal(url.pathname, '/', 'BASE_URL must be an origin');
  return url.origin;
}

export async function createHarness() {
  const base = localBase(process.env.BASE_URL || 'http://127.0.0.1:3001');
  const timeout = Number(process.env.CONTRACT_TIMEOUT_MS || 15000);
  const denyProxy = createServer((_, response) => { response.writeHead(403); response.end('External connections denied by contract safety proxy'); });
  denyProxy.on('connect', (_, socket) => socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'));
  await new Promise(ok => denyProxy.listen(0, '127.0.0.1', ok));
  const proxy = { server: `http://127.0.0.1:${denyProxy.address().port}`, bypass: '127.0.0.1,localhost' };
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH ||
    (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/chromium'), proxy }).catch(async error => {
      await new Promise(ok => denyProxy.close(ok));
      throw error;
    });
  let renderRequests = 0;
  let unsafe;
  const forbidden = url => {
    const host = new URL(url).hostname.toLowerCase().replace(/\.$/, '');
    return host === 'onrender.com' || host.endsWith('.onrender.com');
  };
  const harness = {
    base,
    email: () => `contract-${randomUUID()}@food4u.test`,
    async verifyRedirectDenial() {
      let hits = 0;
      const destination = createServer((_, res) => { hits++; res.setHeader('access-control-allow-origin', '*'); res.end('local canary'); });
      const listen = server => new Promise(ok => server.listen(0, '127.0.0.1', ok));
      await listen(destination);
      const blocked = `http://127.0.0.1:${destination.address().port}`;
      const source = createServer((req, res) => {
        if (req.url === '/redirect') { res.writeHead(302, { location: `${blocked}/landed` }); res.end(); }
        else { res.setHeader('content-type', 'text/html'); res.end('<title>Local safety canary</title>'); }
      });
      const context = await browser.newContext({ serviceWorkers: 'block', proxy: { ...proxy, bypass: 'localhost' } });
      try {
        await listen(source);
        assert.equal((await fetch(blocked)).status, 200, 'local canary destination must be reachable');
        hits = 0;
        const page = await context.newPage();
        const origin = `http://localhost:${source.address().port}`;
        assert.equal((await page.goto(origin)).status(), 200, 'allowed canary source must bypass the deny proxy');
        const navigation = await page.goto(`${origin}/redirect`, { waitUntil: 'networkidle' }).catch(error => error);
        console.log(`LOCAL_CANARY_NAVIGATION browser=${await browser.version()} destination_requests=${hits} result=${navigation?.message || navigation?.status?.()}`);
        assert.equal(hits, 0, 'browser must block redirected navigation');
        await page.goto(origin);
        assert.equal(await page.evaluate(async url => { try { await fetch(url); return false; } catch { return true; } }, `${origin}/redirect`), true);
        assert.equal(hits, 0, 'redirected navigation and fetch must never reach the blocked local destination');
        console.log(`LOCAL_REDIRECT_DENY_PROOF=PASS destination_requests=${hits} browser=${await browser.version()}`);
      } finally {
        await context.close();
        await Promise.all([source, destination].map(server => new Promise(ok => server.close(ok))));
      }
    },
    assertRedirect(response, status, path) {
      assert.equal(response.status(), status, `redirect status for ${response.url()}`);
      assert.equal(new URL(response.headers().location, base).pathname, path);
    },
    async withContext(callback) {
      assert.equal(unsafe, undefined, 'a forbidden request already failed the safety gate');
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', proxy });
      let failFast;
      const violation = new Promise((_, reject) => { failFast = reject; });
      const seen = new Set();
      const observe = request => {
        if (!forbidden(request.url()) || seen.has(request)) return;
        seen.add(request);
        renderRequests++;
        unsafe = new Error(`Forbidden browser request: ${request.url()}`);
        failFast(unsafe);
      };
      context.on('request', observe);
      await context.route('**/*', async route => {
        if (forbidden(route.request().url())) {
          observe(route.request());
          await route.abort('blockedbyclient');
        } else await route.continue();
      });
      const page = await context.newPage();
      // The deny-only browser proxy protects redirects and popups too. It never
      // opens an upstream connection; only the two loopback hosts bypass it.
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(Math.max(timeout, 120000));
      try {
        return await Promise.race([callback({ context, page }), violation]);
      } finally {
        await context.close();
        assert.equal(renderRequests, 0, 'no browser/page request may target *.onrender.com');
      }
    },
    async register(page, email, password = 'Contract-pass-004!') {
      await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
      await page.getByRole('tab', { name: 'Create account', exact: true }).click();
      await page.getByLabel('Email', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Create account', exact: true }).click();
      await page.getByRole('heading', { name: 'Welcome back', exact: true }).waitFor();
      await page.getByText('Account created. Log in to continue.', { exact: true }).waitFor();
    },
    async login(page, email, password = 'Contract-pass-004!') {
      await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
      await page.getByLabel('Email', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Log in', exact: true }).click();
      await page.waitForURL(url => ['/dashboard', '/welcome'].includes(url.pathname), { timeout });
    },
    async close() {
      await browser.close();
      await new Promise(ok => denyProxy.close(ok));
      console.log(`ONRENDER_REQUESTS_OBSERVED=${renderRequests}`);
      assert.equal(renderRequests, 0);
    },
  };
  return harness;
}
