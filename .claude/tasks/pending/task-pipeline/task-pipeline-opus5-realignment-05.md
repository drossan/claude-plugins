---
id: task-pipeline-opus5-realignment-05
package: task-pipeline
plan: opus5-realignment
status: pending
priority: 3
depends_on: [task-pipeline-opus5-realignment-02, task-pipeline-opus5-realignment-03, task-pipeline-opus5-realignment-04]
estimate: 3h
actual:
issue: 31
created: 2026-08-09
updated: 2026-08-09
---

# Documentación, dogfooding del repo source y release 0.14.0

## Description

Cierra el ciclo: documenta el comportamiento nuevo, **aplica las reglas a este propio repo** y corta
la versión. Depende de las tres tareas de comportamiento (02, 03, 04); la 01 entra por transitividad.

## Spec

**Auto-aplicación (dogfooding) — criterio de cierre.** Este repo es source del plugin **y**
consumidor: su `CLAUDE.md` hace `@import` de `.claude/honesty-rules.md`, y ese fichero **ya difiere**
de la plantilla (30 líneas, sin el `</content>`). Al cerrar:
- `.claude/honesty-rules.md` de **este** repo tiene el ancla del release y los cuatro bloques.
- `/doctor` sobre este repo **no reporta drift** de `honesty-rules.md`.
- La decisión sobre el puntero a `coding-standards.md` (tarea 01) se aplica **también aquí**:
  o existe `.claude/specs/general/coding-standards.md`, o ninguna cabecera lo cita.

**Propagación de la carta ampliada.** El fichero se describe como "anti-alucinación" en varios
sitios; tras ampliar su carta, ninguno puede seguir describiéndolo solo así:
`skills/plan-task/templates/README.md`, `skills/task-init/SKILL.md:60-61`, el mensaje de
`hooks/bootstrap.sh:82`, el título de la categoría 6 de `skills/doctor/SKILL.md`, y el `README.md`
del plugin.

**`task-pipeline/README.md`**:
- Explicación ampliada de `honesty-rules.md`: qué cubre ahora, el **criterio de admisión** al fichero
  y los cuatro bloques.
- **Enlace a la justificación escrita** que produce la tarea 02. Debe resolver a un fichero
  versionado existente — este plan arregló un puntero colgante, no vamos a crear otro.
- **Nota de la palanca de `effort`**, junto a la limitación de plataforma ya documentada en "Routing
  de modelo por fase": el `effort` se fija **a nivel de sesión**, no por fase (la Agent tool no
  acepta ese parámetro), y en Opus 5 `low`/`medium` rinden inusualmente bien. Decir que **no existe
  ni existirá** una clave `effort:` en el YAML, para que nadie la busque.
- Criterios calibrados del salto en planes triviales.
- **Opt-out deliberado del consumidor**: declarar qué ocurre si alguien borra a propósito un bloque
  de su `honesty-rules.md`. Con la comparación de anclas, `/doctor` callaría y dejaría de ofrecerle
  mejoras de ese bloque sin que lo sepa. Documentar el comportamiento esperado y qué pierde.

**`website/guia/pipeline.md`**: alineado con lo anterior. El portal es un sub-proyecto VitePress con
toolchain pnpm propio; `pnpm docs:build` debe seguir pasando.

**`docs/guides/task-lifecycle.md`** y **`skills/plan-task/templates/task-lifecycle.md`**: coherentes
con la herencia de `Fuera de alcance` y los criterios calibrados. **Las dos**: la segunda es la
semilla que reciben los consumidores.

**`task-pipeline/CHANGELOG.md`**: entrada 0.14.0 (Keep a Changelog). El `</content>` va en **`Fixed`**,
describiendo el impacto sobre los repos que ya materializaron la plantilla.

**`task-pipeline/.claude-plugin/plugin.json`**: bump a **0.14.0**; `description` coherente con
`.claude-plugin/marketplace.json`.

**Coherencia del ancla**: el ancla de `templates/honesty-rules.md` no puede ser posterior a la
versión publicada; como este release **sí** cambia la plantilla, el ancla queda en `0.14.0`.

## Scenarios (Gherkin)

