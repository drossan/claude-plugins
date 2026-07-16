---
id: task-pipeline-grilling-and-model-routing
package: task-pipeline
status: active          # pending | active | completed | cancelled
branch: plan/task-pipeline/grilling-and-model-routing
created: 2026-07-16
updated: 2026-07-16
---

# `grilling` (rename + sync) + routing de modelo por fase + `doctor`

## Contexto y problema

Tres cambios agrupados en la release 0.9.0 (decisión del owner, mantenida tras `design-review`):

**(A) Rename + sync.** La skill `grill-me` (adaptación MIT, © Matt Pocock —
[`mattpocock/skills`](https://github.com/mattpocock/skills)) quedó desfasada: upstream la renombró a
**`grilling`** y reescribió el texto. Parity total: nombre + contenido. Además se corrige un **bug vivo**
descubierto en el review (ver #1 abajo).

**(B) Routing de modelo por fase.** Verificado contra `code.claude.com/docs`: **no hay auto-óptimo**;
lo robusto es pasar `model` por invocación a los **subagentes**. Config editable en `models:` del YAML.

**(C) `doctor`.** Comando nuevo para **diagnosticar y alinear un repo YA iniciado** (frontera con
`/task-init`, que es bootstrap desde cero).

## Objetivos

1. **Parity con upstream `grilling`** (nombre + texto) + **hook reparado**.
   - *Criterio*: `skills/grilling/SKILL.md` (`name: grilling`, body verbatim + atribución);
     `bootstrap.sh` apunta a un `TEMPLATES` que existe; verificación reforzada (abajo) en verde.
2. **Routing de modelo config-driven para las 2 fases con subagente.**
   - *Criterio*: `design-review`/`scenario-coverage` leen `models.<fase>` y pasan `model` al Agent();
     repo pinea `design-review: opus`, `scenario-coverage` inherit; template ambas comentadas.
3. **Comando `doctor`: verificación primero, fix interactivo por problema tras aprobación.**
   - *Criterio*: **Fase 1** = verificación read-only (detecta drift, secciones ausentes, rutas
     muertas). **Fase 2** por cada problema: lo presenta; si hay **varias opciones** de arreglo,
     pregunta cuál (afina); si hay **una sola**, la propone; aplica el fix **solo tras aprobación**
     del usuario (con diff). Nada se auto-edita a ciegas; prosa customizada/ambigua se reporta.
4. **Release 0.9.0 con migración clara.**
   - *Criterio*: `plugin.json` en `0.9.0`; CHANGELOG `Changed`(BREAKING)+`Added`+`Migration`; `doctor`
     listado; sin "grill-me" en metadatos.

## Alcance y fuera de alcance

### Dentro del alcance
- Rename dir + `SKILL.md`; propagación de referencias (~13 ficheros).
- **Fix `bootstrap.sh`** (regresión del rename 0.8.0: `skills/task/templates` → `skills/plan-task/templates`).
- Atribución (`THIRD-PARTY-NOTICES.md` + ambos README).
- Sección `models:` (config del repo + template) + lectura en `design-review`/`scenario-coverage`/`plan-task`.
- Skill nueva `doctor` (verificación read-only → fix interactivo por problema tras aprobación).
- Docs con la limitación de modelo **documentada UNA vez** (README del plugin) y referenciada, no duplicada.
- Release 0.9.0 (bump + CHANGELOG).

### Fuera de alcance
- Rutar skills inline (imposible robusto) → solo doc.
- Modo `--update`/refresh de `/task-init` (posible follow-up).
- Reescribir historial del CHANGELOG (≤ 0.8.1 intacto).
- Añadir harness de tests (stack sigue `none`).

## Recursos externos

- Upstream `mattpocock/skills` → `skills/productivity/grilling/SKILL.md` (MIT).
- Precedente rename: CHANGELOG `## [0.8.0]` (`task→plan-task`, BREAKING + Migration).
- Doc verificada de modelo: `code.claude.com/docs`. No hay auto-óptimo.
- Hallazgos `design-review` 2026-07-16 (ver change log): #1 hook roto, #5 doc-once.

## Estimación global

- **Tareas totales**: 4 (ver abajo).
- **Esfuerzo estimado**: 1–2 sesiones (Markdown/config; `doctor` es la pieza con más diseño).
- **Recursos**: owner (checkpoints) + subagentes design-review/scenario-coverage.

## Criterios de calidad y verificación

> Stack `none` (Markdown + Bash, sin runner ni mutation). TDD/mutation de la DoD = **N/A**;
> verificación **manual/script**. El review demostró que un grep de un solo string NO basta (no cazó la
> rotura de `bootstrap.sh`). Verificación **reforzada**:

- `grep -rn "grill-me\|grill me" .` → solo entradas históricas del CHANGELOG (≤ 0.8.1).
- Barrido de **todos** los identificadores renombrados históricamente (`skills/task/`, `/task ` como
  comando viejo, `grill-me`) → solo restos históricos legítimos en CHANGELOG.
- `bootstrap.sh`: la ruta `TEMPLATES` resuelve a un directorio que existe (`test -d`); el hook no
  referencia rutas muertas.
- `skills/grilling/SKILL.md` correcto; `skills/grill-me/` ya no existe.
- `models:` en config del repo (design-review: opus; scenario-coverage inherit) y en template (comentado);
  `design-review`/`scenario-coverage` leen `models.<fase>` y pasan `model` al Agent().
- `skills/doctor/SKILL.md` existe; diagnostica y arregla solo lo seguro con confirmación + diff.
- `plugin.json` `version: 0.9.0`; `doctor` listado; sin "grill-me" en metadatos.

## Tasks

<Descompuestas en Gherkin en `.claude/tasks/pending/task-pipeline/`. Se endurecen con `scenario-coverage`.>

- [x] `task-pipeline-001` (P1) — Parte A: rename `grill-me`→`grilling` + sync + propagación + atribución + **fix `bootstrap.sh` y drift `/task`**  · depends_on: —
- [ ] `task-pipeline-002` (P2) — Parte B: `models:` (config repo + template) + design-review/scenario-coverage + plan-task + **doc-once**  · depends_on: task-pipeline-001
- [ ] `task-pipeline-003` (P3) — Parte C: skill `doctor` (verifica → fix interactivo) + registro en metadatos/READMEs  · depends_on: task-pipeline-001, task-pipeline-002
- [ ] `task-pipeline-004` (P4) — Release 0.9.0 (bump `plugin.json` + CHANGELOG Changed/Added/Migration)  · depends_on: 001, 002, 003

## Registro de cambios del plan

- 2026-07-16: creado.
- 2026-07-16: decisiones del owner (AskUserQuestion en plan mode): rename completo a `grilling`;
  ampliar con routing de modelo; mecanismo = solo subagentes; defaults opinables.
- 2026-07-16: refinado con `grill-me` (5 ramas): template `models:` comentado / repo pineado; se AÑADE
  `doctor` (Parte C); alcance doctor = diagnóstico + fix seguro con confirmación; `scenario-coverage`
  en inherit (solo `design-review: opus` pineado); rama = desde integración.
- 2026-07-16: **`design-review`** (subagente fresco, `model: opus`). Hallazgos y resolución:
  - **#1 (aceptado)** `bootstrap.sh:20` apunta a `skills/task/templates` (inexistente desde 0.8.0) →
    auto-restauración del hook muerta y silenciosa. **Se arregla en Parte A** + verificación reforzada
    (no solo grep de un string).
  - **#2 (owner mantiene `doctor`)** pese al argumento de que el hook `SessionStart` ya es el
    auto-reparador natural. El hook se arregla igual; `doctor` sigue como Parte C.
  - **#3 (owner mantiene el rename)** pese al argumento de coherencia (el rename fabrica el drift que
    `doctor` limpia; único breaking; acopla cadencia a upstream). Sigue como release 0.9.0 BREAKING.
  - **#4 (owner mantiene config `models:`)** pese a YAGNI (hoy es un solo pin). Sigue config-driven.
  - **#5 (aceptado)** la limitación de modelo se documenta **una vez** (README del plugin) y se
    referencia; no se duplica en 4 sitios ni en docs materializados de consumidores.
  - **#6 (aceptado, factual)** el estado de git cambió: `feat/…` YA está mergeada a `main` (PRs #1–#5);
    `main` (0.8.1) va por delante y contiene feat/. Base correcta = **`main`** (sin FF); la rama local
    está stale/mergeada.
- 2026-07-16: refinamiento del owner sobre `doctor`: flujo en dos fases — **verificación read-only
  primero**, luego **por cada problema** proponer fix (preguntar qué opción si hay varias; si solo hay
  una, proponerla) y aplicar **solo tras aprobación**. Nada se auto-edita a ciegas.
- 2026-07-16: `scenario-coverage` (subagente QA fresco) sobre las 4 tareas. Aceptados e incorporados:
  (a) **transversal**: el comando viejo `/task` sigue vivo en las cabeceras de ambos `task-pipeline.yml`
  → **task-001 amplía** su alcance para limpiarlo (mismo linaje que el fix del hook); (b) **allowlist**
  del barrido en 001 (atribución + CHANGELOG ≤ 0.8.1 son legítimos); (c) `verbatim` vs trigger NL
  resuelto (la description upstream ya dispara con "any 'grill' trigger phrases"); (d) `depends_on` de
  **task-003 corregido a [001, 002]** (consume el contrato `models:`); (e) endurecimientos por dimensión
  en las 4 tareas (doctor: detección de las 4 categorías, idempotencia, repo no adoptado, plugin-owned
  drift = solo-reporte, diff-antes-de-aprobar, YAML malformado, fallo al aplicar; 002: modelo inválido→
  inherit, pin inline→ignorado, cabecera con lectores reales; 004: notas reflejan lo entregado).
- 2026-07-16: **task-pipeline-001 done** — rename `grill-me`→`grilling` (dir + SKILL verbatim de
  upstream + atribución), propagación en 20 ficheros, fix `bootstrap.sh:20` y drift `/task`→`/plan-task`
  en cabeceras YAML + guía repo. Verificación (cmp verbatim, barrido reforzado limpio, hook en 3 repos
  de prueba, JSON válidos) en `.claude/context/task-pipeline/task-pipeline-001.md`.
