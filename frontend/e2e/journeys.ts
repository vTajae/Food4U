import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import { expect, type Gate } from './fixtures';

export const password = 'E2E-password-018!';
export const email = () => `e2e-${randomUUID()}@food4u.test`;
export async function credentials(page: Page, user: string, button: 'Log in' | 'Create account') {
  await page.getByLabel('Email', { exact: true }).fill(user);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: button, exact: true }).click();
}
export async function register(page: Page, user: string) {
  await page.goto('/register', { waitUntil: 'networkidle' });
  await credentials(page, user, 'Create account');
  await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();
  await expect(page.getByText('Account created. Log in to continue.', { exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
}
export async function login(page: Page, user: string) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await credentials(page, user, 'Log in');
  await expect(page).toHaveURL(/\/(dashboard|welcome)$/);
  await page.waitForLoadState('networkidle');
}
export async function choose(page: Page, question: string, choice: string) {
  await page.getByRole('combobox', { name: question, exact: true }).click();
  await page.getByRole('checkbox', { name: choice, exact: true }).check();
  await page.getByRole('searchbox').press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
}
export async function onboard(page: Page, gate: Gate) {
  const steps = [
    ['What cuisines do you enjoy?', 'Italian'],
    ['Do you follow a particular diet?', 'Vegetarian'],
    ['Do you have a medical condition?', 'Type 2 diabetes'],
    ['Any allergies or foods you avoid?', 'Peanut allergy'],
  ];
  for (const [index, [question, choice]] of steps.entries()) {
    await expect(page.getByText(`Step ${index + 1} of 5`, { exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: question, exact: true }).click();
    await expect(page.getByRole('checkbox', { name: choice, exact: true })).toBeVisible();
    await gate.check(`step-${index + 1}-picker`, { medical: true });
    await page.getByRole('checkbox', { name: choice, exact: true }).check();
    await page.getByRole('searchbox').press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await gate.check(`step-${index + 1}-selected`, { medical: true });
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  await expect(page.getByText('Step 5 of 5', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'What do you usually spend per meal?' }).fill('12.50');
  await gate.check('step-5-price', { medical: true });
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Here's what we'll check against" })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Onboarding progress' })).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByText('Italian', { exact: true })).toBeVisible();
  await expect(page.getByText('Vegetarian', { exact: true })).toBeVisible();
  await expect(page.getByText('Type 2 diabetes', { exact: true })).toBeVisible();
  await expect(page.getByText('Peanut allergy', { exact: true })).toBeVisible();
  await gate.check('review', { medical: true });
}
