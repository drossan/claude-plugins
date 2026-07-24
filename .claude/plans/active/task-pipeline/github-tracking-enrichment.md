---
id: task-pipeline-github-tracking-enrichment
package: task-pipeline
status: active
branch: plan/task-pipeline/github-tracking-enrichment
issue: 19
created: 2026-07-23
updated: 2026-07-24
---

# Enriquecer la proyección GitHub Issues/Projects (contenido, estado, assignee, labels)

## Contexto y problema

`features.github-tracking` (opt-in, hoy `enabled: true` en este repo) proyecta el trabajo a GitHub
one-way (`.md` → GitHub): plan → issue **PADRE**, tarea → **SUB-ISSUE**. La proyección actual es pobre:

- **Body mínimo**: al crear la issue solo se vuelca *"resumen + link al `.md`"* (Paso 5.7 de `plan-task/SKILL.md`).
  Quien mira la issue no ve la task; tiene que abrir el `.md`.
- **Estado poco visible**: el ciclo de vida (`docs/guides/task-lifecycle.md`) ya define una tabla de
  proyección de estado (`active → In Progress` del Project, `done → close`…), pero **solo toca el campo del
  Project** — invisible desde la lista de issues — y **no consta que se aplique de forma fiable** al arrancar.
- **Sin assignee**: la issue no se asigna a quien trabaja la tarea.
- **Sin label de package**: no hay forma glanceable de filtrar issues por workspace.

Objetivo: enriquecer la proyección para que la issue/Project reflejen fielmente la task **sin cambiar el
modelo** (el `.md` sigue siendo la única fuente de verdad; GitHub es proyección one-way best-effort).

### Hechos verificados (esta sesión) que acotan el diseño

