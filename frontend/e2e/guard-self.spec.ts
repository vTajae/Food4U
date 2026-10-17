import { test, expect, observe, checkPage } from './fixtures';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const document = (body: string) => `<!doctype html><html lang="en"><head><title>Guard self-test</title></head><body><main><h1>Guard self-test</h1>${body}</main></body></html>`;

test('local proxy disables implicit Chrome loopback bypass', async ({ proxy }) => {
  expect(proxy, 'the local Chrome fixture must use the deny proxy').toBeDefined();
  expect(proxy?.bypass?.split(',')[0], 'the subtractive marker must precede every explicit host').toBe('<-loopback>');
  expect(proxy?.bypass?.split(','), 'only explicit hosts may bypass; implicit loopback bypass must be disabled')
    .toEqual(['<-loopback>', '127.0.0.1', 'localhost']);
});

test('proxy allows the explicit loopback origin and denies redirected loopback port', async ({ browser, proxy }, info) => {
  const listen = (server: Server) => new Promise<void>((ok, no) => { server.once('error', no); server.listen(0, '127.0.0.1', ok); });
  const close = (server: Server) => new Promise<void>(ok => { server.closeAllConnections(); server.close(() => ok()); });
  let destinationHits = 0;
  const destination = createServer((_, response) => {
    destinationHits++; response.setHeader('access-control-allow-origin', '*'); response.end('Owned destination');
  });
  const source = createServer((request, response) => {
    if (request.url === '/redirect') response.writeHead(302, { location: `http://127.0.0.1:${(destination.address() as AddressInfo).port}/landed` });
    else response.setHeader('content-type', 'text/html');
    response.end('<!doctype html><html lang="en"><title>Owned canary</title><main>Allowed local source</main></html>');
  });
  let context;
  try {
    await listen(destination); await listen(source);
    const blocked = `http://127.0.0.1:${(destination.address() as AddressInfo).port}`;
    expect((await fetch(blocked)).status, 'negative destination must be reachable before browser isolation').toBe(200);
    destinationHits = 0;
    // Narrow the real fixture list to localhost for this canary. Preserve its
    // actual marker ordering, so both missing and trailing markers fail.
    const bypass = proxy!.bypass!.split(',').filter(host => host !== '127.0.0.1').join(',');
    context = await browser.newContext({ serviceWorkers: 'block', proxy: { ...proxy!, bypass } });
    const page = await context.newPage();
    const origin = `http://localhost:${(source.address() as AddressInfo).port}`;
    expect((await page.goto(origin))?.status(), 'explicitly allowed source must load before checking redirect denial').toBe(200);
    expect(await page.getByText('Allowed local source').isVisible()).toBe(true);
    expect((await page.goto(origin + '/redirect'))?.status(), 'redirect must be rejected by the owned deny proxy').toBe(403);
    expect(destinationHits, 'redirected navigation must never reach the non-allowed loopback destination').toBe(0);
    await page.goto(origin);
    expect(await page.evaluate(async url => { try { await fetch(url); return false; } catch { return true; } }, origin + '/redirect')).toBe(true);
    expect(destinationHits, 'redirected fetch must never reach the non-allowed loopback destination').toBe(0);
    await info.attach('loopback-proxy-canary', { body: JSON.stringify({ bypass, allowed_source_status: 200, navigation_denied_status: 403, fetch_rejected: true, destination_requests: destinationHits }), contentType: 'application/json' });
  } finally {
    if (context) await context.close();
    for (const server of [source, destination]) if (server.listening) await close(server);
  }
});

for (const specimen of [
  { name: 'console.error', html: '<script>console.error("018 deliberate console error")</script>', medical: false, reason: /No console errors/ },
  { name: 'visible ICD code', html: '<p>Condition E11.9</p>', medical: true, reason: /ICD codes must not be visible/ },
  { name: 'unlabeled input', html: '<input type="text">', medical: false, reason: /axe serious\/critical/ },
  { name: 'pageerror', html: '<script>setTimeout(() => { throw Error("018 deliberate page error") }, 0)</script>', medical: false, reason: /No console errors/ },
  { name: 'failed same-origin request', html: '<script>fetch("/__harness__/broken").catch(() => {})</script>', medical: false, reason: /No console errors/ },
]) {
  // Raw fixture intentionally: the very same exported guard must reject each
  // broken local page. Normal app tests use the automatic strict fixture.
  test(`guard rejects ${specimen.name}`, async ({ browser, baseURL, proxy }) => {
    const context = await browser.newContext({ proxy });
    const page = await context.newPage();
    const errors = observe(page, new URL(baseURL!).origin);
    await page.route('**/__harness__/broken', route => route.abort('failed'));
    await page.route('**/__harness__/specimen', route => route.fulfill({ contentType: 'text/html', body: document(specimen.html) }));
    try {
      await page.goto(baseURL + '/__harness__/specimen');
      if (specimen.name === 'pageerror') await expect.poll(() => errors.length).toBeGreaterThan(0);
      if (specimen.name === 'failed same-origin request') await expect.poll(() => errors.some(error => error.includes('same-origin requestfailed'))).toBe(true);
      if (process.env.E2E_GUARD_RED === '1') {
        await checkPage(page, errors, specimen.medical);
      } else {
        await expect(checkPage(page, errors, specimen.medical)).rejects.toThrow(specimen.reason);
      }
    } finally { await context.close(); }
  });
}

test('clean labeled local page passes the same guard', async ({ page, baseURL, gate }) => {
  await page.route('**/__harness__/clean', route => route.fulfill({ contentType: 'text/html', body: document('<label for="name">Name</label><input id="name">') }));
  await page.goto(baseURL + '/__harness__/clean');
  await gate.check('guard-clean');
});
