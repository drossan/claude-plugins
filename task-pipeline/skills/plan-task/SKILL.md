---
name: plan-task
description: Orquesta el inicio de una tarea/plan de principio a fin — plan mode → plan en pending → grilling → tareas en Gherkin → handoff al flujo TDD → gate de mutation testing. Úsalo cuando el usuario quiera arrancar trabajo nuevo a partir de unas especificaciones (p.ej. `/plan-task "quiero añadir X"`).
---

Eres el orquestador del flujo de trabajo del repo. A partir de las especificaciones del usuario (`$ARGUMENTS`), conduces el pipeline hasta dejar las tareas listas para ejecutar en TDD. **No es 100% automático**: hay dos checkpoints humanos no negociables (refinado con `grilling` y aprobación del plan). No los saltes.

> **Convención asumida por este plugin** (ver el README del plugin): el repo organiza el trabajo en `.claude/plans/<estado>/<package>/`, `.claude/tasks/<estado>/<package>/`, `.claude/context/<package>/<task-id>.md`, specs en `.claude/specs/`, y tiene un `docs/guides/task-lifecycle.md` (flujo canónico) y un `HOW-TO-START-A-TASK.md` por package en `.claude/specs/<package>/`. Si el repo no sigue esta convención, primero bootstrapéala con la skill `/task-init` (o avisa al usuario) antes de continuar.

> **Plantillas (semillas)**: junto a este skill hay un directorio `templates/` (en `skills/plan-task/templates/`). **Léelas con la tool Read** y materialízalas en el repo en vez de improvisar la estructura: `templates/task-lifecycle.md` → `docs/guides/`; `templates/HOW-TO-START-A-TASK.md` → `.claude/specs/<package>/` (rellena los bloques `ESPECÍFICO DEL PACKAGE`); `templates/plan.md` y `templates/task.md` → cada plan/tarea nuevos. No se cargan solas: tienes que abrirlas. Ver `templates/README.md` para el mapeo completo.

## Antes de nada — contexto

Lee, en este orden: (1) `docs/guides/task-lifecycle.md`, (2) el `HOW-TO-START-A-TASK.md` del package objetivo y (3) `.claude/task-pipeline.yml` (config de features del repo). No dupliques esas reglas; este playbook solo orquesta.

### Config del repo (`.claude/task-pipeline.yml`)

Antes de aplicar las fases OPCIONALES y de elegir comandos, lee `.claude/task-pipeline.yml` con **Read** y respétalo. **Resolución** (de menor a mayor prioridad): defaults internos (= preset `full`) → el preset de `mode:` → claves explícitas en `stack:`/`features:`. **Archivo, sección o clave ausente = se hereda del nivel anterior; sin archivo = todo `full`** (comportamiento histórico).

**`mode:` (preset)** — fija los defaults de las features:

| `mode` | `tdd` | `closing-documentation.*` | `mutation-gate` |
|---|---|---|---|
| `full` (default) | ON | ON | `80` |
| `legacy` | ON | ON | OFF |
| `docs-only` | OFF | ON | OFF |

**`stack:`** — usa estos valores en vez de asumir pnpm/Vitest/Stryker. Adapta los comandos de test/lint/mutation al `package-manager` y `test-runner`; `language: other` significa que "doc en el código" no es TSDoc sino el equivalente del lenguaje (o N/A); `mutation-tool: none` desactiva de facto el gate aunque `mutation-gate` traiga número.

**`features:`** (una clave explícita pisa al preset):

| Flag | Valores | Si desactivado |
|---|---|---|
| `features.tdd` | `true`/`false` | La DoD **no** exige tests/TDD ni "1 test por escenario" (escape hatch para legacy sin harness / doc-only). |
| `features.closing-documentation.tsdoc` | `true`/`false` | No exiges doc en el código en la DoD. |
| `features.closing-documentation.technical-docs` | `true`/`false` | No exiges doc técnica (README/CLAUDE.md/specs/ADRs). |
| `features.closing-documentation.context-log` | `true`/`false` | No exiges el session log en `.claude/context/`. |
| `features.mutation-gate` | `false` / `true`(=80) / `<int>` | `false`: sin gate. `<int>`: gate con ese umbral `break` (ratchet en legacy). |
| `features.github-tracking` | bloque; opt-in (default **off**) | **Comportamiento** opt-in, **no** gate de DoD: proyección one-way md→GitHub (plan→issue padre, tarea→sub-issue). **Fuera de todo preset** (`mode: full` NO lo enciende); su **ausencia no es drift** para `/doctor`. Solo `enabled: true` activa; valor no-canónico → off. |

