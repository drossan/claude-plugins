# task-pipeline (plugin de Claude Code)

Pipeline de trabajo guiado para iniciar y ejecutar tareas con calidad:

```
/plan-task "<specs>"  →  plan mode  →  plan en .claude/plans/pending/<package>/
                 →  grilling (refinar rama a rama, checkpoint humano)
                 →  design-review (zoom-out adversario vía subagente, checkpoint)
                 →  descomponer en tareas con escenarios Gherkin
                 →  scenario-coverage (QA adversario de escenarios vía subagente)
                 →  handoff al flujo TDD (Red → Green → Refactor)
                 →  /mutation (gate de calidad de tests, Stryker break 80)
                 →  fact-checker (gate de cierre: verifica las afirmaciones de la sesión)
```

Checkpoints humanos: **`grilling`** y **aprobación del plan** son **no negociables**. Las dos pasadas caras por subagente (**`design-review`**, **`scenario-coverage`**) corren por defecto pero admiten un **salto proporcional** solo en planes triviales (criterios estrictos + confirmación del owner + log). No es fire-and-forget, por diseño.

> 📖 ¿Presentando el pipeline al equipo? Empieza por [docs/flujo-del-pipeline.md](docs/flujo-del-pipeline.md) — resumen del flujo, las skills y las ideas clave, con un ejemplo end-to-end.

## Skills

