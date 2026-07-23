---
id: task-pipeline-collision-free-ids-05
package: task-pipeline
plan: collision-free-ids
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-collision-free-ids-01]
estimate: 1h
actual:
created: 2026-07-23
updated: 2026-07-23
---

# Alinear copias materializadas de este repo (dogfooding)

## Description

Este repo dogfoodea su propia convención: además de las **plantillas** (semilla, tarea -01), hay **copias
materializadas** y **catálogos** que deben reflejar el nuevo esquema de id. Alinearlos y barrer el repo para
que no quede el esquema viejo vivo (salvo allowlist), distinguiendo **ejemplo obsoleto** de **historia
legítima**. Depende de -01.

## Spec

- **`docs/guides/task-lifecycle.md`** (materializado): actualizar la definición del `<task-id>` **y los
  ejemplos embebidos** de las plantillas de plan/tarea que incluye (hoy con `id: <package>-<nnn>`,
  `<package>-001`…) al esquema plan-scoped.
- **`.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md`**: actualizar ejemplos/instrucciones de id al nuevo
  formato — **ojo**: hoy cita `task-pipeline-XXX ... (001–004)` y el plan `grilling-and-model-routing` como
  **ejemplo de instrucción** (stale), NO como historia de tareas cerradas → actualizar.
- **Distinguir historia vs ejemplo (T-G/allowlist)**: los ids `001..012` que aparecen como **historia**
  (tareas `completed`, session logs, CHANGELOG) **NO** se tocan; los que aparecen como **ejemplo/plantilla**
  sí se actualizan.
- **Enumeración exhaustiva**: barrer **todos** los docs del repo que citen el esquema, incluidos **README
  raíz** y **`CLAUDE.md`** (no solo lifecycle + HOW-TO), para que ninguno deje el esquema viejo vivo.
- **Barrido `grep` reforzado**: sin `<package>-<nnn>` (contador global) vivo **como esquema**.
  - **Allowlist (no tocar)**: ids **legacy** `task-pipeline-001..012` (menciones históricas); atribución de
    terceros; entradas de CHANGELOG.

## Scenarios (Gherkin)

```gherkin
Feature: Copias materializadas y catálogos del repo alineados

  Scenario: El ciclo de vida materializado usa el esquema plan-scoped (definición y ejemplos embebidos)
    Given docs/guides/task-lifecycle.md tras esta tarea
    When busco la definición de <task-id> y los ejemplos embebidos de las plantillas
    Then todos usan <plan-id>-<nn> (coherente con la plantilla), no <package>-<nnn>

  Scenario: Los ejemplos obsoletos del HOW-TO se actualizan; la historia se respeta
    Given el HOW-TO materializado cita "task-pipeline-XXX (001–004)" como EJEMPLO
    When aplico esta tarea
    Then esos ejemplos pasan al formato plan-scoped
    And los ids 001..012 que aparecen como HISTORIA (completed / CHANGELOG) NO se tocan

  Scenario: Ningún doc del repo (raíz incluida) deja el esquema viejo vivo
    Given el repo tras esta tarea
    When barro con grep TODOS los docs (README raíz, CLAUDE.md, docs/, .claude/specs)
    Then ninguno define <package>-<nnn> como esquema vigente (salvo allowlist)

  Scenario: Allowlist intacta
    Given el repo tras esta tarea
    When inspecciono los ids legacy y el CHANGELOG histórico
    Then siguen intactos (no renumerados)
```

## Provides

- —

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado por inspección + `grep`.
- [ ] Spec cumplida; ejemplos stale actualizados, historia/allowlist intacta.
- [ ] Gate de mutation — **N/A**.
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (materializados + catálogos); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-05.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos ni esquema viejo vivo.
