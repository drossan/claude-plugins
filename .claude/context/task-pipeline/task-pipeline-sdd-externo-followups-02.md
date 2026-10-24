# Session log — task-pipeline-sdd-externo-followups-02

## 2026-10-24 — Arranque
- Gate: sin `depends_on`; rama `plan/task-pipeline/sdd-externo-followups`; ninguna otra tarea `active`; la 01 está `done`. Tarea movida a `active/`.
- Modo SDD del repo: nativo. Gherkin en el CU `sdd-proveedor-externo.md` (escenarios de diagnóstico del provider y RN-11, ya escritos al crear la tarea).
- GitHub tracking: issue #93 → Status `In progress`, label `status: in-progress`, assignee `@me` (best-effort, aplicado).

## 2026-10-24 — Implementación y verificación
- `task-pipeline/skills/doctor/SKILL.md` cat. 12: vía principal = skill visible por nombre cualificado; respaldo `~/.claude/plugins/installed_plugins.json` (formato observado y no soportado: `plugins` → clave `<plugin>@<marketplace>` → lista de entradas con `installPath`), comparación por prefijo `<plugin>@`, sin deducir entrada por `scope`/`projectPath`. Resultados y gravedad según RN-11; «no verificado» nunca «ausente»; rechazo de `..`, `/`, `\` antes de construir rutas; no corre fuera de `external` ni si apunta a `task-pipeline`.
- Decisión: sin `version` ni lista de campos del formato (escenario «El formato del respaldo se declara no soportado»).
- Verificación (ejecutada en esta sesión): inspección de la sección contra los escenarios del CU (432-523); `claude plugin validate .` → passed; `pnpm docs:build` → build complete (incluye el check de enlaces). No se ejecutó `/doctor` sobre un repo de prueba con las 15 variantes del JSON: verificación por inspección.

## Cierre
- **sdd-lint**: mecánico limpio. Semántico (Sonnet): 1 ERROR (ningún FR cubría el diagnóstico del provider) → corregido con **FR-014** en `spec.md` (FR nuevo, a diferencia de B11). AVISOS reconocidos: filas del Outline nombran detalles del formato interno; Outline de ~15 casos mezcla fronteras; `When` doble en «Reinstalar o recargar» y `Given` vago en «Doctor idempotente»; RN-11 no cita gravedad ni seguridad de ruta; falta escenario para provider sin `:`. No se reverificó sdd-lint tras añadir FR-014.
- **fact-checker** (Sonnet): 10/10 VERIFICADO.
- Ficheros: `task-pipeline/skills/doctor/SKILL.md`, `.claude/specs/task-pipeline/spec.md`. CU sin cambios (RN-11 y escenarios ya escritos al crear la tarea).
- Tiempo real: ~1h (estimado, sin cronómetro). Follow-ups: avisos de sdd-lint arriba; escenario del provider sin `:`; la 03 cierra CHANGELOG/release 0.18.5.
