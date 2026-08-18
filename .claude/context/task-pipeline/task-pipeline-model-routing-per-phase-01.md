# Session log — task-pipeline-model-routing-per-phase-01

## 2026-08-18 — Arranque

- Plan y tareas del plan `model-routing-per-phase` ya estaban commiteados en `main` (commit `78f0ffe`),
  no "pendientes sin commitear" como decía el prompt de arranque — verificado con `git log`/`git show
  --stat 78f0ffe`. Se avisó al usuario; no bloquea el arranque, solo hace innecesario el paso de
  "commitear la base en la rama" (ya viene heredada de `main`).
- Rama creada: `plan/task-pipeline/model-routing-per-phase` (desde `main`).
- Plan movido a `.claude/plans/active/task-pipeline/model-routing-per-phase.md`, `status: active`.
- Tarea movida a `.claude/tasks/active/task-pipeline/task-pipeline-model-routing-per-phase-01.md`,
  `status: active`.
- `depends_on: []` → sin bloqueo. Única tarea `active` del plan (comparten rama).

## 2026-08-18 — Cierre

### Resumen

Reconciliado el contrato de fases ruteables ("3 fases siempre ruteables — `design-review`,
`scenario-coverage`, `fact-checker` — + `sdd-lint`, condicional a `features.sdd` on") en todas las copias
vivas, y corregida la "Limitación de plataforma" del README del plugin, que negaba sin matices que una
skill pudiera cambiar su propio modelo.

### Decisiones técnicas + porqué

- **Re-confirmación previa a redactar** (load-bearing, señalado por `design-review`): delegada a un
  subagente `claude-code-guide` contra `code.claude.com/docs/en/skills.md` ("Frontmatter reference").
  Confirmado: `SKILL.md` admite `model:` en frontmatter (mismos alias que `/model`, o `inherit`); el
  override es **por-turno** (aplica al turno de invocación, se resetea en el siguiente prompt) y
  **estático** (valor fijo, no computado en tiempo de ejecución). Conclusión aplicada al README: el
  routing dinámico per-repo basado en leer `.claude/task-pipeline.yml` en tiempo de ejecución solo lo
  permite lanzar un subagente (Agent tool) — de ahí "robusto = subagente-only".
- **Alcance de la reconciliación**: además de los 5 ficheros + 2 cabeceras YAML listados en el `## Spec`
  de esta tarea, se incluyó `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md:45-46` (nombrado
  explícitamente en el `Registro de cambios` del plan bajo "Copias a reconciliar") porque repetía la
  misma afirmación desactualizada sin matiz de frontmatter/sdd-lint.
- **No tocado deliberadamente** (fuera de alcance de esta tarea, confirmado por `git status`/grep antes de
  cerrar): `website/guia/configuracion.md` y `website/guia/pipeline.md` (tarea 06), `skills/doctor/SKILL.md`
  (tarea 05), valores de `models:` (tarea 02), modeline JSON schema (tarea 03). Se detectó además que el
  **roster general de skills** de `README.md` raíz (línea 13 y el árbol de ficheros ~85-99, más
  "Portabilidad de las skills" ~103-104) no incluye `sdd-lint` entre las 10 skills — es un gap **preexistente
  y no relacionado** con el contrato `models:` (no es un conteo de fases ruteables), así que se deja como
  follow-up y no se toca en esta tarea.

### Aviso al usuario (discrepancia de contexto)

El prompt de arranque afirmaba que el plan/tareas/scaffolding SDD estaban "sin commitear en main". Verificado
con `git log`/`git show --stat 78f0ffe`: **ya estaban commiteados** en `main` (commit `78f0ffe`), aunque en
`status: pending`. Se avisó al usuario en el propio turno; no bloqueó el arranque — solo hizo innecesario
"commitear la base en la rama" (ya venía heredada de `main` al cortar la rama).

### Verificación corrida + resultado

- **CU `routing-contrato`** (criterio de aceptación de esta tarea): verificado por inspección que los 4
  `SKILL.md` ruteables (`design-review:21`, `scenario-coverage:46`, `fact-checker:26`, `sdd-lint:28`) ya
  implementan "lee `models.<fase>` con `Read`, sin parser" — consistente con el contrato documentado.
- **Barrido `grep` reforzado**: sin conteos de fase contradictorios en ficheros vivos; sin afirmación viva
  de "no puede cambiar[se] el modelo" salvo en la propia tarea 01 (cita el texto viejo como lo que corrige
  — allowlist análoga a `/doctor` nombrando ids muertos).
- **Gate `sdd-lint`** (`features.sdd` on): mecánico limpio (estados MADR `accepted` válidos en ambos ADR,
  sin `[NECESITA ACLARACIÓN` sin resolver, sin ids `FR`/`SC` malformados ni duplicados, los 4 enlaces a CU
  resuelven); semántico (subagente fresco) sin ERROR — 1 AVISO menor reconocido: `FR-007`/`FR-008`
  empaquetan más de un requisito atómico bajo el mismo id (no invalida el patrón EARS de cada cláusula;
  no bloquea). **Gate superado.**
- **Gate `fact-checker`**: 5/6 afirmaciones VERIFICADO. 1 INCORRECTO sobre mi propia formulación (afirmé
  que el barrido no tenía coincidencias fuera de 4 rutas de exclusión históricas, pero hay 2 coincidencias
  legítimas en `.claude/tasks/active/.../task-pipeline-model-routing-per-phase-01.md:29,51` — la propia
  tarea citando el texto viejo como lo que corrige). Corregido aquí: la exclusión real incluye también la
  tarea activa que describe su propio fix (mismo patrón que el allowlist de `/doctor` en `CLAUDE.md`). No
  es un defecto del entregable, solo una imprecisión de alcance en la afirmación original.

### Documentación actualizada (rutas + motivo)

- `task-pipeline/README.md` (sección "Routing de modelo por fase") — contrato canónico + limitación de
  plataforma corregida.
- `README.md` (raíz), `task-pipeline/skills/plan-task/SKILL.md`, `CLAUDE.md`,
  `docs/guides/task-lifecycle.md`, `task-pipeline/docs/flujo-del-pipeline.md`,
  `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md` — reconciliación del conteo 2→3+condicional.
- `.claude/task-pipeline.yml` y `task-pipeline/skills/plan-task/templates/task-pipeline.yml` — cabeceras
  (comentarios) actualizadas al contrato; **no** se tocaron los valores activos de `models:` (tarea 02).

### Ficheros / commits

Ficheros modificados: los 9 de doc/config listados arriba + 2 renames (plan y tarea a `active/`) + este
session log (nuevo). Commit de cierre: `task-pipeline-model-routing-per-phase-01: <se añade tras este log>`.

### Tiempo real

~1 sesión (estimate: 3h).

### Follow-ups

- Gap preexistente (no de esta tarea): el roster general de skills de `README.md` raíz no incluye
  `sdd-lint` entre las 10 skills listadas (línea 13, árbol de ficheros, "Portabilidad de las skills").
- AVISO menor de `sdd-lint` reconocido: `FR-007`/`FR-008` de `spec.md` empaquetan más de un requisito
  atómico — candidato a limpieza en una futura tarea de mantenimiento SDD, no bloqueante.
