# Histórico — task-pipeline-collision-free-ids-07

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Fundamento de D2: superficie de config + frontmatter para el tracking GitHub, SIN
proyección (eso es -08/-09/-12). Añadido el bloque **comentado** `github-tracking` en
`templates/task-pipeline.yml` con su semántica fail-safe, el campo opcional `issue:` en
`templates/task.md` (sub-issue) y `templates/plan.md` (issue padre), y la fila del lector en las tablas
de features de `plan-task/SKILL.md` y `templates/task-lifecycle.md`.

**Decisiones + porqué.**
- **Bloque COMENTADO** en el template, siguiendo el precedente de `caveman`/`models:`: la semilla no
  impone comportamiento a repos consumidores (ADN del plugin).
- **Fail-safe estricto**: solo `enabled: true` (booleano) activa; todo lo demás → off. Mismo patrón que
  `caveman`, para que un typo o `"true"` string no encienda una integración de red por accidente.
- **`issue:` opcional** (no obligatorio): un repo sin D2 no lo usa; con D2 lo escribe `/plan-task`.
- **Ausencia = no drift** documentada en ambas tablas (T-E): lo consumirá -10 en `/doctor`.

**Verificación (stack `none`).** 4 escenarios (incl. Scenario Outline fail-safe) por inspección +
`grep`: bloque comentado con enabled:false + no-op (yml:66-71); fila en ambas tablas (SKILL:39,
lifecycle:39) con opt-in/fuera-de-preset/no-drift; `issue:` opcional en task.md:10 y plan.md:6.
**Gate `fact-checker`** (subagente fresco, inherit): **6/6 VERIFICADO**; confirmado 0 llamadas `gh`
ejecutables (solo en comentarios).

**Docs actualizadas.** Plantillas (config + frontmatter) + tablas de features (doc técnica).
Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `templates/task-pipeline.yml`, `templates/task.md`, `templates/plan.md`,
`plan-task/SKILL.md`, `templates/task-lifecycle.md`. Commit `feat(config): superficie github-tracking
(opt-in) + frontmatter issue:` con este task-id.

**Tiempo real.** ~30min (estimado 2h).

**Follow-ups.** -08 teje la proyección md→GitHub en `/plan-task` consumiendo este flag + `issue:`.
-09 (estado de tarea), -12 (plan/concurrencia), -10 (reconciliación), -11 (doc) también lo consumen.
