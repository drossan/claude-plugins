# Session log — task-pipeline-github-tracking-enrichment-02

> Append-only. Ciclo de vida: Project Status + label `status:*` + assignee (arranque/cierre/bloqueo).
> Edita en paralelo `docs/guides/task-lifecycle.md` (materializado) **y** su semilla
> `task-pipeline/skills/plan-task/templates/task-lifecycle.md`, + 1 frase en `doctor/SKILL.md`.

## 2026-07-24 — Arranque

- Gate OK: rama `plan/task-pipeline/github-tracking-enrichment` ✓; depends_on (01) en `completed/` ✓;
  ninguna otra tarea `active` ✓. Movida la 02 a `active/`, `status: active`, `updated: 2026-07-24`.
- Stack `none`: TDD/mutation = N/A. Gherkin = criterios de aceptación (inspección + dogfood real con `gh`).
- Plan de pasos: (1) proyectar arranque de #21 best-effort; (2) editar ambos lifecycle en paralelo;
  (3) frase idempotencia en `doctor/SKILL.md`; (4) verificar Gherkin; (5) fact-checker; (6) cierre.

## 2026-07-24 — Dogfood: proyección del arranque de #21 (verificación empírica)

Ejecutado el recipe de arranque contra `drossan/claude-plugins` (gh=danielrosse):
- `gh label create "status: in-progress" --color FBCA04 --description "(task-pipeline)"` → creada.
- `gh issue edit 21 --add-label "status: in-progress"` (add-then-remove: no había otras status:* que quitar).
- `gh issue edit 21 --add-assignee @me` → assignee=`danielrosse`.
- Project 2 (`PVT_kwHOAI1x8c4BeQV_`): item #21 (`PVTI_lAHOAI1x8c4BeQV_zgz4iec`),
  Status field `PVTSSF_lAHOAI1x8c4BeQV_zhYr7Wk`, opción "In progress"=`47fc9ee4` (resuelta case-insensitive).
  `gh project item-edit … --single-select-option-id 47fc9ee4` → Status: `Backlog`→`In progress` VERIFICADO.

Estado final #21: labels `[pkg:task-pipeline, status: in-progress]`, assignee `danielrosse`, Project `In progress`.
→ Escritura al Project CONFIRMADA (el hueco "board = no-op" de la memoria/config es STALE; se corrige en tarea 03).

## 2026-07-24 — Verificación empírica de transiciones (dogfood #21)

- **Idempotencia (re-proyectar active)**: re-add label + re-assign + re-edit Project → sigue 1 label
  (`status: in-progress`), 1 assignee (`danielrosse`), Status `In progress`. Sin duplicados. ✓
- **Add-then-remove con swap** (round-trip `active→in-review→active`):
  · PASO A → in-review: labels `[pkg:task-pipeline, status: in-review]` (in-progress retirada),
    Project `In review`. ✓
  · PASO B → active: labels `[pkg:task-pipeline, status: in-progress]`, assignee `danielrosse`,
    Project `In progress` (restaurado al estado correcto de la tarea activa). ✓
  · En cada paso, exactamente UNA `status:*`. El swap deja siempre estado (no hueco). ✓
- Labels creadas en el repo: `status: in-progress` (FBCA04), `status: in-review` (0E8A16). `status: blocked`
  se creará lazily en la primera transición a blocked (mismo patrón probado).

### Cobertura de escenarios (criterios de aceptación)

**Verificados por ejecución real (gh contra drossan/claude-plugins):**
- Arrancar → In progress + status: in-progress + @me (danielrosse).
- add-then-remove con swap (in-review) — cada paso deja una sola status:*.
- in-review → In review + status: in-review, issue no se cierra.
- Match case-insensitive (se buscó "In progress" y resolvió la opción real "In progress").
- Re-proyectar el estado actual no duplica label ni assignee.

**Verificados por inspección de la tabla/recipe (mismos primitivos gh ya probados: label add/remove,
project item-edit, issue close/reopen):** blocked (status:blocked, Project queda In progress); desbloqueo;
done/cancelled (close [+not planned], retirar status:*, Project Done); reopen; migración de `blocked` pelada
legacy (el recipe la retira como una status:* más); fallo parcial → sobre-etiqueta con aviso; gh falla → aviso
sin bloquear el .md; padre sin status:*/assignee; tarea sin issue: = local puro; close ya-cerrada = no-op;
assignee outline @me/login/false + no-asignable → aviso.

## 2026-07-24 — Gate fact-checker (subagente fresco general-purpose, inherit)