**`models:` (routing de modelo por fase)** — fija el modelo de las fases que lanzan **subagente** (`design-review` y `scenario-coverage`, cada una lo lee en su Paso 2): clave ausente/`inherit` = modelo de sesión; alias/id válido = se pasa como `model` al subagente; valor inválido = **aviso + inherit**; clave para una fase inline = **se ignora**. Las fases **inline** (`grilling`, `mutation` y este propio `plan-task`) heredan la sesión y **no se rutan** — limitación de plataforma explicada **una sola vez** en el README del plugin → "Routing de modelo por fase" (no la repito aquí).

> **Checkpoints — qué se puede saltar y qué no**: `grilling` y la aprobación del plan son **no negociables** (baratos y nucleares); ningún flag, preset ni "es que es pequeño" los desactiva. `design-review` (Paso 4.5) y `scenario-coverage` (Paso 5.5) corren **por defecto**, pero admiten un **salto proporcional** solo en planes triviales (regla abajo). El escape es proporcional al coste: solo las dos pasadas caras (subagente) lo tienen.

### Salto en planes triviales (`design-review` / `scenario-coverage`)

- **Default = ejecutar.** El salto es la excepción y **lo decide el usuario**, nunca tú en silencio: si tú decides que "es pequeño" para ahorrarte la pasada, has convertido la gate en su propio agujero. No lo hagas.
- **Solo puedes OFRECER saltar** si el plan cumple **TODOS** estos criterios (si falla cualquiera, ni lo ofreces y ejecutas la pasada):
  - toca un solo fichero/área;
  - **no** crea superficie/API pública nueva (nada que iría en `Provides`);
  - **no** hay decisión arquitectónica ni nada transversal;
  - (solo para `scenario-coverage`) 1 tarea sin caminos de error/borde reales.
- **Confirma con `AskUserQuestion`**, con la opción por defecto = **ejecutar la pasada**. No fuerces el salto con el framing.
- **Registra el salto y su motivo en el Plan change log** (p. ej. *"`design-review` omitida: plan de un fichero, sin superficie nueva — aprobado por owner"*). Una gate saltada deja rastro; nunca desaparece en silencio.

## Paso 0 — ¿Plan nuevo o re-plan?

Antes de crear nada, comprueba si **ya existe un plan activo** (`.claude/plans/active/<package>/`) que cubra el scope pedido:

- **Sí lo cubre** → NO crees un plan nuevo (pisaría la rama). **Re-planifica in-place**: ajusta/añade/redefine tareas del plan activo, registra cada cambio en su **Plan change log**, y refina con `grilling`. Presenta los cambios para aprobación antes de aplicarlos.
- **No lo cubre** → sigue con el flujo de plan nuevo (pasos 1-5).

Si hay duda de scope o de a qué package pertenece, pregunta con `AskUserQuestion`.

## Paso 1 — Identificar package y nombre de plan

- Infiere el `<package>` (workspace) afectado de las specs. Si es ambiguo o afecta a varios, pregunta.
- Elige un `<name-plan>` kebab-case descriptivo.

## Paso 2 — Plan mode + draft del plan

- Entra en **plan mode** (`EnterPlanMode`).
- Investiga el codebase en read-only lo necesario (usa la skill `Explore` para barridos amplios).
- Redacta el plan siguiendo la plantilla **`templates/plan.md`** (junto a este skill; ábrela con Read).
- Presenta el plan para aprobación con `ExitPlanMode`.

## Paso 3 — Escribir el plan en `pending/`

Al aprobar el usuario, escribe `.claude/plans/pending/<package>/<name-plan>.md` con el frontmatter de la plantilla (`status: pending`, `branch: plan/<package>/<name-plan>`, fechas).

## Paso 4 — Refinar con grilling (checkpoint humano)

