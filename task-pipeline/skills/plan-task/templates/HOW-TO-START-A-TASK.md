# Cómo arrancar una sesión nueva para una tarea — `<package>`

> Este fichero es **específico del package `<package>`**, pero su estructura es
> genérica y replicable: cada workspace tiene —o tendrá— su propio
> `HOW-TO-START-A-TASK.md` en `.claude/specs/<package>/`, con el mismo esqueleto y
> solo las **reglas específicas del package** cambiadas (arquitectura, niveles de
> test, gates, comando de filtro). Está referenciado desde el `CLAUDE.md` del
> workspace y desde el `CLAUDE.md` raíz para que se tenga en cuenta en **toda** tarea.

> **¿De dónde salen el plan y las tareas?** Del flujo de la skill **`/plan-task`**
> (plan mode → plan en `.claude/plans/pending/<package>/` → `grilling` →
> descomposición en tareas con escenarios **Gherkin**). Este HOW-TO cubre la
> **ejecución** de cada tarea ya creada. Ver `docs/guides/task-lifecycle.md`.

> ## 🚦 GATE TDD — IMPERATIVO, NO NEGOCIABLE
>
> **Este gate asume el preset `full`** (defaults del plugin). Si `.claude/task-pipeline.yml`
> baja el listón para este repo (`mode: legacy`/`docs-only`, `features.tdd: false`,
> `mutation-gate` OFF o con otro umbral, capas de doc desactivadas), **respeta esa
> config**: lo desactivado deja de ser obligatorio. Si editas el `mode`/flags, ajusta
> también las exigencias de abajo en este HOW-TO.
>
> **Idea**: si el test falla **primero** (Red), tenemos la red de seguridad que
> garantiza que la implementación posterior (Green) hace exactamente lo
> especificado y que el refactor no rompe nada. Empezar por el código en vez de
> por el test invalida esa red y está prohibido.
>
> **Antes de tocar una sola línea de código de implementación:**
>
> 1. Confirmar que la tarea está en `.claude/tasks/active/<package>/<task-id>.md`
>    con `status: active` y que **todas** sus `depends_on` están en `done`. Si una
>    dependencia no está cerrada → **PARAR y avisar al usuario**.
> 2. Confirmar que estamos en la rama del plan `plan/<package>/<name-plan>` (nunca
>    en la rama de integración ni en `main`). Si hay otra tarea del mismo plan en
>    `active` → **PARAR**: solo una tarea `active` por plan (comparten rama).
> 3. **Escribir el test que falla ANTES de la implementación** (Red). Los tests
>    salen **1:1 de los escenarios Gherkin** de la sección `## Scenarios (Gherkin)`
>    del task file (cada `Then` es un assert); la(s) spec(s) aplicables en
>    `.claude/specs/` (ver tabla abajo) marcan el contrato y los anti-patrones.
>
>    <!-- ESPECÍFICO DEL PACKAGE: define aquí el nivel de test por artefacto.
>         Ejemplos: dominio/use cases → unit con mocks de puertos (cobertura ≥80%);
>         repos/endpoints → integración contra infra real (Docker); adapters →
>         suite de contrato contra todas las implementaciones. -->
>    - <artefacto> → <nivel de test esperado>
>
>    Sin test rojo previo NO se escribe código de producción.
> 4. Implementar lo mínimo para pasar a verde (Green). Refactor con los tests en
>    verde (Refactor).
>    <!-- ESPECÍFICO DEL PACKAGE: reglas de arquitectura del workspace. Ejemplos:
>         dirección de dependencias (hexagonal), autorización vía X, TS estricto
>         (`strict` + `noUncheckedIndexedAccess`, `any` prohibido), etc. -->
> 5. Al cerrar: **todos** los checkboxes de la Definition of Done en verde, incluida
>    la documentación en sus **tres capas obligatorias** —(1) **TSDoc** en todo
>    símbolo público, (2) **doc técnica/contexto** (README/CLAUDE.md/specs/ADRs),
>    (3) **histórico de la tarea** (session log)—, con `pnpm lint` y `pnpm test`
>    **repo-wide** en verde (sin regresiones), **cero secretos en logs** y el **gate
>    de mutation testing** superado (Stryker, `break: 80`, sobre los ficheros
>    tocados — survivors = escenarios/aserciones que faltan). Sin eso NO es `done`.
> 6. **Gate de `fact-checker`** (no-negociable, sin flag que lo desactive — como
>    `grilling`/aprobación): **tras** el gate de mutation y **antes** de commit y del
>    resumen final, corre `fact-checker` sobre las afirmaciones factuales de la sesión
>    (incluida «el gate de mutation pasó»). Una afirmación **INCORRECTO bloquea** el
>    cierre hasta corregirla; **NO VERIFICABLE** es un aviso que hay que **reconocer
>    explícitamente** (frecuente en stack sin runner), pero no bloquea; **VERIFICADO**
>    pasa. Aplica en cualquier preset — `mode`/`features` no lo desactivan.
>
> Marcar un step de tests como hecho sin haber corrido la suite, o saltarse el
> Red→Green→Refactor, es engañoso y está prohibido. Si la sesión no puede completar
> la tarea, queda en `status: blocked` (o se documenta el progreso parcial en el
> histórico) esperando al usuario — nunca se marca `done` "con nota".

