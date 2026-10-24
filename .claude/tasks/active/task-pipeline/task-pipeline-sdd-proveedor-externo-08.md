---
id: task-pipeline-sdd-proveedor-externo-08
package: task-pipeline
plan: sdd-proveedor-externo
status: active
priority: 3
depends_on: [task-pipeline-sdd-proveedor-externo-07]
estimate: 3h
actual:
created: 2026-10-24
updated: 2026-10-24
---

# Correcciones del 2.º code review del plan

## Description

El 2.º code review (Opus, 2026-10-24) no halló altos: 5 medios y 11 bajos. El owner decidió ampliar el alcance a
todos salvo M-e (ver «Fuera de alcance»). Cada ítem se reproduce leyendo el fichero antes de corregirlo.

## Spec

- **M-a / M-b** — la regla de rechazo de provider propio se define **una vez** en «Modo SDD» (lifecycle y su
  plantilla): también un nombre **sin prefijo** que coincide con una skill de `task-pipeline`. `/task-init`
  (activación), `/doctor` (activación + cat. 12) la aplican; valor sin `:` en «no instalado» → «no verificado».
- **M-c / B-e / B-h** — cat. 13: la señal es el **heading** (`^#+ Modo SDD`), no cualquier mención; el fix es
  **añadir la sección (+ pasos 4b/3c)**, no reescribir el fichero; `enabled: false` → aviso informativo.
- **M-d** — README, portal, descripción de `sdd` en ambos schemas y `templates/task-pipeline.yml` dejan de
  repetir la regla y la **enlazan**.
- **B-a** DoD de `external`; **B-b/B-c** textos «con `features.sdd` on» → «modo nativo»; **B-d** CU (`contract=1`,
  orden 3a/4a); **B-f** `/doctor` activación con bloque existente; **B-g** escapar comillas en `/doctor`;
  **B-i** diagrama de estados del plan (`completed → active`) ; **B-j** `sdd-lint` en el perfil de `models:` solo
  nativo; **B-k** diagrama de la sección 8 del portal.
- Patch 0.18.3 + CHANGELOG.

## Fuera de alcance

- **M-e** (crear `issue:` para 06–08 en GitHub): acción outward-facing, pendiente de confirmar con el owner.
- M5, M2 (salvo lo cubierto por M-d), M6, B1–B8 (anteriores), B10–B12.

## Scenarios (Gherkin)

Tarea de coherencia documental, sin comportamiento nuevo salvo la regla de provider propio sin prefijo y la
cat. 13 acotada. Criterios en el CU (fuente única); verificación por `grep`/build:

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [ ] Cada hallazgo reproducido antes de corregirse
- [ ] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [ ] Spec cumplida
- [ ] **Gate `sdd-lint` superado** — sin ERROR
- [ ] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — N/A: la tarea no tiene `issue:` (ciclo local puro)
- [ ] **SDD** — CU actualizado (regla de provider propio, B-d), o «sin cambios de spec/CU»
- [ ] Doc técnica actualizada (README, CHANGELOG 0.18.3, `plugin.json`) · `technical-docs`
- [ ] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-08.md` · `context-log`
- [ ] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
