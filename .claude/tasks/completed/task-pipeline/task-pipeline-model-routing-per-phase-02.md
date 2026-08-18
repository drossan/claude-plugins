---
id: task-pipeline-model-routing-per-phase-02
package: task-pipeline
plan: model-routing-per-phase
status: done
priority: 2
depends_on: [01]
estimate: 2h
actual: 30 min
issue: 69
created: 2026-08-18
updated: 2026-08-18
---

# Perfil de modelos en el YAML: comentado (template) + activo (este repo) + tabla inline

## Description

Materializar el **perfil recomendado sostenible** en los dos `task-pipeline.yml`, respetando la invariante
"el template no impone coste" (bloque **comentado**) y dogfoodeándolo activo en este repo. Añadir la **tabla
de recomendación** para las fases inline (que no se rutan). Fuente: `spec.md` (FR-006, FR-007) y ADR
`0001-modelos-por-defecto-sostenibles`.

## Spec

- **Perfil recomendado** (ADR 0001): `design-review: opus` · `scenario-coverage: sonnet` · `fact-checker:
  sonnet` · `sdd-lint: sonnet`.
- **Template** (`skills/plan-task/templates/task-pipeline.yml`, bloque L125-138): `models:` **comentado** con
  ese perfil; actualizar la cabecera/semántica al contrato de la tarea 01. Invariante **intacta** (no voltear).
- **Este repo** (`.claude/task-pipeline.yml`): mantener `design-review: opus`, `scenario-coverage: sonnet`,
  `fact-checker: sonnet` y **añadir `sdd-lint: sonnet`** (activo). Actualizar su cabecera al contrato.
- **Tabla de recomendación inline** (en la sección de routing del bloque, comentada, y referida desde
  README/website): `grilling` = opus; `/plan-task`, `/mutation`, `/doctor`, `/task-init` = sonnet;
  `/pipeline-usage` = haiku (por frontmatter, tarea 04). Una fila indica: "planes complejos → sube
  `design-review` a opus a mano (o la sesión)". **Sin** hint automático.
- Ambos YAML deben **parsear** (PyYAML) tras la edición.
- **Chequeo negativo (B2)**: la tabla de recomendación **no** sugiere `fable` en ninguna fase, aunque el
  schema (tarea 03) sí lo acepte como valor válido — sin contradicción.

## Fuera de alcance

- **Voltear la invariante** / **matriz "todo Opus"** por defecto. **Fable 5** como recomendación en la tabla.
- El modeline del schema (tarea 03) y el configurador/`doctor` (tarea 05).

## Scenarios (Gherkin)

> `features.sdd` ON — Gherkin en el CU (fuente única). Criterios de aceptación:
> - [CU-routing-contrato](../../specs/task-pipeline/casos-de-uso/routing-contrato.md) — el perfil respeta la
>   semántica (valores válidos → se rutan; inline → se ignoran/documentan).
>
> Verificación de ESTA tarea (config, por inspección): el template trae el bloque **comentado** con el
> perfil; `.claude/task-pipeline.yml` trae `sdd-lint: sonnet` activo; ambos parsean con PyYAML; existe la
> tabla de recomendación inline.

## Provides

- El **bloque `models:` comentado** con el perfil + la **tabla de recomendación inline** (referenciables por
  la tarea 05 "ofrecer descomentar" y por la tarea 06 website) y el **perfil activo** de este repo.

## Definition of Done

- [ ] Escenarios del CU verificados como criterios de aceptación (inspección) — TDD/mutation N/A (stack `none`)
- [ ] Spec cumplida; `Provides` disponible; ambos YAML parsean (PyYAML)
- [ ] **Gate `sdd-lint`** superado · `features.sdd`
- [ ] Gate de `fact-checker` superado (incl. "ambos YAML parsean") · no-negociable
- [ ] **SDD** — spec + CU actualizados o "sin cambios de spec/CU" · `features.sdd`
- [ ] Documentación: doc técnica/contexto + histórico en `.claude/context/…` — TSDoc N/A
- [ ] Barrido `grep` reforzado
- [ ] Proyección de estado a GitHub al cerrar · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-02: <conventional commit>` · `git-automation`
