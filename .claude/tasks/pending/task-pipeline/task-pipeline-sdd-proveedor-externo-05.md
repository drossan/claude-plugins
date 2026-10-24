---
id: task-pipeline-sdd-proveedor-externo-05
package: task-pipeline
plan: sdd-proveedor-externo
status: pending
priority: 3
depends_on: [task-pipeline-sdd-proveedor-externo-03, task-pipeline-sdd-proveedor-externo-04]
estimate: 3h
actual:
issue: 83
created: 2026-10-24
updated: 2026-10-24
---

# Docs, portal y release del SDD con proveedor externo

## Description

Documenta los tres modos y el contrato experimental del provider, y corta el release. Plan:
`.claude/plans/pending/task-pipeline/sdd-proveedor-externo.md`.

## Spec

- `task-pipeline/README.md`: «SDD nativo (opcional)» → «SDD: nativo o externo»; fila de `features.sdd` en la tabla de config; contrato v1 `phase/task/plan` marcado experimental; semántica de degradación.
- `task-pipeline/docs/flujo-del-pipeline.md`, `website/features/sdd.md`, `website/guia/configuracion.md`, `website/guia/pipeline.md`: describir los tres modos (enlazando a la regla única, sin copiarla).
- `task-pipeline/CHANGELOG.md` (Keep a Changelog) y bump **minor** en `task-pipeline/.claude-plugin/plugin.json`; `description` coherente con `.claude-plugin/marketplace.json`.
- `claude plugin validate .` y `cd website && pnpm docs:build` en verde.
- Criterios verificables: la versión minor coincide entre `plugin.json`, `CHANGELOG.md` y `marketplace.json`; README, `flujo-del-pipeline.md` y los tres docs del portal **enlazan** la regla única sin copiarla; el README documenta el riesgo de que un repo clonado nombre cualquier skill instalada como provider (RN-5) y que el provider debe ser idempotente (RN-7).

## Fuera de alcance

- Cambiar comportamiento: esta tarea solo documenta y publica.
- Migrar artefactos nativos existentes al pasar a `external`.

## Scenarios (Gherkin)

Criterios de aceptación (Gherkin) en el caso de uso (fuente única); tarea de documentación y release, verificada por inspección y build, sin escenarios propios de comportamiento:

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. Verificación: grep + claude plugin validate + pnpm docs:build. -->
- [ ] `claude plugin validate .` y `pnpm docs:build` en verde (comando ejecutado en esta sesión)
- [ ] Spec cumplida
- [ ] **Gate `sdd-lint` superado** — sin ERROR (AVISO se reconoce)
- [ ] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · `features.github-tracking`
- [ ] **SDD** — spec/CU actualizados, o declarado «sin cambios de spec/CU» aquí y en el session log
- [ ] Doc técnica actualizada · `technical-docs`
- [ ] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-05.md` · `context-log`
- [ ] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
