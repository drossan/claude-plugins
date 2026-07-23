# Cómo arrancar una sesión nueva para una tarea — `task-pipeline`

> Este fichero es **específico del package `task-pipeline`** (el source del propio plugin), pero su
> estructura es genérica y replicable. Está referenciado desde el ciclo de vida canónico.

> **¿De dónde salen el plan y las tareas?** Del flujo de la skill **`/plan-task`** (plan mode → plan en
> `.claude/plans/pending/task-pipeline/` → `grilling` → `design-review` → tareas con **Gherkin** →
> `scenario-coverage`). Este HOW-TO cubre la **ejecución** de cada tarea. Ver `docs/guides/task-lifecycle.md`.

> ## 🚦 GATE — IMPERATIVO, adaptado al stack de ESTE repo
>
> **Ojo con el stack.** `.claude/task-pipeline.yml` declara `stack.language: other`,
> `test-runner: none`, `mutation-tool: none`. Es decir: **este repo NO tiene harness de tests JS/TS ni
> Stryker**; sus entregables son **skills en Markdown y hooks en Bash**. Por tanto:
> - **TDD (Red→Green→Refactor) y el gate de mutation NO tienen herramienta que correr** → esos ítems de
>   la DoD son **N/A** aquí. NO inventes un `pnpm test`/`pnpm lint`: no existen.
> - Los **escenarios Gherkin** de cada tarea siguen siendo la **fuente de verdad del comportamiento**:
>   son **criterios de aceptación** que se verifican **por inspección / `grep` / `test -d` / corriendo la
>   skill o el hook en un repo de prueba**, no con un runner.
> - **TSDoc = N/A** (Markdown/Bash); la doc técnica y el histórico de la tarea SÍ son obligatorios.
> - **Excepción `website/`**: el portal VitePress es un **sub-proyecto aislado** con su propio toolchain
>   **pnpm** (`pnpm docs:build`, verificación = correr el build). NO es el harness de tests del pipeline;
>   los entregables del pipeline siguen siendo MD+Bash. "No hay pnpm" se refiere al pipeline, no a `website/`.
>
> **Antes de tocar una sola línea:**
>
> 1. Confirmar que la tarea está en `.claude/tasks/active/task-pipeline/<task-id>.md` con
>    `status: active` y que **todas** sus `depends_on` están en `done`. Si no → **PARAR y avisar**.
> 2. Confirmar que estamos en la rama del plan `plan/task-pipeline/<name-plan>`
>    (**no** en `main`, que aquí ES la rama de integración — no hay `dev`). Solo **una** tarea `active`
>    por plan (comparten rama). El arranque del plan hace: `git switch main && git pull` →
>    `git switch -c plan/task-pipeline/<name-plan>`.
> 3. **Verificar el comportamiento con los escenarios Gherkin como criterio de aceptación.**
>
>    <!-- ESPECÍFICO DEL PACKAGE: nivel de verificación por artefacto (stack `none`). -->
>    - **SKILL.md** (skill nueva o editada) → revisión de instrucciones + **correr la skill** en un caso
>      real/de prueba y comprobar que cumple sus escenarios (p.ej. `doctor` sobre un repo con drift inyectado).
>    - **Hook Bash** (`bootstrap.sh`) → ejecutar el script en un repo de prueba (adoptado / sano / no
>      adoptado) y comprobar cada `Then`; `test -d` de las rutas; `bash -n` (sintaxis).
>    - **Config/Template YAML** (`task-pipeline.yml`) → inspección + coherencia (claves, comentarios, lectores).
>    - **Docs / metadatos** (`README`, `CHANGELOG`, `plugin.json`, `marketplace.json`) → inspección +
>      barrido `grep` reforzado (allowlist: atribución + CHANGELOG histórico son legítimos).
> 4. Implementar el cambio mínimo que satisface los escenarios. Mantener coherencia con el resto del plugin.
>    <!-- ESPECÍFICO DEL PACKAGE: reglas de arquitectura del plugin. -->
>    - Una skill = un `SKILL.md` con frontmatter `name` + `description`; el cuerpo son **instrucciones**
>      (no código ejecutable) — no puede cambiar su propio modelo (solo los subagentes se rutan).
>    - Los hooks salen **en silencio** si el repo no ha adoptado la convención (no ensuciar repos ajenos).
>    - El `templates/` es lo que se materializa en repos consumidores: **no impongas** coste/comportamiento
>      ahí (p.ej. `models:` comentado).
> 5. Al cerrar: **todos** los checkboxes de la DoD en verde (los N/A del stack se omiten al materializar la
>    tarea), doc técnica + histórico actualizados, y **barrido `grep` reforzado** sin identificadores
>    renombrados vivos (allowlist). Sin eso NO es `done`.
> 6. **Gate de `fact-checker`** (no-negociable, sin flag — como `grilling`/aprobación): antes de commit y
>    del resumen final, corre `fact-checker` sobre las afirmaciones factuales de la sesión. `INCORRECTO`
>    **bloquea** el cierre hasta corregir; `NO VERIFICABLE` es un aviso a reconocer explícitamente
>    (frecuente aquí, stack `none`), pero no bloquea; `VERIFICADO` pasa. Aplica **aunque el stack sea
>    `none`** (TDD/mutation son N/A; este gate no se desactiva por preset). Ver la skill `/fact-checker`.
>
> Marcar verificación como hecha sin haber corrido el hook/skill/inspección correspondiente está prohibido.
> Si la sesión no puede completar la tarea, queda en `status: blocked` con el progreso en el histórico.
>
> **(Opcional, `features.github-tracking`)** Si el repo activa el tracking GitHub y la tarea tiene
> `issue:`, arrancar/cerrar la tarea **proyecta el estado** a su issue (In Progress / `gh issue close` /
> label `blocked` / reopen) — ver la tabla en `docs/guides/task-lifecycle.md` ("Cerrar una tarea").
> Best-effort: si `gh` falla, avisa y **no** bloquees el cambio de `status:` del `.md`. Al completar el
> **plan**, se cierra la **issue PADRE** (no se auto-cierra sola) — ver "Cerrar un plan". En este repo
> está **off** por defecto (no-op).

