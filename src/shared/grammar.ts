import type { DiceConfiguration, Zone } from "./schemas/configuration.js";

const normalizeSpaces = (value: string) => value.trim().replace(/\s+/g, " ");

const withDativePluralEnding = (phrase: string) => {
  const words = phrase.split(/\s+/);
  const lastWord = words.at(-1);
  if (!lastWord || /[ns]$/i.test(lastWord)) return phrase;
  words[words.length - 1] = `${lastWord}n`;
  return words.join(" ");
};

export function derivePluralDative(accusative: string) {
  const trimmed = normalizeSpaces(accusative);
  if (!trimmed) return trimmed;
  const [article, ...rest] = trimmed.split(" ");
  if (article.toLocaleLowerCase("de-DE") !== "die" || rest.length === 0) return trimmed;
  return `den ${withDativePluralEnding(rest.join(" "))}`;
}

export function createGermanZoneText(accusative: string, dative = derivePluralDative(accusative)) {
  return { de: { accusative, dative } };
}

export function withMissingDatives<T extends DiceConfiguration>(configuration: T): T {
  return {
    ...configuration,
    zones: configuration.zones.map((zone) => {
      const accusative = zone.text.de.accusative;
      const dative = zone.text.de.dative.trim() || derivePluralDative(accusative);
      return {
        ...zone,
        text: {
          ...zone.text,
          de: { accusative, dative }
        }
      };
    })
  };
}

export function zoneAccusative(zone: Zone) {
  return zone.text.de.accusative;
}

export function zoneDative(zone: Zone) {
  return zone.text.de.dative;
}
