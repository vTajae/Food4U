import { test, expect } from './fixtures';

test('privacy policy and not-found journey', async ({ page, gate }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How we use your health data' })).toBeVisible();
  await gate.check('privacy');
  const response = await page.goto('/this-page-does-not-exist-018');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: "We couldn't find that page." })).toBeVisible();
  await gate.check('404');
});
