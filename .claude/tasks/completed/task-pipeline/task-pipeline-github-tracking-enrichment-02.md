---
id: task-pipeline-github-tracking-enrichment-02
package: task-pipeline
plan: github-tracking-enrichment
status: done
priority: 1
depends_on: [task-pipeline-github-tracking-enrichment-01]
estimate: 3h
actual: 1.5h
issue: 21
created: 2026-07-23
updated: 2026-07-24
---

# Ciclo de vida: Project Status + label `status:*` + assignee (arranque/cierre/bloqueo)

## Description

Proyectar el **estado** a GitHub en las transiciones del ciclo de vida, editando **ambos** ficheros que deben
quedar en paralelo: `docs/guides/task-lifecycle.md` (materializado en este repo) **y** su semilla
`task-pipeline/skills/plan-task/templates/task-lifecycle.md`. Al arrancar/cerrar/bloquear una tarea se refleja el
estado en el **campo Status del Project** y en una **label `status:*`** de la issue, y se **asigna** `@me`. El body
**no** se re-vuelca en transiciones (design-review #3). Todo best-effort (regla C3: el `.md` manda; si `gh` falla,
avisa y no bloquees). Añade además **una frase** de idempotencia a `task-pipeline/skills/doctor/SKILL.md`.

## Spec

En "Arrancar una tarea" / "Cerrar una tarea" / "Cerrar un plan" de **ambos** lifecycle (materializado + template):

- **Familia de labels** `status: in-progress` · `status: blocked` · `status: in-review` (crear si faltan; colores
  sugeridos: in-progress `FBCA04`, blocked `B60205`, in-review `0E8A16`; descripción `(task-pipeline)`).
- **Recipe idempotente (add-then-remove)**: al entrar en un estado, **añade primero** la label nueva y **después
  quita** las demás `status:*` **y la label `blocked` PELADA legacy** (esquema anterior — el recipe debe retirarla
  también, o quedaría pegada sin auto-cura). Un fallo parcial **sobre-etiqueta** (se auto-cura en la siguiente
  transición) en vez de dejar la issue **sin** estado.
- **Mapeo estado → (Status del Project, label)**, todo best-effort:
  | Transición | Status del Project | label `status:*` | Issue |
  |---|---|---|---|
  | → `active` (arranque) | `In progress` | `status: in-progress` | + assignee (ver clave `assignee`) |
  | → `in-review` | `In review` | `status: in-review` | — |
  | → `blocked` | (queda en `In progress`) | `status: blocked` | — |
  | `blocked` → `active` (desbloqueo) | `In progress` | `status: in-progress` | — |
  | → `done` | `Done` | (retirar `status:*`) | `gh issue close` |
  | → `cancelled` | `Done` | (retirar `status:*`) | `gh issue close --reason "not planned"` |
  | `done` → `active` (reapertura) | `In progress` | `status: in-progress` | `gh issue reopen` |
- **Assignee (lee la clave `assignee`, tarea 03)**: solo la sub-issue de la tarea. Resolución: `@me` (default) =
  identidad gh que arranca; un **login** para fijar otro; **`false`** para no asignar. Con `--add-assignee`
  (acumula, no reemplaza); no se desasigna al cerrar. Si el assignee no es colaborador **asignable** → avisa y sigue.
- **Padre (plan)**: `active → In progress`, `completed → Done` + `gh issue close`; **sin** label `status:*` **ni
  assignee** en el padre.
- **Match del Status case-insensitive** por nombre; si la opción no existe en el Project del consumidor → **salta el
  Status + avisa**; la label `status:*` es el fallback visible.
- **El body NO se re-vuelca** en transiciones (solo estado/assignee). El re-vuelco del body vive en la
  re-proyección explícita (`/doctor` / re-run de `/plan-task`, tarea 01).
- **Solo si la tarea tiene `issue:`**: una tarea sin `issue:` transiciona en **local puro** (ningún comando `gh`);
  no dispara un `create` (eso es Paso 5.7). Cerrar una issue ya cerrada = **no-op** (no error).
- **Corregir** el texto actual `In Progress` → `In progress` (nombre real de la opción).
- En `task-pipeline/skills/doctor/SKILL.md` (categoría 8): **una frase** — re-proyectar re-aplica **el body +
  labels/Status/assignee** de forma **idempotente** desde el `.md`; no hay detección nueva del drift de `status:*`.

## Scenarios (Gherkin)

