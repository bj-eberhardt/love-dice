# Love Dice Game

Eine lokale Browser-App fuer ein einvernehmliches Paar-Wuerfelspiel mit zwei interaktiven 3D-Wuerfeln: Aktion und Zone. Die App benoetigt kein Backend. Konfiguration und Spielzustand werden im Browser ueber `localStorage` persistiert.

## Features

- Consent-Startscreen fuer Volljaehrigkeit, Zustimmung und jederzeitiges Ueberspringen.
- Stimmungsauswahl: Romantisch, Verspielt, Mutig und Eigene Mischung.
- Zwei 3D-Wuerfel mit React Three Fiber und Three.js.
- Pro Runde werden sechs erlaubte Aktionen und sechs erlaubte Zonen zufaellig auf die Wuerfel gelegt.
- Die Wuerfelanimation landet deterministisch auf dem ausgewaehlten Ergebnis, damit Icon und Ergebnissatz zusammenpassen.
- Regelbasierte Kombinationslogik mit `zoneMode`, erlaubten Zonen und blockierten Zonen.
- Ergebnistext aus konfigurierbaren Templates, z. B. `Massiere {zone.accusative}.`.
- Konfigurationspanel zum Aktivieren/Deaktivieren von Aktionen und Zonen.
- JSON-Export der aktuellen Konfiguration.
- Dunkles, kontrastreiches responsive UI.

## Architektur

Die App ist bewusst frontend-only aufgebaut.

```text
index.html
vite.config.ts
tsconfig.app.json
src/
    app.tsx                       # Haupt-UI und Spielablauf
    main.tsx                      # React Bootstrap
    features/dice3d/DiceStage.tsx # Three.js/React Three Fiber Szene
    features/game/icons.tsx       # Icon-Mapping
    shared/
      defaults/configuration.ts   # Standard-Aktionen und -Zonen
      schemas/configuration.ts    # Zod-Schemas und Typen
      roll.ts                     # Zufalls- und Kombinationslogik
      index.ts                    # Shared Exports
    styles/global.css             # Globales UI-Styling
```

Es gibt kein `apps/api`, keine Server-Routes, keine Datenbank und keine API-Abhaengigkeit. Persistenz passiert lokal im Browser.

## Entwicklung

Voraussetzungen:

- Node.js 24 oder kompatibel
- npm

Installation:

```bash
npm ci
```

Dev-Server starten:

```bash
npm run dev
```

Die App laeuft dann unter:

```text
http://localhost:5544
```

Wichtige Scripts:

```bash
npm run typecheck      # TypeScript-Pruefung
npm run lint           # ESLint
npm run lint:fix       # ESLint Auto-Fixes
npm run format         # Prettier formatieren
npm run format:check   # Prettier pruefen
npm run build          # Produktionsbuild nach dist/client
npm run start          # Vite Preview auf Port 5544
```

## UI tests (Playwright)

The project includes Playwright-based end-to-end UI tests. They run a preview server on port 5545 so they can execute in parallel to the dev server on 5544.

Install and run:

```bash
npm ci
npm run build
npx playwright install --with-deps
npm run test:ui        # run Playwright headless
npm run test:ui:headed # run Playwright headed for debugging
npm run test:ui:debug  # run Playwright in debug mode
```

Guidance for tests:
- Tests use data-testid attributes for stable selectors (e.g. data-testid="consent-accept", data-testid="roll-button", data-testid="result-text").
- Tests are in tests/ui and use descriptive test.step blocks to document test phases.
- Avoid relying on translations; use data-ids or configuration ids where possible.

Add test-related scripts to package.json and add data-testid attributes to key interactive elements to make tests stable.

Docker-Dev-Modus:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Der Container nutzt `npm ci` und startet den Vite-Dev-Server auf Port `5544`.

## Produktion

Produktionsbuild lokal:

```bash
npm ci
npm run build
```

Der Build landet in:

```text
dist/client/
```

Produktionscontainer bauen und starten:

```bash
docker compose up --build
```

Der Produktionscontainer verwendet einen Multi-Stage-Build:

1. Node-Stage mit `npm ci` und `npm run build`.
2. nginx-Stage, die `dist/client` statisch ausliefert.

Die App ist danach erreichbar unter:

```text
http://localhost:8080
```

## Konfiguration

Die Standardkonfiguration liegt in:

```text
src/shared/defaults/configuration.ts
```

Wichtige Felder:

- `actions`: Aktionen fuer den Aktionswuerfel.
- `zones`: Koerperbereiche/Zonen fuer den Zonenwuerfel.
- `moods`: Stimmungen, in denen ein Eintrag aktiv sein kann.
- `enabled`: Ob ein Eintrag grundsaetzlich aktiv ist.
- `instructionTemplate`: Ergebnissatz mit Platzhaltern.
- `zoneMode`: `required`, `optional` oder `ignore`.
- `allowedZoneIds` / `blockedZoneIds`: optionale Kombinationsregeln.

Die Runtime-Konfiguration wird im Browser unter dem Key `love-dice-config` gespeichert.

## Hinweise

- Es gibt aktuell keine Backend-Speicherung, keine Benutzerkonten und kein Tracking.
- Die 3D-Szene nutzt WebGL; der visuelle Wuerfel ist nicht die einzige Informationsquelle, da das Ergebnis immer auch textlich angezeigt wird.
- Der grosse JavaScript-Bundle-Hinweis beim Build kommt vor allem von Three.js. Das ist fuer die aktuelle Version akzeptiert; bei Bedarf kann spaeter Code-Splitting fuer die 3D-Szene ergaenzt werden.

