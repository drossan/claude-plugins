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
