# NPM Commands Übersicht

Diese Datei enthält eine automatische Übersicht aller verfügbaren `npm run` Commands für das SF-Symbols-Lib Projekt.

## Package Commands (für die React-Komponenten-Bibliothek)

| Command | Beschreibung | Vollständiger Befehl |
|---------|-------------|---------------------|
| `npm run build` | Baut die Library (TypeScript + Vite + Declaration Files) | `tsc && vite build && tsc --emitDeclarationOnly` |
| `npm run dev` | Watch-Mode für Entwicklung (kontinuierlicher Build) | `vite build --watch` |
| `npm run lint` | ESLint Linting für Code-Qualität | `eslint .` |
| `npm run typecheck` | TypeScript Type-Checking ohne Build | `tsc --noEmit` |
| `npm run generate` | Generiert SF Symbols aus SVG-Dateien | `tsx scripts/generate-sfsymbols.ts` |
| `npm run clean` | Bereinigt alle generierten Dateien (src/ + dist/ + docs/dist/) | `rm -rf src/hierarchical src/monochrome src/components/sf-symbol-name.ts src/index.ts docs/dist dist` |
| `npm run check` | Vollständige Qualitätsprüfung (lint + typecheck + build) | `npm run lint && npm run typecheck && npm run build` |

## Preview Page Commands (für die GitHub Pages Preview-Seite)

| Command | Beschreibung | Vollständiger Befehl |
|---------|-------------|---------------------|
| `npm run docs:generate` | Generiert Daten für die Preview-Seite | `tsx scripts/generate-docs-data.ts` |
| `npm run docs:serve` | Startet lokalen Server für Preview (ohne Generierung) | `browser-sync start --server docs/dist --files docs/dist/index.html --no-open` |
| `npm run docs:preview` | Vollständige Preview (generiert + startet Server) | `npm run docs:generate && npm run docs:serve` |

## Verwendungshinweise

- **Package Commands** werden aus dem Projekt-Root aufgerufen und betreffen die Entwicklung der React-Komponenten-Bibliothek
- **Preview Page Commands** betreffen die statische GitHub Pages Preview-Seite im `docs/` Ordner
- Alle Commands sind so gestaltet, dass sie aus dem Document-Root (`/`) aufgerufen werden können
- Die Preview-Seite ist vollständig statisch und enthält nur `index.html`, `scripts/`, `styles/`, Markdown-Dateien und `info.txt`

## Letzte Aktualisierung

Diese Übersicht wird automatisch aktualisiert, wenn sich die `npm run` Commands in `package.json` ändern.