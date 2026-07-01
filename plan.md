Verstanden — eher ein erotisches Würfelspiel für Erwachsene als ein klassisches Memory-Spiel.

Eine gute Webapp könnte nicht nur Zufallswürfe zeigen, sondern vorher gemeinsame Grenzen und Vorlieben abfragen. So bleibt das Spiel spielerisch, individuell und einvernehmlich.

1. Zwei-Würfel-Prinzip: „Was“ + „Wo“

Es gibt zwei virtuelle Würfel:

Aktionswürfel: küssen, massieren, streicheln, flüstern, überraschen, Wunsch erfüllen
Körperbereich-/Ort-Würfel: Lippen, Nacken, Rücken, Hände, Beine, überall nach Absprache

Beide würfeln gleichzeitig. Das Ergebnis wird groß animiert angezeigt, mit einer Schaltfläche wie „neu würfeln“, „annehmen“ oder „überspringen“.

2. Drei-Würfel-Prinzip: Aktion, Intensität, Dauer

Etwas abwechslungsreicher:

Aktion: z. B. Massage, Kuss, Kompliment, Berührung, kleine Aufgabe
Intensität: sanft, verspielt, mutig, langsam, leidenschaftlich, Überraschung
Dauer: 30 Sekunden, 1 Minute, 2 Minuten, bis zum nächsten Würfelwurf

Damit ist jede Runde klar, ohne dass man lange überlegen muss.

3. „Wahrheit, Wunsch oder Würfel“

Bei jedem Zug kann die Person zwischen drei Optionen wählen:

Wahrheit: eine intime, aber respektvolle Frage beantworten
Wunsch: einen eigenen Wunsch äußern
Würfel: die App entscheidet die nächste spielerische Aufgabe

Das eignet sich besonders gut für Paare, die sich besser kennenlernen oder neue Ideen ausprobieren möchten.

4. Level-System nach Stimmung

Vor dem Spiel wählt ihr gemeinsam eine Stimmung beziehungsweise ein Level:

Romantisch: Komplimente, Nähe, Küssen, Massage
Verspielt: kleine Challenges, neckische Aufgaben, Rollentausch
Mutig: intensivere, aber weiterhin vorher freigegebene Aufgaben
Eigene Mischung: Ihr aktiviert nur Kategorien, die euch beide interessieren

Die App sollte nur Aufgaben würfeln, die in den zuvor gemeinsam gewählten Kategorien liegen.

5. Grenzen- und Zustimmungssystem

Das wäre ein starkes Kernfeature der Webapp:

Beide wählen vor dem Start, was okay ist.
Kategorien lassen sich auf „Ja“, „Vielleicht“ oder „Nein“ setzen.
„Nein“ erscheint nie im Spiel.
„Vielleicht“ kann nur als optionale Aufgabe auftauchen und braucht eine Bestätigung beider Personen.
Jede Runde hat einen gut sichtbaren „Überspringen ohne Erklärung“-Button.

So wird die App vertrauenswürdiger als ein einfacher Zufallsgenerator.

6. Punkte eher als gemeinsame Fortschritte

Statt gegeneinander zu gewinnen, könntet ihr gemeinsame Ziele freischalten:

Neue Würfel-Designs
Neue romantische oder verspielte Karten
Themenabende, etwa „Date Night“, „Wellness“, „Slow Evening“
Kleine Meilensteine wie „10 Runden gespielt“ oder „3 Wünsche geteilt“

Das hält die Stimmung kooperativ statt leistungsorientiert.

Möglicher Ablauf in der App
Beide bestätigen, dass sie volljährig sind.
Ihr wählt Stimmung, Grenzen und gewünschte Spieldauer.
Die App zeigt abwechselnd an, wer dran ist.
Ihr würfelt Aktion, Intensität und optional Dauer.
Die Aufgabe wird angenommen, angepasst oder übersprungen.
Nach einigen Runden gibt es eine Abschlusskarte, etwa eine Frage oder einen gemeinsamen Wunsch für später.

