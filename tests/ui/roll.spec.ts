import { test, expect } from "@playwright/test";
import { acceptConsent } from "./helpers";

test("roll result is revealed only after each animation", async ({ page }) => {
  await test.step("Open app and accept consent", async () => {
    await page.goto("/");
    await acceptConsent(page);
    await expect(page.locator('[data-testid="roll-button"]')).toBeVisible();
  });

  await test.step("Trigger first roll and keep result hidden while rolling", async () => {

    await test.step("Click roll button", async () => {
      await page.getByTestId('roll-button').click();
    });


    const result = page.locator('[data-testid="result-text"]');

    await test.step("Wait for state rolling", async () => {
      await page.locator('[data-is-rolling="true"]').waitFor({ state: "visible", timeout: 10000 });
      await expect(result).toHaveAttribute("data-is-rolling", "true");
      await expect(page.getByTestId("action-result")).toHaveAttribute("data-state", "empty");
      await expect(page.getByTestId("zone-result")).toHaveAttribute("data-state", "empty");
    });

    await test.step("Wait for state rolling finished", async () => {
      await page.locator('[data-is-rolling="false"]').waitFor({ state: "visible", timeout: 10000 });
      await expect(page.getByTestId("action-result")).toHaveAttribute("data-state", "filled");
      await expect(page.getByTestId("zone-result")).toHaveAttribute("data-state", "filled");
    })
  });

  await test.step("Trigger reroll and clear previous result while rolling", async () => {
    await test.step("Click roll button", async () => {
      await page.getByTestId('roll-button').click();
    });


    await test.step("Check rolling state and wait for rolling finished", async () => {
      const result = page.getByTestId('result-text');

      await page.locator('[data-is-rolling="true"]').waitFor({ state: "visible", timeout: 10000 });
      await expect(result).toHaveAttribute("data-is-rolling", "true");
      await expect(page.getByTestId("action-result")).toHaveAttribute("data-state", "empty");
      await expect(page.getByTestId("zone-result")).toHaveAttribute("data-state", "empty");

      await page.locator('[data-is-rolling="false"]').waitFor({ state: "visible", timeout: 10000 });
      await expect(page.getByTestId("action-result")).toHaveAttribute("data-state", "filled");
      await expect(page.getByTestId("zone-result")).toHaveAttribute("data-state", "filled");
    });

  });
});
