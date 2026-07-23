---
id: task-pipeline-collision-free-ids-02
package: task-pipeline
plan: collision-free-ids
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: [task-pipeline-collision-free-ids-01]
estimate: 1h
actual:
created: 2026-07-23
updated: 2026-07-23
---

# Regla de asignación de id en `plan-task/SKILL.md`

## Description

Instruir a `/plan-task` **cómo** derivar el `<nn>` de cada tarea de forma determinista: contando sobre las
tareas **del plan** (en TODOS sus estados), no del package. Hoy el SKILL no dice nada sobre numeración (por
eso cada sesión la infiere del estado local y colisiona). Depende de -01 (esquema + acotación de name-plan).

## Spec

- **`task-pipeline/skills/plan-task/SKILL.md`**, en el **Paso 5** (descomponer en tareas): añadir la regla
  de asignación de id:
  - `<task-id> = <plan-id>-<nn>`; `<nn>` = máximo `<nn>` existente **en el plan** + 1, empezando en `01`.
  - **Contar sobre TODOS los estados** del plan (`pending` + `active` + `completed` + `cancelled`): **nunca
    reusar** el `<nn>` de una tarea cancelada/completada (si no, colisión dentro del mismo plan en re-plan).
  - **Explícito**: NO contar sobre "el último número del package" (ese es el bug que causa la colisión).
  - Nota de convivencia con ids **legacy** opacos (no se renumeran).
  - **Residual honesto**: la regla NO previene "dos ramas del mismo plan" (ambas ven el mismo máximo →
    mismo `<nn>`); remitir al límite conocido y a la guía de equipo (-04) + detección en `-03`.
- Coherente con el esquema y la acotación de `<name-plan>` fijados en -01. No re-describir el ciclo de vida
  completo (vive en `task-lifecycle`): solo la **regla operativa** de asignación.

## Scenarios (Gherkin)

```gherkin
Feature: Regla de asignación de id determinista en /plan-task

  Scenario: El SKILL instruye contar dentro del plan
    Given plan-task/SKILL.md tras esta tarea
    When leo el Paso 5 (descomponer en tareas)
    Then instruye que <nn> es correlativo DENTRO del plan, desde 01
    And prohíbe explícitamente contar sobre el último número del package

  Scenario: Primera tarea de un plan nuevo → 01
    Given un plan sin tareas todavía
    When /plan-task crea su primera tarea
    Then el <nn> asignado es 01

  Scenario: El <nn> se deriva del máximo en TODOS los estados, sin reusar
    Given un plan con tareas 01..03 donde 02 está cancelled y 03 completed
    When /plan-task añade una tarea nueva al plan
    Then el <nn> asignado es 04 (máximo existente + 1)
    And NO reusa 02 aunque esté cancelled
    And la regla dice que se cuenta sobre pending+active+completed+cancelled

  Scenario: Convivencia con ids legacy mencionada
    Given la regla de asignación en el SKILL
    When la leo
    Then aclara que los ids legacy no se renumeran y el histórico mixto es esperado

  Scenario: El residual "dos ramas mismo plan" queda remitido, no prometido resuelto
    Given la regla de asignación en el SKILL
    When la leo
    Then advierte que NO previene dos ramas del mismo plan (mismo máximo → mismo <nn>)
    And remite a la guía de equipo (-04) y a la detección en /doctor (-03)

  Scenario: Coherencia con la plantilla
    Given la regla en el SKILL y la definición en templates/task-lifecycle.md
    When comparo el formato y el ejemplo de id
    Then coinciden (mismo esquema, ejemplo válido)
```

## Provides

- —

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado como criterio de aceptación (inspección del SKILL).
- [ ] Spec cumplida.
- [ ] Gate de mutation — **N/A**.
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (el SKILL); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-02.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos.
