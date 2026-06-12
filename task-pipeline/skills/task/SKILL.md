---
name: task
description: Orquesta el inicio de una tarea/plan de principio a fin — plan mode → plan en pending → grill-me → tareas en Gherkin → handoff al flujo TDD → gate de mutation testing. Úsalo cuando el usuario quiera arrancar trabajo nuevo a partir de unas especificaciones (p.ej. `/task "quiero añadir X"`).
---

Eres el orquestador del flujo de trabajo del repo. A partir de las especificaciones del usuario (`$ARGUMENTS`), conduces el pipeline hasta dejar las tareas listas para ejecutar en TDD. **No es 100% automático**: hay dos checkpoints humanos no negociables (refinado con `grill-me` y aprobación del plan). No los saltes.

> **Convención asumida por este plugin** (ver el README del plugin): el repo organiza el trabajo en `.claude/plans/<estado>/<package>/`, `.claude/tasks/<estado>/<package>/`, `.claude/context/<package>/<task-id>.md`, specs en `.claude/specs/`, y tiene un `docs/guides/task-lifecycle.md` (flujo canónico) y un `HOW-TO-START-A-TASK.md` por package en `.claude/specs/<package>/`. Si el repo no sigue esta convención, primero bootstrapéala con la skill `/task-init` (o avisa al usuario) antes de continuar.

> **Plantillas (semillas)**: junto a este skill hay un directorio `templates/` (en `skills/task/templates/`). **Léelas con la tool Read** y materialízalas en el repo en vez de improvisar la estructura: `templates/task-lifecycle.md` → `docs/guides/`; `templates/HOW-TO-START-A-TASK.md` → `.claude/specs/<package>/` (rellena los bloques `ESPECÍFICO DEL PACKAGE`); `templates/plan.md` y `templates/task.md` → cada plan/tarea nuevos. No se cargan solas: tienes que abrirlas. Ver `templates/README.md` para el mapeo completo.

## Antes de nada — contexto

Lee, en este orden: (1) `docs/guides/task-lifecycle.md`, (2) el `HOW-TO-START-A-TASK.md` del package objetivo y (3) `.claude/task-pipeline.yml` (config de features del repo). No dupliques esas reglas; este playbook solo orquesta.

### Config del repo (`.claude/task-pipeline.yml`)

Antes de aplicar las fases OPCIONALES y de elegir comandos, lee `.claude/task-pipeline.yml` con **Read** y respétalo. **Resolución** (de menor a mayor prioridad): defaults internos (= preset `full`) → el preset de `mode:` → claves explícitas en `stack:`/`features:`. **Archivo, sección o clave ausente = se hereda del nivel anterior; sin archivo = todo `full`** (comportamiento histórico).

**`mode:` (preset)** — fija los defaults de las features:

| `mode` | `tdd` | `closing-documentation.*` | `mutation-gate` |
|---|---|---|---|
| `full` (default) | ON | ON | `80` |
| `legacy` | ON | ON | OFF |
| `docs-only` | OFF | ON | OFF |

**`stack:`** — usa estos valores en vez de asumir pnpm/Vitest/Stryker. Adapta los comandos de test/lint/mutation al `package-manager` y `test-runner`; `language: other` significa que "doc en el código" no es TSDoc sino el equivalente del lenguaje (o N/A); `mutation-tool: none` desactiva de facto el gate aunque `mutation-gate` traiga número.

**`features:`** (una clave explícita pisa al preset):

| Flag | Valores | Si desactivado |
|---|---|---|
| `features.tdd` | `true`/`false` | La DoD **no** exige tests/TDD ni "1 test por escenario" (escape hatch para legacy sin harness / doc-only). |
| `features.closing-documentation.tsdoc` | `true`/`false` | No exiges doc en el código en la DoD. |
| `features.closing-documentation.technical-docs` | `true`/`false` | No exiges doc técnica (README/CLAUDE.md/specs/ADRs). |
| `features.closing-documentation.context-log` | `true`/`false` | No exiges el session log en `.claude/context/`. |
| `features.mutation-gate` | `false` / `true`(=80) / `<int>` | `false`: sin gate. `<int>`: gate con ese umbral `break` (ratchet en legacy). |

> **No configurable**: `grill-me` y la aprobación del plan son checkpoints por diseño; ningún flag ni preset los desactiva.

## Paso 0 — ¿Plan nuevo o re-plan?

Antes de crear nada, comprueba si **ya existe un plan activo** (`.claude/plans/active/<package>/`) que cubra el scope pedido:

