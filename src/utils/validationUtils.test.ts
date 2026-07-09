import { describe, expect, test } from "vitest";
import { z, ZodError } from "zod";

import { formatZodError } from "./validationUtils";

describe("formatZodError", () => {
  test("formats a single custom Zod issue with its path", () => {
    const result = z
      .object({ label: z.string().refine(() => false, "Label ist ungültig") })
      .safeParse({ label: "Test" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe("label: Label ist ungültig");
    }
  });

  test("maps too_small Zod issues to a required-field message", () => {
    const result = z.object({ name: z.string().min(1) }).safeParse({ name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe("name: Feld erforderlich");
    }
  });

  test("uses the original Zod message for non-custom and non-too_small issues", () => {
    const result = z.object({ amount: z.number() }).safeParse({ amount: "viel" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe(
        "amount: Invalid input: expected number, received string"
      );
    }
  });

  test("summarizes multiple unique Zod messages and keeps nested paths", () => {
    const result = z
      .object({
        actions: z.array(z.object({ label: z.string().min(1) })),
        zones: z.array(
          z.object({ text: z.object({ de: z.object({ dative: z.string().min(1) }) }) })
        )
      })
      .safeParse({
        actions: [{ label: "" }],
        zones: [{ text: { de: { dative: "" } } }]
      });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toBe(
        [
          "Die Mischung ist unvollständig. Prüfe alle Felder auf leere Werte:",
          "actions -> 0 -> label: Feld erforderlich",
          "zones -> 0 -> text -> de -> dative: Feld erforderlich"
        ].join("\n")
      );
    }
  });

  test("deduplicates identical formatted Zod messages", () => {
    const error = new ZodError([
      { code: "custom", path: ["name"], message: "Doppelt" },
      { code: "custom", path: ["name"], message: "Doppelt" }
    ]);

    expect(formatZodError(error)).toBe("name: Doppelt");
  });

  test("falls back for empty Zod errors", () => {
    expect(formatZodError(new ZodError([]))).toBe("Die Mischung ist unvollständig.");
  });

  test("returns plain Error messages unchanged", () => {
    expect(formatZodError(new Error("Import fehlgeschlagen"))).toBe("Import fehlgeschlagen");
  });

  test("returns the generic fallback for unknown errors", () => {
    expect(formatZodError("kaputt")).toBe("Die Mischung ist unvollständig.");
  });
});
