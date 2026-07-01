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

const supportsMood = (entry: { enabled: boolean; moods: Mood[] }, mood: Mood) =>
  entry.enabled && (mood === "custom" || entry.moods.includes(mood));

export const isPairAllowed = (action: DiceAction, zone: Zone) => {
  if (action.allowedZoneIds?.length && !action.allowedZoneIds.includes(zone.id)) return false;
  if (action.blockedZoneIds?.includes(zone.id)) return false;
  return true;
};

export const fillTemplate = (action: DiceAction, zone: Zone) =>
  action.instructionTemplate
    .replaceAll("{zone.accusative}", zone.accusative)
    .replaceAll("{zone.label}", zone.label)
    .replaceAll("{ort}", zone.accusative);

export const createRoll = (
  configuration: DiceConfiguration,
  mood: Mood,
  random: () => number = Math.random
): RollResult => {
  const actions = configuration.actions.filter((action) => supportsMood(action, mood));
  const zones = configuration.zones.filter((zone) => supportsMood(zone, mood));

  if (actions.length < 6 || zones.length < 6) {
    throw new Error(
      "Für diese Stimmung müssen mindestens sechs Aktionen und sechs Zonen aktiv sein."
    );
  }

  const actionFaces = takeSix(actions, random).map((action, faceIndex) => ({
    ...action,
    faceIndex
  }));
  const zoneFaces = takeSix(zones, random).map((zone, faceIndex) => ({ ...zone, faceIndex }));
  const pairs = actionFaces.flatMap((action) =>
    zoneFaces
      .filter((zone) => isPairAllowed(action, zone))
      .map((zone) => ({ action: action as RollFace<DiceAction>, zone: zone as RollFace<Zone> }))
  );

  if (!pairs.length) {
    throw new Error("Keine gültige Kombination aus Aktion und Zone gefunden.");
  }

  const selected = pairs[Math.floor(random() * pairs.length)];
  return {
    actionFaces,
    zoneFaces,
    action: selected.action,
    zone: selected.zone,
    instruction: fillTemplate(selected.action, selected.zone)
  };
};
