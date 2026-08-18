# CU-frontmatter-inline — Modelo por frontmatter en `/pipeline-usage`

- **Ámbito**: skill `/pipeline-usage` (fase inline read-only)
- **Nivel**: subfunción
- **Actor primario**: usuario que invoca `/pipeline-usage`
- **Interesados e intereses**:
  - Usuario — que la analítica corra en un modelo barato sin cambiar su sesión.
  - Mantenedor — que solo lleve frontmatter la skill donde "pega" (un turno, read-only), sin contradecir la
    invariante "el template no impone coste" más de lo justificable.

## Precondiciones

- `/pipeline-usage` es una skill de un solo turno (leer transcript + correr `python3` + presentar).

## Garantía mínima

- Si la versión de Claude Code no soporta `model:` en frontmatter, un campo desconocido se ignora (no rompe).

## Garantía de éxito (postcondición)

- `/pipeline-usage` corre en Haiku para su turno; el resto de fases inline **no** llevan frontmatter (su
  modelo se documenta como recomendación de sesión).

## Disparador

- El usuario invoca `/pipeline-usage`.

## Escenario principal (éxito)

1. El usuario invoca `/pipeline-usage`.
2. El frontmatter declara `model: haiku`.
3. La skill corre en Haiku para ese turno.

## Extensiones (flujos alternativos y de error)

- **2a.** Otra fase inline multi-turno (`grilling`, `/plan-task`, `/mutation`, `/doctor`, `/task-init`): **no**
  lleva frontmatter de modelo (el override sería por-turno y en `/task-init` degradaría el turno de juicio);
  su modelo se **documenta** como recomendación de sesión.
- **2b.** Versión de Claude Code sin soporte de `model:` en frontmatter: el campo se ignora; la skill corre
  en el modelo de sesión (comportamiento degradado, no roto).

## Reglas de negocio

- **RN-1** — Frontmatter de modelo **solo** en `/pipeline-usage`. Recomendación de sesión documentada:
  `grilling` = opus; `/plan-task`, `/mutation`, `/doctor`, `/task-init` = sonnet.

## Criterios de aceptación (Gherkin)

```gherkin
Feature: Modelo por frontmatter en /pipeline-usage

  Scenario: /pipeline-usage declara Haiku
    Given la skill /pipeline-usage
    When se inspecciona su frontmatter
    Then declara "model: haiku"

  Scenario: Las inline multi-turno no llevan frontmatter de modelo
    Given las skills grilling, plan-task, mutation, doctor, task-init
    When se inspecciona su frontmatter
    Then ninguna declara un campo model
    And su modelo recomendado está documentado como recomendación de sesión
```
