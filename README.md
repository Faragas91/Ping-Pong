# Pong – Phaser & TypeScript

Ein klassisches Zwei-Spieler-Pong, umgesetzt mit [Phaser 4](https://phaser.io/), TypeScript und Vite.

## Features

- Zwei Spieler an einer Tastatur
- Zufälliger Aufschlag (Richtung und Geschwindigkeit)
- Ball wird bei jedem Schlägerkontakt etwas schneller
- Zufällige Events im 10-Sekunden-Takt:
  - **Fast Ball** – der Ball wird schneller
  - **Slow Player** – beide Schläger werden langsamer
  - **Fast Player** – beide Schläger werden schneller
  - **Normal** – zurück zu den Standardwerten
- Power-ups, die alle 5 Sekunden erscheinen:
  - größerer/kleinerer Schläger (für den Spieler mit dem letzten Kontakt)
  - größerer/kleinerer Ball
- Soundeffekt beim Ballkontakt und Hintergrundmusik
- Spielstandsanzeige für beide Spieler

## Steuerung

| Aktion | Linker Spieler | Rechter Spieler |
| --- | --- | --- |
| Nach oben | `W` | `↑` |
| Nach unten | `S` | `↓` |
| Aufschlag | `Leertaste` | `Shift` |

Der Aufschlag ist erst möglich, wenn der Ball in der Mitte liegt. Nach einem Punkt wird der Ball zurückgesetzt und der Event-Timer neu gestartet.

## Voraussetzungen

- [Node.js](https://nodejs.org/) `^20.19.0` oder `>=22.12.0`
- npm

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Anschließend die angezeigte URL im Browser öffnen (standardmäßig <http://localhost:5173>).

## Build

```bash
npm run build
```

Das erzeugt einen Produktions-Build im Ordner `dist/`. Zum lokalen Testen des Builds:

```bash
npm run preview
```

## Projektstruktur

```text
ping-pong/
├── index.html              # Einstiegspunkt der Seite
├── public/
│   └── assets/             # Sprites und Audiodateien
├── src/
│   ├── main.ts             # Phaser-Konfiguration und Spielstart
│   ├── style.css           # Grundlegendes Seitenlayout
│   ├── constants/
│   │   └── game.ts         # Spielkonstanten (Spielergeschwindigkeit, Positionen)
│   └── scene/
│       ├── index.ts        # Re-Export der Szene
│       └── GameScene.ts    # Gesamte Spiellogik
├── package.json
└── tsconfig.json
```

## Technik

- **Phaser 4** mit Arcade-Physik
- **TypeScript** (strict mode)
- **Vite** als Dev-Server und Bundler
- Feste Spielfläche von 1280 × 720 Pixeln, skaliert per `Phaser.Scale.FIT`

## Status

Aktiv in Entwicklung. Neue Mechaniken werden Schritt für Schritt ergänzt.
