---
id: task-pipeline-009
package: task-pipeline
plan: usage-analytics-and-caveman
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 4h
actual: ~1 sesión (misma sesión de planificación)
created: 2026-07-16
updated: 2026-07-16
---

# Skill `pipeline-usage` — analítica de uso on-demand

## Description

Crear la skill **`pipeline-usage`**: un playbook model-driven que, **al invocarse**,
parsea el transcript de la sesión (y opcionalmente las pasadas del proyecto) y
presenta el consumo de tokens/tiempo/modelo. NO añade hooks: invocar la skill es el
opt-in. Titular honesto = total de sesión; por-fase y por-subagente son extras
best-effort sobre un formato que Anthropic marca como interno/no soportado, así que la
skill **avisa ruidosamente** cuando no puede garantizar las cifras. Ver el plan
`usage-analytics-and-caveman` (contexto, hechos verificados, principios de diseño).

## Spec

- Crear `task-pipeline/skills/pipeline-usage/SKILL.md` con frontmatter `name:
  pipeline-usage` + `description:` (cuándo usarla; read-only y best-effort). Debe quedar
  **descubrible** por el plugin/marketplace e invocable como `/task-pipeline:pipeline-usage`.
- El cuerpo (instrucciones, no código) debe indicar a Claude:
  - **Localizar la sesión actual**: derivar el slug del `cwd` (formato
    `~/.claude/projects/<slug>/`), y tomar el `*.jsonl` de nivel superior más reciente;
    subagentes en `<session>/subagents/agent-*.jsonl`. Distinguir "no hay directorio de
    proyecto" de "hay directorio pero sin datos legibles".
  - Agregar con **python3** (no jq): sumar los **4 componentes** de `message.usage`
    (`input_tokens`, `output_tokens`, `cache_creation_input_tokens`,
    `cache_read_input_tokens`). **Cache**: contar el **escalar**
    `cache_creation_input_tokens` **una sola vez**; el objeto anidado `cache_creation`
    es informativo y NO se suma (evita doble conteo). Duración por `timestamp`.
  - **Agrupar por-fase por `attributionSkill` tal cual aparece** — los valores reales
    llevan **prefijo `task-pipeline:`** (`task-pipeline:grilling`, `task-pipeline:design-review`,
    …) y pueden aparecer claves ajenas (`init`) o legacy (`task-pipeline:grill-me`):
    mostrarlas **verbatim, sin reescribir ni recortar el prefijo y sin mapa de rename**.
    El cuerpo de la skill **NO** debe contener el literal `grill-me`.
  - Presentar: (1) **total de sesión** (titular = `input+output`, cache aparte,
    duración); (2) **por-fase best-effort** con el **% del gasto con fase atribuida**;
    (3) **por-subagente** desde `subagents/*.jsonl` (tokens + `model`).
  - **Degradación ruidosa**: avisar explícitamente "cifras best-effort, formato interno
    no soportado, posiblemente incompletas" cuando: falte `python3`; el esquema de
    `usage` no se reconozca; o el % atribuido a fase sea bajo. **Nunca** presentar un
    derivado como hecho. Ignorar líneas JSONL corruptas/incompletas e **informar cuántas
    se descartaron**.
  - **Privacidad**: informe y snapshot contienen **solo métricas** (tokens/tiempo/
    modelo/fase), **nunca** texto de mensajes. El snapshot opcional va en
    `.claude/analytics/sessions/<session_id>.json`; elegir la clave de id de forma
    **determinista y documentada** (preferir `session_id`) ante duplicados
    `session_id`/`sessionId`; re-invocar **sobrescribe** (last-write-wins).
- Añadir `.claude/analytics/` al `.gitignore` de **este** repo (edición manual local).
- **Docs (owner de la entrada de la skill)**: documentar `pipeline-usage` en
  `task-pipeline/README.md` (tabla de skills + sección: on-demand, read-only,
  best-effort, cómo invocarla) **y advertir a repos consumidores** que gitignoreen
  `.claude/analytics/` ellos mismos (el plugin no toca su `.gitignore`). La tarea 012
  solo **verifica coherencia**, no re-documenta (evita duplicación).

## Scenarios (Gherkin)

