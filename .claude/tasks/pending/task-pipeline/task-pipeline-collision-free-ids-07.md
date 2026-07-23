---
id: task-pipeline-collision-free-ids-07
package: task-pipeline
plan: collision-free-ids
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: []
estimate: 2h
actual:
created: 2026-07-23
updated: 2026-07-23
---

# Config `features.github-tracking` + frontmatter `issue:` (plantillas)

## Description

Fundamento de D2: declarar el **flag opt-in** `features.github-tracking` en la plantilla de config y el
campo **`issue:`** en las plantillas de tarea/plan, más documentar el lector. No hay proyección todavía
(eso es -08/-09/-12); aquí solo se crea la superficie de config y frontmatter que el resto de D2 consume.
Sin `depends_on` de D1: es ortogonal (comparte rama). Respeta el ADN: en el **template** el bloque va
**comentado** (no impone comportamiento a repos consumidores; mismo criterio que `models:`/`caveman`).

## Spec

- **`templates/task-pipeline.yml`** (`task-pipeline/skills/plan-task/templates/`): añadir el bloque
  **comentado** dentro de `features:`:
  ```yaml
  # github-tracking:
  #   enabled: false          # opt-in; off / sin conexión / sin config / repo no-GitHub = no-op
  #   # repo: owner/name       # default = repo actual (gh repo view --json nameWithOwner)
  #   # project: <number>      # nº Project v2 (URL .../projects/<N> o gh project list --owner <o>)
  #   # issue-type-plan: Plan  # avanzado: issue types se definen en el ORG; sin ellos → label `plan`
  ```
  - **Semántica de resolución fail-safe** (documentada junto al bloque): ausente / `enabled: false` /
    cualquier valor **no-canónico** (mayúsculas, `yes`, `1`, `"true"` string, comentado, desconocido) →
    **off** (no-op). **Solo** `enabled: true` (booleano) activa. Mismo patrón que `caveman`.
- **Documentar el lector** en la tabla de `features:` de **`plan-task/SKILL.md`** y de
  **`templates/task-lifecycle.md`**: fila `features.github-tracking` = comportamiento opt-in (no gate de
  DoD), default off; NO forma parte de ningún preset (`mode: full` NO lo enciende). Nota: su **ausencia no
  es drift** para `/doctor` (lo implementa `-10`, T-E).
- **`templates/task.md`** y **`templates/plan.md`**: añadir el campo **opcional** `issue:` al frontmatter
  (comentario: "solo si `features.github-tracking`; número de la issue proyectada — lo escribe `/plan-task`").
- **NO** implementar llamadas `gh` aquí (es -08). Este task es superficie + doc.

## Scenarios (Gherkin)

```gherkin
Feature: Superficie de config y frontmatter para el tracking GitHub

  Scenario: El flag existe comentado en la plantilla de config
    Given templates/task-pipeline.yml tras esta tarea
    When busco features.github-tracking
    Then aparece como bloque comentado con enabled: false por defecto
    And documenta que off/sin conexión/sin config/repo no-GitHub = no-op

  Scenario Outline: Resolución fail-safe del flag
    Given un task-pipeline.yml con github-tracking en estado <estado>
    When el pipeline resuelve el flag
    Then el tracking queda <resultado>

    Examples:
      | estado              | resultado |
      | ausente             | off       |
      | enabled: false      | off       |
      | enabled: "true"     | off       |
      | enabled: yes        | off       |
      | enabled: 1          | off       |
      | comentado           | off       |
      | enabled: true       | on        |

  Scenario: El lector está documentado como opt-in, no preset, y no-drift
    Given la tabla de features en plan-task/SKILL.md y en templates/task-lifecycle.md
    When leo la fila github-tracking
    Then dice comportamiento opt-in, default off, fuera de todo preset
    And nota que su ausencia no es drift para /doctor

  Scenario: El campo issue: es opcional en las plantillas de tarea/plan
    Given templates/task.md y templates/plan.md tras esta tarea
    When inspecciono el frontmatter
    Then existe el campo opcional issue: con nota de que solo aplica con github-tracking
```

## Provides

- El flag `features.github-tracking` (+ su semántica fail-safe) y el campo frontmatter `issue:`, que
  consumen -08 (proyección), -09 (estado de tarea), -12 (plan/concurrencia), -10 (reconciliación) y -11 (doc).

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado por inspección de plantillas/SKILL.
- [ ] Spec cumplida; el bloque va **comentado** en el template (no impone comportamiento).
- [ ] Gate de mutation — **N/A**.
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (plantillas + tablas de features); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-07.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos.
