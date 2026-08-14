---
id: task-pipeline-sdd-y-stack-poliglota-09
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 2
depends_on: [task-pipeline-sdd-y-stack-poliglota-05, task-pipeline-sdd-y-stack-poliglota-07]
estimate: 2h
actual: ~30m
issue: 47
created: 2026-08-14
updated: 2026-08-14
---

# Prompt de activación SDD en `/task-init` y `/doctor`

## Description

Hoy `features.sdd` es opt-in silencioso: nadie lo propone. Esta tarea hace que **`/task-init`** (instalación
nueva) y **`/doctor`** (repo ya adoptado sin el flag) **pregunten** con `AskUserQuestion` si activar la capa
SDD. Al confirmar, escriben `features.sdd: true` (y `/doctor` materializa el scaffold ADR ausente, cat. 9).
**Nunca se auto-activa** (sigue siendo decisión explícita); solo se ofrece de forma visible.

## Spec

- **`/task-init` (install)**: tras materializar `.claude/task-pipeline.yml`, si el repo **no** tiene
  `features.sdd: true`, lanza `AskUserQuestion` "¿Activar la capa SDD (spec EARS + CU Gherkin + ADR)?". Al
  **confirmar** → escribe `features.sdd: true` (descomentado) + materializa el scaffold ADR inicial
  (`.claude/specs/adr/adr-index.md` desde la semilla). Al **declinar** → deja `# sdd: false` comentado (como
  hoy).
- **`/doctor` (repo adoptado)**: si `features.sdd` está **ausente/off**, en Fase 1 lo lista como
  **nicety ofrecible** (no problema); en Fase 2, con `AskUserQuestion` + diff, pregunta si activarlo. Al
  confirmar → escribe `features.sdd: true` (con aprobación) y **enlaza con la cat. 9** (materializa el
  scaffold SDD ausente). Al declinar → no toca nada.
- **Sin canal para `AskUserQuestion`** (no interactivo) → **no activa** nada: deja el estado y lo reporta.
- **Idempotencia**: si `features.sdd` ya es `true`, **no** re-pregunta.
- **No** toca el resto del comportamiento del flag (definido en 05) ni del flujo (06).

## Fuera de alcance

- Redefinir el flag (tarea 05) o el flujo (tarea 06).
- Auto-activar sin confirmación humana.

## Scenarios (Gherkin)

```gherkin
Feature: Activación asistida de SDD

  Scenario: task-init pregunta en instalación nueva
    Given un repo que se inicializa con `/task-init` y sin `features.sdd: true`
    When se materializa la config
    Then `AskUserQuestion` pregunta si activar la capa SDD

  Scenario: doctor pregunta en repo legacy sin el flag
    Given un repo adoptado sin `features.sdd`
    When corro `/doctor`
    Then lo ofrece (Fase 2) con `AskUserQuestion`, no lo marca como problema bloqueante

  Scenario: confirmar activa el flag y materializa el scaffold
    Given la pregunta de activación
    When el usuario confirma
    Then se escribe `features.sdd: true`
    And `/doctor` materializa el scaffold ADR ausente (cat. 9)

  Scenario: declinar no cambia nada
    Given la pregunta de activación
    When el usuario declina
    Then queda `features.sdd` off (comentado), sin materializar SDD

  Scenario: sin canal para preguntar
    Given un entorno no interactivo (sin `AskUserQuestion`)
    When se llega al punto de activación
    Then NO se activa el flag a ciegas; se deja como está y se reporta

  Scenario: ya activo no re-pregunta
    Given `features.sdd: true` ya presente
    When corro `/task-init` o `/doctor`
    Then no se vuelve a preguntar por la activación (idempotente)
```

## Provides

El camino de **activación opt-in asistida** de SDD (task-init + doctor), que hace descubrible la feature sin
romper el default off.

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [x] Spec cumplida
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `task-init/SKILL.md` + `doctor/SKILL.md` (+ CHANGELOG entrada) · technical-docs
- [x] Histórico de la tarea — session log · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos
