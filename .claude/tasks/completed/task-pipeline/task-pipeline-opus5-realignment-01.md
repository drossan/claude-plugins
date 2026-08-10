---
id: task-pipeline-opus5-realignment-01
package: task-pipeline
plan: opus5-realignment
status: done
priority: 1
depends_on: []
estimate: 3h
actual: 1.5h
issue: 33
created: 2026-08-09
updated: 2026-08-09
---

# Disciplina de alcance, delegación y longitud + saneado de plantilla + entrega por `/doctor`

## Description

Instala el fix con evidencia: los tres bloques de prompt que Anthropic publica para los
comportamientos de Opus 5 que motivaron el plan (desvío de alcance, delegación excesiva,
entregables largos). Va con dos cosas sin las cuales no sirve: **sanear** el fichero que tocamos
(arrastra basura que se propaga a cada repo) y **entregarlo** a los repos ya adoptados (hoy
imposible: `bootstrap.sh:65` solo restaura si el fichero falta y `doctor` cat. 6 solo mira ausencia).

Ver el plan para el contexto y `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md` para el flujo.

## Spec

**Saneado previo** (misma edición, antes de añadir nada):
- Borrar el `</content>` colgado de `templates/honesty-rules.md:31` y `templates/coding-standards.md:17`.
- Resolver el puntero colgante a `.claude/specs/general/coding-standards.md` (no existe aquí): o se
  crea, o la cabecera deja de citarlo. Decisión registrada en el session log.
- **`coding-standards.md` es user-owned**: `bootstrap.sh` no lo restaura y `doctor` declara que no
  lo vigila. El fix de la plantilla **no llega** a quien ya lo materializó → `/doctor` lo **informa**
  y explica cómo corregirlo a mano; **no lo auto-edita**.

**Carta del fichero**: ampliar la cabecera de "anti-alucinación / anti-slop" a honestidad **y
disciplina de trabajo**, y **dejar escrito el criterio de admisión** (qué entra y qué sigue siendo
coding-standard). El **nombre no cambia**: está cableado en el `@import`, en `bootstrap.sh:23,65` y
en `doctor` cat. 6.

**Tres bloques nuevos** en `templates/honesty-rules.md`, adaptados desde `shared/model-migration.md`:
1. **Disciplina de alcance** — entregar lo pedido al alcance pedido; decisiones rutinarias solas;
   avisar en una frase si el encargo parece equivocado y continuar; terminar la tarea entera; parar
   antes de acciones claramente fuera del encargo.
2. **Cap determinista de spawn de subagentes** — techo explícito; no delegar lo resoluble en pocas
   llamadas; no delegar revisión ni verificación.
   **Exención obligatoria y explícita**: las fases que el propio pipeline manda lanzar
   (`design-review`, `scenario-coverage`, `fact-checker`) **no cuentan contra el techo**. Sin esta
   línea enviaríamos a cada repo una regla que contradice a `/plan-task`.
3. **Longitud de entregables escritos** — calibrar la extensión de lo que se escribe a disco, **sin
   que pueda eliminar secciones que las plantillas del plugin declaran obligatorias**.

**`templates/task.md`**: sección `## Fuera de alcance`, heredada del plan. Si el plan no la tiene o
está vacía → `—` explícito, **nunca el placeholder crudo**. Si la tarea se crea sin plan → `—` con
nota. Nota de la herencia en `templates/plan.md`, en `docs/guides/task-lifecycle.md` **y en
`templates/task-lifecycle.md`** (esta última es la semilla que llega a los consumidores).

**Ancla de versión — mecanismo corregido.** El ancla registra **la última versión en que cambió la
plantilla**, no la versión del plugin. `/doctor` compara **el ancla del fichero materializado contra
el ancla de la plantilla** (`../plan-task/templates/honesty-rules.md`), ambos a su alcance.
**No se usa `plugin.json`**: verificado que ningún `SKILL.md` lo lee y `doctor` no lo alcanza. Así
un release que no toque la plantilla no genera drift.

**Alcance del drift-check**: solo `honesty-rules.md`. **Las tareas ya materializadas NO se
drift-checkean** — son histórico, hay decenas de copias sin ancla y reescribirlas sería ruido. La
sección `## Fuera de alcance` aplica a las tareas **nuevas**, vía plantilla.

