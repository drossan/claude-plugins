---
id: task-pipeline-sdd-y-stack-poliglota-12
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 3
depends_on: [task-pipeline-sdd-y-stack-poliglota-09, task-pipeline-sdd-y-stack-poliglota-10, task-pipeline-sdd-y-stack-poliglota-11]
estimate: 1h
actual: ~20m
issue: 50
created: 2026-08-14
updated: 2026-08-14
---

# Release de la extensión: CHANGELOG + manifiestos + portal + retro + re-cierre

## Description

Cierre de la extensión (09–11). Como **v0.15.0 no está mergeada** (PR #46 abierta), las features nuevas se
**consolidan bajo el mismo `## [0.15.0]`** (no un bump nuevo). Verifica coherencia e2e, actualiza los
manifiestos y el portal, añade la retro y re-cierra el plan/PR.

## Spec

- **CHANGELOG**: añade bajo `## [0.15.0]` las entradas de 09 (activación SDD), 10 (flags) y 11 (comportamiento
  git-automation/conventional), sin crear un header de versión nuevo (0.15.0 sigue sin release). Mantiene la
  tranquilización "opt-in default off — comportamiento por defecto idéntico".
- **Manifiestos**: `plugin.json` + `marketplace.json` — la `description` menciona **git-automation
  (auto-commit/PR opt-in)** y **conventional-commits configurable**, coherentes entre sí. **Sin** bump (sigue
  0.15.0). Si otro proceso ya subió la versión, ajusta al minor coherente (no bump duplicado a ciegas).
- **Portal (VitePress)**: verifica que `website/features/git-automation.md` está registrada y alcanzable en
  el sidebar; que `sdd.md` y las demás páginas siguen coherentes. Verificación por **inspección** (no corro
  `pnpm docs:build`, `stack: none`).
- **Coherencia e2e**: tablas de flags (README + 2×lifecycle) consistentes; frase canónica **byte-intacta**;
  JSON de manifiestos válido.
- **Retro**: nota al plan (extensión: estimación vs real, sorpresas).
- **Re-cierre**: plan → `completed`; #47–#50 → Done/close; **padre #37** → Done/close; PR #46 al día.

## Fuera de alcance

- **Bump** de versión nuevo (0.15.0 aún sin merge → se folda).
- **Correr** el build de VitePress (`stack: none`, inspección).
- Añadir comportamiento (release only).

## Scenarios (Gherkin)

```gherkin
Feature: Cierre de la extensión del plan

  Scenario: CHANGELOG folda en 0.15.0 sin bump nuevo
    Given `plugin.json` en `0.15.0` sin release (PR abierta)
    When corre la tarea de release de la extensión
    Then las entradas 09-11 quedan bajo el mismo `## [0.15.0]`
    And no se crea un header de versión nuevo

  Scenario: manifiestos mencionan git-automation + conventional (coherentes)
    Given `plugin.json` y `marketplace.json`
    Then ambas descriptions mencionan git-automation y conventional-commits de forma coherente
    And ambos son JSON válido

  Scenario: portal git-automation alcanzable
    Given `website/.vitepress/config.mts`
    Then `features/git-automation.md` está registrada en el sidebar `Opcional`

  Scenario: espejos consistentes y frase canónica intacta
    Given README + 2×lifecycle
    Then las tablas de flags son consistentes
    And la frase canónica de las 6 sedes es byte-idéntica

  Scenario: re-cierre del plan
    Given 09-11 en `done`
    When se cierra la extensión
    Then el plan → `completed`, #47-#50 y el padre #37 → closed
```

## Provides

—  (tarea de cierre)

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep` / `test -d`)
- [x] Spec cumplida (CHANGELOG folded, manifiestos, portal, espejos, retro)
- [x] Gate de `fact-checker` superado — en especial "no hay bump nuevo (sigue 0.15.0)" y "frase canónica intacta" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `CHANGELOG.md` + `plugin.json` + `marketplace.json` + `config.mts`/portal · technical-docs
- [x] Histórico de la tarea — session log · context-log
- [x] Retro añadida al plan; barrido `grep` reforzado final (sin identificadores muertos; frase canónica intacta)
