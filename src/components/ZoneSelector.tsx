import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { type Zone } from "@/shared";

interface ZoneSelectorProps {
  selectedZoneIds: string[] | undefined;
  availableZones: Zone[];
  onChange: (zoneIds: string[] | undefined) => void;
  disabled?: boolean;
}

export function ZoneSelector({
  selectedZoneIds,
  availableZones,
  onChange,
  disabled = false
}: ZoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIds = selectedZoneIds ?? [];
  const selectedZones = selectedIds
    .map((id) => availableZones.find((zone) => zone.id === id))
    .filter((zone): zone is Zone => Boolean(zone));

  useEffect(() => {
    if (!isOpen) return;

    const closeWhenOutside = (target: EventTarget | null) => {
      if (!rootRef.current?.contains(target as Node | null)) setIsOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => closeWhenOutside(event.target);
    const onFocusIn = (event: FocusEvent) => closeWhenOutside(event.target);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const emitSelection = (zoneIds: string[]) => onChange(zoneIds.length > 0 ? zoneIds : undefined);

  const toggleZone = (zoneId: string) => {
    const updated = selectedIds.includes(zoneId)
      ? selectedIds.filter((id) => id !== zoneId)
      : [...selectedIds, zoneId];
    emitSelection(updated);
  };

  const removeChip = (zoneId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    emitSelection(selectedIds.filter((id) => id !== zoneId));
  };

  const clearAll = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(undefined);
  };

  return (
    <div
      className="zone-selector"
      data-selection-state={selectedIds.length > 0 ? "restricted" : "all"}
      ref={rootRef}
    >
      <div
        data-testid="zone-selector-input"
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={isOpen ? "zone-selector-input open" : "zone-selector-input"}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span className="zone-selector-values">
          {selectedZones.length > 0 ? (
            selectedZones.map((zone) => (
              <span
                key={zone.id}
                data-testid={`zone-chip-${zone.id}`}
                data-zone-label={zone.label}
                className="zone-chip"
              >
                {zone.label}
                <button
                  data-testid={`zone-chip-remove-${zone.id}`}
                  className="zone-chip-remove"
                  type="button"
                  aria-label={`${zone.label} entfernen`}
                  onClick={(event) => removeChip(zone.id, event)}
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <span data-testid="zone-selector-placeholder" className="zone-selector-placeholder">
              Alle Orte erlaubt
            </span>
          )}
        </span>
        <ChevronDown className="zone-selector-chevron" size={16} aria-hidden="true" />
      </div>

      {isOpen ? (
        <div className="zone-selector-dropdown" role="listbox" aria-label="Erlaubte Orte">
          <div className="zone-selector-actions">
            <button
              data-testid="zone-selector-clear"
              type="button"
              className="ghost small-action"
              onClick={clearAll}
            >
              Alle Orte
            </button>
            <button
              data-testid="zone-selector-all"
              type="button"
              className="ghost small-action"
              onClick={(event) => {
                event.stopPropagation();
                emitSelection(availableZones.map((zone) => zone.id));
              }}
            >
              Alle auswählen
            </button>
          </div>
          {availableZones.map((zone) => {
            const checked = selectedIds.includes(zone.id);
            return (
              <label
                key={zone.id}
                data-testid={`zone-option-${zone.id}`}
                data-zone-label={zone.label}
                className="zone-checkbox-item"
              >
                <input
                  data-testid={`zone-option-checkbox-${zone.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleZone(zone.id)}
                />
                <span>{zone.label}</span>
                {checked ? <Check size={16} aria-hidden="true" /> : null}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