Ein passender Name könnte zum Beispiel „Würfel & Wünsche“, „Zweisam“, „Paarwurf“, „Tonight’s Roll“ oder „Dice & Desire“ sein.

1. Zwei-Würfel-Prinzip: „Was“ + „Wo“

Es gibt zwei virtuelle Würfel:

Aktionswürfel: küssen, massieren, streicheln, flüstern, überraschen, Wunsch erfüllen
Körperbereich-/Ort-Würfel: Lippen, Nacken, Rücken, Hände, Beine, überall nach Absprache

Beide würfeln gleichzeitig. Das Ergebnis wird groß animiert angezeigt, mit einer Schaltfläche wie „neu würfeln“, „annehmen“ oder „überspringen“.

4. Level-System nach Stimmung

Vor dem Spiel wählt ihr gemeinsam eine Stimmung beziehungsweise ein Level:

Romantisch: Komplimente, Nähe, Küssen, Massage
Verspielt: kleine Challenges, neckische Aufgaben, Rollentausch
Mutig: intensivere, aber weiterhin vorher freigegebene Aufgaben
Eigene Mischung: Ihr aktiviert nur Kategorien, die euch beide interessieren

Die App sollte nur Aufgaben würfeln, die in den zuvor gemeinsam gewählten Kategorien liegen.


Jede Runde hat einen gut sichtbaren „Überspringen ohne Erklärung“-Button. -> erstelle ein ausführliches konzept für die webapp. sie soll ansprechend aussehen, auch im dunklen kontrastreich sein. außerdem soll der würfel interaktiv, 3d und schön designt aussehen und sich wenn möglich echt drehen und irgendwo stehen bleiben. zu jedem körperteil soll auch ein svg icon desselbigen auf dem würfel abgebildet werden. auch die aktion soll durch ein svg icon symbolisiert werden. die richtige textliche aktion steht dann nach dem würfeln unter den würfeln bereit. die würfel aktionen sollen in einer konfiguration gespeichert werden können und leicht anpassbar sein. wenn die würfel gewürfelt werden, soll randomisiert 6 zonen, 6 aktionen genommen auf den würfel abgebildet und dann gewürfelt werden. die webapp soll am besten in react und node erzeugt werden. der output soll in dist folder erstellt werden. es soll via docker im watch modus entwickelbar sein. ich möchte linting und formatting haben. plane das feature ausführlich. wenn mir der plan gefällt, können wir das projekt erzeugen.

Ich strukturiere das als umsetzungsnahes Produkt- und Technik-Konzept: Spielablauf, UI/Design, 3D-Würfel, Konfiguration, Datenmodell, React/Node-Architektur, Docker-Entwicklung sowie Qualitätssicherung.

Die Würfel sollten nicht als unkontrollierte Physik-Simulation gebaut werden: Ich plane eine echte 3D-Rollanimation mit garantiertem, regelkonformem Endergebnis. So bleiben die sechs zufällig bestückten Flächen sichtbar, während die gewürfelte Kombination zuverlässig zu den zuvor gewählten Grenzen passt.

Nachgedacht für 1m 47s
Konzept: „Würfel & Wünsche“ – interaktive Paar-Webapp
1. Zielbild

Die Webapp ist ein privates, erwachsenes Zwei-Personen-Spiel mit zwei 3D-Würfeln:

Aktionswürfel: z. B. Küssen, Massieren, Streicheln, Flüstern, Überraschen, Wunsch erfüllen.
Zonenwürfel: z. B. Lippen, Nacken, Rücken, Hände, Beine, Überall nach Absprache.

Vor jeder Runde werden aus der aktuell erlaubten Konfiguration sechs Aktionen und sechs Zonen zufällig und ohne Duplikate gezogen. Diese erscheinen als SVG-Symbole auf den jeweiligen Würfelflächen. Danach drehen sich beide Würfel sichtbar in 3D und landen auf je einem Ergebnis.

Erst nachdem die Würfel vollständig zur Ruhe gekommen sind, erscheint die textliche Kombination groß unterhalb der Szene, etwa:

Massiere den Nacken.