Invoca la skill **`grilling`** sobre el plan. Itera hasta que sobreviva el interrogatorio; registra cada decisión en el **Plan change log**. No avances hasta que el usuario lo dé por bueno.

## Paso 4.5 — Revisión de diseño holística (checkpoint humano)

`grilling` resuelve las decisiones **rama por rama**; falta el zoom-out al conjunto. Antes de invocarla, aplica la regla de **salto en planes triviales** (ver arriba): por defecto se ejecuta; solo ofreces saltarla si el plan cumple todos los criterios, y el salto lo confirma y se loguea. Invoca la skill **`design-review`** sobre el plan refinado: lanza un **subagente fresco** (sin el sesgo de defender tu propio plan) que intenta tumbar el diseño como un todo —coherencia, tamaño correcto (infra- y **sobre**-ingeniería), mantenibilidad concreta, escalabilidad real y reversibilidad—. Presenta los hallazgos sin filtrar, decide los cambios con el usuario y regístralos en el **Plan change log**; si alteran scope/enfoque de forma material, re-preséntalos para aprobación. No avances hasta que el plan sobreviva o se ajuste.

## Paso 5 — Descomponer en tareas pequeñas con Gherkin

Divide en tareas pequeñas (un commit lógico / una sesión). Crea cada `.claude/tasks/pending/<package>/<task-id>.md` desde la plantilla **`templates/task.md`** (junto a este skill; ábrela con Read), que incluye la sección obligatoria **`## Scenarios (Gherkin)`**. Rellena la sección **Tasks** del plan (ordenada, con `depends_on`).

### Asignación del `<task-id>` (determinista, plan-scoped)

El id de tarea es **`<task-id> = <plan-id>-<nn>`** (`<plan-id> = <package>-<name-plan>`; ver la definición y la acotación de `<name-plan>` en `docs/guides/task-lifecycle.md`, que no repito aquí). Deriva el `<nn>` así:

- **`<nn>` = (máximo `<nn>` existente EN EL PLAN) + 1**, empezando en **`01`** para la primera tarea de un plan nuevo. Formato de 2 dígitos con cero a la izquierda (`01`, `02`, …).
- **Cuenta sobre TODAS las tareas del plan, en TODOS sus estados** (`pending` + `active` + `completed` + `cancelled`). **Nunca reutilices** el `<nn>` de una tarea `cancelled` o `completed`: si lo reusas, colisionas dentro del propio plan al re-planificar. (Ej.: plan con `01`, `02` `cancelled`, `03` `completed` → la siguiente es **`04`**, no `02`.)
- **NO cuentes sobre "el último número del package"** ni sobre un contador global: ese es exactamente el bug que causa las colisiones entre planes en paralelo. El espacio de numeración es **el plan**, no el package.
- **Convivencia con ids legacy**: los ids opacos del esquema anterior (`<package>-<nnn>`) **no se renumeran**; un histórico mixto (unos plan-scoped, otros legacy) es lo esperado y no hay que "arreglarlo".
- **Residual honesto (no lo prometas resuelto)**: esta regla **no** previene el caso "dos ramas del mismo plan en paralelo" — ambas ven el mismo máximo y asignan el mismo `<nn>`. Es el límite conocido del esquema (lo prevendría un sufijo aleatorio, descartado). Mitigación: "una rama = un plan / una sola tarea `active` por plan", su **detección** en `/doctor` (ids duplicados) y la **guía de trabajo en equipo** del README del plugin.

### Gherkin = fuente de los tests

Cada tarea describe su comportamiento en escenarios **Given / When / Then**, fuente 1:1 de los tests TDD (el `Then` es el assert). Concretos y verificables; cubre camino feliz **y** bordes/errores (los exige el mutation testing del cierre). Aplica las **reglas de la plantilla** (no las repito aquí): **declarativo > imperativo** (el `When` es acción de dominio, no pasos de UI/llamadas internas — es lo que evita tests frágiles a refactors), **un escenario = un comportamiento**, **disciplina G/W/T**, y **`Scenario Outline`** para fronteras/clases de equivalencia. Si `features.tdd` es `false`, los escenarios siguen siendo útiles como **spec de comportamiento** (criterio de aceptación), pero no se exige un test por cada uno.

