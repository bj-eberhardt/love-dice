# AGENT.md

## Projektüberblick

Dieses Projekt ist eine reine Browser-App für ein einvernehmliches Paar-Würfelspiel. Es gibt kein Backend. Alle Inhalte und Einstellungen werden clientseitig verarbeitet und per `localStorage` persistiert.

Aktueller Dev-Port: `5544`.
Produktionsauslieferung: statisches Frontend via nginx Docker-Image auf Host-Port `8080`.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Three Fiber / Three.js für die 3D-Würfel
- Zod für Konfigurationsschemas
- lucide-react für UI-Icons
- ESLint + Prettier
- Docker für Dev- und Prod-Workflows

## Architekturentscheidungen

- Frontend-only: Kein `apps/api`, kein Fastify, keine Datenbank, keine API-Routen.
- Eine einzige root `package.json`: Keine npm workspaces, keine internen Packages und kein `apps`-Verzeichnis mehr.
- Shared-Domain-Code liegt unter `src/shared`.
- Konfiguration wird lokal im Browser im Local-Storage-Key `love-dice-config` gespeichert.
- Der Wurf ist regelbasiert und deterministisch animiert: Das Ergebnis wird vor der Animation bestimmt, danach werden die Würfel so animiert, dass die passende Fläche vorne sichtbar und direkt lesbar ist.

## Wichtige Dateien

- `package.json`: Root-Scripts und Dependencies.
- `vite.config.ts`: Vite-Konfiguration, Dev-Port `5544`, Build nach `dist/client`.
- `src/app.tsx`: Hauptkomponente, Consent, Modusleiste, Wurf-Flow, eigene Mischungen mit Modal, localStorage-Persistenz sowie JSON-Import/-Export.
- `src/features/dice3d/DiceStage.tsx`: 3D-Würfel, Texturen, Rollanimation.
- `src/features/game/icons.tsx`: Icon-Mapping für Aktionen/Zonen.
- `src/shared/defaults/configuration.ts`: Standard-Aktionen und -Zonen.
- `src/shared/schemas/configuration.ts`: Zod-Schemas und TypeScript-Typen.
- `src/shared/roll.ts`: Auswahl der sechs Würfelflächen und gültigen Ergebnispaare.
- `src/styles/global.css`: Globales Styling.
- `Dockerfile`: Multi-Stage-Prod-Build mit `npm ci`, nginx Runtime.
- `docker-compose.dev.yml`: Dev-Container auf Port `5544`.
- `docker-compose.yml`: Prod-Container auf Host-Port `8080`.

## Commands

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Playwright UI tests:

- Add devDependency: @playwright/test
- Create tests under tests/ui and a playwright.config.ts that runs a preview server on port 5545 so tests can run parallel to dev on 5544.
- Scripts added: preview:test, test:ui, test:ui:headed, test:ui:debug

When adding tests, prefer data-testid attributes for selectors and use test.step to describe test phases. try to structure tests as best as possible. try to reuse helper instead of code duplication.

test the changes by using headless test run (npm run test:ui:headless) and analyze the errors of the test run.

Docker dev:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Docker prod:

```bash
docker compose up --build
```

## Regeln für Änderungen

- Nach jeder durchgeführten Aktion oder strukturellen Änderung muss `AGENT.md` aktualisiert werden, sodass AI-Tools den aktuellen Projektstand, die Architektur und wichtige Entscheidungen sofort erkennen.
- Umlaute und deutschsprachige Texte immer direkt als UTF-8 schreiben, z. B. `für`, `Würfel`, `Änderung`, nicht als Umschreibung wie `für` oder `Würfel`.
- Keine Backend-Komponenten einführen, solange es keinen klaren Need gibt.
- Keine API-/Serverpersistenz annehmen; localStorage ist die Quelle für nutzerangepasste Konfiguration.
- Bei neuen Spielinhalten zuerst `configuration.ts` und die Zod-Schemas beachten.
- Die Wurf-Logik in `roll.ts` sollte deterministisch testbar bleiben. Wenn Tests ergänzt werden, `createRoll(..., random)` mit injiziertem Random nutzen.
- UI-Icons bevorzugt über `lucide-react` oder das bestehende `iconFor` Mapping ergänzen.
- Build-Artefakte gehören nach `dist/client`.
- Der Dev-Port soll `5544` bleiben.
- Docker-Prod soll `npm ci` verwenden, nicht `npm install`.

## Bekannte Punkte

- Beim Build kann Vite wegen Three.js vor großen Chunks warnen. Das ist aktuell akzeptiert.
- Die Würfel landen nach dem Rollen mit der Ergebnisfläche vorne, nicht oben. Zusatzrotationen müssen volle 2π-Umdrehungen sein, damit am Animationsende kein sichtbarer Sprung entsteht.\n- Die Würfel-Icons sind derzeit Canvas-Texturen mit Label/Markierung, nicht echte SVG-Texturen pro Symbol. Falls echte SVG-Face-Texturen umgesetzt werden, sollte das in `DiceStage.tsx` oder einer separaten Texture-Utility passieren.
- Eigene Mischungen werden im localStorage-Key `love-dice-custom-mixes` gespeichert. Das Modal erlaubt Aktivieren/Deaktivieren, Hinzufügen, Entfernen, Umbenennen sowie JSON-Import/-Export.

