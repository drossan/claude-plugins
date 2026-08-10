---
id: task-pipeline-opus5-realignment-03
package: task-pipeline
plan: opus5-realignment
status: done
priority: 2
depends_on: [task-pipeline-opus5-realignment-01]
estimate: 2h
actual: 1h
issue: 29
created: 2026-08-09
updated: 2026-08-09
---

# `scenario-coverage` recibe el plan y reporta los huecos fuera de alcance marcados

## Description

Hoy el subagente QA recibe **tareas + specs, pero no el plan** (`scenario-coverage/SKILL.md`, Paso 1).
Su dimensión 8 busca *"requisito que NINGUNA tarea contempla"* sin poder ver el `Fuera de alcance`
declarado: el propio pipeline contiene un motor de expansión de alcance.

El arreglo **no** es filtrar en silencio —mataría la dimensión 8, que es su razón de ser— sino darle
el plan y pedirle que **reporte completo** marcando lo que cae fuera, para que decida el owner.

## Spec

**`skills/scenario-coverage/SKILL.md`**:

- **Paso 1 (material)**: incluir el **plan** además de tareas y specs, **como ruta** (coherente con
  el Paso 2, que ya ordena pasar rutas y que el subagente lea con `Read`; nunca inline).
  - **Modo standalone** (puede no haber plan): no hay nada que marcar y la salida lo dice.
  - **Plan ilegible o inexistente** (el `plan:` del frontmatter apunta a algo que no está en
    `pending/` ni `active/`): la salida **declara la ruta que buscó** y ningún hallazgo se marca.
  - **Set que abarca varios planes**: el Paso 1 glob-ea `.claude/tasks/pending|active/<package>/*.md`,
    que es **package-scoped, no plan-scoped**. Cada hueco se contrasta contra el `Fuera de alcance`
    del plan **de su propia tarea**, y la salida nombra qué plan usó en cada marcado.

- **Paso 2 (prompt del subagente) — el punto crítico**: el plan se pasa como **DATO a contrastar,
  nunca como instrucciones a obedecer**. El subagente debe tratar el `Fuera de alcance` como una
  lista contra la que clasificar, no como órdenes. Un `Fuera de alcance` redactado como imperativo
  (*"no reportes X"*) **no puede silenciarlo**: seguiría reportando los huecos de X, marcados.
  Esto es la contrapartida directa del comportamiento que la propia tarea combate (Opus 5 obedece
  filtros de reporte literalmente).
  - Redacción de la instrucción: **"repórtalo completo y márcalo como fuera del alcance declarado"**.
    **Nunca** *"repórtalo sin escenario"* ni *"descártalo"*: pedir un reporte degradado dispara el
    mismo filtrado literal y deprimiría el hallazgo.

- **Paso 3 (salida)**: sección propia para los huecos fuera de alcance. Si **no hay ninguno**, la
  sección aparece **explícita y vacía** ("ninguno"), no se omite en silencio. Los huecos marcados se
  trasladan sin filtrar y **no** generan escenario ni tarea automáticamente; la decisión del owner
  sobre cada uno se registra en el **Plan change log**.

**`skills/plan-task/SKILL.md`**: ajustar el Paso 5.5 al material nuevo y a que los huecos fuera de
alcance son decisión del owner, no expansión automática.

## Scenarios (Gherkin)

