# Session log — task-pipeline-sdd-y-stack-poliglota-05

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [04]` → done ✔; rama del plan ✔; sin otra tarea active ✔.
- Tarea 05 movida `pending → active`; GitHub #42 → In progress.
- **Objetivo**: flag booleano opt-in `features.sdd` (default off, fuera de preset, ausencia ≠ drift,
  fail-safe solo `true`) en TODAS las sedes del schema: YAML seed (comentado), tabla de flags README + sección
  `## SDD nativo (opcional)`, 2×lifecycle, contrato `plan-task/SKILL.md`, portal (`website/features/sdd.md` +
  sidebar `config.mts`), CHANGELOG. El flujo/DoD es la tarea 06.

## 2026-08-14 — Cierre

### Resumen
Flag booleano `features.sdd` (opt-in, default off) añadido en las 6 sedes del schema + sección
`## SDD nativo (opcional)` en README + página de portal `website/features/sdd.md` registrada en el sidebar.
Patrón idéntico a `caveman`/`github-tracking`: fuera de preset, fail-safe, ausencia ≠ drift.

### Decisiones + porqué
- **Booleano, no bloque** (F5 del design-review): al cortar el sitio VitePress no hay sub-toggle `.site`
  que justifique la forma-bloque; añadir `.site` luego sería aditivo. La forma-bloque `{ enabled: true }`
  se documenta como **valor no-canónico → off** (sin error de parseo) — cubre el escenario 5.
- **Sección README solo del flag**: el flujo imperativo (Gherkin↔CU, DoD gated) lo añade la tarea 06 como
  append a la misma sección — por eso no dejé forward-reference a doc de flujo que aún no existe.
- **Build de `website/` no corrido**: `website/` tiene su propio toolchain pnpm; el `pnpm docs:build` de
  verificación lo posee la tarea 08 (release, "sidebar nav final" + e2e). Aquí verificado por inspección
  (array del sidebar sintácticamente válido; página existe).

### Verificación corrida + resultado
- 6 escenarios Gherkin como criterios de aceptación (grep/inspección): cumplidos. Flag en las 6 sedes;
  fail-safe + forma-bloque→off documentados; portal registrado; espejos README↔2×lifecycle consistentes.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **8/8 VERIFICADO**, 0 INCORRECTO. Confirma las 6
  sedes, fail-safe, forma-bloque→off sin error, portal registrado, espejos coherentes, sin identificadores
  muertos en la superficie nueva.

### Docs actualizadas + motivo
- `templates/task-pipeline.yml` (seed comentado), `README.md` (fila + sección), `templates/task-lifecycle.md`
  + `docs/guides/task-lifecycle.md` (filas), `plan-task/SKILL.md` (contrato), `website/features/sdd.md` +
  `website/.vitepress/config.mts` (portal), `CHANGELOG.md` (### Added).

### Ficheros / commits · tiempo · follow-ups
- 8 ficheros de contenido + arranque/cierre. Commit en la rama del plan.
- Estimado 2h · real ~40m.
- GitHub: #42 In progress → Done/close; padre #37 sigue In progress.
- Follow-up: tarea 06 (flujo SDD imperativo + línea de DoD gated, `depends_on: 04, 05`) cablea la interacción
  Gherkin↔CU y añade el flujo a la sección "SDD nativo".
