import { test, expect } from './fixtures';
import { email, login, register, onboard } from './journeys';

test('all five steps, review, back, save and persisted dashboard chips', async ({ page, gate }) => {
  const user = email(); await register(page, user); await login(page, user);
  await onboard(page, gate);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'What do you usually spend per meal?' })).toHaveValue('12.50');
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'What should I eat?' })).toBeVisible();
  await expect(page.getByText('Vegetarian', { exact: true })).toBeVisible();
  await expect(page.getByText('Type 2 diabetes', { exact: true })).toBeVisible();
  await expect(page.getByText('Peanut allergy', { exact: true })).toBeVisible();
  await gate.check('saved-dashboard');
  await page.reload();
  await expect(page.getByText('Peanut allergy', { exact: true })).toBeVisible();
});

test('D018-02 price review has an explicit currency', async ({ page, gate }) => {
  test.fixme(process.env.E2E_AUDIT !== '1', 'D018-02: raw 12.50 price chip; see DEFECTS.md');
  const user = email(); await register(page, user); await login(page, user);
  for (let step = 0; step < 4; step++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('textbox', { name: 'What do you usually spend per meal?' }).fill('12.50');
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.screenshot({ path: test.info().outputPath('018-currency-D018-02.png'), fullPage: true, animations: 'disabled' });
  await expect(page.getByText('$12.50', { exact: true })).toBeVisible();
  await gate.check('currency');
});

test('D018-06 malformed saved intake recovers without crashing', async ({ page, gate }) => {
  test.fixme(process.env.E2E_AUDIT !== '1', 'D018-06: unguarded formState JSON.parse; see DEFECTS.md');
  const user = email(); await register(page, user); await login(page, user);
  await page.evaluate(() => localStorage.setItem('formState', '{invalid-json'));
  await page.reload();
  await page.screenshot({ path: test.info().outputPath('018-corrupt-storage-D018-06.png'), fullPage: true, animations: 'disabled' });
  await expect(page.getByRole('heading', { name: 'Tell us about you' })).toBeVisible();
  await gate.check('corrupt-storage-recovered');
});

test('D018-09 nonnumeric meal price cannot reach review', async ({ page, gate }) => {
  test.fixme(process.env.E2E_AUDIT !== '1', 'D018-09: price is not validated; see DEFECTS.md');
  const user = email(); await register(page, user); await login(page, user);
  for (let step = 0; step < 4; step++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('textbox', { name: 'What do you usually spend per meal?' }).fill('not money');
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.screenshot({ path: test.info().outputPath('018-invalid-price-D018-09.png'), fullPage: true, animations: 'disabled' });
  await expect(page.getByText('Step 5 of 5', { exact: true })).toBeVisible();
  await gate.check('invalid-price-validation');
});

test('save while waking keeps review answers and offers retry', async ({ page, gate }, info) => {
  await login(page, `save-waking-${info.project.name}@food4u.test`);
  await onboard(page, gate);
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'The server is waking up.' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reload and try again' })).toBeVisible();
  await expect(page.getByText('Peanut allergy', { exact: true })).toBeVisible();
  await gate.check('save-waking');
});
