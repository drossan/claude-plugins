# Instalación

task-pipeline se distribuye desde un **marketplace de plugins** de Claude Code. Se instala **a nivel de
usuario**: una vez añadido, está disponible en todos los proyectos de esa máquina.

## Añadir el marketplace e instalar

```
/plugin marketplace add drossan/claude-plugins
/plugin install task-pipeline@local-plugins
```

> El nombre interno del marketplace es **`local-plugins`**, por eso el `install` referencia
> `task-pipeline@local-plugins` aunque el repo se llame `claude-plugins`.

Equivalente por CLI (sin sesión interactiva):

```bash
claude plugin marketplace add drossan/claude-plugins
claude plugin install task-pipeline@local-plugins
```

## Anclar a una versión (opcional)

```
/plugin marketplace add drossan/claude-plugins@<tag>
```

Usa un tag SemVer publicado. La versión vigente está en el
[CHANGELOG](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/CHANGELOG.md).

## Primer uso

En un proyecto nuevo, corre **`/task-init`** una vez para materializar la convención
(`.claude/plans|tasks|specs|context/`, `docs/guides/task-lifecycle.md`, `.claude/task-pipeline.yml`). Luego
ya puedes usar `/plan-task`. El **stack** (runner/gestor/lenguaje) se declara en ese YAML.

## Actualizar

```
/plugin marketplace update local-plugins
```

> **Fuente canónica**: pasos, portabilidad y opciones en el
> [README del repo](https://github.com/drossan/claude-plugins/blob/main/README.md).