Die App bleibt dabei bewusst kooperativ: Es gibt keine Strafpunkte, keine unangenehmen Begründungen und keinen Wettbewerb. Eine deutlich sichtbare Schaltfläche „Überspringen – ohne Erklärung“ ist jederzeit verfügbar.

2. Spielablauf
Startscreen

Der erste Screen stellt den Rahmen klar und ruhig dar:

Hinweis: ausschließlich für volljährige, einvernehmliche Personen.
Zwei kurze Bestätigungen:
„Alle Beteiligten sind volljährig.“
„Wir respektieren Grenzen und können jederzeit überspringen oder pausieren.“
Primärer Button: „Spiel starten“
Sekundäre Option: „Einstellungen & Würfel konfigurieren“

Die Altersbestätigung ist kein echter Identitätsnachweis. Sie dient als klare Nutzungsvereinbarung und als bewusster Einstieg in ein einvernehmliches Spiel.

Stimmungswahl

Vor dem Start wählt das Paar eine Stimmung. Diese bestimmt, welche Konfigurationsgruppen für die Runde aktiv sind.

Stimmung	Charakter	Standardinhalt
Romantisch	ruhig, nah, zärtlich	Komplimente, Küssen, Nähe, Massage
Verspielt	locker, neckisch, kreativ	kleine Challenges, Rollentausch, Überraschungen
Mutig	intensiver, aber vollständig konfigurierbar	nur zuvor aktivierte und erlaubte Einträge
Eigene Mischung	komplett individuell	freie Auswahl aus eigenen Kategorien

Wichtig: Die Stimmung ist nur ein Filter. Sie zwingt keine Inhalte auf. Jede Gruppe kann verändert, deaktiviert oder mit eigenen Einträgen ergänzt werden.

Ablauf einer Runde
Die App prüft die aktive Stimmung und die erlaubten Einträge.
Sie zieht sechs erlaubte Aktionen für den Aktionswürfel.
Sie zieht sechs erlaubte Zonen für den Zonenwürfel.
Beide Würfel werden mit den zugehörigen SVG-Icons bestückt.
Die App bestimmt eine gültige Kombination aus Aktion und Zone.
Die Würfel drehen sich gleichzeitig, springen leicht an und kommen sichtbar zur Ruhe.
Das Ergebnis wird textlich eingeblendet.
Es erscheinen drei Aktionen:
Annehmen
Neu würfeln
Überspringen – ohne Erklärung

Bei „Überspringen“ wird weder ein Grund abgefragt noch ein negativer Hinweis angezeigt. Die App geht einfach respektvoll in die nächste Runde über.

3. Regeln für die Zufallsauswahl

Die Würfel sollen nicht immer dieselben sechs Flächen zeigen. Deshalb wird bei jeder Runde neu zusammengestellt.

Auswahlalgorithmus

Für jede Runde:

Aktive Stimmung bestimmen
→ erlaubte Aktionen filtern
→ sechs unterschiedliche Aktionen ziehen
→ erlaubte Zonen filtern
→ sechs unterschiedliche Zonen ziehen
→ alle gültigen Aktions-Zonen-Paare ermitteln
→ ein gültiges Paar auswählen
→ ausgewählte Einträge als obere Würfelfläche ansteuern
→ Würfel animieren

Die Auswahl erfolgt ohne Duplikate innerhalb eines Würfels. Wenn beispielsweise zehn Aktionen aktiv sind, erscheinen pro Runde sechs davon auf dem Würfel. Dadurch bleibt jede Runde visuell und spielerisch abwechslungsreich.

Kompatibilitätsregeln

Einige Aktionen passen nicht zwingend zu jeder Zone. Deshalb erhält jede Aktion optionale Regeln:

Pflichtzone: Die Aktion benötigt eine gültige Zone.
Optionale Zone: Die Zone wird angezeigt, kann aber frei interpretiert werden.
Zone ignorieren: Für Einträge wie „Wunsch erfüllen“ wird die Zonenfläche nicht als starre Vorgabe verwendet.

Beispiel:

