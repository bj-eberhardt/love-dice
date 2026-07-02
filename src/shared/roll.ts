import type {
  DiceAction,
  DiceConfiguration,
  Mood,
  RollFace,
  RollResult,
  Zone
} from "./schemas/configuration.js";

const takeSix = <T>(items: T[], random: () => number): T[] =>
  [...items].sort(() => random() - 0.5).slice(0, 6);

const takeSixWithRequired = <T extends { id: string }>(
  items: T[],
  required: T,
  random: () => number
): T[] => {
  const picked = takeSix(items, random);
  if (picked.some((item) => item.id === required.id)) return picked;
  return [required, ...picked.filter((item) => item.id !== required.id)].slice(0, 6);
};

const supportsMood = (entry: { enabled: boolean; moods: Mood[] }, mood: Mood) =>
  entry.enabled && (mood === "custom" || entry.moods.includes(mood));

export type RollHistoryEntry = Pick<RollResult, "action" | "zone">;

export interface RollOptions {
  history?: RollHistoryEntry[];
}

export const isPairAllowed = (action: DiceAction, zone: Zone) => {
  if (action.allowedZoneIds?.length && !action.allowedZoneIds.includes(zone.id)) return false;
  if (action.blockedZoneIds?.includes(zone.id)) return false;
  return true;
};

export const fillTemplate = (action: DiceAction, zone: Zone) =>
  action.instructionTemplate
    .replaceAll("{accusative}", accusative)
    .replaceAll("{zone.label}", zone.label)
    .replaceAll("{ort}", accusative);

export const createRoll = (
  configuration: DiceConfiguration,
  mood: Mood,
  random: () => number = Math.random,
  options: RollOptions = {}
): RollResult => {
  const actions = configuration.actions.filter((action) => supportsMood(action, mood));
  const zones = configuration.zones.filter((zone) => supportsMood(zone, mood));

  if (actions.length < 6 || zones.length < 6) {
    throw new Error(
      "Für diese Stimmung müssen mindestens sechs Aktionen und sechs Zonen aktiv sein."
    );
  }

  const pairKey = (actionId: string, zoneId: string) => `${actionId}::${zoneId}`;
  const history = options.history ?? [];
  const seenPairs = new Set(history.map((entry) => pairKey(entry.action.id, entry.zone.id)));
  const actionCounts = new Map<string, number>();
  const zoneCounts = new Map<string, number>();

  for (const entry of history) {
    actionCounts.set(entry.action.id, (actionCounts.get(entry.action.id) ?? 0) + 1);
    zoneCounts.set(entry.zone.id, (zoneCounts.get(entry.zone.id) ?? 0) + 1);
  }

  const pairs = actions.flatMap((action) =>
    zones.filter((zone) => isPairAllowed(action, zone)).map((zone) => ({ action, zone }))
  );

  if (!pairs.length) {
    throw new Error("Keine gültige Kombination aus Aktion und Zone gefunden.");
  }

  const unseenPairs = pairs.filter((pair) => !seenPairs.has(pairKey(pair.action.id, pair.zone.id)));
  const candidates = unseenPairs.length ? unseenPairs : pairs;
  const bestScore = Math.min(
    ...candidates.map(
      (pair) => (actionCounts.get(pair.action.id) ?? 0) + (zoneCounts.get(pair.zone.id) ?? 0)
    )
  );
  const leastRepeatedPairs = candidates.filter(
    (pair) =>
      (actionCounts.get(pair.action.id) ?? 0) + (zoneCounts.get(pair.zone.id) ?? 0) === bestScore
  );
  const selected = leastRepeatedPairs[Math.floor(random() * leastRepeatedPairs.length)];
  const actionFaces = takeSixWithRequired(actions, selected.action, random).map(
    (action, faceIndex) => ({
      ...action,
      faceIndex
    })
  );
  const zoneFaces = takeSixWithRequired(zones, selected.zone, random).map((zone, faceIndex) => ({
    ...zone,
    faceIndex
  }));
  const selectedAction = actionFaces.find((action) => action.id === selected.action.id);
  const selectedZone = zoneFaces.find((zone) => zone.id === selected.zone.id);

  if (!selectedAction || !selectedZone) {
    throw new Error("Der Wurf konnte nicht auf die Würfelflächen gelegt werden.");
  }

  return {
    actionFaces,
    zoneFaces,
    action: selectedAction,
    zone: selectedZone,
    instruction: fillTemplate(selectedAction, selectedZone)
  };
};
