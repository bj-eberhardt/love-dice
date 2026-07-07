import type { DiceConfiguration } from "@/shared";

export const cleanupOrphanedZoneIds = (draft: DiceConfiguration): DiceConfiguration => {
  const validZoneIds = new Set(draft.zones.map((zone) => zone.id));
  return {
    ...draft,
    actions: draft.actions.map((action) => {
      const allowedZoneIds = action.allowedZoneIds?.filter((id) => validZoneIds.has(id));
      return {
        ...action,
        allowedZoneIds: allowedZoneIds && allowedZoneIds.length > 0 ? allowedZoneIds : undefined
      };
    })
  };
};
