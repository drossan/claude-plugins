---
id: task-pipeline-collision-free-ids-06
package: task-pipeline
plan: collision-free-ids
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 5
depends_on: [task-pipeline-collision-free-ids-01, task-pipeline-collision-free-ids-02, task-pipeline-collision-free-ids-03, task-pipeline-collision-free-ids-04, task-pipeline-collision-free-ids-05, task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-09, task-pipeline-collision-free-ids-10, task-pipeline-collision-free-ids-11, task-pipeline-collision-free-ids-12]
estimate: 1h
actual: 25min
created: 2026-07-23
updated: 2026-07-23
---

# Release: version bump + CHANGELOG + coherencia descriptions

## Description

Cerrar el plan publicando: bump de versión, entrada de CHANGELOG que narra D1 + D2, coherencia de
descripciones y validación del manifest. Depende de **todas** las tareas anteriores (D1 + D2). No introduce
comportamiento nuevo.

## Spec

- **Versión**: `task-pipeline/.claude-plugin/plugin.json` `0.11.0` → **`0.12.0`** (minor: features nuevas —
  ids plan-scoped, detección de duplicados en doctor, github-tracking opt-in). Confirmar el número exacto
  al cierre según SemVer.
- **CHANGELOG** (`task-pipeline/CHANGELOG.md`, Keep a Changelog): entrada `[0.12.0]`:
  - **Changed**: esquema de id de tarea → plan-scoped `<plan-id>-<nn>` (ids legacy `001..012` estables).
  - **Added**: detección de ids duplicados en `/doctor`; **github-tracking** opcional (opt-in, default off)
    — proyección one-way md→GitHub (plan→issue padre, task→sub-issue), reconciliación best-effort en doctor.
  - **Nota de diseño**: la `design-review` recomendó no incluir el tracking GitHub; el owner lo mantuvo
    aceptando los riesgos (best-effort/reversibilidad) — coherente con el Plan change log.
- **Coherencia de descripciones**: `plugin.json.description` ↔ `.claude-plugin/marketplace.json` (raíz),
  coherentes entre sí; si la enumeración de skills/capacidades lo requiere, mencionar el tracking opcional.
- **Verificación**: `claude plugin validate .` OK; barrido `grep` reforzado (sin esquema viejo vivo;
  allowlist: CHANGELOG histórico + ids legacy + atribución de terceros).

## Scenarios (Gherkin)

```gherkin
Feature: Publicación coherente del plan

  Scenario: Versión y changelog publicados
    Given el plugin tras esta tarea
    When inspecciono plugin.json y CHANGELOG.md
    Then la versión es 0.12.0
    And existe una entrada [0.12.0] que narra el esquema plan-scoped, la detección de duplicados y github-tracking
    And la entrada nota que la design-review recomendó no incluir el tracking y el owner lo mantuvo

  Scenario: Descripciones coherentes
    Given plugin.json y marketplace.json tras esta tarea
    When comparo sus description
    Then son coherentes entre sí

  Scenario: El manifest valida
    Given el plugin tras esta tarea
    When ejecuto `claude plugin validate .`
    Then el resultado es correcto (sin errores)

  Scenario: Sin esquema viejo ni identificadores muertos
    Given el árbol del plugin tras esta tarea
    When ejecuto el barrido grep reforzado
    Then no hay <package>-<nnn> vivo como esquema ni grill-me/`/task`/skills/task/ vivos (allowlist intacta)
```

## Provides

- —

## Definition of Done

- [x] Tests TDD — **N/A** (stack `none`).
- [x] Cada escenario Gherkin verificado (inspección de versión/CHANGELOG/descripciones; `claude plugin validate .` → ✔ passed; `grep`).
- [x] Spec cumplida.
- [x] Gate de mutation — **N/A**.
- [x] Gate de `fact-checker` superado (5/5 VERIFICADO, incl. re-run de "el manifest valida"). **No-negociable.**
- [x] Doc: **TSDoc N/A**; **doc técnica** (CHANGELOG + versión + descripciones); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-06.md`.
- [x] Barrido `grep` reforzado sin identificadores muertos ni esquema viejo vivo.
- [x] Nota retro en el plan (estimación vs real, sorpresas).
