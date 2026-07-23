---
id: task-pipeline-collision-free-ids
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/collision-free-ids
created: 2026-07-17
updated: 2026-07-23
---

# IDs de tarea sin colisión en equipo + tracking GitHub opcional

## Contexto y problema

Dos desarrolladores trabajando en paralelo con el plugin crearon **tareas y planes con el mismo id** en
ramas/sesiones distintas; al mergear a `main` saltó el conflicto. Hay que eliminar la causa raíz.

**Diagnóstico (verificado por inspección).** El `<task-id>` es `<package>-<nnn>`, un **contador monótono
por package** que cada sesión infiere del estado local ("último número visible + 1"). Ninguna skill ni hook
instruye *cómo* se calcula ni detecta duplicados (`grep`: los únicos usos de `<nnn>` son las plantillas;
`plan-task/SKILL.md` no menciona la numeración; `bootstrap.sh` no la embebe). En equipo es el problema
clásico de **asignar IDs de forma descentralizada sin coordinación**: dos ramas cortadas del mismo `main`
ven el mismo "último número" y asignan los mismos `nnn`. Al mergear:

- **Colisión dura y silenciosa** — `.claude/tasks/.../task-pipeline-013.md` y su
  `.claude/context/.../task-pipeline-013.md`: conflicto add/add en git (cada rama no ve el número de la otra).
- Colisión del fichero de plan solo si eligen el **mismo `<name-plan>`** (más visible, semántica).

**Enfoque D1 (aprobado por el owner): numeración por plan.** Que el **espacio de nombres del ID coincida con
la unidad de paralelismo**. Aquí la unidad de trabajo paralelo es el **plan = rama**. El id de tarea deja
de ser un contador global del package:

```
<task-id> = <plan-id>-<nn>     donde  <plan-id> = <package>-<name-plan>  (ya existente y único por plan)
                                      <nn>      = correlativo DENTRO del plan, desde 01
```

Determinista (derivado del `<plan-id>` que `/plan-task` ya conoce; sin aleatoriedad ni script nuevo). Dos
planes distintos = dos espacios de id distintos → nunca colisionan. Residual solo si dos planes comparten
nombre: 1 conflicto único y evidente en el fichero del plan, que además detecta `/doctor`.

**Enfoque D2 (añadido 2026-07-23, opt-in, default OFF): tracking GitHub opcional.** La numeración por plan
resuelve la colisión pero pierde el **orden cronológico global** entre planes (hoy trivial con `001..012`).
Para equipos que quieran (a) ese orden glanceable y (b) un tablero, se añade una integración **opcional**
con GitHub Issues + Projects, activable desde `.claude/task-pipeline.yml`:

- **`.md` = única fuente de verdad** (M2); GitHub es **proyección one-way** (md → GitHub). Plan → issue
  **padre**; Task → **sub-issue** (`gh issue create --parent`); el **orden global** = número de issue (lo
  asigna el servidor, monótono, sin colisión). Estado `done`/`cancelled`/`blocked` → close / not planned /
  label + campo de Project. `depends_on` se queda en el `.md`; la issue es ligera (título + link + estado).
- **Mecanismo A**: llamadas `gh` **tejidas como pasos condicionales por flag** en las skills existentes
  (no hook, no daemon). Idempotencia: frontmatter `issue: <n>` en el `.md`. Reconciliación **best-effort**
  en `/doctor`. Degradación: flag off / sin conexión / sin config / repo no-GitHub → **no-op**.

**Compatibilidad hacia atrás.** Los 12 ids existentes (`task-pipeline-001..012`, planes ya `completed`)
son estables para siempre: **no se renumeran**. El esquema nuevo aplica a planes/tareas nuevos (histórico
mixto de ids opacos: no rompe nada). Sin cambios de carpetas: el filename ya lleva el plan.

## Objetivos

1. **Convención de id documentada y única.** `task-lifecycle` y las plantillas definen
   `<task-id> = <plan-id>-<nn>` con la regla explícita "no contador global del package".
   - *Criterio de éxito*: `grep` de la definición del id en plantillas + `plan-task/SKILL.md` muestra el
     nuevo formato y la regla anti-contador-global; ejemplos coherentes en todas.
2. **`/plan-task` asigna el id de forma determinista.** El SKILL instruye cómo derivar `<nn>` por plan.
   - *Criterio de éxito*: la instrucción cuenta `<nn>` sobre las tareas del plan, no del package; incluye
     nota de convivencia con ids legacy.
