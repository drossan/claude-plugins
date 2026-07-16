---
id: task-pipeline-010
package: task-pipeline
plan: usage-analytics-and-caveman
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: []
estimate: 1h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Flag `features.caveman` — configuración del modo caveman-lite

## Description

Introducir el flag de comportamiento **`features.caveman`** que activa el modo
caveman-lite. Es un **comportamiento opt-in** (default `off`), documentado **junto a
los features existentes** (sin crear una "categoría" nueva). El template se queda
OFF/comentado (invariante: no imponer coste a repos consumidores); este repo lo enciende
en `lite` para dogfood. El **hook** que consume el flag es la tarea 011.

## Spec

- Valores **canónicos**: `off` (default) | `lite` | `full`.
  - `lite` = comprimir relleno/cortesías manteniendo gramática legible.
  - `full` = compresión mayor (fragmentos), sin tocar código/comandos/errores/paths.
  - **Cualquier otro valor** (desconocido, con espacios, mayúsculas, `true`, o la clave
    **comentada**/ausente) → se resuelve como **`off`** (fail-safe). Contrato que la
    tarea 011 debe respetar al leerlo.
- `task-pipeline/skills/plan-task/templates/task-pipeline.yml`: añadir `features.caveman`
  **comentado con default `off`** + comentario (valores + que el hook lo lee). **No**
  encender nada en el template.
- `.claude/task-pipeline.yml` (este repo): añadir `features.caveman: lite` (dogfood).
- Documentar el flag en `task-pipeline/README.md` (tabla `features`) y en
  `docs/guides/task-lifecycle.md` (tabla de flags): **default OFF**, **comportamiento**
  (no gate de DoD), **no forma parte de ningún preset** (`mode: full` NO lo enciende).

## Scenarios (Gherkin)

```gherkin
Feature: Declarar el modo caveman por repo

  Scenario: El template no impone caveman
    Given la plantilla templates/task-pipeline.yml
    When la inspecciono
    Then features.caveman aparece comentado con default off
    And ningún repo consumidor hereda caveman activado

  Scenario: Este repo dogfoodea caveman-lite
    Given el .claude/task-pipeline.yml de este repo
    When lo inspecciono
    Then features.caveman está en "lite"

  Scenario: El preset no activa caveman
    Given un task-pipeline.yml con mode: full y sin clave features.caveman
    When el pipeline resuelve la configuración
    Then caveman está off (no es parte de ningún preset; default off en cualquier mode)

  Scenario Outline: Semántica de los valores del flag
    Given features.caveman con valor <valor>
    When el pipeline resuelve la configuración
    Then el modo caveman resultante es <efecto>

    Examples:
      | valor       | efecto                          |
      | off         | desactivado                     |
      | lite        | compresión ligera del output    |
      | full        | compresión mayor del output     |
      | (ausente)   | desactivado (default off)       |
      | (comentado) | desactivado (no se lee)         |
      | LITE        | desactivado (no canónico → off) |
      | "lite "     | desactivado (no canónico → off) |
      | true        | desactivado (no canónico → off) |
      | xyz         | desactivado (no canónico → off) |

  Scenario: Documentación coherente
    Given README.md y docs/guides/task-lifecycle.md
    When busco la definición de features.caveman
    Then está documentado como comportamiento opt-in default OFF, junto a los features existentes
    And se aclara que no forma parte de ningún preset
```

## Provides

- El contrato del flag `features.caveman` (valores canónicos + fail-safe a `off` +
  ubicación en el YAML) que la tarea 011 (hook) lee.

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`: config YAML + docs).
- [ ] Cada escenario Gherkin verificado por inspección (`grep`/lectura de YAML/docs).
- [ ] Spec cumplida; `Provides` disponible para la tarea 011.
- [ ] Gate de mutation — **N/A** (`stack.mutation-tool: none`).
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (README + task-lifecycle) actualizada;
      **histórico** en `.claude/context/task-pipeline/task-pipeline-010.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos. Template sin coste impuesto.
