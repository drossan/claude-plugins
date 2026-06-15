# task-pipeline (plugin de Claude Code)

Pipeline de trabajo guiado para iniciar y ejecutar tareas con calidad:

```
/task "<specs>"  →  plan mode  →  plan en .claude/plans/pending/<package>/
                 →  grill-me (refinar rama a rama, checkpoint humano)
                 →  design-review (zoom-out adversario vía subagente, checkpoint)
                 →  descomponer en tareas con escenarios Gherkin
                 →  scenario-coverage (QA adversario de escenarios vía subagente)
                 →  handoff al flujo TDD (Red → Green → Refactor)
                 →  /mutation (gate de calidad de tests, Stryker break 80)
```

Checkpoints humanos: **`grill-me`** y **aprobación del plan** son **no negociables**. Las dos pasadas caras por subagente (**`design-review`**, **`scenario-coverage`**) corren por defecto pero admiten un **salto proporcional** solo en planes triviales (criterios estrictos + confirmación del owner + log). No es fire-and-forget, por diseño.

> 📖 ¿Presentando el pipeline al equipo? Empieza por [docs/flujo-del-pipeline.md](docs/flujo-del-pipeline.md) — resumen del flujo, las skills y las ideas clave, con un ejemplo end-to-end.

## Skills

| Skill | Qué hace |
|---|---|
| `/task-init` | Bootstrapea la convención en el repo (esqueleto `.claude/…` + `task-lifecycle.md` + HOW-TO de un package). Úsalo una vez tras instalar. |
| `/task` | Orquestador del pipeline completo (incl. caso re-plan de un plan activo). |
| `grill-me` | Interrogatorio para refinar un plan/diseño, una pregunta a la vez (rama por rama). |
| `design-review` | Revisión holística adversaria del plan vía **subagente fresco** (sin sesgo de autor): coherencia, tamaño correcto, mantenibilidad, escalabilidad real, reversibilidad. Tras `grill-me`. |
| `scenario-coverage` | Endurecimiento QA de los escenarios Gherkin vía **subagente fresco**: cobertura por dimensiones (fronteras, errores, estado, requisitos ausentes…) con descarte explícito. Tras descomponer en tareas. |
| `/mutation` | Gate de mutation testing con Stryker (Vitest), por tarea, bucle de matar survivors. |

## Convención que asume el plugin

El plugin NO impone estructura nueva; asume que el repo ya organiza el trabajo así (lo genérico va en el plugin, lo específico del repo se queda en el repo):

```
.claude/
  plans/<estado>/<package>/<name-plan>.md      # estado: pending|active|completed|cancelled
  tasks/<estado>/<package>/<task-id>.md
  context/<package>/<task-id>.md               # histórico de sesión (append-only)
  specs/<package>/HOW-TO-START-A-TASK.md        # gate de ejecución por package
  task-pipeline.yml                             # config de features del repo (defaults ON)
docs/guides/task-lifecycle.md                  # flujo canónico (estados, plantillas, DoD)
```

## Configuración por repo (`.claude/task-pipeline.yml`)

El pipeline se adapta al repo vía `.claude/task-pipeline.yml`. Las skills lo leen y
lo respetan. **Resolución**: defaults internos (= preset `full`) → preset de `mode:`
→ claves explícitas en `stack:`/`features:`. **Sin archivo → todo `full`** (el
comportamiento histórico, así repos existentes no cambian). `/task-init` lo
materializa rellenando el `stack` detectado, y el hook `SessionStart` lo restaura si
se borra.

**Preset (`mode`)** — para no acertar 5 flags sueltos:

| `mode` | `tdd` | docs | `mutation-gate` | Para |
|---|---|---|---|---|
| `full` (default) | ON | ON | `80` | repos con stack de tests sano |
| `legacy` | ON | ON | OFF | legacy: testeas lo que tocas, pero no llegas a 80 |
| `docs-only` | OFF | ON | OFF | solo orquestar planes + documentar |

**Stack (`stack`)** — `language`, `package-manager`, `test-runner`, `mutation-tool`:
las skills eligen comandos con esto en vez de asumir pnpm/Vitest/Stryker (cubre repos
con Jest, npm, no-TS, etc.).

**Flags (`features`)** — una clave explícita pisa el preset:

