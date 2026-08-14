---
id: task-pipeline-sdd-validation-gate-02
package: task-pipeline
plan: sdd-validation-gate
status: pending
priority: 2
depends_on: [task-pipeline-sdd-validation-gate-01]
estimate: 3h
actual:
issue: 53
created: 2026-08-14
updated: 2026-08-14
---

# Bash helper opcional `sdd-lint.sh` (no bloqueante) + fixtures aseverados

## Description

Un **helper Bash opcional y NO bloqueante** que replica el **subconjunto mecánico** de la skill `sdd-lint`,
para que un repo consumidor **con runner/CI** lo cablee y tenga validación **desatendida** (donde el Bash
paga de verdad; el source `stack:none` no). **La skill (01) es la autoritativa**; el Bash es best-effort y
**no forma parte del gate de cierre** (design-review Opción 3). + **fixtures aseverados** para verificarlo.

## Spec

- **`sdd-lint.sh`** (nuevo, en `hooks/` o `scripts/` — decidir al materializar; NO es un hook de evento):
  cubre solo lo **determinista** (grep/`test`): vocabulario MADR cerrado, `[NECESITA ACLARACIÓN]` sin
  resolver, secciones obligatorias, ids `FR-00x`/`SC-00x`, enlaces CU/ADR rotos, huérfanos/duplicados.
  - **Exit codes**: `0` sin errores; `≠0` si algún ERROR (para CI). Avisos → stderr, no cambian el exit.
  - **Cero verde-falso**: no salir `0` sin haber validado (guard: si no encuentra artefactos SDD, lo dice).
  - **Cabecera de honestidad**: comentario "helper best-effort; la skill `/sdd-lint` es la autoritativa;
    puede ir por detrás de las reglas de la skill".
  - `bash -n` limpio; sin dependencias (solo `grep`/`test`/`find`/`sort`/`uniq`).
- **Fixtures** (dev-only en el plugin, no materializados a consumidores): `fixtures/known-good/` (specs/CU/ADR
  bien formados → exit 0) y `fixtures/known-bad/` (cada fichero inyecta **una** violación → reportada).
  - **Aseverados**: un doc/README de fixtures lista **qué violación** reporta cada known-bad y que known-good
    sale exit 0 (no "correr y mirar": la expectativa está escrita y se reproduce).
- **Doc "cómo cablearlo a tu CI"**: ejemplo de step (p.ej. en `package.json`/GH Actions) para un consumidor
  con runner. En el source (`stack:none`) el helper NO se cablea a nada; se verifica corriéndolo sobre fixtures.
- **Hardening (scenario-coverage)** — materializar en el Gherkin/fixtures:
  - **Vocabulario MADR case-insensitive** (igual que la skill 01): `Accepted` no es ERROR por mayúsculas.
  - **known-bad que faltan**: sección obligatoria ausente, CU huérfano, id duplicado, `superseded by NNNN`
    roto (además de los 4 ya listados) — un fixture por categoría del subconjunto mecánico.
  - **mix known-good + known-bad** en una misma pasada (repo realista, no ficheros aislados).
  - **Portabilidad `grep`**: comportamiento igual en BSD (macOS, dev) y GNU (Linux, CI target) — evitar
    flags no portables; verificar en ambos o documentar el requisito.
  - **Ruta inexistente** como argumento (distinto de "ruta sin artefactos") → error claro, exit ≠ 0.
  - **Sin argumento de ruta** → cwd por defecto (declararlo). **Idempotencia**: dos pasadas = mismo resultado.

## Fuera de alcance

- Que el Bash sea el **gate bloqueante** (lo es la skill 01).
- Checks **semánticos** (EARS/MADR/Gherkin de juicio) — solo la skill.
- `--strict`, `adr-index` stale (diferidos).

## Scenarios (Gherkin)

```gherkin
Feature: Helper Bash opcional de validación SDD

  Scenario: known-good sale limpio
    Given `fixtures/known-good/` con artefactos SDD bien formados
    When corro `sdd-lint.sh` sobre esa ruta
    Then sale con exit 0 y sin ERROR

  Scenario Outline: cada known-bad reporta su violación
    Given `fixtures/known-bad/<caso>` con una única violación inyectada
    When corro `sdd-lint.sh`
    Then reporta la violación <violación> y sale con exit ≠ 0

    Examples:
      | caso                    | violación                        |
      | estado-madr-invalido    | estado MADR no canónico          |
      | necesita-aclaracion     | [NECESITA ACLARACIÓN] sin resolver |
      | enlace-cu-roto          | enlace a CU inexistente          |
      | id-mal-formado          | id FR/SC mal formado             |

  Scenario: no bloqueante / best-effort declarado
    Given `sdd-lint.sh`
    Then su cabecera declara que es best-effort y que la skill `/sdd-lint` es la autoritativa
    And NO está cableado a ningún hook de evento del plugin

  Scenario: sin artefactos SDD no da verde-falso
    Given una ruta sin artefactos SDD
    When corro `sdd-lint.sh`
    Then lo dice explícitamente (no sale 0 "silencioso" como si hubiera validado)

  Scenario: sintaxis válida
    Given `sdd-lint.sh`
    When corro `bash -n sdd-lint.sh`
    Then no hay errores de sintaxis
```

## Provides

`sdd-lint.sh` (helper CI opcional) + fixtures aseverados + doc de cableado a CI. Nada del gate depende de él.

## Definition of Done

- [ ] Escenarios Gherkin verificados (correr `sdd-lint.sh` sobre fixtures + `bash -n`)
- [ ] Spec cumplida
- [ ] Gate de `fact-checker` superado · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [ ] Doc técnica: `sdd-lint.sh` + fixtures/README + doc de cableado a CI · technical-docs
- [ ] Histórico de la tarea — session log · context-log
- [ ] Barrido `grep` reforzado: sin identificadores muertos
