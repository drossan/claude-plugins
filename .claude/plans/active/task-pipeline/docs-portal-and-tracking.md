---
id: task-pipeline-docs-portal-and-tracking
package: task-pipeline
status: active
branch: plan/task-pipeline/docs-portal-and-tracking
issue: 11                # issue PADRE proyectada en drossan/claude-plugins (2026-07-23)
created: 2026-07-23
updated: 2026-07-23
---

# Portal de documentación (VitePress + GitHub Pages) + activación de github-tracking

## Contexto y problema

Tres necesidades, una unidad de trabajo (misma rama, misma superficie "docs + tracking"):

1. **Drift docs↔código.** Una auditoría (subagente Explore, 2026-07-23) encontró desalineaciones
   verificadas entre la documentación y el estado real del repo. No son inventadas; se listan abajo.
2. **No hay portal web.** La doc vive solo en `.md` del repo. Se quiere una **web VitePress en GitHub
   Pages** (mismo repo) como documentación navegable del plugin.
3. **github-tracking apagado.** El repo dogfoodea su propio plugin pero **no** usa la feature
   `github-tracking` (Issues/Projects). El owner quiere **activarla** y que **este mismo plan** ya se
   proyecte a GitHub (Issues ahora; Project v2 cuando se conceda el scope).

### Hallazgos de la auditoría (fuente de la tarea de alineación)

| Sev. | Fichero | Afirma | Realidad |
|---|---|---|---|
| media | `README.md` L81-92 (árbol) | 8 skills; hooks = solo `bootstrap.sh`; comentario solo `SessionStart` | faltan `pipeline-usage/` y `caveman.sh`; `hooks.json` declara además `UserPromptSubmit→caveman.sh` |
| media | `docs/guides/task-lifecycle.md` L221-228, 265-286 | ramificar desde `dev`; comandos `pnpm/Vitest/Stryker/TSDoc/changeset` | **no existe `dev`** (`main` es integración); repo es `stack: none` (MD+Bash) → esos comandos no aplican. La **copia del repo** debe tailorarse; el **template origen** sigue genérico |
| baja | `CLAUDE.md` L20 | «declara `stack: none`» (literal) | el YAML usa `language: other` + `*: none`; `grep "stack: none"` no encuentra nada |
| baja | `plan-task/SKILL.md` (description) | pipeline sin `design-review`/`scenario-coverage`/`fact-checker` | el resto de la doc sí los atribuye a `/plan-task` |
| baja | `README.md` L31 | ejemplo pin `@v0.1.0` | versión actual `0.12.0` |

### Hechos de entorno verificados (2026-07-23)

- `gh 2.94.0` → soporta `gh issue create --parent` ✓.
- Permiso sobre `drossan/claude-plugins`: `push:true`, `triage:true`, **`admin:false`** → **no** se puede
  activar GitHub Pages ni tocar settings por API/CLI en esta sesión: **lo hace el owner a mano**.
- **Falta scope `read:project`/`project`** → no se puede listar/crear Projects v2 hasta
  `gh auth refresh -s project`. **Issues sí funcionan ya.**
- Label `plan` **no existe** (se creará; `push` lo permite). No hay `.github/` (workflow nuevo).

## Objetivos

1. **Documentación alineada con el código.**
   - *Criterio de éxito*: los 5 hallazgos corregidos; `grep` de la sesión de cierre sin afirmaciones
     falsas ni símbolos inexistentes; `fact-checker` en VERIFICADO/NO VERIFICABLE (sin INCORRECTO).
2. **Portal VitePress *listo para desplegar* en GitHub Pages** (el go-live es un hito del owner, no del cierre del plan: encender Pages es manual).
   - *Criterio de éxito*: `pnpm docs:build` verde en local; workflow de Actions válido; sitio navegable
     con `base` correcto; enlazado desde los README. El plan puede cerrarse **sin sitio vivo** (Pages off);
     el go-live queda documentado como paso de owner en el runbook.
3. **github-tracking activo y este plan proyectado.**
   - *Criterio de éxito*: `features.github-tracking.enabled: true` en el YAML; label `plan` creada; este
     plan con issue PADRE + una sub-issue por tarea (`issue:` escrito en cada frontmatter); runbook del
     setup manual pendiente (scope Projects, creación del Project, encendido de Pages).

## Alcance y fuera de alcance