| Flag | Valores | Qué controla |
|---|---|---|
| `features.tdd` | `true`/`false` | Exigir tests/TDD en la DoD (escape hatch para legacy sin harness). |
| `features.closing-documentation.tsdoc` | `true`/`false` | Doc en el código. |
| `features.closing-documentation.technical-docs` | `true`/`false` | Doc técnica (README/CLAUDE.md/specs/ADRs). |
| `features.closing-documentation.context-log` | `true`/`false` | Session log en `.claude/context/`. |
| `features.mutation-gate` | `false`/`true`(=80)/`<int>` | Gate de mutation y su umbral `break`. |

`grill-me` y la aprobación del plan **no** son configurables: no negociables por
diseño. `design-review` y `scenario-coverage` corren por defecto; solo se saltan con
el opt-out en planes triviales (criterios + confirmación + log), no por flag de repo.

Si un repo no sigue esta convención, **bootstraséala con `/task-init`** (una vez tras instalar el plugin); `/task` también avisa/ayuda si te la saltas.

## Bootstrap del repo (tras instalar)

Dos mecanismos, complementarios:

- **`/task-init [<package>]`** (explícito, recomendado para arrancar): materializa la
  parte genérica (esqueleto `.claude/…` + `docs/guides/task-lifecycle.md`) y, si le
  pasas un package, su `HOW-TO-START-A-TASK.md` rellenando los bloques específicos.
  Reemplaza el viejo `/task "inicia el proyecto…"` en lenguaje libre.
- **Hook `SessionStart`** (automático, auto-reparable): en cada arranque/resume de
  sesión, si el repo **ya está adoptado** (existe `.claude/plans|tasks|specs` o el
  `task-lifecycle.md`), asegura el esqueleto y restaura `task-lifecycle.md` si se
  borró. En repos **no adoptados** es un no-op silencioso (no ensucia proyectos
  ajenos: el plugin es global). La adopción inicial siempre es explícita con
  `/task-init`.

## Plantillas (`skills/task/templates/`)

El plugin trae las **semillas** que `/task` materializa en el repo (no se inyectan en runtime; el skill las lee con `Read` y las copia al repo, donde luego viven):

| Plantilla | Se materializa en |
|---|---|
| `skills/task/templates/task-lifecycle.md` | `docs/guides/task-lifecycle.md` (flujo canónico, una vez) |
| `skills/task/templates/task-pipeline.yml` | `.claude/task-pipeline.yml` (config del repo: preset/stack/features, una vez) |
| `skills/task/templates/HOW-TO-START-A-TASK.md` | `.claude/specs/<package>/HOW-TO-START-A-TASK.md` (una vez por package) |
| `skills/task/templates/plan.md` | `.claude/plans/pending/<package>/<name-plan>.md` (por plan) |
| `skills/task/templates/task.md` | `.claude/tasks/pending/<package>/<task-id>.md` (por tarea; incluye `## Scenarios (Gherkin)`) |

Detalle y placeholders en `skills/task/templates/README.md`. Esto cierra el bootstrap: `/task` copia desde estas plantillas en vez de "replicar el HOW-TO de otro package".

> Viven **dentro** del skill `task` (no en la raíz del plugin) a propósito: `${CLAUDE_PLUGIN_ROOT}` no se expande en el cuerpo de un `SKILL.md`, así que el skill las referencia con ruta relativa (`templates/…`).

## Config específica del proyecto (no va en el plugin)

- Lista de workspaces/packages.
- `stryker.config.json` por package (runner, globs a mutar, umbral). El plugin trae la plantilla; el repo la materializa. El umbral `break` sale de `features.mutation-gate`.
- `task-lifecycle.md`, specs y HOW-TOs propios del repo.
- Stack (runner/gestor/lenguaje): se declara en `stack:` de `.claude/task-pipeline.yml`. Por defecto el plugin asume **TypeScript + Vitest + pnpm + Stryker**; cámbialo ahí si difiere.

## Instalar en un proyecto

El plugin vive en un marketplace local (carpeta). Para usarlo en cualquier repo:

```
/plugin marketplace add ~/claude-plugins
/plugin install task-pipeline@local-plugins
```

(O en `settings.json`: `extraKnownMarketplaces` con source `directory` apuntando a `~/claude-plugins`, y `enabledPlugins: { "task-pipeline@local-plugins": true }`.)

## Notas

- Las skills son **playbooks que Claude sigue** (model-driven), no scripts deterministas.
- `/mutation` instala Stryker en cada package la **primera vez** (one-time): el primer cierre de tarea de un package tarda algo más.
- Gotcha pnpm verificado: Stryker necesita `"plugins": ["@stryker-mutator/vitest-runner"]` explícito y se invoca con `pnpm exec stryker run` (no `npx`).
