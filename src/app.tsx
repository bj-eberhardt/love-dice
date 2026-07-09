import { builtInConfigurations, defaultConfiguration, type DiceConfiguration } from "@/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ConsentPage } from "@/components/ConsentPage";
import { MixModal } from "./components/MixModal";
import { GameRound } from "./features/game/GameRound";
import { useRollController } from "./features/game/useRollController";
import { useMixController } from "./features/mixes/useMixController";
import { ModeBar } from "./features/modes/ModeBar";
import { builtInModes, type ActiveMode } from "./features/modes/modeTypes";
import { useModeScrollHints } from "./features/modes/useModeScrollHints";

export function App() {
  const [consent, setConsent] = useState(false);
  const [activeMode, setActiveMode] = useState<ActiveMode>({ type: "builtin", mood: "romantic" });
  const resetRollRef = useRef<() => void>(() => {});
  const clearRollErrorRef = useRef<() => void>(() => {});
  const scheduleScrollHintUpdateRef = useRef<() => void>(() => {});

  const mixController = useMixController({
    activeMode,
    setActiveMode,
    resetRoll: () => resetRollRef.current(),
    clearRollError: () => clearRollErrorRef.current(),
    scheduleScrollHintUpdate: () => scheduleScrollHintUpdateRef.current()
  });

  const modeScroll = useModeScrollHints(mixController.customMixes.length);

  const activeConfig = useMemo<DiceConfiguration>(() => {
    if (activeMode.type === "mix") {
      return (
        mixController.customMixes.find((mix) => mix.id === activeMode.id) ?? defaultConfiguration
      );
    }
    return builtInConfigurations[activeMode.mood];
  }, [activeMode, mixController.customMixes]);

  const activeMood = activeMode.type === "builtin" ? activeMode.mood : "custom";
  const rollController = useRollController({ activeConfig, activeMood });

  useEffect(() => {
    resetRollRef.current = rollController.resetRoll;
    clearRollErrorRef.current = () => rollController.setError("");
    scheduleScrollHintUpdateRef.current = modeScroll.scheduleScrollHintUpdate;
  }, [modeScroll.scheduleScrollHintUpdate, rollController]);

  if (!consent) {
    return <ConsentPage onConsentClick={() => setConsent(true)} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Würfel & Wünsche</p>
          <h1>Spielrunde</h1>
        </div>
      </header>

      <ModeBar
        activeMode={activeMode}
        builtInModes={builtInModes}
        customMixes={mixController.customMixes}
        scrollHints={modeScroll.scrollHints}
        modeScrollRef={modeScroll.modeScrollRef}
        openMixMenuId={mixController.openMixMenuId}
        onScroll={modeScroll.updateScrollHints}
        onScrollModes={modeScroll.scrollModes}
        onSelectBuiltIn={(mood) => {
          setActiveMode({ type: "builtin", mood });
          rollController.resetRoll();
        }}
        onOpenExistingMix={mixController.openExistingMix}
        onOpenMixEditor={mixController.openMixEditor}
        onStartLongPress={mixController.startLongPress}
        onClearLongPress={mixController.clearLongPress}
        onToggleMixMenu={(mixId) =>
          mixController.setOpenMixMenuId((id) => (id === mixId ? null : mixId))
        }
        onCopyMix={mixController.copyMix}
        onRequestDeleteMix={mixController.requestDeleteMix}
        onOpenNewMix={mixController.openNewMix}
      />

      <GameRound
        roll={rollController.roll}
        animationRoll={rollController.animationRoll}
        initialActionFaces={rollController.initialActionFaces}
        initialZoneFaces={rollController.initialZoneFaces}
        rolling={rollController.rolling}
        rollingKey={rollController.rollingKey}
        error={rollController.error}
        onStartRoll={rollController.startRoll}
      />

      {mixController.draft ? (
        <MixModal
          draft={mixController.draft}
          saveError={mixController.draftSaveError}
          onChange={mixController.setDraft}
          onClose={() => mixController.setDraft(null)}
          onSave={mixController.saveDraft}
          onDelete={() => mixController.requestDeleteMix(mixController.draft!)}
        />
      ) : null}
      <footer className="app-footer" data-testid="app-version">
        v{__APP_VERSION__}
      </footer>

      {mixController.confirmRequest ? (
        <ConfirmDialog
          title={mixController.confirmRequest.title}
          message={mixController.confirmRequest.message}
          confirmLabel={mixController.confirmRequest.confirmLabel}
          onCancel={() => mixController.setConfirmRequest(null)}
          onConfirm={mixController.confirmDelete}
        />
      ) : null}
    </main>
  );
}
