# Session log — task-pipeline-sdd-y-stack-poliglota-01

> Histórico append-only. Registro canónico de la tarea. No duplicar en otros sitios.

## 2026-08-14 — Arranque

- **Gate verificado**: `depends_on: []` (sin dependencias) ✔; sin otra tarea/plan `active` ✔;
  `main` en sync con `origin/main` ✔.
- **Arranque del plan** (primera tarea del plan): plan `sdd-y-stack-poliglota` movido `pending → active`
  (`status: active`); rama `plan/task-pipeline/sdd-y-stack-poliglota` cortada desde `main`.
- **Arranque de la tarea 01**: movida `pending → active` (`status: active`); resto de tareas (02–08)
  siguen en `pending`.
- **Objetivo**: schema `stack.packages.<pkg>` (override map) + regla de resolución **canónica en README**
  (por-clave `stack.packages.<pkg>.<k>` → `stack.<k>` → preset; herencia parcial) + punteros en sedes
  espejo (YAML seed comentado, repo config, 2×lifecycle, contrato `plan-task/SKILL.md`) + entrada CHANGELOG.
  Stack `none`: escenarios Gherkin = criterios de aceptación por inspección/grep.

## 2026-08-14 — Cierre

### Resumen
Schema `stack.packages.<pkg>` (override map de stack por-workspace) documentado como **contrato**:
regla de resolución **canónica en una sola sede** (README) + punteros en las sedes espejo + entrada
CHANGELOG. **Solo schema/contrato**; los lectores (`/mutation` 02, `/task-init` 03, `/doctor` 07) son
tareas siguientes (fuera de alcance aquí).

### Decisiones + porqué
- **Regla de resolución enunciada solo en README** ("Configuración por repo" → nueva sub-sección
  **"Stack por-package"**), con la cadena literal `stack.packages.<pkg>.<k>` → `stack.<k>` → default del
  preset. **Por qué**: F4 del design-review — no replicar prosa sutil en 8 sitios; las demás sedes apuntan.
- **CHANGELOG suavizado**: la primera redacción reenunciaba la cadena de flechas → contradecía el
  escenario S2 ("enunciada entera solo en README"). Se reescribió para describir la feature y **apuntar**
  al README, sin repetir la regla.
- **Nota "mutation-gate NO es per-package" NO añadida aquí**: el plan la asigna a la **tarea 02** (F7a).
  Se retiró del README para no invadir el alcance de 02 ni duplicar su entregable.
- **CHANGELOG bajo `## [Unreleased]`**: no existía la sección; la tarea 08 (release) la consolidará bajo
  el header de versión con el bump SemVer.
- **Ejemplo del seed = `api` Python** (pisa `language`/`test-runner`/`mutation-tool`, incl. `mutmut` como
  comentario) — consistente con lo que la tarea 02 shipeará; el bloque va **comentado** (el template no
  impone coste).

### Verificación corrida + resultado
- **7 escenarios Gherkin como criterios de aceptación** (grep/inspección): todos cumplidos. Clave: la
  cadena de flechas aparece **solo** en `README.md:102` (grep confirmado); las 3 sedes de prosa apuntan
  sin reenunciar; el seed lleva `packages:` comentado con `api` pisando 3 claves + puntero.
- **Barrido `grep` reforzado**: sin `grill-me`/`/task` comando/`skills/task/` vivos fuera de allowlist;
  la entrada nueva del CHANGELOG limpia. Espejos de stack (2×lifecycle) consistentes byte a byte.
- **Gate `fact-checker`** (subagente fresco, model `sonnet`): **9/9 VERIFICADO**, 0 INCORRECTO, 0 NO
  VERIFICABLE. No bloquea.
- **Stack `none`**: TDD y gate de mutation **N/A** (sin runner ni Stryker) — confirmado por el verificador
  (`stack.language: other`, `test-runner: none`, sin `package.json`).

### Docs actualizadas + motivo
- `task-pipeline/README.md` — sede **canónica** de la regla (nueva sub-sección "Stack por-package").
- `templates/task-pipeline.yml` — bloque `packages:` comentado (seed) + puntero.
- `.claude/task-pipeline.yml` — puntero comentado (single-package, sin override real).
- `templates/task-lifecycle.md` + `docs/guides/task-lifecycle.md` + `plan-task/SKILL.md` — punteros
  (sedes espejo, no reenuncian).
- `task-pipeline/CHANGELOG.md` — `## [Unreleased]` → `### Added` (consolida la tarea 08).

### Ficheros / commits
- 7 ficheros de contenido + arranque (plan→active, task→active, session log) + cierre (task→done, tick
  en plan). Commit en la rama `plan/task-pipeline/sdd-y-stack-poliglota` con id de tarea.

### GitHub (github-tracking ON, best-effort, modo plano C3)
- Arranque: #37 (padre) y #38 (tarea) → Status **In progress**; label `status: in-progress` en #38.
- Cierre: #38 → Status **Done**, `gh issue close`, retirar `status:*`. El padre #37 se cierra al cerrar
  el **plan** (tarea 08), no ahora.

### Tiempo real
- Estimado 2h · real ~1h (aproximado; sesión única, tarea de doc/contrato).

### Follow-ups
- **Tarea 02** (`/mutation` agnóstico): consumidor directo de este contrato; añade la nota
  "mutation-gate no es per-package" reservada aquí.
- Tareas 03 (`/task-init`) y 07 (`/doctor`) leen también este schema.
