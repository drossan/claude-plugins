---
id: task-pipeline-sdd-externo-seguimiento-02
package: task-pipeline
plan: sdd-externo-seguimiento
status: done
priority: 2
depends_on: [task-pipeline-sdd-externo-seguimiento-01]
estimate: 2h
actual: 1h
issue: 90
created: 2026-10-24
updated: 2026-10-24
---

# DoD, cierre y HOW-TO en modo external + release 0.18.4 (B4 + B6 + B7 + B8)

## Description

Huecos de redacción del cierre en modo `external` y release del seguimiento. Plan: `.claude/plans/pending/task-pipeline/sdd-externo-seguimiento.md`.

## Spec

- **B4**: mover la regla «líneas de DoD de otro modo no aplican» (hoy comentario HTML, `templates/task.md:76`) a una nota visible en la DoD del lifecycle (repo + plantilla), nativo→externo y externo→nativo.
- **B7**: el lifecycle fija una vez que `phase=close` se invoca al llegar al hueco; no si falla un paso previo (tests, lint, `mutation` si está activo); sin gate de mutation, el hueco sigue a lint/tests.
- **B6**: el lifecycle exige la línea de session log `provider phase=close: <resultado>` y `fact-checker` la comprueba (autodeclarada, y se dice) — lifecycle paso 4, Paso 8 de `plan-task` y `fact-checker/SKILL.md`.
- **B8**: `HOW-TO-START-A-TASK.md` (repo + plantilla) menciona `phase=start` y el modo `external`.
- **B4 bidireccional** (nativo→externo y externo→nativo) y **B7** con tabla de pasos previos (tests, lint/typecheck, `mutation` si activo; `mutation-gate: false`/`mutation-tool: none` → hueco tras lint/tests; reapertura vuelve a invocar).
- **B6**: sin la línea de rastro → `fact-checker` NO VERIFICABLE (aviso); provider ausente/error también deja la línea; reintento = línea nueva (append-only).
- `spec.md`: nuevo FR EARS del contrato de cierre en `external` (cuándo se invoca `phase=close` y el rastro). CU: actualizar RN-6/RN-7 con la regla de B7 y el escenario «Mutation fallida no invoca al provider» (queda como caso de la tabla).
- Lifecycle del repo y su plantilla quedan sincronizados (4b, 3c, DoD external, nota de otro modo).
- Barrido final: repetir el `grep "idéntic"` de la tarea 01 sobre el CHANGELOG 0.18.4.
- Release 0.18.4: `plugin.json` + CHANGELOG, avisando del hueco de lifecycles materializados en 0.18.0–0.18.3 (re-sincronizar 4b, 3c y la DoD a mano).

## Fuera de alcance

- B11, B12; detectar lifecycles 0.18.0–0.18.3 (hueco aceptado); cambiar el modo nativo más allá de la regla bidireccional de líneas de DoD.

## Scenarios (Gherkin)

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)
  (escenarios de cierre en `external` (tabla de pasos previos, reapertura, rastro, falta de rastro, reintento, externo→nativo), HOW-TO, sincronía, release, FR en `spec.md` y barrido final)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [x] Escenarios verificados por `grep`/inspección
- [x] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [x] Spec cumplida
- [x] **Gate `sdd-lint` superado** — sin ERROR
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] **SDD** — CU actualizado (RN-6/RN-7); `spec.md` sin cambios
- [x] Doc técnica actualizada · `technical-docs`
- [x] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-externo-seguimiento-02.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
