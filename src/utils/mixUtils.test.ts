import { describe, expect, test } from "vitest";

import { isPairAllowed } from "@/shared";

import { createDraft } from "./mixUtils";

describe("createDraft", () => {
  test("loads only actions that have allowed default zone combinations", () => {
    const draft = createDraft();

    for (const action of draft.actions) {
      const allowedDefaultZones = draft.zones.filter((zone) => isPairAllowed(action, zone));

      expect(
        allowedDefaultZones.map((zone) => zone.id),
        `${action.id} needs at least one allowed default zone in the mix modal draft`
      ).not.toHaveLength(0);
    }
  });
});
