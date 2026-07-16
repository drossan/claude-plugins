# Histórico — task-pipeline-005 (skill fact-checker + models.fact-checker)

> Session log append-only.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: []`; ninguna tarea `active`; rama `plan/task-pipeline/honesty-and-verification`
  (stack sobre 0.9.0).
- Diseño ya fijado por grilling (D1–D5), design-review (R1–R3: fact-checker = **skill**, no agents/) y
  scenario-coverage (SC-A/B/C). Molde de referencia: `skills/design-review/SKILL.md`.

## Plan de ejecución

1. `skills/fact-checker/SKILL.md`: skill que lee `models.fact-checker` y lanza `general-purpose` con
   prompt EXACTO; salida VERIFICADO/INCORRECTO/NO VERIFICABLE; nunca escribe código; description honesta.
2. `models.fact-checker` en `.claude/task-pipeline.yml` (comentado/inherit) + `templates/task-pipeline.yml`
   (comentado) + `fact-checker` en la cabecera de lectores de ambos YAML.
3. Extensión de `doctor` (SC-B, parte de 005): contemplar `fact-checker` al proponer/actualizar `models:`
   y en la cabecera; `models.fact-checker` ausente NO es drift.

## Cierre

### Decisiones + porqué
- `fact-checker` es **skill** (R1), no `agents/`: molde idéntico a `design-review`/`scenario-coverage`
  (Paso 1 reunir afirmaciones → Paso 2 leer `models.fact-checker` + lanzar `general-purpose` con prompt
  EXACTO → Paso 3 presentar informe). Modelo config-driven default **inherit** (este repo lo deja
  comentado; no pinea sonnet). `description` honesta ("NO se ejecuta sola").
- Extensión de `doctor` (SC-B): al proponer/actualizar `models:` contempla las 3 fases con subagente
  (incl. `fact-checker`); `models.fact-checker` ausente NO es drift.

### Verificación corrida + resultado (stack none → inspección)
- SKILL con frontmatter válido (name+description); 3 categorías de salida (VERIFICADO/INCORRECTO/NO
  VERIFICABLE) presentes; 4 ramas de modelo (ausente/inherit, válido, inválido→aviso+inherit, YAML
  ilegible→inherit); "tests pasan" sin runner → NO VERIFICABLE; "confía en mí" no se acepta; read-only +
  sin afirmaciones propias. ✓
- `models.fact-checker` comentado en `.claude/task-pipeline.yml` (L71) y en el template (L65); cabecera de
  lectores + comentario incluyen `fact-checker` en ambos. Ambos YAML parsean con PyYAML. ✓
- `doctor/SKILL.md` contempla `fact-checker` (2 refs). ✓
- Los 14 escenarios Gherkin de la tarea → cubiertos por inspección.

### Docs / ficheros / commit
- Nuevo `skills/fact-checker/SKILL.md`; `.claude/task-pipeline.yml` + `templates/task-pipeline.yml`
  (models.fact-checker + cabeceras); `skills/doctor/SKILL.md` (models-awareness).
- Commit: `task-pipeline-005: feat: skill fact-checker + models.fact-checker`.

### Tiempo real
- ~1h (estimate 2h).

### Follow-ups
- El gate de cierre que INVOCA a fact-checker lo cablea 006 (DoD). Aquí solo queda la skill + su config.
- `fact-checker` no está registrado como skill en la sesión (fichero nuevo, sin reload) → su verificación
  fue por inspección de instrucciones, no corriéndola como skill viva.
