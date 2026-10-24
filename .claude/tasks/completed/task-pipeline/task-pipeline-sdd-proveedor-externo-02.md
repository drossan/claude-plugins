---
id: task-pipeline-sdd-proveedor-externo-02
package: task-pipeline
plan: sdd-proveedor-externo
status: done
priority: 1
depends_on: [task-pipeline-sdd-proveedor-externo-01]
estimate: 2h
actual: 1h
issue: 80
created: 2026-10-24
updated: 2026-10-24
---

# Lectores nativos: redacción «modo nativo» y seguir siempre el enlace al CU

## Description

Los lectores de `features.sdd` ya tratan el bloque como off (fail-safe actual), así que se comportan bien en
`external`. Esta tarea solo ajusta su redacción para que no dupliquen la regla de tres modos y hace que el
enlace a un CU se siga en cualquier modo. Plan: `.claude/plans/pending/task-pipeline/sdd-proveedor-externo.md`.

## Spec

- `mutation`, `scenario-coverage`, `sdd-lint`, `templates/task.md`, `templates/caso-de-uso.md`: sustituir «con `features.sdd` on» por «en modo nativo (`sdd: true`)» y **enlazar** a la regla única de la tarea 01 en vez de repetirla.
- `mutation` y `scenario-coverage`: si el `## Scenarios` de la tarea **enlaza** a un CU, leer los escenarios de ese CU **sea cual sea el modo**; si no hay enlace, leer el Gherkin inline.
- `sdd-lint`: con modo `external` el **gate automático** es no-op; la invocación **manual** `/sdd-lint` audita igualmente y avisa de que el SDD lo gestiona el provider (como con SDD off). `models.sdd-lint` sin efecto, sin aviso de drift.
- `scenario-coverage` en `external`: los escenarios endurecidos se incorporan al CU si la tarea lo enlaza, y al `## Scenarios` de la tarea si no.
- Líneas de DoD de otro modo (p. ej. gate `sdd-lint` en una tarea creada en nativo y cerrada en `external`) se tratan como no aplicables.
- Sin lógica nueva de tres modos copiada en ningún lector.

## Fuera de alcance

- Invocar al provider (tarea 03) y activación/`doctor` (tarea 04).
- Cambiar el comportamiento del modo nativo.

## Scenarios (Gherkin)

Criterios de aceptación (Gherkin) en el caso de uso (fuente única); esta tarea cubre «Gherkin en la tarea con provider externo», «El enlace a un CU se sigue en cualquier modo», «sdd-lint y models.sdd-lint sin efecto en external», «sdd-lint manual en external», «scenario-coverage endurece en la tarea sin enlace / en el CU enlazado» y «Líneas de DoD de otro modo no aplican»:

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [x] Escenarios del CU cubiertos por esta tarea verificados (inspección / `grep`: ningún lector copia la regla de tres modos)
- [x] Spec cumplida
- [x] **Gate `sdd-lint` superado** — sin ERROR (AVISO se reconoce)
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · `features.github-tracking`
- [x] **SDD** — spec/CU actualizados, o declarado «sin cambios de spec/CU» aquí y en el session log (declarado)
- [x] Doc técnica actualizada · `technical-docs`
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-02.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos
