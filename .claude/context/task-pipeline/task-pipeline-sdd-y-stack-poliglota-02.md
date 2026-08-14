# Session log — task-pipeline-sdd-y-stack-poliglota-02

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01]` → done ✔; en la rama del plan ✔; sin otra tarea active ✔.
- Tarea 02 movida `pending → active`.
- **Objetivo**: `/mutation` agnóstico por herramienta y por-package. Dispatch por
  `stack.packages.<pkg>.mutation-tool` (fallback top-level): `stryker` (verificado) · `mutmut` (referencia
  + banner) · escape `mutation-command` (referencia) · `none` (no-op). `cosmic-ray/cargo-mutants/gremlins`
  = solo ejemplos en docs. Nota F7a: `features.mutation-gate` NO es per-package. DoD tool-agnóstica en
  task.md + 2×lifecycle. **Solo Stryker se afirma verificado.**

## 2026-08-14 — Cierre

### Resumen
`/mutation` desacoplado de Stryker: `mutation/SKILL.md` reescrito con **Paso 0** de selección de herramienta
por `stack.packages.<pkg>.mutation-tool` (fallback top-level) + **tabla-adapter** + Paso 5 de referencia
(mutmut/`mutation-command`) con banner. DoD tool-agnóstica en las 3 sedes + prosa de "Cerrar una tarea".

### Decisiones + porqué
- **Solo Stryker sin banner**; mutmut y `mutation-command` = referencia con banner "⚠️ no verificada". Por
  qué: F2 del design-review — no shipear recetas que nadie verificó. El banner avisa de la *confianza en el
  comando*, pero un exit ≠ 0 **falla** el gate igual (no exime del resultado).
- **cosmic-ray/cargo-mutants/gremlins = solo ejemplos** (nota "otros lenguajes"), no ramas de dispatch: van
  por el escape genérico `mutation-command`; el plugin no finge conocer su CLI.
- **Prosa de "Cerrar una tarea" (paso 3) también tool-agnóstica** en ambas lifecycle — el Spec pedía "el
  checkbox", pero dejar la prosa hardcodeando Stryker rompía la coherencia de espejos. Se generalizó (dentro
  del espíritu de la tarea, no ampliación de alcance).
- **Nota F7a "mutation-gate NO es per-package"** añadida en Paso 0 de la skill + prosa de ambas lifecycle
  (reservada aquí desde la tarea 01).

### Verificación corrida + resultado
- 9 escenarios Gherkin como criterios de aceptación (grep/inspección): cumplidos. "solo Stryker verificado"
  confirmado por grep de "verificad*". cosmic-ray/cargo-mutants/gremlins solo como ejemplos. DoD espejo
  consistente (task.md ↔ 2×lifecycle). Sin identificadores muertos en la superficie nueva.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): 8/9 VERIFICADO; claim 9 **NO VERIFICABLE** (la
  config confirma `mutation-tool: none`/`test-runner: none`; "no se ejecutó ningún comando" no es probable
  por ausencia — aviso reconocido). 0 INCORRECTO → pasa.
- Stack `none`: ninguna herramienta de mutation corrida (todo referencia por inspección).

### Regresión detectada y corregida (de la tarea 01)
- Al crear `## [Unreleased]` en la tarea 01 se había **eliminado el header `## [0.14.0] — 2026-08-10`**,
  dejando el contenido de 0.14.0 huérfano bajo Unreleased. **Restaurado** en esta tarea (header reinsertado
  antes de "Realineación con... Opus 5"). El `fact-checker` de la tarea 01 no lo detectó porque no se le dio
  esa afirmación a verificar; el de la tarea 02 (claim 8b) lo confirma corregido.

### Docs actualizadas + motivo
- `task-pipeline/skills/mutation/SKILL.md` — reescritura del dispatch por herramienta.
- `templates/task.md`, `templates/task-lifecycle.md`, `docs/guides/task-lifecycle.md` — DoD + prosa tool-agnósticas.
- `task-pipeline/CHANGELOG.md` — `### Added` (/mutation) + `### Changed` (DoD) + fix del header 0.14.0.

### Ficheros / commits · tiempo · follow-ups
- 5 ficheros de contenido + arranque/cierre. Commit en la rama del plan con id de tarea.
- Estimado 3h · real ~1h (aprox).
- GitHub: #39 → In progress (arranque) → Done/close (cierre); padre #37 sigue In progress.
- Follow-up: tarea 03 (`/task-init`) también lee `stack.packages`; consume este contrato.
