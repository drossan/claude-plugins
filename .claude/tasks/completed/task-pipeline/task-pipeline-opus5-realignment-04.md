---
id: task-pipeline-opus5-realignment-04
package: task-pipeline
plan: opus5-realignment
status: done
priority: 2
depends_on: []
estimate: 1h
actual: 1h
issue: 30
created: 2026-08-09
updated: 2026-08-09
---

# Tensar los criterios del "Salto en planes triviales"

## Description

La palanca de coste **ya construida** que el plan ignoraba. Los criterios definen cuándo se puede
**ofrecer** saltar `design-review` y `scenario-coverage` —las dos pasadas caras con subagente—.
Tensarlos reduce el gasto **hoy**, con un párrafo, sin esperar al estudio de la tarea 06.

Mejor ratio valor/coste del plan y sin dependencias: **candidata a ir primera**.

## Spec

**Tras esta tarea, los criterios viven en CINCO sitios.** Corregido en ejecución: la Spec original decía
CUATRO y el **número era correcto, pero no la membresía** — `website/guia/pipeline.md` estaba listado y
**no** enumeraba criterios (solo "criterios estrictos"), mientras que
`task-pipeline/docs/flujo-del-pipeline.md` **sí** los enumeraba y **faltaba de la tabla**. Se añade la
enumeración a `website/` para que las cuatro copias sean comparables literalmente por `grep`; de ahí que
el total pase de cuatro a cinco. Los cinco deben quedar coherentes, y el segundo es el que llega a los
consumidores:

| Fichero | Rol |
|---|---|
| `task-pipeline/skills/plan-task/SKILL.md:45-52` | fuente que ejecuta el orquestador |
| `task-pipeline/skills/plan-task/templates/task-lifecycle.md:229-231` | **semilla que reciben los repos consumidores** |
| `docs/guides/task-lifecycle.md:221-224` | copia materializada de **este** repo |
| `website/guia/pipeline.md:22` | portal de documentación (**no** enumeraba: solo "criterios estrictos") |
| `task-pipeline/docs/flujo-del-pipeline.md:80-83` | **añadido**: docs del plugin; enumeraba los criterios viejos |

