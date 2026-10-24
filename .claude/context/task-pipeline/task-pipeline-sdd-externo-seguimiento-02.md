# Session log — task-pipeline-sdd-externo-seguimiento-02

## 2026-10-24 — Arranque
- Gate: `depends_on` (01) en `done`; rama `plan/task-pipeline/sdd-externo-seguimiento`; plan `active`; ninguna otra tarea `active`. Tarea movida a `active/`.
- Modo SDD del repo: nativo (`sdd: true`); no hay provider `external`, así que `phase=start` no aplica aquí.

## 2026-10-24 — Implementación
- **B4 (bidireccional)**: nota visible «Líneas de DoD de otro modo SDD» en la DoD de `docs/guides/task-lifecycle.md` y su plantilla (nativo→external y external→nativo); la frase sale del comentario HTML de `templates/task.md`, que ahora solo apunta a la nota.
- **B7**: paso 3c del lifecycle (repo + plantilla): `phase=close` se invoca al llegar al hueco; no si falla tests, lint/typecheck o `mutation` activo; sin gate de mutation sigue a lint/tests; la reapertura `done → active` lo repite. CU: RN-6/RN-7 reescritas y eliminado el escenario suelto «Mutation fallida…» (queda la fila del Outline de pasos previos).
- **B6**: línea `provider phase=close: <resultado>` (`ok|aviso|ausente|error`) en el session log; `fact-checker` comprueba la última, autodeclarada; sin ella `NO VERIFICABLE`. Recogido en `fact-checker/SKILL.md`, paso 4 del lifecycle (repo + plantilla), Paso 8 de `plan-task/SKILL.md` y la DoD (lifecycle + `task.md`).
- **B8**: `phase=start`/`phase=close` y modo `external` en ambos `HOW-TO-START-A-TASK.md`.
- **Release 0.18.4**: `plugin.json` + CHANGELOG (incluye «Known gaps» de lifecycles 0.18.0–0.18.3). `FR-013` ya estaba (tarea 01).
- Decisión: lo que cambia en la plantilla de tarea y el lifecycle se aplicó con la misma sustitución a ambos ficheros para mantenerlos sincronizados.

## Verificación (ejecutada en esta sesión)
- `claude plugin validate .` → Validation passed. `cd website && pnpm docs:build` → build complete. `bash -n hooks/bootstrap.sh` OK.
- `diff` de 4b entre lifecycle y plantilla: idénticos; 3c, DoD external y nota de otro modo: iguales.
- Barrido «idéntic»: la entrada 0.18.4 no lo contiene; quedan solo las menciones no-SDD ya registradas en la 01 y entradas históricas ≤0.18.3. Barrido de ids muertos: solo allowlist.

## Cierre
- **sdd-lint**: mecánico limpio. Semántico (Sonnet): 0 ERROR; AVISOS reconocidos: FR-013 compuesto (podría partirse en 013a/b/c); escenarios de meta-verificación documental del CU con varias aserciones y jerga «B6»; solape entre «Cierre repetido…», «Cierre tras una reapertura» y «Reintento de phase=close»; FR sin regla propia para el reintento/reapertura ni para «problema del provider = aviso» (viven en RN-7/4a); «Cierre limpio con provider OK» no cita el rastro.
- **fact-checker** (Sonnet): 12/12 VERIFICADO (con matiz: ids muertos también aparecen en históricos append-only de `.claude/tasks|context|plans/completed/`, que narran el rename y no son identificadores vivos).
- SDD: sin cambios de spec más allá del CU (RN-6/RN-7); `spec.md` no cambia (FR-013 vino en la 01).
- Ficheros: lifecycle (repo + plantilla), `templates/task.md`, `fact-checker/SKILL.md`, `plan-task/SKILL.md`, ambos HOW-TO, CU, `plugin.json`, CHANGELOG.
- Tiempo real: ~1h (estimado, sin cronómetro). Follow-ups: B11, B12; detección de lifecycles 0.18.0–0.18.3 (hueco aceptado).