### Dentro del alcance
- Corregir los 5 hallazgos de drift. Cuatro son **repo-consumer**; **uno es plugin-source**
  (`plan-task/SKILL.md` description) → incluye **bump `0.12.0 → 0.12.1`** + entrada de CHANGELOG. El
  **template** del plugin (`skills/plan-task/templates/task-lifecycle.md`) **no se toca** (sigue genérico).
- Scaffold VitePress con **pnpm** en `website/` (dir dedicado, `srcDir`), **español-only**, sin dominio
  custom, `base: '/claude-plugins/'`. Sub-árbol aislado: **no cambia `stack: none`** del pipeline.
- Contenido **curado** (decisión del owner): páginas nuevas pensadas para web + **frontera explícita de
  fuente-de-verdad** (web = narrativa/onboarding; specs canónicas siguen en los `.md` del repo, la web
  **enlaza** en vez de re-enunciar) para no re-introducir drift. Reversible: si no cuaja, se amplía.
  - **[#5 anti-drift link] Disciplina de enlaces web→repo**: la web enlaza **solo a rutas estables**
    (`README.md`, `docs/guides/task-lifecycle.md`, CHANGELOG). **Prohibido** enlazar a `.claude/plans|tasks/`
    (ficheros que el repo **mueve/renombra por diseño** → enlaces garantizados a pudrirse). La verificación
    incluye los enlaces **sitio→repo**, no solo intra-sitio.
- **[#4 drift que la web crea] Acotar la narrativa de stack.** Añadir `website/` con pnpm vuelve **falsas**
  las afirmaciones «no existe pnpm en este repo» de `CLAUDE.md` (L18-27) y del HOW-TO (L10-20). Hay que
  **carve-out** esa narrativa: aclarar que los **entregables del pipeline** siguen siendo `stack: none`
  (MD+Bash) y que `website/` es un **sub-proyecto aislado** con su propio toolchain (no es el harness de
  tests del pipeline). Sin esto, la web reintroduce el mismo drift que arregla `-02`.
- Workflow de GitHub Actions (`on: push tags: ['v*']` + `workflow_dispatch`) que construye y despliega a
  Pages. **Go-live tras merge a `main` + tag de release** (p. ej. `v0.12.1`). **[#8]** el trigger acopla
  deploy-de-docs a releases-de-código; `workflow_dispatch` mitiga (deploy manual sin tag).
- Activar `github-tracking` (Issues) de forma **permanente** (todo plan/tarea futuro se proyecta) + label
  `plan` + proyectar este plan (solo Issues; Project v2 diferido por scope).
- Runbook consolidado de pasos manuales del owner. **[#6 footgun `base`]** documentar el acoplamiento
  **nombre-del-repo ↔ `base: '/claude-plugins/'`**: un rename/fork/org-move o el paso a dominio custom
  rompe **todos** los assets con 404, y es **inverificable en sesión** (Pages off).

### Fuera de alcance
- **Encender GitHub Pages** (Settings→Pages) y **crear el Project v2**: requieren admin/scope que la sesión
  no tiene → los hace el owner (documentado en el runbook).
- Migrar/rehacer el contenido de los README a la web (se **enlaza**, no se duplica el spec canónico).
- Cambiar el `stack` del pipeline a JS/TS: los entregables del plugin siguen siendo MD+Bash; la web es un
  sub-proyecto con su propio build (verificado corriéndolo, no por gates de mutation/TDD).
- Proyectar `depends_on` como dependencia nativa de GitHub (a lo sumo nota de texto).

## Recursos externos

- Auditoría de drift (subagente Explore, 2026-07-23) — resumida en la tabla de arriba.
- `.claude/task-pipeline.yml` (config del repo) · `docs/guides/task-lifecycle.md` (flujo canónico).
- README del plugin → secciones *GitHub tracking (opcional)* y *Routing de modelo por fase*.
- VitePress (deploy a GitHub Pages project-site: `base: '/claude-plugins/'` + Actions). **No verificado en
  esta sesión**: el YAML exacto del workflow y la versión de VitePress se fijan y **se verifican corriendo
  `pnpm docs:build`** en la tarea, no se dan por buenos de memoria.

## Estimación global

- **Tareas totales**: 6 (ver lista al final).
- **Esfuerzo estimado**: 2-3 sesiones (la web curada es el grueso; la alineación y la config son cortas).
- **Recursos**: owner para las acciones manuales (encender Pages, `gh auth refresh -s project`, crear el
  Project, `git push`); el resto lo conduce el pipeline.

## Criterios de calidad y verificación

> **Stack real = `none` (MD + Bash + sub-proyecto web).** Los ítems de **TDD y gate de mutation de la DoD
> son N/A** (no hay runner ni Stryker; lo dice `CLAUDE.md`). La verificación es por **inspección /
> `grep` / `test -d`** y, para la web, **corriendo `pnpm docs:build`** y previsualizando. El gate de
> **`fact-checker` SÍ aplica** (no-negociable). Los escenarios Gherkin son **criterios de aceptación**.

- Cada tarea de docs: sin identificadores renombrados vivos (barrido `grep` de cierre); respeta la
  **allowlist legítima** (atribución a Matt Pocock; CHANGELOG ≤ 0.8.1).
- Web: `pnpm docs:build` sin errores; **enlaces internos Y sitio→repo resuelven** (#5); **sin enlaces a
  `.claude/plans|tasks/`** (grep); `base` correcto para project-site.
- **Coherencia de la narrativa de stack (#4)**: tras añadir `website/`, `grep` de que `CLAUDE.md` y el
  HOW-TO ya no afirman en falso «no hay pnpm» sin el carve-out del sub-proyecto web.
- github-tracking: idempotencia (re-run no duplica issues); frontmatter `issue:` escrito tras crear.
- `fact-checker` como gate de cierre de cada tarea (INCORRECTO bloquea).

## Cómo se auto-proyecta este plan (circularidad resuelta)

La proyección de Paso 5.7 necesita `github-tracking.enabled: true` **en el momento de proyectar**. Orden
correcto (corrige el timing que señaló `design-review`): se proyecta **tras `scenario-coverage` (Paso 5.5)
y la aprobación final del set de tareas** — nunca antes, o las issues nacen obsoletas si QA cambia tareas.
Justo antes de esa proyección se activa la feature en el YAML (decisión explícita del owner; se registra en
el change log). La tarea `-01` **formaliza y verifica** esa activación (label, runbook, wiring del
`project:`), no la "estrena". Proyección de este plan = **solo Issues** hasta que el owner conceda el scope
de Projects y cree el Project.

**Riesgo aceptado (design-review, override consciente del owner):** auto-proyectar 7 issues reales desde la
sesión de planificación tiene **exactly-once no garantizado** (lo admite `/plan-task`: si el proceso muere
entre `create` y escribir `issue:`, un re-run podría duplicar) y expone el residual **"mismo plan, dos
ramas"** (el primer plan del régimen always-on es el de máximo riesgo). Mitigación: **una sola rama
proyecta**, `issue:` escrito inmediatamente tras cada `create`, y una pasada `/doctor` de reconciliación
tras proyectar.

## Proyección a GitHub (Paso 5.7 — hecho 2026-07-23)

- Feature activada en `.claude/task-pipeline.yml` (`github-tracking.enabled: true`, `repo` explícito).
- Label `plan` creada en `drossan/claude-plugins`.
- **Issue PADRE #11** (label `plan`) · sub-issues: `-01`→#12, `-02`→#13, `-03`→#14, `-04`→#15, `-05`→#16,
  `-06`→#17. Vínculo padre→sub-issues verificado por API. `issue:` escrito en los 7 `.md`.
- **Project v2 #2** (`github.com/users/drossan/projects/2`) creado por el owner (la cuenta gh `danielrosse`
  no puede crear projects de `drossan`); tras dar acceso Write a `danielrosse`, las **7 issues añadidas** al
  tablero (verificado: 7 items). `project: 2` cableado en el YAML. `depends_on` no proyectado (nota en body).

## Tasks

- [x] `task-pipeline-docs-portal-and-tracking-01` (P1) — Activar github-tracking (Issues) en el YAML + label `plan` + runbook de setup (scope Projects, Project v2, Pages)  · depends_on: —  · **done** (issue #12 cerrada, Project→Done)
- [ ] `task-pipeline-docs-portal-and-tracking-02` (P1) — Alinear docs con el código (5 hallazgos) + bump `0.12.1` + CHANGELOG (el hallazgo plugin-source)  · depends_on: —
- [ ] `task-pipeline-docs-portal-and-tracking-03` (P2) — Scaffold VitePress (pnpm) en `website/` + config `base`/`srcDir`/`.gitignore`  · depends_on: —
- [ ] `task-pipeline-docs-portal-and-tracking-04` (P2) — Contenido curado + IA/nav + frontera anti-drift (enlaza al spec canónico)  · depends_on: 02, 03
- [ ] `task-pipeline-docs-portal-and-tracking-05` (P2) — Workflow Actions de deploy a Pages (`on: push tags: ['v*']` + dispatch)  · depends_on: 03
- [ ] `task-pipeline-docs-portal-and-tracking-06` (P3) — Wire-up: enlaces README↔web + **carve-out narrativa de stack (#4)** + coherencia final + runbook consolidado (incl. footgun `base` #6)  · depends_on: 04, 05

**Primera recomendada**: `-01` (desbloquea la auto-proyección del plan), luego `-02`.

## Registro de cambios del plan

- 2026-07-23: creado. Decisiones del owner (pre-grilling): contenido **curado + índices**; toolchain
  **pnpm**; alcance GitHub **Issues + Project v2** (Project diferido por scope). Circularidad de
  auto-proyección resuelta activando la feature antes de proyectar.
- 2026-07-23: refinado con `grilling` (7 preguntas, 7 decisiones): (1) web en `website/` (dir dedicado);
  (2) frontera anti-drift confirmada (web=narrativa, repo=spec canónico, enlazar; reversible); (3)
  github-tracking **permanente** + este plan proyectado ya (solo Issues; Project diferido); (4) el fix
  incluye el plugin-source `plan-task/SKILL.md` → **bump `0.12.1`** + CHANGELOG, plegado en `-02`; (5)
  deploy con `on: push tags: ['v*']` + `workflow_dispatch` (go-live tras merge + tag); (6) **español-only**,
  sin dominio custom, `base: '/claude-plugins/'`; (7) bloque YAML `github-tracking` con `repo` explícito
  (`drossan/claude-plugins`) y `project:` comentado. Granularidad de tareas → se evalúa en `design-review`.
- 2026-07-23: `scenario-coverage` (subagente QA fresco, 8 dimensiones sobre el set completo). Huecos
  incorporados al Gherkin: en `-02` los hallazgos **H3 y H5 no tenían escenario** (2 de 5) + coherencia
  `marketplace.json` + CHANGELOG sin sobre-declarar features de repo; `-03` `lang`, versión pineada, `srcDir`
  no publica ningún `.md` del repo (incl. `.claude/**`), `ignoreDeadLinks` no-true; `-04` páginas
  opcionales, enlaces sin ancla-de-línea, verificación sitio→repo por grep, sin versión hardcodeada; `-05`
  `concurrency`, `needs: build`, path del artifact, honestidad `actionlint`; `-06` enlace con salvedad de
  go-live, runbook fuente única, carve-out exhaustivo, coherencia con H3, versión end-to-end; `-01`
  degradación al crear label + re-activación idempotente + Outline `false`/ausente. **Hueco crítico
  (transversal)**: la **proyección del plan a GitHub** no tenía criterios → decisión del owner: **plegar
  las post-condiciones A-E en `-01`** (mantener 6 tareas). Descartados con motivo: tope 100 sub-issues (N/A,
  6 tareas), prevención dura "dos ramas" (residual aceptado), títulos adversarios (ya normado).
- 2026-07-23: `design-review` (opus, subagente fresco). **Veredicto**: el plan no aguanta como una unidad
  (DAG con nodo aislado `-01`; release `0.12.1` acoplada a la web; auto-proyección irreversible desde
  planning). **Owner: override consciente** — se mantiene **1 plan + auto-proyección + tracking permanente**
  (coherente con la decisión de 0.12.0 de mantener github-tracking pese a la design-review previa). **Sí se
  adoptan** las mejoras mecánicas: (#4) carve-out de la narrativa de stack que la web vuelve falsa
  (`CLAUDE.md`/HOW-TO) → en `-06`; (#5) disciplina de enlaces web→repo (solo rutas estables; prohibido
  `.claude/plans|tasks/`) + verificación sitio→repo; (#6) documentar footgun `base`↔nombre-de-repo en el
  runbook; (#7) objetivo 2 = "listo para desplegar" (go-live = hito de owner, cierre sin sitio vivo); (#8)
  nota del acoplamiento deploy-en-tag ↔ release. **Corrección de correctitud**: proyectar **tras**
  `scenario-coverage` + aprobación (no antes), con el riesgo exactly-once/dos-ramas declarado y `/doctor`
  posterior. Split y VitePress-vs-simple: descartados por el owner (VitePress ya decidido en clarificación).
