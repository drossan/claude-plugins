---
id: task-pipeline-model-routing-per-phase-06
package: task-pipeline
plan: model-routing-per-phase
status: pending
priority: 3
depends_on: [01, 02, 03, 05]
estimate: 2h
actual:
issue: 73
created: 2026-08-18
updated: 2026-08-18
---

# Website: actualizar `configuracion.md` (routing + perfil + schema + coste)

## Description

Reflejar el contrato extendido y el nuevo enfoque de coste en el portal VitePress. Es un **sub-proyecto
aislado** con toolchain pnpm propio; la verificación es **correr el build** (`pnpm docs:build`). Fuente:
`spec.md` (SC-004) + el contrato de la tarea 01 + el perfil de la tarea 02 + el schema de la tarea 03.

## Spec

- **`website/guia/configuracion.md`** (sección "Modelos por fase", L63-68): actualizar a "3 ruteables +
  `sdd-lint` condicional"; documentar el **perfil recomendado** (design-review opus + resto sonnet) y por
  qué (coste); el **autocompletado** vía JSON schema; la recomendación de sesión para las inline; la fila
  "planes complejos → design-review opus a mano" (sin hint automático).
- **`website/guia/que-es.md:44`**: ajustar la mención de "models" si el conteo/enfoque cambia.
- Registrar en `website/.vitepress/config.mts` cualquier página nueva (si se añade); no tocar el toolchain.
- **No** editar `website/.vitepress/dist|cache` (generados).

## Fuera de alcance

- Tocar el toolchain del `website/` (build/deps). Cualquier cambio de contrato (eso vive en 01-03).

## Scenarios (Gherkin)

> Tarea **doc-only** sin comportamiento testeable → sin CU conductual (el template lo permite). Verificación:
> **`pnpm docs:build` en verde** + inspección de que `configuracion.md` refleja el set (3+condicional), el
> perfil, el schema/autocompletado y la nota de coste; `grep` sin conteos contradictorios en `website/`.

## Provides

- — (documentación de usuario; nada aguas abajo depende).

## Definition of Done

- [ ] `pnpm docs:build` en **verde** (ejecutado en esta sesión, resultado observado)
- [ ] `configuracion.md` refleja el contrato (3+`sdd-lint` condicional), el perfil y el schema; `que-es.md` coherente
- [ ] Gate de `fact-checker` superado (incl. "el build pasó") · no-negociable
- [ ] **Gate `sdd-lint`** superado · `features.sdd`
- [ ] **SDD** — "sin cambios de spec/CU" declarado (tarea doc del portal) · `features.sdd`
- [ ] Documentación: histórico en `.claude/context/…` — TSDoc N/A
- [ ] Barrido `grep` reforzado (sin conteos contradictorios en `website/`)
- [ ] Proyección de estado a GitHub al cerrar · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-06: <conventional commit>` · `git-automation`