```gherkin
Feature: Proyección de estado en las transiciones del ciclo de vida

  Scenario: Arrancar una tarea la pone In progress, la etiqueta y la asigna
    Given una tarea con issue: proyectada y features.github-tracking activo
    When la tarea pasa a active
    Then el Status del Project de su issue es "In progress"
    And la issue lleva la label "status: in-progress"
    And la issue queda asignada a @me

  Scenario: La label de estado se aplica con recipe add-then-remove
    Given una issue con la label "status: in-progress"
    When la tarea pasa a blocked
    Then primero se añade "status: blocked"
    And después se retira "status: in-progress"
    And en ningún instante la issue queda sin ninguna label status:*

  Scenario: Cerrar una tarea cierra la issue, retira el estado y marca Done
    Given una tarea active con su issue abierta y label "status: in-progress"
    When la tarea pasa a done
    Then la issue se cierra
    And se retira la label status:*
    And el Status del Project es "Done"

  Scenario: Cancelar cierra como not planned
    Given una tarea con issue abierta
    When la tarea pasa a cancelled
    Then la issue se cierra con reason "not planned"
    And el Status del Project es "Done"

  Scenario: El body no se re-vuelca al cambiar de estado
    Given una issue ya proyectada con su body
    When la tarea cambia de estado
    Then no se ejecuta ninguna reescritura del body de la issue

  Scenario: Match del Status case-insensitive y degradación si falta la opción
    Given un Project cuyo campo Status tiene la opción "In progress"
    When se proyecta el arranque buscando "In Progress"
    Then se resuelve la opción ignorando mayúsculas
    And si ninguna opción coincide, se salta el Status con aviso y solo queda la label

  Scenario: gh falla a mitad de la transición sin bloquear el .md
    Given gh devuelve error al editar el Project
    When la tarea cambia de estado
    Then se emite un aviso
    And el cambio de status: del .md se aplica igualmente

  Scenario: El padre no recibe label status:* ni assignee
    Given un plan cuyo estado pasa a active
    When se proyecta el estado del padre
    Then el Status del Project del padre es "In progress"
    And el padre no recibe ninguna label status:*
    And el padre no recibe ningún assignee

  # --- Añadidos por scenario-coverage (QA) ---

  Scenario: Pasar a in-review pone In review y etiqueta status: in-review
    Given una tarea active con su issue y label "status: in-progress"
    When la tarea pasa a in-review
    Then el Status del Project es "In review"
    And se añade "status: in-review" y se retira "status: in-progress"
    And la issue no se cierra

  Scenario: Desbloquear vuelve a In progress y re-etiqueta in-progress
    Given una tarea blocked con label "status: blocked"
    When la tarea vuelve a active
    Then el Status del Project es "In progress"
    And se añade "status: in-progress" y se retira "status: blocked"

  Scenario: Reabrir una tarea done reabre la issue y la re-etiqueta
    Given una tarea done con su issue cerrada y sin label status:*
    When la tarea vuelve a active
    Then la issue se reabre (gh issue reopen)
    And el Status del Project es "In progress"
    And se añade "status: in-progress"

  Scenario: La label blocked pelada legacy se migra a status: blocked al transicionar
    Given una issue proyectada bajo el esquema anterior con la label pelada "blocked"
    When la tarea entra en cualquier estado del nuevo esquema status:*
    Then la label pelada "blocked" se retira
    And solo queda la label status:* correspondiente al estado nuevo

  Scenario: Bloquear no cambia el Status del Project
    Given una tarea active con Status del Project "In progress"
    When la tarea pasa a blocked
    Then el Status del Project sigue siendo "In progress"
    And solo cambia la label a "status: blocked"

  Scenario: Si la retirada de la label vieja falla, la issue queda sobre-etiquetada (no sin estado)
    Given se añadió "status: blocked" pero la retirada de "status: in-progress" devuelve error
    When termina la transición
    Then la issue conserva ambas labels status:* (sobre-etiquetada) con aviso
    And la siguiente transición reconcilia el estado

  Scenario Outline: El assignee proyectado respeta la clave assignee de la config
    Given features.github-tracking.assignee es <valor>
    When la tarea pasa a active
    Then el assignee aplicado es <resultado>

    Examples:
      | valor  | resultado              |
      | @me    | la identidad gh actual |
      | otrolo | el login "otrolo"      |
      | false  | no se asigna a nadie   |

  Scenario: Si el assignee no es colaborador asignable, se avisa y la transición continúa
    Given un assignee que no es colaborador asignable del repo
    When la tarea pasa a active
    Then el intento de --add-assignee avisa y no aborta
    And el resto de la proyección de estado (Status + label) se aplica igualmente

  Scenario: Una tarea sin issue: transiciona en local sin tocar GitHub
    Given features.github-tracking activo pero una tarea cuyo .md no tiene issue:
    When la tarea cambia de estado
    Then no se ejecuta ningún comando gh
    And el cambio de status: del .md se aplica normalmente

  Scenario: Re-proyectar el estado actual no duplica labels ni assignees
    Given una tarea active ya proyectada con "status: in-progress" y asignada
    When se re-proyecta el estado active
    Then la issue mantiene una sola label status:* ("status: in-progress")
    And no se produce un segundo assignee ni error

  Scenario: Cerrar una tarea cuya issue ya está cerrada es no-op
    Given una tarea done cuya issue ya está cerrada
    When se re-proyecta el cierre
    Then no se produce error
    And no se reabre ni se re-cierra alterando el estado
```

## Provides

El **contrato de transición de estado** md↔GitHub (tabla estado→Status/label/assignee, recipe idempotente,
degradación). Las tareas 03 (config) y 04 (docs) describen y documentan este comportamiento; deben citar esta tabla.

## Definition of Done

- [ ] Spec cumplida en **ambos** lifecycle (materializado + template) — quedan en paralelo (mismo esqueleto).
- [ ] Frase de idempotencia añadida a `doctor/SKILL.md` (categoría 8).
- [ ] Escenarios verificados por inspección + ejecución real de una transición contra `drossan/claude-plugins` (incl. el write al Project, ya verificado por spike).
- [ ] Gate de `fact-checker` superado · no-negociable.
- [ ] Proyección de estado al cerrar esta propia tarea (dogfooding) — best-effort.
- [ ] Documentación: doc técnica (los lifecycle) + histórico en `.claude/context/task-pipeline/…-02.md`.
- [ ] TDD/mutation = **N/A** (stack `none`); barrido `grep` sin identificadores muertos.
