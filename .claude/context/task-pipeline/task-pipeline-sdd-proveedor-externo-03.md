---
id: task-pipeline-sdd-proveedor-externo-03
package: task-pipeline
plan: sdd-proveedor-externo
status: active
---
# Session log — task-pipeline-sdd-proveedor-externo-03

> Histórico append-only. Registro canónico de la tarea.

## 2026-10-24 — Arranque

- **Gate**: `depends_on` (-02) en `done` ✔; rama `plan/task-pipeline/sdd-proveedor-externo` ✔; sin otra tarea active ✔.
- Tarea movida a `active/`.
- GitHub #81 → *In progress* (Project), label `status: in-progress` + assignee.

## 2026-10-24 — Implementación y cierre

### Cambios
- `docs/guides/task-lifecycle.md` y `templates/task-lifecycle.md`: «Arrancar una tarea» paso 4b (`phase=start`, una vez por activación, relee la tarea); «Cerrar una tarea» paso 3c (`phase=close` tras `mutation`, antes de `fact-checker`/auto-commit/proyección GitHub; no se invoca si `mutation` falla; se reintenta; avisos, nunca ERROR). 3b, paso 4 y «Flujo SDD» pasan de «`features.sdd` on» a «modo nativo». Plantilla de tarea del lifecycle: `sdd-lint`/SDD solo nativo + línea nueva «SDD gestionado con `<provider>`» solo external.
- `templates/task.md`: misma línea de DoD external.
- `plan-task/SKILL.md`: Paso 7.5 describe los tres modos; Paso 8 sin «SDD on».
- Contrato y semántica (RN-3/6/7/8/9) viven en el CU; los lectores lo enlazan, no lo copian.

### Decisiones
- La plantilla enlaza al README (sección de la tarea 05) porque el CU no se materializa en repos consumidores.
- No tocado (fuera de la tarea): `plan-task/SKILL.md` líneas 47/136/153 y `README.md` líneas 51/199 aún dicen «`features.sdd` on/off» → follow-up (tarea 05 / revisión).

### Stub de verificación (no se distribuye)
Skill de prueba `stub-sdd:run` que recibe `contract=1 phase=… task=… plan=…`. Casos: (a) instalado y OK → termina sin reporte → línea DoD marcable; (b) no instalado → aviso, tarea arranca/cierra, línea sin marcar hasta nota en log; (c) con error → aviso, `status:` del `.md` no bloqueado.

### Verificación (stack none)
- Inspección + `grep`: sin «features.sdd on» en ambos lifecycles; pasos 4b/3c idénticos en guía y plantilla (solo difiere el enlace final).
- **No se ha ejecutado el stub en un repo de prueba**: los tres casos están definidos y razonados por inspección, no corridos.
- `sdd-lint`: sin cambios en spec/CU/ADR → **sin cambios de spec/CU** (el CU ya cubre estos escenarios).
- `fact-checker` (sonnet): 8/8 VERIFICADO.

### Follow-ups
- Barrer «features.sdd on/off» restante en `plan-task/SKILL.md` y README (tarea 05).
- Ejecutar el stub de verdad al validar con el primer provider real.
