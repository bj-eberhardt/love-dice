import { test, expect } from "@playwright/test";
import { acceptConsent } from "./helpers";

test("consent flow at start screen", async ({ page }) => {
  await test.step("Open app", async () => {
    await page.goto("/");
    await expect(page).toHaveURL(/localhost/);
  });

  await test.step("Hero image is loaded and visible", async () => {
    const heroImage = page.getByTestId("consent-hero-image");
    await expect(heroImage).toBeVisible();
    await expect(heroImage).toHaveAttribute("src", "/assets/hero-dice-desktop.png");
    await expect
      .poll(async () =>
        heroImage.evaluate(
          (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
        )
      )
      .toBe(true);
  });

  await test.step("Accept consent", async () => {
    await acceptConsent(page);
  });

  await test.step("Consent hidden", async () => {
    await page.waitForSelector('[data-testid="mode-bar"]', { state: "visible", timeout: 10000 });
  });
});
