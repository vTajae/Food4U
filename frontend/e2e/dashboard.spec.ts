import { test, expect } from './fixtures';
import { login } from './journeys';

test('profile chips and ask validation', async ({ page, gate }, info) => {
  await login(page, `dashboard-${info.project.name}@food4u.test`);
  await expect(page.getByRole('heading', { name: 'What should I eat?' })).toBeVisible();
  await expect(page.getByText('Vegetarian', { exact: true })).toBeVisible();
  await expect(page.getByText('Seasonal allergies (hay fever)', { exact: true })).toBeVisible();
  await gate.check('dashboard');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Type a question to get suggestions.' })).toBeVisible();
  await gate.check('ask-validation');
  // Screenshot tour records the current failed-backend state, without blessing
  // it as correct. D018-04 retains the intended unavailable-state assertion.
  await page.getByRole('textbox', { name: 'Ask about food' }).fill('A simple vegetarian lunch');
  const response = page.waitForResponse(response => new URL(response.url()).pathname === '/api/suggestion');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ask', exact: true })).toBeDisabled();
  // Capture only: mobile loading accessibility has its own D018-11 regression.
  await page.screenshot({ path: info.outputPath('018-suggestion-loading.png'), fullPage: true, animations: 'disabled' });
  await response;
  await expect(page.getByRole('button', { name: 'Ask', exact: true })).toBeEnabled();
  await gate.check('suggestion-outage-observed-D018-04');
});

test('D018-11 loading suggestion strip remains keyboard scrollable', async ({ page, gate }, info) => {
  test.fixme(info.project.name === 'mobile' && process.env.E2E_AUDIT !== '1', 'D018-11: serious scrollable-region-focusable during loading; see DEFECTS.md');
  await login(page, `dashboard-${info.project.name}@food4u.test`);
  await page.getByRole('textbox', { name: 'Ask about food' }).fill('A vegetarian lunch');
  const response = page.waitForResponse(response => new URL(response.url()).pathname === '/api/suggestion');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ask', exact: true })).toBeDisabled();
  await gate.check('suggestion-loading-D018-11');
  await response;
  await expect(page.getByRole('button', { name: 'Ask', exact: true })).toBeEnabled();
});

test('D018-04 suggestion outage is unavailable, not no matches', async ({ page, gate }, info) => {
  test.fixme(process.env.E2E_AUDIT !== '1', 'D018-04: backend 503 swallowed as no matches; see DEFECTS.md');
  await login(page, `dashboard-${info.project.name}@food4u.test`);
  await page.getByRole('textbox', { name: 'Ask about food' }).fill('A simple vegetarian lunch');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ask', exact: true })).toBeEnabled();
  await gate.check('suggestion-outage-D018-04');
  await expect(page.getByText(/unavailable|couldn.t|waking/i).first()).toBeVisible();
  await gate.check('suggestion-unavailable');
});

test('D018-07 Profile opens saved editable profile, not empty intake', async ({ page, gate }, info) => {
  test.fixme(process.env.E2E_AUDIT !== '1', 'D018-07: Profile routes to empty welcome wizard; see DEFECTS.md');
  await login(page, `dashboard-${info.project.name}@food4u.test`);
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.waitForURL(url => ['/welcome', '/profile'].includes(url.pathname));
  await gate.check('profile-empty-wizard-D018-07');
  await expect(page).toHaveURL(/\/profile$/);
});

test('waking dashboard keeps account and exposes retry', async ({ page, gate }, info) => {
  await login(page, `waking-${info.project.name}@food4u.test`);
  await expect(page.getByRole('heading', { name: "The food service isn't responding" })).toBeVisible();
  await expect(page.getByText(/The server is waking up/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try again' })).toBeVisible();
  await gate.check('dashboard-waking');
});