## Änderungslog

- AGENT.md auf UTF-8-Umlaute umgestellt und verbindliche Regeln ergänzt: Änderungen nach jeder Aktion dokumentieren, Umlaute immer direkt als UTF-8 schreiben.

- Eigene Mischungen, frontseitige Würfel-Ergebnisfläche, flickerfreie Endrotation und angepasste Rundenbuttons umgesetzt. Die Spielsteuerung soll bewusst einfach bleiben: Es gibt nur einen Button zum Würfeln bzw. Neu würfeln.

- Eigene Mischungen können über einen sichtbaren Stift-Button bearbeitet werden. Konfigurationen dürfen gespeichert werden, auch wenn weniger als sechs Einträge vorhanden sind; die Mindestanzahl wird erst beim Würfeln geprüft.

- Spielsteuerung auf einen einzigen Würfelbutton reduziert; Rollanimation auf ca. 2,45 Sekunden verlängert und mit mehreren Umdrehungen versehen; Würfelflächen zeigen nun einfache passende Piktogramme je iconKey.

- Modal für eigene Mischungen vereinfacht: keine sichtbaren {zone...}-Platzhalter mehr, Aktionen ergänzen den Ort automatisch, Orte nutzen ein einzelnes Feld Ort im Ergebnistext, Karten verwenden einheitliches Design mit kleinem Aktiv-Schalter und rotem Mülltonnen-Icon oben rechts. JSON-Import bleibt oben, Export ist unten im Formular; Importfehler werden im Modal angezeigt. Hinzufügen scrollt automatisch zur neuen Karte.

- Mischungsdialog: Aktions- und Ortskarten sind standardmäßig eingeklappt. Der Header zeigt nur Aktiv-Schalter, Namen, Expand-Indikator und rotes Entfernen-Icon. Klick auf den Header toggelt Details; neu hinzugefügte Karten werden automatisch aufgeklappt und angesprungen.

- Mischungsdialog zugänglicher gemacht: Dialog hat Titel und Beschreibung, Importfehler haben
  ole=alert, Kartenheader nutzt getrennte Checkbox/Header-Button/Delete-Button ohne verschachtelte Interaktionen. Header-Kontrast verbessert, kein Expand-Icon mehr. Aufgaben unterstützen {ort} als intuitive Platzhalter-Schreibweise; beim Speichern wird sie intern auf den Zonenplatzhalter abgebildet.

- Mode-Bar eigene Mischungen: Chips zeigen keine dauerhaften Edit/Delete-Icons mehr. Bei aktiver eigener Mischung erscheint ein …-Menü mit Bearbeiten/Löschen. Doppelklick und Long-Press auf einen Mischungs-Chip öffnen weiterhin das Edit-Modal. Löschen nutzt überall einen wiederverwendbaren ConfirmDialog. Scroll-Hints erscheinen nur bei tatsächlichem horizontalem Overflow und nur in scrollbare Richtung.

- Mix-Menü in der Mode-Bar als Split-Button umgesetzt: aktiver eigener Mix zeigt … innerhalb derselben Chip-Hülle. Dropdown erhält hohen z-index und die horizontale Scroll-Leiste reserviert vertikalen Freiraum, damit das Menü nicht abgeschnitten wird.
- Eigene Mischungen können über das aktive …-Menü kopiert werden. Kopien erhalten automatisch eindeutige Namen nach dem Muster Name Kopie, Name Kopie 2 usw.; beim Speichern blockiert das Modal leere oder doppelte Mischungsnamen mit einer sichtbaren Warnung.
- Es dürfen nur Mischungen gespeichert werden, wo mindestens 6 Orte und mindestens 6 Aktionen gewhält wurden, die aktiv sind.
- Aufgaben-Platzhalter unterstuetzen {ort|akkusativ} und {ort|dativ}; {ort} bleibt Akkusativ. Zonen speichern deutsche Textformen nur noch unter text.de.accusative/text.de.dative; beide Felder sind im Zod-Schema Pflichtfelder. Das Modal schlaegt den Dativ nur beim Bearbeiten des Akkusativs nach einer einfachen Pluralregel vor; ein leerer Dativ blockiert das Speichern mit Formularfehler.
- Mix-Dialog-Footer angepasst: JSON-Export steht über der Aktionszeile; Löschen und Speichern liegen in derselben Zeile.
- `formatZodError` ist durch Unit-Tests abgedeckt: Custom-Issues, Pflichtfelder, sonstige Zod-Meldungen, mehrere/doppelte Fehler, leere ZodErrors, Error-Objekte und unbekannte Fehlerwerte.
- `grammar.ts` ist durch Unit-Tests abgedeckt: Plural-Dativ-Ableitung, Whitespace-Normalisierung, explizite Dative, Fallbacks und immutables Auffüllen fehlender Dative.
