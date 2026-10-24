---
id: task-pipeline-sdd-proveedor-externo-04
package: task-pipeline
plan: sdd-proveedor-externo
status: done
---
# Session log — task-pipeline-sdd-proveedor-externo-04

> Histórico append-only. Registro canónico de la tarea.

## 2026-10-24 — Arranque

- **Gate**: `depends_on` (-02) en `done` ✔; rama `plan/task-pipeline/sdd-proveedor-externo` ✔; sin otra tarea active ✔.
- Tarea movida a `active/`.
- GitHub #82 → *In progress* (Project), label `status: in-progress` + assignee.

## 2026-10-24 — Implementación y cierre

### Cambios
- `task-init/SKILL.md` Paso 1.6: `AskUserQuestion` nativo/externo/no; externo pide `provider` como texto libre (sin comprobar), lo entrecomilla, rechaza vacío/cancelar/diff rechazado sin escribir; no materializa scaffolding nativo; «ya activo» reconoce `native` y `external`; `yes` = off y se ofrece; sin canal → no escribe.
- `doctor/SKILL.md`: cat. 2 enlaza la regla de «Modo SDD» (no la repite) y `models.sdd-lint` en external no es drift; cat. 9 solo en nativo; **cat. 12 nueva** (solo-reporte): bloque sin provider + claves desconocidas, provider no instalado (plugin ausente vs skill ausente, «no verificado» si no se puede comprobar), artefactos nativos huérfanos; «Activación SDD» con las tres opciones.

### Decisiones
- La comprobación de instalación del provider es best-effort (skills visibles / `installed_plugins.json` + `installPath`); no he ejecutado doctor contra un provider real.
- Cat. 12 nueva en vez de ampliar la 9: la 9 es de presencia de plantillas, la 12 de salud del provider.

### Verificación (stack none)
- Inspección + `grep` de las skills contra los escenarios del CU. **No se ha corrido `/doctor` ni `/task-init` en un repo de prueba.**
- `sdd-lint.sh .claude/specs`: sin ERROR mecánico. Sin cambios de spec/CU.
- `fact-checker` (sonnet): 4/4 VERIFICADO. Matices: el escenario «Repo ya en external no se reofrece» solo menciona `/doctor` (task-init lo implementa igualmente); `spec.md` solo cubre esto vía FR-012 + enlace al CU.

### Follow-ups
- Valorar ampliar el escenario «ya en external» a `/task-init`.
- Tarea 05: docs/portal/release.
