import { describe, expect, test } from "vitest";

import type { DiceConfiguration } from "./schemas/configuration";
import { createGermanZoneText, derivePluralDative, withMissingDatives } from "./grammar";

const createConfig = (zones: DiceConfiguration["zones"]): DiceConfiguration => ({
  id: "grammar-config",
  name: "Grammar Config",
  updatedAt: new Date(0).toISOString(),
  actions: [
    {
      id: "action-1",
      label: "Aktion",
      instructionTemplate: "Teste {dative}.",
      zoneMode: "required",
      iconKey: "sparkle",
      enabled: true,
      moods: ["custom"],
      useInCustom: true
    }
  ],
  zones
});

const createZone = (
  id: string,
  accusative: string,
  dative: string
): DiceConfiguration["zones"][number] => ({
  id,
  label: id,
  text: { de: { accusative, dative } },
  iconKey: "consent",
  enabled: true,
  moods: ["custom"],
  useInCustom: true
});

describe("derivePluralDative", () => {
  test("normalizes whitespace before deriving plural dative", () => {
    expect(derivePluralDative("  die   weichen   Lippen  ")).toBe("den weichen Lippen");
  });

  test("adds n to the final plural noun when needed", () => {
    expect(derivePluralDative("die Beine")).toBe("den Beinen");
  });

  test("does not add n when the final word already ends with n or s", () => {
    expect(derivePluralDative("die Hände")).toBe("den Händen");
    expect(derivePluralDative("die Kissen")).toBe("den Kissen");
  });

  test("returns normalized input unchanged for non-die phrases and empty values", () => {
    expect(derivePluralDative(" den   Nacken ")).toBe("den Nacken");
    expect(derivePluralDative("die")).toBe("die");
    expect(derivePluralDative("   ")).toBe("");
  });
});

describe("createGermanZoneText", () => {
  test("derives dative when no explicit dative is provided", () => {
    expect(createGermanZoneText("die Schultern")).toEqual({
      de: { accusative: "die Schultern", dative: "den Schultern" }
    });
  });

  test("keeps an explicit dative unchanged", () => {
    expect(createGermanZoneText("den Rücken", "dem Rücken")).toEqual({
      de: { accusative: "den Rücken", dative: "dem Rücken" }
    });
  });
});

describe("withMissingDatives", () => {
  test("fills only blank German dative forms", () => {
    const config = createConfig([
      createZone("generated", "die Testzonen", "   "),
      createZone("existing", "den Nacken", "dem Nacken")
    ]);

    const normalized = withMissingDatives(config);

    expect(normalized.zones[0].text.de).toEqual({
      accusative: "die Testzonen",
      dative: "den Testzonen"
    });
    expect(normalized.zones[1].text.de).toEqual({
      accusative: "den Nacken",
      dative: "dem Nacken"
    });
  });

  test("preserves the original configuration object and unrelated zone text", () => {
    const config = createConfig([
      {
        ...createZone("generated", "die Arme", ""),
        text: {
          de: { accusative: "die Arme", dative: "" },
          note: "bleibt erhalten"
        } as DiceConfiguration["zones"][number]["text"]
      }
    ]);

    const normalized = withMissingDatives(config);

    expect(normalized).not.toBe(config);
    expect(normalized.zones[0]).not.toBe(config.zones[0]);
    expect(config.zones[0].text.de.dative).toBe("");
    expect(normalized.zones[0].text).toMatchObject({ note: "bleibt erhalten" });
    expect(normalized.zones[0].text.de.dative).toBe("den Armen");
  });
});
