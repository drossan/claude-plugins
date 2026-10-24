---
id: task-pipeline-model-routing-per-phase-03
package: task-pipeline
plan: model-routing-per-phase
status: done
priority: 2
depends_on: [01]
estimate: 4h
actual: 45 min
issue: 70
created: 2026-08-18
updated: 2026-08-18
---

# JSON schema del `task-pipeline.yml` + modeline `yaml-language-server`

## Description

Crear el JSON schema que cubre **todo** `task-pipeline.yml` y añadir el modeline `# yaml-language-server` en
ambos YAML, como **ayuda de editor** (autocompletado/validación en el editor), no validación en runtime.
Fuente: `spec.md` (FR-008, NFR-002) y CU-json-schema. La **materialización en consumidores** y su drift son
de la tarea 05; aquí se crea el schema y se referencia en **este** repo (ruta relativa).

## Spec

- **Fichero de schema** en el plugin (ruta canónica a fijar, p.ej. `task-pipeline/schemas/task-pipeline.schema.json`
  o `.claude/task-pipeline.schema.json` en este repo — decidir y documentar la ruta única). **JSON válido**
  (`python3 -m json.tool`).
- **Cobertura**: `mode` (enum full/legacy/docs-only), `stack` (+ `packages` con herencia parcial), `features`
  (tdd, closing-documentation.*, mutation-gate, sdd, caveman, github-tracking, git-automation, conventional-commits)
  y `models` (claves = fases ruteables del contrato de la tarea 01).
- **Valor de `models.<fase>`** = `anyOf: [ {enum: [opus, sonnet, haiku, fable, inherit]}, {type: string} ]`
  → autocompleta alias sin rechazar ids libres. `fable` válido en el enum (aunque no recomendado en docs).
- **Clave-ancla de versión**: el schema incluye una clave top-level (p.ej. `"x-task-pipeline-schema-version"`)
  con la versión del contrato, que `/doctor` usa para detectar **drift** del schema materializado (tarea 05).
  Coordinar el nombre exacto de la clave con la tarea 05.
- **Modeline** `# yaml-language-server: $schema=<ruta>` en `.claude/task-pipeline.yml` (ruta relativa) y en
  el template (la resolución del template en consumidores la cablea la tarea 05).
- No añadir dependencias; el schema no se ejecuta en runtime.

## Fuera de alcance

- **Materializar** el schema en consumidores + **drift** en `/doctor` (tarea 05).
- Cambiar el runtime (sigue sin parser). **Fable 5** como recomendación en la tabla de docs.

## Scenarios (Gherkin)

> `features.sdd` ON — Gherkin en el CU (fuente única). Criterios de aceptación:
> - [CU-json-schema](../../specs/task-pipeline/casos-de-uso/json-schema.md).
>
> Verificación de ESTA tarea: el schema pasa `python3 -m json.tool`; `.claude/task-pipeline.yml` con el
> modeline sigue parseando (el modeline es un comentario); el `anyOf` acepta tanto `opus` como `claude-sonnet-5`.

## Provides

- El **fichero de schema** (JSON válido) + el **contrato del modeline** + la **forma del valor de modelo**
  (`anyOf[enum,string]`). La tarea 05 (materialización + drift) y la 06 (website) dependen de él.

## Definition of Done

- [ ] Escenarios del CU verificados — schema pasa `python3 -m json.tool`; el YAML con modeline parsea
- [ ] Spec cumplida; `Provides` disponible
- [ ] **Gate `sdd-lint`** superado · `features.sdd`
- [ ] Gate de `fact-checker` superado (incl. "el schema es JSON válido") · no-negociable
- [ ] **SDD** — spec + CU actualizados o "sin cambios de spec/CU" · `features.sdd`
- [ ] Documentación: doc técnica/contexto + histórico en `.claude/context/…` — TSDoc N/A
- [ ] Barrido `grep` reforzado
- [ ] Proyección de estado a GitHub al cerrar · `features.github-tracking`
- [ ] Auto-commit `task-pipeline-model-routing-per-phase-03: <conventional commit>` · `git-automation`
