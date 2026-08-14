# Plantillas del plugin `task-pipeline`

Estas son las **semillas** que la skill `/plan-task` materializa en un repo que adopta
la convención `.claude/plans|tasks|specs|context`. NO son ficheros que el plugin
inyecte en contexto en runtime — son artefactos que se **copian al repo** la
primera vez y luego viven ahí (y se ajustan a las particularidades del repo).

| Plantilla | Se materializa en | Cuándo |
|---|---|---|
| `task-lifecycle.md` | `docs/guides/task-lifecycle.md` | Bootstrap del repo (una vez). Flujo canónico: estados, ramas, gates, DoD. |
| `task-pipeline.yml` | `.claude/task-pipeline.yml` | Bootstrap del repo (una vez). Config del repo: preset `mode` (full/legacy/docs-only), `stack` (runner/gestor/lenguaje) y `features` (tdd, documentación por capas, gate de mutation con umbral). `/task-init` rellena el stack detectado; el hook `SessionStart` la restaura. |
| `honesty-rules.md` | `.claude/honesty-rules.md` | Bootstrap del repo (una vez). Honestidad **y disciplina de trabajo** (alcance del encargo, cap de delegación en subagentes, longitud de los entregables escritos), para leerse **cada turno** vía `@import` **opt-in**. Lleva un **ancla `template-version`** en la primera línea: `/doctor` la compara con la de esta plantilla para detectar drift. `bootstrap.sh` restaura el fichero si se borra; el `@import` al `CLAUDE.md` lo **sugiere** `/task-init`/`doctor`, **nunca** se auto-escribe. |
| `coding-standards.md` | `.claude/specs/general/coding-standards.md` | Bootstrap del repo (una vez). Regla de **no-duplicación** de código. **User-owned**: `bootstrap` NO lo restaura ni `doctor` lo vigila (como el resto de specs generales). |
| `HOW-TO-START-A-TASK.md` | `.claude/specs/<package>/HOW-TO-START-A-TASK.md` | Una vez por package. Gate de ejecución TDD del package. |
| `plan.md` | `.claude/plans/pending/<package>/<name-plan>.md` | Por cada plan nuevo (paso 3 de `/plan-task`). |
| `task.md` | `.claude/tasks/pending/<package>/<task-id>.md` | Por cada tarea de la descomposición (paso 5 de `/plan-task`). |

## Plantillas SDD (opt-in, `features.sdd`)

> **Lista canónica** de las plantillas de la capa **SDD** (Spec-Driven Development). Están **gated por
> `features.sdd`** (opt-in, default off): sin el flag no se materializan ni se vigilan. Esta tabla es la
> **única fuente** de sus nombres/ubicaciones — `/doctor` la **referencia** para detectar plantillas SDD
> ausentes cuando el flag está on (no re-enumera la lista en otro sitio).

| Plantilla | Se materializa en | Qué es |
|---|---|---|
| `spec.md` | `.claude/specs/<package>/spec.md` | Requisitos (el "QUÉ"): user stories P1/P2/P3 + requisitos **EARS** + criterios `SC-00x` (GitHub Spec Kit + EARS). |
| `caso-de-uso.md` | `.claude/specs/<package>/casos-de-uso/<id>.md` | Caso de uso (el "CÓMO" del actor): Cockburn *fully-dressed* + **el Gherkin de aceptación** (única fuente del Gherkin). |
| `adr.md` | `.claude/specs/adr/NNNN-titulo.md` | Decisión de arquitectura (MADR 4.0.0, `NNNN` desde `0001`). |
| `adr-index.md` | `.claude/specs/adr/adr-index.md` | Índice de ADR (numeración `NNNN` desde `0001`, **sin `ADR-0000`** de relleno). |

Con `features.sdd` **off** (default) esta capa no existe: el Gherkin vive en la tarea (`task.md`), como hoy.
El flag lo introduce su propia tarea del plan; el flujo imperativo (Gherkin↔CU) se cablea en la del flujo SDD.

## Cómo las usa `/plan-task`

- **Repo sin la convención** → `/plan-task` ofrece bootstrapearla copiando
  `task-lifecycle.md` a `docs/guides/` y el `HOW-TO-START-A-TASK.md` al package.
- **Package sin su HOW-TO** → se crea desde `HOW-TO-START-A-TASK.md` (rellenando
  los bloques `ESPECÍFICO DEL PACKAGE`), en vez de "replicar el de otro package".
- **Plan / tarea nuevos** → se copian `plan.md` / `task.md` y se rellenan.

## Placeholders

Los `<package>`, `<name-plan>`, `<plan-id>` (= `<package>-<name-plan>`), `<task-id>`
(= `<plan-id>-<nn>`, con `<nn>` correlativo del plan desde `01` — **no** un contador
global del package), `YYYY-MM-DD` y los bloques marcados `ESPECÍFICO DEL PACKAGE` se
sustituyen al materializar. El `task.md` exige siempre la sección
`## Scenarios (Gherkin)` (fuente 1:1 de los tests); si la tarea no produce código
testeable, se justifica ahí cómo se verifica.

## Supuestos del plugin

Los **defaults** son **TypeScript + Vitest + pnpm + Stryker** (`break: 80`). Si el
repo usa otro stack, decláralo en `stack:` de `.claude/task-pipeline.yml` (las skills
eligen comandos con eso) y ajusta los comandos de las plantillas al materializarlas.
