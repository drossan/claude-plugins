# Histórico — task-pipeline-collision-free-ids-03

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Añadida a `doctor/SKILL.md` la **categoría 7 de Fase 1** "Ids de tarea/plan duplicados"
(repo-owned) + su tratamiento en Fase 2 (aviso no-mecánico + T-H). Red de seguridad del esquema
plan-scoped: detecta el residual honesto (mismo `<name-plan>` / dos ramas del mismo plan).

**Decisiones + porqué.**
- **Detección, no prevención**: renumerar un id rompe `depends_on`/enlaces y exige elegir cuál cambia →
  no es mecánico → **aviso** (regla 4 de doctor), coherente con su modelo de Propiedad. No auto-edita.
- **Robustez de parseo** en paralelo a la regla "Config malformada" que doctor ya tiene: un `.md` sin
  `id:` o con YAML roto se reporta "no parseable" y el check **sigue** (no aborta ni inventa duplicado).
- **T-H (cruce D1×D2)**: si la tarea en conflicto ya tiene `issue:`, renumerar desincroniza `.md`↔issue;
  se avisa. El campo `issue:` lo formaliza -07, pero el aviso es defensivo (doctor solo mira si existe).
- **Cubre el mismo id en dos carpetas de estado** (pending/ + completed/ tras merge) y **≥3 ficheros**
  (nombra a todos), no solo el caso de dos.

**Verificación (stack `none`, skill model-driven).** 9 escenarios: 1-7 por inspección del SKILL
(doctor/SKILL.md:75-86 Fase 1; :142-148 Fase 2). Escenarios 8-9 (**sin falso positivo en repo sano**;
**legacy no disparan**) verificados **de forma real** sobre este repo:
`grep -rhoE '^id:...' .claude/tasks .claude/plans | sort | uniq -d` → **vacío** (0 duplicados);
legacy 001..012 aparecen 1 vez c/u. **Gate `fact-checker`** (subagente fresco, inherit): **7/7 VERIFICADO**.

**Docs actualizadas.** El SKILL ES la doc técnica. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/skills/doctor/SKILL.md`. Commit `feat(doctor): detección de ids
duplicados` con este task-id.

**Tiempo real.** ~30min (estimado 2h).

**Follow-ups.** -10 añade la reconciliación md↔GitHub en `/doctor` (la otra categoría nueva del SKILL,
D2). La verificación end-to-end "correr /doctor en un repo con drift inyectado" es NO VERIFICABLE de
forma reproducible aquí (skill model-driven); la lógica de detección sí se validó con grep sobre datos
reales.
