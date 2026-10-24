# Las skills

task-pipeline trae **10 skills**, namespaced por el plugin (`/task-pipeline:<skill>`). Ocho orquestan o dan
soporte al pipeline; `pipeline-usage` es analítica de uso on-demand; `sdd-lint` es el gate de la capa SDD opt-in.

| Skill | Qué hace |
|---|---|
| `/task-init` | Bootstrapea la convención en el repo (esqueleto `.claude/…` + `task-lifecycle.md` + HOW-TO). Una vez tras instalar. |
| `/plan-task` | Orquestador del pipeline completo (incl. re-plan de un plan activo). |
| `grilling` | Interrogatorio para refinar un plan/diseño, una pregunta a la vez. Skill de terceros (© Matt Pocock, MIT). |
| `design-review` | Revisión holística adversaria del plan vía subagente fresco (coherencia, tamaño, mantenibilidad, reversibilidad). |
| `scenario-coverage` | Endurece los escenarios Gherkin por dimensiones (fronteras, errores, estado, requisitos ausentes…). Recibe el **plan** como dato a contrastar y separa la salida en dos: huecos **dentro** del alcance y huecos **fuera del alcance declarado**, estos últimos completos y marcados, para que decida el owner. |
| `/mutation` | Gate de mutation testing (Stryker): mata survivors hasta superar el umbral. |
| `/doctor` | Diagnostica y alinea un repo **ya adoptado** con la versión actual del plugin (drift, ids duplicados). |
| `fact-checker` | Gate de cierre: verifica la veracidad de las afirmaciones de la sesión (subagente de solo lectura). |
| `/pipeline-usage` | Analítica de uso on-demand (tokens/modelo/tiempo por fase y subagente). Read-only, best-effort. |
| `/sdd-lint` | Gate de cierre de la capa SDD (solo `features.sdd` on): valida formato + completitud de spec EARS / caso-de-uso Gherkin / ADR MADR (mecánico + subagente semántico). ERROR bloquea / AVISO no; entre `/mutation` y `fact-checker`. Helper Bash opcional para CI. |

## Frontera clave

- **`task-init`** bootstrapea un repo desde cero; **`doctor`** realinea un repo ya adoptado tras actualizar
  el plugin. No se solapan.
- **`fact-checker`** verifica la **veracidad de afirmaciones**; **`doctor`** verifica el **drift de
  convención**. Tampoco se solapan.

## Portabilidad

`grilling`, `design-review`, `scenario-coverage` y `fact-checker` funcionan en cualquier repo. `task-init`,
`plan-task`, `mutation` y `doctor` asumen la convención `.claude/plans|tasks|specs|context`. `sdd-lint` va
más allá: asume además la capa SDD (`.claude/specs/<pkg>/` con spec EARS / caso-de-uso / ADR) y solo aporta
valor con `features.sdd` on.

## Profundizar (opcional)

La descripción larga de cada skill y sus fronteras exactas están en el
[README del plugin → Skills](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md#skills).
No hace falta para saber cuál usar.
