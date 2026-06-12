# task-pipeline (plugin de Claude Code)

Pipeline de trabajo guiado para iniciar y ejecutar tareas con calidad:

```
/task "<specs>"  →  plan mode  →  plan en .claude/plans/pending/<package>/
                 →  grill-me (refinar, checkpoint humano)
                 →  descomponer en tareas con escenarios Gherkin
                 →  handoff al flujo TDD (Red → Green → Refactor)
                 →  /mutation (gate de calidad de tests, Stryker break 80)
```

Dos checkpoints humanos no negociables: **`grill-me`** y **aprobación del plan**. No es fire-and-forget, por diseño.

## Skills

| Skill | Qué hace |
|---|---|
| `/task` | Orquestador del pipeline completo (incl. caso re-plan de un plan activo). |
| `grill-me` | Interrogatorio para refinar un plan/diseño, una pregunta a la vez. |
| `/mutation` | Gate de mutation testing con Stryker (Vitest), por tarea, bucle de matar survivors. |

## Convención que asume el plugin

El plugin NO impone estructura nueva; asume que el repo ya organiza el trabajo así (lo genérico va en el plugin, lo específico del repo se queda en el repo):

```
.claude/
  plans/<estado>/<package>/<name-plan>.md      # estado: pending|active|completed|cancelled
  tasks/<estado>/<package>/<task-id>.md
  context/<package>/<task-id>.md               # histórico de sesión (append-only)
  specs/<package>/HOW-TO-START-A-TASK.md        # gate de ejecución por package
docs/guides/task-lifecycle.md                  # flujo canónico (estados, plantillas, DoD)
```

Si un repo no sigue esta convención, `/task` ayuda a bootstrapearla o avisa antes de continuar.

## Config específica del proyecto (no va en el plugin)

- Lista de workspaces/packages.
- `stryker.config.json` por package (runner, globs a mutar, umbral). El plugin trae la plantilla; el repo la materializa.
- `task-lifecycle.md`, specs y HOW-TOs propios del repo.
- Runner de tests (el plugin asume **Vitest + pnpm**; ajustar comandos si difiere).

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
