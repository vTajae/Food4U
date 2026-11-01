import { test, expect } from './fixtures';
import { login } from './journeys';

test('019 unexpected errors show branded recovery and reset recovers', { annotation: { type: 'expected-error', description: 'E2E_ERROR_019_EXPECTED' } }, async ({ page, gate }) => {
  await page.goto('/e2e-error-019', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Error boundary test ready' })).toBeVisible();
  await page.getByRole('button', { name: 'Trigger test fault' }).click();
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect(page.getByText('Food4U', { exact: true })).toBeVisible();
  await expect(page.getByText("We couldn't load this page. Try again, or go home to continue.", { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  await expect(page.locator('body')).not.toContainText('E2E_ERROR_019_EXPECTED');
  await gate.check('019-error-recovery');
  // Remove the injected cause, then exercise the product boundary's reset.
  await page.evaluate(() => sessionStorage.removeItem('e2e-error-019'));
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Error boundary test ready' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeHidden();
  await gate.check('019-error-reset-recovered');
});

test('019 signed-out 404 links to login', async ({ page, gate }) => {
  const response = await page.goto('/this-page-does-not-exist-018');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Go to login' })).toHaveAttribute('href', '/login');
  await expect(page.getByRole('link', { name: 'Go to your dashboard' })).toBeHidden();
  await gate.check('019-signed-out-404');
});

test('019 signed-in 404 links to dashboard', async ({ page, gate }, info) => {
  await login(page, `dashboard-${info.project.name}@food4u.test`);
  const response = await page.goto('/this-page-does-not-exist-018');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Go to your dashboard' })).toHaveAttribute('href', '/dashboard');
  await expect(page.getByRole('link', { name: 'Go to login' })).toBeHidden();
  await gate.check('019-signed-in-404');
});
