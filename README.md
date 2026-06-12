# claude-plugins

Marketplace personal de **plugins para [Claude Code](https://code.claude.com/docs)**. Este repo es un *plugin marketplace*: su raíz contiene `.claude-plugin/marketplace.json` y, debajo, cada plugin con su propio manifest y sus skills.

> El nombre interno del marketplace es **`local-plugins`** (definido en `marketplace.json`), así que en los comandos `install` se referencia como `<plugin>@local-plugins` aunque el repo se llame `claude-plugins`.

## Plugins incluidos

| Plugin | Skills | Para qué sirve |
|---|---|---|
| **task-pipeline** | `/task`, `/mutation`, `grill-me` | Pipeline guiado de tarea/plan: plan mode → plan en `pending` → `grill-me` → tareas en Gherkin → TDD → gate de mutation testing (Stryker). Ver [`task-pipeline/README.md`](task-pipeline/README.md). |

Las skills quedan *namespaced* por el plugin: `/task-pipeline:task`, `/task-pipeline:mutation`, `/task-pipeline:grill-me`.

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
/task-pipeline:task "<specs de lo que quieres construir>"   # orquesta plan → grill-me → tareas → TDD → mutation
/task-pipeline:mutation                                      # gate de mutation testing al cerrar una tarea
/task-pipeline:grill-me                                      # interroga/refina un plan o diseño
```

> En un proyecto nuevo, `task` y `mutation` asumen la convención de trabajo (`.claude/plans|tasks|specs|context/`, `docs/guides/task-lifecycle.md`, **pnpm + Vitest + Stryker**). `task` ayuda a bootstrapearla o avisa antes de seguir; `grill-me` funciona en cualquier repo. Ver [Portabilidad](#portabilidad-de-las-skills).

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
    └── skills/
        ├── task/SKILL.md
        ├── mutation/SKILL.md
        └── grill-me/SKILL.md
```

## Portabilidad de las skills

- **`grill-me`** — genérica, funciona en cualquier repo.
- **`task`** y **`mutation`** — asumen una convención de trabajo (`.claude/plans|tasks|specs|context`, `docs/guides/task-lifecycle.md`, **pnpm + Vitest + Stryker**). En un repo que no la siga, arrancan pero pedirán esos ficheros o avisarán antes de continuar. Ver el detalle en [`task-pipeline/README.md`](task-pipeline/README.md).

## Versionado

Cada plugin declara su `version` en `task-pipeline/.claude-plugin/plugin.json`; súbela en cada release. Si se omite, Claude Code usa el SHA del commit como versión (útil mientras se itera).

## Validar antes de publicar

```bash
claude plugin validate .
```
