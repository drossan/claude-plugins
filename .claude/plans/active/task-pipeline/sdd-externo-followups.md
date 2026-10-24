---
id: task-pipeline-sdd-externo-followups
package: task-pipeline
status: active
branch: plan/task-pipeline/sdd-externo-followups
issue: 92
created: 2026-10-24
updated: 2026-10-24
---

# Follow-ups del SDD externo: enlaces del portal, detección del provider y simplificaciones

## Contexto y problema

La PR #91 (0.18.4) cerró el seguimiento del SDD externo y dejó follow-ups explícitos:

- **B11**: el portal enlaza ~24 veces a `github.com/drossan/claude-plugins/blob/main/<ruta>[#ancla]`. VitePress solo
  valida enlaces **internos** (`website/.vitepress/config.mts:23`), así que un fichero movido o un heading renombrado
  rompe esos enlaces sin que el build lo note.
- **B12**: `installed_plugins.json` solo se cita en `task-pipeline/skills/doctor/SKILL.md:249` (cat. 12), sin ruta ni
  forma. Forma observada en esta máquina (**hipótesis**: formato interno, no documentado, visto solo aquí):
  `~/.claude/plugins/installed_plugins.json` = `{ version: 2, plugins: { "<plugin>@<marketplace>": [ {scope,
  projectPath?, installPath, version, …} ] } }`, con varias entradas por plugin. `task-init` no lo cita.
- **Simplificaciones** del code review de la PR #91: riesgo 4 duplicado en el README, mención a la reapertura en el
  paso 3c que ya sale de la regla del hueco, y tres escenarios del CU que se solapan.

## Objetivos

1. **Un enlace roto a GitHub desde el portal rompe el build** (B11).
   - Decididos: el build **falla** (no solo avisa) y se valida **ruta y ancla** (slug estilo GitHub). Sin soporte del sufijo `-N` de duplicados (ningún enlace actual lo usa; un `#foo-1` se marca roto, error visible y seguro).
   - El slug ignora los bloques de código (fences), quita los backticks conservando su contenido, usa Unicode (`\p{L}\p{N}`) y declara sin soporte los headings Setext y `<a id>`; se prueba con fixtures sacados de las 8 anclas reales (12 enlaces con ancla).
   - El script corre también solo (`node website/scripts/check-github-links.mjs`, sin `pnpm install`), porque el deploy de docs solo corre en tags `v*` y no hay CI en PRs; una línea de DoD **solo en el lifecycle de este repo** (no en la plantilla, que va a consumidores sin el script) pide correrlo al tocar headings o mover ficheros bajo `task-pipeline/` o `docs/`. Un workflow de PR queda como follow-up.
   - *Criterio de éxito*: `pnpm docs:build` falla con un mensaje que nombra fichero y enlace cuando la ruta o el
     ancla de un enlace `github.com/drossan/claude-plugins/(blob|tree)/main/…` no existe en el árbol local; sin
     enlaces rotos pasa. Sin red ni dependencias nuevas.
2. **`doctor` comprueba el provider instalado con una ruta y una forma explícitas, y degrada con honestidad** (B12).
   - Vía principal = **skills visibles en la sesión**; `installed_plugins.json` solo como respaldo que **afina el diagnóstico y nunca declara «instalado/OK»** (registra instalación, no activación, que vive en `settings.json` → `enabledPlugins`). Resultados posibles: plugin ausente · instalado sin esa skill · instalado pero no cargado en esta sesión · no verificado.
   - No se deduce qué entrada aplica por `scope`/`projectPath` (9 entradas reales, una con `projectPath` de worktree): basta con que **alguna** entrada con prefijo `<plugin>@` tenga `installPath/skills/<skill>/SKILL.md`.
   - *Criterio de éxito*: la cat. 12 nombra la ruta y lo mínimo de la forma (clave `<plugin>@<marketplace>`, lista de entradas,
     `installPath`) y la comprobación de `installPath/skills/<skill>/SKILL.md`; si el fichero falta, no parsea o la forma no
     es la esperada, informa «no verificado», nunca «ausente»; el formato se declara observado y no soportado (sin `version` ni lista de campos).
3. **Menos redundancia en lo ya documentado** (simplificaciones).
   - El paso 3c **conserva** la regla de la reapertura: el CU no se materializa en consumidores, así que quitarla sería perder comportamiento, no simplificar.
   - *Criterio de éxito*: el riesgo 4 del README no repite la frase anterior y conserva su etiqueta; el CU tiene un solo `Scenario Outline` para
     reintento/reapertura/rastro (con la unión de los `Then`) en lugar de tres escenarios.
4. **Release 0.18.5 coherente**.
   - *Criterio de éxito*: `plugin.json` y CHANGELOG en 0.18.5; `claude plugin validate .` y `pnpm docs:build` en verde.

## Alcance y fuera de alcance

