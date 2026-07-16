# Histórico — task-pipeline-004 (Parte D: release 0.9.0)

> Session log append-only.

## 2026-07-16 — Apertura + cierre (misma sesión)

- **Gate OK**: `depends_on: [001, 002, 003]` → las tres `done`; rama del plan.

## Decisiones + porqué

- Entrada `## [0.9.0] — 2026-07-16` con las tres secciones que pide el precedente `[0.8.0]`:
  `Changed` (BREAKING: rename grill-me→grilling + sync verbatim + fix de drift bootstrap/`/task`),
  `Added` (routing `models:` + skill `/doctor`), `Migration` (comando + NL trigger + `models:` opcional).
- Notas redactadas contra lo REALMENTE entregado por 001/002/003 (no contra el plan): verifiqué que
  existe `skills/doctor/SKILL.md` y la sección `models:` en config del repo y (comentada) en el template.
- No se tocó el historial ≤0.8.1 (git diff: 0 líneas eliminadas del CHANGELOG).

## Verificación corrida + resultado (stack none → inspección)

- `plugin.json` → `0.9.0`; JSON válido. ✓
- CHANGELOG `[0.9.0]` con `### Changed` + `### Added` + `### Migration`. ✓
- Historial intacto: `git diff CHANGELOG` no elimina ninguna línea (solo añade la entrada nueva). ✓
- Migration cubre `/task-pipeline:grill-me → /task-pipeline:grilling` y aclara que "grill me" NL sigue. ✓
- Metadatos: 0 `grill-me` en `plugin.json`/`marketplace.json`; narrativa usa `grilling`; `doctor` mencionado. ✓

## Docs actualizadas + motivo

- `task-pipeline/.claude-plugin/plugin.json` (version) y `task-pipeline/CHANGELOG.md` (entrada 0.9.0).

## Ficheros / commit

- 2 ficheros de release (plugin.json, CHANGELOG) — + PM.
- Commit: `task-pipeline-004: chore(task-pipeline): release 0.9.0`.

## Tiempo real

- ~0.75h (estimate 1h).

## Follow-ups

- Ninguno. Al ser la última tarea: plan → `completed` y PR a `main`.
