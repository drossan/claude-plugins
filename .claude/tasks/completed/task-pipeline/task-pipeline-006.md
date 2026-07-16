---
id: task-pipeline-006
package: task-pipeline
plan: honesty-and-verification
status: done          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: [task-pipeline-005]
estimate: 1.5h
actual: 0.75h
created: 2026-07-16
updated: 2026-07-16
---

# Gate `fact-checker` en la DoD (cierre) + frontera con `doctor`

## Description

Cablear `fact-checker` como **gate de cierre no-negociable** (decisión R3: sin flag; barato+nuclear como
`grilling`/aprobación). La orquestación es explícita en la doc del flujo, no un hook (verificado: un hook
no puede invocar un subagente). Y añadir una frase de **frontera `fact-checker` ↔ `doctor`** para que no
crezcan el uno hacia el otro.

## Spec

- **DoD de ejecución de tarea**: en `skills/plan-task/templates/HOW-TO-START-A-TASK.md` (bloque de cierre)
  y en `templates/task-lifecycle.md` (sección "Cerrar una tarea") — añadir: *antes de commit y del resumen
  final, correr `fact-checker` sobre las afirmaciones de la sesión; una afirmación INCORRECTA bloquea el
  cierre hasta corregirla*. Es **no-negociable** (no hay flag que lo desactive).
- **Cierre de `plan-task`**: en `skills/plan-task/SKILL.md` (Paso 6 handoff / reglas de sesión) — mencionar
  que el cierre de cada tarea incluye la pasada de `fact-checker`.
- **Frontera `fact-checker` ↔ `doctor`** (una frase, en el README del plugin y/o en la description):
  `fact-checker` verifica la **veracidad de afirmaciones** de una sesión; `doctor` verifica el **drift de
  convención** de un repo adoptado. No se solapan.
- **Trato de cada veredicto al cierre** (SC-A): `VERIFICADO` pasa; `INCORRECTO` **bloquea** el cierre
  hasta corregir; `NO VERIFICABLE` se muestra como **aviso que hay que reconocer** explícitamente
  (frecuente en stack `none`), pero **no bloquea**.
- **Orden**: `fact-checker` corre **tras** el gate de `mutation` (para poder verificar la afirmación
  "mutation pasó") y **antes** de commit/resumen.
- **Extensión de `doctor`** (SC-B): en un repo ya adoptado (HOW-TO/task-lifecycle materializados antes de
  0.10.0), `doctor` detecta que la DoD de cierre **no menciona el gate de fact-checker** y ofrece
  re-materializar/añadir la línea (repo-owned, con diff + aprobación).
- **Coherencia**: no introducir `features.fact-check` (R3). No añadir hooks nuevos.

## Scenarios (Gherkin)

```gherkin
Feature: Gate fact-checker en el cierre de tarea

  Scenario: El cierre de tarea exige la pasada de fact-checker
    Given la DoD de cierre en el HOW-TO y en task-lifecycle
    When se lee el bloque de cierre
    Then indica correr fact-checker antes de commit y del resumen final

  Scenario: Una afirmación INCORRECTA bloquea el cierre
    Given una tarea cuyo resumen afirma algo que fact-checker marca INCORRECTO
    When se intenta cerrar la tarea
    Then el cierre no procede hasta corregir la afirmación

  Scenario: El gate no es configurable por flag
    Given la documentación del gate
    When se busca un flag para desactivarlo (p.ej. features.fact-check)
    Then no existe tal flag: el gate es no-negociable como grilling/aprobación

  Scenario: La frontera con doctor queda explícita
    Given la doc que menciona fact-checker y doctor
    When se lee qué hace cada uno
    Then fact-checker se describe como verificación de afirmaciones de sesión
    And doctor como verificación de drift de convención del repo

  Scenario: Una afirmación NO VERIFICABLE al cierre se avisa pero no bloquea
    Given una tarea cuyo resumen contiene una afirmación NO VERIFICABLE
    When se llega al gate de cierre
    Then se muestra como aviso que hay que reconocer explícitamente
    But no bloquea el cierre (solo INCORRECTO bloquea; VERIFICADO pasa)

  Scenario: Una tarea sin afirmaciones pasa el gate vacíamente
    Given una tarea cuya sesión no hizo afirmaciones factuales
    When se corre el gate al cerrar
    Then el gate se satisface sin nada que bloquear

  Scenario: El gate aplica en cualquier preset
    Given un repo en mode docs-only (o legacy, o con tdd/mutation OFF)
    When se cierra una tarea
    Then el gate de fact-checker sigue siendo obligatorio
    And no está anidado bajo ningún flag de features que lo desactive

  Scenario: El orden con el gate de mutation es explícito
    Given los gates de cierre mutation + fact-checker
    When se lee el bloque de cierre
    Then fact-checker corre tras mutation (para verificar la afirmación de que mutation pasó) y antes de commit/resumen

  Scenario: doctor detecta el gate ausente en un repo ya adoptado
    Given un repo que materializó su HOW-TO/task-lifecycle antes de 0.10.0 (sin el gate)
    When el usuario corre doctor tras actualizar el plugin
    Then reporta que la DoD de cierre no menciona el gate de fact-checker
    And ofrece re-materializar/añadir la línea con diff + aprobación
```

## Provides

- La DoD y el flujo mandan la pasada de `fact-checker` al cerrar — contrato que la 008 refleja en el
  CHANGELOG (Added) y que ejecutan las sesiones de tarea.

## Definition of Done

> Stack `none`: verificación por inspección de la doc del flujo.
- [ ] Cada escenario verificado por inspección (HOW-TO template + task-lifecycle + plan-task).
- [ ] Gate en la DoD de cierre (HOW-TO + task-lifecycle) + mención en `plan-task`; sin flag; sin hook nuevo.
- [ ] Frontera `fact-checker` ↔ `doctor` explícita.
- [ ] Spec cumplida; `Provides` disponible para 008.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-006.md`.
- [ ] Commit `task-pipeline-006: feat: gate fact-checker en la DoD de cierre`.
