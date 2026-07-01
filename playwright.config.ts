import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/ui',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    headless: true,
    baseURL: 'http://localhost:5544',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5544,
    reuseExistingServer: true,
  },
});
