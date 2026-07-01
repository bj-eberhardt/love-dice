import { test, expect } from '@playwright/test';
import { acceptConsent } from './helpers';

test('basic roll produces result text', async ({ page }) => {
  await test.step('Open app and accept consent', async () => {
    await page.goto('/');
    await acceptConsent(page);
    await expect(page.locator('[data-testid="roll-button"]')).toBeVisible();
  });

  await test.step('Trigger roll and wait for result', async () => {
    await page.locator('[data-testid="roll-button"]').click();
    const result = page.locator('[data-testid="result-text"]');
    await result.waitFor({ state: 'visible', timeout: 10000 });
    const txt = await result.innerText();
    expect(txt.length).toBeGreaterThan(0);
  });
});