3. **Red de seguridad: `/doctor` detecta ids duplicados.** Nueva categoría en Fase 1 (repo-owned) + fix Fase 2.
   - *Criterio de éxito*: repo de prueba con dos ficheros que comparten `id:` → `doctor` lo reporta; repo
     sano → sin falso positivo.
4. **Guía de trabajo en equipo.** README del plugin + flujo: rama = plan, por qué ids plan-scoped, cómo se
   ve/resuelve el residual (mismo nombre de plan).
   - *Criterio de éxito*: sección presente y coherente; enlazada desde el flujo.
5. **Repo alineado (dogfooding) + release.** Copias materializadas actualizadas; version bump + CHANGELOG.
   - *Criterio de éxito*: `claude plugin validate .` OK; `grep` sin esquema viejo vivo salvo allowlist.
6. **Tracking GitHub opcional operativo (opt-in, default OFF).** Config `features.github-tracking` + la
   proyección md→GitHub tejida en `/plan-task` y en el cierre del lifecycle.
   - *Criterio de éxito*: en repo de prueba con `gh` autenticado y flag on, `/plan-task` crea issue padre +
     sub-issues y escribe `issue:` en el `.md`; re-sync no duplica; cerrar tarea cierra la issue. Con flag
     off / sin conexión / repo no-GitHub → **no-op** (comportamiento default idéntico).
7. **Reconciliación + doc del tracking.** `/doctor` detecta drift md↔GitHub y huérfanas (best-effort);
   doc de la integración con límites y riesgos aceptados.
   - *Criterio de éxito*: `/doctor` reporta un `.md` `done` con issue abierta y un `issue:` con número
     inexistente; la doc cubre setup, mapeo, degradación y cómo desactivar.

## Alcance y fuera de alcance

### Dentro del alcance
- Definición del id plan-scoped en **plantillas** (`task-lifecycle.md`, `task.md`, `plan.md`,
  `HOW-TO-START-A-TASK.md`, `templates/README.md`) y en **`plan-task/SKILL.md`** (regla de asignación).
- Check de **ids duplicados** en `doctor/SKILL.md` (Fase 1 + Fase 2).
- Doc de **equipo/colisiones** en `README.md` del plugin + `docs/guides/task-lifecycle.md`.
- **Copias materializadas** de ESTE repo: `docs/guides/task-lifecycle.md`,
  `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md` (y todo doc del repo que cite `task-pipeline-XXX`).
- **D2 — tracking GitHub opcional**: config `features.github-tracking` en `templates/task-pipeline.yml`
  (+ lector documentado); frontmatter `issue:` en `templates/task.md` y `templates/plan.md`; proyección
  md→GitHub tejida (condicional por flag) en `plan-task/SKILL.md` y en el cierre de `task-lifecycle`;
  reconciliación best-effort en `doctor/SKILL.md`; doc de la integración (README + guía de equipo).
- **Release**: `plugin.json` (version), `CHANGELOG.md`; coherencia de `description` con `marketplace.json`.

### Fuera de alcance
- **Renumerar** los ids existentes (`task-pipeline-001..012`): estables para siempre.
- **Sufijo aleatorio por hook** (opción descartada por el owner): no se añade machinery de generación.
- **Reestructurar carpetas** (nesting por plan): el filename ya lleva el plan.
- **GitHub como fuente de verdad / tirar los `.md`** (descartado en grilling): GitHub es solo proyección
  one-way; los `.md` siguen mandando y funcionando offline.
- **Sync bidireccional o garantizado** md↔GitHub: la proyección es one-way y la reconciliación best-effort
  (límite del sustrato markdown — ver Riesgos aceptados C3).
- Prevenir de forma automática el caso "dos devs extienden **el mismo** plan en ramas separadas" (residual
  honesto — ver Criterios/Riesgos): se cubre con guía + detección de `doctor`, no con prevención dura.

## Recursos externos

- Convención canónica: `docs/guides/task-lifecycle.md` (este repo) y su plantilla
  `task-pipeline/skills/plan-task/templates/task-lifecycle.md`.
- Config del repo: `.claude/task-pipeline.yml` (`stack: none`; `mode: full`; `caveman: lite`).
- Reglas del repo source: `CLAUDE.md` (allowlist de `grep`, release, dogfooding) + `.claude/honesty-rules.md`.
- Decisión de `grilling`/owner (2026-07-17): esquema **numeración por plan** frente a sufijo aleatorio y
  frente a "solo detección".
