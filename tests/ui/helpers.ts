import type { Page } from '@playwright/test';

export async function acceptConsent(page: Page) {
  const accept = page.getByTestId('consent-accept');
  if (await accept.count() === 0) {
    // No consent dialog present — ensure main UI is visible
    await page.waitForSelector('[data-testid="mode-bar"]', { state: 'visible', timeout: 10000 });
    return;
  }
  // Wait for the button to be visible and clickable
  await accept.waitFor({ state: 'visible', timeout: 10000 });
  await accept.click();
  // Wait until the main UI (mode bar) is visible as signal consent was applied
  await page.waitForSelector('[data-testid="mode-bar"]', { state: 'visible', timeout: 10000 });
}
