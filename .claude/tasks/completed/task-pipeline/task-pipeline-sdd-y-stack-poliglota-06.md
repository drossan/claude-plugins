---
id: task-pipeline-sdd-y-stack-poliglota-06
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 2
depends_on: [task-pipeline-sdd-y-stack-poliglota-04, task-pipeline-sdd-y-stack-poliglota-05]
estimate: 3h
actual: ~1h10m
issue: 43                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#43
created: 2026-08-13
updated: 2026-08-14
---

# Flujo SDD imperativo + DoD + interacción Gherkin↔CU

## Description

Cablea el **flujo SDD imperativo** en el ciclo de vida (gated por `features.sdd`) y **cierra la
contradicción** que el design-review señaló (F3): hoy el `## Scenarios` de la tarea es la **fuente 1:1** de
los tests, pero SDD dice "el Gherkin vive en el CU". Resolución: con `features.sdd` **ON**, el **CU es la
única fuente** del Gherkin y la tarea **enlaza** (no copia); `scenario-coverage` **retro-alimenta el CU**.
Con `features.sdd` **OFF** (default), **nada cambia** (Gherkin en la tarea, como hoy).

## Spec

- **Línea de DoD** (en `templates/task.md` + las dos `task-lifecycle`), gated `· solo si features.sdd`:
  "spec (EARS) + CU (Gherkin) creados/actualizados en la misma tarea, o declarado **'sin cambios'**".
- **Ciclo de vida "Cerrar una tarea"** (2×lifecycle): paso SDD condicional al flag (actualizar spec/CU o
  declarar "sin cambios"; enlazar en la nav — regla SDD propia del plan).
- **`plan-task/SKILL.md`** (orquestación): nota — con `features.sdd` on, el `## Scenarios` de una tarea
  **enlaza** los escenarios del CU (fuente única); con off, se comporta como hoy.
- **`scenario-coverage/SKILL.md` — ENTRADA y SALIDA** (cierra el doble hueco T3): con `features.sdd` on,
  (entrada) reúne el material a revisar **siguiendo el enlace al CU** — el `## Scenarios` de la tarea solo
  tiene un enlace, no el Gherkin; (salida) los escenarios endurecidos se **incorporan al CU** (fuente
  única), no como copia divergente en la tarea.
- **`mutation/SKILL.md` Paso 4** (lectura de survivors): con `features.sdd` on, "un survivor suele ser un
  escenario Gherkin sin assert" se resuelve **siguiendo el enlace al CU**, no leyendo el `## Scenarios` de
  la tarea (que solo enlaza). Nota mínima en esa skill.
- **`templates/task.md` (`## Scenarios`)**: nota condicional — con `features.sdd` on, esta sección
  **enlaza** al CU en vez de copiar el bloque Gherkin.
- **Bootstrap del primer spec/CU de un package** (cierra el hueco de "cómo"): la instrucción del flujo dice
  explícitamente que, si el package aún no tiene `spec.md`/CU, la sesión **lee `templates/spec.md` y
  `templates/caso-de-uso.md` con Read y los materializa** en las rutas canónicas **antes** de enlazarlos
  (mismo estilo imperativo que `/task-init`: "lee X con Read y escríbela en Y").
- **Enlace roto**: si el `## Scenarios` enlaza a un CU que no existe/se borró, se **reporta el enlace roto**
  (no se asume "sin escenarios" en silencio).
- **Convivencia / toggle a mitad (T2)**: tareas ya materializadas **antes** de activar `features.sdd`
  (Gherkin inline) **conviven** con las nuevas (Gherkin en CU); **no se migran a la fuerza**. La regla
  aplica a tareas **nuevas** desde que el flag está on.
- **Dónde se declara "sin cambios"**: en el **checkbox de la DoD** de la tarea + una línea en el **session
  log** (no en el CU).
- **Regla anti-duplicación enunciada**: ADR = *por qué* · Spec/EARS = *qué* · CU/Gherkin = *cómo +
  aceptación*; el Gherkin vive **solo** en el CU.
- **Doc de la feature** (flujo): append a la sección `## SDD nativo (opcional)` del README (parte de flujo)
  + sección de flujo en `website/features/sdd.md` + entrada de CHANGELOG del flujo.

