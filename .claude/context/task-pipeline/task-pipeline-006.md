# Histórico — task-pipeline-006 (gate fact-checker en la DoD + frontera con doctor)

> Session log append-only.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: [task-pipeline-005]` → 005 en `completed/` con `status: done` ✓; ninguna tarea
  `active` al arrancar ✓; rama `plan/task-pipeline/honesty-and-verification` (stack sobre 0.9.0) ✓.
- Diseño ya fijado por grilling (D1–D5), design-review (R3: gate no-negociable, sin `features.fact-check`;
  R1: fact-checker = skill) y scenario-coverage (SC-A: `INCORRECTO` bloquea / `NO VERIFICABLE` avisa /
  `VERIFICADO` pasa, orden tras `mutation`; SC-B: doctor detecta el gate ausente en repos ya adoptados).
- La skill `fact-checker` y `models.fact-checker` ya existen (005). Aquí se **cablea el gate** en la doc del
  flujo (no un hook: un hook no puede invocar un subagente) + frontera con `doctor`.

## Plan de ejecución

1. Template `HOW-TO-START-A-TASK.md` (bloque de cierre): añadir el gate `fact-checker` tras `mutation`,
   antes de commit/resumen; verdictos SC-A; no-negociable (sin flag).
2. Template `task-lifecycle.md` (sección "Cerrar una tarea" + DoD de la plantilla de tarea): ídem.
3. Template `task.md` (DoD): checkbox del gate `fact-checker` (no feature-gated).
4. `plan-task/SKILL.md`: mención del gate de cierre `fact-checker` (Paso 8 + reglas de sesión).
5. `doctor/SKILL.md` (SC-B, slice 006): detectar el gate ausente en la DoD materializada de repos ya
   adoptados (repo-owned, diff + aprobación) + frase de frontera con `fact-checker`.
6. Frontera `fact-checker` ↔ `doctor` explícita (cuerpos de ambas skills).

**Decisión de alcance**: NO reescribo la DoD materializada de ESTE repo (`docs/guides/task-lifecycle.md`,
`.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md`). El Spec nombra solo los **templates**; la propagación
a repos ya adoptados (incl. este) es, por diseño (SC-B), trabajo de `doctor`. Además este repo es el fixture
natural del escenario "doctor detecta el gate ausente".

## Cierre

### Decisiones + porqué
- **Alcance = templates + skills, no la DoD materializada de este repo** (ver arriba). Precedente inverso
  en 005: allí el Spec nombraba explícitamente `.claude/task-pipeline.yml`, así que se tocó; aquí el Spec
  nombra solo los `templates/`, y SC-B delega la propagación a `doctor`. Consistente.
- **Orden del gate = paso 4 de "Cerrar una tarea"** (justo tras mutation, paso 3): el Spec ancla
  "tras mutation … antes de commit/resumen"; agruparlo con los gates de calidad es coherente y su texto
  fija el límite final ("antes de commit y del resumen"). Renumerados 4→5…7→8 y la ref. cruzada del
  session log a "(paso 6)".
- **Gate en la DoD como checkbox SIN condición de flag** (task.md + task-lifecycle embebido): es
  no-negociable (R3), a diferencia de las líneas TDD/mutation que llevan `· solo si <flag>`. La nota de la
  plantilla ("solo las líneas con flag son condicionales") lo hace correcto sin tocarla.
- **`plan-task`: Paso 8 (paralelo al Paso 7 de mutation) + regla de sesión**, en vez de solo un inciso en
  Paso 6. Es más discoverable y simétrico; satisface "mención en plan-task" (DoD) y "reglas de sesión"
  (Spec). El Paso 8 niega explícitamente `features.fact-check` (escenario "no configurable por flag").
- **`doctor`: categoría 5 nueva en Fase 1** (sin renumerar 1-4) + fix seguro en Fase 2 con la salvaguarda
  de "prosa personalizada → aviso" (regla 4 de doctor). Frontera con `fact-checker` en la intro.
- **Frontera en ambos SKILL bodies** (fact-checker ↔ doctor), espejo mutuo, en vez de en el README:
  registrar `fact-checker` en el README/skills-table es trabajo de 008; poner la frontera en los cuerpos
  la hace explícita ya, sin depender del orden de 008.

### Verificación corrida + resultado (stack none → gate fact-checker + inspección)
- **Se dogfoodeó el propio gate**: subagente `fact-checker` independiente (general-purpose, read-only +
  Bash; `models.fact-checker` = inherit → sin `model`) sobre 8 afirmaciones factuales de la sesión →
  **8/8 VERIFICADO**, 0 INCORRECTO, 0 NO VERIFICABLE. Nada bloqueó el cierre.
- Los 9 escenarios Gherkin de la tarea → cubiertos por inspección:
  1 (cierre exige fact-checker) ✓ HOW-TO p6 + "Al terminar"; task-lifecycle p4 + checkbox.
  2 (INCORRECTO bloquea) ✓ todas las superficies.
  3 (no configurable por flag) ✓ plan-task Paso 8 niega `features.fact-check`; checkboxes "sin flag".
  4 (frontera con doctor explícita) ✓ ambos SKILL bodies.
  5 (NO VERIFICABLE avisa, no bloquea; VERIFICADO pasa) ✓ todas las superficies.
  6 (sin afirmaciones → gate vacío) ✓ por composición: "solo INCORRECTO bloquea" + la skill (005) dice
    "si no hay afirmaciones, dilo y termina" → sin INCORRECTO → no bloquea. Verificado en la práctica: el
    gate corrido arriba habría pasado igual con 0 afirmaciones.
  7 (aplica en cualquier preset) ✓ texto "aplica en cualquier preset/mode" + checkbox sin flag.
  8 (orden con mutation explícito) ✓ paso 4 tras mutation, "(incluida «mutation pasó»)".
  9 (doctor detecta el gate ausente en repo adoptado) ✓ doctor Fase 1 cat. 5 + Fase 2.

### Docs / ficheros / commit
- Templates: `HOW-TO-START-A-TASK.md` (p6 + "Al terminar"), `task-lifecycle.md` ("Cerrar una tarea" p4 +
  renumeración + checkbox DoD embebido), `task.md` (checkbox DoD).
- Skills: `plan-task/SKILL.md` (Paso 8 + regla), `doctor/SKILL.md` (frontera + Fase 1 cat. 5 + fix seguro),
  `fact-checker/SKILL.md` (frontera).
- Commit: `task-pipeline-006: feat: gate fact-checker en la DoD de cierre`.

### Tiempo real
- ~0.75h (estimate 1.5h).

### Follow-ups
- **008 debe bumpear a 0.10.0**: `doctor` (cat. 5) y el escenario 9 fijan "antes de 0.10.0" como la versión
  que introduce el gate. Si 008 elige otra versión, hay que alinear ambas referencias.
- **Este repo quedará en "drift" auto-detectable**: su `docs/guides/task-lifecycle.md` y
  `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md` no tienen el gate → `doctor` (cat. 5) lo reportará.
  Es intencional (fixture del escenario 9 + propagación por doctor). El owner puede correr `/doctor` para
  materializarlo cuando quiera, o dejarlo como demostración.
- 008 registra `fact-checker` en el README/skills-table + CHANGELOG (Added + Migration) y refleja la
  frontera en el README.
</content>
</invoke>
