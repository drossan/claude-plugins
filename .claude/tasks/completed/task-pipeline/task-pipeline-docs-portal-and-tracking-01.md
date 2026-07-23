---
id: task-pipeline-docs-portal-and-tracking-01
package: task-pipeline
plan: docs-portal-and-tracking
status: done
priority: 1
depends_on: []
estimate: 1h
actual: 1h
issue: 12                 # SUB-ISSUE en drossan/claude-plugins (padre #11)
created: 2026-07-23
updated: 2026-07-23
---

# Activar github-tracking (Issues) + label `plan` + runbook de setup

## Description

Activar la feature `github-tracking` en `.claude/task-pipeline.yml` de forma **permanente** (todo plan/tarea
futuro se proyecta) y dejar el repo listo para la proyección one-way md→GitHub (plan→issue PADRE,
tarea→SUB-ISSUE). Crear la label `plan` (no existe). Documentar en un **runbook** los pasos manuales que la
sesión **no puede** hacer (falta `admin` y el scope `project`): conceder scope Projects, crear el Project v2,
encender Pages, y cablear `project:` en la config. Ver README del plugin → *GitHub tracking (opcional)*.

> El **flip del flag** se aplica en la sesión de `/plan-task` (Paso 5.7) para que **este propio plan** se
> proyecte; esta tarea **formaliza y verifica** esa activación (no la estrena) y añade label + runbook.

## Spec

- `.claude/task-pipeline.yml`: bajo `features:`, bloque exacto:
  ```yaml
  github-tracking:
    enabled: true
    repo: drossan/claude-plugins        # explícito: gh authed = danielrosse ≠ owner drossan
    # project:                          # PENDIENTE: nº Project v2 (requiere gh auth refresh -s project)
    # issue-type-plan:                  # no se usa; el plan lleva label `plan`
  ```
