import { test, expect } from './fixtures';
import { email, login, register, onboard, choose } from './journeys';

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
  const user = email(); await register(page, user); await login(page, user);
  await page.evaluate(() => localStorage.setItem('formState', '{invalid-json'));
  await page.reload();
  await page.screenshot({ path: test.info().outputPath('018-corrupt-storage-D018-06.png'), fullPage: true, animations: 'disabled' });
  await expect(page.getByRole('heading', { name: 'Tell us about you' })).toBeVisible();
  await gate.check('corrupt-storage-recovered');
});

test('019 scoped corrupt and old intake drafts recover; legacy answers never migrate', async ({ page, gate }) => {
  const user = email(); await register(page, user); await login(page, user);
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('food4u:intake:v1:')).length)).toBe(1);
  const key = await page.evaluate(() => Object.keys(localStorage).find(key => key.startsWith('food4u:intake:v1:'))!);
  for (const raw of ['{broken', 'null', JSON.stringify({ currentStep: -1, answers: [] }),
    JSON.stringify({ version: 0, identity: key.split(':').at(-1), state: { currentStep: 0, answers: [] } })]) {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
    await page.reload();
    await expect.poll(() => page.evaluate(key => localStorage.getItem(key), key)).not.toBe(raw);
    await expect(page.getByRole('heading', { name: 'Tell us about you' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  }
  await page.evaluate(() => localStorage.setItem('formState', JSON.stringify({ currentStep: 0, answers: [{ questionId: 5, answers: [{ name: 'Italian' }] }] })));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove Italian', exact: true })).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('formState'))).toBeNull();
  await gate.check('019-scoped-draft-recovered');
});

test('019 identity switch never paints the previous account answers', async ({ page, gate }) => {
  const user = email(); await register(page, user); await login(page, user);
  await page.goto('/e2e-draft-019');
  await choose(page, 'What cuisines do you enjoy?', 'Italian');
  await expect(page.getByRole('button', { name: 'Remove Italian', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch synthetic account' }).click();
  // The test-only parent records the first committed DOM in a layout effect,
  // before passive effects could hide a transient stale-child-state leak.
  await expect(page.getByRole('status', { name: 'Identity switch privacy' })).toHaveText('clean');
  await expect(page.getByRole('button', { name: 'Remove Italian', exact: true })).toBeHidden();
  await gate.check('019-identity-switch-first-paint');
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
