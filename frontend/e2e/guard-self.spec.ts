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
      if (specimen.name === 'pageerror') await expect.poll(() => errors.errors.length).toBeGreaterThan(0);
      if (specimen.name === 'failed same-origin request') await expect.poll(() => errors.errors.some(error => error.includes('same-origin requestfailed'))).toBe(true);
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

// Real Chrome response/requestfailed events exercise the exported observer and
// gate, not a parallel classifier. These routes belong only to raw guard pages.
const rscSpecimens: { name: string; prior?: boolean; headers?: Record<string, string>; committed?: string;
  abort?: 'failed'; method?: string; contentType?: string; status?: number; priorQuery?: string; positive?: boolean }[] = [
  { name: 'no prior 200', prior: false },
  { name: 'aborted prefetch', headers: { rsc: '1', 'next-router-prefetch': '' } },
  { name: 'different committed pathname', committed: '/__harness__/rsc-other' },
  { name: 'non-RSC abort', headers: {} },
  { name: 'different errorText', abort: 'failed' },
  { name: 'POST abort', method: 'POST' },
  { name: 'non-component response', contentType: 'text/plain' },
  { name: 'non-200 response', status: 201 },
  { name: 'different exact response URL', priorQuery: 'another-response' },
  { name: 'positive control', positive: true },
];
for (const specimen of rscSpecimens) {
  test(`RSC guard ${specimen.name}`, async ({ browser, baseURL, proxy }, info) => {
    const context = await browser.newContext({ proxy });
    const page = await context.newPage();
    const origin = new URL(baseURL!).origin;
    const errors = observe(page, origin);
    const pathname = '/__harness__/rsc-committed';
    const failedURL = `${origin}${pathname}?_rsc=guard-019`;
    const headers: Record<string, string> = specimen.headers ?? { rsc: '1' };
    let responding = true;
    await page.route('**/__harness__/rsc-*', route => {
      if (route.request().isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: document('<p>Committed guard page</p>') });
      if (responding) return route.fulfill({ status: specimen.status ?? 200, contentType: specimen.contentType ?? 'text/x-component; charset=utf-8', body: 'guard response' });
      return route.abort(specimen.abort ?? 'aborted');
    });
    try {
      // The positive abort happens BEFORE the matching navigation commits.
      // A failure-time pathname test would wrongly reject this control.
      await page.goto(`${origin}${specimen.positive ? '/__harness__/rsc-before-commit' : specimen.committed ?? pathname}`);
      if (specimen.prior !== false) {
        await page.evaluate(async ({ url, headers }) => { await (await fetch(url, { headers })).text(); }, {
          url: specimen.priorQuery ? `${origin}${pathname}?_rsc=${specimen.priorQuery}` : failedURL, headers,
        });
      }
      responding = false;
      const failed = page.waitForEvent('requestfailed', request => request.url() === failedURL);
      await page.evaluate(async ({ url, headers, method }) => { await fetch(url, { headers, method }).catch(() => {}); }, {
        url: failedURL, headers, method: specimen.method ?? 'GET',
      });
      const request = await failed;
      expect(request.failure()?.errorText).toBe(specimen.abort ? 'net::ERR_FAILED' : 'net::ERR_ABORTED');
      if (specimen.positive) {
        expect(new URL(page.url()).pathname).toBe('/__harness__/rsc-before-commit');
        await page.evaluate(path => history.replaceState(null, '', path), pathname);
        await checkPage(page, errors, false, info);
        expect(info.annotations.filter(item => item.type === 'tolerated-rsc-abort')).toHaveLength(1);
        // Recheck retained candidates: a later divergent URL must fail too.
        await page.evaluate(() => history.replaceState(null, '', '/__harness__/rsc-left'));
        await expect(checkPage(page, errors, false)).rejects.toThrow(/No console errors/);
      } else if (process.env.E2E_GUARD_RED === '1') {
        await checkPage(page, errors, false);
      } else {
        await expect(checkPage(page, errors, false)).rejects.toThrow(/No console errors/);
      }
    } finally { await context.close(); }
  });
}
