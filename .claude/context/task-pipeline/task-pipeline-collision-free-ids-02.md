# Histórico — task-pipeline-collision-free-ids-02

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Añadida en `plan-task/SKILL.md` (Paso 5, nueva subsección "Asignación del `<task-id>`
(determinista, plan-scoped)") la regla operativa de cómo `/plan-task` deriva el `<nn>` de cada tarea.

**Decisiones + porqué.**
- La regla vive en el **Paso 5** (descomponer en tareas), donde se crean los `.md` de tarea — es el
  punto exacto donde se asigna el id. No re-describe el ciclo de vida (vive en `task-lifecycle`); solo la
  regla operativa, remitiendo a la plantilla para la definición/acotación de `<name-plan>` (evita
  duplicar la fuente de verdad fijada en -01).
- **Contar sobre el máximo en TODOS los estados** (no `count()+1`): si contaras el número de tareas,
  al cancelar/completar reusarías `<nn>` y colisionarías dentro del plan. El ejemplo (01, 02 cancelled,
  03 completed → 04) lo fija.
- **Residual explícito**: "dos ramas del mismo plan" NO se previene (lo haría el sufijo aleatorio,
  descartado por el owner). Se remite a -03 (detección en `/doctor`) y -04 (guía de equipo). Honestidad
  sobre el límite en vez de sobreventa.

**Verificación (stack `none`).** 6 escenarios Gherkin verificados por inspección + `grep`
(SKILL.md:94-100): contar dentro del plan, prohibición del contador de package, máximo en todos los
estados sin reusar + ejemplo 04, convivencia legacy, residual remitido, coherencia con
`templates/task-lifecycle.md`. **Gate `fact-checker`** (subagente fresco, inherit): **6/6 VERIFICADO**.

**Docs actualizadas.** El SKILL ES la doc técnica de la regla. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/skills/plan-task/SKILL.md` (única fuente tocada). Commit
`docs(plan-task): regla de asignación de id plan-scoped` con este task-id.

**Tiempo real.** ~25min (estimado 1h).

**Follow-ups.** -03 implementa la detección de ids duplicados en `/doctor` (la red de seguridad a la
que remite esta regla). -04 escribe la guía de equipo del README (la otra mitigación citada).
