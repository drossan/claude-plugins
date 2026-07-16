---
id: task-pipeline-004
package: task-pipeline
plan: grilling-and-model-routing
status: done          # pending | active | blocked | in-review | done | cancelled
priority: 4
depends_on: [task-pipeline-001, task-pipeline-002, task-pipeline-003]
estimate: 1h
actual: 0.75h
created: 2026-07-16
updated: 2026-07-16
---

# Parte D — Release 0.9.0

## Description

Cerrar la release que agrupa las partes A/B/C: bump de versión y entrada de CHANGELOG con migración
clara. Precedente de formato: la entrada `## [0.8.0]` (rename `task→plan-task`, BREAKING + Migration).

## Spec

- `task-pipeline/.claude-plugin/plugin.json`: `version` `0.8.1` → `0.9.0`.
- `task-pipeline/CHANGELOG.md`: nueva entrada `## [0.9.0] — 2026-07-16` (NO tocar entradas ≤ 0.8.1):
  - `### Changed` — **BREAKING**: rename skill/comando `grill-me`→`grilling` + sync de texto con
    upstream; fix de `bootstrap.sh` y del comando viejo `/task` (drift del rename 0.8.0).
  - `### Added` — routing de modelo por fase (`models:` para subagentes) + skill `doctor`.
  - `### Migration` — `/task-pipeline:grill-me` → `/task-pipeline:grilling`; "grill me" en lenguaje
    natural sigue invocando; `models:` es opcional (ausente = hereda sesión).
- Coherencia de metadatos: `plugin.json`/`marketplace.json` sin "grill-me"; la narrativa del flujo usa
  `grilling`; `doctor` mencionado. Las notas de release reflejan lo realmente entregado por 001/002/003.

## Scenarios (Gherkin)

```gherkin
Feature: Release 0.9.0 del plugin task-pipeline

  Scenario: Versión bumpeada
    Given `plugin.json` en 0.8.1
    When se cierra la release
    Then `plugin.json` declara la versión 0.9.0

  Scenario: La entrada de CHANGELOG tiene las tres secciones
    Given la nueva entrada 0.9.0 del CHANGELOG
    Then contiene Changed (BREAKING: rename + sync + fix drift), Added (routing + doctor) y Migration

  Scenario: El historial permanece intacto
    Given las entradas del CHANGELOG anteriores o iguales a 0.8.1
    When se añade la entrada 0.9.0
    Then las entradas antiguas no se modifican

  Scenario: La sección Migration cubre el rename
    Given la sección Migration de 0.9.0
    Then indica el cambio `/…:grill-me` → `/…:grilling`
    And aclara que "grill me" en lenguaje natural sigue funcionando

  Scenario: Las notas de release reflejan lo entregado
    Given la entrada 0.9.0 que anuncia `doctor` y `models:`
    When se cierra la release
    Then existe `skills/doctor/SKILL.md`
    And existe la sección `models:` en el template y en la config del repo

  Scenario: La narrativa de flujo en metadatos usa el nombre nuevo
    Given la descripción de `plugin.json` y `marketplace.json`
    When se lee la secuencia del pipeline
    Then el paso de interrogatorio se nombra `grilling` (no `grill-me`)
    And `doctor` aparece mencionado
```

## Provides

- Release 0.9.0 lista para PR desde `plan/task-pipeline/grilling-and-model-routing` a `main`. Cierra el plan.

## Definition of Done

> Stack `none`: TDD y mutation = **N/A**; verificación = inspección de los ficheros de release.
- [ ] Cada escenario verificado por inspección.
- [ ] `plugin.json` en 0.9.0; CHANGELOG con Changed/Added/Migration; historial ≤ 0.8.1 intacto.
- [ ] Metadatos coherentes (sin "grill-me"; narrativa con `grilling`; `doctor` mencionado).
- [ ] Notas de release verificadas contra lo entregado (existe doctor + models:).
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-004.md`.
- [ ] Commit `task-pipeline-004: chore(task-pipeline): release 0.9.0`.
- [ ] Plan → `completed`; PR a `main`.
