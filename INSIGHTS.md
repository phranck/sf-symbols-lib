# Insights: Aufräumen der npm run Commands

## Initiale Erkenntnisse
- Aktuelle Scripts analysiert: Es gibt 12 Scripts in package.json.
- Kategorisierung: Package (build, dev, typecheck, generate, etc.) vs. Preview (page, docs:build).
- Script `docs/scripts/generate-icons-data.ts` muss verschoben werden.
- Potenzielle Konsolidierung: generate:prod könnte in build integriert werden, check ist eine Kombi.

## Iterative Updates
- Script `docs/scripts/generate-icons-data.ts` nach `scripts/generate-docs-data.ts` verschoben.
- Commands konsolidiert: Entfernt minify:dist, generate:prod, page, page:only, docs:build. Neu: docs:generate, docs:serve, docs:preview.
- package.json aktualisiert.
- Script-Pfade angepasst für neue Lage.
- Tests erfolgreich: lint (2 warnings), typecheck OK, build OK, docs:generate OK.
- Aufräumen abgeschlossen.