{
  "id": "fulfil-wish",
  "label": "Wunsch erfüllen",
  "instructionTemplate": "Erfülle einen gemeinsamen Wunsch – nach Absprache.",
  "zoneMode": "ignore",
  "iconKey": "sparkle-wish",
  "enabled": true,
  "moods": ["romantic", "playful", "bold"]
}

Damit verhindert die App unpassende oder unklare Kombinationen, obwohl beide Würfel unabhängig rotieren.

4. Konfigurierbare Würfelinhalte

Die Konfiguration ist ein zentrales Feature, nicht nur ein versteckter Admin-Bereich.

Konfigurationsansicht

Die Ansicht besteht aus zwei klar getrennten Bereichen:

Aktionen

Name
Ergebnistext beziehungsweise Textvorlage
SVG-Icon
aktive Stimmungen
aktiv/deaktiviert
Zonenregel
erlaubte oder ausgeschlossene Zonen

Zonen

Name
grammatikalische Form für Ergebnistext
SVG-Icon
aktive Stimmungen
aktiv/deaktiviert

Beispiel für eine Zone:

{
  "id": "neck",
  "label": "Nacken",
  "forms": {
    "nominative": "der Nacken",
    "accusative": "den Nacken"
  },
  "iconKey": "body-neck",
  "enabled": true,
  "moods": ["romantic", "playful", "bold"]
}

Beispiel für eine Aktion:

{
  "id": "massage",
  "label": "Massieren",
  "instructionTemplate": "Massiere {zone.accusative}.",
  "zoneMode": "required",
  "iconKey": "action-massage",
  "enabled": true,
  "moods": ["romantic", "playful", "bold"]
}

So kann die App grammatikalisch gute Ergebnisse bilden, anstatt nur starre Begriffe wie „Massieren + Nacken“ anzuzeigen.

Komfortfunktionen

Die Konfiguration sollte enthalten:

Eintrag hinzufügen, bearbeiten, duplizieren und deaktivieren.
Mehrere gespeicherte Profile, etwa „Zärtlich“, „Date Night“ oder „Eigenes Set“.
Vorschau eines Ergebnissatzes während der Bearbeitung.
Import und Export als JSON-Datei.
Zurücksetzen auf Standardkonfiguration.
Warnung, falls in einer Stimmung weniger als sechs aktive Aktionen oder Zonen vorhanden sind.
Vorschau der jeweiligen SVG-Symbole direkt in der Konfigurationsliste.

Für Version 1 sollten SVG-Icons aus einer fest eingebauten, kuratierten Icon-Bibliothek gewählt werden. Das hält das Design konsistent und vermeidet Probleme durch beliebige hochgeladene SVG-Dateien. Eine spätere Version kann einen geprüften Import für eigene Icons erhalten.

5. Visuelles Konzept
Stilrichtung

Die App soll erwachsen, modern und hochwertig wirken, aber nicht kitschig oder überladen. Die Stimmung ist eher „privater Abend / dunkles Studio / elegantes Spielobjekt“ als Comic oder Spielhalle.

Der Fokus liegt auf:

dunklem Hintergrund,
klaren Kontrasten,
sanften Lichtreflexen,
viel freiem Raum,
großen gut bedienbaren Buttons,
sichtbarer Trennung von Aktion und Zone.
Farbpalette
Element	Farbe	Zweck
Hintergrund	#0A0C12	fast schwarzes Blau
Kartenfläche	#161A25	ruhige Oberfläche
Haupttext	#F7F8FC	sehr hoher Kontrast
Sekundärtext	#B8C0D3	lesbare Hinweise
Aktionsakzent	#FF7BB7	Aktionswürfel, primäre Interaktion
Zonenakzent	#66E0D1	Zonenwürfel
Fokus / Warnung	#FFD166	Fokusrahmen, Hinweise

Die Haupttextfarbe auf dem dunklen Hintergrund erreicht ungefähr ein Kontrastverhältnis von 18,4:1. Auch die Akzentfarben bleiben auf dem Hintergrund deutlich lesbar. Farbe wird nie allein als Bedeutungsträger verwendet: Aktion und Zone unterscheiden sich zusätzlich durch Überschrift, Würfeltyp, Icon-Stil und Text.

