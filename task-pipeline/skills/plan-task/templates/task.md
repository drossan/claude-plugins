---
id: <plan-id>-<nn>        # <plan-id> = <package>-<name-plan>; <nn> correlativo del plan desde 01 (2 díg.)
package: <package>
plan: <name-plan>         # = <name-plan> embebido en id (deben coincidir)
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 2h
actual:
issue:                    # opcional; solo con features.github-tracking — nº de la SUB-ISSUE proyectada (lo escribe /plan-task)
use_cases: []             # opcional; solo con features.use-cases — ids UC-<AREA>-<slug> (en .claude/specs/<package>/use-cases/) cuyo comportamiento crea/modifica esta tarea; [] si es andamiaje
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <Título de la tarea>

## Description

<Qué hay que hacer y por qué. El contexto justo para arrancar la sesión sin
releer todo el plan. Apunta a la spec aplicable de `.claude/specs/` que marca
el contrato y los anti-patrones.>

## Spec

<El contrato concreto: qué se crea/toca, ficheros, firmas, reglas, límites.
Lista de bullets verificables, no prosa. Enlaza la(s) spec(s) del artefacto.>

## Scenarios (Gherkin)

<!-- Cada escenario es la fuente 1:1 de un test TDD — el `Then` es el assert.
     Cubre el camino feliz Y los bordes/errores (el mutation testing del cierre
     los exige: un survivor suele ser un escenario sin assert real).

     REGLAS (en orden de impacto en la calidad del test — respétalas):
     1. Declarativo, NO imperativo. Describe QUÉ comportamiento, no CÓMO se invoca.
        El `When` es una acción de dominio (`When reservo la hamaca "A-12"`), no una
        secuencia de pasos internos, de UI o de clicks. Imperativo = test acoplado a
        la implementación que se rompe en cada refactor sin que cambie el comportamiento.
     2. Un escenario = un comportamiento. Si aparece When…Then…When…Then, son dos
        escenarios. Cada uno debe poder fallar por UNA sola razón (un test, un motivo).
     3. Disciplina Given/When/Then. Given = estado previo (en pasado); When = UNA
        acción ejercitada; Then = resultado observable. No metas acciones en el Given
        ni asserts en el When: enturbia qué se está probando. Para condiciones o
        resultados adicionales usa `And`/`But`, no encadenes varias cosas en un paso.
     4. Para variaciones del MISMO comportamiento (fronteras, clases de equivalencia,
        off-by-one) usa `Scenario Outline` + `Examples`; no copies escenarios casi
        iguales. (Conecta con la dimensión "fronteras" de scenario-coverage.)
     5. (Solo con `features.use-cases`) Estos escenarios son EFÍMEROS: mueren con la
        tarea al archivarse. El que define comportamiento observable del PRODUCTO se
        consolida al cierre como AC (`ACn · …`) del UC declarado en `use_cases:`
        (ver templates/use-case.md); el de andamiaje de la tarea (bootstrap,
        migración, refactor interno) muere con ella y no se promueve.

     Si la tarea no produce código testeable (p.ej. bootstrap de tipos, doc-only),
     sustituye los escenarios por una nota que lo justifique y di cómo se verifica
     (p.ej. "verificación = compila / valida"). -->

```gherkin
Feature: <capacidad que aporta esta tarea>

  Scenario: <caso concreto del camino feliz>
    Given <precondición / estado>
    When <acción de dominio — qué se hace, no cómo se invoca>
    Then <resultado observable y verificable>

  Scenario: <caso de error / borde>
    Given ...
    When ...
    Then <error esperado, código, efecto>

  # Variaciones del MISMO comportamiento (fronteras / clases de equivalencia).
  # OJO: aquí <entrada> y <esperado> NO son "huecos a rellenar" como los <...> de
  # arriba — son la sintaxis real de Gherkin que referencia columnas de Examples.
  # Mantenlas; rellena solo el resto del texto del paso.
  Scenario Outline: <comportamiento> según <entrada>
    Given <precondición>
    When se ejercita con <entrada>
    Then el resultado es <esperado>

    Examples:
      | entrada | esperado |
      | vacío   | ...      |
      | 1       | ...      |
      | máx     | ...      |
```

## Provides

<!-- El contrato HACIA ABAJO: qué deja disponible esta tarea para las que dependen
     de ella (sus `depends_on` apuntan aquí). La superficie NUEVA que otros consumen:
     módulos/APIs/ficheros/capacidades. NO es un resumen de los `Then` del Gherkin
     (el comportamiento ya vive ahí) — si esto sería eso, no escribas la sección.
     Si nada aguas abajo depende de esta tarea, pon "—". -->

<Qué pueden dar por hecho las tareas que dependen de esta: superficie/API/ficheros
nuevos disponibles. El estado que habilita, no el comportamiento.>

## Definition of Done

<!-- Las líneas marcadas (flag) solo aplican si su flag en .claude/task-pipeline.yml
     no está desactivado (por preset `mode` o clave explícita). Default (o sin
     archivo) = todas obligatorias. Si desactivas un flag en el repo, borra su línea
     de esta DoD al materializar la tarea. -->
- [ ] Tests escritos ANTES de la implementación (TDD) — Red → Green → Refactor  · (flag `features.tdd`)
- [ ] Cada escenario Gherkin tiene al menos un test (camino feliz + bordes/errores)  · (flag `features.tdd`)
- [ ] Todos los tests en verde
- [ ] Spec cumplida; lo declarado en `Provides` queda realmente disponible para las tareas dependientes
- [ ] Lint / format / typecheck OK
- [ ] Gate de mutation testing superado (Stryker, umbral `break`) — sin survivors por debajo del umbral  · (flag `features.mutation-gate`)
- [ ] Gate de `fact-checker` superado — afirmaciones de la sesión verificadas (INCORRECTO bloquea; NO VERIFICABLE = aviso a reconocer), tras mutation y antes de commit/resumen  · no-negociable (sin flag)
- [ ] Proyección de estado a GitHub aplicada al cerrar (issue → `done`/close) — best-effort, no bloquea el `.md`  · solo si `features.github-tracking`
- [ ] UCs de `use_cases:` consolidados — escenarios de producto promovidos/actualizados como ACs (`ACn · …`), `trace:` del UC al día, `draft`→`active` si todos sus ACs tienen test tagueado `[UC-<AREA>-<slug>]`  · solo si `features.use-cases`
- [ ] Documentación actualizada — tres capas (cada una según `features.closing-documentation.*`):
  - [ ] **TSDoc en el código** — todo símbolo público (funciones, clases, tipos, puertos, errores) documentado con TSDoc, al crearlo (no al final)  · (flag `tsdoc`)
  - [ ] **Doc técnica (contexto)** — README / `CLAUDE.md` del package / `.claude/specs/` / ADRs donde aplique  · (flag `technical-docs`)
  - [ ] **Histórico de la tarea** — session log en `.claude/context/<package>/<task-id>.md` (qué se hizo + por qué)  · (flag `context-log`)
- [ ] Docs de dev / usuario final + `pnpm changeset` donde aplique
