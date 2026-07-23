---
id: task-pipeline-collision-free-ids-09
package: task-pipeline
plan: collision-free-ids
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08]
estimate: 2h
actual: 40min
created: 2026-07-23
updated: 2026-07-23
---

# Proyección de estado de TAREA en su ciclo de vida (arranque + cierre)

## Description

Proyectar a la issue de cada **tarea** sus transiciones de estado (condicional por flag). Depende de -07
(flag/campo) y -08 (issue creada + `issue:`). El cierre del **plan** → issue **padre** vive en `-12`, no
aquí. Riesgo aceptado I1 (el ciclo de vida, hoy local puro, gana pasos de red) y C3 (best-effort: si `gh`
falla, avisar y NO bloquear el cambio de estado del `.md`).

## Spec

- **`templates/task-lifecycle.md`** ("Arrancar una tarea" + "Cerrar una tarea") + la copia materializada
  `docs/guides/task-lifecycle.md` + `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md`: pasos
  **condicionales** (solo si `github-tracking.enabled` y la tarea tiene `issue:`):
  - `status: active` (arrancar) → campo de estado del Project a **In Progress** (si `project` configurado).
  - `status: done` → `gh issue close`; campo Project a **Done**.
  - `status: cancelled` → `gh issue close --reason "not planned"`.
  - `status: blocked` → añadir label `blocked` (+ campo Project si aplica).
  - **Transiciones inversas**: `blocked → active` (quitar label `blocked`, volver a In Progress);
    `done → active` (reabrir la issue, si se reabre la tarea).
  - **Idempotencia**: cerrar una issue ya cerrada = no-op (no error).
- **DoD de `templates/task.md`**: añadir línea condicional "proyección de estado a GitHub · solo si
  `features.github-tracking`".
- **Degradación (C3)**: si `gh` falla / sin red / el Project no tiene la opción de estado esperada →
  **avisar y NO bloquear** el cambio de estado del `.md` (el `.md` manda; el drift lo reconcilia `-10`).
- **NO** tocar el cierre de **plan** / issue padre (eso es `-12`) ni `/doctor` (`-10`) ni la doc de usuario (`-11`).

## Scenarios (Gherkin)

```gherkin
Feature: Proyección de estado de tarea (condicional)

  Scenario: Arrancar una tarea la pone In Progress en el Project
    Given una tarea con issue: y flag on con project configurado
    When pasa a status: active
    Then su campo de estado del Project pasa a In Progress

  Scenario: Cerrar una tarea cierra su issue
    Given una tarea con issue: y github-tracking.enabled: true
    When pasa a status: done
    Then se ejecuta gh issue close sobre su issue
    And si hay project, su campo de estado pasa a Done

  Scenario Outline: Mapeo de estado a acción de issue
    Given una tarea con issue: y el flag on
    When pasa a status: <estado>
    Then se aplica <accion>

    Examples:
      | estado    | accion                              |
      | active    | Project → In Progress               |
      | done      | gh issue close (Project → Done)     |
      | cancelled | gh issue close --reason not planned |
      | blocked   | label blocked (+ campo Project)     |

  Scenario: Desbloqueo — blocked → active
    Given una tarea blocked con label blocked
    When pasa a status: active
    Then se quita la label blocked y el Project vuelve a In Progress

  Scenario: Reapertura — done → active
    Given una tarea done con su issue cerrada
    When se reabre a status: active
    Then la issue se reabre

  Scenario: Cerrar una issue ya cerrada es no-op
    Given una tarea cuya issue ya está cerrada
    When se reintenta el cierre
    Then es no-op (no error)

  Scenario: Flag off → el ciclo de vida es local puro
    Given una tarea sin issue: o con el flag off
    When cambia de estado
    Then no se llama a gh (idéntico al default)

  Scenario: gh falla o Project sin la opción → aviso, no bloquea
    Given una tarea con issue: y el flag on, pero gh sin red (o el Project no tiene "Done")
    When la tarea pasa a status: done
    Then se avisa del fallo de proyección
    And el cambio de estado del .md se completa igual (no se bloquea)
```

## Provides

- —

## Definition of Done

- [x] Tests TDD — **N/A** (stack `none`).
- [x] Escenarios verificados por inspección + `grep` en los 4 ficheros; flag on/gh-en-vivo = NO VERIFICABLE reproducible.
- [x] Spec cumplida; el cambio de estado del `.md` nunca se bloquea por la proyección.
- [x] Gate de mutation — **N/A**.
- [x] Gate de `fact-checker` superado (9 VERIFICADO + 1 NO VERIFICABLE en vivo, 0 INCORRECTO). **No-negociable.**
- [x] Doc: **TSDoc N/A**; **doc técnica** (lifecycle plantilla + materializado + HOW-TO + DoD); **histórico**
      en `.claude/context/task-pipeline/task-pipeline-collision-free-ids-09.md`.
- [x] Barrido `grep` reforzado sin identificadores muertos.
