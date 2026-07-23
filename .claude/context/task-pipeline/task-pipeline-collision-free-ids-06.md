# Histórico — task-pipeline-collision-free-ids-06

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Release del plan `collision-free-ids`: bump `0.11.0 → 0.12.0`, entrada `[0.12.0]` en el
CHANGELOG (D1 + D2 + nota de diseño), descripciones coherentes (`plugin.json` ↔ `marketplace.json`),
`claude plugin validate .` OK y barrido `grep` reforzado limpio.

**Decisiones + porqué.**
- **Minor `0.12.0`** (no patch, no major): features nuevas retrocompatibles (ids plan-scoped para nuevos,
  detección en doctor, github-tracking opt-in) sin romper lo existente (ids legacy estables; default off).
- **CHANGELOG narra la tensión de diseño**: la `design-review` recomendó NO incluir el tracking; el owner
  lo mantuvo aceptando los riesgos — rastro honesto coherente con el Plan change log.
- **Descripciones**: ambas ganan "ids plan-scoped" + "github-tracking"; la de marketplace es más resumida
  (sin contradicción).

**Verificación (stack `none`).** 4 escenarios:
- Versión `0.12.0` (plugin.json:4) + entrada `[0.12.0]` (CHANGELOG:7) con esquema plan-scoped, detección
  de duplicados, github-tracking y nota de la design-review.
- Descripciones coherentes (plugin.json:3 ↔ marketplace.json:11).
- **`claude plugin validate .` → `✔ Validation passed`** (ejecutado; el fact-checker lo re-ejecutó
  independientemente: exit 0).
- Barrido `grep` reforzado: sin `<package>-<nnn>` vivo como esquema (solo citas legacy) ni identificadores
  muertos salvo el **detector de doctor** (categoría 1, nombra los viejos a propósito) y CHANGELOG/atribución.
**Gate `fact-checker`** (subagente fresco, inherit): **5/5 VERIFICADO** (incl. re-run de validate), 0 INCORRECTO.

**Docs actualizadas.** `plugin.json` (version + description), `marketplace.json` (description),
`CHANGELOG.md`. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
`task-pipeline/CHANGELOG.md`. Commit `release: 0.12.0 (ids plan-scoped + github-tracking opt-in)` con este task-id.

**Tiempo real.** ~25min (estimado 1h).

**Follow-ups / cierre del plan.** Última tarea del plan. Plan → `completed` con nota retro. El **PR** a
`main` queda para el owner (el sandbox no puede `push` — SSH). Follow-up pre-existente (fuera de este plan):
la tabla de features del **template** `templates/task-lifecycle.md` no lista `features.caveman` (gap del
plan caveman 0.11.0) — candidato a `/doctor`/alineación futura.