```gherkin
Feature: Release 0.14.0 documentado, dogfoodeado y coherente

  Scenario: El repo source queda alineado con lo que publica
    Given el plugin en 0.14.0
    When se cierra la tarea
    Then .claude/honesty-rules.md de este repo tiene el ancla 0.14.0 y los cuatro bloques
    And /doctor sobre este repo no reporta drift de honesty-rules.md

  Scenario: La decisión sobre el puntero se aplica también aquí
    Given la decisión tomada en la tarea 01 sobre coding-standards.md
    When se verifica el cierre en este repo
    Then o existe .claude/specs/general/coding-standards.md, o ninguna cabecera lo cita

  Scenario: El ancla de la plantilla no diverge de la versión publicada
    Given el release 0.14.0 preparado
    When se comparan el ancla de templates/honesty-rules.md y la version de plugin.json
    Then el ancla no es posterior a la versión publicada
    And como este release cambió la plantilla, el ancla es 0.14.0

  Scenario: La descripción del fichero es coherente en todo el plugin
    Given honesty-rules.md con la carta ampliada a honestidad y disciplina de trabajo
    When se buscan las descripciones del fichero en el repo
    Then templates/README.md, task-init/SKILL.md, el mensaje de bootstrap.sh, la categoría 6 de doctor y el README no lo describen ya solo como anti-alucinación

  Scenario: El enlace a la justificación resuelve
    Given la justificación producida por la tarea 02
    When se sigue el enlace desde el README del plugin
    Then apunta a un fichero versionado existente en el repo

  Scenario: El opt-out deliberado está documentado
    Given un consumidor que borra a propósito un bloque de su honesty-rules.md
    When consulta la documentación
    Then encuentra declarado qué hará /doctor a partir de entonces
    And qué mejoras de ese bloque dejará de recibir

  Scenario: Nadie busca un flag de effort que no existe
    Given un usuario que quiere bajar el effort de una fase concreta
    When consulta el README
    Then encuentra que effort se fija a nivel de sesión y no por fase
    And encuentra el motivo, que la Agent tool no acepta ese parámetro

  Scenario: El fix de la plantilla se comunica
    Given que la versión anterior propagaba un "</content>" a los repos consumidores
    When se lee la entrada del CHANGELOG
    Then el fix aparece bajo Fixed
    And describe el impacto sobre los repos que ya materializaron la plantilla

  Scenario: Las descripciones no divergen
    Given plugin.json y marketplace.json
    When se comparan sus descripciones
    Then son coherentes entre sí

  Scenario: El portal no contradice al README
    Given website/guia/pipeline.md y el README del plugin tras el release
    When se comparan los criterios de salto y la descripción de honesty-rules.md
    Then dicen lo mismo

  Scenario: Toolchain del portal no disponible
    Given una sesión sin pnpm instalado
    When se verifica website/
    Then el ítem de la DoD queda marcado como no verificado y bloquea el cierre
    And no se declara que el build pasa sin haberlo ejecutado

  Scenario: El portal sigue construyendo
    Given pnpm disponible y los cambios aplicados en website/
    When se ejecuta pnpm docs:build
    Then la construcción termina sin errores

  Scenario: El paso de release es idempotente
    Given plugin.json ya en 0.14.0 y el CHANGELOG con su entrada
    When se vuelve a ejecutar el paso de release
    Then no se duplica la entrada del CHANGELOG ni se re-bumpa la versión

  Scenario: El manifest sigue siendo válido
    Given el repo con el release preparado
    When se ejecuta claude plugin validate .
    Then la validación pasa
```

## Provides

- Versión 0.14.0 publicable: es lo que da a `/doctor` una plantilla nueva contra la que comparar el
  ancla en los repos consumidores.
- Este repo alineado con lo que publica.

## Definition of Done

- [ ] Tests escritos ANTES de la implementación (TDD) — **N/A**: stack `none`, sin runner
- [ ] Cada escenario Gherkin tiene al menos un test — **N/A**: verificación por inspección y comandos
- [ ] `.claude/honesty-rules.md` de **este** repo actualizado; `/doctor` aquí no reporta drift
- [ ] `claude plugin validate .` pasa
- [ ] `pnpm docs:build` **ejecutado** y en verde — si pnpm no está disponible, el ítem queda **no verificado y bloquea el cierre**; no se afirma que pasa
- [ ] Ancla de la plantilla = `0.14.0` y no posterior a `plugin.json`
- [ ] Barrido `grep` reforzado: sin identificadores muertos vivos, respetando la allowlist de `CLAUDE.md`
- [ ] Spec cumplida; lo declarado en `Provides` disponible
- [ ] Lint / format / typecheck — **N/A** para el pipeline; el build del portal cubre `website/`
- [ ] Gate de mutation testing — **N/A**: `stack.mutation-tool: none`
- [ ] Gate de `fact-checker` superado · **no-negociable, sin flag**
- [ ] Proyección de estado a GitHub al cerrar — sin `issue:` se marca **N/A con su motivo** · solo si `features.github-tracking`
- [ ] Documentación — tres capas:
  - [ ] Doc en el código — **N/A** (Markdown)
  - [ ] Doc técnica — README, website y **las dos** copias del lifecycle alineadas
  - [ ] Histórico — session log en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-05.md`
- [ ] Docs de dev / usuario final — es el objeto de esta tarea
