# Session log — task-pipeline-009 (Skill `pipeline-usage`)

Plan: `usage-analytics-and-caveman` · Rama: `plan/task-pipeline/usage-analytics-and-caveman`
Stack `none` (skill Markdown): TDD/mutation = N/A; Gherkin = criterios de aceptación
verificables por inspección / corriendo la agregación contra transcripts reales.

## 2026-07-16 — Arranque

- Gate: tarea `active`, sin `depends_on`; en la rama del plan; única tarea `active`. OK.
- Plan: construir `skills/pipeline-usage/SKILL.md` (playbook model-driven que agrega el
  transcript con python3 y presenta total de sesión + por-fase best-effort + por-subagente,
  con degradación ruidosa y privacidad). Estrategia de verificación: **desarrollar y probar
  la agregación python contra un transcript real** de este repo antes de fijarla en el
  SKILL.md (así los escenarios Gherkin quedan verificados de verdad, no "debería").

## 2026-07-16 — Implementación y verificación

**Qué se hizo:**
- Creada `task-pipeline/skills/pipeline-usage/SKILL.md` (playbook model-driven): localiza
  la sesión, comprueba python3, ejecuta un agregador python embebido (probado), presenta
  total de sesión (titular input+output; cache aparte) + por-fase best-effort (claves
  `attributionSkill` verbatim, con % atribuido y aviso ruidoso si <50%) + por-subagente
  (de `subagents/*.jsonl`, con modelo). Snapshot opcional en `.claude/analytics/sessions/`.
- Doc técnica: entrada en la tabla de skills del README + sección "Analítica de uso" con
  honestidad, privacidad y aviso de gitignore a consumidores.
- `.gitignore` del repo: añadido `.claude/analytics/`.

**Verificación (stack none → criterios de aceptación corriendo la agregación real):**
- Agregador probado contra 2 transcripts reales (296a: 3 MB, 8.6% atribuido → aviso;
  4423c = esta sesión: 88.8% atribuido → desglose plan-task/design-review/grilling/
  scenario-coverage + 3 subagentes con su modelo). ✓
- Bordes con transcripts artesanales: línea corrupta → descartada+contada; esquema raro →
  schema_warn; **cache contado del escalar sin doblar** (ignora el objeto `cache_creation`);
  sin subagentes → aviso; vacío → "SIN DATOS DE USO"; inexistente → "SIN DATOS". ✓
- El python **exacto** embebido en el SKILL.md se ejecutó verbatim y reprodujo todo lo anterior. ✓
- Privacidad: el agregador solo lee usage/model/timestamp/attributionSkill; **nunca** texto. ✓
- `grep`: `pipeline-usage/SKILL.md` y README con **0** `grill-me` vivo; las apariciones en
  `.claude/plans|tasks` son descriptivas (documentan el dato real + la regla), criterio de
  allowlist coherente con el CHANGELOG que narra el rename.

**Decisiones técnicas + porqué:**
- Titular = input+output (cache aparte): sumar cache engaña (cache_read llega a 124M en una
  sesión). Honestidad sobre "número grande".
- Agregación en python embebido y **probado** en vez de instrucciones para que el modelo
  improvise python: robustez + verificabilidad real.
- Id del snapshot = nombre del fichero de transcript (determinista), evita la ambigüedad
  de las claves duplicadas `session_id`/`sessionId`.
- Nota honesta en la skill: las cifras pueden diferir de la plataforma (el fichero del
  subagente design-review dio 15.971 in+out vs `subagent_tokens: 77892` de la Agent tool).

## 2026-07-16 — Cierre

- **Gate `fact-checker` (no-negociable): PASA.** Subagente fresco independiente verificó
  las 5 afirmaciones (existencia+frontmatter+python embebido; 0 `grill-me` vivo en
  SKILL.md/README; ejecución del python con todos los bordes incl. cache-escalar-sin-doblar
  contra transcript real + artesanal; `.gitignore` con `.claude/analytics/`; README
  documenta pipeline-usage). Ningún `INCORRECTO` ni `NO VERIFICABLE`.
- **DoD**: TDD/mutation = N/A (stack none); Gherkin verificados como criterios de aceptación
  corriendo la agregación; doc técnica + histórico al día; grep limpio. Todo en verde.
- **Ficheros**: `task-pipeline/skills/pipeline-usage/SKILL.md` (nuevo),
  `task-pipeline/README.md` (tabla + sección), `.gitignore` (+`.claude/analytics/`).
- **Commit**: pendiente de OK del usuario (no se pidió commitear). Rama
  `plan/task-pipeline/usage-analytics-and-caveman`.
- **Tiempo real**: ~1 sesión (misma sesión de planificación, opción 2 del handoff).
- **Follow-ups**: la próxima tarea `task-pipeline-010` (flag `features.caveman`) no depende
  de esta. El HOW-TO del package sigue referenciando la rama del plan anterior (drift a
  corregir, idealmente en la 012 o al arrancar una sesión nueva).
