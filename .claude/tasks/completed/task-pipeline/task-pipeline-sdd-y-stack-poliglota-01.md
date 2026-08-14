---
id: task-pipeline-sdd-y-stack-poliglota-01
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 2h
actual: ~1h
issue: 38                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#38
created: 2026-08-13
updated: 2026-08-14
---

# Schema `stack.packages.<pkg>` + regla de resolución canónica

## Description

Extiende el schema de `.claude/task-pipeline.yml` con un **override map de stack por-workspace**
(`stack.packages.<pkg>`), para que un monorepo poliglota no colapse a un único `stack:` plano (#35). El
`stack:` top-level queda como **default/fallback**. Es la tarea **foundational**: `/mutation` (02),
`/task-init` (03) y `/doctor` (07) leen este contrato. La regla de resolución se enuncia **una sola vez**
(README) y las demás sedes apuntan a ella (F4 del design-review: no replicar prosa sutil en 8 sitios).

## Spec

- **Regla de resolución (canónica, en README → "Configuración por repo")**: por-clave
  `stack.packages.<pkg>.<k>` → `stack.<k>` (top-level) → default del preset. **Herencia parcial**: una
  entrada de package solo pisa las claves que declara; el resto se hereda. Clave del map = el `<package>`
  (mismo nombre de workspace que `.claude/tasks|plans/<package>/`). **`packages` ausente = comportamiento
  histórico exacto** (solo el `stack:` plano) y **no es drift**.
- **YAML seed** (`templates/task-pipeline.yml`): añade un bloque `packages:` **comentado** de ejemplo (≥1
  workspace pisando ≥1 clave) + puntero a la regla canónica. El template **no impone** coste (comentado).
- **Repo config** (`.claude/task-pipeline.yml`): puntero comentado (este repo es single-package `task-pipeline`,
  `stack: none` — no necesita override real).
- **Sedes espejo** (prosa de stack en README, `templates/task-lifecycle.md`, `docs/guides/task-lifecycle.md`,
  contrato de lectura en `plan-task/SKILL.md`): **apuntan** a la regla canónica del README; **no** la
  re-enuncian entera.
- **Invariante para `/doctor`** (se implementa en 07, se declara aquí): `stack.packages` ausente ≠ drift.
- **Degradación ante malformado**: si `stack.packages` no es un mapa (o una entrada de package no es un
  mapa), el lector lo reporta como **config malformada legible** y **no aborta** el resto de la lectura de
  config (la detección/aviso vive en `/doctor`, tarea 07).

## Fuera de alcance

- Implementar los **lectores** del schema: `/mutation` (tarea 02) y `/task-init` (tarea 03). Esta tarea
  es solo el **schema + contrato + su enunciado canónico**.
- Tocar `honesty-rules.md` y su ancla; cambiar la **frase canónica** del salto trivial.

## Scenarios (Gherkin)

<!-- Stack `none`: escenarios = criterios de aceptación verificables por inspección/grep. -->

```gherkin
Feature: Schema de stack por-package con resolución canónica

  Scenario: el seed documenta el override por-package (comentado)
    Given el template `skills/plan-task/templates/task-pipeline.yml`
    When leo el bloque `stack:`
    Then contiene un `packages:` comentado con ≥1 workspace que pisa ≥1 clave
    And un puntero a la regla de resolución canónica del README

  Scenario: la regla de resolución vive en un solo sitio
    Given el README del plugin y las demás sedes de stack
    When busco la regla `stack.packages.<pkg>.<k>` → `stack.<k>` → preset
    Then está enunciada entera solo en README → "Configuración por repo"
    And las otras sedes (2×lifecycle, `plan-task/SKILL.md`) solo la apuntan, sin re-enunciarla

  Scenario Outline: herencia parcial cubre las 4 claves del stack
    Given `stack: { language: typescript, package-manager: pnpm, test-runner: vitest, mutation-tool: stryker }`
      And `stack.packages.api: { language: python, mutation-tool: mutmut }`
    When resuelvo la clave <clave> del package `api`
    Then el valor efectivo es <valor>

    Examples:
      | clave           | valor    |
      | language        | python   |
      | mutation-tool   | mutmut   |
      | package-manager | pnpm     |
      | test-runner     | vitest   |

  Scenario: paquetes mixtos — solo algunos tienen override
    Given `stack.packages.api: { language: python }` y ningún override para `web`
    When resuelvo el stack de `web`
    Then usa el `stack:` top-level completo (sin heredar nada de `api`)

  Scenario: `packages` ausente = comportamiento histórico
    Given una config sin `stack.packages`
    When una skill resuelve el stack de un package
    Then usa el `stack:` plano top-level (comportamiento histórico)
    And `/doctor` NO reporta la ausencia como drift

  Scenario: `stack.packages` malformado
    Given `stack.packages` es una lista en vez de un mapa
    When una skill intenta resolver el stack de un package
    Then se reporta como config malformada (legible) y no se aborta el resto de la lectura de config
```

## Provides

El **contrato de resolución** `stack.packages.<pkg>.<k>` → `stack.<k>` → preset (canónico en README), que
leen `/mutation` (02), `/task-init` (03) y `/doctor` (07).

## Definition of Done

<!-- Stack `none` (Markdown+Bash, sin runner): TDD y gate de mutation son N/A y se omiten (ver HOW-TO).
     Los escenarios Gherkin son criterios de aceptación por inspección. -->
- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep` / `test -d`)
- [x] Spec cumplida; `Provides` disponible para 02/03/07
- [x] Gate de `fact-checker` superado — afirmaciones de la sesión verificadas (INCORRECTO bloquea; NO VERIFICABLE = aviso) · no-negociable
- [x] Proyección de estado a GitHub al cerrar (issue → done/close) — best-effort · features.github-tracking ON
- [x] Doc técnica: README (regla canónica) + punteros en 2×lifecycle + `plan-task/SKILL.md` + seed YAML · technical-docs
- [x] Entrada `### Added` en `CHANGELOG.md` atribuible a esta feature (la consolida la tarea 08) · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-01.md` · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos; espejos de stack consistentes
