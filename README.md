# claude-plugins

Marketplace personal de **plugins para [Claude Code](https://code.claude.com/docs)**. Este repo es un *plugin marketplace*: su raíz contiene `.claude-plugin/marketplace.json` y, debajo, cada plugin con su propio manifest y sus skills.

> El nombre interno del marketplace es **`local-plugins`** (definido en `marketplace.json`), así que en los comandos `install` se referencia como `<plugin>@local-plugins` aunque el repo se llame `claude-plugins`.

## Plugins incluidos

| Plugin | Skills | Para qué sirve |
|---|---|---|
| **task-pipeline** | `/task-init`, `/plan-task`, `/mutation`, `/doctor`, `grilling`, `design-review`, `scenario-coverage`, `fact-checker`, `/pipeline-usage` | Pipeline guiado de tarea/plan: bootstrap con `/task-init` → plan mode → plan en `pending` → `grilling` → `design-review` → tareas en Gherkin → `scenario-coverage` → TDD → gate de mutation testing (Stryker) → gate de cierre `fact-checker` (verifica las afirmaciones de la sesión). Incluye `/pipeline-usage` (analítica de uso on-demand: tokens/modelo/tiempo por fase) y los modos opcionales **caveman** (compresión de output opt-in) y **github-tracking** (proyección one-way a GitHub Issues opt-in; con detección de ids duplicados y reconciliación best-effort en `/doctor`). Configurable por repo (`.claude/task-pipeline.yml`). Ver [`task-pipeline/README.md`](task-pipeline/README.md). |

Las skills quedan *namespaced* por el plugin: `/task-pipeline:task-init`, `/task-pipeline:plan-task`, `/task-pipeline:mutation`, `/task-pipeline:doctor`, `/task-pipeline:grilling`, `/task-pipeline:design-review`, `/task-pipeline:scenario-coverage`, `/task-pipeline:fact-checker`, `/task-pipeline:pipeline-usage`.

## Instalar

Desde cualquier proyecto, añade este marketplace e instala el plugin:

```
/plugin marketplace add drossan/claude-plugins
/plugin install task-pipeline@local-plugins
```

- Se instala **a nivel de usuario** (`~/.claude/plugins/`): una vez añadido en una máquina, está disponible en **todos los proyectos** de esa máquina; no hay que reinstalarlo por repo.
- Como el repo es **público**, no necesitas clonarlo ni autenticarte: `marketplace add` lo descarga solo.
- Equivalente por **CLI** (sin entrar a la sesión interactiva):
  ```bash
  claude plugin marketplace add drossan/claude-plugins
  claude plugin install task-pipeline@local-plugins
  ```
- Anclar a una versión/rama (opcional): `/plugin marketplace add drossan/claude-plugins@v0.1.0`
- Actualizar tras un cambio publicado: `/plugin marketplace update local-plugins`
- Listar / habilitar / deshabilitar: `/plugin list`, `/plugin enable task-pipeline`, `/plugin disable task-pipeline`

## Uso

Una vez instalado, las skills se invocan **namespaced por el plugin**:

```
/task-pipeline:task-init [<package>]                           # bootstrapea la convención en el repo (una vez tras instalar)
/task-pipeline:plan-task "<specs de lo que quieres construir>" # orquesta plan → grilling → design-review → tareas → scenario-coverage → TDD → mutation
/task-pipeline:mutation                                        # gate de mutation testing al cerrar una tarea
/task-pipeline:grilling                                        # interroga/refina un plan o diseño
/task-pipeline:design-review                                   # review holística adversaria del plan (subagente fresco)
/task-pipeline:scenario-coverage                               # endurece QA de los escenarios Gherkin (subagente fresco)
/task-pipeline:doctor                                          # diagnostica/alinea un repo ya adoptado (verifica → fix con aprobación)
/task-pipeline:fact-checker                                    # gate de cierre: verifica las afirmaciones de la sesión (VERIFICADO/INCORRECTO/NO VERIFICABLE)
/task-pipeline:pipeline-usage                                  # analítica de uso on-demand (tokens/modelo/tiempo por fase y subagente)
```

> En un proyecto nuevo, corre **`/task-init`** una vez para materializar la convención (`.claude/plans|tasks|specs|context/`, `docs/guides/task-lifecycle.md`, `.claude/task-pipeline.yml`). El **stack** (runner/gestor/lenguaje) se declara en ese YAML — por defecto **pnpm + Vitest + Stryker**, pero `plan-task` y `mutation` lo respetan si difiere. `grilling` funciona en cualquier repo. Ver [Portabilidad](#portabilidad-de-las-skills).

> **Modelo por fase (opcional)**: puedes fijar el modelo de `design-review`/`scenario-coverage` en la sección `models:` de `.claude/task-pipeline.yml`. Ver [Routing de modelo por fase](task-pipeline/README.md#routing-de-modelo-por-fase-models) en el README del plugin.

### Desarrollo en local (sin GitHub)

Probar el plugin tal cual está en disco, con recarga en caliente:

```bash
claude --plugin-dir ~/claude-plugins/task-pipeline   # luego /reload-plugins al editar
```

O añadir este repo como marketplace local:

```
/plugin marketplace add ~/claude-plugins
/plugin install task-pipeline@local-plugins
```

## Estructura del repo

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json          # manifest del marketplace (name, owner, plugins[])
└── task-pipeline/
    ├── .claude-plugin/
    │   └── plugin.json           # manifest del plugin (name, version, description, author)
    ├── README.md                 # cómo funciona y qué convención asume
    ├── CHANGELOG.md              # historial de versiones (SemVer)
    ├── hooks/
    │   ├── hooks.json            # SessionStart → bootstrap.sh
    │   └── bootstrap.sh          # auto-repara el scaffolding en repos ya adoptados
    └── skills/
        ├── task-init/SKILL.md
        ├── plan-task/SKILL.md    # + templates/ (semillas materializables)
        ├── mutation/SKILL.md
        ├── doctor/SKILL.md
        ├── grilling/SKILL.md
        ├── design-review/SKILL.md
        ├── scenario-coverage/SKILL.md
        └── fact-checker/SKILL.md
```

## Portabilidad de las skills

- **`grilling`** — genérica, funciona en cualquier repo. *Skill de terceros* (MIT, © Matt Pocock — [`mattpocock/skills`](https://github.com/mattpocock/skills)); ver [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
- **`design-review`**, **`scenario-coverage`** y **`fact-checker`** — lanzan un subagente fresco sobre rutas/afirmaciones que les pasas; funcionan en cualquier repo, aunque dan su mejor resultado dentro del flujo (`fact-checker` como gate de cierre invocado por la DoD, no auto-ejecutado).
- **`task-init`**, **`plan-task`**, **`mutation`** y **`doctor`** — asumen la convención de trabajo (`.claude/plans|tasks|specs|context`, `docs/guides/task-lifecycle.md`). `/task-init` la materializa (bootstrap desde cero); `plan-task` y `mutation` la usan; **`/doctor`** verifica y realinea un repo **ya adoptado** con la versión actual del plugin (tras actualizarlo). El **stack** ya no es una asunción rígida: se declara en `.claude/task-pipeline.yml` (`stack:` — por defecto **pnpm + Vitest + Stryker**), igual que el preset (`full`/`legacy`/`docs-only`) y las features. Ver el detalle en [`task-pipeline/README.md`](task-pipeline/README.md).

## Versionado

Cada plugin declara su `version` en `task-pipeline/.claude-plugin/plugin.json`; súbela en cada release. Si se omite, Claude Code usa el SHA del commit como versión (útil mientras se itera).

## Validar antes de publicar

```bash
claude plugin validate .
```

## Licencia

Este proyecto se publica bajo licencia **MIT** (ver [`LICENSE`](LICENSE)).

Incluye software de terceros con su propia licencia; el detalle y los avisos de
copyright están en [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md). En
concreto, la skill `grilling` es de **Matt Pocock**
([`mattpocock/skills`](https://github.com/mattpocock/skills), MIT).
