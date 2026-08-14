# Session log — task-pipeline-sdd-y-stack-poliglota-10

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: []` ✔; rama del plan ✔; sin otra tarea active ✔.
- Tarea 10 movida `pending → active`; GitHub #48 → In progress.
- **Objetivo**: schema (solo doc) de `features.conventional-commits` (default ON) + bloque
  `features.git-automation` { auto-commit, auto-pr (plan-close), co-author (default false) } (opt-in, fuera
  de preset, fail-safe, ausencia ≠ drift) en todas las sedes + portal + CHANGELOG. Comportamiento = tarea 11.

## 2026-08-14 — Cierre

### Resumen
Schema (solo doc) de `features.conventional-commits` (default ON) + bloque `features.git-automation`
{ auto-commit, auto-pr (plan-close, requiere auto-commit), co-author (default false) } en las 5 sedes +
sección `## Git automation (opcional)` en README + `website/features/git-automation.md` (sidebar) + CHANGELOG.

### Decisiones + porqué
- **conventional-commits default ON** (dentro de preset): NO es opt-in silencioso — su ausencia = ON, no
  cambia el comportamiento histórico. Distinto de git-automation (opt-in default off).
- **co-author bajo git-automation** (default false): gobierna solo los commits de la AUTOMATIZACIÓN; los
  manuales los rige el `CLAUDE.md` del repo (coherente con la decisión del owner: configurable por flag).
- **auto-pr requiere auto-commit**: sin commit no hay nada que PR-ear → inerte + aviso.

### Verificación corrida + resultado
- 7 escenarios Gherkin como criterios de aceptación (grep/inspección): cumplidos. Flags en las 5 sedes +
  portal; espejos README↔2×lifecycle consistentes.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **8/8 VERIFICADO**, 0 INCORRECTO.

### Incidencia (bug propio, corregido en la sesión)
- El one-liner de python del arranque (`open(p,"w").write(open(p).read()...)`) **truncó el fichero de la
  tarea 10 a vacío** (orden de evaluación: `open(p,"w")` trunca antes de leer). Detectado al ir a ticar la
  DoD. **Reconstruido** el fichero íntegro con el estado de cierre. Aprendizaje: usar dos sentencias (leer a
  variable, luego escribir) o la tool Edit — nunca ese one-liner.

### Docs actualizadas · ficheros · tiempo · follow-ups
- seed YAML, README (fila + sección), 2×lifecycle (filas), plan-task/SKILL.md, website/features/git-automation.md,
  config.mts, CHANGELOG.
- Estimado 2h · real ~40m. GitHub: #48 In progress → Done/close.
- **Follow-up NUEVO (petición del owner)**: falta un **gate de validación de formato/completitud SDD**
  (EARS válido, estados MADR coherentes, `[NECESITA ACLARACIÓN]` resueltos, trazabilidad FR↔CU↔escenario,
  CUs sin huérfanos) al escribir/cerrar los artefactos. Registrado como plan-stub `sdd-validation-gate`.
  Se analiza al terminar la extensión.
- Siguiente: tarea 11 (cableado del comportamiento).
