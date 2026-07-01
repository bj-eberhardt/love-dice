import { actionsById, configurationSchema, zonesById, type DiceConfiguration } from "@/shared";

const customMixesKey = "love-dice-custom-mixes";

export const loadCustomMixes = (): DiceConfiguration[] => {
  try {
    const stored = localStorage.getItem(customMixesKey);
    if (!stored) return [];
    return configurationSchema.array().parse(JSON.parse(stored));
  } catch {
    return [];
  }
};

export const saveCustomMixes = (mixes: DiceConfiguration[]) => {
  localStorage.setItem(customMixesKey, JSON.stringify(mixes));
};

export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const normalizeName = (name: string) => name.trim().toLocaleLowerCase("de-DE");

export const createUniqueMixName = (name: string, mixes: DiceConfiguration[]) => {
  const baseName = `${name.trim() || "Eigene Mischung"} Kopie`;
  const usedNames = new Set(mixes.map((mix) => normalizeName(mix.name)));
  if (!usedNames.has(normalizeName(baseName))) return baseName;

  let index = 2;
  while (usedNames.has(normalizeName(`${baseName} ${index}`))) index += 1;
  return `${baseName} ${index}`;
};

export const createDraft = (): DiceConfiguration => ({
  id: createId("mix"),
  name: "Neue Mischung",
  updatedAt: new Date().toISOString(),
  actions: Object.values(actionsById)
    .filter((action) => action.useInCustom)
    .map((action) => ({ ...action, moods: ["custom" as const] })),
  zones: Object.values(zonesById)
    .filter((zone) => zone.useInCustom)
    .map((zone) => ({ ...zone, moods: ["custom" as const] }))
});
