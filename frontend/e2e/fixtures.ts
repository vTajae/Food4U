import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export const ICD = /\b[A-TV-Z]\d{2}(\.\w{1,4})?\b/;
export type Gate = { check: (state: string, options?: { medical?: boolean }) => Promise<void> };

// Export the same observer used by product fixtures for negative self-tests.
export function observe(page: Page, origin: string) {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() !== 'error') return;
    // The explicitly requested missing-document journey MUST return 404. Chrome
    // logs that expected document status as an error, not an application fault.
    // Only the exact document URL and exact native 404 text are exempted.
    if (message.location().url === `${origin}/this-page-does-not-exist-018` &&
      message.text() === 'Failed to load resource: the server responded with a status of 404 (Not Found)') return;
    errors.push(`console.error: ${message.text()} @ ${message.location().url}`);
  });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => {
    const url = new URL(request.url());
    if (url.origin === origin) errors.push(`same-origin requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
  });
  page.on('request', request => {
    if (/(^|\.)onrender\.com$/i.test(new URL(request.url()).hostname)) errors.push(`ONRENDER REQUEST DENIED: ${request.url()}`);
  });
  return errors;
}

export async function checkPage(page: Page, errors: string[], medical: boolean, info?: TestInfo) {
  expect(errors, 'No console errors, page errors, failed same-origin or Render requests').toEqual([]);
  if (medical) expect(await page.locator('body').innerText(), 'ICD codes must not be visible').not.toMatch(ICD);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  if (info) await info.attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
  const blocking = results.violations.filter(item => item.impact === 'serious' || item.impact === 'critical');
  expect(blocking.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })), 'axe serious/critical WCAG 2.1 AA violations').toEqual([]);
  expect(errors, 'No errors may arrive during the accessibility scan').toEqual([]);
}

export const test = base.extend<{ gate: Gate }>({
  // eslint-disable-next-line no-empty-pattern -- Playwright option fixtures require an explicit dependency object.
  baseURL: async ({}, use) => { await use(process.env.E2E_BASE_URL!); },
  // eslint-disable-next-line no-empty-pattern -- This option depends only on the setup process environment.
  proxy: async ({}, use) => {
    await use(process.env.E2E_PROXY_URL ? { server: process.env.E2E_PROXY_URL, bypass: '<-loopback>,127.0.0.1,localhost' } : undefined);
  },
  context: async ({ context }, use) => {
    // Only this exact non-product stylesheet is stubbed. It avoids contacting
    // Google and makes offline runs deterministic; screenshots use fallback fonts.
    // Only the narrowly documented expected native-404 console message is exempt.
    await context.route('https://fonts.googleapis.com/css2?*', route => route.fulfill({ contentType: 'text/css', body: '/* offline font boundary; see e2e/README.md */' }));
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === process.env.E2E_BASE_URL || url.hostname === 'fonts.googleapis.com') return route.fallback();
      return route.abort('blockedbyclient');
    });
    await use(context);
  },
  gate: [async ({ page, baseURL }, use, info) => {
    const errors = observe(page, new URL(baseURL!).origin);
    await use({ check: async (state, options = {}) => {
      await page.screenshot({ path: info.outputPath(`018-${state}.png`), fullPage: true, animations: 'disabled' });
      await checkPage(page, errors, options.medical ?? /\/(welcome|dashboard)/.test(new URL(page.url()).pathname), info);
    } });
    if (!page.isClosed() && page.url() !== 'about:blank') await checkPage(page, errors, /\/(welcome|dashboard)/.test(new URL(page.url()).pathname), info);
  }, { auto: true }],
});
export { expect };
