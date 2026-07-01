import type { DiceAction, DiceConfiguration, Mood, Zone } from "@/shared";

const allMoods: Mood[] = ["romantic", "playful", "bold", "custom"];

type ActionInput = Omit<DiceAction, "enabled" | "moods" | "useInCustom"> & {
  useInCustom?: boolean;
};
type ZoneInput = Omit<Zone, "enabled" | "moods" | "useInCustom"> & { useInCustom?: boolean };

const action = (entry: ActionInput): DiceAction => ({
  ...entry,
  enabled: true,
  moods: allMoods,
  useInCustom: entry.useInCustom ?? true
});

const zone = (entry: ZoneInput): Zone => ({
  ...entry,
  enabled: true,
  moods: allMoods,
  useInCustom: entry.useInCustom ?? true
});

export const actionsById = {
  kiss: action({
    id: "kiss",
    label: "Küssen",
    instructionTemplate: "Küsse {zone.accusative}.",
    zoneMode: "required",
    iconKey: "kiss",
    allowedZoneIds: [
      "lips",
      "neck",
      "hands",
      "shoulders",
      "back",
      "legs",
      "ear",
      "nipple",
      "breasts",
      "genitals",
      "butt",
      "thighs",
      "anywhere"
    ]
  }),
  bite: action({
    id: "bite",
    label: "Beißen",
    instructionTemplate: "Beiße vorsichtig in {zone.accusative}.",
    zoneMode: "required",
    iconKey: "bite",
    allowedZoneIds: [
      "lips",
      "neck",
      "hands",
      "shoulders",
      "back",
      "legs",
      "ear",
      "nipple",
      "thighs",
      "breasts",
      "butt",
      "anywhere"
    ]
  }),
  massage: action({
    id: "massage",
    label: "Massieren",
    instructionTemplate: "Massiere {zone.accusative}.",
    zoneMode: "required",
    iconKey: "massage",
    allowedZoneIds: [
      "neck",
      "hands",
      "shoulders",
      "back",
      "legs",
      "thighs",
      "breasts",
      "butt",
      "genitals",
      "anywhere"
    ]
  }),
  stroke: action({
    id: "stroke",
    label: "Streicheln",
    instructionTemplate: "Streichle {zone.accusative} langsam und aufmerksam.",
    zoneMode: "required",
    iconKey: "touch",
    allowedZoneIds: [
      "lips",
      "neck",
      "back",
      "hands",
      "legs",
      "shoulders",
      "ear",
      "nipple",
      "thighs",
      "breasts",
      "genitals",
      "butt",
      "anywhere"
    ]
  }),
  whisper: action({
    id: "whisper",
    label: "Flüstern",
    instructionTemplate: "Flüstere ein ehrliches Kompliment {zone.accusative}.",
    zoneMode: "optional",
    iconKey: "whisper",
    allowedZoneIds: ["ear", "neck", "anywhere"]
  }),
  surprise: action({
    id: "surprise",
    label: "Überraschen",
    instructionTemplate:
      "Überrasche dein Gegenüber mit einer zärtlichen Idee für {zone.accusative}.",
    zoneMode: "optional",
    iconKey: "sparkle"
  }),
  wish: action({
    id: "wish",
    label: "Wunsch erfüllen",
    instructionTemplate: "Erfülle einen gemeinsamen Wunsch nach Absprache.",
    zoneMode: "ignore",
    iconKey: "wish",
    allowedZoneIds: ["anywhere"]
  }),
  compliment: action({
    id: "compliment",
    label: "Kompliment",
    instructionTemplate: "Sag etwas Schönes über {zone.accusative}.",
    zoneMode: "optional",
    iconKey: "heart"
  }),
  pause: action({
    id: "pause",
    label: "Innehalten",
    instructionTemplate: "Haltet kurz inne und fragt einander, was gerade gut tut.",
    zoneMode: "ignore",
    iconKey: "pause",
    allowedZoneIds: ["anywhere"]
  }),
  tickle: action({
    id: "tickle",
    label: "Kitzeln",
    instructionTemplate: "Kitzle {zone.accusative} spielerisch.",
    zoneMode: "required",
    iconKey: "tickle",
    allowedZoneIds: [
      "neck",
      "hands",
      "legs",
      "thighs",
      "back",
      "ear",
      "shoulders",
      "butt",
      "anywhere"
    ]
  }),
  rub: action({
    id: "rub",
    label: "Reiben",
    instructionTemplate: "Reibe {zone.accusative} langsam nach Absprache.",
    zoneMode: "required",
    iconKey: "rub",
    useInCustom: false,
    allowedZoneIds: [
      "back",
      "legs",
      "thighs",
      "breasts",
      "butt",
      "genitals",
      "neck",
      "hands",
      "nipple",
      "anywhere"
    ]
  }),
  seduce: action({
    id: "seduce",
    label: "Verführen",
    instructionTemplate: "Verführe dein Gegenüber mit Fokus auf {zone.accusative}.",
    zoneMode: "optional",
    iconKey: "seduce",
    allowedZoneIds: [
      "lips",
      "neck",
      "ear",
      "nipple",
      "thighs",
      "breasts",
      "genitals",
      "butt",
      "anywhere"
    ]
  }),
  smell: action({
    id: "smell",
    label: "Riechen",
    instructionTemplate: "Rieche aufmerksam. Konzentration auf {zone.accusative}.",
    zoneMode: "required",
    iconKey: "smell",
    allowedZoneIds: [
      "neck",
      "hands",
      "breasts",
      "thighs",
      "lips",
      "ear",
      "nipple",
      "butt",
      "anywhere"
    ]
  }),
  suck: action({
    id: "suck",
    label: "Saugen",
    instructionTemplate: "Sauge sanft an {zone.accusative}, wenn es für euch beide passt.",
    zoneMode: "required",
    iconKey: "suck",
    useInCustom: false,
    allowedZoneIds: [
      "lips",
      "nipple",
      "breasts",
      "genitals",
      "ear",
      "thighs",
      "anywhere"
    ]
  })
} satisfies Record<string, DiceAction>;