```gherkin
Feature: <capacidad de la tarea>

  Scenario: <caso concreto>
    Given <precondición>
    When <acción>
    Then <resultado observable y verificable>
```

## Paso 5.5 — Endurecer escenarios (QA, subagente fresco)

Antes del handoff, aplica la regla de **salto en planes triviales** (ver arriba) y, si procede, invoca la skill **`scenario-coverage`** sobre el **set completo** de tareas recién creadas: lanza un **subagente QA fresco** que busca comportamientos no cubiertos por dimensiones (fronteras, errores, estado, concurrencia, input adversario, Spec implícita y —clave— **requisitos que ninguna tarea contempla**, el hueco que el mutation testing no puede detectar). No es volumen por volumen: cada dimensión irrelevante se descarta con su porqué. Incorpora a la sección `## Scenarios (Gherkin)` los escenarios aceptados; si un hueco es un requisito sin tarea, puede implicar una tarea nueva (vuelve a descomponer). Esto abarata el bucle de survivors del cierre.

## Paso 5.7 — Proyección a GitHub Issues (opcional — `features.github-tracking`)

**Pasos CONDICIONALES**: se ejecutan **solo si** `features.github-tracking.enabled` es `true` (booleano) **y** `gh` está instalado y autenticado con **permiso de escritura** **y** el repo es de GitHub. Si falta cualquiera → **no-op** (silencioso salvo un aviso breve): el `.md` es la verdad y el plan se materializa igual. Es una **proyección one-way** (`.md` → GitHub): plan → issue **PADRE**, tarea → **SUB-ISSUE**. Corre una vez el set de tareas es definitivo (tras Paso 5.5).

> **Degradación (C3, best-effort).** En TODOS los modos de fallo —`gh` ausente/viejo (sin `--parent`), sin red, repo no-GitHub, `gh` sin auth, **authed sin permiso de escritura (403)**, rate-limit/error a mitad de bucle— **avisa y continúa**: **nunca** abortes la materialización del `.md`. La proyección puede quedar **parcial**; el re-run la reanuda de forma idempotente por `issue:`. Este playbook **no garantiza** sync remoto (paginación, rate-limit, auth, issue borrada): es **best-effort**; la reconciliación vive en `/doctor`.

1. **Resolver `repo`**: usa `features.github-tracking.repo` si está; si no, el remoto por defecto: `gh repo view --json nameWithOwner -q .nameWithOwner`. Con **múltiples remotos** (fork `origin` vs `upstream`) se usa el que resuelva `gh repo view`; **recomienda fijar `repo`** en la config para desambiguar.
2. **Label / issue-type del plan**: si vas a etiquetar el padre con `--label plan`, **crea la label si no existe** (`gh label create plan …`); si no se puede crear, crea la issue **sin** label + aviso (degrada, no abortes). Si `issue-type-plan` está configurado y disponible en el ORG, úsalo en su lugar.
3. **Plan → issue PADRE**: si el `.md` del plan **no** tiene `issue:` aún, `gh issue create` (título = título del plan; body = resumen + **link al `.md`**). Escribe `issue: <n>` en el frontmatter del plan **inmediatamente**. **Si el `create` del padre FALLA → NO crees sub-issues sueltas**: aborta la proyección del plan (aviso); el `.md` queda materializado igual.
4. **Tarea → SUB-ISSUE**: por cada tarea cuyo `.md` **no** tenga `issue:`, `gh issue create --parent <nº-padre> …` y escribe `issue: <n>` en su frontmatter **inmediatamente tras** crearla (minimiza la ventana del exactly-once).
5. **Idempotencia (re-sync no duplica)**: si un `.md` **ya** tiene `issue:`, **no** crees otra; actualiza la existente con `gh issue edit`. Si el número **ya no existe** en GitHub (borrada a mano) → **avisa** y deja la reconciliación a `/doctor` (**no** recrees a ciegas).
6. **Títulos adversarios**: construye el comando de forma **segura** ante títulos con comillas, backticks, `$` o markdown — pasa el título como **argumento** (`--title` con el valor entre comillas), nunca interpolado en una cadena de shell. El markdown en el título es cosmético (aceptable); lo que no puede pasar es que rompa el shell.
7. **`depends_on`**: **NO** se proyecta como dependencia nativa de GitHub; como mucho, una nota de texto en el body de la sub-issue.

