import { configurationSchema, type DiceConfiguration } from "@/shared";
import {
  createDraft,
  createId,
  createUniqueMixName,
  loadCustomMixes,
  normalizeName,
  saveCustomMixes
} from "@/utils/mixUtils";
import { formatZodError } from "@/utils/validationUtils";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveMode, ConfirmRequest } from "../modes/modeTypes";
import { cleanupOrphanedZoneIds } from "./mixDraftUtils";

type UseMixControllerOptions = {
  activeMode: ActiveMode;
  setActiveMode: Dispatch<SetStateAction<ActiveMode>>;
  resetRoll: () => void;
  clearRollError: () => void;
  scheduleScrollHintUpdate: () => void;
};

export function useMixController({
  activeMode,
  setActiveMode,
  resetRoll,
  clearRollError,
  scheduleScrollHintUpdate
}: UseMixControllerOptions) {
  const [customMixes, setCustomMixes] = useState<DiceConfiguration[]>(loadCustomMixes);
  const [draft, setDraft] = useState<DiceConfiguration | null>(null);
  const [draftSaveError, setDraftSaveError] = useState("");
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [openMixMenuId, setOpenMixMenuId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const persistMixes = useCallback((nextMixes: DiceConfiguration[]) => {
    setCustomMixes(nextMixes);
    saveCustomMixes(nextMixes);
  }, []);

  const clearLongPress = useCallback(() => {
    if (!longPressTimerRef.current) return;
    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }, []);

  const openNewMix = useCallback(() => {
    setDraftSaveError("");
    setDraft(createDraft());
  }, []);

  const openMixEditor = useCallback(
    (mix: DiceConfiguration) => {
      clearLongPress();
      setDraftSaveError("");
      setDraft(mix);
      setOpenMixMenuId(null);
    },
    [clearLongPress]
  );

  const startLongPress = useCallback(
    (mix: DiceConfiguration) => {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = window.setTimeout(() => openMixEditor(mix), 550);
    },
    [openMixEditor]
  );

  const openExistingMix = useCallback(
    (mix: DiceConfiguration) => {
      clearLongPress();
      setActiveMode({ type: "mix", id: mix.id });
      setOpenMixMenuId(null);
      resetRoll();
      scheduleScrollHintUpdate();
    },
    [clearLongPress, resetRoll, scheduleScrollHintUpdate, setActiveMode]
  );

  const copyMix = useCallback(
    (mix: DiceConfiguration) => {
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
      scheduleScrollHintUpdate();
    },
    [customMixes, persistMixes, resetRoll, scheduleScrollHintUpdate, setActiveMode]
  );

  const saveDraft = useCallback(() => {
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
    const actionsSize = draft.actions.filter((item) => item.enabled).length;
    if (actionsSize < 6) {
      setDraftSaveError("Eine Mischung muss mindestens 6 Aktionen enthalten.");
      return;
    }
    const zoneSize = draft.zones.filter((item) => item.enabled).length;
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
      clearRollError();
    } catch (caught) {
      setDraftSaveError(formatZodError(caught));
    }
  }, [clearRollError, customMixes, draft, persistMixes, resetRoll, setActiveMode]);

  const deleteMix = useCallback(
    (id: string) => {
      const nextMixes = customMixes.filter((mix) => mix.id !== id);
      persistMixes(nextMixes);
      setOpenMixMenuId(null);
      setDraft((currentDraft) => (currentDraft?.id === id ? null : currentDraft));
      if (activeMode.type === "mix" && activeMode.id === id) {
        setActiveMode({ type: "builtin", mood: "romantic" });
        resetRoll();
      }
      scheduleScrollHintUpdate();
    },
    [activeMode, customMixes, persistMixes, resetRoll, scheduleScrollHintUpdate, setActiveMode]
  );

  const requestDeleteMix = useCallback(
    (mix: DiceConfiguration) => {
      setOpenMixMenuId(null);
      setConfirmRequest({
        title: "Mischung löschen?",
        message: `Soll die Mischung „${mix.name}“ wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`,
        confirmLabel: "Mischung löschen",
        onConfirm: () => deleteMix(mix.id)
      });
    },
    [deleteMix]
  );

  const confirmDelete = useCallback(() => {
    confirmRequest?.onConfirm();
    setConfirmRequest(null);
  }, [confirmRequest]);

  useEffect(() => clearLongPress, [clearLongPress]);

  return {
    customMixes,
    draft,
    setDraft,
    draftSaveError,
    confirmRequest,
    setConfirmRequest,
    openMixMenuId,
    setOpenMixMenuId,
    openNewMix,
    openMixEditor,
    startLongPress,
    clearLongPress,
    openExistingMix,
    copyMix,
    saveDraft,
    requestDeleteMix,
    confirmDelete
  };
}
