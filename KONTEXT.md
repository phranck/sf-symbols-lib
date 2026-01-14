# Kontext: Aufräumen der npm run Commands

## Ziel der Analyse
Das Ziel dieser Analyse ist es, die `npm run` Commands in der `package.json` zu konsolidieren und klar zu trennen zwischen:

1. **SF-Symbols Package**: Commands, die sich auf die Entwicklung, das Bauen und die Wartung der React-Komponenten-Bibliothek beziehen.
2. **SF-Symbols Preview Page**: Commands, die sich auf die GitHub Pages Preview-Seite beziehen, die statisch sein soll.

## Anforderungen
- Alle `npm run` Commands sollen aus dem Document-Root (Projektwurzel) aufgerufen werden können.
- Der `docs/` Ordner soll nur statischen Code enthalten: `index.html`, `scripts/`, `styles/`, Markdown-Dateien und `info.txt`.
- Das Script `docs/scripts/generate-icons-data.ts` soll in `/scripts` verschoben werden.
- `docs/node_modules` soll entfernt werden (da die Seite statisch ist).
- Commands sollen in zwei Kategorien geteilt werden: Package und Preview Page.
- Keine Aliase oder überflüssige Commands.

## Struktur nach Aufräumen
- **Package-Commands**: build, dev, lint, typecheck, generate, etc.
- **Preview-Page-Commands**: page, docs:build, etc.
- Klare, beschreibende Namen ohne Redundanzen.