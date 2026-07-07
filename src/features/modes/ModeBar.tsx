import type { DiceConfiguration } from "@/shared";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import type { RefObject } from "react";
import type { ActiveMode, BuiltInMood } from "./modeTypes";

type ModeBarProps = {
  activeMode: ActiveMode;
  builtInModes: { id: BuiltInMood; label: string }[];
  customMixes: DiceConfiguration[];
  scrollHints: { left: boolean; right: boolean };
  modeScrollRef: RefObject<HTMLDivElement | null>;
  openMixMenuId: string | null;
  onScroll: () => void;
  onScrollModes: (direction: -1 | 1) => void;
  onSelectBuiltIn: (mood: BuiltInMood) => void;
  onOpenExistingMix: (mix: DiceConfiguration) => void;
  onOpenMixEditor: (mix: DiceConfiguration) => void;
  onStartLongPress: (mix: DiceConfiguration) => void;
  onClearLongPress: () => void;
  onToggleMixMenu: (id: string) => void;
  onCopyMix: (mix: DiceConfiguration) => void;
  onRequestDeleteMix: (mix: DiceConfiguration) => void;
  onOpenNewMix: () => void;
};

export function ModeBar({
  activeMode,
  builtInModes,
  customMixes,
  scrollHints,
  modeScrollRef,
  openMixMenuId,
  onScroll,
  onScrollModes,
  onSelectBuiltIn,
  onOpenExistingMix,
  onOpenMixEditor,
  onStartLongPress,
  onClearLongPress,
  onToggleMixMenu,
  onCopyMix,
  onRequestDeleteMix,
  onOpenNewMix
}: ModeBarProps) {
  return (
    <section data-testid="mode-bar" className="mode-bar" aria-label="Modus wählen">
      <div className="mode-scroll-wrap">
        <button
          data-testid="mode-scroll-left"
          className="scroll-hint left"
          aria-label="Modusleiste nach links scrollen"
          disabled={!scrollHints.left}
          onClick={() => onScrollModes(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <div
          data-testid="mode-scroll"
          className="mode-scroll"
          ref={modeScrollRef}
          onScroll={onScroll}
        >
          {builtInModes.map((item) => (
            <button
              key={item.id}
              className={
                activeMode.type === "builtin" && activeMode.mood === item.id
                  ? "chip active"
                  : "chip"
              }
              onClick={() => onSelectBuiltIn(item.id)}
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
                  onClick={() => onOpenExistingMix(mix)}
                  onDoubleClick={() => onOpenMixEditor(mix)}
                  onPointerDown={() => onStartLongPress(mix)}
                  onPointerUp={onClearLongPress}
                  onPointerLeave={onClearLongPress}
                  onPointerCancel={onClearLongPress}
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
                      onClick={() => onToggleMixMenu(mix.id)}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {openMixMenuId === mix.id ? (
                      <div data-testid={`mix-menu-${mix.id}`} className="mix-menu" role="menu">
                        <button
                          data-testid={`mix-edit-${mix.id}`}
                          role="menuitem"
                          onClick={() => onOpenMixEditor(mix)}
                        >
                          Bearbeiten
                        </button>
                        <button
                          data-testid={`mix-copy-${mix.id}`}
                          role="menuitem"
                          onClick={() => onCopyMix(mix)}
                        >
                          Kopieren
                        </button>
                        <button
                          data-testid={`mix-request-delete-${mix.id}`}
                          role="menuitem"
                          className="menu-danger"
                          onClick={() => onRequestDeleteMix(mix)}
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
          <button
            data-testid="open-mix-modal"
            className="primary sticky-add"
            onClick={onOpenNewMix}
          >
            <Plus size={18} /> Eigene Mischung
          </button>
        </div>
        <button
          data-testid="mode-scroll-right"
          className="scroll-hint right"
          aria-label="Modusleiste nach rechts scrollen"
          disabled={!scrollHints.right}
          onClick={() => onScrollModes(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