Layout der Spielansicht

Auf Desktop:

────────────────────────────────────────────
 Stimmung: Romantisch        Einstellungen
────────────────────────────────────────────

              [ Aktionswürfel ] [ Zonenwürfel ]
                 3D-Szene mit Podest

        Aktion                  Zone
        Massieren               Nacken

            „Massiere den Nacken.“

 [ Würfeln ]  [ Annehmen ]  [ Überspringen – ohne Erklärung ]

────────────────────────────────────────────

Auf Mobilgeräten stehen die Würfel zunächst nebeneinander, bei wenig Breite untereinander. Der Würfelbereich bleibt im sichtbaren oberen Bereich; die Buttons bleiben groß und mit dem Daumen gut erreichbar.

Status und Mikrointeraktionen
Vor dem Wurf: sanftes Leuchten auf dem Podest.
Während des Wurfs: Buttons werden gegen Doppelklicks gesperrt.
Beim Landen: sehr kurze Lichtwelle unter jedem Würfel.
Nach dem Ergebnis: Text erscheint mit dezentem Fade-in.
Bei „Überspringen“: Ergebnis verschwindet ruhig, keine Bewertung.
Optionaler Ton und optionales haptisches Feedback auf Mobilgeräten.
Einstellung für reduzierte Animationen.
6. 3D-Würfel-Konzept
Optik der Würfel

Jeder Würfel besteht aus:

leicht abgerundeter Würfelgeometrie,
hochwertigem, leicht glänzendem Material,
sechs separaten Flächenplättchen,
je einem SVG-Symbol pro Fläche,
subtiler Kantenbeleuchtung,
Schatten auf einem dunklen Podest.

Der Aktionswürfel erhält einen warmen Akzent, etwa Pink/Plum. Der Zonenwürfel erhält einen klar abgesetzten Türkis-/Violett-Akzent. So sind beide Würfel auch während der Bewegung erkennbar.

Die SVG-Symbole erscheinen nicht als Text, sondern als stark vereinfachte, klare Piktogramme:

Aktion „Küssen“: Lippen- oder Kuss-Symbol.
Aktion „Massieren“: Hände oder Druckpunkte.
Aktion „Flüstern“: Sprechwelle.
Zone „Nacken“: stilisierte Kopf-Nacken-Silhouette.
Zone „Rücken“: Rücken-Silhouette.
Zone „Hände“: Hand-Symbol.
Zone „Überall nach Absprache“: abstrahiertes Stern-/Umkreis-Symbol.
Umsetzung der SVG-Flächen

Die Icons werden als lokal verfügbare SVG-Dateien gepflegt. Für die 3D-Szene werden sie in Texturen umgewandelt und auf die jeweiligen Flächen gelegt.

Technisch:

SVG-Datei
→ Canvas-/Bitmap-Textur erzeugen
→ Textur auf FaceTile anwenden
→ FaceTile an Würfelseite positionieren
→ Würfel rotieren

Damit bleiben die Symbole gestochen scharf und können für jeden Wurf dynamisch ausgetauscht werden.

Würfelbewegung

Die Würfel sollen nicht wie ein zufälliges CSS-Element wirken, sondern wie physische Objekte:

kurzer Impuls nach oben,
Drehung über mehrere Achsen,
leichte seitliche Bewegung,
sichtbares Abbremsen,
kleine Endbewegung,
Ergebnisfläche liegt oben.

Für die erste Version empfehle ich eine deterministische 3D-Rollanimation statt einer komplett freien Physik-Simulation:

Das Ergebnis wird vor dem Start regelkonform ausgewählt.
Der Würfel erhält eine zufällige Startrotation und mehrere sichtbare Drehungen.
Die Zielrotation wird so berechnet, dass das ausgewählte SVG-Symbol am Ende oben liegt.
Eine kleine Zufallsdrehung um die vertikale Achse verhindert, dass zwei gleiche Ergebnisse identisch aussehen.