- Decisión de `grilling`/owner (2026-07-23): añadir **D2 tracking GitHub opcional** (M2 + mecanismo A);
  descartados "GitHub autoritativo/tirar .md" y "solo vista local por `created:`".
- Hechos verificados de GitHub (doc oficial + `gh` 2.94.0): sub-issues GA abril 2025 (≤100/padre, 8
  niveles); `gh issue create --parent`, `gh issue edit --parent/--add-sub-issue`, `gh project`; campos
  *Parent issue* / *Sub-issue progress* en Projects (jerarquía en tabla en **public preview**, no en Roadmap).

## Estimación global

- **Tareas totales**: 12 (6 de D1: 01–06 + 6 de D2: 07–12; ver lista al final).
- **Esfuerzo estimado**: 2–3 sesiones (cambios de Markdown/instrucciones; sin código ejecutable).
- **Recursos**: 1 dev; verificación por inspección/`grep`/correr skills (stack `none`) + repo de prueba con
  `gh` autenticado para D2.

## Criterios de calidad y verificación

> **Stack `none`**: TDD y gate de mutation son **N/A**. Los escenarios Gherkin de cada tarea son
> **criterios de aceptación** verificables por inspección / `grep` / `test -d` / corriendo la skill.

- Coherencia plantilla ↔ copia materializada del repo (mismo esquema de id en ambos).
- Barrido `grep` reforzado: sin `<package>-<nnn>` (contador global) vivo como esquema; allowlist: CHANGELOG
  histórico y menciones de los ids legacy `task-pipeline-001..012`.
- `doctor` reporta ids duplicados en repo con drift inyectado y no da falso positivo en repo sano.
- **D2**: con flag off / sin conexión → **no-op** verificable; con flag on y `gh` autenticado, proyección e
  idempotencia verificadas en repo de prueba; `doctor` detecta drift md↔GitHub y huérfanas.
- `claude plugin validate .` OK tras el release; versión bumpeada; entrada en CHANGELOG.
- **Gate `fact-checker`** (no-negociable) al cierre de cada tarea, tras la verificación.

**Riesgos / residual (honesto):**
- *Mismo nombre de plan en paralelo* → misma `<plan-id>` → colisiona, pero 1 conflicto único, evidente y
  semántico (no la lluvia silenciosa de hoy); lo caza `doctor` y lo mitiga la guía de equipo.
- *Dos devs extienden el mismo plan en ramas separadas* → ambos eligen el siguiente `<nn>` → colisión no
  prevenida por este esquema (lo haría el sufijo aleatorio, descartado). Mitigación: "rama = plan / una
  tarea active por plan" + detección en `doctor`. Límite conocido documentado.
- *Ids más largos* (`task-pipeline-collision-free-ids-01`): aceptado por el owner.

**Riesgos ACEPTADOS de D2 (esta sección ANULA la `design-review` — queda como rastro).** El owner eligió
"mantener D2 como estaba" conociendo estos hallazgos sin resolver:
- **C1 (scope)**: D1 (colisión) y D2 (orden+tablero) son problemas distintos y conviven en un mismo plan.
- **C3 (fiabilidad)**: la reconciliación md↔GitHub es **best-effort**; un playbook markdown no puede
  garantizar sync remoto idempotente (paginación, rate-limit, auth, issue borrada). Se documenta como
  limitación, no como robustez.
- **I1 (contaminación)**: `plan-task`, el cierre del lifecycle y `doctor` ganan ramas condicionales
  "si github-tracking…" (con degradación a no-op).
- **I3 (reversibilidad)**: apagar el flag deja issues huérfanas y `issue:` en `.md` ya commiteados en
  `completed/`. Mitigación: la doc explica cómo desactivar y `/doctor` detecta huérfanas; el campo no se
  retira del histórico.
- **M2 (preview)**: parte del valor "vistoso" (jerarquía en Projects) se apoya en features en preview.

## Tasks

