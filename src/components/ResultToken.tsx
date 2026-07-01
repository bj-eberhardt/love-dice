import { iconFor } from "@/features/game/icons";

interface ResultTokenProps {
  title: string;
  value: string;
  iconKey: string;
  tone: "pink" | "teal";
  dataTestId: string;
}

export function ResultToken({ title, value, iconKey, tone, dataTestId }: ResultTokenProps) {
  return (
    <div data-testid={dataTestId} className={`result-token ${tone}`}>
      {iconFor(iconKey, "token-icon")}
      <span>{title}</span>
      <strong data-testid='result-value'>{value}</strong>
    </div>
  );
}
