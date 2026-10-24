---
id: task-pipeline-model-routing-per-phase-04
package: task-pipeline
plan: model-routing-per-phase
status: done
priority: 2
depends_on: []
estimate: 1h
actual: 20 min
issue: 71
created: 2026-08-18
updated: 2026-08-18
---

# Frontmatter `model: haiku` en `/pipeline-usage`

## Description

Añadir `model: haiku` al frontmatter de la skill `/pipeline-usage` (única fase inline donde el override de
modelo "pega" limpio: read-only y de un solo turno). El resto de fases inline **no** llevan frontmatter (su
modelo se documenta como recomendación de sesión — tarea 02). Fuente: `spec.md` (FR-007) y CU-frontmatter-inline.

## Spec

- Editar `task-pipeline/skills/pipeline-usage/SKILL.md`: añadir `model: haiku` al frontmatter (junto a
  `name` + `description`).
- **Cláusula de compatibilidad**: verificar que un `model:` desconocido en versiones viejas de Claude Code se
  **ignora** (no rompe la skill); si no se puede verificar, marcarlo NO VERIFICABLE en el histórico.
- **No** añadir frontmatter de modelo a ninguna otra skill (grilling/plan-task/mutation/doctor/task-init):
  su turno 1 es interactivo/de juicio y el override sería contraproducente o inútil.

## Fuera de alcance

- Frontmatter en `/task-init` (su turno 1 es el de juicio) ni en el resto de inline multi-turno.
- Forzar modelo per-repo en inline (imposible: frontmatter estático + por-turno).

## Scenarios (Gherkin)

> `features.sdd` ON — Gherkin en el CU (fuente única). Criterios de aceptación:
> - [CU-frontmatter-inline](../../specs/task-pipeline/casos-de-uso/frontmatter-inline.md).
>
> Verificación de ESTA tarea (por inspección/`grep`): `pipeline-usage/SKILL.md` declara `model: haiku`;
> ninguna otra `SKILL.md` declara `model:`.

## Provides

- `/pipeline-usage` con `model: haiku`. Nada aguas abajo depende funcionalmente; la tarea 06 (website) y 07
  (CHANGELOG) lo documentan.

## Definition of Done

- [ ] Escenarios del CU verificados como criterios de aceptación (inspección / `grep`) — TDD/mutation N/A
- [ ] Spec cumplida; cláusula de compat verificada o marcada NO VERIFICABLE
- [ ] **Gate `sdd-lint`** superado · `features.sdd`
- [ ] Gate de `fact-checker` superado · no-negociable
- [ ] **SDD** — spec + CU actualizados o "sin cambios de spec/CU" · `features.sdd`
- [ ] Documentación: doc técnica/contexto + histórico en `.claude/context/…` — TSDoc N/A
- [ ] Barrido `grep` reforzado (ninguna otra skill con `model:`)
- [ ] Proyección de estado a GitHub al cerrar · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-04: <conventional commit>` · `git-automation`
