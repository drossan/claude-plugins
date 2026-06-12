---
name: task
description: Orquesta el inicio de una tarea/plan de principio a fin — plan mode → plan en pending → grill-me → tareas en Gherkin → handoff al flujo TDD → gate de mutation testing. Úsalo cuando el usuario quiera arrancar trabajo nuevo a partir de unas especificaciones (p.ej. `/task "quiero añadir X"`).
---

Eres el orquestador del flujo de trabajo del repo. A partir de las especificaciones del usuario (`$ARGUMENTS`), conduces el pipeline hasta dejar las tareas listas para ejecutar en TDD. **No es 100% automático**: hay dos checkpoints humanos no negociables (refinado con `grill-me` y aprobación del plan). No los saltes.

> **Convención asumida por este plugin** (ver el README del plugin): el repo organiza el trabajo en `.claude/plans/<estado>/<package>/`, `.claude/tasks/<estado>/<package>/`, `.claude/context/<package>/<task-id>.md`, specs en `.claude/specs/`, y tiene un `docs/guides/task-lifecycle.md` (flujo canónico) y un `HOW-TO-START-A-TASK.md` por package en `.claude/specs/<package>/`. Si el repo no sigue esta convención, primero ayuda a bootstrapearla (o avisa al usuario) antes de continuar.

> **Plantillas (semillas)**: junto a este skill hay un directorio `templates/` (en `skills/task/templates/`). **Léelas con la tool Read** y materialízalas en el repo en vez de improvisar la estructura: `templates/task-lifecycle.md` → `docs/guides/`; `templates/HOW-TO-START-A-TASK.md` → `.claude/specs/<package>/` (rellena los bloques `ESPECÍFICO DEL PACKAGE`); `templates/plan.md` y `templates/task.md` → cada plan/tarea nuevos. No se cargan solas: tienes que abrirlas. Ver `templates/README.md` para el mapeo completo.

## Antes de nada — contexto

Lee, en este orden: (1) `docs/guides/task-lifecycle.md` y (2) el `HOW-TO-START-A-TASK.md` del package objetivo. No dupliques esas reglas; este playbook solo orquesta.

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

Cada tarea describe su comportamiento en escenarios **Given / When / Then**, fuente 1:1 de los tests TDD (el `Then` es el assert). Concretos y verificables; cubre camino feliz **y** bordes/errores (los exige el mutation testing del cierre).

```gherkin
Feature: <capacidad de la tarea>

  Scenario: <caso concreto>
    Given <precondición>
    When <acción>
    Then <resultado observable y verificable>
```

## Paso 6 — Handoff al flujo TDD

Cada tarea se ejecuta en su propia sesión siguiendo el `HOW-TO-START-A-TASK.md` del package (Red → Green → Refactor; tests derivados de los escenarios Gherkin). Reporta: el plan creado y su ruta, la lista de tareas con dependencias y la primera recomendada.

## Documentar todo (tres capas obligatorias)

Cada tarea documenta en tres capas (van en la DoD de cada task): (1) **TSDoc en el código** de todo símbolo público (al crearlo, no al final), (2) **doc técnica/contexto** (README/CLAUDE.md/specs/ADRs), (3) **histórico de la tarea** (session log en `.claude/context/<package>/<task-id>.md`). Docs de dev/usuario + changeset cuando aplique.

## Paso 7 — Gate de cierre por tarea: mutation testing

Cada tarea no se cierra hasta pasar el gate de **mutation testing** (Stryker, `break: 80`). Ver la skill `/mutation`.

## Reglas de la sesión

- **Checkpoints humanos**: no saltes `grill-me` ni la aprobación del plan.
- **Commits deliberados**: `<task-id>: <conventional commit>` en la rama del plan.
- **Una sola tarea `active` por plan** (comparten rama).
- Si el package no tiene su `HOW-TO-START-A-TASK.md`, créalo desde `templates/HOW-TO-START-A-TASK.md` (junto a este skill; ábrela con Read y rellena los bloques `ESPECÍFICO DEL PACKAGE`) antes del handoff.
