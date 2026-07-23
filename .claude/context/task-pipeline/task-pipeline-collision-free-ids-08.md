# Histórico — task-pipeline-collision-free-ids-08

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Tejida en `plan-task/SKILL.md` la proyección md→GitHub como **Paso 5.7** (condicional por
`features.github-tracking`): resolver `repo`, label/issue-type, plan→issue PADRE, tarea→SUB-ISSUE con
`--parent`, escritura de `issue:`, idempotencia, títulos adversarios, degradación best-effort y fronteras
de tamaño. One-way (`.md` = verdad).

**Decisiones + porqué.**
- **Agrupado en un Paso 5.7** (no disperso): corre cuando el set de tareas es definitivo (tras 5.5); un
  único bloque condicional es más mantenible y deja sitio claro a -12 (concurrencia/plan-close) para
  extenderlo. Marcado explícitamente qué queda **fuera de alcance** (estado de tarea -09, plan/concurrencia
  -12, reconciliación -10) por concepto.
- **Nunca abortar la materialización del `.md`** (I1/C3): la proyección es best-effort; todo fallo → aviso
  + continúa. Coherente con "el `.md` manda".
- **Exactly-once declarado como límite** (no prometido): honestidad (honesty-rules) sobre la ventana
  crash-entre-crear-y-escribir; se minimiza escribiendo `issue:` inmediatamente y se remite a `/doctor`.
- **Si el padre falla → no sub-issues sueltas**: evita huérfanas desde el minuto cero.

**Verificación (stack `none`).** 10 escenarios (incl. 2 Scenario Outline: degradación por modo de fallo,
fronteras 0/100/101) verificados por **inspección** del SKILL (Paso 5.7, líneas 120-138). La verificación
**end-to-end con GitHub en vivo** (crear issues reales) es **NO VERIFICABLE** de forma reproducible en
`stack:none` (repo en vivo, manual) — reconocido explícitamente (T-K del plan y DoD de -08).
**Gate `fact-checker`** (subagente fresco, inherit): **10/11 VERIFICADO + 1 NO VERIFICABLE** (GitHub en
vivo), 0 INCORRECTO. Matiz del verificador: el SKILL nombra los fuera-de-alcance por concepto, no por id
`-09/-12/-10` (los ids son mapeo del enunciado; el fondo coincide) — aceptado.

**Docs actualizadas.** El SKILL ES la doc técnica de la proyección (la doc de usuario es -11).
Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/skills/plan-task/SKILL.md`. Commit `feat(plan-task): proyección
md→GitHub condicional (Paso 5.7)` con este task-id.

**Tiempo real.** ~40min (estimado 3h).

**Follow-ups.** -09 (proyección de estado de tarea en el ciclo de vida), -12 (cierre issue padre +
no-duplicación en concurrencia, extiende este Paso 5.7), -10 (reconciliación en `/doctor`), -11 (doc de
usuario). La verificación en vivo queda como comprobación manual del owner en un repo GitHub real.
