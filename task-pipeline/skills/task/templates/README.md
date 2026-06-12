# Plantillas del plugin `task-pipeline`

Estas son las **semillas** que la skill `/task` materializa en un repo que adopta
la convención `.claude/plans|tasks|specs|context`. NO son ficheros que el plugin
inyecte en contexto en runtime — son artefactos que se **copian al repo** la
primera vez y luego viven ahí (y se ajustan a las particularidades del repo).

| Plantilla | Se materializa en | Cuándo |
|---|---|---|
| `task-lifecycle.md` | `docs/guides/task-lifecycle.md` | Bootstrap del repo (una vez). Flujo canónico: estados, ramas, gates, DoD. |
| `HOW-TO-START-A-TASK.md` | `.claude/specs/<package>/HOW-TO-START-A-TASK.md` | Una vez por package. Gate de ejecución TDD del package. |
| `plan.md` | `.claude/plans/pending/<package>/<name-plan>.md` | Por cada plan nuevo (paso 3 de `/task`). |
| `task.md` | `.claude/tasks/pending/<package>/<task-id>.md` | Por cada tarea de la descomposición (paso 5 de `/task`). |

## Cómo las usa `/task`

- **Repo sin la convención** → `/task` ofrece bootstrapearla copiando
  `task-lifecycle.md` a `docs/guides/` y el `HOW-TO-START-A-TASK.md` al package.
- **Package sin su HOW-TO** → se crea desde `HOW-TO-START-A-TASK.md` (rellenando
  los bloques `ESPECÍFICO DEL PACKAGE`), en vez de "replicar el de otro package".
- **Plan / tarea nuevos** → se copian `plan.md` / `task.md` y se rellenan.

## Placeholders

Los `<package>`, `<name-plan>`, `<task-id>`, `<nnn>`, `YYYY-MM-DD` y los bloques
marcados `ESPECÍFICO DEL PACKAGE` se sustituyen al materializar. El `task.md`
exige siempre la sección `## Scenarios (Gherkin)` (fuente 1:1 de los tests); si la
tarea no produce código testeable, se justifica ahí cómo se verifica.

## Supuestos del plugin

El runner de tests es **Vitest + pnpm** y el gate de calidad es **Stryker**
(`break: 80`). Si el repo usa otro stack, ajusta los comandos en las plantillas al
materializarlas.
