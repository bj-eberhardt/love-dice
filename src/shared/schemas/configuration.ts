import { z } from "zod";

export const moodSchema = z.enum(["romantic", "playful", "bold", "custom"]);
export type Mood = z.infer<typeof moodSchema>;

export const zoneModeSchema = z.enum(["required", "optional", "ignore"]);
export type ZoneMode = z.infer<typeof zoneModeSchema>;

// Validator für nicht-leere trimmed strings
const nonEmptyString = z.string().min(1).trim().refine(
  (val) => val.length > 0,
  { message: "Feld darf nicht leer sein" }
);

export const diceEntrySchema = z.object({
  id: z.string().min(1),
  label: nonEmptyString,
  iconKey: z.string().min(1),
  enabled: z.boolean(),
  moods: z.array(moodSchema).min(1)
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
