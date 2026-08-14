---
id: task-pipeline-sdd-y-stack-poliglota-08
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 3
depends_on: [task-pipeline-sdd-y-stack-poliglota-01, task-pipeline-sdd-y-stack-poliglota-02, task-pipeline-sdd-y-stack-poliglota-03, task-pipeline-sdd-y-stack-poliglota-04, task-pipeline-sdd-y-stack-poliglota-05, task-pipeline-sdd-y-stack-poliglota-06, task-pipeline-sdd-y-stack-poliglota-07]
estimate: 2h
actual: ~30m
issue: 45                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#45
created: 2026-08-13
updated: 2026-08-14
---

# Release: nav final + coherencia e2e + bump SemVer + manifiestos + retro

## Description

Tarea **de solo release** (la doc de cada feature ya se escribió en su propia tarea). Verifica la
coherencia end-to-end, finaliza la nav del portal, sube la versión (SemVer) y consolida el CHANGELOG bajo
un único header de versión. Sin comportamiento nuevo.

## Spec

- **Nav final del portal**: verifica que todas las páginas nuevas (`website/features/sdd.md`) están
  **registradas y alcanzables** en el sidebar (`website/.vitepress/config.mts`) y con orden coherente.
  Verificación por **inspección** (no puedo correr `pnpm docs:build` aquí — `stack: none`).
- **Coherencia de espejos (e2e)**: las tablas de flags (README + las dos `task-lifecycle`) y la prosa de
  stack son consistentes; la **frase canónica** de las 6 sedes queda **byte a byte intacta** (grep). DoD
  espejo consistente (`task.md` ↔ 2×lifecycle).
- **Bump SemVer**: `task-pipeline/.claude-plugin/plugin.json` de `0.14.0` a `0.15.0` (features opt-in,
  retrocompatibles → **minor**). **Verifica la versión de partida**: si otro plan ya subió la versión
  mientras este estaba en curso, **no** reintentes un bump duplicado a ciegas — ajusta al siguiente minor
  coherente.
- **Strings de manifiestos**: `plugin.json` + `.claude-plugin/marketplace.json` — la `description` menciona
  SDD nativo + stack multi-lenguaje por-package, coherentes entre sí.
- **CHANGELOG**: consolida las entradas `### Added` de las tareas 01–07 bajo un único
  `## [0.15.0] — <fecha>` (Keep a Changelog), con el bullet de tranquilización "opt-in default off —
  comportamiento por defecto idéntico".
- **Retro**: nota al plan cerrado (estimación vs real, sorpresas, dependencias no vistas; en especial el
  corte de B4 a follow-up).

## Fuera de alcance

- **Correr** el build de VitePress / cualquier runner (`stack: none`, verificación por inspección).
- El **seed del sitio** (diferido a follow-up) y **añadir comportamiento** (release only).

## Scenarios (Gherkin)

```gherkin
Feature: Cierre de release del plan

  Scenario: bump SemVer + manifiestos coherentes
    Given `plugin.json` en `0.14.0`
    When corre la tarea de release
    Then `version` sube a `0.15.0` (minor)
    And `plugin.json` y `marketplace.json` mencionan SDD + stack multi-lenguaje de forma coherente

  Scenario: CHANGELOG consolidado
    Given el CHANGELOG con entradas de features de 01–07
    Then un único header `## [0.15.0] — <fecha>` agrupa los `### Added`
    And lleva la tranquilización "opt-in default off — comportamiento por defecto idéntico"

  Scenario: espejos consistentes y frase canónica intacta
    Given README + las dos `task-lifecycle`
    When comparo las tablas de flags y la prosa de stack
    Then son consistentes entre sí
    And la frase canónica de las 6 sedes es byte-idéntica (sin cambios por este plan)

  Scenario: nav alcanzable
    Given `website/.vitepress/config.mts`
    Then `features/sdd.md` está registrada y alcanzable en el sidebar `Opcional`

  Scenario: bump de versión con precondición violada
    Given `plugin.json` ya está en `0.15.0` (otro plan lo subió primero)
    When corre la tarea de release
    Then detecta el desajuste y no reintenta un bump duplicado a ciegas
```

## Provides

—  (tarea de cierre; nada aguas abajo depende de ella dentro del plan)

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep` / `test -d`)
- [x] Spec cumplida (versión, manifiestos, CHANGELOG consolidado, nav, espejos)
- [x] Gate de `fact-checker` superado — en especial "la versión subió a 0.15.0" y "la frase canónica no cambió" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `plugin.json` + `marketplace.json` + `CHANGELOG.md` + `config.mts` · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-08.md` · context-log
- [x] Retro añadida al plan; barrido `grep` reforzado final (sin identificadores muertos; frase canónica intacta)
