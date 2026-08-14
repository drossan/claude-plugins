---
id: task-pipeline-sdd-y-stack-poliglota-11
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 2
depends_on: [task-pipeline-sdd-y-stack-poliglota-10]
estimate: 3h
actual: ~50m
issue: 49
created: 2026-08-14
updated: 2026-08-14
---

# Cableado: auto-commit al cerrar tarea + auto-PR al cerrar plan + conventional/co-author

## Description

Cablea el **comportamiento** de los flags de la tarea 10 en el ciclo de vida (gated). Con
`git-automation.auto-commit` on, al cerrar una tarea la sesión **commitea automáticamente**; con `auto-pr`
on, al cerrar el **PLAN** abre la PR. El mensaje respeta `features.conventional-commits` (formato) y el
trailer de co-autor respeta `git-automation.co-author` (default: no lo añade). Todo **off por defecto** =
comportamiento actual intacto (commit/PR manuales).

## Spec

- **"Cerrar una tarea" (2×lifecycle + `plan-task/SKILL.md`)**: paso condicional — si
  `git-automation.auto-commit` on, tras pasar la DoD (fact-checker incluido) la sesión ejecuta el commit
  `<task-id>: <mensaje>` automáticamente. Si off (default), el commit es **manual** como hoy.
- **Formato del mensaje** (gated por `conventional-commits`): con ON (default), `<task-id>: <conventional
  commit>` (como hoy). Con `conventional-commits: false`, se relaja a `<task-id>: <mensaje libre>`.
- **Trailer de co-autor** (gated por `git-automation.co-author`, default **false**): el commit de la
  automatización **no** añade el trailer de co-autor salvo que `co-author: true`. **Regla explícita**: esto
  gobierna los commits de la **automatización**; no impone nada a commits manuales (los rige tu `CLAUDE.md`).
- **"Cerrar un plan" (2×lifecycle)**: paso condicional — si `git-automation.auto-pr` on **y** `auto-commit`
  on, al cerrar la **última** tarea la sesión abre la **PR** `plan/<pkg>/<name-plan>` → rama de integración.
  **`auto-pr` sin `auto-commit`** = inerte + aviso. Con off (default), la PR es manual (al cerrar el plan).
- **`/doctor`**: reconoce `features.conventional-commits` y `features.git-automation` — su ausencia **no es
  drift** (bloque opt-in, como caveman/github-tracking); `doctor` puede ofrecerlos comentados como nicety.
  Valor no-booleano → off por fail-safe.
- **Degradación**: si el commit/PR automático **falla** (git/gh error), se **avisa** y **no** se bloquea el
  cambio de `status:` del `.md` (el `.md` manda; best-effort, coherente con github-tracking C3).
- **Off = comportamiento idéntico a hoy**: sin `git-automation`, commit y PR son manuales exactamente como
  ahora.
- **Doc de la feature**: append a `website/features/git-automation.md` (parte de comportamiento) + CHANGELOG.

## Fuera de alcance

- El **schema/flags** (tarea 10) y el **prompt de activación** (tarea 09).
- Cambiar el comportamiento con los flags **off** (debe quedar idéntico a hoy).
- Un runner/hook nuevo: el cableado es **instrucción del ciclo de vida** (la sesión ejecuta git/gh), no un
  hook automático de plataforma.

## Scenarios (Gherkin)

```gherkin
Feature: Automatización de commit y PR

  Scenario: auto-commit al cerrar una tarea
    Given `git-automation.auto-commit` on y una tarea que pasa su DoD
    When se cierra la tarea
    Then la sesión ejecuta el commit `<task-id>: <mensaje>` automáticamente

  Scenario: mensaje respeta conventional-commits
    Given `conventional-commits` ON (default)
    When se genera el commit automático
    Then el mensaje sigue el formato `<task-id>: <conventional commit>`

  Scenario: co-author default no añade el trailer
    Given `git-automation.co-author` off (default)
    When se genera el commit automático
    Then el mensaje NO añade el trailer de co-autor

  Scenario: co-author on añade el trailer
    Given `git-automation.co-author: true`
    When se genera el commit automático
    Then el mensaje añade el trailer de co-autor

  Scenario: auto-pr al cerrar el plan
    Given `auto-commit` on y `auto-pr` on
    When se cierra la ÚLTIMA tarea del plan
    Then la sesión abre la PR de la rama del plan a la rama de integración

  Scenario: auto-pr sin auto-commit es inerte
    Given `auto-pr: true` y `auto-commit: false`
    When se cierra una tarea
    Then no se abre PR y se avisa de la dependencia

  Scenario: off = comportamiento actual
    Given sin `features.git-automation` (default)
    When se cierra una tarea o un plan
    Then commit y PR son manuales, exactamente como hoy

  Scenario: fallo del commit/PR automático no bloquea el .md
    Given `auto-commit` on y `git` falla al commitear
    When se cierra la tarea
    Then se avisa y el cambio de `status:` del `.md` NO se bloquea

  Scenario: doctor reconoce los flags (ausencia ≠ drift)
    Given un repo sin `features.git-automation`
    When corro `/doctor`
    Then NO reporta la ausencia como drift
```

## Provides

El **contrato del comportamiento** git-automation/conventional que sigue una sesión de un repo consumidor.
Nada aguas abajo depende de él salvo la coherencia de release (tarea 12).

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [x] Spec cumplida; contradicción con "PR al cerrar el plan" resuelta (auto-pr = plan-close)
- [x] Gate de `fact-checker` superado — en especial "off = comportamiento idéntico a hoy" y "co-author default no añade trailer" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: 2×lifecycle (Cerrar tarea/plan) + `plan-task/SKILL.md` + `doctor/SKILL.md` + `website/features/git-automation.md` + CHANGELOG · technical-docs
- [x] Histórico de la tarea — session log · context-log
- [x] Barrido `grep` reforzado: DoD/espejos consistentes; sin identificadores muertos
