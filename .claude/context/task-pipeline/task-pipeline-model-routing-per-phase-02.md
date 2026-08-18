# Session log — task-pipeline-model-routing-per-phase-02

## 2026-08-18 — Arranque

- `depends_on: [01]` → 01 está `done`. Sin bloqueo.
- Tarea movida a `.claude/tasks/active/task-pipeline/task-pipeline-model-routing-per-phase-02.md`,
  `status: active`. Misma rama del plan (`plan/task-pipeline/model-routing-per-phase`).
- Alcance: perfil recomendado (`design-review: opus` + resto `sonnet`, incl. `sdd-lint: sonnet`) en el
  template (comentado) y activo en este repo, + tabla de recomendación inline para fases no ruteables.

## 2026-08-18 — Cierre

### Resumen

Materializado el perfil recomendado (ADR 0001) en ambos `task-pipeline.yml`: activo en este repo
(`design-review: opus`, resto `sonnet`, añadido `sdd-lint: sonnet`) y comentado en el template
(invariante "no impone coste" intacta). Añadida la tabla de recomendación de modelo de sesión para las
4 fases inline en el README del plugin.

### Decisiones técnicas + porqué

- La tabla de recomendación vive en el README del plugin (fuente canónica), no en el YAML: el bloque
  `models:` de ambos YAML solo gana una línea puntero ("tabla completa en el README → Routing de modelo
  por fase") para no duplicar contenido — mismo patrón que el resto del contrato.
- `/pipeline-usage` se documenta con Haiku en la tabla como **recomendación**, sin afirmar que su
  frontmatter ya lo fija (eso es la tarea 04, aún no ejecutada) — evita una afirmación prematura.
- Chequeo negativo B2 cumplido: la tabla no sugiere `fable` en ninguna fase (confirmado por grep).

### Verificación corrida + resultado

- **Config, por inspección**: ambos YAML parsean con PyYAML (instalado ad-hoc con `pip install --user`,
  solo tooling de verificación, no dependencia del proyecto); `models:` activo con 4 claves en este repo;
  bloque `models:` del template sigue 100% comentado (`"models" not in dict` tras parsear); tabla de
  recomendación presente en el README.
- **Gate `sdd-lint`**: ningún fichero bajo `.claude/specs/` cambió en esta tarea (confirmado con
  `git status --porcelain -- .claude/specs`) → el resultado de la tarea 01 (sin ERROR, 1 AVISO menor en
  `spec.md` FR-007/FR-008, ya reconocido) sigue vigente sin re-ejecutar el subagente semántico
  (invarianza de entrada). **Gate superado.**
- **Gate `fact-checker`**: 6/6 VERIFICADO (parseo YAML, contenido de `models:` en ambos ficheros, posición
  de la tabla, ausencia de "fable", ausencia de cambios en `.claude/specs/`).

### Documentación actualizada (rutas + motivo)

- `.claude/task-pipeline.yml` — `sdd-lint: sonnet` añadido al `models:` activo; comentario actualizado.
- `task-pipeline/skills/plan-task/templates/task-pipeline.yml` — bloque comentado actualizado con
  `sdd-lint: sonnet` + nota de perfil recomendado (ADR 0001).
- `task-pipeline/README.md` — tabla "Recomendación de modelo de sesión para fases inline".
- **SDD**: sin cambios de spec/CU (esta tarea no toca `.claude/specs/`; consume el ADR 0001 ya existente).

### Ficheros / commits

3 ficheros modificados + este session log + move de la tarea a `completed/`. Commit de cierre:
`task-pipeline-model-routing-per-phase-02: <se añade tras este log>`.

### Tiempo real

~30 min (estimate: 2h).

### Follow-ups

- Ninguno nuevo; los de la tarea 01 siguen abiertos (roster de skills sin `sdd-lint` en README raíz).