Veredictos: **6 VERIFICADO + 1 INCORRECTO**.
- #1 tabla/bloque idéntico entre ambos lifecycle → VERIFICADO (diff byte-idéntico).
- #2 arranque tarea/plan + cierre plan en ambos → VERIFICADO.
- #3 corrección In Progress→In progress → **INCORRECTO en la formulación de mi afirmación** (dije
  "template 0"; lo real es **1 en cada fichero**: la línea intencional del match case-insensitive
  —materializado 341, template 343—, idéntica en ambos porque el bloque es byte-idéntico). El TRABAJO
  es correcto (corrección hecha en todo salvo la línea de contraste deliberada). **Afirmación corregida**
  → gate desbloqueado, sin cambio de código.
- #4 frase idempotencia en doctor cat.8 → VERIFICADO.
- #5 barrido grep limpio (solo allowlist doctor:38) → VERIFICADO.
- #6 yml intacto; diff de Paso 5.7 atribuible a tarea 01 por scope (git no atribuye por sesión) → VERIFICADO.
- #7 dogfood #21 (labels pkg+status:in-progress, assignee danielrosse, Project In progress) → VERIFICADO.

Un `INCORRECTO` de precisión-de-afirmación (no de código) reconocido y corregido.

## 2026-07-24 — Cierre de la tarea

**Dogfood cierre #21 (→ done, best-effort):** retirada `status: in-progress`, Project Status → `Done`,
`gh issue close 21` → CLOSED. Estado final: labels `[pkg:task-pipeline]`, assignee `danielrosse`
(conservado: el cierre no desasigna), Project `Done`. Transición de cierre VERIFICADA end-to-end.

### Resumen
Proyectado el ESTADO del ciclo de vida a GitHub en las transiciones. Editados en paralelo los dos
lifecycle (`docs/guides/task-lifecycle.md` materializado + `templates/task-lifecycle.md` semilla):
"Arrancar tarea" (Project `In progress` + `status: in-progress` + assignee), tabla de transiciones de 5
columnas con recipe add-then-remove (in-review/blocked/desbloqueo/done/cancelled/reopen), familia de
labels + colores, assignee (clave `assignee`: @me/login/false), match Status case-insensitive + salto si
falta la opción, body NO re-vuelto en transiciones, idempotencia/C3; "Arrancar plan" (padre → `In progress`
sin label/assignee); "Cerrar plan" (padre → `Done` + close). Corregido `In Progress`→`In progress`. Una
frase de idempotencia en `doctor/SKILL.md` cat. 8.

### Decisiones técnicas + porqué
- Bloque de proyección byte-idéntico entre los dos lifecycle: la semántica de estado es comportamiento del
  plugin (convención), no repo-específico; solo difieren rama (main/dev) y comandos pnpm. → menos drift.
- "In Progress" intencional conservado (1 línea en cada fichero): documenta el porqué del match
  case-insensitive (la opción real es `In progress`, los docs a veces escriben `In Progress`).
- Padre sin status:*/assignee: el plan no es una unidad de trabajo asignable; solo refleja fase (Project).
- HOW-TO-START-A-TASK.md NO tocado (fuera del alcance del plan) → follow-up.

### Verificación corrida + resultado
- Dogfood real contra `drossan/claude-plugins` (gh=danielrosse): arranque (label+assignee+Project In
  progress), idempotencia (sin duplicados), add-then-remove con swap (active↔in-review), cierre (close +
  retirar status:* + Project Done). Escritura al Project CONFIRMADA (hueco no-verificado del plan cerrado).
- fact-checker (subagente fresco): 6 VERIFICADO + 1 INCORRECTO de precisión-de-afirmación (corregido).
- Barrido grep de ids muertos: limpio (solo allowlist doctor:38).
- TDD/mutation = N/A (stack `none`).

### Docs actualizadas
- `docs/guides/task-lifecycle.md` (materializado) + `task-pipeline/skills/plan-task/templates/task-lifecycle.md`
  (semilla): secciones Arrancar/Cerrar tarea + Arrancar/Cerrar plan.
- `task-pipeline/skills/doctor/SKILL.md`: cat. 8, frase de re-proyección idempotente.

### Ficheros tocados
- docs/guides/task-lifecycle.md
- task-pipeline/skills/plan-task/templates/task-lifecycle.md
- task-pipeline/skills/doctor/SKILL.md
- (bookkeeping) task .md → completed/, plan .md tick+updated, este context log.

### Tiempo real
~1.5h (estimate 3h).

### Follow-ups
- **HOW-TO-START-A-TASK.md** (`.claude/specs/task-pipeline/`) tiene menciones stale del tracking: "In
  Progress" (líneas ~63), "label `blocked`" (hoy `status: blocked`) y "off por defecto (no-op)" (hoy
  `enabled: true`). Fuera del alcance de esta tarea; candidato a tarea 04 (docs) o a `/doctor`.
- Config `.claude/task-pipeline.yml`: comentario "board = no-op" es STALE (write al Project CONFIRMADO) →
  se corrige en la tarea 03, junto a la clave nueva `assignee`.
