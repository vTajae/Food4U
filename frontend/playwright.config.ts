import { defineConfig } from '@playwright/test';

const production = process.env.E2E_PROD === '1';
export default defineConfig({
  testDir: './e2e',
  testMatch: production ? '**/prod-smoke.spec.ts' : '**/!(prod-smoke).spec.ts',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  outputDir: './test-results',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'e2e/.artifacts/018-results.json' }], ['./e2e/rsc-abort-reporter.ts']],
  use: {
    browserName: 'chromium', channel: 'chrome', headless: true,
    baseURL: production ? 'https://food4u-frontend.qias-webdev.workers.dev' : undefined,
    trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure',
    serviceWorkers: 'block', colorScheme: 'light',
  },
  projects: production ? [{ name: 'prod-smoke', use: { viewport: { width: 1440, height: 900 } } }] : [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