**Exactly-once (límite honesto)**: si el proceso muere **entre** crear la issue y escribir `issue:` en el `.md`, un re-run no puede saber que ya existe y **podría** crear una segunda. Se minimiza escribiendo `issue:` inmediatamente (paso 4); el residual lo detecta/limpia `/doctor`. Declarado como límite best-effort.

**Fronteras de tamaño del plan**: `0` tareas → solo el padre, sin sub-issues; `100` → 100 sub-issues; **`101+`** supera el tope de GitHub (**100 sub-issues/padre**) → **avisa** (límite conocido), no falles en silencio.

> **Fuera de alcance de estos pasos**: la proyección del **estado** de una tarea (arranque/cierre) vive en `task-lifecycle`; el cierre de la issue **PADRE** al completar el plan y la disciplina de **concurrencia** en el "Ciclo de vida del plan"; la **reconciliación** md↔GitHub en `/doctor`.

## Paso 6 — Handoff al flujo TDD

Cada tarea se ejecuta en su propia sesión siguiendo el `HOW-TO-START-A-TASK.md` del package (Red → Green → Refactor; tests derivados de los escenarios Gherkin). Reporta: el plan creado y su ruta, la lista de tareas con dependencias y la primera recomendada.

## Documentar todo (tres capas — configurables)

Cada tarea documenta en tres capas, **cada una activable por flag** (default ON; ver la tabla de arriba): (1) **TSDoc en el código** de todo símbolo público (al crearlo, no al final) — `closing-documentation.tsdoc`; (2) **doc técnica/contexto** (README/CLAUDE.md/specs/ADRs) — `closing-documentation.technical-docs`; (3) **histórico de la tarea** (session log en `.claude/context/<package>/<task-id>.md`) — `closing-documentation.context-log`. Docs de dev/usuario + changeset cuando aplique. Una capa con flag `false` no entra en la DoD ni bloquea el cierre.

## Paso 7 — Gate de cierre por tarea: mutation testing

Salvo que `features.mutation-gate` sea `false` (o `stack.mutation-tool: none`), cada tarea no se cierra hasta pasar el gate de **mutation testing** con el umbral configurado (`true` = `break:80`; `<int>` = ese umbral). Ver la skill `/mutation`, que lee el mismo `stack`/umbral del YAML.

## Paso 8 — Gate de cierre por tarea: fact-checker (no-negociable)

**Tras** el gate de mutation y **antes** de commit y del resumen final, cada tarea corre `fact-checker` sobre las afirmaciones factuales de la sesión (incluida «el gate de mutation pasó»). No es configurable —barato + nuclear, como `grilling`/aprobación—: **no existe `features.fact-check`** ni ningún flag que lo desactive; aplica en cualquier `mode`/preset. Al cierre: `INCORRECTO` **bloquea** hasta corregir la afirmación; `NO VERIFICABLE` es un **aviso a reconocer** explícitamente (frecuente en stack sin runner), pero no bloquea; `VERIFICADO` pasa. Ver la skill `/fact-checker`.

## Reglas de la sesión

- **Checkpoints humanos**: `grilling` y la aprobación del plan **no se saltan nunca**. `design-review` y `scenario-coverage` solo con el salto en planes triviales (criterios + confirmación + log).
- **Gate de cierre `fact-checker` (no-negociable)**: cada tarea se cierra con la pasada de `fact-checker` (tras `mutation`, antes de commit/resumen); un `INCORRECTO` bloquea el cierre. Ningún flag lo desactiva.
- **Commits deliberados**: `<task-id>: <conventional commit>` en la rama del plan.
- **Una sola tarea `active` por plan** (comparten rama).
- Si el package no tiene su `HOW-TO-START-A-TASK.md`, créalo desde `templates/HOW-TO-START-A-TASK.md` (junto a este skill; ábrela con Read y rellena los bloques `ESPECÍFICO DEL PACKAGE`) antes del handoff. Atajo: `/task-init <package>` hace exactamente eso.
