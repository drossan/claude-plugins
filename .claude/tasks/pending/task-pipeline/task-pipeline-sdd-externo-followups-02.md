---
id: task-pipeline-sdd-externo-followups-02
package: task-pipeline
plan: sdd-externo-followups
status: pending
priority: 2
depends_on: []
estimate: 1.5h
actual:
issue: 93
created: 2026-10-24
updated: 2026-10-24
---

# `doctor`: detección precisa del provider instalado (B12)

## Description

La cat. 12 de `doctor` cita `installed_plugins.json` sin ruta ni forma. Decidido en `grilling`/`design-review`: vía principal = skills visibles en la sesión; el JSON solo afina el diagnóstico y nunca declara «OK». Plan: `.claude/plans/pending/task-pipeline/sdd-externo-followups.md`.

## Spec

- `task-pipeline/skills/doctor/SKILL.md` cat. 12 («Provider configurado no instalado»): vía principal = skill visible en la sesión; respaldo = `~/.claude/plugins/installed_plugins.json`.
- Resultados: instalado · instalado pero no cargado en esta sesión · instalado sin esa skill · plugin ausente · no verificado (fichero inexistente, no parsea o forma inesperada: nunca «ausente»).
- Forma mínima documentada (ruta, clave `<plugin>@<marketplace>`, lista de entradas, `installPath`), declarada **observada y no soportada**; sin `version` ni lista de campos.
- No deducir la entrada aplicable por `scope`/`projectPath`: basta que alguna entrada con prefijo `<plugin>@` tenga `installPath/skills/<skill>/SKILL.md`. El provider no lleva marketplace.
- Rechazar un `provider` cuyo plugin o skill contenga `..`, `/` o `\` antes de construir ninguna ruta; la comprobación no corre si el provider apunta a `task-pipeline` ni fuera del modo `external`. Gravedad: plugin ausente / instalado sin esa skill = drift; no verificado / instalado pero no cargado = aviso. Visibilidad por nombre cualificado `plugin:skill`.
- CU `sdd-proveedor-externo`: RN-11 (ya escrita al crear la tarea) fija la regla (el respaldo nunca declara activo). Entrada en CHANGELOG al cerrar el plan (task 03).

## Fuera de alcance

- Mitigaciones de M5, detectar lifecycles 0.18.0–0.18.3, validar el contenido del provider.
- Cambiar el modelo de resolución del modo SDD.

## Scenarios (Gherkin)

- [sdd-proveedor-externo](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)
  (escenarios de diagnóstico del provider en `/doctor`)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [ ] Escenarios verificados por `grep`/inspección
- [ ] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [ ] Spec cumplida
- [ ] **Gate `sdd-lint` superado** — sin ERROR
- [ ] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [ ] **SDD** — CU actualizado al crear la tarea, o «sin cambios de spec/CU»
- [ ] Doc técnica actualizada · `technical-docs`
- [ ] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-externo-followups-02.md` · `context-log`
- [ ] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