```gherkin
Feature: Reportar el consumo de la sesión bajo demanda

  Scenario: Sesión con transcript legible
    Given una sesión cuyo transcript tiene mensajes con usage y attributionSkill
    When solicito el informe de uso del pipeline
    Then veo el total de sesión (input+output como titular, cache aparte)
    And veo la duración derivada de los timestamps
    And veo el desglose por fase con el porcentaje de gasto atribuido a fase
    And veo el coste por subagente con su modelo

  Scenario: Las claves de fase llevan prefijo de plugin y se muestran tal cual
    Given un transcript con attributionSkill "task-pipeline:grilling" e "init"
    When solicito el informe de uso
    Then el desglose lista "task-pipeline:grilling" e "init" con su valor literal
    And no se reescribe ni se recorta el prefijo "task-pipeline:"
    And el cuerpo de la skill no contiene el literal "grill-me"

  Scenario: Coexisten cache_creation (objeto) y cache_creation_input_tokens (escalar)
    Given entradas con cache_creation como objeto y cache_creation_input_tokens como escalar
    When solicito el informe de uso
    Then el cache se contabiliza una sola vez desde el escalar (sin doble conteo)

  Scenario: El esquema de usage no se reconoce
    Given un transcript cuyo formato de usage no coincide con el esperado
    When solicito el informe de uso
    Then se me avisa de que las cifras son best-effort y posiblemente incompletas
    And no se presenta ningún número derivado como si fuera exacto

  Scenario: La fracción de gasto con fase atribuida es minoritaria
    Given un transcript donde solo ~9% de los mensajes con usage tiene attributionSkill
    When solicito el informe de uso
    Then el total de sesión se presenta como titular robusto
    And el desglose por fase se marca best-effort e incompleto con su % explícito

  Scenario: Hay usage pero ninguna entrada tiene attributionSkill
    Given un transcript con usage en todos los mensajes y ningún attributionSkill
    When solicito el informe de uso
    Then el total de sesión se muestra íntegro
    And el desglose por fase indica "sin atribución de fase disponible" sin fabricar fases

  Scenario: El transcript tiene una línea JSONL corrupta o incompleta
    Given un transcript cuya última línea es JSON incompleto
    When solicito el informe de uso
    Then las líneas válidas se agregan y la corrupta se ignora
    And se me indica cuántas líneas se descartaron (sin abortar ni inventar el total)

  Scenario: No hay python3 en el entorno
    Given un entorno sin python3
    When solicito el informe de uso
    Then se me indica que python3 es necesario para agregar
    And la operación termina sin error de ejecución ni cifras inventadas

  Scenario: Sesión sin subagentes
    Given una sesión cuyo directorio subagents/ no existe o está vacío
    When solicito el informe de uso
    Then veo total y por-fase, y la sección por-subagente indica "sin subagentes"

  Scenario: No hay datos de uso vs no hay proyecto
    Given un cwd cuyo slug no resuelve a ningún directorio de proyecto
    When solicito el informe de uso
    Then se distingue "no hay proyecto/transcript" de "hay directorio pero sin datos legibles"
    And no se fabrican cifras en ninguno de los dos casos

  Scenario: Privacidad — informe y snapshot no filtran contenido
    Given un transcript con texto de mensajes de usuario y asistente
    When solicito el informe y se escribe el snapshot opcional
    Then ambos contienen solo métricas (tokens, tiempo, modelo, fase)
    And no contienen ningún fragmento de texto de los mensajes

  Scenario: Idempotencia y id determinista del snapshot
    Given un transcript con session_id y sessionId distintos y un snapshot previo
    When vuelvo a solicitar el informe de uso
    Then el id se elige de forma determinista y documentada (preferir session_id)
    And el snapshot <session_id>.json se sobrescribe sin duplicar ni corromper

  Scenario: La skill queda registrada y es invocable
    Given el plugin tras esta tarea
    When inspecciono skills/pipeline-usage/SKILL.md
    Then tiene frontmatter name: pipeline-usage + description
    And es invocable como /task-pipeline:pipeline-usage
```

## Provides

- La skill `pipeline-usage` (invocable como `/task-pipeline:pipeline-usage`).
- El formato del snapshot `.claude/analytics/sessions/<session_id>.json` (solo métricas).
- La **entrada de README** de `pipeline-usage` (la tarea 012 solo verifica coherencia).

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`: skill Markdown).
- [ ] Cada escenario Gherkin verificado como **criterio de aceptación** (corriendo la
      skill sobre transcripts reales/artesanales + inspección).
- [ ] Spec cumplida; `Provides` disponible para la tarea de cierre.
- [ ] Gate de mutation — **N/A** (`stack.mutation-tool: none`).
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (README: entrada + sección + aviso de gitignore
      al consumidor) actualizada; **histórico** en `.claude/context/task-pipeline/task-pipeline-009.md`.
- [ ] Barrido `grep` reforzado: sin `grill-me`/`/task`/`skills/task/` vivos (la skill NO
      hardcodea `grill-me`). Allowlist legítima intacta.