Das sieht physisch aus, ist zuverlässig und garantiert, dass die sichtbare obere Fläche immer exakt dem Ergebnistext entspricht.

Eine vollständig physikalische Simulation mit Kollisionen wäre später möglich. Sie ist aber nicht die beste Basis für Version 1, weil ein physikalisch zufälliger Endwert anschließend mit Regeln, Ausschlüssen und erlaubten Kombinationen abgeglichen werden müsste. Die geplante Animation erzeugt dagegen ein echtes, sichtbares 3D-Rollen mit einem kontrollierten Endzustand.

Für die Szene bietet sich React Three Fiber als deklarative React-Anbindung an Three.js an; Three.js stellt den Renderer und die Animationsschleife bereit. React Three Fiber ist speziell dafür gedacht, wiederverwendbare Three.js-Szenen als React-Komponenten aufzubauen.

Interaktion
Tippen oder Klick auf einen Würfel startet bei bereitem Spielstand den Wurf.
Der Hauptbutton „Würfeln“ löst dieselbe Aktion aus.
Während des Rollens ist die Kamera gesperrt.
Nach dem Ergebnis kann die Person den Würfel per Drag leicht drehen, um ihn zu betrachten.
Bei prefers-reduced-motion wird eine kurze, ruhige Drehung statt einer langen Rollanimation gezeigt.
Ohne WebGL gibt es einen sauberen 2D-Fallback mit animierten Würfelkarten und denselben Ergebnissen.
7. Technische Architektur
Empfohlener Stack

Frontend

React mit TypeScript
Vite als Build- und Development-Tool
React Three Fiber
Three.js
Drei für praktische 3D-Helfer
Zustand für lokalen UI- und Spielstatus
Zod für Konfigurations- und API-Validierung
CSS Modules oder CSS mit Design Tokens

Backend

Node.js mit TypeScript
Fastify als kompakter API-Server
SQLite für gespeicherte Konfigurationen
Zod-Schemas, die von Frontend und Backend gemeinsam verwendet werden

React eignet sich hier gut für die klar getrennten Bereiche Spiel, Konfiguration, Einstellungen und 3D-Szene. Vite liefert Development-Server und Produktionsbuild; sein Standard-Ausgabeverzeichnis ist dist, kann aber bewusst auf eine gemeinsame Root-Struktur angepasst werden.

Projektstruktur
dice-and-desire/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── features/
│   │   │   │   ├── game/
│   │   │   │   ├── dice3d/
│   │   │   │   ├── configuration/
│   │   │   │   └── consent/
│   │   │   ├── components/
│   │   │   ├── assets/
│   │   │   │   └── icons/
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   ├── repositories/
│       │   ├── services/
│       │   └── server.ts
│       └── tsconfig.build.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── schemas/
│       │   ├── types/
│       │   └── defaults/
│       └── index.ts
│
├── dist/
│   ├── client/
│   └── server/
│
├── data/
│   └── dice-app.sqlite
│
├── Dockerfile
├── docker-compose.dev.yml
├── docker-compose.yml
├── eslint.config.js
├── prettier.config.cjs
└── package.json
Produktionsausgabe

Der Build erzeugt bewusst alles unter einem gemeinsamen Root-Verzeichnis:

dist/
├── client/     # Vite-Build: HTML, CSS, JavaScript, Assets
└── server/     # kompilierter Node-/Fastify-Server