Pega el prompt de abajo como **primer mensaje** de cada sesión nueva.

---

## Prompt de arranque (copia y pega)

```
Voy a ejecutar la tarea <task-id> del plan <name-plan> (task-pipeline).

Lee en este orden y repórtame en 3-4 líneas el plan que vas a seguir:

1. `.claude/specs/task-pipeline/HOW-TO-START-A-TASK.md` (este fichero).
2. `docs/guides/task-lifecycle.md` (flujo canónico: estados, ramas, cierre, DoD).
3. `.claude/plans/active/task-pipeline/<name-plan>.md` (contexto, objetivos, orden y
   dependencias de las tareas + su Registro de cambios).
4. `.claude/tasks/active/task-pipeline/<task-id>.md` (la tarea de esta sesión) y
   `.claude/context/task-pipeline/<task-id>.md` (histórico, si existe).

OJO STACK: este repo es `stack: none` (skills Markdown + hooks Bash, sin runner ni Stryker). NO hay
`pnpm test`/`pnpm lint` ni gate de mutation: esos ítems de la DoD son N/A. Los escenarios Gherkin son
CRITERIOS DE ACEPTACIÓN verificables por inspección / grep / test -d / corriendo la skill o el hook.

REGLAS ESTRICTAS DE LA SESIÓN:
- GATE (antes de tocar nada): status: active + depends_on en done (si no → PARAR); en la rama
  plan/task-pipeline/<name-plan> (main es la integración; no hay dev); una sola tarea active.
- Verifica cada escenario Gherkin como criterio de aceptación (no test automatizado).
- Barrido grep reforzado: sin `grill-me`/`/task`/`skills/task/` vivos como identificador operativo
  (allowlist: atribución + CHANGELOG ≤ 0.8.1 son legítimos).
- Commits en la rama del plan con `<task-id>: <conventional commit>`.
- Doc actualizada ANTES de cerrar: doc técnica/contexto + histórico de la tarea (TSDoc = N/A aquí).

Al terminar:
- **Gate `fact-checker` (no-negociable)**: antes de commit y del resumen, corre `fact-checker` sobre las
  afirmaciones de la sesión; un `INCORRECTO` bloquea hasta corregir (`NO VERIFICABLE` = aviso a reconocer).
- Cierra el histórico en `.claude/context/task-pipeline/<task-id>.md` (resumen, decisiones +
  porqué, verificación corrida + resultado, docs actualizadas + motivo, ficheros/commits, tiempo real, follow-ups).
- Mueve el task a `.claude/tasks/completed/task-pipeline/`, `status: done`, rellena `actual:` y bump `updated:`.
- Marca `[ ]`→`[x]` de la tarea en el plan y bump su `updated:`.
- Reporta cambios y la siguiente tarea recomendada según el orden del plan.
```

