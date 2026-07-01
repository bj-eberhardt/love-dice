import { iconFor } from "@/features/game/icons";

interface ResultTokenProps {
  title: string;
  value: string;
  iconKey: string;
  tone: "pink" | "teal";
  dataTestId: string;
  dataState: "empty" | "filled";
}

export function ResultToken({
  title,
  value,
  iconKey,
  tone,
  dataTestId,
  dataState
}: ResultTokenProps) {
  return (
    <div data-testid={dataTestId} data-state={dataState} className={`result-token ${tone}`}>
      {iconFor(iconKey, "token-icon")}
      <span>{title}</span>
      <strong data-testid="result-value">{value}</strong>
    </div>
  );
}
