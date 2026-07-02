import {
  createRoll,
  defaultConfiguration,
  builtInConfigurations,
  configurationSchema,
  type DiceAction,
  type DiceConfiguration,
  type Mood,
  type RollFace,
  type RollHistoryEntry,
  type RollResult,
  type Zone
} from "@/shared";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Shuffle
} from "lucide-react";
import { Suspense, lazy, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ResultToken } from "./components/ResultToken";
import { MixModal } from "./components/MixModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import {
  loadCustomMixes,
  saveCustomMixes,
  normalizeName,
  createUniqueMixName,
  createDraft,
  createId
} from "./utils/mixUtils";
import { formatZodError } from "./utils/validationUtils";

const builtInModes: { id: BuiltInMood; label: string }[] = [
  { id: "romantic", label: "Romantisch" },
  { id: "playful", label: "Verspielt" },
  { id: "bold", label: "Mutig" }
];

const DiceStage = lazy(() =>
  import("./features/dice3d/DiceStage").then((module) => ({ default: module.DiceStage }))
);

type BuiltInMood = Exclude<Mood, "custom">;
type ActiveMode = { type: "builtin"; mood: BuiltInMood } | { type: "mix"; id: string };
type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

const emptyFaces = <T extends DiceAction | Zone>(items: T[]): RollFace<T>[] =>
  items.slice(0, 6).map((item, faceIndex) => ({ ...item, faceIndex }));
