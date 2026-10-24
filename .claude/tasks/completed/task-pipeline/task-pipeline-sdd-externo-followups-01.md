---
id: task-pipeline-sdd-externo-followups-01
package: task-pipeline
plan: sdd-externo-followups
status: done
priority: 1
depends_on: []
estimate: 2h
actual: 1h
issue: 95
created: 2026-10-24
updated: 2026-10-24
---

# Check de enlaces a GitHub en el build del portal (B11)

## Description

El portal enlaza ~24 veces a `github.com/drossan/claude-plugins/blob/main/…` y nadie comprueba esos enlaces (VitePress solo valida los internos). Plan: `.claude/plans/pending/task-pipeline/sdd-externo-followups.md`.

## Spec

- `website/scripts/check-github-links.mjs`: Node sin dependencias; lee los `.md` publicados de `website/` (respeta `srcExclude`; ignora `node_modules`, `dist`, `cache`), extrae las URLs `github.com/drossan/claude-plugins/(blob|tree)/main/…`, comprueba que la ruta existe y, si hay `#ancla`, que coincide con un heading del `.md` destino. Reglas de slug en el CU (RN-2, RN-3): sin sufijo `-N`, fences ignorados, backticks quitados conservando contenido, Unicode.
- `website/package.json`: `docs:build` ejecuta el check antes de `vitepress build`; el script corre también solo con `node`, sin `pnpm install`. `srcExclude` se lee como texto de `website/.vitepress/config.mts` (error explícito si no se parsea). Semántica completa en las RN del CU (query y `#L…` ignorados, ancla decodificada y en minúsculas, ruta sensible a mayúsculas, 0 enlaces = fallo, fences ignorados, solo lectura).
- Fixtures: las 8 anclas reales (12 enlaces con ancla) enlazadas hoy (README del plugin y `docs/guides/task-lifecycle.md`) deben pasar.
- Documentar el check en `website/README.md`; añadir a la DoD del lifecycle **de este repo** (no a la plantilla, RN-8) la línea de correrlo al tocar headings o mover ficheros bajo `task-pipeline/` o `docs/`.
- `spec.md`: enlazar el CU nuevo en «Casos de uso» y ampliar `SC-004` con una línea (sin FR nuevo).
- Verificación: inyectar en una copia temporal un enlace con ruta rota y otro con ancla rota, comprobar que `pnpm docs:build` falla con mensaje claro; sin inyección, pasa.

## Fuera de alcance

- Comprobar enlaces por red o a ramas distintas de `main`; soportar el sufijo `-N`, headings Setext y `<a id>`.
- Un workflow de CI en PRs para el check (follow-up).

## Scenarios (Gherkin)

- [portal-enlaces-github](../../../specs/task-pipeline/casos-de-uso/portal-enlaces-github.md)
  (escenarios del check, slug, build y DoD; la línea de SC-004 va en `spec.md`)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [x] Escenarios verificados por `grep`/inspección
- [x] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [x] Spec cumplida
- [x] **Gate `sdd-lint` superado** — sin ERROR
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] **SDD** — CU creado al planificar y ajustado al cerrar; `spec.md` enlaza el CU y amplía SC-004
- [x] Doc técnica actualizada · `technical-docs`
- [x] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-externo-followups-01.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