Sustituye `<task-id>` (= `<plan-id>-<nn>`, con `<plan-id> = <package>-<name-plan>` y `<nn>`
correlativo del plan desde `01`) y `<name-plan>` por los del plan activo. Los ids legacy con el
esquema anterior (`task-pipeline-001`…`012`) conviven y no se renumeran.

---

## Specs aplicables (paso 3 del gate)

Este repo aún **no tiene** `.claude/specs/task-pipeline/<artefacto>.md` ni `.claude/specs/general/`. El
"contrato" de cada tarea vive en su propia sección **`## Spec`** y **`## Scenarios (Gherkin)`**, y el
plan (`<name-plan>.md`) como referencia global. Si en el futuro se extraen specs
reutilizables (p.ej. convenciones de SKILL.md, de hooks Bash), créalas en `.claude/specs/task-pipeline/`
y enlázalas aquí.

| Si la tarea crea / toca… | Contrato a leer |
|---|---|
| Skill (`SKILL.md`) | `## Spec` + `## Scenarios` de la tarea; skills existentes como referencia de estilo |
| Hook Bash | `## Spec` de la tarea; `hooks/bootstrap.sh` + `hooks/hooks.json` actuales |
| Config/Template YAML | `## Spec` de la tarea; `task-pipeline.yml` (repo) + `templates/task-pipeline.yml` |
| Docs / metadatos | `## Spec` de la tarea; `CHANGELOG.md` (precedente de formato 0.8.0) |

---

## Qué hace la sesión por sí sola

1. **Leer los ficheros** en orden (HOW-TO → task-lifecycle → plan → task + histórico).
2. **Crear un plan de pasos**: verificar escenarios → implementar mínimo → verificar → doc → cierre del
   histórico → mover task + tick en el plan.
3. **Empezar por el gate**: `depends_on`, rama del plan, y plantear cómo se verifica cada escenario.
4. **No declarar `done`** hasta que todos los checkboxes de la DoD (los aplicables al stack) estén en verde.

## Si la sesión se queda sin contexto a mitad

- Guardar progreso parcial en `.claude/context/task-pipeline/<task-id>.md` (append-only).
- Bloqueo externo → `status: blocked` + motivo. Ninguna otra tarea del plan pasa a `active`.
- Nueva sesión con el prompt + nota de que se retoma; lee el histórico para no rehacer trabajo.

## Reglas anti-context-bloat

- Usar `grep -n` en vez de leer ficheros completos; delegar barridos amplios a la skill `Explore`.
- Limitar output verbose (`2>&1 | tail -N`). No re-leer un fichero recién editado solo para verificar.
