import { test, expect } from '@playwright/test';
import { acceptConsent } from './helpers';

test('consent flow', async ({ page }) => {
  await test.step('Open app', async () => {
    await page.goto('/');
    await expect(page).toHaveURL(/localhost/);
  });

  await test.step('Accept consent if present', async () => {
    await acceptConsent(page);
  });

  await test.step('Consent hidden', async () => {
    await page.waitForSelector('[data-testid="mode-bar"]', { state: 'visible', timeout: 10000 });
  });
});