- [x] `task-pipeline-collision-free-ids-01` (P1) — Esquema de id plan-scoped en plantillas + `task-lifecycle`  · depends_on: —
- [x] `task-pipeline-collision-free-ids-02` (P2) — Regla de asignación de id en `plan-task/SKILL.md`  · depends_on: task-pipeline-collision-free-ids-01
- [x] `task-pipeline-collision-free-ids-03` (P2) — Check de ids duplicados en `doctor`  · depends_on: task-pipeline-collision-free-ids-01
- [x] `task-pipeline-collision-free-ids-04` (P3) — Doc de trabajo en equipo / colisiones (README + flujo)  · depends_on: task-pipeline-collision-free-ids-01
- [ ] `task-pipeline-collision-free-ids-05` (P3) — Alinear copias materializadas de este repo (dogfooding)  · depends_on: task-pipeline-collision-free-ids-01
- [ ] `task-pipeline-collision-free-ids-07` (P2) — Config `features.github-tracking` + frontmatter `issue:` (plantillas)  · depends_on: —
- [ ] `task-pipeline-collision-free-ids-08` (P3) — Proyección md→GitHub tejida en `/plan-task` (condicional)  · depends_on: task-pipeline-collision-free-ids-07
- [ ] `task-pipeline-collision-free-ids-09` (P3) — Proyección de estado de TAREA (arranque + cierre)  · depends_on: task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08
- [ ] `task-pipeline-collision-free-ids-12` (P3) — Ciclo de vida del PLAN en GitHub: cierre de issue padre + proyección concurrente  · depends_on: task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-09
- [ ] `task-pipeline-collision-free-ids-10` (P3) — Reconciliación best-effort en `/doctor`  · depends_on: task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-12
- [ ] `task-pipeline-collision-free-ids-11` (P4) — Doc de la integración GitHub (README + guía de equipo + catálogos)  · depends_on: task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-09, task-pipeline-collision-free-ids-10, task-pipeline-collision-free-ids-12
- [ ] `task-pipeline-collision-free-ids-06` (P5) — Release: version bump + CHANGELOG + coherencia descriptions  · depends_on: -01, -02, -03, -04, -05, -07, -08, -09, -10, -11, -12

## Registro de cambios del plan

- 2026-07-17: creado. Enfoque **numeración por plan** elegido por el owner (`AskUserQuestion`) frente a
  sufijo aleatorio por hook y frente a "solo detección". Aprobado con `ExitPlanMode`.
- 2026-07-23: re-planificado in-place. Añadida **D2 (tracking GitHub opcional, opt-in)** tras `grilling`
  (decisiones: problema real = colisión entre planes distintos, ya resuelta por D1; D2 aporta orden global
  glanceable + tablero; M2 = `.md` fuente de verdad + GitHub proyección one-way; mecanismo A = tejido en
  skills; config con solo `enabled` obligatorio; `repo` default = repo actual). `design-review` (opus)
  corrió y **recomendó NO añadir D2** (C1/C2/C3/I1/I2/I3/M1/M2); el owner la **anuló conscientemente**
  (opción "mantener D2 como estaba"), aceptando los riesgos C1/C3/I1/I3/M2 registrados arriba. Tareas 07–11
  añadidas; `-06` (release) extiende `depends_on` a toda D2. Corregido: el flujo vive en
  `docs/guides/task-lifecycle.md` + `README` del plugin (no existe `docs/flujo-del-pipeline.md`).
- 2026-07-23: `scenario-coverage` (subagente QA fresco) sobre las 11 tareas → 3 huecos críticos y varios
  importantes (owner: "todo + tarea nueva"). Añadida **tarea `-12`** (ciclo de vida del PLAN en GitHub:
  cierre de issue padre T-A + proyección concurrente T-B). Endurecidos los escenarios de -01 (parseo
  inequívoco de `<name-plan>` T-G, formato `<nn>`), -02 (contar sobre TODOS los estados, residual
  remitido), -03 (ids de plan/estado, frontmatter roto, filename≠id, cruce D1×D2 T-H), -05 (ejemplos stale
  vs historia, catálogos raíz), -07 (valores no-canónicos, no-drift T-E), -08 (label `plan` T-C, fallos
  parciales/adversarios/exactly-once), -09 (In Progress al arrancar, transiciones inversas), -10
  (falso-positivo flag off T-E, huérfanas, degradación con `gh` caído, contradicción off↔huérfanas), -11
  (límite de concurrencia, coherencia de huérfanas, catálogos T-F). Reconocido T-K: la verificación de D2
  con GitHub en vivo es **NO VERIFICABLE** de forma reproducible en `stack:none`.
