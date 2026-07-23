---
id: task-pipeline-collision-free-ids-11
package: task-pipeline
plan: collision-free-ids
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 4
depends_on: [task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-09, task-pipeline-collision-free-ids-10, task-pipeline-collision-free-ids-12]
estimate: 2h
actual: 30min
created: 2026-07-23
updated: 2026-07-23
---

# Doc de la integración GitHub (README + guía de equipo + catálogos)

## Description

Documentar la integración GitHub opcional de cara al usuario, con **honestidad sobre sus límites** (riesgos
aceptados). Depende de -07..-10 y -12 (la feature completa, incluido el ciclo de vida del padre y el límite
de concurrencia). Es la última pieza de comportamiento antes del release (`-06`).

## Spec

- **`task-pipeline/README.md`** — sección nueva "GitHub tracking (opcional)":
  - **Setup**: `gh auth login` + scopes (`repo`); requisito de `gh` reciente (sub-issues + `--parent`).
  - **Config**: claves de `features.github-tracking` (enabled/repo/project/issue-type-plan) y su semántica
    fail-safe (off por defecto).
  - **Mapeo**: Plan → issue padre; Task → sub-issue; **orden global = número de issue**; estados; el `.md`
    es la fuente de verdad, GitHub es proyección one-way.
  - **Ciclo de vida del padre** (T-A / `-12`): al completar el plan, el padre se cierra (o, si aplica, cómo
    cerrarlo); los padres no se auto-cierran solos.
  - **Límites (honestos)**: jerarquía en Projects en **public preview** (no en Roadmap); techos 100
    sub-issues/padre y 8 niveles; **no hay épica nativa**; `depends_on` no se proyecta como dependencia nativa.
  - **Riesgos aceptados**:
    - **Proyección concurrente (T-B)**: dos devs proyectando el mismo plan en paralelo crean **padres
      duplicados** + `issue:` en conflicto; mitigación "una rama proyecta el plan"; lo detecta `/doctor`.
    - **Sync best-effort (C3)**: no garantiza consistencia.
    - **Huérfanas al desactivar (I3)**: coherente con `-10`, indicar **reconciliar ANTES de desactivar** (o
      documentar que `/doctor` sigue detectando huérfanas si hay `issue:` en `.md`) — la doc y `-10` deben
      contar la MISMA historia.
- **Catálogos (T-F)**: mencionar `github-tracking` (y la nueva categoría de `/doctor`) donde el repo
  enumera features/skills — README raíz, `CLAUDE.md` (patrón del repo).
- **`docs/guides/task-lifecycle.md`** (materializado): enlace a la sección, sin duplicar.
- Coherente con `.claude/honesty-rules.md`: **no** prometer robustez que la feature no da.

## Scenarios (Gherkin)

```gherkin
Feature: Documentación de la integración GitHub opcional

  Scenario: El README documenta setup, config y mapeo
    Given README.md tras esta tarea
    When busco la sección GitHub tracking
    Then documenta gh auth + scopes, las claves de config y el mapeo plan→padre / task→sub-issue

  Scenario: Documenta el ciclo de vida de la issue padre
    Given la sección GitHub tracking
    When leo el mapeo de estados
    Then explica que al completar el plan se cierra el padre y que no se auto-cierra solo

  Scenario: Los límites y riesgos aceptados están documentados con honestidad
    Given la sección GitHub tracking
    When la leo
    Then dice que Projects jerárquico está en preview, los techos 100/8, que no hay épica nativa
    And declara el sync best-effort

  Scenario: Documenta el límite de proyección concurrente (T-B)
    Given los riesgos aceptados
    When los leo
    Then advierte que dos devs proyectando el mismo plan crean padres duplicados + issue: en conflicto
    And explica la mitigación (una rama proyecta; /doctor reconcilia)

  Scenario: Historia de huérfanas coherente con /doctor
    Given la doc de desactivación y la Spec de -10
    When comparo qué dicen sobre huérfanas
    Then cuentan la MISMA historia (reconciliar antes de desactivar, o doctor las detecta por issue:)

  Scenario: Los catálogos del repo mencionan github-tracking
    Given README raíz y CLAUDE.md tras esta tarea
    When busco la enumeración de features/skills
    Then incluye github-tracking (y la nueva categoría de /doctor)

  Scenario: Coherencia con la fuente de verdad
    Given la doc
    When la leo
    Then deja claro que el .md manda y GitHub es proyección one-way
```

## Provides

- —

## Definition of Done

- [x] Tests TDD — **N/A** (stack `none`).
- [x] Cada escenario Gherkin verificado por inspección + `grep`.
- [x] Spec cumplida; límites y riesgos documentados sin sobreventa (honesty-rules); historia de huérfanas
      coherente con `-10`.
- [x] Gate de mutation — **N/A**.
- [x] Gate de `fact-checker` superado (8/8 VERIFICADO). **No-negociable.**
- [x] Doc: **TSDoc N/A**; **doc técnica** (README + flujo + catálogos); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-11.md`.
- [x] Barrido `grep` reforzado sin identificadores muertos.
