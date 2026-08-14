---
id: task-pipeline-sdd-y-stack-poliglota-10
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 1
depends_on: []
estimate: 2h
actual: ~40m
issue: 48
created: 2026-08-14
updated: 2026-08-14
---

# Schema `features.conventional-commits` + bloque `features.git-automation`

## Description

Añade dos piezas de config nuevas (solo **schema + doc**, el comportamiento es la tarea 11):
un flag top-level **`features.conventional-commits`** (default **ON**, gobierna el formato del mensaje) y un
bloque opt-in **`features.git-automation`** { `auto-commit`, `auto-pr`, `co-author` } para automatizar
commit/PR. Patrón `caveman`/`github-tracking`: opt-in, fuera de preset, fail-safe, **ausencia ≠ drift**.

## Spec

- **`features.conventional-commits`** (booleano, **default ON**): exige el formato `<task-id>: <conventional
  commit>` en la DoD/commits. Es el **comportamiento actual**, ahora **configurable**: `false` lo relaja.
  Está **dentro de preset** (default ON como hoy) — NO es opt-in silencioso: su ausencia = ON (histórico).
- **`features.git-automation`** (bloque **opt-in**, default **off**, **fuera de preset**, ausencia ≠ drift):
  - `auto-commit` (bool, default off): al cerrar una tarea, commitea automáticamente.
  - `auto-pr` (bool, default off): al cerrar el **PLAN** (última tarea), abre la PR. **`auto-pr` requiere
    `auto-commit`** (sin commit no hay nada que PR-ear); si `auto-pr: true` con `auto-commit: false` → se
    avisa y `auto-pr` queda inerte.
  - `co-author` (bool, default **false**): si `true`, los commits **de la automatización** añaden el trailer
    de co-autor; **default false = no lo añaden**.
  - **FAIL-SAFE**: solo `true` booleano activa cada toggle; ausente / `false` / `"true"` / `yes` / `1` /
    no-canónico → off. El bloque ausente entero = off (no drift).
- **Sedes del schema** (mismas que un flag nuevo): 2× YAML (seed comentado + repo), tabla de flags de README
  + 2× `task-lifecycle` + contrato de `plan-task/SKILL.md`.
- **Portal**: `website/features/git-automation.md` (Activar / Qué hace / Garantías) + registrar en el sidebar
  `Opcional` de `config.mts`.
- **CHANGELOG**: entrada `### Added` de los flags (comportamiento = tarea 11).
- **Preguntar en install** (task-init/doctor): `conventional-commits` y `git-automation` se **ofrecen** al
  materializar (coherente con la tarea 09; el prompt en sí es de 09/11, aquí solo el schema los contempla).

## Fuera de alcance

- El **comportamiento** (auto-commit/PR real, validación de formato): tarea 11.
- El prompt de activación (tarea 09) más allá de contemplar los flags en el schema.

## Scenarios (Gherkin)

```gherkin
Feature: Schema de git-automation y conventional-commits

  Scenario: conventional-commits default ON (ausencia = histórico)
    Given una config sin `features.conventional-commits`
    When se resuelve la config
    Then conventional-commits está ON (comportamiento actual, no cambia)

  Scenario: git-automation opt-in default off
    Given una config sin `features.git-automation`
    When se resuelve la config
    Then auto-commit, auto-pr y co-author están OFF
    And `/doctor` NO reporta la ausencia como drift

  Scenario Outline: fail-safe de los toggles
    Given `features.git-automation.<toggle>: <valor>`
    When se resuelve la config
    Then el toggle está activo solo si <activo>

    Examples:
      | toggle      | valor  | activo |
      | auto-commit | true   | sí     |
      | auto-commit | "true" | no     |
      | auto-pr     | 1      | no     |
      | co-author   | yes    | no     |

  Scenario: auto-pr requiere auto-commit
    Given `auto-pr: true` y `auto-commit: false`
    When se resuelve la config
    Then auto-pr queda inerte y se avisa de la dependencia

  Scenario: co-author default no añade el trailer
    Given `features.git-automation` sin `co-author`
    Then la automatización NO añadiría el trailer de co-autor (default false)

  Scenario: flags presentes en todas las sedes del schema
    Given el cambio aplicado
    Then `conventional-commits` y `git-automation` están en: seed YAML (comentado), README (tabla),
         2×lifecycle (tabla), contrato de `plan-task/SKILL.md`, y `website/features/git-automation.md` + sidebar

  Scenario: página de portal registrada
    Given `website/`
    Then existe `features/git-automation.md` registrada en el grupo `Opcional` del sidebar
```

## Provides

Los flags `features.conventional-commits` (default ON) y el bloque `features.git-automation` (opt-in) + su
superficie de doc; el contrato que lee el cableado de la tarea 11 y el reconocimiento de `/doctor`.

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [x] Spec cumplida; `Provides` disponible para 11
- [x] Gate de `fact-checker` superado — en especial "conventional-commits default ON" y "git-automation ausencia ≠ drift" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: tabla de flags (README + 2×lifecycle) + `plan-task/SKILL.md` + seed YAML + `website/features/git-automation.md` + `config.mts` + CHANGELOG · technical-docs
- [x] Histórico de la tarea — session log · context-log
- [x] Barrido `grep` reforzado: tablas de flags espejo consistentes
