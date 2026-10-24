---
id: task-pipeline-sdd-proveedor-externo-07
package: task-pipeline
plan: sdd-proveedor-externo
status: done
priority: 3
depends_on: [task-pipeline-sdd-proveedor-externo-06]
estimate: 2h
actual: 1h
created: 2026-10-24
updated: 2026-10-24
---

# `/doctor` detecta el lifecycle materializado anterior a 0.18.0 (follow-up A1)

## Description

Los repos ya adoptados con un `docs/guides/task-lifecycle.md` anterior a 0.18.0 no tienen la sección «Modo SDD»
(regla única) ni los pasos 4b/3c de invocación del provider. `/doctor` hoy solo vigila el gate `fact-checker`
(cat. 5) y el ancla de `honesty-rules.md` (cat. 6b); `task-lifecycle.md` no lleva ancla de versión, así que el
drift pasa sin aviso. Origen: hallazgo A1 del code review del plan.

## Spec

- Nueva categoría en `task-pipeline/skills/doctor/SKILL.md`, análoga a la cat. 5 (drift de plantilla, repo-owned):
  si `docs/guides/task-lifecycle.md` existe y **no contiene** el heading «Modo SDD», repórtalo como lifecycle
  anterior a 0.18.0.
- Con `features.sdd` en bloque con `provider` (intención de `external`) es drift que importa: ofrece
  re-materializar desde `../plan-task/templates/task-lifecycle.md` con diff + aprobación. Con SDD off o `true`,
  solo aviso informativo. Nunca escribe sin aprobación; no toca prosa personalizada sin enseñar el diff.
- Coherencia: README (lista de categorías de `/doctor`), `website/` si lista las categorías, CHANGELOG (0.18.2) y
  `plugin.json`.
- Sin ancla de versión nueva en el lifecycle (se usa la presencia de la sección).

## Fuera de alcance

- M5 (riesgos de seguridad), M2, M6, B1–B8, B10–B12 y cualquier otro drift del lifecycle distinto de «Modo SDD».
- Añadir un ancla `template-version` al lifecycle.

## Scenarios (Gherkin)

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)
  (escenarios «Doctor detecta un lifecycle materializado anterior a la regla de modos», «Lifecycle al día no se
  reporta» y «Repo sin SDD y con lifecycle antiguo»)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [x] Escenarios verificados corriendo la lógica de la categoría sobre tres repos de prueba (lifecycle antiguo + bloque, al día, antiguo + SDD off)
- [x] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [x] Spec cumplida
- [x] **Gate `sdd-lint` superado** — sin ERROR (sin cambios en artefactos SDD; ver session log)
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] **SDD** — CU actualizado (escenarios añadidos al crear la tarea), o «sin cambios de spec/CU»
- [x] Doc técnica actualizada (README, CHANGELOG 0.18.2, `plugin.json`) · `technical-docs`
- [x] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-07.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
