# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@.claude/honesty-rules.md

## Qué es este repo

Es un **marketplace de plugins** para Claude Code (no una app). La raíz contiene
`.claude-plugin/marketplace.json`; debajo, cada plugin con su propio manifest y skills.
Hoy hay **un solo plugin: `task-pipeline`** (en `task-pipeline/`).

- El nombre interno del marketplace es **`local-plugins`** (en `marketplace.json`), no `claude-plugins`.
  Por eso los `install` referencian `task-pipeline@local-plugins` aunque el repo se llame `claude-plugins`.
- Este repo es a la vez el **source del plugin** y un **consumidor que dogfoodea su propia convención**
  (`.claude/plans|tasks|context|specs`, `docs/guides/task-lifecycle.md`, `.claude/task-pipeline.yml`).

## Stack: no hay harness de tests (importante)

`.claude/task-pipeline.yml` declara el stack real del repo (`language: other`,
`package-manager`/`test-runner`/`mutation-tool: none`): los entregables son **skills en Markdown y hooks en
Bash**. **No existe** `pnpm`/`npm test`/`lint`/typecheck ni Stryker para el pipeline. Consecuencias directas:

- No hay comando de "build/lint/test" ni "correr un test único". Si necesitas verificar un cambio, se hace
  **corriendo la skill/hook** o por inspección, no con un runner.
- En la DoD de cierre de una tarea, los ítems de **TDD** y **gate de mutation** son **N/A** aquí; los
  escenarios Gherkin de cada tarea son **criterios de aceptación** verificables por inspección / `grep` /
  `test -d` / ejecutando la skill o el hook en un repo de prueba. El gate de `fact-checker` **sí** aplica.
- **Excepción `website/`**: el portal de documentación (VitePress) es un **sub-proyecto aislado** con su
  propio toolchain **pnpm** (`pnpm docs:build`); NO es el harness del pipeline y **no** cambia el `stack`
  del pipeline. Es decir, "no hay pnpm" aplica al pipeline (MD+Bash), no a `website/`. Ver [`website/`](website/).

## Comandos (desarrollo del plugin)

```bash
claude plugin validate .                         # validar el manifest antes de publicar
claude --plugin-dir <repo>/task-pipeline         # probar el plugin desde disco (hot-reload)
```

- Tras editar una skill/hook en una sesión con el plugin cargado: **`/reload-plugins`**.
- Instalar el marketplace local: `/plugin marketplace add <repo>` → `/plugin install task-pipeline@local-plugins`.
- Actualizar tras publicar un cambio: `/plugin marketplace update local-plugins`.
- Verificación de un hook Bash: ejecútalo en un repo de prueba (adoptado / sano / no adoptado) y comprueba
  cada resultado; `bash -n hooks/bootstrap.sh` para sintaxis.

## Release

La versión vive en `task-pipeline/.claude-plugin/plugin.json` (es la que resuelve el marketplace) —
**súbela en cada release** (SemVer). Añade la entrada correspondiente en `task-pipeline/CHANGELOG.md`
(formato Keep a Changelog). El `description` del plugin y el de `marketplace.json` deben quedar coherentes.

## Arquitectura

- **Skills = playbooks model-driven, no scripts.** Cada skill es un `SKILL.md` con frontmatter
  `name` + `description`; el cuerpo son **instrucciones que Claude sigue**, no código ejecutable. Una skill
  no puede cambiar su propio modelo — solo las fases que lanzan **subagente** (`design-review`,
  `scenario-coverage`, `fact-checker`) son ruteables vía la sección `models:` del YAML.
- **Las 10 skills** (`task-init`, `plan-task`, `mutation`, `doctor`, `grilling`, `design-review`,
  `scenario-coverage`, `fact-checker`, `pipeline-usage`, `sdd-lint`): las 8 primeras orquestan/soportan un
  pipeline (`/plan-task` es el orquestador; el flujo canónico completo está en `docs/guides/task-lifecycle.md`);
  **`pipeline-usage`** es analítica de uso **on-demand** (tokens/modelo/tiempo por fase y subagente), no
  una fase del pipeline; **`sdd-lint`** es el **gate de cierre de la capa SDD** opt-in (valida formato +
  completitud de spec EARS / caso-de-uso Gherkin / ADR MADR; solo con `features.sdd` on). Frontera clave: **`task-init`** bootstrapea un repo desde cero; **`doctor`**
  realinea un repo **ya adoptado** con la versión actual del plugin (incluye detección de **ids de
  tarea/plan duplicados** y **reconciliación best-effort md↔GitHub**). Además, el modo **caveman**
  (`features.caveman`, opt-in default off) comprime el output vía hook `UserPromptSubmit`; y el **tracking
  GitHub** opcional (`features.github-tracking`, opt-in default off) proyecta plan→issue padre y
  tarea→sub-issue (one-way md→GitHub), tejido como pasos condicionales en `/plan-task` y el lifecycle.
- **Hook `SessionStart` → `hooks/bootstrap.sh`**: en repos **ya adoptados** asegura el esqueleto y restaura
  ficheros materializados si faltan (`task-lifecycle.md`, `task-pipeline.yml`, `honesty-rules.md`). En
  repos **no adoptados es un no-op silencioso** — el plugin es global, no debe ensuciar repos ajenos.
- **`templates/` se materializa en repos CONSUMIDORES** (`skills/plan-task/templates/`): son las semillas
  que `/plan-task` y `/task-init` copian al repo. **No impongas coste/comportamiento ahí** (p.ej. `models:`
  va **comentado** en el template; este repo source sí pinea `design-review: opus` en su propio YAML).
  Viven **dentro** del skill `plan-task` a propósito: `${CLAUDE_PLUGIN_ROOT}` **no se expande** en el
  cuerpo de un `SKILL.md`, así que se referencian con ruta relativa (`templates/…`) y se leen con `Read`.

## Cómo se trabaja en este repo (dogfooding)

Los cambios se conducen con el **propio pipeline** del plugin, no ad-hoc:

- El trabajo vive en `.claude/plans/` y `.claude/tasks/` (con estados `pending|active|completed|cancelled`);
  el `status:` del frontmatter es la fuente de verdad y **se mueve el fichero al cambiarlo** (una sola
  operación). El histórico de cada tarea es append-only en `.claude/context/<package>/<task-id>.md`.
- **`main` ES la rama de integración** (no hay `dev`). Ramas de feature: `plan/<package>/<name-plan>`.
  Commits: `<task-id>: <conventional commit>`.
- **Barrido `grep` reforzado** al cerrar: sin identificadores renombrados vivos (`grill-me`, `/task` como
  comando, `skills/task/`). **Allowlist legítima** (no la toques): la **atribución** a Matt Pocock en
  `grilling/SKILL.md` + `THIRD-PARTY-NOTICES.md`; las entradas del **CHANGELOG que narran los renames**
  (`skills/task`→`plan-task` en 0.8.0; `grill-me`→`grilling` en 0.9.0); la skill **`doctor`**, que **nombra
  esos ids muertos como patrones a detectar** (no puede detectarlos sin nombrarlos); y las menciones que
  **describen este propio barrido** (aquí y en el HOW-TO).
- La skill **`grilling`** es de terceros (MIT, © Matt Pocock — `mattpocock/skills`): conserva su atribución.
