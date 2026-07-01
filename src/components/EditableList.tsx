import { Plus, Trash2 } from "lucide-react";
import { type DiceAction, type Zone } from "@/shared";
import { iconFor } from "@/features/game/icons";

interface EditableListProps {
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
}

export function EditableList({
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
}: EditableListProps) {
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
                  <input data-testid={`input-label-${kind}-${item.id}`} required value={item.label} onChange={(event) => onLabel(item.id, event.target.value)} />
                </label>
                {"instructionTemplate" in item && onActionText ? (
                  <label className="field full-field">
                    <span>Aufgabe</span>
                    <input data-testid={`input-action-${item.id}`} required value={actionTextFromTemplate(item.instructionTemplate)} onChange={(event) => onActionText(item.id, event.target.value)} />
                    <small>Der gewürfelte Ort wird automatisch ergänzt. Schreibe optional <code>{"{ort}"}</code> an die gewünschte Stelle im Satz.</small>
                  </label>
                ) : null}
                {"accusative" in item && onZoneText ? (
                  <label className="field full-field">
                    <span>Ort im Ergebnistext</span>
                    <input data-testid={`input-zone-${item.id}`} required value={item.accusative} onChange={(event) => onZoneText(item.id, event.target.value)} />
                    <small>So erscheint der Ort im Satz, z. B. „den Nacken" oder „die Hände".</small>
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

function actionTextFromTemplate(template: string) {
  return template
    .replaceAll("{zone.accusative}", "{ort}")
    .replaceAll("{zone.nominative}", "{ort}")
    .replaceAll("{zone.label}", "{ort}")
    .replace(/\s+/g, " ")
    .replace(/[\s.]+$/, "")
    .trim();
}
