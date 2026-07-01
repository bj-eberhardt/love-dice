import type { Page } from "@playwright/test";
import type { DiceConfiguration } from "../../src/shared/schemas/configuration";

type CustomMixMutator = (mix: DiceConfiguration) => void;

export async function acceptConsent(page: Page) {
  const accept = page.getByTestId("consent-accept");
  if ((await accept.count()) === 0) {
    // No consent dialog present - ensure main UI is visible
    await page.waitForSelector('[data-testid="mode-bar"]', { state: "visible", timeout: 10000 });
    return;
  }
  // Wait for the button to be visible and clickable
  await accept.waitFor({ state: "visible", timeout: 10000 });
  await accept.click();
  // Wait until the main UI (mode bar) is visible as signal consent was applied
  await page.waitForSelector('[data-testid="mode-bar"]', { state: "visible", timeout: 10000 });
}

export function createCustomMix(page: Page, name: string): Promise<string>;
export function createCustomMix(
  page: Page,
  name: string,
  mutate: CustomMixMutator
): Promise<string>;
export async function createCustomMix(page: Page, name: string, mutate?: CustomMixMutator) {
  const rand = Math.random().toString(36).slice(2, 8);
  const mix: DiceConfiguration = {
    id: `mix-${rand}`,
    name,
    updatedAt: new Date().toISOString(),
    actions: Array.from({ length: 6 }).map((_, i) => ({
      id: `action-${i}`,
      label: `Action ${i + 1}`,
      instructionTemplate: "Probiert {zone.accusative} nach Absprache aus.",
      zoneMode: "optional" as const,
      iconKey: "sparkle",
      enabled: true,
      moods: ["custom"] as const
    })),
    zones: Array.from({ length: 6 }).map((_, i) => ({
      id: `zone-${i}`,
      label: `Zone ${i + 1}`,
      accusative: `die Zone ${i + 1}`,
      iconKey: "consent",
      enabled: true,
      moods: ["custom"] as const
    }))
  };

  mutate?.(mix);

  await page.evaluate((m) => {
    const key = "love-dice-custom-mixes";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(m);
    localStorage.setItem(key, JSON.stringify(existing));
  }, mix);

  return mix.id;
}

export async function openMixModal(page: Page) {
  // Try DOM click directly to avoid visibility/overlay flakiness
  await page.evaluate(() => {
    const btn = document.querySelector("button.primary.sticky-add") as HTMLButtonElement | null;
    if (btn) btn.click();
  });
  await page.waitForSelector('[data-testid="mix-modal"]', { state: "visible", timeout: 10000 });
}
