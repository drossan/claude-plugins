# Histórico — task-pipeline-001 (Parte A: rename grill-me → grilling + sync + fix drift)

> Session log append-only. Fuente canónica del contexto de esta tarea.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: []`; ninguna otra tarea `active`; rama
  `plan/task-pipeline/grilling-and-model-routing` (creada desde `main` @0.8.1, sin FF).
- Andamiaje de dogfooding + PM commiteado en el arranque (`8a9c6fc`) con el drift baseline
  (grill-me / `/task`) para que los fixes de esta tarea se vean como diffs.

## Contrato (resumen)

- Renombrar `task-pipeline/skills/grill-me/` → `skills/grilling/`.
- `grilling/SKILL.md`: `name: grilling` + description y body **verbatim de upstream**
  (`mattpocock/skills` → `skills/productivity/grilling/SKILL.md`, MIT) + comentario de atribución.
- Propagar el identificador `grill-me`→`grilling` en todas las referencias vivas (~13 ficheros).
- Fix regresión #1: `bootstrap.sh:20` `skills/task/templates` → `skills/plan-task/templates`.
- Fix regresión #2: comando viejo `/task` → `/plan-task` en cabeceras de ambos `task-pipeline.yml`
  y en `docs/guides/task-lifecycle.md` (repo copy, stale desde 0.8.0).

## Decisiones + porqué

- **Upstream verbatim verificado por `curl`** (no solo WebFetch): 843 bytes, 12 líneas, 4 párrafos.
  El WebFetch con modelo pequeño dio un recuento de párrafos inconsistente (3 vs 4); los bytes
  reales confirman 4 párrafos y las frases distintivas. Adoptado tal cual.
- **Alcance del barrido "operativo"**: se poliza el plugin shipped + andamiaje adoptado del repo
  (skills, hooks, READMEs, metadatos, templates, task-lifecycle.md, task-pipeline.yml). Se EXCLUYEN
  como allowlist-por-naturaleza los ficheros que *describen* el rename: `.claude/plans|tasks|context`,
  `.claude/specs/.../HOW-TO-START-A-TASK.md`, y el CHANGELOG (≤ 0.8.1). Menciones vivas legítimas
  restantes de "grill-me": atribución en `SKILL.md` + `THIRD-PARTY-NOTICES.md`.

## 2026-07-16 — Cierre

### Verificación corrida (criterios de aceptación) + resultado

- **Body verbatim upstream**: `cmp` de las 12 primeras líneas de `grilling/SKILL.md` vs `curl` de
  `mattpocock/skills` → byte-idéntico (843 B). ✓
- **Barrido reforzado** (scope = plugin shipped + andamiaje adoptado; allowlist = atribución +
  CHANGELOG ≤0.8.1 + ficheros PM/meta):
  - `grill-me` → solo atribución (`SKILL.md`, `THIRD-PARTY-NOTICES.md`). ✓
  - `grill me` (espacio) → 0 en shipped/scaffolding. ✓
  - `/task` (comando) → 0 (falsos positivos `templates/task.md` descartados). ✓
  - `skills/task/` → solo CHANGELOG + HOW-TO (histórico/meta). ✓
- **Hook `bootstrap.sh`**: `test -d` de `$ROOT/skills/plan-task/templates` OK; ambos ficheros que copia
  existen; `bash -n` OK. Ejecutado en 3 repos de prueba:
  - No adoptado → no-op silencioso, 0 ficheros. ✓
  - Adoptado sin guía → restaura `docs/guides/task-lifecycle.md` (con `grilling`) + emite additionalContext. ✓
  - Sano → no-op silencioso (EXIT 0, sin JSON). ✓
- **JSON**: `plugin.json` y `marketplace.json` válidos tras el sed; metadatos con `grilling`. ✓
- **Atribución**: `THIRD-PARTY-NOTICES.md` → `grilling` (nota "antes grill-me"); ambos README acreditan
  a Matt Pocock apuntando a `grilling`. ✓
- Los 8 escenarios Gherkin de la tarea → cubiertos.

### Docs actualizadas + motivo

- `THIRD-PARTY-NOTICES.md`, root `README.md`, `task-pipeline/README.md`: atribución al nombre actual.
- `docs/guides/task-lifecycle.md` (repo copy, estaba stale desde 0.8.0): `grill-me`→`grilling` y
  `/task`→`/plan-task`.

### Ficheros / commit

- 20 ficheros (rename skill D+A, hook, 2 YAML, 2 metadatos, 3 READMEs/notices, 4 templates, 2 SKILL de
  otras skills, guía repo, + PM: histórico y task movido).
- Commit: `task-pipeline-001: feat!: rename grill-me → grilling + sync upstream + fix bootstrap/task drift`.

### Tiempo real

- ~1.5h (estimate 2h). Mayor coste: verificar el verbatim de upstream (curl vs WebFetch) y desambiguar
  el barrido `/task` de los falsos positivos `task.md`.

### Follow-ups

- Ninguno bloqueante. La guía `docs/guides/task-lifecycle.md` del repo puede divergir del template en
  detalles no-identificador (longitud/numeración): es drift que la tarea 003 (`doctor`) contempla como
  reporte, no lo resuelve 001.
