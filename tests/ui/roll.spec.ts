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

    await page.locator('[data-is-rolling="true"]').waitFor({state: 'visible', timeout: 10000});

    await expect(page.getByTestId('action-result').getByTestId('result-value')).not.toContainText("Bereit");
    await expect(page.getByTestId('zone-result').getByTestId('result-value')).not.toContainText("Bereit");


    const txt = await result.innerText();
    expect(txt.length).toBeGreaterThan(0);

    await page.locator('[data-is-rolling="false"]').waitFor({state: 'visible', timeout: 10000});
  });
});
