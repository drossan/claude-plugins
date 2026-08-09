# Session log — task-pipeline-opus5-realignment-04

> Append-only. Tensar/calibrar los criterios del "Salto en planes triviales" (`design-review` /
> `scenario-coverage`) y dejarlos coherentes en todas sus copias.

## 2026-08-09 — Arranque

- **Plan arrancado**: `opus5-realignment` → `.claude/plans/active/task-pipeline/`, `status: active`.
  Rama `plan/task-pipeline/opus5-realignment` cortada desde `main` (local ya al día con `origin/main`;
  `git pull` falló por falta de acceso al remoto en este entorno — conocido, no bloquea).
- **Proyección GitHub** (`features.github-tracking: enabled`): padre **#27** → Project Status
  `In progress` (verificado). Tarea **#30** → Project `In progress` + label `status: in-progress` +
  assignee `danielrosse` (verificado).
- **Gate OK**: `depends_on: []` (sin bloqueos); rama del plan ✓; única tarea `active` del plan ✓.
- **Stack `none`**: TDD y gate de mutation = **N/A**. Gherkin = criterios de aceptación verificables por
  inspección / `grep`. Gate de `fact-checker` **sí** aplica.

### Corrección de Spec detectada en el arranque (verificada por `grep -rn "trivial" --include=*.md`)

La Spec afirma que los criterios viven en **CUATRO** sitios. Verificado: el **número era correcto; la
membresía, no** — falla en dos puntos. (Corrección posterior del gate `fact-checker`, ver más abajo: en
el arranque enuncié esto como "son cinco los que enumeran", y era inexacto. Antes del cambio enumeraban
**cuatro** ficheros, pero **no los cuatro de la tabla**.)

| Sitio | Realidad |
|---|---|
| `task-pipeline/skills/plan-task/SKILL.md:45-54` | fuente canónica, **enumera** ✓ (en la tabla) |
| `task-pipeline/skills/plan-task/templates/task-lifecycle.md:229-231` | **enumera** abreviado ✓ (en la tabla) |
| `docs/guides/task-lifecycle.md:222-224` | **enumera** abreviado ✓ (en la tabla) |
| `website/guia/pipeline.md:21-22` | listado en la tabla pero **NO enumera**: solo "criterios estrictos" |
| `task-pipeline/docs/flujo-del-pipeline.md:80-83` | **enumera** ("un solo fichero, sin API pública nueva, sin decisión arquitectónica") y **NO está en la tabla** |

Consecuencia: calibrar sin tocar `flujo-del-pipeline.md` dejaría los **docs del plugin contradiciendo la
skill** — justo lo que el escenario "Los criterios no divergen entre copias" existe para impedir. Se
incorpora como quinto sitio. `task-pipeline/README.md:16,109` solo **referencian** ("criterios estrictos +
confirmación + log"), no enumeran → no divergen y no se tocan. Las menciones del `CHANGELOG.md`
(:300, :320-322, :334) son **histórico narrativo** → allowlist de `CLAUDE.md`, no se tocan.

### Plan de pasos

1. Calibrar el bloque canónico en `plan-task/SKILL.md` (4 criterios, cada uno con **frontera resuelta por
   ejemplo**) + los 7 invariantes + el porqué citando el comportamiento de Opus 5.
2. Propagar **una única frase abreviada idéntica** a los otros cuatro sitios (greppable literal).
3. Verificar los 12 escenarios Gherkin por inspección/`grep`.
4. Gate `fact-checker` → cierre (histórico, task → `completed/`, tick en el plan, proyección a #30).