const cleanupOrphanedZoneIds = (draft: DiceConfiguration): DiceConfiguration => {
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

export function App() {
  const [consent, setConsent] = useState(false);
  const [activeMode, setActiveMode] = useState<ActiveMode>({ type: "builtin", mood: "romantic" });
  const [customMixes, setCustomMixes] = useState<DiceConfiguration[]>(loadCustomMixes);
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [animationRoll, setAnimationRoll] = useState<RollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollingKey, setRollingKey] = useState(0);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<DiceConfiguration | null>(null);
  const [draftSaveError, setDraftSaveError] = useState("");
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [openMixMenuId, setOpenMixMenuId] = useState<string | null>(null);
  const [scrollHints, setScrollHints] = useState({ left: false, right: false });
  const modeScrollRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const rollRevealTimerRef = useRef<number | null>(null);
  const scrollMeasureFrameRef = useRef<number | null>(null);
  const scrollMeasureTimeoutRefs = useRef<number[]>([]);

  const activeConfig = useMemo<DiceConfiguration>(() => {
    if (activeMode.type === "mix") {
      return customMixes.find((mix) => mix.id === activeMode.id) ?? defaultConfiguration;
    }
    return builtInConfigurations[activeMode.mood];
  }, [activeMode, customMixes]);

  const activeMood = activeMode.type === "builtin" ? activeMode.mood : "custom";
  const initialActionFaces = useMemo(
    () => emptyFaces<DiceAction>(activeConfig.actions),
    [activeConfig.actions]
  );
  const initialZoneFaces = useMemo(
    () => emptyFaces<Zone>(activeConfig.zones),
    [activeConfig.zones]
  );

  const updateScrollHints = useCallback(() => {
    const element = modeScrollRef.current;
    if (!element) {
      setTimeout(updateScrollHints, 50);
      return;
    }
    const hasOverflow = element.scrollWidth > element.clientWidth + 1;
    setScrollHints({
      left: hasOverflow && element.scrollLeft > 1,
      right: hasOverflow && element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    });
  }, []);

  const clearScheduledScrollHintUpdates = useCallback(() => {
    if (scrollMeasureFrameRef.current) {
      window.cancelAnimationFrame(scrollMeasureFrameRef.current);
      scrollMeasureFrameRef.current = null;
    }
    scrollMeasureTimeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    scrollMeasureTimeoutRefs.current = [];
  }, []);

  const scheduleScrollHintUpdate = useCallback(() => {
    clearScheduledScrollHintUpdates();
    scrollMeasureFrameRef.current = window.requestAnimationFrame(() => {
      scrollMeasureFrameRef.current = null;
      updateScrollHints();
    });
    scrollMeasureTimeoutRefs.current = [80, 240].map((delay) =>
      window.setTimeout(updateScrollHints, delay)
    );
  }, [clearScheduledScrollHintUpdates, updateScrollHints]);

  const scrollModes = (direction: -1 | 1) => {
    const element = modeScrollRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * 220, behavior: "smooth" });
    window.setTimeout(updateScrollHints, 280);
  };

  useLayoutEffect(() => {
    updateScrollHints();
    scheduleScrollHintUpdate();
    const element = modeScrollRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(scheduleScrollHintUpdate);
    resizeObserver.observe(element);
    Array.from(element.children).forEach((child) => resizeObserver.observe(child));
    window.addEventListener("resize", scheduleScrollHintUpdate);
    return () => {
      clearScheduledScrollHintUpdates();
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleScrollHintUpdate);
    };
  }, [
    clearScheduledScrollHintUpdates,
    customMixes.length,
    scheduleScrollHintUpdate,
    updateScrollHints
  ]);

  const persistMixes = (nextMixes: DiceConfiguration[]) => {
    setCustomMixes(nextMixes);
    saveCustomMixes(nextMixes);
  };

  const clearRollRevealTimer = () => {
    if (!rollRevealTimerRef.current) return;
    window.clearTimeout(rollRevealTimerRef.current);
    rollRevealTimerRef.current = null;
  };

  const resetRoll = () => {
    clearRollRevealTimer();
    setRoll(null);
    setAnimationRoll(null);
    setRollHistory([]);
    setRolling(false);
  };

  const startRoll = () => {
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
      }, 2450);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Der Wurf konnte nicht erstellt werden.");
    }
  };

  const openNewMix = () => {
    setDraftSaveError("");
    setDraft(createDraft());
  };

  const clearLongPress = () => {
    if (!longPressTimerRef.current) return;
    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const openMixEditor = (mix: DiceConfiguration) => {
    clearLongPress();
    setDraftSaveError("");
    setDraft(mix);
    setOpenMixMenuId(null);
  };

  const startLongPress = (mix: DiceConfiguration) => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => openMixEditor(mix), 550);
  };

  const openExistingMix = (mix: DiceConfiguration) => {
    clearLongPress();
    setActiveMode({ type: "mix", id: mix.id });
    setOpenMixMenuId(null);
    resetRoll();
    window.setTimeout(updateScrollHints, 10);
  };

  const copyMix = (mix: DiceConfiguration) => {
    const copiedMix = configurationSchema.parse({
      ...JSON.parse(JSON.stringify(mix)),
      id: createId("mix"),
      name: createUniqueMixName(mix.name, customMixes),
      updatedAt: new Date().toISOString()
    });
    const nextMixes = [...customMixes, copiedMix];
    persistMixes(nextMixes);
    setActiveMode({ type: "mix", id: copiedMix.id });
    setOpenMixMenuId(null);
    resetRoll();
    window.setTimeout(updateScrollHints, 0);
  };

  const saveDraft = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setDraftSaveError("Bitte gib der Mischung einen Namen.");
      return;
    }
    const duplicateName = customMixes.some(
      (mix) => mix.id !== draft.id && normalizeName(mix.name) === normalizeName(name)
    );
    if (duplicateName) {
      setDraftSaveError("Es gibt bereits eine Mischung mit diesem Namen.");
      return;
    }
    const actionsSize = draft.actions.filter((i) => i.enabled).length;
    if (actionsSize < 6) {
      setDraftSaveError("Eine Mischung muss mindestens 6 Aktionen enthalten.");
      return;
    }
    const zoneSize = draft.zones.filter((i) => i.enabled).length;
    if (zoneSize < 6) {
      setDraftSaveError("Eine Mischung muss mindestens 6 Zonen enthalten.");
      return;
    }

    try {
      const cleanedDraft = cleanupOrphanedZoneIds({
        ...draft,
        name,
        updatedAt: new Date().toISOString()
      });
      const parsed = configurationSchema.parse(cleanedDraft);
      const nextMixes = customMixes.some((mix) => mix.id === parsed.id)
        ? customMixes.map((mix) => (mix.id === parsed.id ? parsed : mix))
        : [...customMixes, parsed];
      persistMixes(nextMixes);
      setActiveMode({ type: "mix", id: parsed.id });
      setDraftSaveError("");
      setDraft(null);
      resetRoll();
      setError("");
    } catch (caught) {
      setDraftSaveError(formatZodError(caught));
    }
  };

  const deleteMix = (id: string) => {
    const nextMixes = customMixes.filter((mix) => mix.id !== id);
    persistMixes(nextMixes);
    setOpenMixMenuId(null);
    setDraft((currentDraft) => (currentDraft?.id === id ? null : currentDraft));
    if (activeMode.type === "mix" && activeMode.id === id) {
      setActiveMode({ type: "builtin", mood: "romantic" });
      resetRoll();
    }
  };

  const requestDeleteMix = (mix: DiceConfiguration) => {
    setOpenMixMenuId(null);
    setConfirmRequest({
      title: "Mischung löschen?",
      message: `Soll die Mischung „${mix.name}“ wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`,
      confirmLabel: "Mischung löschen",
      onConfirm: () => deleteMix(mix.id)
    });
  };
  if (!consent) {
    return (
      <main className="consent-screen">
        <section className="hero">
          <picture className="hero-asset" aria-hidden="true">
            <source media="(max-width: 720px)" srcSet="/assets/hero-dice-mobile.png" />
            <img data-testid="consent-hero-image" src="/assets/hero-dice-desktop.png" alt="" />
          </picture>
          <div className="hero-content">
            <p className="eyebrow">Würfel & Wünsche</p>
            <h1>Lust auf Würfel?</h1>
            <p className="lead">
              Drei Stimmungen, zwei Würfel und klare Zustimmung für intime Paarmomente.
            </p>
            <button
              data-testid="consent-accept"
              className="primary"
              onClick={() => setConsent(true)}
            >
              <ShieldCheck size={20} /> Volljährigkeit und Zustimmung bestätigen
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Würfel & Wünsche</p>
          <h1>Spielrunde</h1>
        </div>
      </header>

      <section data-testid="mode-bar" className="mode-bar" aria-label="Modus wählen">
        <div className="mode-scroll-wrap">
          <button
            data-testid="mode-scroll-left"
            className="scroll-hint left"
            aria-label="Modusleiste nach links scrollen"
            disabled={!scrollHints.left}
            onClick={() => scrollModes(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <div
            data-testid="mode-scroll"
            className="mode-scroll"
            ref={modeScrollRef}
            onScroll={updateScrollHints}
          >
            {builtInModes.map((item) => (
              <button
                key={item.id}
                className={
                  activeMode.type === "builtin" && activeMode.mood === item.id
                    ? "chip active"
                    : "chip"
                }
                onClick={() => {
                  setActiveMode({ type: "builtin", mood: item.id });
                  resetRoll();
                }}
              >
                {item.label}
              </button>
            ))}
            {customMixes.map((mix) => {
              const isActiveMix = activeMode.type === "mix" && activeMode.id === mix.id;
              return (
                <span key={mix.id} className={isActiveMix ? "mix-split active" : "mix-split"}>
                  <button
                    data-testid={`mix-chip-${mix.id}`}
                    className="mix-main"
                    onClick={() => openExistingMix(mix)}
                    onDoubleClick={() => openMixEditor(mix)}
                    onPointerDown={() => startLongPress(mix)}
                    onPointerUp={clearLongPress}
                    onPointerLeave={clearLongPress}
                    onPointerCancel={clearLongPress}
                  >
                    {mix.name}
                  </button>
                  {isActiveMix ? (
                    <span className="mix-menu-wrap">
                      <button
                        data-testid={`mix-more-${mix.id}`}
                        className="mix-more"
                        aria-label={`${mix.name} Aktionen öffnen`}
                        aria-expanded={openMixMenuId === mix.id}
                        onClick={() => setOpenMixMenuId((id) => (id === mix.id ? null : mix.id))}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                      {openMixMenuId === mix.id ? (
                        <div data-testid={`mix-menu-${mix.id}`} className="mix-menu" role="menu">
                          <button
                            data-testid={`mix-edit-${mix.id}`}
                            role="menuitem"
                            onClick={() => openMixEditor(mix)}
                          >
                            Bearbeiten
                          </button>
                          <button
                            data-testid={`mix-copy-${mix.id}`}
                            role="menuitem"
                            onClick={() => copyMix(mix)}
                          >
                            Kopieren
                          </button>
                          <button
                            data-testid={`mix-request-delete-${mix.id}`}
                            role="menuitem"
                            className="menu-danger"
                            onClick={() => requestDeleteMix(mix)}
                          >
                            Löschen
                          </button>
                        </div>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <button
            data-testid="mode-scroll-right"
            className="scroll-hint right"
            aria-label="Modusleiste nach rechts scrollen"
            disabled={!scrollHints.right}
            onClick={() => scrollModes(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button data-testid="open-mix-modal" className="primary sticky-add" onClick={openNewMix}>
          <Plus size={18} /> Eigene Mischung
        </button>
      </section>

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
              onClick={startRoll}
              disabled={rolling}
            >
              <Shuffle size={19} /> {roll ? "Neu würfeln" : "Würfeln"}
            </button>
          </div>
        </div>
      </section>

      {draft ? (
        <MixModal
          draft={draft}
          saveError={draftSaveError}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={saveDraft}
          onDelete={() => requestDeleteMix(draft)}
        />
      ) : null}
      <footer className="app-footer" data-testid="app-version">
        v{__APP_VERSION__}
      </footer>

      {confirmRequest ? (
        <ConfirmDialog
          title={confirmRequest.title}
          message={confirmRequest.message}
          confirmLabel={confirmRequest.confirmLabel}
          onCancel={() => setConfirmRequest(null)}
          onConfirm={() => {
            confirmRequest.onConfirm();
            setConfirmRequest(null);
          }}
        />
      ) : null}
    </main>
  );
}
