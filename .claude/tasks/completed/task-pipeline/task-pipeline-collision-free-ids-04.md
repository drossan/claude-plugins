---
id: task-pipeline-collision-free-ids-04
package: task-pipeline
plan: collision-free-ids
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-collision-free-ids-01]
estimate: 1h
actual: 25min
created: 2026-07-23
updated: 2026-07-23
---

# Doc de trabajo en equipo / colisiones (README + flujo)

## Description

Explicar a un equipo por qué los ids son plan-scoped y cómo trabajar sin colisiones: **rama = plan**, una
tarea `active` por plan, y qué pasa (y cómo se **resuelve**) con el residual (mismo nombre de plan, o dos
ramas extendiendo el mismo plan). Depende de -01. Solo D1 (el tracking GitHub se documenta en `-11`).

## Spec

- **`task-pipeline/README.md`**: sección "Trabajo en equipo / colisiones de id": el esquema plan-scoped, el
  porqué (namespace = unidad de paralelismo), la disciplina "rama = plan / una tarea active por plan", y el
  residual con su mitigación.
- **Procedimiento de resolución** (no solo "doctor lo detecta"): cómo resuelve el humano una colisión ya
  detectada — renumerar el `<nn>` más nuevo **o** renombrar el plan — **y** avisar de actualizar
  `depends_on` y enlaces que referenciaban el id renombrado.
- **Manifestación en git**: notar que hoy es un conflicto add/add silencioso y que con el esquema nuevo
  queda 1 conflicto único y evidente (ayuda al reconocimiento).
- **`docs/guides/task-lifecycle.md`** (materializado): enlazar la guía de equipo desde el flujo (sin
  duplicar; el detalle vive en el README del plugin).
- Coherente con la convención de -01 y con lo que detecta `-03`.

## Scenarios (Gherkin)

```gherkin
Feature: Guía de trabajo en equipo sin colisiones

  Scenario: El README explica el esquema plan-scoped y el porqué
    Given README.md tras esta tarea
    When busco la sección de trabajo en equipo
    Then explica ids plan-scoped, "rama = plan" y una tarea active por plan

  Scenario: El residual está documentado con su mitigación
    Given la sección de equipo
    When la leo
    Then describe el caso "mismo nombre de plan" / "dos ramas mismo plan" y dice que /doctor lo detecta

  Scenario: La guía documenta cómo resolver una colisión detectada
    Given la sección de equipo tras esta tarea
    When leo la mitigación del residual
    Then explica los pasos: renumerar el <nn> más nuevo O renombrar el plan
    And advierte de actualizar depends_on y enlaces que referencian el id renombrado

  Scenario: La guía describe cómo se ve la colisión en git
    Given la sección de equipo
    When la leo
    Then explica que antes era un conflicto add/add silencioso y ahora es 1 conflicto único y evidente

  Scenario: El flujo enlaza la guía de equipo
    Given docs/guides/task-lifecycle.md tras esta tarea
    When lo inspecciono
    Then referencia la guía de equipo del README (sin duplicar el contenido)
```

## Provides

- —

## Definition of Done

- [x] Tests TDD — **N/A** (stack `none`).
- [x] Cada escenario Gherkin verificado por inspección.
- [x] Spec cumplida.
- [x] Gate de mutation — **N/A**.
- [x] Gate de `fact-checker` superado (6/6 VERIFICADO). **No-negociable.**
- [x] Doc: **TSDoc N/A**; **doc técnica** (README + flujo); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-04.md`.
- [x] Barrido `grep` reforzado sin identificadores muertos.