- `gh 2.96.0` soporta `--parent`, `--body-file`, `--assignee`, `--label`, `--type`, `--project`.
- Identidad `gh` = **`danielrosse`**; owner del repo = **`drossan` (cuenta `User`, no Organization)**.
- **Issue types nativos = NO viables**: son org-only; `/orgs/drossan/issue-types` → **404**. → se **omite** el type.
- **`danielrosse` es colaborador asignable** (`repos/.../assignees/danielrosse` → 204) → assignee viable.
- **Project 2 (`drossan`) es LEGIBLE y ESCRIBIBLE** por `danielrosse`: **write-spike verificado** (2026-07-23,
  item #17 `Done`→`In review`→restaurado a `Done`, `exit=0`). → El comentario "board = no-op" de
  `.claude/task-pipeline.yml` (líneas 80–82) y la memoria previa están **STALE**: se corrigen en la tarea de config.
  Opciones reales del campo Status: `Backlog · Ready · In progress · In review · Done` (ojo: **`In progress`**
  minúscula — los docs escriben mal `In Progress`; el match debe ser case-insensitive).
- Token con scope `project` presente.
- La proyección ya se usó (planes `docs-portal-and-tracking`, `collision-free-ids` tienen `issue:`); las
  sub-issues #12–17 **no** llevan labels aún; todos los items ya están en el Project con Status=`Done`.

## Objetivos

1. **Body = contenido completo de la task/plan** (no solo resumen), con banner de espejo.
   - *Criterio de éxito*: el body de la sub-issue contiene las secciones del `.md` (Description/Spec/Scenarios/
     Provides/DoD) **sin frontmatter**, precedidas de un **banner** «⚠️ espejo generado desde `<path>` — la
     fuente de verdad es el `.md`», y un link al `.md`; el padre contiene el cuerpo del plan. El body se vuelca
     **al crear** y se re-vuelca **solo en re-proyección explícita** (`/doctor` / re-run de `/plan-task`), **no**
     en cada transición de estado (design-review #3: re-volcar en transiciones re-escribe contenido que no cambió
     y no capta los cambios reales — el trabajo vivo va al session log, que no se proyecta).
2. **Estado proyectado al arrancar/cerrar en DOS sitios**: campo **Status del Project** + label **`status:*`**
   en la propia issue (ambos best-effort, proyecciones idempotentes del `.md`; write al Project **verificado**).
   - *Criterio de éxito*: `active` → Project Status `In progress` **y** label `status: in-progress`;
     `in-review` → `In review` + `status: in-review`; `blocked` → `status: blocked` (Project queda en `In progress`);
     `done`/`cancelled` → issue cerrada (cancelled "not planned") + `status:*` retirada + Project `Done`.
     **Recipe idempotente**: añade la label nueva **antes** de quitar las demás `status:*` (un fallo parcial
     sobre-etiqueta y se auto-cura en la siguiente transición, en vez de dejar la issue sin estado). Match del
     Status **case-insensitive**; si el Project del consumidor no tiene la opción → salta el Status + avisa (el
     label `status:*` es el fallback visible). Divergencia `.md`↔label↔Project = **residual aceptado** (ver F. de alcance).
3. **Assignee**: la issue se asigna a quien arranca la tarea (`@me`).
   - *Criterio de éxito*: al pasar la tarea a `active`, `gh issue edit --add-assignee @me` (best-effort);
     si `@me` no es asignable, avisa y sigue.
4. **Label de package**: `pkg:<package>` derivada del frontmatter `package:` (creada si no existe).
   - *Criterio de éxito*: cada issue lleva `pkg:<package>`; la label se crea con `gh label create` si falta;
     si no se puede crear, se proyecta sin ella + aviso. **Una** label por issue (convención one-package-per-plan intacta).
5. **Documentar que la feature requiere `gh`** (+ auth con scope `repo`, y `project` para el tablero), y todos
   los comportamientos nuevos y sus límites.
   - *Criterio de éxito*: README §GitHub-tracking + `website/features/github-tracking.md` dicen explícitamente:
     (a) **requisito de `gh`** + scopes (`repo`, `project`); (b) el type **omitido** y la **asimetría** padre-tipado /
     hijo-sin-tipar en consumidores org (#9); (c) `@me` exige que la **identidad que corre sea colaborador asignable**
     (si no, no asigna + avisa — #6); (d) el Status del Project solo funciona con las opciones **default** (o el match
     por nombre no-op + avisa — #6); (e) residual **I3 ampliado** (#8): desactivar el flag deja huérfanas las
     **definiciones** de labels `pkg:*`/`status:*`, los **items** del Project y las `status:*` pegadas a issues
     in-flight → **reconciliar/limpiar antes de desactivar**.

## Alcance y fuera de alcance

### Dentro del alcance
- `task-pipeline/skills/plan-task/SKILL.md` — **Paso 5.7** (proyección al crear): body completo + `pkg:<package>`.
- `docs/guides/task-lifecycle.md` **y** su semilla `task-pipeline/skills/plan-task/templates/task-lifecycle.md`
  — "Arrancar tarea" / "Cerrar tarea" / "Cerrar plan": Project Status (`In progress` case-insensitive) + label
  `status:*` (recipe add-then-remove) + assignee `@me`. **El body NO se re-vuelca en transiciones** (solo estado/assignee).
- `task-pipeline/skills/plan-task/templates/task-pipeline.yml` **y** `.claude/task-pipeline.yml` — clave nueva
  `assignee` (comentada en el template) + **corregir el comentario stale "board = no-op"** (write verificado).
- `task-pipeline/skills/doctor/SKILL.md` — **una frase** en categoría 8: re-proyectar re-aplica
  labels/Status/assignee de forma **idempotente** desde el `.md` (sin nueva lógica de detección — ver decisión 6).
- `task-pipeline/README.md` §GitHub-tracking + `website/features/github-tracking.md` — docs de usuario.
- `task-pipeline/CHANGELOG.md` + bump `task-pipeline/.claude-plugin/plugin.json` (0.12.1 → **0.13.0**, feature minor).

### Fuera de alcance
- **Issue types nativos** (org-only; se omiten — no se sustituyen por label de type, decisión del owner).
- **Multi-package por issue** (una sola label `pkg:` derivada del `package:`; no se toca la convención).
- **Sync bidireccional o en tiempo real**: no hay demonio que observe el `.md`. El body se vuelca **al crear** y
  solo se re-vuelca en **re-proyección explícita** (`/doctor` / re-run de `/plan-task`) — **no** en transiciones de
  estado (design-review #3). El trabajo vivo va al session log, que **no** se proyecta. Límite honesto, no sync fuerte.
- **`depends_on` como dependencia nativa de GitHub** (sigue siendo nota de texto, sin cambios).
- **Reconciliación del nuevo drift en `/doctor`** (labels `status:*`↔`.md`, Project↔`.md`, migración de `blocked`):
  **residual aceptado** (design-review #5, decisión-grilling 6), NO detección nueva. El mismo estado vive en 3
  stores (`.md` normativo + label + Project) sincronizados best-effort e idempotentes desde el `.md`; re-proyectar
  re-alinea. Se nombra como residual junto a T-B/C3/I3, no se promete detección automática.

## Recursos externos

- README del plugin §"GitHub tracking (opcional)" (comportamiento actual + riesgos aceptados T-B/C3/I3).
- `docs/guides/task-lifecycle.md` (tabla de estados actual) y su template.
- `gh` CLI (issue create/edit, label create, project item-edit/-list). Config: `.claude/task-pipeline.yml`
  (`github-tracking: { enabled: true, repo: drossan/claude-plugins, project: 2 }`).
- Decisiones de la sesión (2026-07-23): type **omitido**; `pkg:` **1 label** del `package:`; estado en
  **Project Status + label `status:*`**; body **re-sync en puntos del pipeline**.

## Estimación global

- **Tareas totales**: 5 (ver lista).
- **Esfuerzo estimado**: 1–2 sesiones (cambios en skills/docs MD; sin harness de tests — stack `none`).
- **Recursos**: `gh` autenticado como `danielrosse` con acceso al repo y Project 2 de `drossan`.

## Criterios de calidad y verificación

> Stack `none`: TDD y gate de mutation son **N/A** aquí (ver CLAUDE.md). La verificación es por **inspección /
> `grep` / ejecutar la skill/hook contra el repo real**. El gate de **`fact-checker`** SÍ aplica al cierre de cada tarea.

- Escenarios Gherkin de cada tarea verificados por inspección y/o ejecutando la proyección contra `drossan/claude-plugins`.
- **Verificación empírica de la escritura al Project** (el hueco no verificado): en la tarea de estado, ejecutar
  `gh project item-edit` sobre una issue de prueba y observar el cambio de Status en el tablero; si falla (403/permiso),
  documentar que el Status del Project queda **no-op best-effort** y que el `status:*` label es el fallback visible.
- Coherencia `description` del plugin ↔ `marketplace.json` ↔ README tras los cambios.
- `bash -n` N/A (no hay hooks nuevos); barrido `grep` de identificadores muertos al cerrar (CLAUDE.md).

## Tasks

- [x] `task-pipeline-github-tracking-enrichment-01` (P1) — Paso 5.7 (`plan-task/SKILL.md`): body completo (sin frontmatter + link) padre y tareas; label `pkg:<package>` (crear si falta); añadir issue al Project (Status `Backlog`); sin type · depends_on: — · **done 2026-07-23**
- [x] `task-pipeline-github-tracking-enrichment-02` (P1) — Lifecycle (materializado **+** template): arranque→Project `In progress` + `status: in-progress` + `@me`; cierre/bloqueo/in-review/reopen con gestión de `status:*` + Project Status; padre→`Done`+close (sin label/assignee); body NO re-vuelto en transiciones; degradación best-effort; frase idempotente en `doctor/SKILL.md` · depends_on: 01 · **done 2026-07-24**
- [ ] `task-pipeline-github-tracking-enrichment-03` (P2) — Config: template `task-pipeline.yml` (clave `assignee` comentada + comportamiento nuevo; `issue-type-plan` intacta) + `.claude/task-pipeline.yml` de este repo · depends_on: 01, 02
- [ ] `task-pipeline-github-tracking-enrichment-04` (P2) — Docs: README §GitHub-tracking (`gh` **requerido** + scopes, comportamientos, límites) + `website/features/github-tracking.md` · depends_on: 01, 02, 03
- [ ] `task-pipeline-github-tracking-enrichment-05` (P3) — Release: CHANGELOG `0.13.0` + bump `plugin.json` + coherencia `marketplace.json`/`description` · depends_on: 01, 02, 03, 04

## Registro de cambios del plan

- 2026-07-23: creado.
- 2026-07-23: decisiones previas al draft (AskUserQuestion): type **omitido** (org-only, cuenta personal, 404
  verificado); labels de package = **1 label `pkg:<package>`** del frontmatter (convención one-package intacta);
  estado = **campo Status del Project + label `status:*`** en la issue; body = **re-sync en los puntos donde el
  pipeline toca GitHub** (no hay demonio). `gh` requerido → documentar (mensaje del usuario a mitad de turno).
- 2026-07-23: refinado con `grilling` (10 decisiones):
  1. Re-sync body solo en touchpoints del pipeline (crear + transiciones + re-proyección), no watcher; documentado.
  2. Body = cuerpo Markdown **sin frontmatter** + línea de link; padre vuelca el cuerpo del plan.
  3. Labels `status: in-progress`/`blocked`/`in-review`; exclusión mutua; retiradas al cerrar; migra la `blocked` pelada.
  4. Al crear, **añadir la issue al Project** (Status `Backlog`); mapeo `active→In progress`, `in-review→In review`,
     `done/cancelled→Done` (cancelled cierra "not planned"), `blocked→` mantiene `In progress`+label. Best-effort
     (escritura al Project **sin verificar** aún — verificar empíricamente en tarea 02).
  5. Assignee: solo sub-issue de la tarea al arrancar, `--add-assignee @me` (acumula), sin desasignar al cerrar; padre no.
  6. **T04 recortada** (sin detección nueva en `/doctor`; solo frase de re-aplicación idempotente) → 5 tareas.
  7. `issue-type-plan` intacta (válida para consumidores org); documentar límite org-only; type de tareas omitido.
  8. Config minimalista: única clave nueva `assignee`; prefijos hardcodeados; Status best-effort por nombre; sin toggles por-pieza.
  9. Padre: `plan` + `pkg:` + Project Status, **sin** `status:*` label.
  10. Versión **0.13.0** (minor, retrocompatible).
- 2026-07-23: `design-review` (subagente opus) — 9 hallazgos; resolución:
  - **#1 RESUELTO por write-spike**: `danielrosse` **sí** escribe el Status del Project 2 (item #17
    `Done`→`In review`→restaurado, `exit=0`). El objetivo 2 (Project Status) es real; el comentario stale
    "board = no-op" del config se corrige en la tarea 03.
  - **#3 adoptado**: body al crear + solo re-proyección explícita (no en transiciones). Objetivo 1 corregido.
  - **#4 (discrepancia con argumento)**: se **mantiene** el body completo (petición explícita del owner) + **banner**
    de espejo, en vez de bajar a resumen.
  - **#5 adoptado**: recipe `status:*` **add-new-then-remove-others**; drift nuevo = **residual aceptado** (no doctor).
  - **#6 adoptado**: match del Status **case-insensitive** (`In progress` real ≠ `In Progress` de los docs) + límites
    documentados (identidad asignable, opciones default).
  - **#7 (discrepancia con argumento)**: se **mantienen** las labels `pkg:*` (petición explícita) + coste documentado.
  - **#8 adoptado**: I3 ampliado por escrito. **#9 adoptado**: asimetría padre-tipado/hijo-sin-tipar documentada.
  - **#2**: se mantienen los dos stores (Project + label) por petición explícita + write ya probado, con el
    encuadre honesto de #5/#8 (best-effort idempotente + residual nombrado).
- 2026-07-23: `scenario-coverage` (subagente QA) — huecos incorporados a las tareas:
  - **T01**: `---` interno vs stripping de frontmatter; body > límite de GitHub → truncar+link; `pkg:` "ya existe"≠fallo;
    package con caracteres raros; fallo de op de Project / `Backlog` ausente; re-proyección idempotente **+ re-vuelco de
    body**; create del padre falla → sin sub-issues sueltas; `depends_on` no se proyecta.
  - **T02**: transiciones `in-review` / `blocked→active` / `done→active` (reopen); **migración de la label `blocked`
    pelada legacy** (el recipe la retira también); fallo parcial del recipe; `blocked` no mueve el Status; `@me` no
    asignable → avisa; tarea sin `issue:` = local puro; close ya-cerrada = no-op; padre sin assignee.
  - **[Decisión] Transversal A**: la clave `assignee` (T03) **se cablea a T02** (`@me`/login/`false`) — no doc muerta.
  - **[Decisión] Transversal B**: el re-vuelco de body en **re-proyección explícita** se pinea en T01 y la frase de
    `/doctor` (T02) pasa a incluir **body** + labels/Status/assignee (antes omitía el body).
  - **T04**: documentar el límite de tamaño de body; coherencia docs↔canónico (usar `status: blocked`, no `blocked` pelada).
