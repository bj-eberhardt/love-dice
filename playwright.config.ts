import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/ui',
  timeout: 45_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  workers: 2,
  reporter: [['list']],
  use: {
    headless: true,
    baseURL: 'http://localhost:5545',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    // Use a dedicated dev script that starts the local dev server on a
    // different port so UI tests can run alongside the normal dev flow.
    command: 'npm run dev:ui',
    port: 5545,
    reuseExistingServer: false,
  },

});