`task-pipeline/README.md:16,109` solo **referencian** la regla ("criterios estrictos + confirmación +
log") sin enumerarla → no divergen y quedan fuera. Las menciones del `CHANGELOG.md` son histórico
narrativo (allowlist de `CLAUDE.md`).

**Calibración**: revisar los criterios actuales (un solo fichero/área; sin superficie nueva en
`Provides`; sin decisión arquitectónica ni transversal; y para `scenario-coverage`, 1 tarea sin
caminos de error reales) y ajustarlos para que el salto sea aplicable a más planes genuinamente
pequeños **sin volverse un agujero**. La calibración debe quedar **fijada por ejemplos**, no por
adjetivos: un caso frontera resuelto para cada criterio.

Documentar el porqué citando el comportamiento de Opus 5: delega y verifica más por defecto, y las
pasadas separadas heredadas de modelos previos rinden menos de lo que costaban.

**Invariantes que NO se tocan** — son la garantía del mecanismo:
- El **default sigue siendo ejecutar**. El salto es la excepción.
- Lo **decide el owner**, nunca el orquestador en silencio; se confirma con `AskUserQuestion` con la
  opción por defecto = ejecutar.
- Todo salto se **registra en el Plan change log** con su motivo.
- **`grilling` y la aprobación del plan siguen siendo no negociables**: esta tarea no los roza.
- **Las dos decisiones son independientes**: aceptar el salto de `design-review` no implica
  consentimiento para `scenario-coverage`; se pregunta otra vez.
- **Sin canal para preguntar** (no se puede lanzar `AskUserQuestion`) → se ejecuta la pasada y no se
  registra ningún salto.
- **La trivialidad caduca**: si una re-planificación in-place hace que el plan deje de cumplir los
  criterios, la pasada se ejecuta y el change log registra que el salto anterior quedó invalidado.

## Scenarios (Gherkin)

```gherkin
Feature: Salto proporcional en planes triviales

  Scenario Outline: Frontera de trivialidad, criterio a criterio
    Given un plan que <caso>
    When se evalúa si se puede ofrecer el salto
    Then el resultado es <resultado>

    Examples:
      | caso                                                          | resultado                        |
      | un fichero, sin Provides, sin decisión arquitectónica, 1 tarea | se puede ofrecer                |
      | un fichero pero declara Provides                               | no se ofrece                    |
      | dos tareas con caminos de error reales                         | no se ofrece para scenario-coverage |
      | dos ficheros de la misma área, sin superficie nueva            | según la calibración, fijado por ejemplo |

  Scenario: El owner acepta el salto ofrecido
    Given un plan que cumple todos los criterios calibrados
    When el pipeline llega a la fase de design-review
    Then se ofrece el salto con la opción por defecto de ejecutar la pasada
    And al aceptarlo, el Plan change log recoge el salto y su motivo

  Scenario: El owner rechaza el salto ofrecido
    Given un plan trivial al que se ofrece saltar design-review
    When el owner elige ejecutar la pasada
    Then la pasada se ejecuta
    And no se escribe ninguna entrada de salto en el Plan change log

  Scenario: Un plan no trivial no admite ni la oferta
    Given un plan que incumple al menos un criterio de trivialidad
    When el pipeline llega a la fase de design-review
    Then la pasada se ejecuta
    And no se ofrece ningún salto

  Scenario: El orquestador no puede saltar por su cuenta
    Given un plan trivial
    When el orquestador considera saltar la pasada
    Then no puede omitirla sin confirmación explícita del owner

  Scenario: Aceptar un salto no arrastra el otro
    Given un plan trivial cuyo owner aceptó saltar design-review en el Paso 4.5
    When el pipeline llega al Paso 5.5
    Then se vuelve a preguntar por scenario-coverage
    And el salto anterior no se toma como consentimiento

  Scenario: Sesión sin canal de pregunta
    Given un plan trivial en una sesión donde no se puede preguntar al owner
    When el pipeline llega a la fase
    Then la pasada se ejecuta
    And no se registra ningún salto

  Scenario: Un plan trivial deja de serlo
    Given un plan al que se le saltó design-review por trivial
    When se re-planifica in-place y deja de cumplir los criterios
    Then design-review se ejecuta antes de continuar
    And el Plan change log registra que el salto anterior quedó invalidado

  Scenario: Los criterios no divergen entre copias
    Given los criterios en skills/plan-task/SKILL.md
    When se comparan con templates/task-lifecycle.md, docs/guides/task-lifecycle.md, task-pipeline/docs/flujo-del-pipeline.md y website/guia/pipeline.md
    Then ninguna copia describe criterios distintos
    And las cuatro copias llevan la misma frase canónica literal

  Scenario: Un sitio que enumera criterios no puede quedarse fuera del barrido
    Given un fichero del repo que enumera los criterios de trivialidad
    When se calibran los criterios en la fuente
    Then ese fichero se actualiza aunque no estuviera listado en la Spec
    And la Spec se corrige registrando el sitio omitido

  Scenario Outline: Los checkpoints humanos permanecen intactos
    Given un plan de cualquier tamaño
    When se evalúa si <fase> admite salto
    Then el resultado es <admite>

    Examples:
      | fase                | admite                                   |
      | grilling            | no, nunca                                |
      | aprobación del plan | no, nunca                                |
      | design-review       | solo si es trivial y lo aprueba el owner |
      | scenario-coverage   | solo si es trivial y lo aprueba el owner |
```

## Provides

- Criterios de salto calibrados y **coherentes en los cinco sitios** (la fuente + sus **cuatro copias**;
  a lo largo de esta tarea "sitio" = los 5, "copia" = las 4 no-fuente) — reduce el coste de las dos
  fases caras sin cambiar su implementación, y llega a los consumidores vía la semilla del template.
- **Frase canónica literal** para las copias (declarada en `plan-task/SKILL.md`): las tareas 03 y 05
  pueden greparla en vez de re-derivar los criterios.

## Definition of Done

- [x] Tests escritos ANTES de la implementación (TDD) — **N/A**: stack `none`, sin runner
- [x] Cada escenario Gherkin tiene al menos un test — **N/A**: verificación por inspección y ejecutando `/plan-task`
- [x] Escenarios verificados: los 13 escenarios trazados uno a uno contra el texto calibrado (ver histórico)
- [x] Los **cinco sitios** de los criterios dicen lo mismo: la fuente enumera la tabla y sus **cuatro
      copias** llevan la frase canónica literal (`grep` comparativo normalizado — 4/4 + `1 tarea sin
      caminos de error` en 5/5; confirmado por `fact-checker`)
- [x] Los siete invariantes siguen en el texto (`grep` 1/1 cada uno; los no-negociables intactos en :43 y :178)
- [x] La calibración está fijada por ejemplos, no por adjetivos (tabla de 4 criterios × columna
      "se puede ofrecer" / "NO se ofrece")
- [x] Spec cumplida (con la corrección de membresía registrada); lo declarado en `Provides` disponible
- [x] Lint / format / typecheck — **N/A** (Markdown). `pnpm docs:build` de `website/` en verde.
- [x] Gate de mutation testing — **N/A**: `stack.mutation-tool: none`
- [x] Gate de `fact-checker` superado · **no-negociable, sin flag** — 10 VERIFICADO tras corregir
      1 INCORRECTO (que bloqueó el cierre hasta arreglarlo); 0 NO VERIFICABLE
- [x] Proyección de estado a GitHub al cerrar — `issue: 30` · `features.github-tracking: enabled`
- [x] Documentación — tres capas:
  - [x] Doc en el código — **N/A** (Markdown)
  - [x] Doc técnica — los cinco sitios alineados (fuente + cuatro copias)
  - [x] Histórico — session log en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-04.md`
- [x] Docs de dev / usuario final — se consolidan en la tarea 05
