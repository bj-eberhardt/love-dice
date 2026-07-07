import {
  createRoll,
  type DiceAction,
  type DiceConfiguration,
  type Mood,
  type RollHistoryEntry,
  type RollResult,
  type Zone
} from "@/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emptyFaces } from "./rollViewUtils";

type UseRollControllerOptions = {
  activeConfig: DiceConfiguration;
  activeMood: Mood;
  revealDelayMs?: number;
};

export function useRollController({
  activeConfig,
  activeMood,
  revealDelayMs = 2450
}: UseRollControllerOptions) {
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [animationRoll, setAnimationRoll] = useState<RollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollingKey, setRollingKey] = useState(0);
  const [error, setError] = useState("");
  const rollRevealTimerRef = useRef<number | null>(null);

  const initialActionFaces = useMemo(
    () => emptyFaces<DiceAction>(activeConfig.actions),
    [activeConfig.actions]
  );
  const initialZoneFaces = useMemo(
    () => emptyFaces<Zone>(activeConfig.zones),
    [activeConfig.zones]
  );

  const clearRollRevealTimer = useCallback(() => {
    if (!rollRevealTimerRef.current) return;
    window.clearTimeout(rollRevealTimerRef.current);
    rollRevealTimerRef.current = null;
  }, []);

  const resetRoll = useCallback(() => {
    clearRollRevealTimer();
    setRoll(null);
    setAnimationRoll(null);
    setRollHistory([]);
    setRolling(false);
  }, [clearRollRevealTimer]);

  const startRoll = useCallback(() => {
    try {
      const nextRoll = createRoll(activeConfig, activeMood, Math.random, { history: rollHistory });
      clearRollRevealTimer();
      setRoll(null);
      setAnimationRoll(nextRoll);
      setError("");
      setRolling(true);
      setRollingKey((key) => key + 1);
      rollRevealTimerRef.current = window.setTimeout(() => {
        setRoll(nextRoll);
        setRollHistory((history) => [...history, nextRoll]);
        setAnimationRoll(null);
        setRolling(false);
        rollRevealTimerRef.current = null;
      }, revealDelayMs);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Der Wurf konnte nicht erstellt werden.");
    }
  }, [activeConfig, activeMood, clearRollRevealTimer, revealDelayMs, rollHistory]);

  useEffect(() => clearRollRevealTimer, [clearRollRevealTimer]);

  return {
    roll,
    animationRoll,
    rolling,
    rollingKey,
    error,
    initialActionFaces,
    initialZoneFaces,
    startRoll,
    resetRoll,
    setError
  };
}
