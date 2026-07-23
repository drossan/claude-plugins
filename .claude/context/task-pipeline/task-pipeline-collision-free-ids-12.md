# Histórico — task-pipeline-collision-free-ids-12

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Cerrado el bucle de estado de D2 en el nivel del PLAN:
- **T-A** — cierre de la **issue PADRE** al completar el plan (paso condicional en "Cerrar un plan" de la
  plantilla + materializado; GitHub no la auto-cierra; best-effort, no bloquea el cierre del plan).
- **T-B** — disciplina de **proyección concurrente** en `plan-task/SKILL.md` Paso 5.7 (reutilizar el
  `issue:` existente; límite conocido "dos ramas frescas del mismo plan" no prevenido en duro).
- Nota en el HOW-TO sobre el cierre del padre al completar el plan.

**Decisiones + porqué.**
- **T-A separado del cierre de tarea** (-09): el padre necesita cierre explícito porque GitHub no
  propaga el cierre de sub-issues → hecho verificado del plan. Best-effort para no bloquear el flujo local.
- **T-B como límite honesto, no prevención**: es el residual "mismo plan, dos ramas" extendido a la
  proyección; se reutiliza el `issue:` si existe, pero dos ramas frescas en paralelo no se pueden prevenir
  sin coordinación. Se remite a `/doctor` (-10) y a la doc (-11). Coherente con honesty-rules.
- **Alcance estricto**: no re-describo el mapeo de estado de tarea (-09) ni la reconciliación (-10);
  solo plan-level close + no-duplicación del padre.

**Verificación (stack `none`).** 5 escenarios por inspección + `grep`: T-A en ambos lifecycle
(templates:331-333, docs:318-320) + HOW-TO:63-64; T-B en SKILL:136; flag off → local puro (por el gating
condicional). Verificación **con GitHub en vivo = NO VERIFICABLE** reproducible en `stack:none`
(reconocido, T-K). **Gate `fact-checker`** (subagente fresco, inherit): **8/8 VERIFICADO**, 0 INCORRECTO;
matices honestos: "local puro" a nivel plan se deriva del gating (textual), y el comportamiento GitHub en
vivo es NO VERIFICABLE.

**Docs actualizadas.** Plantilla + materializado del lifecycle ("Cerrar un plan"), SKILL (Paso 5.7),
HOW-TO. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/skills/plan-task/SKILL.md`,
`task-pipeline/skills/plan-task/templates/task-lifecycle.md`, `docs/guides/task-lifecycle.md`,
`.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md`. Commit `feat(lifecycle): ciclo de vida del plan en
GitHub (cierre padre + concurrencia)` con este task-id.

**Tiempo real.** ~35min (estimado 2h).

**Follow-ups.** -10 detecta el padre huérfano/duplicado + reconciliación en `/doctor` (consume el cierre
del padre y la regla de no-duplicación). -11 documenta el límite de concurrencia para el usuario.
