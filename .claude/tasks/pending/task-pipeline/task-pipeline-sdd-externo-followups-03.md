---
id: task-pipeline-sdd-externo-followups-03
package: task-pipeline
plan: sdd-externo-followups
status: pending
priority: 3
depends_on: [task-pipeline-sdd-externo-followups-01, task-pipeline-sdd-externo-followups-02]
estimate: 1.5h
actual:
issue: 94
created: 2026-10-24
updated: 2026-10-24
---

# Simplificaciones del review y release 0.18.5

## Description

Tres simplificaciones del code review de la PR #91 y release 0.18.5. Plan: `.claude/plans/pending/task-pipeline/sdd-externo-followups.md`.

## Spec

- `task-pipeline/README.md`: el riesgo 4 deja de repetir la frase anterior (queda la etiqueta).
- El paso 3c del lifecycle **no se toca**: conserva la regla de la reapertura (decisión del owner tras `scenario-coverage`).
- CU `sdd-proveedor-externo`: eliminar «Cierre repetido tras un fallo», «Cierre tras una reapertura» y «Reintento de phase=close», sustituidos por el `Scenario Outline` «Repetición de phase=close…» (ya añadido), que conserva la unión de sus `Then`. No tocar los session logs históricos.
- Release: `plugin.json` 0.18.5 + CHANGELOG 0.18.5 (B12 y simplificaciones; B11 es solo `website/`, se cita como nota; solo describe lo que las tareas cerradas entregaron). Tras editar el README, `pnpm docs:build` (con el check de la 01) sigue en verde. El `description` del plugin y de `marketplace.json` siguen coherentes.
- Barrido `grep "idéntic"` sobre el CHANGELOG 0.18.5.

## Fuera de alcance

- Workflow de CI en PRs, mitigaciones de M5, detectar lifecycles 0.18.0–0.18.3.
- Cambiar el modo nativo o el modelo de resolución del modo SDD.

## Scenarios (Gherkin)

- [sdd-proveedor-externo](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)
  (escenarios de repetición de `phase=close`, riesgo 4 y release 0.18.5)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [ ] Escenarios verificados por `grep`/inspección
- [ ] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [ ] Spec cumplida
- [ ] **Gate `sdd-lint` superado** — sin ERROR
- [ ] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [ ] **SDD** — CU actualizado al crear la tarea, o «sin cambios de spec/CU»
- [ ] Doc técnica actualizada · `technical-docs`
- [ ] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-externo-followups-03.md` · `context-log`
- [ ] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
