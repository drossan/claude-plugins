# Changelog — task-pipeline

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado [SemVer](https://semver.org/lang/es/). La versión vive en
`.claude-plugin/plugin.json` (es la que resuelve el marketplace).

## [0.3.0] — 2026-06-12

### Added
- **Skill `/task-init`**: bootstrap explícito de un repo en un solo comando — esqueleto
  `.claude/plans|tasks|context|specs`, `docs/guides/task-lifecycle.md` y, opcionalmente,
  el `HOW-TO-START-A-TASK.md` de un package (rellenando los bloques `ESPECÍFICO DEL
  PACKAGE`). Reemplaza el viejo `/task "inicia el proyecto…"` en lenguaje libre.
- **Hook `SessionStart`** (`hooks/hooks.json` + `hooks/bootstrap.sh`): asegura y
  auto-repara la parte genérica del scaffolding en cada arranque/resume en repos que ya
  han adoptado la convención (gate de adopción). No-op silencioso en repos no adoptados
  para no ensuciar proyectos ajenos (el plugin es global). Copia desde la misma semilla
  `skills/task/templates/task-lifecycle.md` vía `${CLAUDE_PLUGIN_ROOT}`.

### Changed
- `skills/task/SKILL.md` apunta a `/task-init` para el bootstrap del repo y del HOW-TO
  de un package, en vez de instrucciones ad-hoc.

## [0.2.0] — 2026-06-12

### Added
- Plantillas materializables en `skills/task/templates/` que `/task` lee con `Read`
  y copia al repo destino, cerrando el bootstrap (antes el skill mandaba "replicar
  el HOW-TO de otro package", que falla en un repo virgen):
  - `task.md` — plantilla de tarea con sección obligatoria `## Scenarios (Gherkin)`.
  - `plan.md` — plantilla de plan.
  - `task-lifecycle.md` — flujo canónico, autocontenido (plantillas inline) para que
    funcione una vez copiado a `docs/guides/`.
  - `HOW-TO-START-A-TASK.md` — esqueleto genérico con bloques `ESPECÍFICO DEL PACKAGE`.
  - `README.md` — mapeo plantilla → destino y placeholders.

### Changed
- `skills/task/SKILL.md` y `README.md` del plugin apuntan a las plantillas con ruta
  relativa al skill (`templates/…`), porque `${CLAUDE_PLUGIN_ROOT}` no se expande en
  el cuerpo de un `SKILL.md`. Por eso las plantillas viven dentro de `skills/task/`.

## [0.1.0]

### Added
- Versión inicial: skills `/task`, `grill-me` y `/mutation` + marketplace local.