Pega el prompt de abajo (o un equivalente) como **primer mensaje** de cada nueva
sesión de Claude para que arranque con el contexto y el workflow correctos sin
gastar turnos en explicarlo.

---

## Prompt de arranque (copia y pega)

```
Voy a ejecutar la tarea <task-id> del plan <name-plan> (<package>).

Lee en este orden y repórtame en 3-4 líneas el plan que vas a seguir:

1. `.claude/specs/<package>/HOW-TO-START-A-TASK.md` (este fichero).
2. `docs/guides/task-lifecycle.md` (flujo canónico: estados, ramas, cierre, DoD).
3. `.claude/plans/active/<package>/<name-plan>.md` (contexto, objetivos, orden y
   dependencias de las tareas).
4. Las specs aplicables en `.claude/specs/<package>/` y `.claude/specs/general/`
   (según el artefacto que toque la tarea — ver tabla en el HOW-TO).
5. `.claude/tasks/active/<package>/<task-id>.md` (la tarea de esta sesión) y
   `.claude/context/<package>/<task-id>.md` (histórico de sesión, si existe).

Tras leerlos, ejecuta la tarea siguiendo el ciclo TDD paso a paso.

REGLAS ESTRICTAS DE LA SESIÓN:
- **GATE TDD (imperativo, no negociable, antes de tocar código)**:
  1. `status: active` y todas las `depends_on` en `done`. Si no → PARAR y avisar.
  2. En la rama `plan/<package>/<name-plan>`. Solo una tarea `active` por plan.
  3. Test rojo ANTES de la implementación (Red → Green → Refactor).
- <REGLAS ESPECÍFICAS DEL PACKAGE: niveles de test por artefacto, arquitectura,
  autorización, TS estricto, lo que aplique a este workspace>.
- Cada artefacto sigue su spec en `.claude/specs/`. Si introduces o cambias un
  patrón, actualiza la spec en el mismo cambio.
- Commits en la rama del plan con el formato `<task-id>: <conventional commit>`.
- Documentación actualizada ANTES de declarar la tarea hecha. **Tres capas
  obligatorias**: TSDoc en todo símbolo público (al crearlo), doc técnica/contexto
  y histórico de la tarea.
- Lint + format + typecheck en verde ANTES de cerrar (`pnpm --filter <pkg> lint`).
- Cero secretos en logs.

Al terminar:
- Verifica `pnpm lint` y `pnpm test` repo-wide en verde, sin regresiones.
- **Gate `fact-checker` (no-negociable)**: antes de commit y del resumen, corre
  `fact-checker` sobre las afirmaciones de la sesión. `INCORRECTO` bloquea hasta
  corregir; `NO VERIFICABLE` = aviso a reconocer; `VERIFICADO` pasa.
- Cierra el histórico en `.claude/context/<package>/<task-id>.md` (resumen,
  decisiones + porqué, tests corridos + resultado, docs actualizadas + motivo,
  ficheros/commits, tiempo real, follow-ups).
- Mueve el task a `.claude/tasks/completed/<package>/`, `status: done`, rellena
  `actual:` y bump `updated:`.
- Marca la casilla `[ ]` → `[x]` de la tarea en el plan y bump su `updated:`.
- Reporta cambios y siguiente tarea recomendada según el orden del plan.
```

