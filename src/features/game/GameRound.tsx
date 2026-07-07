import type { DiceAction, RollFace, RollResult, Zone } from "@/shared";
import { Shuffle } from "lucide-react";
import { Suspense, lazy } from "react";
import { ResultToken } from "@/components/ResultToken";

const DiceStage = lazy(() =>
  import("../dice3d/DiceStage").then((module) => ({ default: module.DiceStage }))
);

type GameRoundProps = {
  roll: RollResult | null;
  animationRoll: RollResult | null;
  initialActionFaces: RollFace<DiceAction>[];
  initialZoneFaces: RollFace<Zone>[];
  rolling: boolean;
  rollingKey: number;
  error: string;
  onStartRoll: () => void;
};

export function GameRound({
  roll,
  animationRoll,
  initialActionFaces,
  initialZoneFaces,
  rolling,
  rollingKey,
  error,
  onStartRoll
}: GameRoundProps) {
  return (
    <section className="game-layout">
      <Suspense fallback={<div className="dice-stage" aria-hidden="true" />}>
        <DiceStage
          actionFaces={animationRoll?.actionFaces ?? roll?.actionFaces ?? initialActionFaces}
          zoneFaces={animationRoll?.zoneFaces ?? roll?.zoneFaces ?? initialZoneFaces}
          actionResult={animationRoll?.action ?? roll?.action}
          zoneResult={animationRoll?.zone ?? roll?.zone}
          rollingKey={rollingKey}
        />
      </Suspense>

      <div className="result-panel" aria-live="polite">
        <div className="result-columns">
          <ResultToken
            dataTestId="action-result"
            title="Aktion"
            value={roll?.action.label ?? "Bereit"}
            iconKey={roll?.action.iconKey ?? "sparkle"}
            tone="pink"
            dataState={roll ? "filled" : "empty"}
          />
          <ResultToken
            dataTestId="zone-result"
            title="Zone"
            value={roll?.zone.label ?? "Bereit"}
            iconKey={roll?.zone.iconKey ?? "consent"}
            tone="teal"
            dataState={roll ? "filled" : "empty"}
          />
        </div>
        <p data-testid="result-text" data-is-rolling={rolling} className="instruction">
          {rolling
            ? "Die Würfel rollen..."
            : (roll?.instruction ?? "Tippe auf Würfeln, um eine neue Runde zu starten.")}
        </p>
        {error ? <p className="error">{error}</p> : null}
        <div className="controls">
          <button
            data-testid="roll-button"
            className="primary"
            onClick={onStartRoll}
            disabled={rolling}
          >
            <Shuffle size={19} /> {roll ? "Neu würfeln" : "Würfeln"}
          </button>
        </div>
      </div>
    </section>
  );
}
