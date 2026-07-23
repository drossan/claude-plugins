# Histórico — task-pipeline-collision-free-ids-05

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Alineadas las copias materializadas de este repo al esquema de id plan-scoped:
`docs/guides/task-lifecycle.md` (definición del `<task-id>` + ejemplos embebidos de las plantillas de
plan/tarea) y `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md` (placeholders de id y plan de ejemplo
stale). Barrido reforzado del repo: sin esquema viejo vivo salvo la cita legacy; allowlist intacta.

**Decisiones + porqué.**
- **Ejemplo legacy concreto AQUÍ** (`task-pipeline-001..012`), no genérico: es la copia materializada de
  ESTE repo (adaptable a sus particularidades), a diferencia de la plantilla semilla (genérica `api-`,
  fijada en -01). Decisión ya registrada en el histórico de -01.
- **De-stale de `grilling-and-model-routing` → `<name-plan>`** (placeholder) en el HOW-TO: era un ejemplo
  de instrucción obsoleto (plan viejo), no historia; convertirlo en placeholder evita que vuelva a
  quedar stale.
- **Edición quirúrgica**: -05 solo alinea el ESQUEMA de id; no re-materializa el doc entero (el
  materializado tiene un comentario Gherkin más corto que la plantilla actual — fuera de alcance de -05).
- **Historia vs ejemplo**: los 001..012 en `completed/`, session logs y CHANGELOG NO se tocan (historia);
  solo se actualizan los que aparecían como ejemplo/plantilla.

**Verificación (stack `none`).** 4 escenarios por inspección + `grep` reforzado:
- Único `<package>-<nnn>` residual = cita legacy (`task-lifecycle.md:89`); 0 esquema vivo en docs/,
  .claude/specs/, README raíz, CLAUDE.md.
- Nuevo esquema presente en el lifecycle (5×); coherencia materializado↔plantilla confirmada (misma def
  de `<plan-id>`).
- Allowlist intacta: `completed/task-pipeline/task-pipeline-001..012.md` presentes; CHANGELOG intacto.
**Gate `fact-checker`** (subagente fresco, inherit): **6/6 VERIFICADO**.

**Docs actualizadas.** Materializados (lifecycle + HOW-TO). README raíz y CLAUDE.md no contenían el
esquema → sin cambios ahí. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `docs/guides/task-lifecycle.md`, `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md`.
Commit `docs: alinea materializados al id plan-scoped` con este task-id.

**Tiempo real.** ~30min (estimado 1h).

**Follow-ups.** Con -05 cierra D1 (salvo el release -06). Los catálogos raíz (README/CLAUDE.md) NO
necesitaron cambios por el esquema de id; SÍ los tocará -11 para enumerar `github-tracking` (D2).
