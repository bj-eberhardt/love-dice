# Love Dice Game

![Teaser](docs/teaser.png)

Eine Browser-App für ein einvernehmliches Paar-Würfelspiel mit zwei interaktiven 3D-Würfeln:
**Aktion** und **Zone**.

Ihr sucht euch eine voreingestellte Stimmung oder erstellt eigene Würfel-Paare, danach
würfelt ihr die Würfel und bekommt eine zufällige Kombination aus Aktion und Zone, z.B. `Massiere den Rücken`.

Wenn Euch die gewürfelte Kombination nicht gefällt, könnt ihr jederzeit neu würfeln.

Live-Preview auf github: [https://bj-eberhardt.github.io/love-dice/](https://bj-eberhardt.github.io/love-dice/)

Weitere Spiele von uns findet ihr auf [https://love-games.app](https://love-games.app).

## Features

- alles wird lokal im eigenen Browser gespeichert, keine Registrierung, kein Tracking.
- Stimmungsauswahl für den schnellen Spielstart: Romantisch, Verspielt, Mutig
- Eigene Würfel-Paare können einfach erstellt, bearbeitet und gespeichert werden. Auch ein Export ist vorhanden, damit ihr eure Würfel-Paare z.B. mit dem Partner teilen könnt.
- Dunkles, kontrastreiches responsive UI.

## Architektur

Die App ist bewusst frontend-only aufgebaut. Es werden keine Daten an einen Server geschickt, keine Registrierung benötigt und keine Tracking-Mechanismen eingesetzt. Alles passiert lokal im Browser.

## Entwicklung

Voraussetzungen:

- Node.js 24 oder kompatibel
- npm
- docker (optional, für Docker-Dev-Modus)

### Installation

```bash
npm ci
```

### Dev-Server starten

```bash
npm run dev
```

oder via docker:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Die App läuft dann unter:
http://localhost:5544

### Dev Skripte

Wichtige Scripts:

```bash
npm run typecheck      # TypeScript-Prüfung
npm run lint           # ESLint
npm run lint:fix       # ESLint Auto-Fixes
npm run format         # Prettier formatieren
npm run format:check   # Prettier prüfen
npm run build          # Produktionsbuild
npm test               # Vitest Unit-Tests
npm test:ui:headless   # Playwright-UI-Tests
```

### UI tests (Playwright)

Es gibt UI-Tests mit Playwright, die die wichtigsten Spielabläufe abdecken. Sie laufen im Headless-Modus und können optional auch im Headed-Modus gestartet werden.

```bash
npm ci
npm run build
npx playwright install --with-deps
npm run test:ui        # in der playwright-UI ausführen (super zum Entwickeln)
npm run test:ui:headless # Headless ausführen (ohne Fenster)
npm run test:ui:headed # Im Browser automatisch ausführen (Headed)
```

## Produktion

Produktionsbuild lokal:

```bash
npm run build
```

Via docker: Produktionscontainer bauen und starten. Es wird ein nginx-Container gestartet, der die statischen Dateien ausliefert.

```bash
docker compose up --build
```

## Konfiguration

Die Standardkonfiguration liegt in:

```text
src/shared/defaults/configuration.ts
```
