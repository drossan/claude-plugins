---
id: task-pipeline-sdd-proveedor-externo-06
package: task-pipeline
plan: sdd-proveedor-externo
status: done
priority: 3
depends_on: [task-pipeline-sdd-proveedor-externo-05]
estimate: 2h
actual: 1h
created: 2026-10-24
updated: 2026-10-24
---

# Correcciones del code review del plan (coherencia de la regla única)

## Description

El code review del plan (Opus, 2026-10-24) encontró contradicciones y enlaces rotos que la verificación por
inspección no vio. Esta tarea aplica las correcciones **mecánicas** aceptadas por el owner. Plan:
`.claude/plans/active/task-pipeline/sdd-proveedor-externo.md`.

## Spec

Cada ítem se **reproduce primero** (leer el fichero/slug real) y solo entonces se corrige:

- **A3** — ancla de «Modo SDD»: comprobar el slug real que genera el heading `### Modo SDD: \`off\` / \`native\` / \`external\``
  (el review dice `modo-sdd-off--native--external`) y corregir las 7 referencias (`docs/guides/task-lifecycle.md`,
  `templates/task-lifecycle.md`, `README.md` ×2, `flujo-del-pipeline.md` ×2, `website/features/sdd.md`,
  `website/guia/configuracion.md`). Alternativa válida: simplificar el heading para que el slug sea estable.
- **A2** — subir `x-task-pipeline-schema-version` en los dos schemas (idénticos entre sí) para que `/doctor` detecte el drift.
- **A4** — fila `features.sdd` de `docs/guides/task-lifecycle.md` y de `templates/task-lifecycle.md`: quitar «solo `true` activa».
- **A5** — `templates/task-pipeline.yml`: quitar la contradicción «FAIL-SAFE: SOLO `sdd: true`… bloque → off» y el título «SDD nativo».
- **M1** — `templates/task-lifecycle.md`: apuntar al título real del README.
- **M3** — `/doctor`: avisar de provider que apunta a `task-pipeline` (hoy cae en «lo avisa el lifecycle», que no corre) y no ofrecer activar sin explicarlo.
- **M4** — decidir y escribir una sola vez si la reapertura `done → active` invoca `phase=start`; alinear lifecycle, README y CU (RN-7/RN-9).
- **B9** — textos no actualizados a los tres modos: `plugin.json` (descripción), `.claude/task-pipeline.yml`, `templates/README.md`.
- Subir **patch** (0.18.1) + CHANGELOG.

## Fuera de alcance

- **A1** (repos ya adoptados con `task-lifecycle.md` antiguo) y **M5** (riesgos de seguridad adicionales): follow-up documentado, no se resuelven aquí.
- M2 (reducir duplicación de la regla), M6, B1–B8, B10–B12: follow-ups.

## Scenarios (Gherkin)

Tarea de coherencia documental: sin comportamiento nuevo. Criterios de aceptación en el CU (fuente única) y verificación por `grep`/slugger/build:

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [x] Cada hallazgo reproducido antes de corregirse; ningún enlace a la regla apunta a un slug inexistente
- [x] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [x] Spec cumplida
- [x] **Gate `sdd-lint` superado** — sin ERROR
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — N/A: la tarea no tiene `issue:` (ciclo local puro)
- [x] **SDD** — CU actualizado (M4 toca RN-7/RN-9), o «sin cambios de spec/CU» aquí y en el session log
- [x] Doc técnica actualizada · `technical-docs`
- [x] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-06.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
