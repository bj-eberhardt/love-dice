import { test, expect } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";
import { acceptConsent, createCustomMix, openMixModal } from "./helpers";
import { DiceConfiguration, Zone } from "../../src/shared";

test.describe("custom mixes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("love-dice-custom-mixes"));
    await acceptConsent(page);
  });

  test("open mix modal", async ({ page }) => {
    await test.step("Open mix modal via button", async () => {
      const openBtn = page.getByTestId("open-mix-modal");
      await openBtn.waitFor({ state: "visible", timeout: 10000 });
      await openBtn.scrollIntoViewIfNeeded();
      await openBtn.click();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });

  test("create mix via helper and open it", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    // reload to let app read new localStorage
    await page.reload();
    await acceptConsent(page);

    await test.step("Open created mix via UI", async () => {
      // open the created mix via UI (click its chip)
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      // verify the mix data is loaded
      await test.step("Verify name", async () => {
        await expect(page.getByTestId("mix-name")).toHaveValue(name);
      });

      // Actions: ensure 6 cards exist and expand each to reveal its input
      const actionCards = page.locator('[data-testid^="card-actions-"]');
      await expect(actionCards).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        await test.step(`Expand action ${i}`, async () => {
          const card = actionCards.nth(i);
          // click the summary to reveal the input field
          await card.locator("button.card-summary").click();
          // prefer the text input (exclude the checkbox toggle)
          const name = card.getByTestId(`input-label-actions-action-${i}`);
          await expect(name).toHaveValue(`Action ${i + 1}`);

          const description = card.getByTestId(`input-action-action-${i}`);
          await expect(description).toHaveValue("Probiert {ort|akkusativ} nach Absprache aus");
        });
      }

      // Zones: same approach
      const zoneCards = page.locator('[data-testid^="card-zones-"]');
      await expect(zoneCards).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        await test.step(`Expand zone ${i}`, async () => {
          const card = zoneCards.nth(i);
          await card.locator("button.card-summary").click();
          const name = card.getByTestId(`input-label-zones-zone-${i}`);
          await expect(name).toHaveValue(`Zone ${i + 1}`);

          const description = card.getByTestId(`input-zone-zone-${i}`);
          await expect(description).toHaveValue(`die Zone ${i + 1}`);
          const dative = card.getByTestId(`input-zone-dative-zone-${i}`);
          await expect(dative).toHaveValue(`der Zone ${i + 1}`);
        });
      }
    });
  });

  test("validation: requires at least 6 enabled actions and zones", async ({ page }) => {
    await openMixModal(page);

    await test.step("Disable items until less than 6 and attempt save", async () => {
      const actionToggles = page.locator('[data-testid^="toggle-actions-"]');
      const zoneToggles = page.locator('[data-testid^="toggle-zones-"]');

      // disable actions until only 5 enabled remain
      for (let i = (await actionToggles.count()) - 1; i >= 0; i--) {
        const toggle = actionToggles.nth(i);
        if (await toggle.isChecked()) {
          const enabledCount = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-testid^="toggle-actions-"]')).filter(
              (el: HTMLInputElement) => el.checked
            ).length;
          });
          if (enabledCount <= 5) break;
          await toggle.click();
        }
      }

      // disable zones until only 5 enabled remain
      for (let i = (await zoneToggles.count()) - 1; i >= 0; i--) {
        const toggle = zoneToggles.nth(i);
        if (await toggle.isChecked()) {
          const enabledCount = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[data-testid^="toggle-zones-"]')).filter(
              (el: HTMLInputElement) => el.checked
            ).length;
          });
          if (enabledCount <= 5) break;
          await toggle.click();
        }
      }

      await page.getByTestId("mix-save").click();
      await expect(page.locator(".form-warning")).toBeVisible();
    });
  });

  test("edit tiles: rename, add, remove and persist", async ({ page }) => {
    // create a dedicated mix so item ids are predictable
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    // open the saved mix via UI
    await test.step("Open custom mix", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });

    const renamedTest = name + "_rename";
    await test.step("Rename mix", async () => {
      await page.getByTestId("mix-name").fill(renamedTest);
    });

    await test.step("Add a new action and zone", async () => {
      await page.getByTestId("add-actions").click();
      await page.getByTestId("add-zones").click();
      const newAction = page.locator('[data-testid^="card-actions-"]').last();
      await expect(newAction).toBeVisible();
    });

    await test.step("Rename first action", async () => {
      await page.getByTestId("card-summary-actions-action-0").click();
      await page.getByTestId("input-label-actions-action-0").fill("E2E Action Name");
      await page.getByTestId(`input-action-action-0`).fill("E2E Action Description");
    });

    await test.step("Rename first zone", async () => {
      await page.getByTestId("card-summary-zones-zone-0").click();
      await page.getByTestId("input-label-zones-zone-0").fill("E2E Zone Name");
      await page.getByTestId(`input-zone-zone-0`).fill("die E2E Zone");
      await page.getByTestId(`input-zone-dative-zone-0`).fill("der E2E Zone");
    });

    await test.step("Remove second action", async () => {
      await page.getByTestId(`remove-actions-action-1`).click();
    });

    await test.step("Disable second zone", async () => {
      await page.getByTestId(`toggle-zones-zone-1`).click();
    });

    await test.step("Set dative form for newly added zone", async () => {
      const lastZoneItem = page.locator('[data-testid^="card-zones-"]').last();
      await lastZoneItem.click();
      await lastZoneItem.locator('[data-testid^="input-zone-dative-zone"]').fill("die neue Zone");
    });

    await test.step("Save the mix", async () => {
      await page.getByTestId("mix-save").click();
      await expect(page.getByTestId("mix-modal")).toHaveCount(0);
    });

    await test.step("Reload mix and verify changes persisted", async () => {
      // reopen the mix from chip to verify changes were saved
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      await test.step("Verify new mix name", async () => {
        await expect(page.getByTestId("mix-name")).toHaveValue(renamedTest);
      });

      await test.step("Expand and verify first action", async () => {
        await page.getByTestId("card-summary-actions-action-0").click();
        await expect(page.getByTestId(`input-label-actions-action-0`)).toHaveValue(
          "E2E Action Name"
        );
        await expect(page.getByTestId(`input-action-action-0`)).toHaveValue(
          "E2E Action Description {ort|akkusativ}"
        );
      });

      await test.step("Expand and verify first zone", async () => {
        await page.getByTestId("card-summary-zones-zone-0").click();
        await expect(page.getByTestId(`input-label-zones-zone-0`)).toHaveValue("E2E Zone Name");
        await expect(page.getByTestId(`input-zone-zone-0`)).toHaveValue("die E2E Zone");
        await expect(page.getByTestId(`input-zone-dative-zone-0`)).toHaveValue("der E2E Zone");
      });

      await test.step("Verify disabled zone", async () => {
        await expect(page.getByTestId(`toggle-zones-zone-1`)).not.toBeChecked();
      });

      await test.step("Verify actions items count", async () => {
        const actionItems = page.locator('[data-testid^="toggle-actions-"]');
        expect(await actionItems.all()).toHaveLength(6); // 6 total, but one was removed
      });

      const exportedJsonContent = await test.step("Export JSON", async () => {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.getByTestId("mix-export").click()
        ]);
        const savePath = path.join(os.tmpdir(), `e2e-verify-${Date.now()}.json`);
        await download.saveAs(savePath);
        expect(fs.existsSync(savePath)).toBeTruthy();

        // parse and verify JSON contains the edited values
        const jsonContent = fs.readFileSync(savePath, "utf-8");
        fs.unlinkSync(savePath);
        return JSON.parse(jsonContent);
      });
      // export to JSON and verify structure

      await test.step("Verify exported JSON", async () => {
        expect(exportedJsonContent.actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "action-0",
              label: "E2E Action Name"
            })
          ])
        );

        expect(exportedJsonContent.zones).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "zone-0",
              label: "E2E Zone Name"
            }),
            expect.objectContaining({
              id: "zone-1",
              enabled: false
            })
          ])
        );
      });
    });
  });

  test("export and import mix", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open saved mix via UI", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });

    const savePath = await test.step("Export mix to file", async () => {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByTestId("mix-export").click()
      ]);
      const savePath = path.join(os.tmpdir(), `e2e-mix-${Date.now()}.json`);
      await download.saveAs(savePath);
      expect(fs.existsSync(savePath)).toBeTruthy();
      await page.getByTestId("mix-close").click();
      await expect(page.getByTestId("mix-modal")).toHaveCount(0);
      return savePath;
    });

    await test.step("Import mix from file", async () => {
      await openMixModal(page);
      await page.setInputFiles('[data-testid="mix-import-input"]', savePath);
    });

    await test.step("Verify correct data imported", async () => {
      await page.waitForSelector('[data-testid^="card-summary-actions-"]', {
        state: "visible",
        timeout: 5000
      });
      const actionSummaries = page.locator('[data-testid^="card-summary-actions-"]');
      await expect(actionSummaries).toHaveCount(6);
      const actionTexts = await actionSummaries.allTextContents();
      for (let i = 0; i < 6; i++) {
        expect(actionTexts.some((t) => t.includes(`Action ${i + 1}`))).toBeTruthy();
      }

      await page.waitForSelector('[data-testid^="card-summary-zones-"]', {
        state: "visible",
        timeout: 5000
      });
      const zoneSummaries = page.locator('[data-testid^="card-summary-zones-"]');
      await expect(zoneSummaries).toHaveCount(6);
      const zoneTexts = await zoneSummaries.allTextContents();
      for (let i = 0; i < 6; i++) {
        expect(zoneTexts.some((t) => t.includes(`Zone ${i + 1}`))).toBeTruthy();
      }

      await expect(page.getByTestId("mix-name")).toHaveValue(new RegExp(name));
      await page.getByTestId("mix-name").fill(name + " Imported");
      await page.getByTestId("mix-save").click();
      await expect(page.getByTestId("mix-modal")).toHaveCount(0);
    });
  });

  test("delete mix", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open original mix via UI and delete", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("mix-delete").click();
    });

    await test.step("Confirm deletion", async () => {
      await page.getByTestId("confirm-confirm").click();
      await expect(page.getByTestId("mix-modal")).toHaveCount(0);
    });

    await test.step("Verify the custom mix is removed", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "detached",
        timeout: 10000
      });
    });
  });

  test("delete mix but cancel dialog", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open original mix via UI and delete", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("mix-delete").click();
    });

    await test.step("Do not confirm deletion", async () => {
      await page.getByTestId("confirm-cancel").click();
    });

    await test.step("Close dialog and check if mix still there", async () => {
      await page.getByTestId("mix-close").click();

      await expect(page.getByTestId("mix-modal")).toHaveCount(0);
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
    });
  });

  test("validation: action label cannot be empty", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and clear action label", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      // Expand first action and clear label
      await page.getByTestId("card-summary-actions-action-0").click();
      await page.getByTestId("input-label-actions-action-0").fill("");

      // Try to save
      await page.getByTestId("mix-save").click();

      // Should show validation error
      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });

  test("validation: action instructionTemplate cannot be empty", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and clear action instruction", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      // Expand first action and clear instruction
      await page.getByTestId("card-summary-actions-action-0").click();
      await page.getByTestId("input-action-action-0").fill("");

      // Try to save
      await page.getByTestId("mix-save").click();

      // Should show validation error
      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });

  test("validation: zone label cannot be empty", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and clear zone label", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      // Expand first zone and clear label
      await page.getByTestId("card-summary-zones-zone-0").click();
      await page.getByTestId("input-label-zones-zone-0").fill("");

      // Try to save
      await page.getByTestId("mix-save").click();

      // Should show validation error
      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });

  test("validation: zone accusative cannot be empty", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and clear zone accusative", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      // Expand first zone and clear accusative
      await page.getByTestId("card-summary-zones-zone-0").click();
      await page.getByTestId("input-zone-zone-0").fill("");

      // Try to save
      await page.getByTestId("mix-save").click();

      // Should show validation error
      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });

  test("validation: zone dative cannot be empty", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and clear zone dative", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      await page.getByTestId("card-summary-zones-zone-0").click();
      await page.getByTestId("input-zone-dative-zone-0").fill("");

      await page.getByTestId("mix-save").click();

      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });

  test("zone dative is required but auto-filled from accusative for new plural zones", async ({
    page
  }) => {
    await openMixModal(page);

    let newZoneId = "";
    await test.step("Add zone with empty dative default", async () => {
      await page.getByTestId("add-zones").click();
      const newZoneCard = page.locator('[data-testid^="card-zones-"]').last();
      const testId = await newZoneCard.getAttribute("data-testid");
      newZoneId = testId?.replace("card-zones-", "") ?? "";
      expect(newZoneId).toBeTruthy();
      await expect(newZoneCard.getByTestId(`input-zone-dative-${newZoneId}`)).toHaveValue("");
    });

    await test.step("Saving with empty dative shows a validation error", async () => {
      await page.getByTestId("mix-save").click();
      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });

    await test.step("Fill accusative and verify plural dative suggestion", async () => {
      const newZoneCard = page.getByTestId(`card-zones-${newZoneId}`);
      await newZoneCard.getByTestId(`input-zone-${newZoneId}`).fill("die Testzonen");
      await expect(newZoneCard.getByTestId(`input-zone-dative-${newZoneId}`)).toHaveValue(
        "den Testzonen"
      );
    });

    await test.step("Save and verify generated dative persisted", async () => {
      await page.getByTestId("mix-save").click();
      await expect(page.getByTestId("mix-modal")).toHaveCount(0);
      const savedMix = await page.evaluate(() => {
        const mixes = JSON.parse(
          localStorage.getItem("love-dice-custom-mixes") || "[]"
        ) as DiceConfiguration[];
        return mixes.find((mix: DiceConfiguration) => mix.name === "Neue Mischung");
      });
      const savedZone = savedMix.zones.find((zone: Zone) => zone.id === newZoneId);
      expect(savedZone.text.de).toEqual({ accusative: "die Testzonen", dative: "den Testzonen" });
    });
  });

  test("validation: only-whitespace fields are treated as empty", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and fill action label with whitespace only", async () => {
      await page.waitForSelector(`[data-testid="mix-chip-${id}"]`, {
        state: "visible",
        timeout: 10000
      });
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();

      // Expand first action and fill with spaces
      await page.getByTestId("card-summary-actions-action-0").click();
      await page.getByTestId("input-label-actions-action-0").fill("   ");

      // Try to save
      await page.getByTestId("mix-save").click();

      // Should show validation error
      await expect(page.locator(".form-warning")).toBeVisible();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
    });
  });
  test("zone selector: select and remove zones", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and first action card", async () => {
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("card-summary-actions-action-0").click();
    });

    await test.step("Select two allowed zones", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await expect(card.locator(".zone-selector")).toHaveAttribute("data-selection-state", "all");
      await card.getByTestId("zone-selector-input").click();
      await expect(card.getByTestId("zone-option-zone-0")).toBeVisible();
      await card.getByTestId("zone-option-zone-0").click();
      await card.getByTestId("zone-option-zone-1").click();
      await expect(card.getByTestId("zone-option-checkbox-zone-0")).toBeChecked();
      await expect(card.getByTestId("zone-option-checkbox-zone-1")).toBeChecked();
      await expect(card.getByTestId("zone-chip-zone-0")).toBeVisible();
      await expect(card.getByTestId("zone-chip-zone-1")).toBeVisible();
    });

    await test.step("Remove one selected zone via chip", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await card.getByTestId("zone-chip-remove-zone-0").click();
      await expect(card.locator(".zone-chip")).toHaveCount(1);
      await expect(card.getByTestId("zone-chip-zone-1")).toBeVisible();
    });
  });

  test("zone selector: select all and clear all", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and first action selector", async () => {
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("card-summary-actions-action-0").click();
      await page.getByTestId("card-actions-action-0").getByTestId("zone-selector-input").click();
    });

    await test.step("Select all available zones", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await card.getByTestId("zone-selector-all").click();
      await expect(card.locator(".zone-chip")).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        await expect(card.getByTestId(`zone-chip-zone-${i}`)).toBeVisible();
      }
    });

    await test.step("Clear all selected zones", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await expect(card.locator(".zone-selector-dropdown")).toBeVisible();
      await card.getByTestId("zone-selector-clear").click();
      await expect(card.locator(".zone-chip")).toHaveCount(0);
      await expect(card.locator(".zone-selector")).toHaveAttribute("data-selection-state", "all");
    });
  });

  test("zone selector: closes on Escape and outside click", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and first action selector", async () => {
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("card-summary-actions-action-0").click();
      await page.getByTestId("card-actions-action-0").getByTestId("zone-selector-input").click();
      await expect(
        page.getByTestId("card-actions-action-0").locator(".zone-selector-dropdown")
      ).toBeVisible();
    });

    await test.step("Close dropdown with Escape", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await page.keyboard.press("Escape");
      await expect(card.locator(".zone-selector-dropdown")).toHaveCount(0);
    });

    await test.step("Close dropdown with outside click", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await card.getByTestId("zone-selector-input").click();
      await expect(card.locator(".zone-selector-dropdown")).toBeVisible();
      await page.getByTestId("mix-name").click();
      await expect(card.locator(".zone-selector-dropdown")).toHaveCount(0);
    });
  });

  test("zone selector: dynamically added and renamed zones appear immediately", async ({
    page
  }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and first action card", async () => {
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("card-summary-actions-action-0").click();
    });

    await test.step("Add a new zone in the same modal", async () => {
      await page.getByTestId("add-zones").click();
      await expect(page.locator('[data-testid^="card-zones-"]')).toHaveCount(7);
    });

    let newZoneId = "";
    await test.step("Read the generated zone id and rename the new zone", async () => {
      const newZoneCard = page.locator('[data-testid^="card-zones-"]').last();
      const testId = await newZoneCard.getAttribute("data-testid");
      newZoneId = testId?.replace("card-zones-", "") ?? "";
      expect(newZoneId).toBeTruthy();
      await newZoneCard.getByTestId(`input-label-zones-${newZoneId}`).fill("E2E Dynamic Zone");
    });

    await test.step("Verify the new zone is immediately available in the action selector", async () => {
      const actionCard = page.getByTestId("card-actions-action-0");
      await actionCard.getByTestId("zone-selector-input").click();
      await expect(actionCard.getByTestId(`zone-option-${newZoneId}`)).toHaveAttribute(
        "data-zone-label",
        "E2E Dynamic Zone"
      );
    });

    await test.step("Select the new zone and verify chip label follows the rename", async () => {
      const actionCard = page.getByTestId("card-actions-action-0");
      await actionCard.getByTestId(`zone-option-${newZoneId}`).click();
      await expect(actionCard.getByTestId(`zone-chip-${newZoneId}`)).toHaveAttribute(
        "data-zone-label",
        "E2E Dynamic Zone"
      );

      await page.getByTestId(`input-label-zones-${newZoneId}`).fill("E2E Renamed Dynamic Zone");
      await expect(actionCard.getByTestId(`zone-chip-${newZoneId}`)).toHaveAttribute(
        "data-zone-label",
        "E2E Renamed Dynamic Zone"
      );

      await page.keyboard.press("Escape");
      await expect(actionCard.locator(".zone-selector-dropdown")).toHaveCount(0);

      await actionCard.getByTestId("zone-selector-input").click();
      await expect(actionCard.getByTestId(`zone-option-${newZoneId}`)).toHaveAttribute(
        "data-zone-label",
        "E2E Renamed Dynamic Zone"
      );
    });
  });

  test("zone selector: empty selection means all zones allowed after save", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name);
    await page.reload();
    await acceptConsent(page);

    await test.step("Open mix and first action card", async () => {
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("card-summary-actions-action-0").click();
    });

    await test.step("Select and then remove the only allowed zone", async () => {
      const card = page.getByTestId("card-actions-action-0");
      await card.getByTestId("zone-selector-input").click();
      await card.getByTestId("zone-option-zone-0").click();
      await card.getByTestId("zone-chip-remove-zone-0").click();
      await expect(card.locator(".zone-selector")).toHaveAttribute("data-selection-state", "all");
    });

    await test.step("Save mix and verify allowedZoneIds is undefined", async () => {
      await page.getByTestId("mix-save").click();
      const savedMix = await page.evaluate((mixId) => {
        const mixes = JSON.parse(
          localStorage.getItem("love-dice-custom-mixes") || "[]"
        ) as DiceConfiguration[];
        return mixes.find((mix: DiceConfiguration) => mix.id === mixId);
      }, id);
      expect(savedMix.actions[0].allowedZoneIds).toBeUndefined();
    });
  });

  test("zone selector: orphaned zone ids are removed on save", async ({ page }) => {
    const name = `E2E Mix ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const id = await createCustomMix(page, name, (mix) => {
      mix.actions[0].allowedZoneIds = ["zone-0", "missing-zone"];
      mix.zones.push({
        id: "zone-extra",
        label: "Extra Zone",
        text: { de: { accusative: "die Extra Zone", dative: "der Extra Zone" } },
        iconKey: "consent",
        enabled: true,
        moods: ["custom"]
      });
    });

    await test.step("Reload seeded mix", async () => {
      await page.reload();
      await acceptConsent(page);
    });

    await test.step("Open mix and remove the remaining valid selected zone", async () => {
      await page.getByTestId(`mix-chip-${id}`).dblclick();
      await expect(page.getByTestId("mix-modal")).toBeVisible();
      await page.getByTestId("remove-zones-zone-0").click();
    });

    await test.step("Save mix and verify allowedZoneIds is undefined", async () => {
      await page.getByTestId("mix-save").click();
      const savedMix = await page.evaluate((mixId) => {
        const mixes = JSON.parse(
          localStorage.getItem("love-dice-custom-mixes") || "[]"
        ) as DiceConfiguration[];
        return mixes.find((mix: DiceConfiguration) => mix.id === mixId);
      }, id);
      expect(savedMix.actions[0].allowedZoneIds).toBeUndefined();
    });
  });
});