**`skills/doctor/SKILL.md`**:
- Drift de `honesty-rules.md` por comparación de anclas. Ancla **ausente** = anterior a la primera
  versión con ancla → se reporta (no se salta por no poder parsear).
- Si no puede leer el ancla de la plantilla → dice *"no he podido determinar la versión de la
  plantilla"*, **no** emite veredicto de drift.
- **Ancla vieja + prosa adaptada por el consumidor**: no ofrecer sobrescritura mecánica; reportar
  qué bloques faltan y dejar la edición al owner (coherente con la regla 4 de `doctor`).
- Elevar el aviso del `@import` faltante a **hallazgo destacado**. **Sigue sin editar `CLAUDE.md`**,
  ni crearlo si no existe.

## Scenarios (Gherkin)

```gherkin
Feature: Disciplina de alcance, delegación y longitud entregada a repos nuevos y adoptados

  Scenario: Un repo nuevo recibe la plantilla saneada
    Given un repo sin la convención del plugin
    When se bootstrapea el repo con /task-init
    Then el .claude/honesty-rules.md materializado no contiene la cadena "</content>"
    And contiene los bloques de alcance, cap de subagentes y longitud de entregables
    And su cabecera declara el criterio de admisión al fichero

  Scenario: El cap de subagentes no bloquea las fases del pipeline
    Given un repo con honesty-rules.md importado y el cap de spawn en vigor
    When una sesión de /plan-task ejecuta design-review, scenario-coverage y fact-checker
    Then las tres pasadas se lanzan sin ser bloqueadas por el cap
    And el texto del cap declara esa exención

  Scenario: La calibración de longitud no canibaliza secciones obligatorias
    Given la regla de longitud de entregables en vigor
    When se escribe un plan, una tarea con Gherkin o un session log
    Then el artefacto conserva todas las secciones que exige su plantilla

  Scenario Outline: Herencia de "Fuera de alcance" en la tarea
    Given un plan cuyo "Fuera de alcance" es <contenido>
    When se materializa una tarea desde la plantilla
    Then la sección de la tarea contiene <resultado>

    Examples:
      | contenido                       | resultado                                 |
      | vacío o solo el placeholder     | "—" explícito, nunca el placeholder crudo |
      | un bullet                       | ese bullet                                |
      | n bullets, unos irrelevantes    | los que acotan esta tarea, sin inventar   |

  Scenario: Un repo ya adoptado detecta que su fichero está desactualizado
    Given un repo adoptado cuyo honesty-rules.md tiene un ancla anterior a la de la plantilla
    When se ejecuta /doctor
    Then reporta el drift nombrando ambas anclas
    And muestra el diff antes de pedir aprobación
    And no escribe nada hasta que el owner aprueba

  Scenario: Un release que no toca la plantilla no genera drift
    Given un repo adoptado cuyo honesty-rules.md tiene el ancla de la plantilla actual
    And un plugin en una versión posterior cuya plantilla no cambió
    When se ejecuta /doctor
    Then no reporta drift de honesty-rules.md

  Scenario: Un fichero materializado antes de que existiera el ancla
    Given un repo adoptado cuyo honesty-rules.md no contiene ninguna línea de ancla
    When se ejecuta /doctor
    Then lo trata como anterior a la primera versión con ancla y reporta el drift
    And no se salta la comprobación por no poder parsear una versión

  Scenario: No se puede determinar el ancla de la plantilla
    Given una ejecución de /doctor que no puede leer la plantilla del plugin
    When evalúa el drift de honesty-rules.md
    Then declara que no ha podido determinar la versión de la plantilla
    And no emite veredicto de drift

  Scenario: Fichero personalizado y además desactualizado
    Given un repo adoptado con ancla anterior y texto adaptado por el consumidor
    When /doctor propone el fix
    Then no ofrece sobrescribir el fichero entero de forma mecánica
    And reporta qué bloques faltan, dejando la edición al owner

  Scenario: Segunda pasada de doctor tras aprobar el fix
    Given un repo donde el owner aprobó el fix del drift
    When se vuelve a ejecutar /doctor sin más cambios
    Then no vuelve a reportar drift de ese fichero

  Scenario: Las tareas ya materializadas no generan ruido
    Given un repo con decenas de tareas materializadas sin la sección "Fuera de alcance"
    When se ejecuta /doctor
    Then no reporta un problema por cada tarea antigua
    And la regla aplicable a tareas ya materializadas está declarada

  Scenario: Falta el @import y el aviso es destacado
    Given un repo adoptado cuyo CLAUDE.md no importa .claude/honesty-rules.md
    When se ejecuta /doctor
    Then el aviso aparece como hallazgo destacado
    And explica que sin el @import ninguna regla de comportamiento se aplica
    And el CLAUDE.md queda sin modificar

  Scenario: Repo adoptado sin CLAUDE.md
    Given un repo adoptado que no tiene ningún CLAUDE.md
    When se ejecuta /doctor
    Then emite el mismo hallazgo destacado
    And no crea el CLAUDE.md

  Scenario: Basura ya propagada en un fichero user-owned
    Given un repo adoptado cuyo .claude/specs/general/coding-standards.md contiene "</content>"
    When se ejecuta /doctor
    Then informa del fichero y de cómo corregirlo a mano
    And no lo auto-edita

  Scenario: El hook restaura la versión saneada
    Given un repo adoptado al que se le ha borrado .claude/honesty-rules.md
    When arranca una sesión nueva
    Then el hook lo restaura con los tres bloques y sin la cadena "</content>"

  Scenario: Un repo ajeno sigue intacto
    Given un directorio que no ha adoptado la convención del plugin
    When arranca una sesión nueva
    Then el hook no crea ningún fichero
    And no emite ningún aviso
```

