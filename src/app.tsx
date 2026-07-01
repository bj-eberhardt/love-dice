import {
  createRoll,
  defaultConfiguration,
  configurationSchema,
  type DiceAction,
  type DiceConfiguration,
  type Mood,
  type RollFace,
  type RollResult,
  type Zone
} from "@/shared";
import { Download, MoreHorizontal, Plus, Save, ShieldCheck, Shuffle, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import { DiceStage } from "./features/dice3d/DiceStage";
import { iconFor } from "./features/game/icons";

const customMixesKey = "love-dice-custom-mixes";
const builtInModes: { id: Mood; label: string }[] = [
  { id: "romantic", label: "Romantisch" },
  { id: "playful", label: "Verspielt" },
  { id: "bold", label: "Mutig" }
];

type ActiveMode = { type: "builtin"; mood: Mood } | { type: "mix"; id: string };
type EditableDraft = DiceConfiguration;
type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

const emptyFaces = <T extends DiceAction | Zone>(items: T[]): RollFace<T>[] =>
  items.slice(0, 6).map((item, faceIndex) => ({ ...item, faceIndex }));

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const normalizeName = (name: string) => name.trim().toLocaleLowerCase("de-DE");
const createUniqueMixName = (name: string, mixes: DiceConfiguration[]) => {
  const baseName = `${name.trim() || "Eigene Mischung"} Kopie`;
  const usedNames = new Set(mixes.map((mix) => normalizeName(mix.name)));
  if (!usedNames.has(normalizeName(baseName))) return baseName;

  let index = 2;
  while (usedNames.has(normalizeName(`${baseName} ${index}`))) index += 1;
  return `${baseName} ${index}`;
};

const loadCustomMixes = (): DiceConfiguration[] => {
  try {
    const stored = localStorage.getItem(customMixesKey);
    if (!stored) return [];
    return configurationSchema.array().parse(JSON.parse(stored));
  } catch {
    return [];
  }
};

const saveCustomMixes = (mixes: DiceConfiguration[]) => {
  localStorage.setItem(customMixesKey, JSON.stringify(mixes));
};

const createDraft = (): EditableDraft => ({
  ...defaultConfiguration,
  id: createId("mix"),
  name: "Neue Mischung",
  updatedAt: new Date().toISOString(),
  actions: defaultConfiguration.actions.map((action) => ({ ...action, moods: ["custom" as const] })),
  zones: defaultConfiguration.zones.map((zone) => ({ ...zone, moods: ["custom" as const] }))
});

const actionTextFromTemplate = (template: string) =>
  template
    .replaceAll("{zone.accusative}", "{ort}")
    .replaceAll("{zone.nominative}", "{ort}")
    .replaceAll("{zone.label}", "{ort}")
    .replace(/\s+/g, " ")
    .replace(/[\s.]+$/, "")
    .trim();

const templateFromActionText = (text: string) => {
  const cleanText = text.trim().replace(/[.]+$/, "");
  if (!cleanText) return "Probiert {zone.accusative} nach Absprache aus.";
  return cleanText.includes("{ort}")
    ? `${cleanText.replaceAll("{ort}", "{zone.accusative}")}.`
    : `${cleanText} {zone.accusative}.`;
};

export function App() {
  const [consent, setConsent] = useState(false);
  const [activeMode, setActiveMode] = useState<ActiveMode>({ type: "builtin", mood: "romantic" });
  const [customMixes, setCustomMixes] = useState<DiceConfiguration[]>(loadCustomMixes);
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollingKey, setRollingKey] = useState(0);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<EditableDraft | null>(null);
  const [draftSaveError, setDraftSaveError] = useState("");
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [openMixMenuId, setOpenMixMenuId] = useState<string | null>(null);
  const [scrollHints, setScrollHints] = useState({ left: false, right: false });
  const modeScrollRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const activeConfig = useMemo(() => {
    if (activeMode.type === "mix") {
      return customMixes.find((mix) => mix.id === activeMode.id) ?? defaultConfiguration;
    }
    return defaultConfiguration;
  }, [activeMode, customMixes]);

  const activeMood = activeMode.type === "builtin" ? activeMode.mood : "custom";
  const initialActionFaces = useMemo(() => emptyFaces(activeConfig.actions), [activeConfig.actions]);
  const initialZoneFaces = useMemo(() => emptyFaces(activeConfig.zones), [activeConfig.zones]);

  const updateScrollHints = () => {
    const element = modeScrollRef.current;
    if (!element) return;
    const hasOverflow = element.scrollWidth > element.clientWidth + 1;
    setScrollHints({
      left: hasOverflow && element.scrollLeft > 1,
      right: hasOverflow && element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    });
  };

  useEffect(() => {
    updateScrollHints();
    const element = modeScrollRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(updateScrollHints);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateScrollHints);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollHints);
    };
  }, [customMixes.length]);

  const persistMixes = (nextMixes: DiceConfiguration[]) => {
    setCustomMixes(nextMixes);
    saveCustomMixes(nextMixes);
  };

  const startRoll = () => {
    try {
      const nextRoll = createRoll(activeConfig, activeMood);
      setRoll(nextRoll);
      setError("");
      setRolling(true);
      setRollingKey((key) => key + 1);
      window.setTimeout(() => setRolling(false), 2450);
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
    window.setTimeout(updateScrollHints, 0);
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
    setRoll(null);
    window.setTimeout(updateScrollHints, 0);
  };

  const saveDraft = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setDraftSaveError("Bitte gib der Mischung einen Namen.");
      return;
    }
    const duplicateName = customMixes.some((mix) => mix.id !== draft.id && normalizeName(mix.name) === normalizeName(name));
    if (duplicateName) {
      setDraftSaveError("Es gibt bereits eine Mischung mit diesem Namen.");
      return;
    }
    const actionsSize = draft.actions.filter(i => i.enabled).length;
    if (actionsSize < 6) {
      setDraftSaveError("Eine Mischung muss mindestens 6 Aktionen enthalten.");
      return;
    }
    const zoneSize = draft.zones.filter(i => i.enabled).length;
    if (zoneSize < 6) {
      setDraftSaveError("Eine Mischung muss mindestens 6 Zonen enthalten.");
      return;
    }


    try {
      const parsed = configurationSchema.parse({ ...draft, name, updatedAt: new Date().toISOString() });
      const nextMixes = customMixes.some((mix) => mix.id === parsed.id)
        ? customMixes.map((mix) => (mix.id === parsed.id ? parsed : mix))
        : [...customMixes, parsed];
      persistMixes(nextMixes);
      setActiveMode({ type: "mix", id: parsed.id });
      setDraftSaveError("");
      setDraft(null);
      setRoll(null);
      setError("");
    } catch (caught) {
      setDraftSaveError(caught instanceof Error ? caught.message : "Die Mischung ist unvollständig.");
    }
  };

  const deleteMix = (id: string) => {
    const nextMixes = customMixes.filter((mix) => mix.id !== id);
    persistMixes(nextMixes);
    setOpenMixMenuId(null);
    setDraft((currentDraft) => (currentDraft?.id === id ? null : currentDraft));
    if (activeMode.type === "mix" && activeMode.id === id) {
      setActiveMode({ type: "builtin", mood: "romantic" });
      setRoll(null);
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
          <div>
            <p className="eyebrow">Würfel & Wünsche</p>
            <h1>Ein privates 3D-Würfelspiel für einvernehmliche Paarmomente.</h1>
            <p className="lead">
              Wählt gemeinsam Stimmung und Grenzen. Jede Runde kann neu gewürfelt werden.
            </p>
          </div>
          <button data-testid="consent-accept" className="primary" onClick={() => setConsent(true)}>
            <ShieldCheck size={20} /> Volljährigkeit und Zustimmung bestätigen
          </button>
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
          {scrollHints.left ? <span className="scroll-hint left" aria-hidden="true">‹</span> : null}
          <div className="mode-scroll" ref={modeScrollRef} onScroll={updateScrollHints}>
            {builtInModes.map((item) => (
              <button
                key={item.id}
                className={activeMode.type === "builtin" && activeMode.mood === item.id ? "chip active" : "chip"}
                onClick={() => {
                  setActiveMode({ type: "builtin", mood: item.id });
                  setRoll(null);
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
                        <div className="mix-menu" role="menu">
                                                <button data-testid={`mix-edit-${mix.id}`} role="menuitem" onClick={() => openMixEditor(mix)}>Bearbeiten</button>
                                                <button data-testid={`mix-copy-${mix.id}`} role="menuitem" onClick={() => copyMix(mix)}>Kopieren</button>
                                                <button data-testid={`mix-request-delete-${mix.id}`} role="menuitem" className="menu-danger" onClick={() => requestDeleteMix(mix)}>Löschen</button>
                        </div>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          {scrollHints.right ? <span className="scroll-hint right" aria-hidden="true">›</span> : null}
        </div>
        <button data-testid="open-mix-modal" className="primary sticky-add" onClick={openNewMix}>
          <Plus size={18} /> Eigene Mischung
        </button>
      </section>

      <section className="game-layout">
        <DiceStage
          actionFaces={roll?.actionFaces ?? initialActionFaces}
          zoneFaces={roll?.zoneFaces ?? initialZoneFaces}
          actionResult={roll?.action}
          zoneResult={roll?.zone}
          rollingKey={rollingKey}
        />

        <div className="result-panel" aria-live="polite">
          <div className="result-columns">
            <ResultToken title="Aktion" value={roll?.action.label ?? "Bereit"} iconKey={roll?.action.iconKey ?? "sparkle"} tone="pink" />
            <ResultToken title="Zone" value={roll?.zone.label ?? "Bereit"} iconKey={roll?.zone.iconKey ?? "consent"} tone="teal" />
          </div>
          <p data-testid="result-text" className="instruction">{rolling ? "Die Würfel rollen..." : roll?.instruction ?? "Tippe auf Würfeln, um eine neue Runde zu starten."}</p>
          {error ? <p className="error">{error}</p> : null}
          <div className="controls">
            <button data-testid="roll-button" className="primary" onClick={startRoll} disabled={rolling}>
              <Shuffle size={19} /> {roll ? "Neu würfeln" : "Würfeln"}
            </button>
          </div>
        </div>
      </section>

      {draft ? <MixModal draft={draft} saveError={draftSaveError} onChange={setDraft} onClose={() => setDraft(null)} onSave={saveDraft} onDelete={() => requestDeleteMix(draft)} /> : null}
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

function ResultToken({ title, value, iconKey, tone }: { title: string; value: string; iconKey: string; tone: "pink" | "teal" }) {
  return (
    <div className={`result-token ${tone}`}>
      {iconFor(iconKey, "token-icon")}
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MixModal({
  draft,
  saveError,
  onChange,
  onClose,
  onSave,
  onDelete
} : {
  draft: EditableDraft;
  saveError: string;
  onChange: (draft: EditableDraft) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [formError, setFormError] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const scrollToCard = (id: string) => {
    setExpandedIds((ids) => new Set(ids).add(id));
    window.setTimeout(() => cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
  };

  const updateName = (name: string) => onChange({ ...draft, name });
  const toggle = (kind: "actions" | "zones", id: string) => {
    onChange({
      ...draft,
      [kind]: draft[kind].map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    });
  };
  const remove = (kind: "actions" | "zones", id: string) => onChange({ ...draft, [kind]: draft[kind].filter((item) => item.id !== id) });
  const addAction = () => {
    const id = createId("action");
    onChange({
      ...draft,
      actions: [
        ...draft.actions,
        {
          id,
          label: "Neue Aktion",
          instructionTemplate: "Probiert {zone.accusative} nach Absprache aus.",
          zoneMode: "optional",
          iconKey: "sparkle",
          enabled: true,
          moods: ["custom"]
        }
      ]
    });
    scrollToCard(id);
  };
  const addZone = () => {
    const id = createId("zone");
    onChange({
      ...draft,
      zones: [
        ...draft.zones,
        {
          id,
          label: "Neue Zone",
          forms: { nominative: "die neue Zone", accusative: "die neue Zone" },
          iconKey: "consent",
          enabled: true,
          moods: ["custom"]
        }
      ]
    });
    scrollToCard(id);
  };
  const editLabel = (kind: "actions" | "zones", id: string, label: string) => {
    onChange({ ...draft, [kind]: draft[kind].map((item) => (item.id === id ? { ...item, label } : item)) });
  };
  const editActionText = (id: string, text: string) => {
    onChange({
      ...draft,
      actions: draft.actions.map((item) => (item.id === id ? { ...item, instructionTemplate: templateFromActionText(text) } : item))
    });
  };
  const editZoneText = (id: string, value: string) => {
    onChange({
      ...draft,
      zones: draft.zones.map((item) =>
        item.id === id ? { ...item, forms: { nominative: value, accusative: value } } : item
      )
    });
  };

  const exportDraft = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${draft.name || "eigene-mischung"}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importDraft = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = configurationSchema.parse(JSON.parse(await file.text()));
      onChange({ ...imported, id: imported.id || createId("mix"), updatedAt: new Date().toISOString() });
      setFormError("");
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Die JSON-Datei konnte nicht gelesen werden.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section data-testid="mix-modal" className="modal" role="dialog" aria-modal="true" aria-labelledby="mix-title" aria-describedby="mix-description">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Eigene Mischung</p>
            <h2 id="mix-title">Mischung konfigurieren</h2>
            <p id="mix-description" className="modal-description">Wähle Aktionen und Orte aus. Klappe Karten auf, wenn du Texte ändern möchtest.</p>
          </div>
          <div className="modal-head-actions">
            <button data-testid="mix-import" className="secondary" onClick={() => fileRef.current?.click()}><Upload size={17} /> JSON importieren</button>
                        <button data-testid="mix-close" className="ghost" onClick={onClose}>Schließen</button>
          </div>
          <input data-testid="mix-import-input" ref={fileRef} hidden type="file" accept="application/json" onChange={importDraft} />
        </div>

        <label className="field full-field">
          <span>Name</span>
          <input data-testid="mix-name" value={draft.name} onChange={(event) => updateName(event.target.value)} />
        </label>

        <div className="config-grid modal-grid">
          <EditableList
            title="Aktionen"
            items={draft.actions}
            kind="actions"
            cardRefs={cardRefs}
            onToggle={(id) => toggle("actions", id)}
            onRemove={(id) => remove("actions", id)}
            onAdd={addAction}
            onLabel={(id, label) => editLabel("actions", id, label)}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            onActionText={editActionText}
          />
          <EditableList
            title="Orte"
            items={draft.zones}
            kind="zones"
            cardRefs={cardRefs}
            onToggle={(id) => toggle("zones", id)}
            onRemove={(id) => remove("zones", id)}
            onAdd={addZone}
            onLabel={(id, label) => editLabel("zones", id, label)}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            onZoneText={editZoneText}
          />
        </div>

        {formError ? <p className="form-warning" role="alert">{formError}</p> : null}
        {saveError ? <p className="form-warning" role="alert">{saveError}</p> : null}

        <div className="modal-footer">
          <p>{draft.actions.filter((item) => item.enabled).length} Aktionen, {draft.zones.filter((item) => item.enabled).length} Orte aktiv. Für Würfe braucht es jeweils mindestens sechs.</p>
          <button data-testid="mix-delete" className="danger" onClick={onDelete}><Trash2 size={17} /> Mischung löschen</button>
          <div className="modal-footer-actions">
                      <button data-testid="mix-export" className="secondary" onClick={exportDraft}><Download size={17} /> JSON exportieren</button>
                      <button data-testid="mix-save" className="primary" onClick={onSave}><Save size={18} /> Mischung speichern</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function EditableList({
  title,
  items,
  kind,
  cardRefs,
  onToggle,
  onRemove,
  onAdd,
  onLabel,
  onActionText,
  expandedIds,
  onExpandedChange,
  onZoneText
}: {
  title: string;
  items: (DiceAction | Zone)[];
  kind: "actions" | "zones";
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onLabel: (id: string, label: string) => void;
  expandedIds: Set<string>;
  onExpandedChange: React.Dispatch<React.SetStateAction<Set<string>>>;
  onActionText?: (id: string, text: string) => void;
  onZoneText?: (id: string, text: string) => void;
}) {
  return (
    <div className="config-list editable-list">
      <div className="list-head">
        <h3>{title}</h3>
        <button data-testid={`add-${kind}`} className="ghost" onClick={onAdd}><Plus size={16} /> Hinzufügen</button>
      </div>
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id);
        const toggleExpanded = () => {
          onExpandedChange((ids) => {
            const nextIds = new Set(ids);
            if (nextIds.has(item.id)) nextIds.delete(item.id);
            else nextIds.add(item.id);
            return nextIds;
          });
        };

        return (
                  <div key={item.id} data-testid={`card-${kind}-${item.id}`} ref={(element) => { cardRefs.current[item.id] = element; }} className={isExpanded ? "editable-item expanded" : "editable-item"}>
            <div className="card-header">
              <input
                        data-testid={`toggle-${kind}-${item.id}`}
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => onToggle(item.id)}
                        aria-label={`${item.label} aktivieren`}
                      />
                      <button data-testid={`card-summary-${kind}-${item.id}`} className="card-summary" type="button" aria-expanded={isExpanded} onClick={toggleExpanded}>
                        <span data-testid={`item-${kind}-title`} className="collapsed-name">{item.label}</span>
                      </button>
                      <button data-testid={`remove-${kind}-${item.id}`} className="trash-icon" type="button" aria-label={`${item.label} entfernen`} onClick={() => onRemove(item.id)}>
                        <Trash2 size={17} />
                      </button>
                    </div>

            {isExpanded ? (
              <div className="card-details">
                <div className="card-icon">{iconFor(item.iconKey, "card-icon-svg")}</div>
                <label className="field">
                  <span>{kind === "actions" ? "Name auf dem Würfel" : "Ort auf dem Würfel"}</span>
                  <input data-testid={`input-label-${kind}-${item.id}`} value={item.label} onChange={(event) => onLabel(item.id, event.target.value)} />
                </label>
                {"instructionTemplate" in item && onActionText ? (
                  <label className="field full-field">
                    <span>Aufgabe</span>
                    <input data-testid={`input-action-${item.id}`} value={actionTextFromTemplate(item.instructionTemplate)} onChange={(event) => onActionText(item.id, event.target.value)} />
                    <small>Der gewürfelte Ort wird automatisch ergänzt. Schreibe optional <code>{"{ort}"}</code> an die gewünschte Stelle im Satz.</small>
                  </label>
                ) : null}
                {"forms" in item && onZoneText ? (
                  <label className="field full-field">
                    <span>Ort im Ergebnistext</span>
                    <input data-testid={`input-zone-${item.id}`} value={item.forms.accusative} onChange={(event) => onZoneText(item.id, event.target.value)} />
                    <small>So erscheint der Ort im Satz, z. B. „den Nacken“ oder „die Hände“.</small>
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}










function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-backdrop confirm-backdrop" role="presentation">
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button data-testid="confirm-cancel" className="secondary" onClick={onCancel}>Abbrechen</button>
          <button data-testid="confirm-confirm" className="danger" onClick={onConfirm}><Trash2 size={17} /> {confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}







