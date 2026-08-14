# Session log — task-pipeline-sdd-y-stack-poliglota-03

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01, 02]` → ambas done ✔; rama del plan ✔; sin otra tarea active ✔.
- Tarea 03 movida `pending → active`; GitHub #40 → In progress.
- **Objetivo**: `/task-init` detecta lenguaje por-workspace (best-effort, marcadores), propone stack por
  lenguaje, **confirma con `AskUserQuestion`** antes de escribir `stack.packages`, escritura **aditiva**
  sobre YAML ya materializado, y el HOW-TO **refleja** el stack (YAML = fuente de verdad). Ambiguo/sin
  marcador/sin canal → no adivina.

## 2026-08-14 — Cierre

### Resumen
`/task-init` extendido: Paso 0 detecta lenguaje por-workspace (marcadores); nuevo **Paso 1.5** con mapa
lenguaje→stack, `AskUserQuestion` de confirm, escritura **aditiva** sobre YAML materializado, alcance de
escaneo y saneo de clave YAML. Paso 2 rellena el bloque **"Stack de este package"** del HOW-TO. Plantilla
`HOW-TO-START-A-TASK.md` gana ese bloque (refleja `stack.packages.<pkg>`; YAML = fuente de verdad).

### Decisiones + porqué
- **Rust/Go vía escape `mutation-command`** en el mapa (no tool nombrada) — coherente con la tarea 02
  (cosmic-ray/cargo-mutants/gremlins solo en docs). No se shipea conocimiento de CLIs que nadie verificó.
- **Escritura aditiva ≠ "no pisar"**: la idempotencia de `/task-init` es a nivel de fichero; añadir una
  entrada `stack.packages.<pkg>` a un YAML ya adoptado es aditivo (cubre el escenario T-scenario-coverage
  de actualización incremental de repos ya materializados).
- **No adivina nunca**: ambiguo/en conflicto/sin marcador/sin canal → pregunta o deja sin fijar y reporta
  (F7b del design-review: best-effort + confirm, no detección infalible).

### Verificación corrida + resultado
- 7 escenarios Gherkin como criterios de aceptación (grep/inspección): cumplidos (marcadores, confirm,
  no-adivina, HOW-TO refleja, Rust/Go mutation-command, conflicto, aditiva). Sin identificadores muertos en
  la superficie nueva.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): claims 1–8 VERIFICADO. Claim 9 marcada INCORRECTO
  **por imprecisión de MI enunciado**, no por defecto de código: dije "allowlist CHANGELOG ≤0.8.1"; la
  narración legítima del rename `grill-me`→`grilling` vive en **0.9.0**. **Corrección**: la allowlist real
  (per `CLAUDE.md`) llega hasta **0.9.0** inclusive; mis ficheros de la tarea 03 tienen **cero**
  identificadores muertos. Sin cambio de código pendiente; gate satisfecho con la afirmación corregida.
- Stack `none`: no se corrió `/task-init` (verificación por inspección).

### Docs actualizadas + motivo
- `task-pipeline/skills/task-init/SKILL.md` — Paso 0 (detección) + Paso 1.5 (stack.packages) + Paso 2 (bloque HOW-TO).
- `templates/HOW-TO-START-A-TASK.md` — bloque "Stack de este package" (reflejo del YAML).
- `task-pipeline/CHANGELOG.md` — `### Added`.

### Ficheros / commits · tiempo · follow-ups
- 3 ficheros de contenido + arranque/cierre. Commit en la rama del plan con id de tarea.
- Estimado 2h · real ~40m.
- GitHub: #40 In progress → Done/close; padre #37 sigue In progress.
- Cierra el workstream A (#35). Sigue el workstream B: tarea 04 (plantillas SDD, `depends_on: —`).
