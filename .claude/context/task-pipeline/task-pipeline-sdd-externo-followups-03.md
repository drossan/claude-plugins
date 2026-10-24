# Session log — task-pipeline-sdd-externo-followups-03

## 2026-10-24 — Arranque
- Gate: `depends_on` 01 y 02 en `done`; rama `plan/task-pipeline/sdd-externo-followups`; ninguna otra tarea `active`. Tarea movida a `active/`.
- Modo SDD nativo. Gherkin en el CU `sdd-proveedor-externo.md` (escenarios de repetición de `phase=close`, riesgo 4 y release 0.18.5, ya escritos).

## 2026-10-24 — Implementación y verificación
- README: riesgo 4 reducido a «rige igual para `start` que para `close`» (la intro ya dice «ni en la primera ni en las siguientes»); etiqueta intacta, siguen siendo 4 riesgos.
- CU: eliminados los escenarios «Cierre repetido tras un fallo», «Cierre tras una reapertura» y «Reintento de phase=close»; queda el `Scenario Outline` «Repetición de phase=close…». Paso 3c del lifecycle y session logs históricos sin tocar.
- Release: `plugin.json` 0.18.5; CHANGELOG 0.18.5 (B12 + FR-014, riesgo 4; B11 como nota de `website/`). `grep idéntic` sobre la entrada 0.18.5: 0. `description` de plugin y marketplace no citan versión.
- Verificación (ejecutada en esta sesión): `claude plugin validate .` → passed; `cd website && pnpm docs:build` → build complete; barrido grep de ids muertos solo encuentra la atribución en `grilling/SKILL.md` (allowlist).

## Cierre
- **sdd-lint**: mecánico limpio (sin ERROR). Semántico: sin ERROR; AVISOS reconocidos: escenarios de meta-verificación de edición (no declarativos del producto), el último escenario de release mezcla varios comportamientos, y en el Outline la invocación pasó de Then a When (sin pérdida real).
- **fact-checker**: 9/9 VERIFICADO (la comprobación de que el check de enlaces corre dentro de `docs:build` se apoya en el CHANGELOG/log de la 01, no se vio en la salida).
- Ficheros: `task-pipeline/README.md`, `task-pipeline/CHANGELOG.md`, `task-pipeline/.claude-plugin/plugin.json`, `.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md`.
- Tiempo real: ~0.5h (estimado, sin cronómetro). Follow-ups: workflow de CI en PRs para el check de enlaces; escenario del provider sin `:` (de la 02).
