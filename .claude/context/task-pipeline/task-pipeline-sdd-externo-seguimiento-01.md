# Session log — task-pipeline-sdd-externo-seguimiento-01

## 2026-10-24 — Arranque
- Plan movido a `active/`, rama `plan/task-pipeline/sdd-externo-seguimiento` creada desde `main` (los ficheros sin commitear viajaron). Tarea movida a `active/`. Sin `depends_on`.
- Modo SDD del repo: nativo (`sdd: true`); no hay provider `external`.

## 2026-10-24 — Implementación
- **M5**: `task-pipeline/README.md` («SDD: nativo o externo (opcional)», heading intacto) sustituye el bullet «Riesgo de seguridad conocido» por los 4 riesgos (auto-commit/auto-pr sin revisión; reescritura de la tarea en `phase=start` **marcada como hipótesis no reproducida**; identificador único/rechazo de skills propias respetados por el modelo; sin confirmación en **ninguna** invocación) + consejo de revisar `features.sdd` y `features.git-automation` del `task-pipeline.yml` ajeno y no usar auto-commit/auto-pr con providers no fiables. Se corrige «sin confirmación en la primera invocación».
- **Portal** (`website/features/sdd.md`): una línea de resumen + enlace al README; sin lista de riesgos ni mención a inyección.
- **B3**: «idéntico/byte-idéntico/intacto/exactamente igual» de SDD → «equivalente en comportamiento» con salvedad (enlace a CU; en nativo, línea de DoD de `external` y cat. 13 de `/doctor`) en: README (nativo), lifecycle repo + plantilla, `templates/task-pipeline.yml`, `sdd-lint/SKILL.md`, portal `sdd.md`, y el CU (interesados, extensión 1a, escenario «El modo nativo no cambia»).
- **Registrado como fuera del barrido (no SDD, se dejan)**: README:414 y `website/features/git-automation.md:40` (git-automation), `docs/honestidad-no-es-sobre-verificacion.md` (honestidad), `doctor/SKILL.md:322` («deja el fichero intacto»). CHANGELOG ≤ 0.18.3 no se toca.
- Decisión: el caso externo→nativo no se toca aquí (lo cubre la tarea 02).

## Verificación
- `claude plugin validate .` → Validation passed. `cd website && pnpm docs:build` → build complete (ejecutados en esta sesión).
- `grep` de barrido tras los cambios: solo quedan las menciones no-SDD listadas arriba y las que describen el propio barrido en el CU.
- Barrido de ids muertos (`grill-me`, `skills/task/`): solo allowlist (atribución).
- `sdd-lint` mecánico: sin `[NECESITA ACLARACIÓN`, ids bien formados, sin duplicados, secciones CU presentes.

## Cierre
- **sdd-lint**: mecánico limpio (re-comprobado tras FR-013). Semántico (Sonnet): 1 ERROR — el CU exige un FR de `phase=close` ausente en `spec.md`; el owner decidió **añadirlo ahora** → FR-013 en `.claude/specs/task-pipeline/spec.md` (lifecycle/skills siguen en la tarea 02). **No re-ejecuté el subagente semántico** tras añadirlo. 8 AVISOS reconocidos (escenarios de documentación del CU poco comportamentales; «El modo nativo no cambia» mezcla salvedades; solape con el escenario del barrido final; detalle operativo en un `Given`; `Examples` de phase=close agrupa lint/typecheck; spec sin FR para RN-3…RN-9 salvo el nuevo; RN-4 vs `models.sdd-lint` sin aviso de drift).
- **fact-checker** (Sonnet): 8/8 VERIFICADO (validate, docs:build, README, portal, barrido, lifecycle×2, FR-013, ids muertos).
- Ficheros: README, portal `sdd.md`, lifecycle (repo+plantilla), `templates/task-pipeline.yml`, `sdd-lint/SKILL.md`, CU, `spec.md`.
- Tiempo real: ~1h. Follow-ups: el resto de B4/B6/B7/B8 y release 0.18.4 → tarea 02.

## 2026-10-24 — Nota posterior (code review del plan, tarea 02)
- El code review señaló que el `[x]` de `sdd-lint` se marcó sin re-ejecutar el semántico tras añadir FR-013. Se **re-ejecutó** en la sesión de la tarea 02 (Sonnet, sobre `spec.md` con FR-013 y el CU): **0 ERROR**, solo avisos (FR-013 compuesto, escenarios documentales con varias aserciones, solape de escenarios de reintento). La casilla queda respaldada a posteriori; no estaba respaldada en el cierre de esta tarea.
