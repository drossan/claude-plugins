# Session log — task-pipeline-010 (Flag `features.caveman`)

Plan: `usage-analytics-and-caveman` · Rama: `plan/task-pipeline/usage-analytics-and-caveman`
Stack `none`: verificación por inspección/`grep` de los YAML y docs.

## 2026-07-16 — Implementación

- Gate: tarea `active`, sin `depends_on`; rama del plan; única `active`. OK.
- Añadir `features.caveman` (`off|lite|full`, default off, no-canónico→off, no en ningún
  preset): repo YAML (dogfood `lite`), template (comentado/off), README (tabla features),
  task-lifecycle (tabla flags). El hook (011) lo consume.

## 2026-07-16 — Cierre

- **Gate `fact-checker`: PASA (4/4 VERIFICADO)** por subagente independiente: repo yml
  `caveman: lite` (línea 68); template con `# caveman: off` comentado y **0** líneas
  caveman activas; README y task-lifecycle documentan `off|lite|full`, opt-in, no-preset.
- Ficheros: `.claude/task-pipeline.yml`, `templates/task-pipeline.yml`, `README.md`,
  `docs/guides/task-lifecycle.md`.
- Decisión: quité un enlace `[Modo caveman]` colgante del README (la sección la crea la
  012, y no documento el hook antes de que exista — honestidad).
- Commit pendiente (autorizado por el usuario para toda la tanda). Tiempo real: ~15 min.