- Label `plan` creada en `drossan/claude-plugins` (`gh label create plan …`) si no existe (idempotente).
- Runbook (en `.claude/specs/task-pipeline/` o sección del README/HOW-TO — decidir en `-06` la ubicación
  final; aquí basta un fichero de runbook) que documenta, con comando por paso: (a) `gh auth refresh -s
  project`; (b) crear/elegir el Project v2 y obtener su número; (c) descomentar `project:` con ese número;
  (d) encender Pages (Settings→Pages→Source: GitHub Actions); (e) footgun `base`↔nombre-repo (#6).
- **No** se toca el template del plugin (`skills/plan-task/templates/task-pipeline.yml`): sigue con
  `github-tracking` comentado/off (no imponer coste a repos consumidores).

## Scenarios (Gherkin)

```gherkin
Feature: Activación de github-tracking en el repo dogfooding

  Scenario: la config declara la feature activa con repo explícito
    Given el YAML del repo sin bloque github-tracking
    When se activa la feature para el repo
    Then features.github-tracking.enabled es true
    And el repo objetivo es "drossan/claude-plugins" explícito
    And la clave project queda comentada (pendiente de scope)

  Scenario: la label del plan existe en el repo
    Given el repo sin la label "plan"
    When se aprovisiona la label del plan
    Then la lista de labels del repo incluye "plan"

  Scenario: re-aprovisionar la label no falla
    Given el repo ya con la label "plan"
    When se vuelve a aprovisionar la label
    Then la operación es idempotente y no aborta

  Scenario: el runbook cubre cada paso manual del owner
    Given los pasos que la sesión no puede ejecutar (scope, Project, Pages, wiring)
    When se redacta el runbook de setup
    Then cada paso queda documentado con su comando o acción concreta

  Scenario: el template del plugin no se activa
    Given el template semilla con github-tracking off/comentado
    When se activa la feature SOLO en el repo consumidor
    Then el template del plugin queda intacto (off), sin imponer la feature a terceros

  Scenario Outline: un valor no-canónico de enabled degrada a off (fail-safe, spec de la feature)
    Given enabled con el valor <valor>
    When una skill resuelve si github-tracking está activo
    Then el resultado es <estado>

    Examples:
      | valor     | estado |
      | true      | activo |
      | "true"    | off    |
      | yes       | off    |
      | 1         | off    |
      | false     | off    |
      | (ausente) | off    |

  Scenario: crear la label falla y el flujo no aborta
    Given github-tracking activo pero gh sin permiso para crear labels (403/sin red)
    When se intenta aprovisionar la label "plan"
    Then se avisa del fallo
    And la activación de la feature no se revierte ni bloquea (best-effort)

  Scenario: re-activar cuando el bloque ya existe es idempotente
    Given el YAML ya con el bloque github-tracking correcto
    When se vuelve a aplicar la activación
    Then el bloque no se duplica ni se corrompe

Feature: Proyección de este plan a GitHub (Paso 5.7 — post-condiciones verificables)

  Scenario: el plan proyectado deja padre + una sub-issue por tarea, con issue: escrito
    Given github-tracking activo y el set de 6 tareas definitivo
    When se proyecta el plan a GitHub
    Then el .md del plan tiene issue: <nº padre> en su frontmatter
    And cada uno de los 6 .md de tarea tiene su issue: <sub-issue> escrito
    And re-correr la proyección no crea ninguna issue nueva (idempotente por issue:)

  Scenario: si el padre falla al crearse, no nacen sub-issues huérfanas
    Given github-tracking activo
    When el gh issue create del padre falla
    Then no se crea ninguna sub-issue
    And se avisa, y el .md del plan y las tareas quedan materializados igual

  Scenario Outline: la proyección degrada sin bloquear el .md
    Given github-tracking activo y <fallo>
    When se intenta proyectar
    Then se avisa y NO se aborta la materialización de los .md

    Examples:
      | fallo                       |
      | gh no instalado             |
      | sin red                     |
      | authed sin permiso (403)    |
      | rate-limit a mitad de bucle |

  Scenario: /doctor reconcilia tras la proyección
    Given el plan recién proyectado
    When se corre /doctor con el flag on y gh disponible
    Then reporta cualquier .md sin issue:, issue: inexistente o sub-issue huérfana
    And no auto-edita lo no mecánico (deja la decisión al humano)

  Scenario: cerrar una tarea proyecta el cierre de su issue, best-effort
    Given una tarea con issue: y github-tracking activo
    When su status pasa a done
    Then se cierra su issue (gh issue close); si ya está cerrada es no-op
    And si gh falla, se avisa y el movimiento del .md a completed/ NO se bloquea

  Scenario: cerrar el plan cierra la issue padre
    Given el plan completado con issue: padre
    When se cierra el plan
    Then se cierra la issue padre con gh issue close (best-effort)
```

## Provides

- Repo con `github-tracking.enabled: true` y label `plan` → habilita la **proyección de este plan** (Paso
  5.7) y de todo plan/tarea futuro. Runbook que desbloquea (por el owner) el Project v2 y Pages.
- **No** hay tareas del plan que dependan de `-01` en duro (nodo suelto del DAG — riesgo aceptado por el
  owner en el change log), pero es prerequisito de la proyección de la sesión.

## Definition of Done

- [ ] Bloque `github-tracking` presente y correcto en `.claude/task-pipeline.yml` (enabled + repo + project comentado).
- [ ] Label `plan` existe en el repo (idempotente).
- [ ] Runbook de setup redactado (scope, Project, wiring `project:`, Pages, footgun `base`).
- [ ] Template del plugin **no** modificado (grep: sigue off/comentado).
- [ ] Spec cumplida; lo de `Provides` disponible.
- [ ] Gate de `fact-checker` superado (incl. «la label se creó», «el flag quedó activo») — no-negociable.
- [ ] Proyección de estado a GitHub al cerrar (issue → done/close) — best-effort, no bloquea el `.md`.
- [ ] Doc técnica + histórico de la tarea (`.claude/context/…`) actualizados.
- [ ] N/A en este stack (`stack: none`): TDD, tests en verde, gate de mutation, TSDoc, `changeset`.
