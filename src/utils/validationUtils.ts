import { ZodError } from "zod";

export function formatZodError(error: unknown): string {
  if (error instanceof ZodError) {
    // Sammle alle eindeutigen Fehlermeldungen
    const messages = new Set<string>();

    error.errors.forEach((err) => {
      const path = err.path.join(" → ");

      // Erstelle eine aussagekräftige Fehlermeldung
      if (err.code === "custom") {
        messages.add(`${path}: ${err.message}`);
      } else if (err.code === "too_small") {
        messages.add(`${path}: Feld erforderlich`);
      } else {
        messages.add(`${path}: ${err.message}`);
      }
    });

    // Wenn wir mehrere Fehlermeldungen haben, gib eine Zusammenfassung
    if (messages.size > 1) {
      return `Die Mischung ist unvollständig. Prüfe alle Felder auf leere Werte:\n${Array.from(messages).join("\n")}`;
    }

    // Sonst zeige die erste/einzige Fehlermeldung
    return Array.from(messages)[0] || "Die Mischung ist unvollständig.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Die Mischung ist unvollständig.";
}
