---
id: task-pipeline-011
package: task-pipeline
plan: usage-analytics-and-caveman
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: [task-pipeline-010]
estimate: 4h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Hook `UserPromptSubmit` — caveman-lite con backoff determinista

## Description

Hook Bash que, cuando `features.caveman` está en `lite|full`, inyecta una directiva
mínima de compresión de output vía `hookSpecificOutput.additionalContext`. El **backoff
en checkpoints es determinista** (no juicio del modelo): el hook lee la **fase activa**
del tail del transcript y **no inyecta** si es un checkpoint. Respeta los invariantes:
no-op silencioso en repos no adoptados y con el flag off, **corta en Bash barato** antes
de cualquier trabajo, y **nunca rompe el turno**. Consume el flag de la tarea 010.

## Spec

- Crear `task-pipeline/hooks/caveman.sh` (Bash **3.2**-compatible, `set -eu`, estilo de
  `bootstrap.sh`: **Bash puro, sin jq ni python** — es el núcleo del re-scope: cero
  spawn de intérprete pesado por turno).
- Registrar en `task-pipeline/hooks/hooks.json` un `UserPromptSubmit` que lo invoque
  (`"${CLAUDE_PLUGIN_ROOT}"/hooks/caveman.sh`).
- **Gate barato, en este ORDEN (short-circuit)**:
  1. **Adopción primero**: si el repo no tiene marcadores de adopción → `exit 0` sin
     leer `task-pipeline.yml` ni el transcript.
  2. **Flag**: leer `features.caveman` **ignorando líneas comentadas**; solo `lite`/`full`
     exactos activan; cualquier otro valor/ausente/comentado → `exit 0` sin inyectar.
- **Backoff determinista**: leer un **tail acotado** (`tail -n N`, no el fichero entero)
  del `transcript_path` recibido por stdin; obtener el `attributionSkill` **más reciente**
  saltando entradas sin la clave. Si corresponde a un checkpoint → **no inyecta**. El
  match debe contemplar el **prefijo `task-pipeline:`** (el valor real es
  `task-pipeline:grilling`, no `grilling`). Checkpoints: `grilling`, `design-review`,
  `scenario-coverage`, `fact-checker`. **No** se matchea `grill-me` (identificador muerto;
  la fase viva emite `grilling`) — decisión documentada, sin introducir el literal muerto.
  Si el tail **no tiene ninguna fase** (caso dominante, ~91%) → **inyecta** (ausencia de
  fase ≠ checkpoint; fail-open, no fail-closed).
- Si procede inyectar: emitir el JSON `hookSpecificOutput.additionalContext` con la
  directiva **mínima y acotada** según intensidad (`lite` vs `full`): comprime
  prosa/relleno; **mantiene código, comandos, errores y paths byte-a-byte**; y **no**
  trata como "relleno" las salvedades de incertidumbre/avisos "no verificado" (coherencia
  con `honesty-rules.md`). Afecta al hilo principal, no a subagentes (documentado).
- **Robustez**: `transcript_path` ausente/ilegible, herramienta faltante o cualquier
  fallo interno → `exit 0` sin inyectar (nunca aborta el turno). Extraer el
  `transcript_path` del stdin de forma acotada (no cualquier coincidencia dentro de `prompt`).

## Scenarios (Gherkin)

