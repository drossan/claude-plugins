# Histórico — task-pipeline-collision-free-ids-01

> Session log append-only. Registro canónico de la tarea (no duplicar en otros ficheros).

## 2026-07-23 — Arranque

- **Plan arrancado**: `collision-free-ids` movido a `.claude/plans/active/task-pipeline/`, `status: active`.
  Rama `plan/task-pipeline/collision-free-ids` creada desde `main` (`20f9582`, que ya contiene todo el
  trabajo previo del plan caveman). `git pull` falla por SSH en el sandbox (esperado); main local al día
  con `origin/main`.
- **GATE tarea -01 OK**: `depends_on: []` (sin dependencias); primera tarea del plan; ninguna otra `active`.
  Tarea movida a `.claude/tasks/active/task-pipeline/`, `status: active`.
- **Stack `none`**: TDD y gate de mutation N/A. Escenarios Gherkin = criterios de aceptación por
  inspección / `grep`.
- **Alcance estricto de -01**: SOLO plantillas semilla en `task-pipeline/skills/plan-task/templates/`
  (`task-lifecycle.md`, `task.md`, `plan.md`, `HOW-TO-START-A-TASK.md`, `README.md`). NO tocar
  `plan-task/SKILL.md` (-02) ni las copias materializadas del repo (-05).

### Plan de trabajo (pasos)

1. `task-lifecycle.md` (plantilla): redefinir `<task-id> = <plan-id>-<nn>`, regla anti-contador-global,
   acotación de `<name-plan>` (T-G), formato de `<nn>` + tope en 100, coherencia `plan:`↔`id`, nota legacy.
2. `task.md`, `plan.md`, `HOW-TO-START-A-TASK.md`, `README.md`: ejemplos e `id:` con el nuevo formato.
3. Verificar cada escenario Gherkin por inspección + `grep` (sin `<package>-<nnn>` vivo como esquema).
4. Gate `fact-checker`. Cerrar histórico, mover tarea a `completed/`, tick en el plan.

## 2026-07-23 — Cierre

**Resumen.** Redefinido el esquema de id de tarea en las 5 plantillas semilla
(`task-pipeline/skills/plan-task/templates/`): `<task-id> = <plan-id>-<nn>` con
`<plan-id> = <package>-<name-plan>` y `<nn>` correlativo DENTRO del plan desde `01`.
Añadidas la regla anti-contador-global, la acotación de `<name-plan>` (parseo inequívoco,
T-G), el formato de `<nn>` (2 díg. desde 01; 100→3 díg.), la coherencia `plan:`↔`id` y la
nota de convivencia con ids legacy (no se renumeran).

**Ficheros tocados (solo plantillas — alcance estricto de -01):**
- `templates/task-lifecycle.md`: bloque de definición de `<task-id>`/`<plan-id>`/`<name-plan>`
  reescrito; sección Tasks de la plantilla de plan (`<plan-id>-01/02`); frontmatter de la
  plantilla de tarea (`id: <plan-id>-<nn>` + comentario de coherencia).
- `templates/task.md`: frontmatter `id: <plan-id>-<nn>` + comentario `plan:` deben coincidir.
- `templates/plan.md`: sección Tasks con `<plan-id>-01/02`.
- `templates/HOW-TO-START-A-TASK.md`: placeholder `<package>-XXX` → `<task-id>` (5+ usos);
  línea "Sustituye" ampliada con la definición del esquema + nota legacy.
- `templates/README.md`: lista de placeholders (elimina `<nnn>`; añade `<plan-id>`/`<nn>` +
  regla anti-contador-global).

**Decisiones técnicas + porqué.**
- *Separador `<nn>` = últimos 2 dígitos* (no un separador especial): mínimo cambio, determinista,
  y basta con acotar `<name-plan>` sin sufijo numérico. Resuelve T-G sin inventar sintaxis.
- *Ejemplo legacy genérico `api-001`/`api-012` en la plantilla, NO `task-pipeline-001..012`*:
  el escenario de -01 parentiza `task-pipeline-001..012`, pero eso es el legacy CONCRETO de
  ESTE repo. La plantilla es **semilla genérica** materializada en repos ajenos (CLAUDE.md:
  "no impongas coste/comportamiento ahí"); meter ids de este repo en la semilla sería un defecto.
  El `task-pipeline-001..012` concreto va en la copia materializada del repo → tarea **-05**.
  El criterio de aceptación real ("nota aclara que los legacy no se renumeran y conviven") se
  cumple con el ejemplo genérico.
- *`plan.md` adopta el esquema por USO* (`<plan-id>-01/02` en Tasks) y no con definición en
  prosa: plan.md no define el esquema, lo usa. Coherente con su rol.

**Verificación corrida + resultado.** Stack `none` → TDD/mutation N/A. Los 7 escenarios Gherkin
de -01 verificados por inspección + `grep` (tabla en el histórico del hilo): esquema nuevo
presente en las 5 plantillas; `<package>-<nnn>` solo citado como "esquema anterior"/legacy
(task-lifecycle:86, HOW-TO:130); `<package>-<name-plan>` intacto como plan-id legítimo.
**Gate `fact-checker`** (subagente fresco `general-purpose`, inherit — `models.fact-checker`
comentado): **8/8 VERIFICADO**, 0 INCORRECTO, 0 NO VERIFICABLE.

**Docs actualizadas + motivo.** Las plantillas SON la doc técnica del esquema (no hay TSDoc:
stack `none`). Histórico = este fichero. No se tocó doc del repo (materializados = -05).

**Ficheros/commits.**
- `4dff0a8` — arranque del plan (plan→active + 12 tareas a la rama).
- deliverable de -01 = commit `docs(templates): id de tarea plan-scoped <plan-id>-<nn>`
  (con este task-id) — 5 plantillas + cierre de tarea + tick del plan.

**Tiempo real.** ~1h (estimado 2h).

**Follow-ups.** -02 aplica la regla de asignación en `plan-task/SKILL.md` (contar `<nn>` sobre
las tareas del plan). -05 propagará el esquema a las copias materializadas del repo, donde SÍ
va el ejemplo legacy concreto `task-pipeline-001..012`. -03 añade la detección de ids duplicados
en `/doctor`. Todos consumen el `Provides` de esta tarea (esquema + acotación de `<name-plan>`).
