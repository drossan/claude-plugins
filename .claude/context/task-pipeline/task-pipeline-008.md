# Histórico — task-pipeline-008 (registro de fact-checker + release 0.10.0)

> Session log append-only.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: [005, 006, 007]` → los tres en `done` ✓; ninguna tarea `active` ✓; rama
  `plan/task-pipeline/honesty-and-verification` ✓.
- Última tarea del plan: registro documental de `fact-checker` (patrón `doctor`) + release (bump + CHANGELOG
  Added/Migration). Versión **0.10.0** (minor; features nuevas, sin BREAKING), confirmada por el owner
  ("bump a 0.10.0"), coherente con las referencias vivas a 0.10.0 que dejaron 006 (doctor cat. 5) y 007.
- **Detenerse antes de abrir el PR** (instrucción del owner): cierro la tarea y dejo el plan listo para PR.

## Plan de ejecución

1. Metadatos: `plugin.json` (version 0.9.0→0.10.0 + prosa con fact-checker), `marketplace.json` (prosa).
2. Ambos README: tabla de skills (7→8) + lista de comandos namespaced (`/task-pipeline:fact-checker`) +
   árbol de estructura; frontera con doctor; prosa honesta (gate de cierre, no auto-invocación).
3. `flujo-del-pipeline.md`: conteo "Las 8 skills" + fila fact-checker + ubicarlo como **gate de cierre**
   (no fase de plan) en diagrama/narrativa.
4. CHANGELOG: `## [0.10.0]` con Added (fact-checker + models.fact-checker + gate en DoD + honesty-rules +
   no-duplicación + doctor extendido) y Migration; NO tocar entradas ≤ 0.9.0.
5. Cerrar tarea (histórico + completed + tick) + plan → completed. **PR: pendiente de owner.**

## Cierre

### Decisiones + porqué
- **Versión 0.10.0** (minor): 005/006/007 añaden features sin BREAKING. Coherente con las referencias vivas
  a 0.10.0 que dejaron 006 (doctor cat. 5) y el escenario 9. Confirmado por el owner.
- **`fact-checker` ubicado como gate de cierre**, no como fase de plan, en diagrama/narrativa (Spec):
  aparece junto a `/mutation` en el Paso 7 (cierre de tarea) y en los "no negociables", no en los pasos
  4.x de plan. En la tabla de skills se agrupa con los otros gates por subagente.
- **Routing de modelo actualizado** para listar `fact-checker` como 3ª fase ruteable (coherencia con
  `models.fact-checker` de 005) — accuracy del README, no over-reach.
- **CHANGELOG honesto sobre coding-standards**: se describe como "plantilla materializable, user-owned" con
  destino `.claude/specs/general/coding-standards.md`; NO se afirma que exista materializado en este repo
  (no existe, por la decisión de alcance de 007). Verificado por el gate.
- **Plan → completed pero PR diferido**: el owner pidió detenerse antes del PR. Mover el plan a `completed`
  es bookkeeping local reversible (parte de la DoD); el PR (outward-facing) queda pendiente.

### Verificación corrida + resultado (stack none → inspección + validate + gate fact-checker)
- JSON de `plugin.json`/`marketplace.json` parsean; `version` = `0.10.0`.
- `claude plugin validate .` → ✔ Validation passed (exit 0).
- CHANGELOG: `git diff --unified=0` → **0 líneas eliminadas** (historial ≤0.9.0 intacto; cambio aditivo).
- `fact-checker` presente en las 6 superficies (ambos README, flujo, plugin.json, marketplace.json,
  CHANGELOG); "Las 8 skills" en el flujo.
- **Gate `fact-checker` dogfooded** (subagente independiente): 8 afirmaciones → **8/8 VERIFICADO**.
- Los 8 escenarios Gherkin cubiertos por inspección:
  1 (fact-checker en superficie documental) ✓ ambos README + prosa metadatos.
  2 (bump 0.10.0) ✓ plugin.json.
  3 (CHANGELOG con Added + Migration) ✓.
  4 (historial intacto) ✓ 0 borrados.
  5 (notas reflejan lo entregado) ✓ skill + honesty-rules + coding-standards (plantilla) existen.
  6 (conteo de skills + diagrama) ✓ "Las 8 skills" + fact-checker como gate de cierre.
  7 (frontera con doctor) ✓ tabla de skills del README del plugin + flujo.
  8 (prosa sin auto-invocación) ✓ las 4 superficies dicen "no se auto-ejecuta / invocado por la DoD".

### Docs / ficheros / commit
- `plugin.json` (version + prosa), `marketplace.json` (prosa), `README.md` (tabla/lista/uso/árbol/
  portabilidad), `task-pipeline/README.md` (flujo + tabla skills + routing), `flujo-del-pipeline.md`
  (conteo + fila + diagrama + gates), `CHANGELOG.md` ([0.10.0] Added + Migration).
- Commit: `task-pipeline-008: chore(task-pipeline): release 0.10.0`.

### Tiempo real
- ~0.5h (estimate 1h).

### Follow-ups
- **PR pendiente** (diferido por el owner): abrir desde `plan/task-pipeline/honesty-and-verification`. OJO:
  este plan hace **stack** sobre `plan/task-pipeline/grilling-and-model-routing` (0.9.0, PR #6 sin mergear)
  → el destino del PR depende de cómo se resuelva #6 (mergear #6 primero, o rebasar/apuntar según se
  decida). Borrar la rama tras el merge.
- **Este repo queda auto-detectable por `doctor`** (cat. 5 gate ausente + cat. 6 honesty-rules ausente):
  intencional. Correr `/doctor` o `/task-init` para materializar cuando se quiera.
</content>