export const zonesById = {
  lips: zone({ id: "lips", label: "Lippen", accusative: "die Lippen", iconKey: "lips" }),
  neck: zone({ id: "neck", label: "Nacken", accusative: "den Nacken", iconKey: "neck" }),
  back: zone({ id: "back", label: "Rücken", accusative: "den Rücken", iconKey: "back" }),
  hands: zone({ id: "hands", label: "Hände", accusative: "die Hände", iconKey: "hands" }),
  legs: zone({ id: "legs", label: "Beine", accusative: "die Beine", iconKey: "legs" }),
  shoulders: zone({
    id: "shoulders",
    label: "Schultern",
    accusative: "die Schultern",
    iconKey: "shoulders"
  }),
  anywhere: zone({
    id: "anywhere",
    label: "Nach Absprache",
    accusative: "überall nach Absprache",
    iconKey: "consent"
  }),
  ear: zone({ id: "ear", label: "Ohr", accusative: "das Ohr", iconKey: "ear" }),
  nipple: zone({
    id: "nipple",
    label: "Nippel",
    accusative: "den Nippel",
    iconKey: "nipple",
    useInCustom: false
  }),
  thighs: zone({
    id: "thighs",
    label: "Schenkel",
    accusative: "die Schenkel",
    iconKey: "thighs"
  }),
  breasts: zone({
    id: "breasts",
    label: "Brüste",
    accusative: "die Brüste",
    iconKey: "breasts"
  }),
  genitals: zone({
    id: "genitals",
    label: "Geschlechtsteil",
    accusative: "das Geschlechtsteil",
    iconKey: "genitals"
  }),
  butt: zone({
    id: "butt",
    label: "Hintern",
    accusative: "den Hintern",
    iconKey: "butt",
    useInCustom: false
  })
} satisfies Record<string, Zone>;

type ActionId = keyof typeof actionsById;
type ZoneId = keyof typeof zonesById;

const pickActions = (ids: ActionId[], mood: Exclude<Mood, "custom">) =>
  ids.map((id) => ({ ...actionsById[id], moods: [mood] }));
const pickZones = (ids: ZoneId[], mood: Exclude<Mood, "custom">) =>
  ids.map((id) => ({ ...zonesById[id], moods: [mood] }));

const config = (
  id: Exclude<Mood, "custom">,
  name: string,
  actions: ActionId[],
  zones: ZoneId[]
): DiceConfiguration => ({
  id,
  name,
  updatedAt: new Date(0).toISOString(),
  actions: pickActions(actions, id),
  zones: pickZones(zones, id)
});

export const builtInConfigurations: Record<Exclude<Mood, "custom">, DiceConfiguration> = {
  romantic: config(
    "romantic",
    "Romantisch",
    ["kiss", "massage", "stroke", "whisper", "wish", "compliment", "pause", "surprise"],
    ["lips", "neck", "back", "hands", "legs", "shoulders", "ear", "anywhere"]
  ),
  playful: config(
    "playful",
    "Verspielt",
    ["kiss", "massage", "stroke", "whisper", "surprise", "wish", "tickle", "compliment"],
    ["lips", "neck", "back", "hands", "legs", "shoulders", "ear", "anywhere"]
  ),
  bold: config(
    "bold",
    "Mutig",
    ["kiss", "bite", "massage", "stroke", "surprise", "rub", "seduce", "smell", "suck", "pause"],
    [
      "lips",
      "neck",
      "back",
      "hands",
      "legs",
      "ear",
      "nipple",
      "thighs",
      "breasts",
      "genitals",
      "butt",
      "anywhere"
    ]
  )
};

export const defaultConfiguration = builtInConfigurations.romantic;
