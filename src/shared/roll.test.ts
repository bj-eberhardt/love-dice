import { describe, expect, test } from "vitest";

import {
  builtInConfigurations,
  createRoll,
  fillTemplate,
  isPairAllowed,
  type DiceAction,
  type DiceConfiguration,
  type Mood,
  type Zone
} from "@/shared";

const builtInMoods = ["romantic", "playful", "bold"] as const;
type BuiltInMood = (typeof builtInMoods)[number];

const expectedInstructions: Record<string, string> = {
  "romantic|kiss|lips": "Küsse die Lippen.",
  "romantic|kiss|neck": "Küsse den Nacken.",
  "romantic|kiss|back": "Küsse den Rücken.",
  "romantic|kiss|hands": "Küsse die Hände.",
  "romantic|kiss|legs": "Küsse die Beine.",
  "romantic|kiss|shoulders": "Küsse die Schultern.",
  "romantic|kiss|ear": "Küsse das Ohr.",
  "romantic|kiss|anywhere": "Küsse überall nach Absprache.",
  "romantic|massage|neck": "Massiere den Nacken.",
  "romantic|massage|back": "Massiere den Rücken.",
  "romantic|massage|hands": "Massiere die Hände.",
  "romantic|massage|legs": "Massiere die Beine.",
  "romantic|massage|shoulders": "Massiere die Schultern.",
  "romantic|massage|anywhere": "Massiere überall nach Absprache.",
  "romantic|stroke|lips": "Streichle die Lippen langsam und aufmerksam.",
  "romantic|stroke|neck": "Streichle den Nacken langsam und aufmerksam.",
  "romantic|stroke|back": "Streichle den Rücken langsam und aufmerksam.",
  "romantic|stroke|hands": "Streichle die Hände langsam und aufmerksam.",
  "romantic|stroke|legs": "Streichle die Beine langsam und aufmerksam.",
  "romantic|stroke|shoulders": "Streichle die Schultern langsam und aufmerksam.",
  "romantic|stroke|ear": "Streichle das Ohr langsam und aufmerksam.",
  "romantic|stroke|anywhere": "Streichle überall nach Absprache langsam und aufmerksam.",
  "romantic|whisper|neck": "Flüstere ein ehrliches Kompliment den Nacken.",
  "romantic|whisper|ear": "Flüstere ein ehrliches Kompliment das Ohr.",
  "romantic|whisper|anywhere": "Flüstere ein ehrliches Kompliment überall nach Absprache.",
  "romantic|wish|anywhere": "Erfülle einen gemeinsamen Wunsch nach Absprache.",
  "romantic|compliment|lips": "Sag etwas Schönes über die Lippen.",
  "romantic|compliment|neck": "Sag etwas Schönes über den Nacken.",
  "romantic|compliment|back": "Sag etwas Schönes über den Rücken.",
  "romantic|compliment|hands": "Sag etwas Schönes über die Hände.",
  "romantic|compliment|legs": "Sag etwas Schönes über die Beine.",
  "romantic|compliment|shoulders": "Sag etwas Schönes über die Schultern.",
  "romantic|compliment|ear": "Sag etwas Schönes über das Ohr.",
  "romantic|compliment|anywhere": "Sag etwas Schönes über überall nach Absprache.",
  "romantic|pause|anywhere": "Haltet kurz inne und fragt einander, was gerade gut tut.",
  "romantic|surprise|lips": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Lippen.",
  "romantic|surprise|neck": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Nacken.",
  "romantic|surprise|back": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Rücken.",
  "romantic|surprise|hands": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Hände.",
  "romantic|surprise|legs": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Beine.",
  "romantic|surprise|shoulders":
    "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Schultern.",
  "romantic|surprise|ear": "Überrasche dein Gegenüber mit einer zärtlichen Idee für das Ohr.",
  "romantic|surprise|anywhere":
    "Überrasche dein Gegenüber mit einer zärtlichen Idee für überall nach Absprache.",
  "playful|kiss|lips": "Küsse die Lippen.",
  "playful|kiss|neck": "Küsse den Nacken.",
  "playful|kiss|back": "Küsse den Rücken.",
  "playful|kiss|hands": "Küsse die Hände.",
  "playful|kiss|legs": "Küsse die Beine.",
  "playful|kiss|shoulders": "Küsse die Schultern.",
  "playful|kiss|ear": "Küsse das Ohr.",
  "playful|kiss|anywhere": "Küsse überall nach Absprache.",
  "playful|massage|neck": "Massiere den Nacken.",
  "playful|massage|back": "Massiere den Rücken.",
  "playful|massage|hands": "Massiere die Hände.",
  "playful|massage|legs": "Massiere die Beine.",
  "playful|massage|shoulders": "Massiere die Schultern.",
  "playful|massage|anywhere": "Massiere überall nach Absprache.",
  "playful|stroke|lips": "Streichle die Lippen langsam und aufmerksam.",
  "playful|stroke|neck": "Streichle den Nacken langsam und aufmerksam.",
  "playful|stroke|back": "Streichle den Rücken langsam und aufmerksam.",
  "playful|stroke|hands": "Streichle die Hände langsam und aufmerksam.",
  "playful|stroke|legs": "Streichle die Beine langsam und aufmerksam.",
  "playful|stroke|shoulders": "Streichle die Schultern langsam und aufmerksam.",
  "playful|stroke|ear": "Streichle das Ohr langsam und aufmerksam.",
  "playful|stroke|anywhere": "Streichle überall nach Absprache langsam und aufmerksam.",
  "playful|whisper|neck": "Flüstere ein ehrliches Kompliment den Nacken.",
  "playful|whisper|ear": "Flüstere ein ehrliches Kompliment das Ohr.",
  "playful|whisper|anywhere": "Flüstere ein ehrliches Kompliment überall nach Absprache.",
  "playful|surprise|lips": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Lippen.",
  "playful|surprise|neck": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Nacken.",
  "playful|surprise|back": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Rücken.",
  "playful|surprise|hands": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Hände.",
  "playful|surprise|legs": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Beine.",
  "playful|surprise|shoulders":
    "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Schultern.",
  "playful|surprise|ear": "Überrasche dein Gegenüber mit einer zärtlichen Idee für das Ohr.",
  "playful|surprise|anywhere":
    "Überrasche dein Gegenüber mit einer zärtlichen Idee für überall nach Absprache.",
  "playful|wish|anywhere": "Erfülle einen gemeinsamen Wunsch nach Absprache.",
  "playful|tickle|neck": "Kitzle den Nacken spielerisch.",
  "playful|tickle|back": "Kitzle den Rücken spielerisch.",
  "playful|tickle|hands": "Kitzle die Hände spielerisch.",
  "playful|tickle|legs": "Kitzle die Beine spielerisch.",
  "playful|tickle|shoulders": "Kitzle die Schultern spielerisch.",
  "playful|tickle|ear": "Kitzle das Ohr spielerisch.",
  "playful|tickle|anywhere": "Kitzle überall nach Absprache spielerisch.",
  "playful|compliment|lips": "Sag etwas Schönes über die Lippen.",
  "playful|compliment|neck": "Sag etwas Schönes über den Nacken.",
  "playful|compliment|back": "Sag etwas Schönes über den Rücken.",
  "playful|compliment|hands": "Sag etwas Schönes über die Hände.",
  "playful|compliment|legs": "Sag etwas Schönes über die Beine.",
  "playful|compliment|shoulders": "Sag etwas Schönes über die Schultern.",
  "playful|compliment|ear": "Sag etwas Schönes über das Ohr.",
  "playful|compliment|anywhere": "Sag etwas Schönes über überall nach Absprache.",
  "bold|kiss|lips": "Küsse die Lippen.",
  "bold|kiss|neck": "Küsse den Nacken.",
  "bold|kiss|back": "Küsse den Rücken.",
  "bold|kiss|hands": "Küsse die Hände.",
  "bold|kiss|legs": "Küsse die Beine.",
  "bold|kiss|ear": "Küsse das Ohr.",
  "bold|kiss|nipple": "Küsse den Nippel.",
  "bold|kiss|thighs": "Küsse die Schenkel.",
  "bold|kiss|breasts": "Küsse die Brüste.",
  "bold|kiss|genitals": "Küsse das Geschlechtsteil.",
  "bold|kiss|butt": "Küsse den Po.",
  "bold|kiss|anywhere": "Küsse überall nach Absprache.",
  "bold|bite|lips": "Beiße vorsichtig in die Lippen.",
  "bold|bite|neck": "Beiße vorsichtig in den Nacken.",
  "bold|bite|back": "Beiße vorsichtig in den Rücken.",
  "bold|bite|hands": "Beiße vorsichtig in die Hände.",
  "bold|bite|legs": "Beiße vorsichtig in die Beine.",
  "bold|bite|ear": "Beiße vorsichtig in das Ohr.",
  "bold|bite|nipple": "Beiße vorsichtig in den Nippel.",
  "bold|bite|thighs": "Beiße vorsichtig in die Schenkel.",
  "bold|bite|breasts": "Beiße vorsichtig in die Brüste.",
  "bold|bite|butt": "Beiße vorsichtig in den Po.",
  "bold|bite|anywhere": "Beiße vorsichtig in überall nach Absprache.",
  "bold|massage|neck": "Massiere den Nacken.",
  "bold|massage|back": "Massiere den Rücken.",
  "bold|massage|hands": "Massiere die Hände.",
  "bold|massage|legs": "Massiere die Beine.",
  "bold|massage|thighs": "Massiere die Schenkel.",
  "bold|massage|breasts": "Massiere die Brüste.",
  "bold|massage|genitals": "Massiere das Geschlechtsteil.",
  "bold|massage|butt": "Massiere den Po.",
  "bold|massage|anywhere": "Massiere überall nach Absprache.",
  "bold|stroke|lips": "Streichle die Lippen langsam und aufmerksam.",
  "bold|stroke|neck": "Streichle den Nacken langsam und aufmerksam.",
  "bold|stroke|back": "Streichle den Rücken langsam und aufmerksam.",
  "bold|stroke|hands": "Streichle die Hände langsam und aufmerksam.",
  "bold|stroke|legs": "Streichle die Beine langsam und aufmerksam.",
  "bold|stroke|ear": "Streichle das Ohr langsam und aufmerksam.",
  "bold|stroke|nipple": "Streichle den Nippel langsam und aufmerksam.",
  "bold|stroke|thighs": "Streichle die Schenkel langsam und aufmerksam.",
  "bold|stroke|breasts": "Streichle die Brüste langsam und aufmerksam.",
  "bold|stroke|genitals": "Streichle das Geschlechtsteil langsam und aufmerksam.",
  "bold|stroke|butt": "Streichle den Po langsam und aufmerksam.",
  "bold|stroke|anywhere": "Streichle überall nach Absprache langsam und aufmerksam.",
  "bold|surprise|lips": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Lippen.",
  "bold|surprise|neck": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Nacken.",
  "bold|surprise|back": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Rücken.",
  "bold|surprise|hands": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Hände.",
  "bold|surprise|legs": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Beine.",
  "bold|surprise|ear": "Überrasche dein Gegenüber mit einer zärtlichen Idee für das Ohr.",
  "bold|surprise|nipple": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Nippel.",
  "bold|surprise|thighs": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Schenkel.",
  "bold|surprise|breasts": "Überrasche dein Gegenüber mit einer zärtlichen Idee für die Brüste.",
  "bold|surprise|genitals":
    "Überrasche dein Gegenüber mit einer zärtlichen Idee für das Geschlechtsteil.",
  "bold|surprise|butt": "Überrasche dein Gegenüber mit einer zärtlichen Idee für den Po.",
  "bold|surprise|anywhere":
    "Überrasche dein Gegenüber mit einer zärtlichen Idee für überall nach Absprache.",
  "bold|rub|neck": "Reibe den Nacken langsam nach Absprache.",
  "bold|rub|back": "Reibe den Rücken langsam nach Absprache.",
  "bold|rub|hands": "Reibe die Hände langsam nach Absprache.",
  "bold|rub|legs": "Reibe die Beine langsam nach Absprache.",
  "bold|rub|thighs": "Reibe die Schenkel langsam nach Absprache.",
  "bold|rub|breasts": "Reibe die Brüste langsam nach Absprache.",
  "bold|rub|genitals": "Reibe das Geschlechtsteil langsam nach Absprache.",
  "bold|rub|nipple": "Reibe den Nippel langsam nach Absprache.",
  "bold|rub|butt": "Reibe den Po langsam nach Absprache.",
  "bold|rub|anywhere": "Reibe überall nach Absprache langsam nach Absprache.",
  "bold|seduce|lips": "Verführe dein Gegenüber mit Fokus auf die Lippen.",
  "bold|seduce|neck": "Verführe dein Gegenüber mit Fokus auf den Nacken.",
  "bold|seduce|ear": "Verführe dein Gegenüber mit Fokus auf das Ohr.",
  "bold|seduce|nipple": "Verführe dein Gegenüber mit Fokus auf den Nippel.",
  "bold|seduce|thighs": "Verführe dein Gegenüber mit Fokus auf die Schenkel.",
  "bold|seduce|breasts": "Verführe dein Gegenüber mit Fokus auf die Brüste.",
  "bold|seduce|genitals": "Verführe dein Gegenüber mit Fokus auf das Geschlechtsteil.",
  "bold|seduce|butt": "Verführe dein Gegenüber mit Fokus auf den Po.",
  "bold|seduce|anywhere": "Verführe dein Gegenüber mit Fokus auf überall nach Absprache.",
  "bold|smell|lips": "Rieche aufmerksam. Konzentration auf die Lippen.",
  "bold|smell|neck": "Rieche aufmerksam. Konzentration auf den Nacken.",
  "bold|smell|hands": "Rieche aufmerksam. Konzentration auf die Hände.",
  "bold|smell|ear": "Rieche aufmerksam. Konzentration auf das Ohr.",
  "bold|smell|nipple": "Rieche aufmerksam. Konzentration auf den Nippel.",
  "bold|smell|thighs": "Rieche aufmerksam. Konzentration auf die Schenkel.",
  "bold|smell|breasts": "Rieche aufmerksam. Konzentration auf die Brüste.",
  "bold|smell|butt": "Rieche aufmerksam. Konzentration auf den Po.",
  "bold|smell|anywhere": "Rieche aufmerksam. Konzentration auf überall nach Absprache.",
  "bold|suck|lips": "Sauge sanft an die Lippen, wenn es für euch beide passt.",
  "bold|suck|nipple": "Sauge sanft an den Nippel, wenn es für euch beide passt.",
  "bold|suck|breasts": "Sauge sanft an die Brüste, wenn es für euch beide passt.",
  "bold|suck|genitals": "Sauge sanft an das Geschlechtsteil, wenn es für euch beide passt.",
  "bold|suck|ear": "Sauge sanft an das Ohr, wenn es für euch beide passt.",
  "bold|suck|thighs": "Sauge sanft an die Schenkel, wenn es für euch beide passt.",
  "bold|suck|anywhere": "Sauge sanft an überall nach Absprache, wenn es für euch beide passt.",
  "bold|pause|anywhere": "Haltet kurz inne und fragt einander, was gerade gut tut."
};

