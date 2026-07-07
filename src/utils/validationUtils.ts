import { ZodError } from "zod";

export function formatZodError(error: unknown): string {
  if (error instanceof ZodError) {
    const messages = new Set<string>();

    error.errors.forEach((err) => {
      const path = err.path.join(" -> ");

      if (err.code === "custom") {
        messages.add(`${path}: ${err.message}`);
      } else if (err.code === "too_small") {
        messages.add(`${path}: Feld erforderlich`);
      } else {
        messages.add(`${path}: ${err.message}`);
      }
    });

    if (messages.size > 1) {
      return `Die Mischung ist unvollständig. Prüfe alle Felder auf leere Werte:\n${Array.from(messages).join("\n")}`;
    }

    return Array.from(messages)[0] || "Die Mischung ist unvollständig.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Die Mischung ist unvollständig.";
}