| Skill | Qué hace |
|---|---|
| `/task-init` | Bootstrapea la convención en el repo (esqueleto `.claude/…` + `task-lifecycle.md` + HOW-TO de un package). Úsalo una vez tras instalar. |
| `/plan-task` | Orquestador del pipeline completo (incl. caso re-plan de un plan activo). |
| `grilling` | Interrogatorio para refinar un plan/diseño, una pregunta a la vez (rama por rama). **Skill de terceros** (MIT, © Matt Pocock — [`mattpocock/skills`](https://github.com/mattpocock/skills)). |
| `design-review` | Revisión holística adversaria del plan vía **subagente fresco** (sin sesgo de autor): coherencia, tamaño correcto, mantenibilidad, escalabilidad real, reversibilidad. Tras `grilling`. |
| `scenario-coverage` | Endurecimiento QA de los escenarios Gherkin vía **subagente fresco**: cobertura por dimensiones (fronteras, errores, estado, requisitos ausentes…) con descarte explícito. Tras descomponer en tareas. |
| `/mutation` | Gate de mutation testing con Stryker (Vitest), por tarea, bucle de matar survivors. |
| `/doctor` | Diagnostica y alinea un repo **ya adoptado** con la versión actual del plugin: verifica (read-only) y corrige el drift (identificadores viejos, `models:` ausente, estructura incompleta, gate/reglas de honestidad ausentes) **solo tras tu aprobación** y con diff. Frontera con `/task-init` (que bootstrapea desde cero). |
| `fact-checker` | **Gate de cierre**: verifica la **veracidad de las afirmaciones** de la sesión (código, tests, librerías, imports) vía **subagente fresco** de solo lectura; salida VERIFICADO/INCORRECTO/NO VERIFICABLE. Lo invoca la DoD de cierre (tras `/mutation`, antes de commit) — **no** se auto-ejecuta. Frontera con `/doctor`: `fact-checker` = veracidad de afirmaciones; `doctor` = drift de convención. |
| `/pipeline-usage` | **Analítica de uso on-demand** (read-only): tokens (input/output/cache), modelo, tiempo y desglose **por fase** (design-review, grilling, plan-task…) y **por subagente** de la sesión, leyendo el transcript. **Best-effort** (el formato del transcript es interno/no soportado): el titular es el total de sesión y avisa cuando las cifras pueden estar incompletas. No hay recolección por hooks: invocarla es el opt-in. |

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

`grilling` y la aprobación del plan **no** son configurables: no negociables por
diseño. `design-review` y `scenario-coverage` corren por defecto; solo se saltan con
el opt-out en planes triviales (criterios + confirmación + log), no por flag de repo.

Si un repo no sigue esta convención, **bootstraséala con `/task-init`** (una vez tras instalar el plugin); `/plan-task` también avisa/ayuda si te la saltas.

## Routing de modelo por fase (`models:`)

Las fases que lanzan un **subagente** (`design-review`, `scenario-coverage`, `fact-checker`) pueden correr con un modelo distinto al de tu sesión. Se configura en la sección `models:` de `.claude/task-pipeline.yml`:

```yaml
models:
  design-review: opus        # alias o id de modelo
  # scenario-coverage:       # ausente / inherit → hereda la sesión
  # fact-checker:            # ausente / inherit → hereda la sesión (verificar es barato)
```

- **Clave ausente o `inherit`** → la fase hereda el modelo de la sesión (no se fuerza nada).
- **Alias o id de modelo** → se pasa como `model` al lanzar el subagente (Agent tool).
- **Valor inválido** (typo / id inexistente) → la skill **avisa** y cae a inherit; nunca lanza un subagente con un `model` roto.
- **Clave para una fase inline** → se ignora (esa fase hereda la sesión).

**Limitación de plataforma.** Solo las fases con **subagente** se pueden rutar, porque el modelo se fija por invocación de la Agent tool. Las fases **inline** —`grilling`, `mutation` y el propio `/plan-task`— corren en la sesión actual y **heredan su modelo**: no hay forma robusta de cambiárselo desde una skill, ni existe un "modelo óptimo" automático que el pipeline pueda elegir por ti (verificado contra `code.claude.com/docs`). Si quieres una fase inline en otro modelo, cambia el modelo de la sesión.

> El template (`skills/plan-task/templates/task-pipeline.yml`) trae `models:` **comentado**: no impone modelos a los repos que adoptan el plugin. Este repo (source del plugin) sí pinea `design-review: opus`.

## Analítica de uso (`/pipeline-usage`)

Skill **on-demand y read-only** que reporta el consumo de la sesión: tokens
(input/output/cache), modelo, duración y desglose **por fase** y **por subagente**,
leyendo el transcript. **No** añade hooks ni recolección automática — invocarla es el
opt-in, y el coste solo se paga cuando pides el informe.

- **Honestidad**: el formato del transcript es **interno/no soportado** (puede cambiar
  entre versiones). El **titular es el total de sesión**; el por-fase suele ser
  minoritario (el grueso del gasto no lleva fase) y se marca **best-effort e
  incompleto**. Nunca presenta un número que no pueda garantizar; si falta `python3`, el
  esquema no cuadra o hay líneas corruptas, **lo dice**.
- **Privacidad**: solo lee **métricas** (tokens/modelo/tiempo/fase), nunca el texto de
  los mensajes. El snapshot opcional vive en `.claude/analytics/sessions/<id>.json`.
- **Repos consumidores**: añade `.claude/analytics/` a **tu** `.gitignore` (métricas
  per-usuario). El plugin **no** toca tu `.gitignore` (invariante).

## Bootstrap del repo (tras instalar)

Dos mecanismos, complementarios:

- **`/task-init [<package>]`** (explícito, recomendado para arrancar): materializa la
  parte genérica (esqueleto `.claude/…` + `docs/guides/task-lifecycle.md`) y, si le
  pasas un package, su `HOW-TO-START-A-TASK.md` rellenando los bloques específicos.
  Reemplaza el viejo `/plan-task "inicia el proyecto…"` en lenguaje libre.
- **Hook `SessionStart`** (automático, auto-reparable): en cada arranque/resume de
  sesión, si el repo **ya está adoptado** (existe `.claude/plans|tasks|specs` o el
  `task-lifecycle.md`), asegura el esqueleto y restaura `task-lifecycle.md` si se
  borró. En repos **no adoptados** es un no-op silencioso (no ensucia proyectos
  ajenos: el plugin es global). La adopción inicial siempre es explícita con
  `/task-init`.

## Plantillas (`skills/plan-task/templates/`)

El plugin trae las **semillas** que `/plan-task` materializa en el repo (no se inyectan en runtime; el skill las lee con `Read` y las copia al repo, donde luego viven):

| Plantilla | Se materializa en |
|---|---|
| `skills/plan-task/templates/task-lifecycle.md` | `docs/guides/task-lifecycle.md` (flujo canónico, una vez) |
| `skills/plan-task/templates/task-pipeline.yml` | `.claude/task-pipeline.yml` (config del repo: preset/stack/features, una vez) |
| `skills/plan-task/templates/honesty-rules.md` | `.claude/honesty-rules.md` (reglas de honestidad; `@import` opt-in al `CLAUDE.md`, una vez) |
| `skills/plan-task/templates/coding-standards.md` | `.claude/specs/general/coding-standards.md` (no-duplicación; user-owned, una vez) |
| `skills/plan-task/templates/HOW-TO-START-A-TASK.md` | `.claude/specs/<package>/HOW-TO-START-A-TASK.md` (una vez por package) |
| `skills/plan-task/templates/plan.md` | `.claude/plans/pending/<package>/<name-plan>.md` (por plan) |
| `skills/plan-task/templates/task.md` | `.claude/tasks/pending/<package>/<task-id>.md` (por tarea; incluye `## Scenarios (Gherkin)`) |

Detalle y placeholders en `skills/plan-task/templates/README.md`. Esto cierra el bootstrap: `/plan-task` copia desde estas plantillas en vez de "replicar el HOW-TO de otro package".

> Viven **dentro** del skill `plan-task` (no en la raíz del plugin) a propósito: `${CLAUDE_PLUGIN_ROOT}` no se expande en el cuerpo de un `SKILL.md`, así que el skill las referencia con ruta relativa (`templates/…`).

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