## Provides

- `templates/honesty-rules.md` saneado, con carta ampliada, criterio de admisión, **ancla de
  plantilla** y los tres bloques — base sobre la que la tarea 02 añade su sección.
- `templates/task.md` con `## Fuera de alcance` y su regla de herencia.
- El mecanismo de **detección por comparación de anclas plantilla↔materializado** en `/doctor`, que
  la tarea 02 reutiliza sin inventar su propio grep.

## Definition of Done

- [x] Tests escritos ANTES de la implementación (TDD) — **N/A**: stack `none`, sin runner (`CLAUDE.md`)
- [x] Cada escenario Gherkin tiene al menos un test — **N/A**: verificación por inspección / `grep` / ejecutando skill y hook
- [x] Todos los escenarios verificados: **2 ejecutados** (hook en repo adoptado y en repo ajeno, + `bash -n`)
      y **14 por inspección**; el ancla además simulada en sus 4 casos. Límite declarado en el session log:
      la instalación cacheada del plugin es 0.13.0, así que `/doctor` y `/task-init` no se pueden ejercitar
      con el código editado hasta el release de la tarea 05
- [x] `grep -c "</content>"` sobre las dos plantillas → `0`
- [x] Puntero a `coding-standards.md` resuelto, con la decisión en el session log — **no** estaba colgado
      para un consumidor (`/task-init` lo materializa); se matiza que es user-owned y se materializa aquí
- [x] El bloque del cap declara explícitamente la exención de las fases del pipeline (`:56-59`), y queda
      registrado que esa exención **relaja** la regla publicada por Anthropic
- [x] Spec cumplida; lo declarado en `Provides` disponible
- [x] Lint / format / typecheck — **N/A** (Markdown)
- [x] Gate de mutation testing — **N/A**: `stack.mutation-tool: none`
- [x] Gate de `fact-checker` superado · **no-negociable, sin flag** — 12 VERIFICADO / 0 INCORRECTO /
      0 NO VERIFICABLE, incluido el cotejo frase a frase contra la fuente inglesa
- [x] Proyección de estado a GitHub al cerrar — `issue: 33` · `features.github-tracking: enabled`
- [x] Documentación — tres capas:
  - [x] Doc en el código — **N/A** (Markdown; la plantilla es el artefacto)
  - [x] Doc técnica — herencia de `Fuera de alcance` en `templates/plan.md`, `templates/task-lifecycle.md`,
        `docs/guides/task-lifecycle.md` y el Paso 5 de `plan-task/SKILL.md`; + `templates/README.md` y
        `task-init/SKILL.md` actualizados a la carta ampliada
  - [x] Histórico — session log en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-01.md`
- [x] Docs de dev / usuario final — se consolidan en la tarea 05