## Fuera de alcance

- Las **plantillas** (tarea 04) y la **definición del flag** (tarea 05).
- **Autogenerar** specs/CU de ningún package.
- Cambiar el comportamiento con `features.sdd` **off** (debe quedar byte-idéntico a hoy).

## Scenarios (Gherkin)

```gherkin
Feature: Flujo SDD imperativo con fuente única de Gherkin

  Scenario: la DoD SDD es condicional al flag
    Given `features.sdd` on
    When se materializa una tarea
    Then su DoD incluye la línea "spec + CU actualizados o 'sin cambios'"
    And con `features.sdd` off esa línea NO aparece

  Scenario: con SDD on el Gherkin vive en el CU
    Given `features.sdd` on
    When se escribe el `## Scenarios` de una tarea
    Then la sección ENLAZA los escenarios del CU (sin bloque Gherkin copiado)

  Scenario: scenario-coverage retro-alimenta el CU
    Given `features.sdd` on
    When `scenario-coverage` añade un escenario
    Then se incorpora al CU (fuente única), no como copia divergente en la tarea

  Scenario: con SDD off nada cambia
    Given `features.sdd` off (default)
    When se materializa una tarea
    Then el Gherkin vive en el `## Scenarios` de la tarea, sin paso SDD ni línea de DoD (como hoy)

  Scenario: declaración de "sin cambios"
    Given `features.sdd` on y una tarea que no toca spec/CU
    When se cierra
    Then declara explícitamente "sin cambios de spec/CU" en el checkbox de la DoD y en el session log

  Scenario: scenario-coverage sigue el enlace al CU cuando SDD está on
    Given `features.sdd` on y una tarea cuyo `## Scenarios` enlaza a un CU
    When `scenario-coverage` reúne el material a revisar
    Then lee el Gherkin del CU enlazado (no el `## Scenarios` de la tarea, que solo tiene el enlace)

  Scenario: /mutation sigue el enlace al CU al leer survivors (SDD on)
    Given `features.sdd` on y un survivor cuyo escenario Gherkin vive en el CU enlazado
    When `/mutation` interpreta el survivor
    Then remite al CU enlazado, no al `## Scenarios` de la tarea

  Scenario: materialización del primer spec/CU de un package
    Given un package sin `.claude/specs/<pkg>/spec.md` todavía y `features.sdd` on
    When una tarea de ese package necesita declarar su spec/CU
    Then la sesión lee `templates/spec.md` y `templates/caso-de-uso.md` con Read y los materializa en las
         rutas canónicas antes de enlazarlos

  Scenario: enlace a un CU roto
    Given `features.sdd` on y el `## Scenarios` de una tarea enlaza a un CU que ya no existe
    When se intenta verificar el comportamiento de la tarea
    Then se reporta el enlace roto en vez de asumir "sin escenarios" en silencio

  Scenario: convivencia de tareas inline y tareas con CU (toggle a mitad)
    Given un repo con tareas antiguas de Gherkin inline y `features.sdd` recién activado
    When se crean tareas nuevas
    Then las nuevas siguen el flujo SDD (Gherkin en CU) y las antiguas NO se migran a la fuerza
```

## Provides

El **contrato del flujo SDD** (línea de DoD gated + dirección Gherkin↔CU: CU única fuente, la tarea enlaza)
que siguen las tareas de un repo consumidor con `features.sdd` on. Nada aguas abajo dentro de este plan
depende de él salvo la verificación de coherencia (tarea 08).

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`; correr `/plan-task` mental sobre un caso con flag on/off)
- [x] Spec cumplida; contradicción Gherkin↔CU cerrada de forma coherente en las 4 skills/plantillas afectadas
- [x] Gate de `fact-checker` superado — en especial "con SDD off el comportamiento es idéntico a hoy" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: 2×lifecycle (DoD + Cerrar una tarea) + `plan-task/SKILL.md` + `scenario-coverage/SKILL.md` (entrada+salida) + `mutation/SKILL.md` (Paso 4) + `task.md` + sección de flujo en README/portal + CHANGELOG · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-06.md` · context-log
- [x] Barrido `grep` reforzado: DoD espejo consistente; sin identificadores muertos
