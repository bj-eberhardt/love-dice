import type { DiceConfiguration } from "@/shared";

const moods = ["romantic", "playful", "bold", "custom"] as const;

export const defaultConfiguration: DiceConfiguration = {
  id: "default",
  name: "Zweisam Standard",
  updatedAt: new Date(0).toISOString(),
  actions: [
    {
      id: "kiss",
      label: "Küssen",
      instructionTemplate: "Küsse {zone.accusative}.",
      zoneMode: "required",
      iconKey: "kiss",
      enabled: true,
      moods: ["romantic", "playful", "custom"],
      allowedZoneIds: ["lips", "neck", "hands", "shoulders", "back", "legs", "anywhere"]
    },
    {
      id: "bite",
      label: "Beiße",
      instructionTemplate: "Beiße vorsichtig {zone.accusative}.",
      zoneMode: "required",
      iconKey: "bite",
      enabled: true,
      moods: ["bold"],
      allowedZoneIds: ["lips", "neck", "hands", "shoulders", "back", "legs", "anywhere"]
    },
    {
      id: "massage",
      label: "Massieren",
      instructionTemplate: "Massiere {zone.accusative}.",
      zoneMode: "required",
      iconKey: "massage",
      enabled: true,
      moods: moods.slice(),
      allowedZoneIds: ["neck", "hands", "shoulders", "back", "legs", "anywhere"]
    },
    {
      id: "stroke",
      label: "Streicheln",
      instructionTemplate: "Streichle {zone.accusative} langsam und aufmerksam.",
      zoneMode: "required",
      iconKey: "touch",
      enabled: true,
      moods: moods.slice(),
      allowedZoneIds: ["lips", "neck", "hands", "shoulders", "back", "legs", "anywhere"]
    },
    {
      id: "whisper",
      label: "Flüstern",
      instructionTemplate: "Flüstere ein ehrliches Kompliment {zone.accusative}.",
      zoneMode: "optional",
      iconKey: "whisper",
      enabled: true,
      moods: ["romantic", "playful", "custom"],
      allowedZoneIds: ["anywhere"]
    },
    {
      id: "surprise",
      label: "Überraschen",
      instructionTemplate:
        "Überrasche dein Gegenüber mit einer zärtlichen Idee für {zone.accusative}.",
      zoneMode: "optional",
      iconKey: "sparkle",
      enabled: true,
      moods: ["playful", "bold", "custom"]
    },
    {
      id: "wish",
      label: "Wunsch erfüllen",
      instructionTemplate: "Erfülle einen gemeinsamen Wunsch nach Absprache.",
      zoneMode: "ignore",
      iconKey: "wish",
      enabled: true,
      moods: moods.slice(),
      allowedZoneIds: ["anywhere"]
    },
    {
      id: "compliment",
      label: "Kompliment",
      instructionTemplate: "Sag etwas Schönes über {zone.accusative}.",
      zoneMode: "optional",
      iconKey: "heart",
      enabled: true,
      moods: ["romantic", "custom"],
      allowedZoneIds: ["lips", "neck", "hands", "shoulders", "back", "legs", "anywhere"]
    },
    {
      id: "pause",
      label: "Innehalten",
      instructionTemplate: "Haltet kurz inne und fragt einander, was gerade gut tut.",
      zoneMode: "ignore",
      iconKey: "pause",
      enabled: true,
      moods: ["romantic", "bold", "custom"],
      allowedZoneIds: ["anywhere"]
    }
  ],
  zones: [
    {
      id: "lips",
      label: "Lippen",
      accusative: "die Lippen",
      iconKey: "lips",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "neck",
      label: "Nacken",
      accusative: "den Nacken",
      iconKey: "neck",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "back",
      label: "Rücken",
      accusative: "den Rücken",
      iconKey: "back",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "hands",
      label: "Hände",
      accusative: "die Hände",
      iconKey: "hands",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "legs",
      label: "Beine",
      accusative: "die Beine",
      iconKey: "legs",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "shoulders",
      label: "Schultern",
      accusative: "die Schultern",
      iconKey: "shoulders",
      enabled: true,
      moods: ["romantic", "playful", "custom"]
    },
    {
      id: "anywhere",
      label: "Nach Absprache",
      accusative: "überall nach Absprache",
      iconKey: "consent",
      enabled: true,
      moods: moods.slice()
    }
  ]
};
