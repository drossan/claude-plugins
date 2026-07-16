---
id: task-pipeline-012
package: task-pipeline
plan: usage-analytics-and-caveman
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-009, task-pipeline-011]
estimate: 2h
actual: ~25 min
created: 2026-07-16
updated: 2026-07-16
---

# Cierre — doctor, docs y release 0.11.0

## Description

Cerrar el plan: dejar `/doctor` consciente (report-only) del nuevo flag de caveman,
consolidar la documentación de ambas features, y publicar la versión. No introduce
comportamiento nuevo; alinea coherencia + release.

## Spec

- **`/doctor`** (`task-pipeline/skills/doctor/SKILL.md`) — respetando sus **reglas de
  Propiedad (repo-owned vs plugin-owned)**:
  - **`features.caveman` es repo-owned**: si falta en el `task-pipeline.yml` del repo,
    reportarlo como drift **report-only** (fix con diff + aprobación, como el resto de doctor).
  - **`caveman.sh` + su registro en `hooks.json` son plugin-owned** (viven en el plugin,
    no se materializan en el repo consumidor): si se mencionan, marcarlos **solo-reporte**
    ("actualiza el plugin"), **no** como drift accionable del repo.
  - **No** vigilar `pipeline-usage` como fichero materializado ausente (es skill del plugin).
  - En un repo **sano** (flag presente) → **no** inventar drift de caveman (idempotencia).
- **README** (`task-pipeline/README.md`): **verificar coherencia** de la entrada de
  `pipeline-usage` (creada en la tarea 009) y **documentar caveman** (flag + hook +
  limitación "hilo principal, no subagentes"). Sin introducir la categoría "opt-in
  behaviors". Reconocer que el **ROI de caveman no es medible** por el propio pipeline
  (evita una afirmación futura no verificable; coherente con `honesty-rules.md`).
- **Versión**: `task-pipeline/.claude-plugin/plugin.json` `0.10.0` → **`0.11.0`** (minor).
- **CHANGELOG** (`task-pipeline/CHANGELOG.md`): entrada `[0.11.0]` (Keep a Changelog):
  Added (`pipeline-usage`, `features.caveman` + hook), y **nota de diseño**: analytics es
  **on-demand (sin colector por hooks)** por decisión de la review.
- **Coherencia de descripciones**: `plugin.json.description` ↔ `marketplace.json` (raíz)
  coherentes entre sí y con la enumeración de skills actualizada (incluye `pipeline-usage`).
- **Verificación**: `claude plugin validate .` OK; barrido `grep` reforzado.

## Scenarios (Gherkin)

```gherkin
Feature: Coherencia del plugin y publicación

  # Corrección de semántica: features.caveman es opt-in (default off), como models:.
  # Su AUSENCIA NO es drift duro (nagearía cada repo); doctor la OFRECE comentada.
  Scenario: doctor trata caveman como opt-in, no como drift duro
    Given un repo adoptado sin features.caveman en su task-pipeline.yml
    When corro /doctor
    Then NO se reporta como drift bloqueante (su ausencia = default off, no rompe nada)
    And doctor puede ofrecer añadir la clave comentada (nicety, como models:), con diff + aprobación
    And si menciona el hook caveman lo marca plugin-owned (solo-reporte: actualizar el plugin), no drift del repo

  Scenario: doctor no inventa drift en un repo sano
    Given un repo adoptado con features.caveman: lite
    When corro /doctor
    Then no se reporta drift relacionado con caveman

  Scenario: doctor no marca pipeline-usage como fichero materializado ausente
    Given un repo adoptado
    When corro /doctor
    Then pipeline-usage no se reporta como drift del repo

  Scenario: Versión y changelog publicados
    Given el plugin tras esta tarea
    When inspecciono plugin.json y CHANGELOG.md
    Then la versión es 0.11.0
    And existe una entrada [0.11.0] que describe pipeline-usage y features.caveman
    And la entrada nota que analytics es on-demand (sin colector por hooks)

  Scenario: Descripciones coherentes plugin.json ↔ marketplace.json
    Given plugin.json y marketplace.json tras esta tarea
    When comparo sus description
    Then son coherentes entre sí
    And su enumeración de skills incluye pipeline-usage

  Scenario: README documenta ambas features
    Given README.md tras esta tarea
    When lo inspecciono
    Then documenta cómo invocar pipeline-usage
    And documenta la limitación de caveman "hilo principal, no subagentes"
    And reconoce que el ROI de caveman no es medible por el propio pipeline

  Scenario: El manifest valida
    Given el plugin tras esta tarea
    When ejecuto `claude plugin validate .`
    Then el resultado es correcto (sin errores)

  Scenario: Sin identificadores muertos
    Given el árbol del plugin tras esta tarea
    When ejecuto el barrido grep reforzado
    Then no hay grill-me/`/task`/skills/task/ vivos (allowlist legítima intacta)
```

## Provides

- —

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado como criterio de aceptación (correr `/doctor`
      sobre repos con/sin flag; `claude plugin validate .`; inspección de
      versión/CHANGELOG/descripciones; barrido `grep`).
- [ ] Spec cumplida.
- [ ] Gate de mutation — **N/A** (`stack.mutation-tool: none`).
- [ ] Gate de `fact-checker` superado (incluida la afirmación "el manifest valida").
      **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (README + CHANGELOG + versión + descripciones)
      actualizada; **histórico** en `.claude/context/task-pipeline/task-pipeline-012.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos.
- [ ] `plugin.json`/`marketplace.json`/CHANGELOG coherentes entre sí.
