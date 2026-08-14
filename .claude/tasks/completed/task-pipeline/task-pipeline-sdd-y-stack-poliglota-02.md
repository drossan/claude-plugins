---
id: task-pipeline-sdd-y-stack-poliglota-02
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 1
depends_on: [task-pipeline-sdd-y-stack-poliglota-01]
estimate: 3h
actual: ~1h
issue: 39                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#39
created: 2026-08-13
updated: 2026-08-14
---

# `/mutation` agnóstico por herramienta y por-package

## Description

Desacopla `/mutation` de Stryker (hoy 19 acoplamientos en `skills/mutation/SKILL.md`): resuelve el stack
del package vía `stack.packages` (tarea 01) y **selecciona la herramienta** por `stack.mutation-tool`. El
camino **Stryker sigue verificado**; se añade **`mutmut`** (Python, el caso real de #35) + un **escape
genérico `mutation-command: "<cmd>"`** para cualquier otro lenguaje. `cosmic-ray`/`cargo-mutants`/`gremlins`
quedan como **ejemplos en docs**, no comportamiento shipeado (F2 del design-review: no shipear recetas no
verificadas que nadie pidió). **Solo Stryker se afirma verificado.**

## Spec

- **Paso 0 de `mutation/SKILL.md`**: lee `stack.packages.<pkg>.mutation-tool` (fallback al top-level).
  Dispatch:
  - `none` (o top-level `none`) → **no-op**: informa "sin gate" y sale.
  - `stryker` → camino **verificado** actual (gotchas pnpm incluidos).
  - `mutmut` → invocación de **referencia** Python + **banner "⚠️ no verificada en este repo"** + aviso
    runtime de confirmar contra la doc de la herramienta.
  - cualquier otro con `stack.packages.<pkg>.mutation-command: "<cmd>"` → corre `<cmd>` (referencia, mismo
    banner); sin `mutation-command` → no-op + aviso.
- **Tabla-adapter** (en la skill): tool → lenguaje → **una** invocación de referencia. Banner explícito;
  solo Stryker sin banner (verificado).
- **`cosmic-ray`/`cargo-mutants`/`gremlins`**: mencionados **solo** como ejemplos en una nota "otros
  lenguajes" (docs), no como ramas seleccionables shipeadas.
- **Nota explícita (F7a)**: `features.mutation-gate` (umbral/enable) **no** es per-package (solo `stack.*`
  lo es) → "Python sin gate" se hace con `mutation-tool: none` en ese package.
- **Confianza y fallo de `mutation-command`**: es config **repo-owned** (el owner la escribe); se ejecuta
  tal cual — el banner "no verificada" ya avisa. Si el comando **sale ≠ 0**, el gate **falla** (igual que un
  Stryker por debajo del umbral); no se silencia por ser "referencia".
- **Coherencia `language`↔`mutation-tool`**: si la combinación es incoherente (p.ej. `mutmut` con
  `language: rust`), `/mutation` **avisa** (no la corrige ni la asume válida).
- **DoD tool-agnóstica**: en `templates/task.md` + `templates/task-lifecycle.md` + `docs/guides/task-lifecycle.md`,
  el checkbox pasa de "Stryker, break 80" a "gate de mutation superado **con la herramienta del package**".

## Fuera de alcance

- **Correr** cualquier herramienta de mutation aquí (`stack: none`, sin runner): se materializa como texto
  y se verifica por inspección.
- Shipear `cosmic-ray`/`cargo-mutants`/`gremlins` como comportamiento (solo ejemplos en docs).
- Umbral `mutation-gate` **per-package** (solo la selección de herramienta es per-package).

## Scenarios (Gherkin)

```gherkin
Feature: Selección de herramienta de mutation por-package

  Scenario: Stryker para un package JS/TS (verificado)
    Given `stack.packages.web.mutation-tool: stryker`
    When corro `/mutation web`
    Then usa el camino Stryker+pnpm verificado, sin banner de "no verificada"

  Scenario: mutmut para Python (referencia, con banner)
    Given `stack.packages.api.mutation-tool: mutmut`
    When corro `/mutation api`
    Then usa la invocación de referencia de mutmut
    And emite el banner "⚠️ no verificada en este repo" + aviso de confirmar contra la doc

  Scenario: escape genérico para otro lenguaje
    Given `mutation-tool: cargo-mutants` y `mutation-command: "cargo mutants"`
    When corro `/mutation`
    Then ejecuta `cargo mutants` (referencia) con el banner
    And `cargo-mutants` NO aparece como rama shipeada de la skill (solo el escape)

  Scenario: none = no-op
    Given `mutation-tool: none`
    When corro `/mutation`
    Then reporta "sin gate" y sale sin correr nada

  Scenario: solo Stryker se afirma verificado
    Given `skills/mutation/SKILL.md`
    When busco afirmaciones de "verificad*"
    Then solo Stryker se afirma verificado; mutmut y `mutation-command` llevan el banner

  Scenario: el gate no es per-package
    Given la doc de `/mutation`
    Then declara que `features.mutation-gate` no es per-package
    And que "Python sin gate" se consigue con `mutation-tool: none`

  Scenario: herramienta no reconocida sin mutation-command → no-op con aviso
    Given `stack.packages.rust-svc.mutation-tool: cargo-mutants` sin `mutation-command`
    When corro `/mutation rust-svc`
    Then reporta "sin gate: falta mutation-command" y sale sin correr nada

  Scenario: el comando de mutation-command falla
    Given `mutation-command: "<cmd>"` que sale con código ≠ 0
    When corro `/mutation`
    Then el gate FALLA (no se silencia por ser referencia no verificada)

  Scenario: package no deducible del diff
    Given un diff que toca ficheros de dos packages distintos y no se pasa `$ARGUMENTS`
    When corro `/mutation`
    Then pide explícitamente qué package mutar (no asume ninguno)
```

## Provides

`/mutation` que lee `stack.packages.<pkg>.mutation-tool` y despacha (stryker verificado · mutmut · escape
`mutation-command` · none); el contrato "verificado vs referencia" que la tarea 08 describe en CHANGELOG/docs.

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [x] Spec cumplida; `Provides` disponible aguas abajo
- [x] Gate de `fact-checker` superado — en especial "solo Stryker verificado; el resto lleva banner" (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `mutation/SKILL.md` + DoD tool-agnóstica en `task.md` + 2×lifecycle + nota mutation-gate; entrada de CHANGELOG de esta feature · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-02.md` · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos; DoD espejo consistente (task.md ↔ 2×lifecycle)
