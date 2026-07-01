import type { DiceConfiguration } from "../schemas/configuration.js";

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
      moods: ["romantic", "playful", "custom"]
    },
    {
      id: "massage",
      label: "Massieren",
      instructionTemplate: "Massiere {zone.accusative}.",
      zoneMode: "required",
      iconKey: "massage",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "stroke",
      label: "Streicheln",
      instructionTemplate: "Streichle {zone.accusative} langsam und aufmerksam.",
      zoneMode: "required",
      iconKey: "touch",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "whisper",
      label: "Flüstern",
      instructionTemplate: "Flüstere ein ehrliches Kompliment nahe bei {zone.accusative}.",
      zoneMode: "optional",
      iconKey: "whisper",
      enabled: true,
      moods: ["romantic", "playful", "custom"]
    },
    {
      id: "surprise",
      label: "Überraschen",
      instructionTemplate: "Überrasche dein Gegenüber mit einer zärtlichen Idee für {zone.accusative}.",
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
      moods: moods.slice()
    },
    {
      id: "compliment",
      label: "Kompliment",
      instructionTemplate: "Sag etwas Schönes über {zone.accusative}.",
      zoneMode: "optional",
      iconKey: "heart",
      enabled: true,
      moods: ["romantic", "custom"]
    },
    {
      id: "pause",
      label: "Innehalten",
      instructionTemplate: "Haltet kurz inne und fragt einander, was gerade gut tut.",
      zoneMode: "ignore",
      iconKey: "pause",
      enabled: true,
      moods: ["romantic", "bold", "custom"]
    }
  ],
  zones: [
    {
      id: "lips",
      label: "Lippen",
      forms: { nominative: "die Lippen", accusative: "die Lippen" },
      iconKey: "lips",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "neck",
      label: "Nacken",
      forms: { nominative: "der Nacken", accusative: "den Nacken" },
      iconKey: "neck",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "back",
      label: "Rücken",
      forms: { nominative: "der Rücken", accusative: "den Rücken" },
      iconKey: "back",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "hands",
      label: "Hände",
      forms: { nominative: "die Hände", accusative: "die Hände" },
      iconKey: "hands",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "legs",
      label: "Beine",
      forms: { nominative: "die Beine", accusative: "die Beine" },
      iconKey: "legs",
      enabled: true,
      moods: moods.slice()
    },
    {
      id: "shoulders",
      label: "Schultern",
      forms: { nominative: "die Schultern", accusative: "die Schultern" },
      iconKey: "shoulders",
      enabled: true,
      moods: ["romantic", "playful", "custom"]
    },
    {
      id: "anywhere",
      label: "Nach Absprache",
      forms: { nominative: "überall nach Absprache", accusative: "überall nach Absprache" },
      iconKey: "consent",
      enabled: true,
      moods: moods.slice()
    }
  ]
};
