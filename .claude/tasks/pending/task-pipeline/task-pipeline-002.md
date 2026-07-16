---
id: task-pipeline-002
package: task-pipeline
plan: grilling-and-model-routing
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: [task-pipeline-001]
estimate: 2h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Parte B — Routing de modelo por fase (`models:`) para los subagentes

## Description

Permitir **fijar el modelo** de las fases que lanzan subagente (`design-review`, `scenario-coverage`)
vía una sección `models:` en `.claude/task-pipeline.yml`, editable por repo. Las fases inline
(`grilling`, `mutation`, `plan-task`) heredan la sesión y **no se rutan** (limitación de la plataforma,
verificada contra `code.claude.com/docs`). Documentar esa limitación **una sola vez** (hallazgo #5 del
design-review) en el README del plugin y referenciarla.

## Spec

- Sección `models:` en `.claude/task-pipeline.yml` (este repo): `design-review: opus`;
  `scenario-coverage` en inherit (comentada/ausente). `mutation` **no** aparece (es inline).
- Sección `models:` en `templates/task-pipeline.yml`: ambas claves **comentadas** (inherit).
- Semántica documentada: clave ausente o `inherit` = modelo de sesión; alias/id = se pasa como `model`
  al lanzar el subagente. **Valor inválido** (typo/id inexistente) = se avisa y se cae a inherit (no se
  lanza con un model roto). **Clave para una fase inline** = se ignora (esa fase hereda la sesión).
- `skills/design-review/SKILL.md` (Paso 2): leer `models.design-review`; si trae modelo válido, pasarlo
  como `model` al Agent (junto a `subagent_type: general-purpose`).
- `skills/scenario-coverage/SKILL.md` (Paso 2): ídem con `models.scenario-coverage`.
- `skills/plan-task/SKILL.md` (config): añadir `models:` a lo que se lee del YAML + nota honesta.
- **Actualizar la cabecera** de `.claude/task-pipeline.yml` y `templates/task-pipeline.yml`: la lista
  "skills que LEEN este archivo" debe incluir `design-review` y `scenario-coverage` (nuevos lectores de
  `models:`). (El `/task`→`/plan-task` de esa misma cabecera lo arregla la tarea 001.)
- Doc: la limitación de plataforma se explica **una vez** (README del plugin); `task-lifecycle.md`, el
  otro README y `flujo-del-pipeline.md` la **referencian**, no la duplican.

## Scenarios (Gherkin)

```gherkin
Feature: Modelo por fase para los subagentes del pipeline

  Scenario: Una fase con pin usa ese modelo
    Given `models.design-review` fijado a opus en el YAML del repo
    When se lanza el subagente de design-review
    Then el subagente arranca con el modelo opus

  Scenario: Una fase sin pin hereda el modelo de sesión
    Given `models.scenario-coverage` ausente o en inherit
    When se lanza el subagente de scenario-coverage
    Then el subagente hereda el modelo de la sesión y no se fuerza ninguno

  Scenario: Un valor de modelo inválido no lanza un subagente roto
    Given `models.design-review` con un valor que no es un alias/id válido
    When se lanza el subagente de design-review
    Then se avisa del valor inválido y se cae a inherit (no se lanza con un model roto)

  Scenario: Un pin sobre una fase inline se ignora
    Given `models:` con una clave para una fase inline (p.ej. mutation)
    When corre esa fase inline
    Then el pin se ignora y la fase hereda la sesión (no se intenta rutar)

  Scenario: El template no impone modelos a repos consumidores
    Given un repo que adopta el plugin y copia el `templates/task-pipeline.yml`
    When lee su sección `models:`
    Then las claves vienen comentadas (inherit) y no fuerzan opus/sonnet

  Scenario: La cabecera del YAML lista los lectores reales
    Given la cabecera de `.claude/task-pipeline.yml` y del template
    When se lee qué skills declaran leer el archivo
    Then incluye `design-review` y `scenario-coverage`

  Scenario: La limitación de plataforma se documenta una sola vez
    Given la doc del plugin
    When se busca la explicación "inline hereda sesión / no hay auto-óptimo"
    Then aparece una única vez (README del plugin)

  Scenario Outline: Cada documento no-canónico enlaza a la explicación única
    Given el documento "<doc>"
    When se busca la limitación de routing inline
    Then no la reexplica y contiene una referencia al README del plugin

    Examples:
      | doc                           |
      | README raíz                   |
      | docs/guides/task-lifecycle.md |
      | docs/flujo-del-pipeline.md    |
```

## Provides

- Contrato de config `models:` (claves = fases con subagente; valores = alias/id/inherit; inválido→aviso
  + inherit; clave inline→ignorada) que la tarea 003 (`doctor`) usa para detectar la sección ausente.

## Definition of Done

> Stack `none`: TDD y mutation = **N/A**; escenarios = spec de comportamiento; verificación manual.
- [ ] Cada escenario verificado (inspección del YAML + de las instrucciones de las 2 skills).
- [ ] `design-review`/`scenario-coverage` leen `models.<fase>` y pasan `model`; inválido→inherit; inline→ignorado.
- [ ] `mutation` NO en `models:`; template comentado; repo con `design-review: opus`; cabecera con lectores reales.
- [ ] Doc técnica: limitación documentada una vez + referencias navegables; sin duplicación.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-002.md`.
- [ ] Commit `task-pipeline-002: feat: routing de modelo por fase (models:) para subagentes`.
