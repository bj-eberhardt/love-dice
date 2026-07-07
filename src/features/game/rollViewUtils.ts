import type { DiceAction, RollFace, Zone } from "@/shared";

export const emptyFaces = <T extends DiceAction | Zone>(items: T[]): RollFace<T>[] =>
  items.slice(0, 6).map((item, faceIndex) => ({ ...item, faceIndex }));
