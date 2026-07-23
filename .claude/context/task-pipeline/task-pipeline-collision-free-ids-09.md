# Histórico — task-pipeline-collision-free-ids-09

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Proyección de **estado de tarea** (condicional por `features.github-tracking`) tejida en el
ciclo de vida: bloque "Proyección de estado a GitHub" en "Cerrar una tarea" (tabla de mapeo
active/done/cancelled/blocked + transiciones inversas + idempotencia + degradación) y paso 5 condicional
en "Arrancar una tarea", en la **plantilla** y en el **materializado**. Nota en el HOW-TO + línea de DoD
condicional en `templates/task.md`.

**Decisiones + porqué.**
- **Bloque consolidado en "Cerrar una tarea"** (tabla única con todas las transiciones) + puntero en
  "Arrancar una tarea": evita duplicar el mapeo; el arranque solo referencia In Progress.
- **Nunca bloquear el `.md`** (C3): degradación explícita si `gh` falla / Project sin la opción → aviso.
  Flag off o sin `issue:` → local puro (idéntico al default).
- **Fuera de alcance marcado**: el cierre de la issue PADRE + concurrencia → "Cerrar un plan" (-12).
- **Fix de coherencia (a raíz del fact-checker)**: -09 hizo que el materializado
  `docs/guides/task-lifecycle.md` **use** `github-tracking` en el cuerpo, pero su tabla de features no lo
  listaba (⁠-07 solo tocó la tabla del template + SKILL). Añadida la fila `github-tracking` a la tabla
  del materializado para que no referencie un flag no documentado en su propio doc.

**Verificación (stack `none`).** 8 escenarios (incl. Scenario Outline de mapeo) por inspección + `grep` en
los 4 ficheros: bloque presente en ambos lifecycle; tabla con las 6 transiciones; idempotencia;
degradación; flag off → local puro; paso 5 de arranque; nota HOW-TO; línea DoD en task.md.
Verificación **end-to-end con GitHub en vivo = NO VERIFICABLE** reproducible en `stack:none` (reconocido).
**Gate `fact-checker`** (subagente fresco, inherit): **9/10 VERIFICADO + 1 NO VERIFICABLE**, 0 INCORRECTO.

**Docs actualizadas.** Plantilla + materializado del lifecycle, HOW-TO, DoD de task.md. Histórico = este
fichero. TSDoc N/A.

**Ficheros/commits.** `templates/task-lifecycle.md`, `docs/guides/task-lifecycle.md`,
`.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md`, `templates/task.md`. Commit `feat(lifecycle):
proyección de estado de tarea a GitHub` con este task-id.

**Tiempo real.** ~40min (estimado 2h).

**Follow-ups.**
- -12 añade el cierre de la issue PADRE + la disciplina de concurrencia en "Cerrar un plan".
- **Pre-existente (fuera de este plan)**: la tabla de features del **template** `templates/task-lifecycle.md`
  no lista `features.caveman` (gap del plan caveman 0.11.0), mientras el materializado sí. No lo toco
  (territorio de otro plan / `/doctor`); queda anotado como discrepancia menor template↔materializado.
