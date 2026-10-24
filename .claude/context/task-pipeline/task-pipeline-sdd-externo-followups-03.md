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

## 2026-10-24 — Code review del plan (Opus) y correcciones
- Review sobre `main...plan/...`: 1 bug real + 8 menores. Decisión del owner: arreglar #1, #9, #7 y #8; el resto, follow-ups.
- #1 (`check-github-links.mjs`): la guarda de entrada comparaba `argv[1]` con la ruta real, así que por ruta absoluta con symlink el script salía 0 sin ejecutar. Ahora compara con `realpathSync` en ambos lados; verificado: por un symlink ahora imprime `OK — 25 enlaces…`.
- #9: el CHANGELOG 0.18.5 cita B12 (y B11 en la nota del portal). #7: `doctor` cat. 12 ignora entradas sin `installPath` string (solo «no verificado» si no queda otra), provider sin `:` → «no verificado» (fila nueva en el Outline del CU). #8: «drift» es etiqueta de gravedad; cat. 12 no ofrece fix en la Fase 2.
- Re-verificado: `claude plugin validate .` passed; `pnpm docs:build` → check OK (25 enlaces) + build complete.
- Follow-ups abiertos (review #2–#6, #10): slug con `<…>` dentro de backticks, fence con info string con backticks, URLs con énfasis o `#user-content-`, parseo de `srcExclude`/globs, validación contra disco y no contra git, aviso Node < 12.
