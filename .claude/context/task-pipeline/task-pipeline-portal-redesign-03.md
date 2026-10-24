# Session log — task-pipeline-portal-redesign-03

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01, 02]` ambas `completed` ✔; en la rama del plan
  `plan/task-pipeline/portal-redesign` ✔; sin otra tarea `active` (03 es la única) ✔.
- Plan `portal-redesign` ya `active`; tarea 03 → `active`. GitHub sub-issue #61 → In progress (best-effort al cierre).
- **Objetivo**: sección **Empezar** autocontenida — reescribir `guia/que-es.md` e `guia/instalacion.md`
  (enlaces al README solo como *profundizar*, no tapón) y crear `guia/tu-primer-plan.md`: walkthrough e2e
  con un **caso real cerrado** del repo.
- **Caso real elegido para el walkthrough**: `sdd-validation-gate` (plan cerrado, issue #51). Motivo: es el
  caso más completo del histórico — recorre las **cinco fases** con material fiel: `AskUserQuestion` (2
  decisiones) → `grilling` (4) → **design-review que TUMBÓ una decisión** (Bash-como-gate → skill-como-gate,
  Opción 3) → `scenario-coverage` → ejecución + retro con bugs reales (Bash 3.2 macOS, falso positivo de ids).
  El "design-review que cambia el plan" es la lección de más valor contra "no queda claro cómo funciona".
- **Extractos**: copias **congeladas** (VitePress no incluye `.claude/**`), marcadas con ruta de origen +
  fecha de congelación (2026-08-14) → van al barrido de coherencia de la task 07.

## 2026-08-14 — Cierre

### Resumen
Sección **Empezar** completa y autocontenida:
- `guia/que-es.md` e `guia/instalacion.md`: el tapón `> Fuente canónica → README` sustituido por una sección
  **Profundizar (opcional)** (README/lifecycle como referencia técnica, no como dependencia). Añadidos punteros
  a *Tu primer plan* como siguiente paso natural.
- **Nueva** `guia/tu-primer-plan.md`: walkthrough e2e del caso real `sdd-validation-gate` — 6 pasos
  (arrancar → grilling → design-review → aprobar/descomponer → scenario-coverage → ejecutar/cerrar) + tabla
  "qué decides tú" + 1 diagrama Mermaid del recorrido con el **tema de la task 02** (paleta por rol). 5
  extractos congelados fieles (plan.md, grilling, design-review, task.md Gherkin, session-log, retro).

### Decisiones + porqué
- **Caso elegido = `sdd-validation-gate`**: el único del histórico que recorre las cinco fases con material
  fiel Y donde la **design-review tumbó una decisión** (Bash-como-gate → skill-como-gate). Ese giro es la
  lección de más valor contra "no queda claro cómo funciona"; muestra que los checkpoints no son sello de goma.
- **Un solo diagrama** (journey del caso), no un clon del flowchart de `guia/pipeline` (que es genérico): el
  diagrama concreto anota lo que hizo el humano en este caso → additivo, no duplica.
- **Gates del caso mostrados con honestidad**: stack `none` → mutation/TDD **N/A**; el gate que corrió es
  `fact-checker` (11/11). No se afirma que `sdd-lint` corriera en este caso (no estaba en su DoD).

### Verificación corrida + resultado
- `pnpm docs:build`: **exit 0**, sin dead links (`ignoreDeadLinks:false`).
- Diagrama Mermaid renderizado en navegador (`docs:preview` :4173) en **claro Y oscuro**: 1 SVG, 0 errores;
  fills = paleta por rol exacta (5 gris · 2 ámbar · 2 azul · 1 rojo), texto `#1f2937` legible en ambos modos;
  leyenda presente.
- **Gate `fact-checker`** (subagente fresco, `sonnet`, per `models.fact-checker`): **16/16 VERIFICADO, 0
  INCORRECTO, 0 NO VERIFICABLE** — incl. fidelidad de los 5 extractos congelados (el Gherkin es verbatim).
- Sin identificadores muertos introducidos.

### Docs · ficheros · follow-ups
- `website/guia/que-es.md` (edit), `website/guia/instalacion.md` (edit), `website/guia/tu-primer-plan.md` (nueva).
- GitHub (best-effort): cerrar la sub-issue #61 quedó **BLOQUEADO** por el clasificador de permisos
  (escritura externa a un issue no creado esta sesión, sin autorización explícita del owner). **Pendiente**:
  que el owner cierre #61 o conceda permiso. El trabajo en sí está commiteado; esto no bloquea el cierre local.
- Estimado 4h · real ~2h. Siguiente: task 04 (Conceptos).
