---
id: task-pipeline-sdd-validation-gate-05
package: task-pipeline
plan: sdd-validation-gate
status: pending
priority: 3
depends_on: [task-pipeline-sdd-validation-gate-01, task-pipeline-sdd-validation-gate-02, task-pipeline-sdd-validation-gate-03, task-pipeline-sdd-validation-gate-04]
actual:
issue: 56
estimate: 1h
created: 2026-08-14
updated: 2026-08-14
---

# Release del plan: README + portal + CHANGELOG + bump/manifiestos + retro

## Description

Cierre del plan `sdd-validation-gate` (tareas 01–04). Solo release, sin comportamiento nuevo. Doc de la
feature, portal, versión y consolidación de CHANGELOG.

## Spec

- **README** del plugin: sección `sdd-lint` (qué valida, ERROR/AVISO, gate intrínseco a `features.sdd`, helper
  Bash opcional para CI). Actualizar la sección "SDD nativo" para referenciar el gate.
- **Portal**: página/actualización en `website/features/` (p.ej. ampliar `sdd.md` con el gate) + sidebar si
  procede. Verificación por inspección (`stack:none`, no corro `pnpm docs:build`).
- **CHANGELOG**: entradas de 01–04 bajo un único header de versión. **Bump SemVer**: si v0.15.0 sigue **sin
  mergear** → se folda en 0.15.0; si 0.15.0 ya está released → **0.16.0** (minor, feature opt-in). Verificar
  la versión de partida (no bump duplicado a ciegas).
- **Manifiestos**: `plugin.json` + `marketplace.json` — `description` menciona el gate de validación SDD.
- **Retro**: nota al plan (estimación vs real, sorpresas — en especial el giro de híbrido→skill del
  design-review).
- **Coherencia e2e**: espejos de flags/DoD consistentes; **frase canónica byte-intacta** (la **preexistente**
  del salto en planes triviales, en 5 sedes — verificar que este plan **no la tocó**; NO se introduce una
  frase canónica nueva del gate); JSON de manifiestos válido.
- **Hardening (scenario-coverage)**: el bump SemVer como `Scenario Outline` con las dos ramas (fold en 0.15.0
  sin mergear / bump a 0.16.0 si ya released).

## Fuera de alcance

- Añadir comportamiento (release only); correr el build de VitePress (`stack:none`).

## Scenarios (Gherkin)

```gherkin
Feature: Release del plan sdd-validation-gate

  Scenario: manifiestos mencionan el gate SDD (coherentes)
    Given `plugin.json` y `marketplace.json`
    Then ambas descriptions mencionan el gate de validación SDD (`sdd-lint`) de forma coherente
    And ambos son JSON válido

  Scenario: CHANGELOG consolidado sin bump duplicado
    Given las entradas de 01–04
    When corre la tarea de release
    Then quedan bajo un único header de versión (folded en 0.15.0 si sigue sin mergear, o 0.16.0)
    And no se crea un bump duplicado a ciegas

  Scenario: portal del gate alcanzable
    Given `website/`
    Then la doc del gate `sdd-lint` está registrada/alcanzable en el sidebar

  Scenario: espejos consistentes y frase canónica intacta
    Given README + 2×lifecycle
    Then las tablas/DoD son consistentes y la frase canónica es byte-idéntica

  Scenario: cierre del plan
    Given 01–04 en `done`
    When se cierra el release
    Then el plan → `completed`, sus issues → closed, PR al día
```

## Provides

— (tarea de cierre)

## Definition of Done

- [ ] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep` / `test -d`)
- [ ] Spec cumplida (README, portal, CHANGELOG, bump/manifiestos, retro, espejos)
- [ ] Gate de `fact-checker` superado — en especial "la versión es coherente" y "frase canónica intacta" · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [ ] Doc técnica: README + portal + CHANGELOG + `plugin.json` + `marketplace.json` · technical-docs
- [ ] Histórico de la tarea — session log · context-log
- [ ] Retro añadida al plan; barrido `grep` reforzado final (sin identificadores muertos; frase canónica intacta)