const expectationKey = (mood: BuiltInMood, action: DiceAction, zone: Zone) =>
  `${mood}|${action.id}|${zone.id}`;

const requireExpectedInstruction = (mood: BuiltInMood, action: DiceAction, zone: Zone) => {
  const key = expectationKey(mood, action, zone);
  const expected = expectedInstructions[key];
  if (expected === undefined) {
    throw new Error(`Missing expected instruction for ${key}. Add it to expectedInstructions.`);
  }
  return expected;
};

const duplicateAction = (action: DiceAction, mood: Mood): DiceAction[] =>
  Array.from({ length: 6 }, () => ({
    ...action,
    enabled: true,
    moods: [mood]
  }));

const duplicateZone = (zone: Zone, mood: Mood): Zone[] =>
  Array.from({ length: 6 }, () => ({
    ...zone,
    enabled: true,
    moods: [mood]
  }));

const configForPair = (mood: BuiltInMood, action: DiceAction, zone: Zone): DiceConfiguration => ({
  id: `${mood}-${action.id}-${zone.id}`,
  name: "Pair Test",
  updatedAt: new Date(0).toISOString(),
  actions: duplicateAction(action, mood),
  zones: duplicateZone(zone, mood)
});

describe("createRoll built-in mood combinations", () => {
  for (const mood of builtInMoods) {
    const config = builtInConfigurations[mood];

    describe(mood, () => {
      for (const action of config.actions) {
        for (const zone of config.zones) {
          const title = `${action.id} + ${zone.id}`;

          test(title, () => {
            const pairConfig = configForPair(mood, action, zone);

            if (!isPairAllowed(action, zone)) {
              expect(expectedInstructions[expectationKey(mood, action, zone)]).toBeUndefined();
              expect(() => createRoll(pairConfig, mood, () => 0)).toThrow(
                "Keine gültige Kombination aus Aktion und Zone gefunden."
              );
              return;
            }

            const expectedInstruction = requireExpectedInstruction(mood, action, zone);
            expect(expectedInstruction).toBe(fillTemplate(action, zone));

            const roll = createRoll(pairConfig, mood, () => 0);

            expect(roll.action.id).toBe(action.id);
            expect(roll.zone.id).toBe(zone.id);
            expect(roll.instruction).toBe(expectedInstruction);
          });
        }
      }
    });
  }
});