```gherkin
Feature: Inyectar el modo caveman solo cuando corresponde

  Scenario: Repo no adoptado — corte antes de cualquier trabajo
    Given un repo sin marcadores de adopción
    When se envía un prompt de usuario
    Then el hook sale exit 0 sin leer task-pipeline.yml ni el transcript

  Scenario: Flag desactivado
    Given un repo adoptado con features.caveman off (o ausente)
    When se envía un prompt de usuario
    Then el hook no inyecta ninguna directiva

  Scenario: Flag comentado no se lee como activo
    Given un repo adoptado cuyo yml trae "# features.caveman: lite" comentado
    When se envía un prompt de usuario
    Then el hook NO inyecta (ignora líneas de comentario al leer el flag)

  Scenario: Caveman activo con tail sin fase (caso dominante)
    Given un repo adoptado con features.caveman lite y un tail sin attributionSkill
    When se envía un prompt de usuario
    Then el hook inyecta la directiva (ausencia de fase != checkpoint; fail-open)

  Scenario Outline: Backoff determinista en checkpoints (con prefijo real)
    Given un repo adoptado con features.caveman lite
    And la fase activa más reciente del tail es "<fase>"
    When se envía un prompt de usuario
    Then el hook la reconoce como checkpoint y no inyecta

    Examples:
      | fase                          |
      | task-pipeline:grilling        |
      | task-pipeline:design-review   |
      | task-pipeline:scenario-coverage |
      | task-pipeline:fact-checker    |

  Scenario: Se toma la fase más reciente saltando entradas sin la clave
    Given un tail cuya última entrada no tiene attributionSkill pero la anterior es task-pipeline:design-review
    When se envía un prompt de usuario
    Then el hook toma design-review como fase activa y no inyecta
    And la ventana leída está acotada (tail -n N), sin leer transcripts de varios MB enteros

  Scenario: Clave de fase legacy grill-me en el tail
    Given un tail con attributionSkill task-pipeline:grill-me
    When se envía un prompt de usuario
    Then el hook no introduce el literal muerto "grill-me" y documenta por qué no lo contempla (la fase viva es grilling)

  Scenario Outline: Intensidad correcta y valores no canónicos
    Given un repo adoptado con features.caveman <valor>, fuera de checkpoint
    When se envía un prompt de usuario
    Then el hook <accion>

    Examples:
      | valor   | accion                                  |
      | lite    | inyecta la directiva lite (no la full)  |
      | full    | inyecta la directiva full (no la lite)  |
      | LITE    | no inyecta (valor no canónico → off)    |
      | "lite " | no inyecta (valor no canónico → off)    |

  Scenario: La directiva preserva literales técnicos y salvedades
    Given un repo adoptado con features.caveman lite, fuera de checkpoint
    When se envía un prompt de usuario
    Then additionalContext instruye comprimir prosa/relleno
    And instruye mantener código, comandos, errores y paths byte-a-byte
    And no trata como relleno las salvedades de incertidumbre ("no verificado")

  Scenario: El hook no lanza intérprete pesado por turno
    Given un repo adoptado con features.caveman lite
    When se envía un prompt de usuario
    Then el hook opera con Bash/grep/sed/tail (sin invocar python3 ni jq)

  Scenario: Fallo al leer el transcript no rompe el turno
    Given un transcript_path ausente o ilegible
    When se envía un prompt de usuario
    Then el hook termina exit 0 sin inyectar, sin abortar el turno

  Scenario: El UserPromptSubmit está registrado
    Given hooks.json tras esta tarea
    When lo inspecciono
    Then hay una entrada UserPromptSubmit que invoca "${CLAUDE_PLUGIN_ROOT}"/hooks/caveman.sh
    And `bash -n hooks/caveman.sh` no reporta errores de sintaxis
```

## Provides

- El hook `caveman.sh` + su registro `UserPromptSubmit` en `hooks.json`. La tarea 012 lo
  contempla en `/doctor` (como artefacto **plugin-owned**).

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`: hook Bash).
- [ ] Cada escenario Gherkin verificado como criterio de aceptación: `bash -n` +
      ejecución (stdin JSON simulado) en repo **adoptado/sano/no adoptado**, con
      `caveman: off|lite|full|comentado|no-canónico` y distintas fases en el tail (incl.
      checkpoint con prefijo → no inyecta; tail sin fase → inyecta; transcript ilegible →
      exit 0).
- [ ] Spec cumplida; gate corta en Bash barato **antes** de leer yml/transcript; sin
      spawn de python/jq.
- [ ] Gate de mutation — **N/A** (`stack.mutation-tool: none`).
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (README: hook + limitación "hilo principal, no
      subagentes" + nota de que el ROI no es medible por el pipeline) actualizada;
      **histórico** en `.claude/context/task-pipeline/task-pipeline-011.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos (checkpoints usan `grilling`,
      nunca `grill-me` como literal vivo).
