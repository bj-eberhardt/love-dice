import { test, expect, type Locator, type Page } from "@playwright/test";
import { acceptConsent, createCustomMix } from "./helpers";

const customMixCount = 28;

async function expectInModeViewport(page: Page, locator: Locator) {
  await expect
    .poll(async () => {
      return locator.evaluate((element) => {
        const scroll = document.querySelector('[data-testid="mode-scroll"]');
        const elementRect = element.getBoundingClientRect();
        const scrollRect = scroll?.getBoundingClientRect();

        if (!scrollRect) return false;

        return elementRect.left >= scrollRect.left - 1 && elementRect.right <= scrollRect.right + 1;
      });
    })
    .toBe(true);
}

async function createManyCustomMixes(page: Page) {
  const ids: string[] = [];

  for (let i = 0; i < customMixCount; i++) {
    const label = String(i + 1).padStart(2, "0");
    const id = await createCustomMix(page, `E2E K\u00fcss-Mix ${label}`);
    ids.push(id);
  }

  return ids;
}

test.describe("navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("love-dice-custom-mixes"));
    await acceptConsent(page);
  });

  test("slides through overflowing mood selection and exposes every mix", async ({ page }) => {
    const ids = await createManyCustomMixes(page);

    await test.step("Reload with many custom mixes", async () => {
      await page.reload();
      await acceptConsent(page);
      await expect(page.getByTestId("mode-scroll")).toBeVisible();
      await expect(page.locator('[data-testid^="mix-chip-"]')).toHaveCount(customMixCount);
      await expect(page.getByTestId("mode-scroll-right")).toBeEnabled();
      await expect
        .poll(() =>
          page
            .getByTestId("mode-scroll")
            .evaluate((element) => element.scrollWidth > element.clientWidth)
        )
        .toBe(true);
    });

    await test.step("Slide to the right", async () => {
      const scroll = page.getByTestId("mode-scroll");
      const before = await scroll.evaluate((element) => element.scrollLeft);
      await expect(page.getByTestId("mode-scroll-right")).toBeEnabled();
      await page.getByTestId("mode-scroll-right").click();
      await expect
        .poll(() => scroll.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(before);
      await expect(page.getByTestId("mode-scroll-left")).toBeEnabled();
    });

    await test.step("Slide back to the left", async () => {
      const scroll = page.getByTestId("mode-scroll");
      await page.getByTestId("mode-scroll-left").click();
      await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBeLessThan(220);
      await scroll.evaluate((element) => element.scrollTo({ left: 0 }));
      await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBe(0);
      await expect
        .poll(() =>
          page
            .getByTestId("mode-scroll")
            .evaluate((element) => element.scrollWidth > element.clientWidth)
        )
        .toBe(true);
    });

    await test.step("Reveal every custom mix in the mood selection", async () => {
      for (const id of ids) {
        const chip = page.getByTestId(`mix-chip-${id}`);
        await chip.scrollIntoViewIfNeeded();
        await expect(chip).toBeVisible();
        await expectInModeViewport(page, chip);
      }
    });
  });

  test("shows split menu next to an active custom mix", async ({ page }) => {
    const id = await createCustomMix(page, "E2E Men\u00fc-Mix");

    await test.step("Reload custom mix", async () => {
      await page.reload();
      await acceptConsent(page);
      await expect(page.getByTestId(`mix-chip-${id}`)).toBeVisible();
    });

    await test.step("Select custom mix and show more button", async () => {
      await page.getByTestId(`mix-chip-${id}`).click();
      await expect(page.getByTestId(`mix-more-${id}`)).toBeVisible();
      await expect(page.getByTestId(`mix-more-${id}`)).toHaveAttribute("aria-expanded", "false");
    });

    await test.step("Open split menu and verify items", async () => {
      await page.getByTestId(`mix-more-${id}`).click();
      await expect(page.getByTestId(`mix-more-${id}`)).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByTestId(`mix-menu-${id}`)).toBeVisible();
      await expect(page.getByTestId(`mix-edit-${id}`)).toBeVisible();
      await expect(page.getByTestId(`mix-copy-${id}`)).toBeVisible();
      await expect(page.getByTestId(`mix-request-delete-${id}`)).toBeVisible();
    });
  });
});
