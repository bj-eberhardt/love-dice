import { iconFor } from "@/features/game/icons";

interface ResultTokenProps {
  title: string;
  value: string;
  iconKey: string;
  tone: "pink" | "teal";
}

export function ResultToken({ title, value, iconKey, tone }: ResultTokenProps) {
  return (
    <div className={`result-token ${tone}`}>
      {iconFor(iconKey, "token-icon")}
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