Der Node-Server liefert im Produktionsmodus sowohl /api/* als auch die statischen Dateien aus dist/client aus. Dadurch genügt später ein einzelner Container für die fertige Anwendung.

8. Frontend-Komponenten
Wesentliche Komponenten
AppShell
├── ConsentGate
├── MoodSelector
├── GameScreen
│   ├── DiceStage
│   │   ├── ActionDie
│   │   ├── ZoneDie
│   │   ├── DicePodium
│   │   └── SceneLighting
│   ├── ResultPanel
│   ├── RoundControls
│   └── LiveRegion
├── ConfigurationScreen
│   ├── ProfileSelector
│   ├── ActionEditor
│   ├── ZoneEditor
│   ├── IconPicker
│   └── ImportExportPanel
└── SettingsPanel
Spielzustand

Der Spielablauf wird als klare State Machine umgesetzt:

setup
→ ready
→ preparingRoll
→ rolling
→ settling
→ result
→ accepted | skipped
→ ready

Das verhindert typische Fehler wie:

mehrfaches Würfeln während einer Animation,
Ergebnisanzeige vor dem tatsächlichen Stillstand,
Änderung der Konfiguration während eines laufenden Wurfs,
inkonsistente Anzeige zwischen Würfeloberfläche und Text.
9. Backend und Speicherung
Lokale Speicherung zuerst

Die App sollte möglichst privat funktionieren:

Standardprofile und letzte Einstellungen lokal im Browser speichern.
Kein Benutzerkonto für Version 1.
Keine Analyse- oder Tracking-Daten.
Keine Speicherung der Rundenergebnisse, solange dies nicht ausdrücklich aktiviert wird.
Node-API

Der Node-Server speichert benannte Konfigurationen in SQLite. Das ist besonders sinnvoll, wenn die App im Docker-Container lokal betrieben wird und die Profile unabhängig vom Browser erhalten bleiben sollen.

Vorgeschlagene Endpunkte:

GET    /api/health
GET    /api/configurations
POST   /api/configurations
PUT    /api/configurations/:id
DELETE /api/configurations/:id
POST   /api/configurations/import
GET    /api/configurations/:id/export

Die gesamte Spiel- und Würfellogik bleibt im Frontend reaktionsschnell. Der Server ist hauptsächlich für gespeicherte Profile, Import/Export und eine saubere Produktionsauslieferung zuständig.

10. Docker-Entwicklung im Watch-Modus
Entwicklungsmodus

Die Entwicklungsumgebung besteht aus zwei Containern:

web
├── Vite Dev Server
├── Port 5173
├── Hot Module Reloading
└── Proxy auf API

api
├── Node / Fastify
├── tsx watch
├── Port 3001
└── SQLite-Volume unter /data

Start:

docker compose -f docker-compose.dev.yml up --build

Wichtige Eigenschaften:

Der Quellcode wird als Volume eingebunden.
Änderungen an React-Komponenten lösen HMR aus.
Änderungen am Node-Code starten den API-Prozess neu.
node_modules liegt als Docker-Volume vor, damit lokale Betriebssystemunterschiede keine Abhängigkeiten beschädigen.
SQLite liegt in einem persistenten Volume und bleibt bei Container-Neustarts erhalten.
Produktionsmodus

Der Produktionscontainer wird mehrstufig gebaut:

Abhängigkeiten installieren.
TypeScript prüfen.
Web-Frontend nach dist/client bauen.
API nach dist/server kompilieren.
Nur notwendige Runtime-Dateien in das finale Image kopieren.
Node liefert API und Client aus.
11. Linting, Formatting und Codequalität
Vorgesehene Werkzeuge
ESLint mit TypeScript- und React-Regeln
Prettier für einheitliches Formatting
TypeScript im strikten Modus
Import-Reihenfolge und unbenutzte Variablen als Lint-Regeln
optional Husky und lint-staged für Pre-Commit-Prüfungen
Scripts
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e

Der Produktionsbuild läuft nur erfolgreich durch, wenn TypeScript-Prüfung, Linting und Build keine Fehler enthalten.

12. Teststrategie
Unit-Tests

Für die Spiellogik:

Genau sechs unterschiedliche Aktionen werden gezogen.
Genau sechs unterschiedliche Zonen werden gezogen.
Deaktivierte Einträge erscheinen nie.
Einträge außerhalb der gewählten Stimmung erscheinen nie.
Nicht erlaubte Aktions-Zonen-Paare werden nie als Ergebnis gewählt.
Textvorlagen erzeugen die richtige Ergebnisanzeige.
Bei weniger als sechs erlaubten Einträgen erscheint eine verständliche Konfigurationswarnung.
Komponenten-Tests
Konfigurationen lassen sich anlegen, bearbeiten und speichern.
„Überspringen – ohne Erklärung“ funktioniert in jeder Ergebnisphase.
Buttons sind während des Rollens korrekt gesperrt.
Screenreader-Live-Region meldet das Ergebnis.
Reduced-Motion-Modus reduziert die Animation.
End-to-End-Tests
Stimmung auswählen.
Konfiguration anpassen.
Runde würfeln.
Ergebnis abwarten.
Runde annehmen oder überspringen.
Profil speichern und nach Neustart erneut laden.
Mobile und Desktop-Screenshots prüfen.

Für die 3D-Szene wird WebGL bewusst nur animiert, wenn es nötig ist; das schont schwächere Geräte. React Three Fiber dokumentiert, dass WebGL aufwendig sein kann und gezielte Render-Strategien relevant sind.

13. Barrierefreiheit und Respekt im Spiel

Die App sollte diese Anforderungen von Anfang an enthalten:

sichtbare Tastatur-Fokuszustände,
große Touch-Ziele,
ausreichender Kontrast,
textliche Alternative zu jeder Symbolbedeutung,
Screenreader-Ausgabe für Würfelergebnis und Spielstatus,
vollständige Bedienung ohne Maus,
reduzierte Bewegungen bei Systempräferenz,
WebGL-Fallback,
keine Scham- oder Strafmechanik,
jederzeit zugänglicher Pause-/Beenden-Button.

Der Text unter den Würfeln ist dabei immer die maßgebliche, barrierefreie Ergebnisausgabe. Die 3D-Würfel sind visuell attraktiv, aber nicht die einzige Informationsquelle.

14. Umsetzungsphasen
Phase 1 – Fundament
React-/Node-Monorepo
Docker-Entwicklung
Vite- und Fastify-Grundgerüst
dist/client und dist/server
ESLint, Prettier, TypeScript
Consent Gate und dunkles Basisdesign
Phase 2 – Konfiguration und Spielregeln
Standardprofile
Aktionen und Zonen editierbar
Speichern in SQLite und lokalem Browser-Speicher
Zufallslogik mit sechs Flächen pro Würfel
Kompatibilitätsregeln
Ergebnistext und Überspringen
Phase 3 – 3D-Würfel
React Three Fiber Szene
abgerundete Würfel
SVG-Texturen auf allen Flächen
Rollanimation mit kontrolliertem Zielzustand
Podest, Licht, Schatten und Ergebnisanimation
WebGL- und Reduced-Motion-Fallback
Phase 4 – Qualität und Feinschliff
Testabdeckung
responsive Optimierung
Tastatur- und Screenreader-Prüfung
Import/Export von Profilen
Produktions-Docker-Image
Dokumentation mit Start-, Build- und Docker-Befehlen
15. Abnahmekriterien

Das Feature gilt als fertig, wenn:

jede Runde sechs zufällige, erlaubte Aktionen und sechs zufällige, erlaubte Zonen auf den Würfeln zeigt;
beide Würfel sichtbar in 3D rollen und auf einem passenden Symbol landen;
das Ergebnis erst nach dem Stillstand eingeblendet wird;
die Ergebnisfläche auf dem Würfel und der Text immer übereinstimmen;
die Konfiguration leicht bearbeitet, gespeichert, importiert und exportiert werden kann;
„Überspringen – ohne Erklärung“ jederzeit verfügbar ist;
die Anwendung im dunklen Modus kontrastreich und mobil nutzbar ist;
ohne WebGL ein sauberer 2D-Fallback verfügbar ist;
docker compose einen Watch-Modus mit Frontend-HMR und API-Neustart bereitstellt;
pnpm build die fertigen Artefakte unter dist/ erzeugt;
Linting, Formatting, Typprüfung und Tests Teil des Standard-Workflows sind.

Nach deiner Freigabe würde die Umsetzung genau entlang dieses Konzepts als React-/Node-Projekt mit Docker, dist-Build, Konfigurationsspeicherung und den animierten 3D-Würfeln beginnen.