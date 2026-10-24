# CLI

Referencia de comandos de Claude Code para **instalar, usar y desarrollar** el plugin. Los comandos con
barra (`/…`) se teclean en una sesión de Claude Code; los `claude …` son del binario en la terminal.

## Instalar y actualizar

```
/plugin marketplace add drossan/claude-plugins    # añade el marketplace (nivel usuario)
/plugin install task-pipeline@local-plugins       # instala el plugin
/plugin marketplace update local-plugins          # actualiza tras un release
```

Equivalente por CLI, sin sesión interactiva:

```bash
claude plugin marketplace add drossan/claude-plugins
claude plugin install task-pipeline@local-plugins
```

> El nombre interno del marketplace es **`local-plugins`** (de ahí `task-pipeline@local-plugins`), aunque el
> repo se llame `claude-plugins`. Anclar a una versión: `/plugin marketplace add drossan/claude-plugins@<tag>`.
> Ver [Instalación](../guia/instalacion.md).

## Arrancar en un repo

```
/task-init            # materializa la convención (.claude/… + task-lifecycle.md + task-pipeline.yml)
/task-init <package>  # además, el HOW-TO-START-A-TASK.md de ese package
/plan-task "…"        # arranca un plan a partir de unas specs
```

## Desarrollo del plugin

Para trabajar **sobre** el plugin (no solo usarlo):

```bash
claude plugin validate .                    # valida el manifest antes de publicar
claude --plugin-dir <repo>/task-pipeline    # prueba el plugin desde disco (hot-reload)
```

```
/reload-plugins       # recarga tras editar una skill/hook con el plugin ya cargado
```

- Verificar un hook Bash: ejecútalo en un repo de prueba y comprueba el resultado; `bash -n <hook>.sh` para
  la sintaxis.
- La versión vive en `task-pipeline/.claude-plugin/plugin.json` (la que resuelve el marketplace); súbela en
  cada release (SemVer) y añade la entrada al `CHANGELOG.md`.

## Profundizar (opcional)

El detalle de publicación/versionado del plugin está en el
[README del repo](https://github.com/drossan/claude-plugins/blob/main/README.md) y el
[CHANGELOG](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/CHANGELOG.md).
