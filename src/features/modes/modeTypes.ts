import type { Mood } from "@/shared";

export type BuiltInMood = Exclude<Mood, "custom">;
export type ActiveMode = { type: "builtin"; mood: BuiltInMood } | { type: "mix"; id: string };

export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export const builtInModes: { id: BuiltInMood; label: string }[] = [
  { id: "romantic", label: "Romantisch" },
  { id: "playful", label: "Verspielt" },
  { id: "bold", label: "Mutig" }
];
