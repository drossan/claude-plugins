---
id: task-pipeline-008
package: task-pipeline
plan: honesty-and-verification
status: done          # pending | active | blocked | in-review | done | cancelled
priority: 4
depends_on: [task-pipeline-005, task-pipeline-006, task-pipeline-007]
estimate: 1h
actual: 0.5h
created: 2026-07-16
updated: 2026-07-16
---

# Registro de `fact-checker` + release

## Description

Registrar la skill `fact-checker` en las superficies documentales (mismo patrón que `doctor`) y cerrar la
release que agrupa 005/006/007. Versión tentativa **0.10.0** (minor: features nuevas, sin BREAKING).
Precedente de formato: la entrada `## [0.9.0]`.

## Spec

- Registrar `fact-checker`: tabla de skills + lista de comandos namespaced (`/task-pipeline:fact-checker`)
  en **ambos README**; descripción-prosa de `plugin.json` y `marketplace.json`; tabla de
  `docs/flujo-del-pipeline.md` (coherencia, como `doctor`).
- `task-pipeline/.claude-plugin/plugin.json`: `version` `0.9.0` → `0.10.0`.
- `task-pipeline/CHANGELOG.md`: entrada `## [0.10.0] — <fecha>` (NO tocar entradas ≤ 0.9.0):
  - `### Added` — skill `fact-checker` (gate de cierre que verifica afirmaciones) + `models.fact-checker`;
    reglas de honestidad materializables (`@import` opt-in) + no-duplicación en `coding-standards`.
  - `### Migration` — `fact-checker` es un gate de cierre **no-negociable** (sin flag); para "leer cada
    turno" las reglas de honestidad, añade `@.claude/honesty-rules.md` a tu `CLAUDE.md` (task-init lo
    sugiere; doctor lo reporta si falta).
- Coherencia: metadatos mencionan `fact-checker`; la narrativa del flujo lo ubica como gate de cierre; las
  notas reflejan lo realmente entregado por 005/006/007 (existe la skill; existe `honesty-rules.md`; la
  no-duplicación está en `coding-standards`).
- **Coherencia de `flujo-del-pipeline.md`**: actualizar el conteo "Las N skills" y ubicar `fact-checker`
  como **gate de cierre** (no como fase de plan) en la narrativa/diagrama.
- **Frontera en la superficie documental**: las descripciones de `fact-checker` y `doctor` en ambos README
  quedan distinguibles (veracidad de afirmaciones vs drift de convención), no solapadas.
- **Prosa honesta**: la descripción de `fact-checker` en metadatos/READMEs lo presenta como gate de cierre
  invocado por la DoD; **no** promete auto-invocación "antes de cada commit".

## Scenarios (Gherkin)

```gherkin
Feature: Release con fact-checker registrado

  Scenario: fact-checker figura en la superficie documental
    Given ambos README tras el registro
    Then aparece en la tabla de skills y en los comandos namespaced (/task-pipeline:fact-checker)
    And la prosa de plugin.json/marketplace.json lo menciona de forma coherente

  Scenario: Versión bumpeada a 0.10.0
    Given plugin.json en 0.9.0
    When se cierra la release
    Then plugin.json declara 0.10.0

  Scenario: La entrada de CHANGELOG tiene Added y Migration
    Given la nueva entrada 0.10.0
    Then contiene Added (fact-checker + models.fact-checker + reglas/no-dup) y Migration

  Scenario: El historial permanece intacto
    Given las entradas del CHANGELOG ≤ 0.9.0
    When se añade la entrada 0.10.0
    Then las entradas anteriores no se modifican

  Scenario: Las notas reflejan lo entregado
    Given la entrada 0.10.0 que anuncia fact-checker y las reglas
    Then existe `skills/fact-checker/SKILL.md`
    And existe la plantilla `honesty-rules.md`
    And la no-duplicación está en `specs/general/coding-standards.md`

  Scenario: El registro actualiza el conteo de skills y el diagrama del flujo
    Given `flujo-del-pipeline.md` con "Las 7 skills" y el diagrama del pipeline
    When se registra fact-checker
    Then el conteo refleja la skill añadida
    And fact-checker se ubica como gate de cierre, no como fase de plan

  Scenario: El registro incluye la frontera fact-checker ↔ doctor
    Given la tabla de skills de ambos README tras el registro
    When se leen juntas las descripciones de fact-checker y doctor
    Then se distingue veracidad de afirmaciones (fact-checker) de drift de convención (doctor)

  Scenario: La prosa registrada no promete auto-invocación
    Given la descripción de fact-checker en plugin.json, marketplace.json y ambos README
    When se lee su texto
    Then la describe como gate de cierre invocado por la DoD
    And no afirma que se ejecuta automáticamente antes de cada commit
```

## Provides

- Release 0.10.0 lista para PR (stack sobre `grilling-and-model-routing` → destino según se resuelva #6).
  Cierra el plan.

## Definition of Done

> Stack `none`: verificación = inspección de los ficheros de release.
- [ ] Cada escenario verificado por inspección.
- [ ] `fact-checker` registrado en ambos README + plugin.json + marketplace.json + flujo.
- [ ] `plugin.json` en 0.10.0; CHANGELOG con Added + Migration; historial ≤ 0.9.0 intacto.
- [ ] Notas verificadas contra lo entregado (skill + honesty-rules + coding-standards existen).
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-008.md`.
- [ ] Commit `task-pipeline-008: chore(task-pipeline): release 0.10.0`.
- [ ] Plan → `completed`; PR.
