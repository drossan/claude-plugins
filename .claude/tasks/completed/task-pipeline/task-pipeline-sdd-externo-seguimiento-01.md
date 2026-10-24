---
id: task-pipeline-sdd-externo-seguimiento-01
package: task-pipeline
plan: sdd-externo-seguimiento
status: done
priority: 1
depends_on: []
estimate: 2h
actual: 1h
issue: 89
created: 2026-10-24
updated: 2026-10-24
---

# Riesgos del provider documentados y frases «idéntico» con salvedad (M5 + B3)

## Description

El primer code review dejó sin documentar los riesgos del provider externo y frases que afirman que `off`/nativo son idénticos al comportamiento previo. Plan: `.claude/plans/active/task-pipeline/sdd-externo-seguimiento.md`.

## Spec

- **M5**: en `task-pipeline/README.md` (sección del provider, ~l.364-371) listar los 4 riesgos del plan (inyección vía `phase=start` como **hipótesis**) y el consejo de revisar el `task-pipeline.yml` entero de un repo ajeno. En `website/features/sdd.md` solo un resumen de una línea que enlace al README (sin copia). No renombrar el heading `SDD: nativo o externo (opcional)`; los enlaces del portal al lifecycle son URL de GitHub.
- **B3**: `grep -rn "idéntic"` en `task-pipeline/`, `website/`, `docs/` y el CU (sin CHANGELOG histórico); sustituir por «equivalente en comportamiento» con la salvedad (enlace a un CU; en nativo, línea de DoD de `external` y cat. 13 de `/doctor`). El barrido se limita a SDD (git-automation y honestidad se dejan y se registra), excluye `dist/`, `node_modules/` y el CHANGELOG ≤ 0.18.3, y cubre paráfrasis («exactamente igual», «intacto», «byte-»). Incluye el escenario «El modo nativo no cambia» del CU.
- Edita del CU: el escenario «El modo nativo no cambia».

## Fuera de alcance

- B11, B12, mitigaciones técnicas de M5, cambiar el comportamiento del modo nativo.

## Scenarios (Gherkin)

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)
  (escenarios «Los cuatro riesgos…», «El README recomienda revisar…», «El portal no copia…», «Ninguna mención presenta la inyección…» y «El barrido de identidad se limita a SDD»)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [x] Escenarios verificados por `grep`/inspección
- [x] `claude plugin validate .` y `pnpm docs:build` en verde (ejecutados en esta sesión)
- [x] Spec cumplida
- [x] **Gate `sdd-lint` superado** — sin ERROR
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] **SDD** — CU actualizado (escenario «El modo nativo no cambia») y FR-013 añadido a spec.md
- [x] Doc técnica actualizada · `technical-docs`
- [x] Histórico — `.claude/context/task-pipeline/task-pipeline-sdd-externo-seguimiento-01.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos (allowlist del `CLAUDE.md`)