const rollKey = (roll: { action: DiceAction; zone: Zone }) => `${roll.action.id}::${roll.zone.id}`;

describe("createRoll history weighting", () => {
  test("does not repeat a combination while unseen valid combinations exist", () => {
    const config = builtInConfigurations.romantic;
    const history: ReturnType<typeof createRoll>[] = [];
    const seen = new Set<string>();

    for (let index = 0; index < 12; index += 1) {
      const roll = createRoll(config, "romantic", () => 0, { history });
      const key = rollKey(roll);

      expect(seen.has(key)).toBe(false);
      expect(roll.actionFaces.some((face) => face.id === roll.action.id)).toBe(true);
      expect(roll.zoneFaces.some((face) => face.id === roll.zone.id)).toBe(true);

      seen.add(key);
      history.push(roll);
    }
  });

  test("falls back after all combinations were seen and prefers less frequent actions and zones", () => {
    const config = builtInConfigurations.romantic;
    const validPairs = config.actions.flatMap((action) =>
      config.zones.filter((zone) => isPairAllowed(action, zone)).map((zone) => ({ action, zone }))
    );
    const overloadedPair = validPairs[0];
    const history = [
      ...validPairs,
      ...Array.from({ length: 8 }, () => overloadedPair)
    ].map(({ action, zone }) => ({
      action: { ...action, faceIndex: 0 },
      zone: { ...zone, faceIndex: 0 },
      actionFaces: [],
      zoneFaces: [],
      instruction: fillTemplate(action, zone)
    }));

    const roll = createRoll(config, "romantic", () => 0, { history });

    expect(roll.action.id).not.toBe(overloadedPair.action.id);
    expect(roll.zone.id).not.toBe(overloadedPair.zone.id);
  });
});