Sustituye `<task-id>` (= `<plan-id>-<nn>`, con `<plan-id> = <package>-<name-plan>` y
`<nn>` correlativo del plan desde `01`; **no** un contador global del package) por el id
de la tarea y `<name-plan>` por el plan activo. Los ids legacy con el esquema anterior
(`<package>-<nnn>`) conviven y no se renumeran. Lista completa de tareas bajo
`.claude/plans/active/<package>/`.

---

## Specs aplicables (paso 3 del gate)

Antes de escribir el test, abre la(s) spec(s) del artefacto que toques. Son el
contrato del que se derivan los tests:

<!-- ESPECÍFICO DEL PACKAGE: rellena con las specs reales de este workspace. -->

| Si la tarea crea / toca… | Lee la spec |
|---|---|
| <artefacto del package> | `.claude/specs/<package>/<artefacto>.md` |
| Cualquier código (transversal) | `.claude/specs/general/coding-standards.md` |
| Cualquier test (transversal) | `.claude/specs/general/testing.md` |
| Modelado de errores | `.claude/specs/general/error-handling.md` |
| Seguridad (rutas, validación, datos) | `.claude/specs/general/security.md` |
| Rama o commit | `.claude/specs/general/git-workflow.md` |

---

## Qué hace la sesión por sí sola

Al recibir el prompt, la sesión debería:

1. **Leer los ficheros** en orden y construir el contexto (HOW-TO →
   task-lifecycle → plan → specs → task + histórico).
2. **Crear un plan de pasos** con el ciclo TDD: test rojo → implementación mínima
   → refactor → lint/format/typecheck → docs → cierre del histórico → mover task +
   tick en el plan.
3. **Empezar por el gate**: comprobar `depends_on`, rama del plan, y escribir el
   primer test que falla.
4. **Avanzar Red → Green → Refactor** por cada pieza del contrato de la spec.
5. **No declarar la tarea `done`** hasta que **todos** los checkboxes de la DoD
   estén en verde.

## Si la sesión se queda sin contexto a mitad

- **Guardar progreso parcial** en el histórico `.claude/context/<package>/<task-id>.md`
  (append-only): qué se ha hecho, qué queda, decisiones, próximos pasos.
- Tarea bloqueada por algo externo: `status: blocked` + motivo (ver `task-lifecycle.md`).
  Ninguna otra tarea del plan pasa a `active` hasta resolverlo.
- Abrir nueva sesión con el prompt + nota de que se retoma; la nueva sesión lee el
  histórico para no rehacer trabajo.

## Reglas anti-context-bloat

- Evitar leer ficheros completos; usar `grep -n` para localizar líneas concretas.
- Delegar exploración amplia a la skill `Explore` (corre en sub-proceso y solo
  devuelve la conclusión).
- Limitar output verbose: pasar `2>&1 | tail -N` a comandos de test/build.
- No re-leer un fichero recién editado solo para verificar: si el edit no falló,
  el cambio se aplicó.

## Replicar este HOW-TO en otro package

1. Copia este fichero a `.claude/specs/<otro-package>/HOW-TO-START-A-TASK.md`.
2. Cambia el título, el comando de filtro (`pnpm --filter <pkg>`), la tabla de
   specs y las reglas específicas del gate (los bloques marcados
   `ESPECÍFICO DEL PACKAGE`).
3. Referencia el nuevo fichero desde el `CLAUDE.md` del workspace.
