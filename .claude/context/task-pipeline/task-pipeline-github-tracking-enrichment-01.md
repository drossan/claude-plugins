# Histórico — task-pipeline-github-tracking-enrichment-01

## 2026-07-23 — Arranque

- Plan `github-tracking-enrichment` activado; rama `plan/task-pipeline/github-tracking-enrichment` creada desde `main`.
- Tarea 01 → `active`. `depends_on: []` (sin dependencias). Issue proyectada: #20 (sub-issue de #19).
- **Objetivo**: enriquecer la proyección al crear (Paso 5.7 de `task-pipeline/skills/plan-task/SKILL.md`):
  body completo del `.md` sin frontmatter + banner de espejo + link; label `pkg:<package>` (crear si falta,
  "ya existe"≠fallo, sanea/degrada); alta en el Project con Status `Backlog`; sin `--type`; `depends_on` no se
  proyecta; re-vuelco de body en re-proyección explícita; límite de tamaño de body (truncar+link).
- **Stack `none`**: TDD/mutation = N/A. Verificación = inspección + correr la proyección contra el repo real
  (issues #19–24 ya existen como banco de pruebas; el write al Project ya se verificó con spike en #17).
- Plan de pasos: (1) reescribir Paso 5.7 del SKILL con los sub-pasos nuevos; (2) verificar por inspección y con
  una proyección de prueba (p.ej. añadir #20 al Project con Status Backlog + label pkg como dogfood); (3)
  fact-checker; (4) cerrar histórico + mover a completed + tick en el plan.

## 2026-07-23 — Implementación + verificación

- **Editado** `task-pipeline/skills/plan-task/SKILL.md` — Paso 5.7 reescrito a 9 sub-pasos: (2) body con
  `--body-file`, cuerpo completo sin frontmatter (solo el primer bloque `---…---`, preserva `---` internos) +
  banner de espejo + link + truncado si supera ~65536; (3) labels `pkg:<package>` en padre y sub-issues +
  `plan` solo en el padre, "ya existe"≠fallo, sanea/degrada, **sin `--type`**; (4) alta en el Project
  (`item-add` + Status `Backlog`, opción por nombre case-insensitive, salta+avisa si falla/ya-está); (5) padre;
  (6) sub-issues `--parent`; (7) re-proyección explícita **re-vuelca el body** con `gh issue edit --body-file`;
  (8) títulos adversarios (comillas simples ante backticks/`$`); (9) `depends_on` no se proyecta. Referencias de
  paso en las notas exactly-once/concurrencia actualizadas (paso 4→6, 3→5).
- **Verificación end-to-end (stack `none` → correr la proyección real; TDD/mutation N/A):**
  - `gh label create pkg:task-pipeline` OK; aplicada a #19–24 (`--add-label`) OK.
  - `gh project item-add` de #19–24 al Project 2 + `item-edit` Status `Backlog` → **6/6 OK** (write al Project ya
    verificado con spike en #17 durante design-review).
  - Body de #20 re-vuelto con `gh issue edit --body-file`: banner presente, frontmatter eliminado (grep sin
    `priority:`/`issue:`), cuerpo íntegro. Confirmado leyendo el body remoto (`gh issue view 20 --json body`).
  - Escenarios de degradación/adversarios/límite-de-tamaño verificados **por inspección** de las instrucciones.
- **Barrido `grep` de cierre**: sin identificadores muertos vivos (`grill-me`/`skills/task/`/`/task` comando);
  los matches de `templates/task.md` y `.claude/tasks/` son legítimos (allowlist estructural).
- **Decisión de scope**: README/lifecycle siguen describiendo la proyección vieja → es correcto, lo actualizan
  las tareas 02 (lifecycle) y 04 (docs). Task 01 = solo Paso 5.7.
- Ficheros: `task-pipeline/skills/plan-task/SKILL.md`. Efecto lateral remoto: #19–24 enriquecidas (label+Project+#20 body).

## 2026-07-23 — Cierre

- **Gate `fact-checker`** (subagente independiente): A1 (Paso 5.7 con 9 sub-pasos), A2 (proyección enriquecida
  end-to-end en #19–24), A3 (grep sin identificadores muertos), A4 (stack `none` → TDD/mutation N/A) → **todas
  VERIFICADAS**; 0 INCORRECTO, 0 NO VERIFICABLE.
- **Proyección de estado al cerrar** (best-effort, lógica actual): #20 → Project Status `Done` + `gh issue close`
  (state=CLOSED confirmado).
- **DoD**: Spec ✓ · escenarios verificados (inspección + proyección real) ✓ · fact-checker ✓ · doc técnica
  (SKILL.md) + histórico ✓ · grep ✓. TDD/mutation = N/A (stack `none`).
- **Tiempo real**: ~2h. **Follow-ups**: README/lifecycle aún describen la proyección vieja → tareas 02 y 04.
- Tarea → `done`, movida a `completed/`. Siguiente recomendada: **02** (`#21`, depends_on: 01 ✓).
- Pendiente de commit (no lo pide el usuario explícitamente aún): `task-pipeline-github-tracking-enrichment-01: feat(plan-task) — Paso 5.7 enriquecido`.