- **Sí lo cubre** → NO crees un plan nuevo (pisaría la rama). **Re-planifica in-place**: ajusta/añade/redefine tareas del plan activo, registra cada cambio en su **Plan change log**, y refina con `grill-me`. Presenta los cambios para aprobación antes de aplicarlos.
- **No lo cubre** → sigue con el flujo de plan nuevo (pasos 1-5).

Si hay duda de scope o de a qué package pertenece, pregunta con `AskUserQuestion`.

## Paso 1 — Identificar package y nombre de plan

- Infiere el `<package>` (workspace) afectado de las specs. Si es ambiguo o afecta a varios, pregunta.
- Elige un `<name-plan>` kebab-case descriptivo.

## Paso 2 — Plan mode + draft del plan

- Entra en **plan mode** (`EnterPlanMode`).
- Investiga el codebase en read-only lo necesario (usa la skill `Explore` para barridos amplios).
- Redacta el plan siguiendo la plantilla **`templates/plan.md`** (junto a este skill; ábrela con Read).
- Presenta el plan para aprobación con `ExitPlanMode`.

## Paso 3 — Escribir el plan en `pending/`

Al aprobar el usuario, escribe `.claude/plans/pending/<package>/<name-plan>.md` con el frontmatter de la plantilla (`status: pending`, `branch: plan/<package>/<name-plan>`, fechas).

## Paso 4 — Refinar con grill-me (checkpoint humano)

Invoca la skill **`grill-me`** sobre el plan. Itera hasta que sobreviva el interrogatorio; registra cada decisión en el **Plan change log**. No avances hasta que el usuario lo dé por bueno.

## Paso 5 — Descomponer en tareas pequeñas con Gherkin

Divide en tareas pequeñas (un commit lógico / una sesión). Crea cada `.claude/tasks/pending/<package>/<task-id>.md` desde la plantilla **`templates/task.md`** (junto a este skill; ábrela con Read), que incluye la sección obligatoria **`## Scenarios (Gherkin)`**. Rellena la sección **Tasks** del plan (ordenada, con `depends_on`).

### Gherkin = fuente de los tests

Cada tarea describe su comportamiento en escenarios **Given / When / Then**, fuente 1:1 de los tests TDD (el `Then` es el assert). Concretos y verificables; cubre camino feliz **y** bordes/errores (los exige el mutation testing del cierre). Si `features.tdd` es `false`, los escenarios siguen siendo útiles como **spec de comportamiento** (criterio de aceptación), pero no se exige un test por cada uno.

```gherkin
Feature: <capacidad de la tarea>

  Scenario: <caso concreto>
    Given <precondición>
    When <acción>
    Then <resultado observable y verificable>
```

## Paso 6 — Handoff al flujo TDD

Cada tarea se ejecuta en su propia sesión siguiendo el `HOW-TO-START-A-TASK.md` del package (Red → Green → Refactor; tests derivados de los escenarios Gherkin). Reporta: el plan creado y su ruta, la lista de tareas con dependencias y la primera recomendada.

## Documentar todo (tres capas — configurables)

Cada tarea documenta en tres capas, **cada una activable por flag** (default ON; ver la tabla de arriba): (1) **TSDoc en el código** de todo símbolo público (al crearlo, no al final) — `closing-documentation.tsdoc`; (2) **doc técnica/contexto** (README/CLAUDE.md/specs/ADRs) — `closing-documentation.technical-docs`; (3) **histórico de la tarea** (session log en `.claude/context/<package>/<task-id>.md`) — `closing-documentation.context-log`. Docs de dev/usuario + changeset cuando aplique. Una capa con flag `false` no entra en la DoD ni bloquea el cierre.

## Paso 7 — Gate de cierre por tarea: mutation testing

Salvo que `features.mutation-gate` sea `false` (o `stack.mutation-tool: none`), cada tarea no se cierra hasta pasar el gate de **mutation testing** con el umbral configurado (`true` = `break:80`; `<int>` = ese umbral). Ver la skill `/mutation`, que lee el mismo `stack`/umbral del YAML.

## Reglas de la sesión

- **Checkpoints humanos**: no saltes `grill-me` ni la aprobación del plan.
- **Commits deliberados**: `<task-id>: <conventional commit>` en la rama del plan.
- **Una sola tarea `active` por plan** (comparten rama).
- Si el package no tiene su `HOW-TO-START-A-TASK.md`, créalo desde `templates/HOW-TO-START-A-TASK.md` (junto a este skill; ábrela con Read y rellena los bloques `ESPECÍFICO DEL PACKAGE`) antes del handoff. Atajo: `/task-init <package>` hace exactamente eso.