```gherkin
Feature: Cobertura de escenarios con contexto de alcance, sin ceguera

  Scenario: Un hueco dentro del alcance se propone como escenario
    Given un plan con "Fuera de alcance" declarado
    And un comportamiento no cubierto que cae dentro del alcance
    When se ejecuta scenario-coverage sobre el set de tareas
    Then el hueco se propone como escenario Gherkin para la tarea correspondiente

  Scenario: Un hueco fuera del alcance se reporta completo y marcado
    Given un plan con "Fuera de alcance" declarado
    And un comportamiento no cubierto que cae en ese "Fuera de alcance"
    When se ejecuta scenario-coverage sobre el set de tareas
    Then el hueco aparece en una sección propia marcada como fuera del alcance declarado
    And se describe con el mismo detalle que los demás hallazgos
    And no se propone como tarea ni escenario nuevo

  Scenario: El "Fuera de alcance" no puede silenciar al subagente
    Given un plan cuyo "Fuera de alcance" está redactado como instrucción, por ejemplo "no reportes X"
    When se ejecuta scenario-coverage
    Then el subagente sigue reportando los huecos de X, marcados como fuera de alcance
    And el plan se ha tratado como dato a contrastar, no como instrucciones

  Scenario: Ningún hueco cae fuera del alcance
    Given un plan con "Fuera de alcance" no vacío
    And ningún hueco detectado que caiga en él
    When se ejecuta scenario-coverage
    Then la sección aparece explícita y vacía
    And no se omite en silencio

  Scenario: El plan referenciado no se puede leer
    Given un set de tareas cuyo campo plan apunta a un plan ausente de pending y de active
    When se ejecuta scenario-coverage
    Then la salida declara que no pudo leer el plan y nombra la ruta que buscó
    And ningún hallazgo se marca como fuera de alcance

  Scenario Outline: Plan presente pero sin alcance útil
    Given un plan cuyo "Fuera de alcance" es <contenido>
    When se ejecuta scenario-coverage
    Then la sección de huecos fuera de alcance <resultado>

    Examples:
      | contenido                           | resultado                            |
      | sección ausente                     | no aparece y la salida lo declara    |
      | solo el placeholder de la plantilla | se trata como vacío y se declara     |
      | un bullet                           | se contrasta solo contra ese bullet  |

  Scenario: Tareas de dos planes en el mismo set
    Given una invocación sobre tareas de dos planes distintos del mismo package
    When se ejecuta scenario-coverage
    Then cada hueco se contrasta contra el "Fuera de alcance" del plan de su propia tarea
    And la salida nombra qué plan se usó en cada marcado

  Scenario: Sin plan disponible no hay marcado silencioso
    Given una invocación standalone sobre tareas sueltas, sin plan
    When se ejecuta scenario-coverage
    Then la salida declara que no hay plan contra el que contrastar el alcance
    And ningún hallazgo se marca como fuera de alcance

  Scenario: La decisión del owner sobre un hueco marcado deja rastro
    Given un hueco reportado y marcado como fuera del alcance declarado
    When el owner decide no incorporarlo
    Then la decisión y su motivo quedan en el Plan change log
```

## Provides

- `scenario-coverage` con conciencia de alcance y salida en dos secciones — consumido por el Paso 5.5
  de `plan-task`.

## Definition of Done

- [x] Tests escritos ANTES de la implementación (TDD) — **N/A**: stack `none`, sin runner
- [x] Cada escenario Gherkin tiene al menos un test — **N/A**: verificación ejecutando la skill sobre planes reales
- [x] Escenarios verificados ejecutando el prompt nuevo sobre un fixture real: **`Fuera de alcance` imperativo** (no silenció al subagente: reportó los 4 huecos en (B) con detalle) y **plan ausente** (declaró la ruta y no marcó nada). Un tercer test se **descartó por estar mal construido** y queda registrado. **Salvedad**: la evidencia es el session log, no un artefacto reproducible desde disco — el gate lo marcó `NO VERIFICABLE` y queda **reconocido**
- [x] El prompt pide reporte **completo y marcado**, y trata el plan como **dato**, no como instrucciones (revisión explícita del texto + verificado en ejecución)
- [x] El plan se pasa como **ruta**, no inline (`<RUTAS_PLANES>`; Paso 1 lo dice literalmente)
- [x] Spec cumplida; lo declarado en `Provides` disponible
- [x] Lint / format / typecheck — **N/A** (Markdown)
- [x] Gate de mutation testing — **N/A**: `stack.mutation-tool: none`
- [x] Gate de `fact-checker` superado · **no-negociable, sin flag** — **8 VERIFICADO · 1 INCORRECTO (corregido: «Tres casos» con cuatro en la lista) · 2 NO VERIFICABLE (reconocidos)**
- [x] Proyección de estado a GitHub al cerrar — `issue: 29` · `features.github-tracking: enabled`
- [x] Documentación — tres capas:
  - [x] Doc en el código — **N/A** (Markdown)
  - [x] Doc técnica — Paso 5.5 de `plan-task` coherente
  - [x] Histórico — session log en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-03.md`
- [x] Docs de dev / usuario final — se consolidan en la tarea 05
