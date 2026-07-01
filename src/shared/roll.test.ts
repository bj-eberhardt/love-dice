import { describe, expect, test } from "vitest";

import { createRoll, type DiceConfiguration } from "@/shared";

const testConfig: DiceConfiguration = {
  id: "ignore-zone-test",
  name: "Ignore Zone Test",
  updatedAt: new Date(0).toISOString(),
  actions: Array.from({ length: 6 }, (_, index) => ({
    id: `wish-${index}`,
    label: "Wunsch erfüllen",
    instructionTemplate: "Erfülle einen gemeinsamen Wunsch nach Absprache.",
    zoneMode: "ignore" as const,
    iconKey: "wish" as const,
    enabled: true,
    moods: ["romantic" as const],
    useInCustom: true,
    allowedZoneIds: ["anywhere"]
  })),
  zones: [
    {
      id: "back",
      label: "Rücken",
      accusative: "den Rücken",
      iconKey: "back",
      enabled: true,
      moods: ["romantic"],
      useInCustom: true
    },
    {
      id: "lips",
      label: "Lippen",
      accusative: "die Lippen",
      iconKey: "lips",
      enabled: true,
      moods: ["romantic"],
      useInCustom: true
    },
    {
      id: "neck",
      label: "Nacken",
      accusative: "den Nacken",
      iconKey: "neck",
      enabled: true,
      moods: ["romantic"],
      useInCustom: true
    },
    {
      id: "hands",
      label: "Hände",
      accusative: "die Hände",
      iconKey: "hands",
      enabled: true,
      moods: ["romantic"],
      useInCustom: true
    },
    {
      id: "legs",
      label: "Beine",
      accusative: "die Beine",
      iconKey: "legs",
      enabled: true,
      moods: ["romantic"],
      useInCustom: true
    },
    {
      id: "anywhere",
      label: "Nach Absprache",
      accusative: "überall nach Absprache",
      iconKey: "consent",
      enabled: true,
      moods: ["romantic"],
      useInCustom: true
    }
  ]
};

describe("createRoll", () => {
  test("respects allowed zones for zoneMode ignore actions", () => {
    const roll = createRoll(testConfig, "romantic", () => 0);

    expect(roll.action.id).toMatch(/^wish-/);
    expect(roll.zone.id).toBe("anywhere");
  });
});
