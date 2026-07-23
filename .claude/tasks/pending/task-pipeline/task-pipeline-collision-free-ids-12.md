---
id: task-pipeline-collision-free-ids-12
package: task-pipeline
plan: collision-free-ids
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-09]
estimate: 2h
actual:
created: 2026-07-23
updated: 2026-07-23
---

# Ciclo de vida del plan en GitHub: cierre de issue padre + proyección concurrente

## Description

Cierra el bucle de estado de D2 en su **nivel superior** (el plan), que `-08`/`-09` dejan abierto, y fija
la disciplina de **proyección concurrente**. Sale de `scenario-coverage` (huecos T-A y T-B, críticos).
Depende de -07 (flag), -08 (issue padre creada) y -09 (proyección de estado de tarea). Riesgos aceptados
C3 (best-effort) y I3 (huérfanas/reversibilidad).

## Spec

- **T-A — cierre de la issue PADRE al completar el plan.** GitHub **no** auto-cierra el padre al cerrar sus
  sub-issues. En `templates/task-lifecycle.md` (sección "Cerrar un plan") + la copia materializada
  `docs/guides/task-lifecycle.md` + HOW-TO: paso **condicional** (solo si `github-tracking.enabled` y el
  plan tiene `issue:`): al pasar el plan a `status: completed` → `gh issue close` sobre la **issue padre**.
  Best-effort: si `gh` falla → avisar y **NO bloquear** el cierre del plan.
- **T-B — disciplina de proyección concurrente.** En `plan-task/SKILL.md` (donde -08 teje la proyección):
  antes de crear el padre, si el `.md` del plan **ya** tiene `issue:` (p.ej. traído por `pull`/merge de la
  rama donde se proyectó primero), **NO** crear otro → usar el existente. Documentar el **límite conocido**:
  dos ramas frescas del mismo plan proyectadas en paralelo crean **padres duplicados** + `issue:` en
  conflicto al mergear; no se previene en duro (es el residual "mismo plan, dos ramas" extendido a la
  proyección). Mitigación: "una sola rama proyecta el plan" + detección en `-10` + doc en `-11`.
- **NO** re-describir el mapeo de estado de tarea (vive en -09) ni la detección (vive en -10) ni la doc de
  usuario (vive en -11): aquí solo el **plan-level close** + la **regla de no-duplicación del padre**.

## Scenarios (Gherkin)

```gherkin
Feature: Ciclo de vida del plan en GitHub

  Scenario: Completar el plan cierra su issue padre
    Given un plan con el flag on, issue: en su .md y todas las tareas done
    When el plan pasa a status: completed
    Then se ejecuta gh issue close sobre la issue PADRE del plan

  Scenario: gh falla al cerrar el padre → aviso, no bloquea
    Given un plan con el flag on cuyo padre no se puede cerrar (gh sin red)
    When el plan pasa a status: completed
    Then se avisa del fallo
    And el cierre del plan (mover a completed/, status) se completa igual

  Scenario: No se recrea el padre si el .md del plan ya tiene issue:
    Given un plan cuyo .md ya trae issue: (proyectado antes en otra rama)
    When /plan-task proyecta con el flag on
    Then NO se crea un segundo padre; se reutiliza el issue: existente

  Scenario: Proyección concurrente = límite conocido, no prevención dura
    Given dos ramas frescas del mismo plan, ambas con el flag on, proyectadas por separado
    When se mergean a main
    Then el resultado (padres duplicados + issue: en conflicto) queda declarado como límite conocido
    And -10 lo detecta y -11 lo documenta (no se previene en duro)

  Scenario: Flag off → el cierre del plan es local puro
    Given un plan sin issue: o con el flag off
    When pasa a status: completed
    Then no se llama a gh (cierre idéntico al default)
```

## Provides

- El cierre del padre + la regla de no-duplicación, consumidos por `-10` (detección de padre huérfano/
  duplicado) y `-11` (doc del límite).

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado en repo de prueba (flag on/off, `gh` ok/sin red).
- [ ] Spec cumplida; el cierre del plan nunca se bloquea por la proyección.
- [ ] Gate de mutation — **N/A**.
- [ ] Gate de `fact-checker`: reconocer que la verificación con GitHub en vivo es **NO VERIFICABLE** de
      forma reproducible en `stack:none` (repo en vivo, manual). **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (lifecycle plantilla + materializado + HOW-TO + SKILL); **histórico**
      en `.claude/context/task-pipeline/task-pipeline-collision-free-ids-12.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos.
