# Session log — task-pipeline-sdd-y-stack-poliglota-06

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [04, 05]` → ambas done ✔; rama del plan ✔; sin otra tarea active ✔.
- Tarea 06 movida `pending → active`; GitHub #43 → In progress.
- **Objetivo**: cablear el flujo SDD imperativo (gated `features.sdd`) y cerrar F3 (Gherkin↔CU): con SDD on
  el CU es la **única fuente** del Gherkin, la tarea **enlaza**, `scenario-coverage` retro-alimenta el CU,
  `/mutation` sigue el enlace; DoD gated ("spec+CU o 'sin cambios'"); bootstrap del primer spec/CU; enlace
  roto reportado; convivencia inline↔CU sin migración forzada. Con SDD off = byte-idéntico a hoy.

## 2026-08-14 — Cierre

### Resumen
Flujo SDD imperativo cableado (gated `features.sdd`) en 9 sedes: línea de DoD gated (task.md + 2×lifecycle),
bloque "Flujo SDD" en "Cerrar una tarea" (2×lifecycle), nota de orquestación (plan-task), entrada+salida
(scenario-coverage), Paso 4 (mutation), nota en `## Scenarios` (task.md), flujo en README + portal +
CHANGELOG. Cierra F3: con SDD on el CU es la única fuente del Gherkin, la tarea enlaza.

### Decisiones + porqué
- **CU = única fuente** con SDD on; la tarea **enlaza** (F3 del design-review). Resuelve la contradicción
  "Gherkin = fuente de tests" ↔ "Gherkin solo en el CU": scenario-coverage (entrada sigue el enlace, salida
  retro-alimenta el CU) y /mutation (Paso 4 sigue el enlace) apuntan al CU, no a la tarea.
- **Bloque de flujo en "Cerrar una tarea"** (no como paso numerado nuevo) para no renumerar los pasos
  existentes de la lifecycle; byte-idéntico en ambas copias.
- **DoD gated + "sin cambios" en checkbox + session log** (no en el CU): declaración explícita, no silencio.
- **Off = byte-idéntico a hoy**: todas las notas están gated "on"; tras el fact-checker hice
  auto-contenidas las dos que no reafirmaban el off (scenario-coverage SALIDA + mutation Paso 4).

### Verificación corrida + resultado
- 10 escenarios Gherkin como criterios de aceptación (grep/inspección): cumplidos. DoD espejo consistente
  (task.md ↔ 2×lifecycle); bloque de flujo idéntico en ambas lifecycle; sin identificadores muertos.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): claims 1-6, 8-10 VERIFICADO. Claim 7 INCORRECTO
  (matizado): la parte sustantiva ("ninguna nota cambia el comportamiento off") VERIFICADA; mi enunciado
  "TODAS afirman off" fue sobre-afirmación. **Corregido**: añadí cláusula off explícita a las 2 notas que no
  la tenían (scenario-coverage SALIDA, mutation Paso 4). Sin defecto de comportamiento; off intacto.

### Docs actualizadas + motivo
- `task.md` (Scenarios note + DoD line), `templates/task-lifecycle.md` + `docs/guides/task-lifecycle.md`
  (DoD line + bloque Flujo SDD), `plan-task/SKILL.md` (orquestación + Paso 5.5), `scenario-coverage/SKILL.md`
  (entrada+salida), `mutation/SKILL.md` (Paso 4), `README.md` (flujo), `website/features/sdd.md` (flujo),
  `CHANGELOG.md` (### Added).

### Ficheros / commits · tiempo · follow-ups
- 9 ficheros de contenido + arranque/cierre. Commit en la rama del plan.
- Estimado 3h · real ~1h10m. **Cierra el workstream B (#36).**
- GitHub: #43 In progress → Done/close; padre #37 sigue In progress.
- Follow-ups: tarea 07 (doctor reconoce features.sdd + stack.packages + plantillas SDD ausentes con flag on)
  y 08 (release: e2e coherencia + bump + consolidar CHANGELOG + cierre del plan/padre #37).
