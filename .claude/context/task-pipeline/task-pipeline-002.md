# Histórico — task-pipeline-002 (Parte B: routing de modelo por fase `models:`)

> Session log append-only.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: [task-pipeline-001]` → 001 `done`; ninguna otra tarea `active`; rama del plan.
- Consume el nombre estable `grilling` de 001 (no relevante aquí) y toca las cabeceras YAML que 001 ya
  saneó (`/task`→`/plan-task`), añadiéndoles ahora los nuevos lectores.

## Decisiones + porqué

- **`models:` solo para subagentes.** Solo `design-review`/`scenario-coverage` (lanzan Agent tool) se
  rutan; el modelo se fija por invocación. Las inline (`grilling`, `mutation`, `plan-task`) heredan la
  sesión — no hay mecanismo robusto ni auto-óptimo. Repo pinea `design-review: opus`; `scenario-coverage`
  inherit (comentado); `mutation` **no** aparece (es inline). Template: ambas **comentadas** (no imponer).
- **Doc-once estricto.** La *explicación* de la limitación vive UNA vez (README del plugin →
  "Routing de modelo por fase"). Quité el clause "no hay modelo óptimo automático" de los comentarios
  YAML y de la nota de `plan-task` para no duplicarla; ahí queda solo la *regla* (inline→ignorada/hereda)
  + puntero. Root README, `docs/guides/task-lifecycle.md` y `docs/flujo-del-pipeline.md` **enlazan**, no
  reexplican.
- **Semántica del valor inválido**: aviso + inherit (nunca lanzar un subagente con `model` roto). Clave
  para fase inline → se ignora. Documentado en YAML, en ambos SKILL (Paso 2) y en el README.

## Verificación corrida + resultado (stack none → inspección)

- Cabeceras de ambos YAML incluyen `design-review` y `scenario-coverage` como lectores. ✓
- `.claude/task-pipeline.yml`: `models: { design-review: opus }`, `scenario-coverage` comentado, sin
  `mutation`. Template: `models:` + ambas claves comentadas. Ambos YAML parsean con PyYAML. ✓
- `design-review`/`scenario-coverage` SKILL Paso 2: leen `models.<fase>`, pasan `model` si válido,
  inválido→aviso+inherit, inline no se ruta. ✓
- Doc-once: `grep 'modelo óptimo automático|code.claude.com/docs'` (routing) → solo
  `task-pipeline/README.md:96` (el hit de root README:3 es un enlace genérico a Claude Code docs). ✓
- 3 referencias navegables al ancla `#routing-de-modelo-por-fase-models`, heading presente. ✓

## Docs actualizadas + motivo

- `task-pipeline/README.md`: nueva sección canónica "Routing de modelo por fase".
- root `README.md`, `docs/guides/task-lifecycle.md`, `task-pipeline/docs/flujo-del-pipeline.md`: nota +
  enlace (sin reexplicar).
- `skills/plan-task/SKILL.md`: `models:` añadido a la lectura de config con nota honesta.

## Ficheros / commit

- 8 ficheros: 2 YAML (config repo + template), 3 SKILL (design-review, scenario-coverage, plan-task),
  3 docs (2 README + task-lifecycle + flujo) — + PM (histórico + task movido).
- Commit: `task-pipeline-002: feat: routing de modelo por fase (models:) para subagentes`.

## Tiempo real

- ~1.25h (estimate 2h). Coste principal: afinar el doc-once para no duplicar la explicación.

## Follow-ups

- Ninguno bloqueante. La sección `models:` es el contrato que 003 (`doctor`) usará para detectar su
  ausencia en un repo adoptado.