### Dentro del alcance
- `website/` (script de enlaces, `package.json`, `README.md`), `task-pipeline/skills/doctor/SKILL.md`,
  `task-pipeline/README.md`, lifecycle (repo + plantilla), CU `sdd-proveedor-externo.md`, un CU mínimo nuevo del portal,
  una línea en `SC-004` de `spec.md` (sin FR nuevo), CHANGELOG, `plugin.json`.

### Fuera de alcance
- Mitigaciones técnicas de M5, detectar lifecycles 0.18.0–0.18.3 y validar el contenido del provider.
- Comprobar enlaces por red (`gh`/HTTP), a ramas distintas de `main` o desde fuera de `website/`.
- Cambiar el modelo de resolución del modo SDD.
- Un workflow de CI en PRs para el check de enlaces (follow-up).

## Recursos externos

- PR #91 y su code review del plan (sección de follow-ups en el session log de `task-pipeline-sdd-externo-seguimiento-02`).
- `docs/guides/task-lifecycle.md` → «Modo SDD»; CU `.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md`.

## Estimación global

- **Tareas totales**: 3.
- **Esfuerzo estimado**: ~1–2 sesiones.
- **Recursos**: sin dependencias nuevas (Node ya presente por `website/`).

## Criterios de calidad y verificación

- Stack `none`: `grep`, `claude plugin validate .`, `cd website && pnpm docs:build`. TDD y mutation N/A;
  `sdd-lint` (modo nativo) y `fact-checker` aplican.
- B11 se prueba inyectando un enlace roto (ruta y ancla) en una copia temporal y comprobando que el build falla.

## Tasks

- [x] `task-pipeline-sdd-externo-followups-01` (P1) — Check de enlaces a GitHub en el build del portal (B11)  · depends_on: —
- [x] `task-pipeline-sdd-externo-followups-02` (P2) — `doctor`: detección precisa del provider instalado (B12)  · depends_on: —
- [x] `task-pipeline-sdd-externo-followups-03` (P3) — Simplificaciones del review y release 0.18.5  · depends_on: task-pipeline-sdd-externo-followups-01, task-pipeline-sdd-externo-followups-02

## Registro de cambios del plan

- 2026-10-24: creado (plan mode aprobado por el owner). Corrección del encargo: `task-init` no cita `installed_plugins.json`; solo `doctor`.
- 2026-10-24: refinado con `grilling` (3 preguntas, 3 decisiones del owner): (1) B11 el build **falla** ante un enlace roto; (2) B11 valida **ruta y ancla**; (3) B12 la vía principal es **skills visibles en la sesión** y `installed_plugins.json` solo respaldo. Resueltas sin preguntar: enlace a fichero nuevo en la misma PR = vale el árbol local (la red está fuera de alcance); qué entradas del JSON aplican se deduce de `scope`/`projectPath`.
- 2026-10-24: `design-review` (Opus, subagente fresco) → 9 hallazgos. Aceptados 1–5, 8 y 9 sin discusión (respaldo de B12 solo diagnóstico, sin deducir entrada por `projectPath`, formato mínimo, slug fijado con fences/backticks/Unicode y fixtures, 02 sin depender de 01, `Outline` fusionado conserva la unión de `Then`); el 4 sin el workflow de PR (follow-up). Decisiones del owner: (6) **se quita el soporte del sufijo `-N`** (revierte la parte «con sufijo -N» de la decisión del grilling); (7) **CU mínimo para B11 sin FR nuevo** (una línea en SC-004), porque en modo nativo el Gherkin vive solo en un CU.
- 2026-10-24: `scenario-coverage` (Sonnet, subagente fresco) → huecos dentro del alcance en las 3 tareas y 6 fuera. Decisiones del owner: (1) **se quita del plan la simplificación de la reapertura en 3c** (el CU con RN-7 no llega a los consumidores; quitarla sería perder comportamiento); (2) los huecos de (A) se incorporan **todos** a los CU (agrupados en `Scenario Outline`) con semántica fijada: se ignoran `#L10-L20` y la query, ancla decodificada y en minúsculas, ruta sensible a mayúsculas, 0 enlaces = fallo, URLs dentro de fences ignoradas, `srcExclude` leído como texto de `config.mts` con error explícito si no se parsea, `provider` con componentes de ruta rechazado, línea de DoD del check solo en el lifecycle del repo, RN-11 en el CU; (3) los 6 huecos de (B) **quedan fuera**: fichero local no presente aún en `main` (aceptado), sin CI en PRs (follow-up), enlaces `raw/`/otras ramas/`index.md`/`config.mts`, provider desactivado en `enabledPlugins` indistinguible de «no cargado», plugin instalado solo para otro proyecto (falso positivo asumido), providers sin `:`. Corrección de dato: el portal tiene 8 anclas distintas (12 enlaces con ancla), no 9.
