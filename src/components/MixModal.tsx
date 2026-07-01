import { configurationSchema, type DiceConfiguration } from "@/shared";
import { Download, Save, Trash2, Upload, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { EditableList } from "./EditableList";
import { formatZodError } from "@/utils/validationUtils";

interface MixModalProps {
  draft: DiceConfiguration;
  saveError: string;
  onChange: (draft: DiceConfiguration) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function MixModal({ draft, saveError, onChange, onClose, onSave, onDelete }: MixModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [formError, setFormError] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const scrollToCard = (id: string) => {
    setExpandedIds((ids) => new Set(ids).add(id));
    window.setTimeout(
      () => cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }),
      30
    );
  };

  const updateName = (name: string) => onChange({ ...draft, name });

  const toggle = (kind: "actions" | "zones", id: string) => {
    onChange({
      ...draft,
      [kind]: draft[kind].map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    });
  };

  const remove = (kind: "actions" | "zones", id: string) =>
    onChange({ ...draft, [kind]: draft[kind].filter((item) => item.id !== id) });

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
          moods: ["custom"],
          useInCustom: true
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
          accusative: "die neue Zone",
          iconKey: "consent",
          enabled: true,
          moods: ["custom"],
          useInCustom: true
        }
      ]
    });
    scrollToCard(id);
  };

  const editLabel = (kind: "actions" | "zones", id: string, label: string) => {
    onChange({
      ...draft,
      [kind]: draft[kind].map((item) => (item.id === id ? { ...item, label } : item))
    });
  };

  const editActionText = (id: string, text: string) => {
    onChange({
      ...draft,
      actions: draft.actions.map((item) =>
        item.id === id ? { ...item, instructionTemplate: templateFromActionText(text) } : item
      )
    });
  };

  const editZoneText = (id: string, value: string) => {
    onChange({
      ...draft,
      zones: draft.zones.map((item) => (item.id === id ? { ...item, accusative: value } : item))
    });
  };
  const editZoneRestrictions = (actionId: string, zoneIds: string[] | undefined) => {
    onChange({
      ...draft,
      actions: draft.actions.map((item) =>
        item.id === actionId ? { ...item, allowedZoneIds: zoneIds } : item
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
      onChange({
        ...imported,
        id: imported.id || createId("mix"),
        updatedAt: new Date().toISOString()
      });
      setFormError("");
    } catch (caught) {
      setFormError(formatZodError(caught));
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        data-testid="mix-modal"
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mix-title"
        aria-describedby="mix-description"
      >
        <button
          data-testid="mix-close"
          className="icon-button modal-close"
          aria-label="Schließen"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Eigene Mischung</p>
            <h2 id="mix-title">Mischung konfigurieren</h2>
            <p id="mix-description" className="modal-description">
              Wähle Aktionen und Orte aus. Klappe Karten auf, wenn du Texte ändern möchtest.
            </p>
          </div>

          <input
            data-testid="mix-import-input"
            ref={fileRef}
            hidden
            type="file"
            accept="application/json"
            onChange={importDraft}
          />
        </div>
        <div className="mix-name-row">
          <label className="field mix-name-field">
            <span>Name</span>
            <input
              data-testid="mix-name"
              required
              value={draft.name}
              onChange={(event) => updateName(event.target.value)}
            />
          </label>
          <button
            data-testid="mix-import"
            className="secondary mix-import-button"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={17} /> JSON importieren
          </button>
        </div>
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
            availableZones={draft.zones}
            onZoneRestrictionChange={editZoneRestrictions}
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
        {formError ? (
          <p className="form-warning" role="alert">
            {formError}
          </p>
        ) : null}
        {saveError ? (
          <p className="form-warning" role="alert">
            {saveError}
          </p>
        ) : null}
        <div className="modal-footer">
          <p>
            {draft.actions.filter((item) => item.enabled).length} Aktionen,{" "}
            {draft.zones.filter((item) => item.enabled).length} Orte aktiv. Für Würfe braucht es
            jeweils mindestens sechs.
          </p>
          <button data-testid="mix-delete" className="danger" onClick={onDelete}>
            <Trash2 size={17} /> Mischung löschen
          </button>
          <div className="modal-footer-actions">
            <button data-testid="mix-export" className="secondary" onClick={exportDraft}>
              <Download size={17} /> JSON exportieren
            </button>
            <button data-testid="mix-save" className="primary" onClick={onSave}>
              <Save size={18} /> Mischung speichern
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function templateFromActionText(text: string) {
  const cleanText = text.trim().replace(/[.]+$/, "");
  if (!cleanText) return "";
  return cleanText.includes("{ort}")
    ? `${cleanText.replaceAll("{ort}", "{zone.accusative}")}.`
    : `${cleanText} {zone.accusative}.`;
}
