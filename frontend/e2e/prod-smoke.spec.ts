import { test, expect } from '@playwright/test';
import { observe, checkPage } from './fixtures';

// This project exists only with E2E_PROD=1. No credentials, writes, registration,
// submission or interaction. GET navigation may invoke the app's own wake GET.
for (const path of ['/', '/login', '/privacy']) {
  test(`read-only production ${path}`, async ({ page, baseURL }) => {
    test.skip(process.env.E2E_PROD !== '1', 'Production smoke is explicitly opt-in');
    const errors = observe(page, new URL(baseURL!).origin);
    const writes: string[] = [];
    await page.context().route('**/*', route => {
      if (['GET', 'HEAD'].includes(route.request().method())) return route.continue();
      writes.push(`${route.request().method()} ${route.request().url()}`);
      return route.abort('blockedbyclient');
    });
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: path === '/privacy' ? 'Privacy' : 'Welcome back', exact: true })).toBeVisible();
    await checkPage(page, errors, false);
    expect(writes, 'production smoke must never attempt writes').toEqual([]);
  });
}
