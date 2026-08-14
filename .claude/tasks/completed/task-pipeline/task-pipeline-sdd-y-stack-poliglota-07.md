---
id: task-pipeline-sdd-y-stack-poliglota-07
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 2
depends_on: [task-pipeline-sdd-y-stack-poliglota-01, task-pipeline-sdd-y-stack-poliglota-04, task-pipeline-sdd-y-stack-poliglota-05]
estimate: 2h
actual: ~40m
issue: 44                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#44
created: 2026-08-13
updated: 2026-08-14
---

# `/doctor` reconoce `features.sdd` + `stack.packages` y detecta plantillas SDD ausentes

## Description

Enseña a `/doctor` el schema/flag nuevos: **`features.sdd` y `stack.packages` ausentes NO son drift**
(como `caveman`/`github-tracking`); y **si `features.sdd: true` pero faltan las plantillas SDD** (según la
**lista canónica** de la tarea 04), lo reporta como hallazgo **corregible** (con aprobación + diff), no en
silencio. Estrena un patrón nuevo en doctor: "detección condicional-a-flag de presencia de plantillas".

## Spec

- **`doctor/SKILL.md`**: `features.sdd` ausente → **no drift**; `stack.packages` ausente → **no drift**.
  Redacción alineada con las categorías existentes de "ausencia ≠ drift" (caveman/github-tracking).
- **Categoría nueva (condicional al flag)**: si `features.sdd: true` **y** faltan artefactos SDD de la
  **lista canónica** de la tarea 04 (p.ej. `.claude/specs/adr/` + las plantillas materializables) → reporta
  como hallazgo corregible: ofrece materializar desde las semillas, **solo tras aprobación y con diff**. Si
  el flag está off → no evalúa esta categoría.
- **Referencia única**: la lista de plantillas SDD a comprobar la toma de donde la fija la tarea 04 (no la
  re-lista aquí — F7c: un solo sitio para 04 y 07).
- **Presencia PARCIAL**: reporta **solo la pieza faltante** (p.ej. `.claude/specs/adr/` existe pero sin
  `adr-index.md`), no un hallazgo genérico de "todo ausente".
- **Alcance per-package**: la comprobación de `spec.md`/`casos-de-uso/` es **por package** — reporta solo el
  package que no lo tiene; `.claude/specs/adr/` es global.
- **`stack.packages` con clave huérfana (T4)**: si una clave `stack.packages.<pkg>` **no corresponde a un
  workspace real**, lo reporta como aviso (config muerta por typo). También reporta `stack.packages`
  **malformado** (no-mapa) — el hueco que la tarea 01 declara y que aquí se detecta.
- **`features.sdd` con valor no-booleano/malformado** → `/doctor` lo trata como **off** por fail-safe (no
  como "config inválida" que bloquee); coherente con caveman/github-tracking.
- **Idempotencia de la categoría SDD**: tras aplicar el fix (materializar desde semillas, con aprobación),
  una segunda pasada **no repite** el hallazgo.
- **No amplía** la re-materialización del `task-lifecycle.md` completo (limitación preexistente).

## Fuera de alcance

- **Re-materializar** el `task-lifecycle.md` completo por drift (limitación preexistente, no se amplía).
- El **seed del sitio** (diferido).
- Reconciliación remota (fuera del alcance de doctor para esta feature).

## Scenarios (Gherkin)

```gherkin
Feature: /doctor conoce el schema/flag SDD y stack.packages

  Scenario: ausencia de features.sdd no es drift
    Given un repo sin `features.sdd`
    When corro `/doctor`
    Then NO lo reporta como drift

  Scenario: ausencia de stack.packages no es drift
    Given un repo sin `stack.packages`
    When corro `/doctor`
    Then NO lo reporta como drift

  Scenario: flag on + plantillas SDD ausentes = hallazgo corregible
    Given `features.sdd: true` y sin `.claude/specs/adr/` ni plantillas SDD materializables
    When corro `/doctor`
    Then reporta el scaffolding SDD ausente como hallazgo corregible (aprobación + diff)
    And referencia la lista canónica de la tarea 04

  Scenario: flag on + plantillas presentes = sin hallazgo
    Given `features.sdd: true` y las plantillas SDD presentes
    When corro `/doctor`
    Then no hay hallazgo de drift SDD

  Scenario: flag off no evalúa la categoría SDD
    Given `features.sdd` off (default)
    When corro `/doctor`
    Then no evalúa la presencia de plantillas SDD

  Scenario: flag on + plantillas SDD parcialmente presentes
    Given `features.sdd: true`, `.claude/specs/adr/` existe pero sin `adr-index.md`
    When corro `/doctor`
    Then reporta solo la pieza faltante (`adr-index.md`), no "todo ausente"

  Scenario: alcance per-package de la categoría SDD
    Given `features.sdd: true` y dos packages, uno con `spec.md` y otro sin él
    When corro `/doctor`
    Then reporta la ausencia SOLO del package que no lo tiene

  Scenario: clave stack.packages huérfana (typo)
    Given `stack.packages.apii` que no corresponde a ningún workspace real
    When corro `/doctor`
    Then avisa de la clave huérfana (config muerta por typo)

  Scenario: features.sdd con valor no-booleano
    Given `features.sdd: quizas`
    When corro `/doctor`
    Then lo trata como off (fail-safe), no como config inválida que bloquee

  Scenario: idempotencia del fix SDD
    Given un hallazgo SDD ya corregido (plantillas materializadas)
    When corro `/doctor` una segunda vez
    Then no repite el hallazgo
```

## Provides

`/doctor` que reconoce `features.sdd` + `stack.packages` (ausencia ≠ drift) y detecta el scaffolding SDD
ausente con el flag on.

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (correr `/doctor` en repos de prueba: sin flag / flag on sin plantillas / flag on con plantillas)
- [x] Spec cumplida; referencia a la lista canónica de la tarea 04 (sin re-listar)
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `doctor/SKILL.md` (categorías nuevas) · technical-docs
- [x] Entrada `### Added` en `CHANGELOG.md` atribuible a esta feature (la consolida la tarea 08) · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-07.md` · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos
