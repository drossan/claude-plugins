---
id: task-pipeline-model-routing-per-phase-07
package: task-pipeline
plan: model-routing-per-phase
status: done
priority: 4
depends_on: [01, 02, 03, 04, 05, 06]
estimate: 2h
actual: 30 min
issue: 74
created: 2026-08-18
updated: 2026-08-18
---

# Cierre de release: CHANGELOG + bump 0.16.0 + coherencia de descriptions

## Description

Cerrar el release del plugin: entrada de CHANGELOG, bump de versión y coherencia de `description`. Es la
**última tarea** del plan (al cerrarla, `git-automation.auto-pr` abre la PR a `main`). Fuente: convención de
Release del `CLAUDE.md` del repo.

## Spec

- **`task-pipeline/CHANGELOG.md`**: nueva entrada `## [0.16.0] — 2026-08-…` (Keep a Changelog): `Added`
  (routing de `sdd-lint`, JSON schema + autocompletado, materialización + drift en `/doctor`, `model: haiku`
  en `/pipeline-usage`, oferta de `models:` en `/task-init`/`/doctor`); `Changed` (perfil recomendado
  sostenible = design-review opus + resto sonnet; corrección de la limitación del README);
  `Removed`/`N/A` (nada de escalado automático — nunca se envió). No existe `[Unreleased]` hoy.
- **`task-pipeline/.claude-plugin/plugin.json`**: `version` `0.15.0` → `0.16.0`.
- **Coherencia de `description`**: `plugin.json` ↔ `.claude-plugin/marketplace.json` coherentes tras el
  cambio (si mencionan el routing/modelos).
- `claude plugin validate .` sin errores.
- **Chequeo negativo (B1)**: `grep` confirma que **no** existe maquinaria de auto-escalado de modelo (el
  hint eliminado) en `plan-task/SKILL.md` ni en el resto de skills — solo, si acaso, en el registro que
  narra su descarte (allowlist).

## Fuera de alcance

- Renombrar ids legacy. Cambios de contrato/config/skills (viven en 01-06).

## Scenarios (Gherkin)

> Tarea **meta/release** sin comportamiento testeable → sin CU conductual. Verificación: `claude plugin
> validate .` OK; `plugin.json` = `0.16.0`; entrada de CHANGELOG presente y coherente con lo entregado en
> 01-06; `description` de plugin.json y marketplace.json coherentes; barrido `grep` final del plan
> (sin `grill-me`/`/task`/`skills/task/` vivos; allowlist respetada).

## Provides

- — (cierre del plan / release).

## Definition of Done

- [ ] `claude plugin validate .` sin errores (ejecutado, resultado observado)
- [ ] `plugin.json` en `0.16.0`; entrada de CHANGELOG coherente con lo entregado; descriptions coherentes
- [ ] **Barrido `grep` reforzado FINAL del plan** — sin identificadores muertos ni conteos de fase contradictorios (allowlist)
- [ ] Gate de `fact-checker` superado (incl. "validate pasó", "entrada de CHANGELOG verificada contra lo entregado") · no-negociable
- [ ] **Gate `sdd-lint`** superado · `features.sdd`
- [ ] **SDD** — "sin cambios de spec/CU" declarado (tarea de release) · `features.sdd`
- [ ] Documentación: histórico en `.claude/context/…` — TSDoc N/A
- [ ] Proyección de estado a GitHub al cerrar; **cierre de la issue PADRE** al completar el plan · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-07: <conventional commit>` + **auto-PR** a `main` (última tarea) · `git-automation`
