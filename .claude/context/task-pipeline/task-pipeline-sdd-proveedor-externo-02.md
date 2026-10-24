---
id: task-pipeline-sdd-proveedor-externo-02
package: task-pipeline
plan: sdd-proveedor-externo
status: active
---
# Session log — task-pipeline-sdd-proveedor-externo-02

> Histórico append-only. Registro canónico de la tarea.

## 2026-10-24 — Arranque

- **Gate**: `depends_on` (-01) en `done` ✔; rama `plan/task-pipeline/sdd-proveedor-externo` ✔; sin otra tarea active ✔.
- Tarea movida a `active/`; GitHub #80 → *In progress* (Project), label `status: in-progress` + assignee.

## 2026-10-24 — Implementación y cierre

### Cambios
- `mutation`, `scenario-coverage`: siguen el enlace al CU **en cualquier modo**; sin enlace, Gherkin inline. Sin «features.sdd on/off».
- `sdd-lint`: gate automático no-op en `off` y `external`; `/sdd-lint` manual audita y avisa (SDD off / lo gestiona el provider); `models.sdd-lint` sin efecto en `external`, sin aviso de drift. Description y textos pasan a «modo nativo».
- `templates/task.md`, `templates/caso-de-uso.md`: «modo nativo (`sdd: true`)»; task.md indica que las líneas de DoD de otro modo no aplican.
- Todos enlazan a «Modo SDD» del lifecycle; ninguno copia la tabla de modos. Lifecycle, README de templates y `doctor`/`task-init` quedan para tareas 03/04/05.

### Verificación (stack none)
- `grep`: sin «features.sdd on/off/ON/OFF» en los 5 ficheros; sin ids muertos.
- No se ha corrido la skill en un repo de prueba (cambios de redacción).
- `sdd-lint`: no se tocaron spec/CU/ADR → sin artefactos que validar. **Sin cambios de spec/CU** (declarado).
- `fact-checker` (sonnet): 7/7 VERIFICADO. Matiz: `caso-de-uso.md` conserva `features.sdd: true` como valor que activa nativo.

### Follow-ups
- Tarea 03: lifecycle (pasos 3b/Flujo SDD aún dicen «features.sdd on») y invocación del provider; `templates/README.md` y `task-lifecycle.md` plantilla.
