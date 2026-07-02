import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/ui",
  timeout: 45_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 3,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["html", { open: "never" }]
  ],
  use: {
    headless: true,
    baseURL: "http://localhost:5545",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: process.env.CI
    ? {
        command: "npm run preview:test",
        port: 5545,
        reuseExistingServer: false
      }
    : {
        command: "npm run dev:ui",
        port: 5545,
        reuseExistingServer: false
      }
});
