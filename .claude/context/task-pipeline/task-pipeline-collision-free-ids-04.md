# Histórico — task-pipeline-collision-free-ids-04

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Añadida al `task-pipeline/README.md` la sección "Trabajo en equipo y colisiones de id"
(esquema plan-scoped + porqué + disciplina rama=plan + residual + procedimiento de resolución + cómo se
ve en git) y enlazada desde `docs/guides/task-lifecycle.md` (materializado) sin duplicar el contenido.

**Decisiones + porqué.**
- **La guía vive en el README del plugin** (fuente única) y el flujo la **enlaza** — evita duplicar y
  mantiene una sola fuente de verdad (coherente con la nota del plan: el flujo vive en task-lifecycle +
  README, no en un doc aparte).
- **Procedimiento de resolución explícito** (no solo "doctor lo detecta"): renumerar el `<nn>` más nuevo
  O renombrar el `<name-plan>`, + actualizar `depends_on`/enlaces + renombrar fichero y session log.
  Sin esto la detección de -03 dejaría al humano sin saber qué hacer.
- **Honestidad sobre git**: se explicita el cambio add/add silencioso → 1 conflicto evidente, para que el
  equipo reconozca la colisión (coherente con honesty-rules: no sobrevender).

**Verificación (stack `none`).** 5 escenarios verificados por inspección + `grep` (README:48-71;
task-lifecycle:206-210). Ancla del enlace (`#trabajo-en-equipo-y-colisiones-de-id`) = slug del encabezado
real (match exacto); ruta relativa `../../task-pipeline/README.md` resuelve (`test -f` OK).
**Gate `fact-checker`** (subagente fresco, inherit): **6/6 VERIFICADO**.

**Docs actualizadas.** README del plugin (doc de usuario/técnica) + enlace en el flujo. Histórico = este
fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/README.md`, `docs/guides/task-lifecycle.md`. Commit
`docs: guía de trabajo en equipo / colisiones` con este task-id.

**Tiempo real.** ~25min (estimado 1h).

**Follow-ups.** -05 alinea el ESQUEMA de id en `docs/guides/task-lifecycle.md` (esta tarea solo añadió el
enlace, no tocó la definición del id ahí). -11 añadirá el enlace/doc de la integración GitHub (D2).
