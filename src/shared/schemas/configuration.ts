import { z } from "zod";

export const moodSchema = z.enum(["romantic", "playful", "bold", "custom"]);
export type Mood = z.infer<typeof moodSchema>;

export const zoneModeSchema = z.enum(["required", "optional", "ignore"]);
export type ZoneMode = z.infer<typeof zoneModeSchema>;

const nonEmptyString = z
  .string()
  .min(1)
  .trim()
  .refine((val) => val.length > 0, { message: "Feld darf nicht leer sein" });

export const iconKeySchema = z.enum([
  "anywhere",
  "back",
  "bite",
  "breasts",
  "butt",
  "consent",
  "ear",
  "genitals",
  "hands",
  "heart",
  "kiss",
  "legs",
  "lips",
  "massage",
  "neck",
  "nipple",
  "pause",
  "rub",
  "seduce",
  "shoulders",
  "smell",
  "sparkle",
  "suck",
  "thighs",
  "tickle",
  "touch",
  "whisper",
  "wish"
]);
export type IconKey = z.infer<typeof iconKeySchema>;
export const diceEntrySchema = z.object({
  id: z.string().min(1),
  label: nonEmptyString,
  iconKey: iconKeySchema,
  enabled: z.boolean(),
  moods: z.array(moodSchema).min(1),
  useInCustom: z.boolean().optional().default(true)
});

export const zoneSchema = diceEntrySchema.extend({
  accusative: nonEmptyString
});
export type Zone = z.infer<typeof zoneSchema>;

export const actionSchema = diceEntrySchema.extend({
  instructionTemplate: nonEmptyString,
  zoneMode: zoneModeSchema,
  allowedZoneIds: z.array(z.string()).optional(),
  blockedZoneIds: z.array(z.string()).optional()
});
export type DiceAction = z.infer<typeof actionSchema>;

export const configurationSchema = z.object({
  id: z.string().min(1),
  name: nonEmptyString,
  actions: z.array(actionSchema),
  zones: z.array(zoneSchema),
  updatedAt: z.string()
});
export type DiceConfiguration = z.infer<typeof configurationSchema>;

export type RollFace<T extends DiceAction | Zone> = T & { faceIndex: number };

export interface RollResult {
  actionFaces: RollFace<DiceAction>[];
  zoneFaces: RollFace<Zone>[];
  action: RollFace<DiceAction>;
  zone: RollFace<Zone>;
  instruction: string;
}
