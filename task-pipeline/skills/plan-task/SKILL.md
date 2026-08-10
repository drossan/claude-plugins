---
name: plan-task
description: Orquesta el inicio de una tarea/plan de principio a fin — plan mode → plan en pending → grilling → design-review → tareas en Gherkin → scenario-coverage → handoff al flujo TDD → gate de mutation testing → gate de cierre fact-checker. Úsalo cuando el usuario quiera arrancar trabajo nuevo a partir de unas especificaciones (p.ej. `/plan-task "quiero añadir X"`).
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
- **Por qué el salto se calibra por ejemplos y no por adjetivos.** La guía de migración a **Opus 5** documenta dos cosas relevantes: el modelo **delega más** que la generación anterior, y las instrucciones que le piden verificar ("usa un subagente para verificar", "revisa tu respuesta") ahora provocan **sobre-verificación**. En un plan donde no hay nada que revisar, una pasada con subagente repite cara lo que la sesión ya hace. Lo que **no** está medido es el rendimiento relativo de estas dos pasadas: por eso aquí se **afila el criterio**, no se amplía el salto a ojo.
- **Solo puedes OFRECER saltar** si el plan cumple **TODOS** los criterios de abajo. Cada uno trae su **frontera resuelta con un ejemplo**: si tu caso no encaja en la columna izquierda, **no lo estires** — no lo ofreces y ejecutas la pasada.

  | Criterio | Se puede ofrecer | NO se ofrece |
  |---|---|---|
  | **Un solo eje de decisión.** No cuentes ficheros: cuenta decisiones. N ficheros son **un** eje si son la *misma* decisión replicada; son **dos** si podrían razonablemente resolverse distinto. | cambiar un criterio en un `SKILL.md` y propagarlo a sus copias de docs/README/website: **4 ficheros, una decisión** | añadir una clave de config **y** el lector que la interpreta: **2 decisiones** que pueden divergir |
  | **`Provides` vacío en todas las tareas.** Test mecánico, no juicio: si una tarea declara algo distinto de `—`, hay un contrato del que otro puede depender — y quien lo escribió no es quien decide si "cuenta". | una sección nueva en un README, con `Provides: —` | cualquier `Provides` no vacío: una clave de `task-pipeline.yml`, un flag, una ruta o un fichero que otra tarea (o un repo consumidor) lea |
  | **Sin decisión arquitectónica ni nada transversal.** | cambiar el texto de un aviso ya existente | cambiar **cuál** es la fuente de verdad, o tocar algo que heredan los repos consumidores |
  | **(solo `scenario-coverage`) 1 tarea sin caminos de error/borde reales.** El conteo **no se amplía**: el valor de la pasada es detectar el *requisito que ninguna tarea contempla*, y eso crece con el número de tareas. | 1 tarea cuyo `Then` es "el fichero X dice Y", verificable leyendo un texto | 2+ tareas, **o** una sola que añade una rama condicional, un error nuevo o un estado |

  > **Frase canónica para las copias.** Los docs no repiten la tabla: llevan este resumen **literal** — *una sola decisión replicada, sin contrato nuevo ni decisión arquitectónica (y, para `scenario-coverage`, 1 tarea sin caminos de error reales)*. Está en `templates/task-lifecycle.md`, `docs/guides/task-lifecycle.md`, `docs/flujo-del-pipeline.md` y `website/guia/pipeline.md`. Si tocas la tabla, tocas las cuatro.

- **Confirma con `AskUserQuestion`**, con la opción por defecto = **ejecutar la pasada**. No fuerces el salto con el framing. **Sin canal para preguntar** (no puedes lanzar `AskUserQuestion`) → **ejecutas la pasada** y no registras ningún salto.
- **Las dos decisiones son independientes.** Aceptar el salto de `design-review` (Paso 4.5) **no** es consentimiento para `scenario-coverage` (Paso 5.5): se pregunta otra vez.
- **Registra el salto y su motivo en el Plan change log** (p. ej. *"`design-review` omitida: una sola decisión replicada en 4 copias, sin contrato nuevo — aprobado por owner"*). Una gate saltada deja rastro; nunca desaparece en silencio.
- **La trivialidad caduca.** Si una re-planificación in-place (Paso 0) hace que el plan deje de cumplir los criterios, la pasada **se ejecuta** antes de continuar y el Plan change log registra que **el salto anterior quedó invalidado**.

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

**`## Fuera de alcance` se hereda del plan, tarea a tarea.** Del `### Fuera de alcance` del plan, copia a cada tarea **solo los bullets que la acotan a ella** — sin inventarlos ni ensancharlos al parafrasear. Si el plan no tiene la sección, la tiene vacía o solo trae el placeholder, escribe **`—` explícito**; si la tarea se crea **sin plan**, `—` más la nota de que no hay plan del que heredar. **Nunca dejes el placeholder crudo** en una tarea materializada. Acota el **encargo**, no el esfuerzo: lo que sí está dentro se termina entero.

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

Antes del handoff, aplica la regla de **salto en planes triviales** (ver arriba) y, si procede, invoca la skill **`scenario-coverage`** sobre el **set completo** de tareas recién creadas: lanza un **subagente QA fresco** que busca comportamientos no cubiertos por dimensiones (fronteras, errores, estado, concurrencia, input adversario, Spec implícita y —clave— **requisitos que ninguna tarea contempla**, el hueco que el mutation testing no puede detectar). No es volumen por volumen: cada dimensión irrelevante se descarta con su porqué. Esto abarata el bucle de survivors del cierre.

**Pásale también la ruta del plan.** Sin él, la dimensión 8 no puede saber qué se dejó fuera **a propósito** y propone como hueco lo que tú ya descartaste — el pipeline se convierte en un motor de expansión de alcance. La salida viene en **dos secciones**:

- **(A) Dentro del alcance** → incorpora los escenarios aceptados a `## Scenarios (Gherkin)`; si un hueco es un requisito sin tarea, puede implicar una tarea nueva (vuelve a descomponer).
- **(B) Fuera del alcance declarado** → **no** los conviertas en escenarios ni tareas por tu cuenta: son **decisión del owner**. Preséntalos con su detalle, decide con él cada uno y registra la decisión y su motivo en el **Plan change log**. Si la sección viene vacía, se dice "ninguno"; si el subagente no pudo leer el plan, traslada esa declaración en vez de leerla como "no hay nada fuera de alcance".

## Paso 5.7 — Proyección a GitHub Issues (opcional — `features.github-tracking`)

**Pasos CONDICIONALES**: se ejecutan **solo si** `features.github-tracking.enabled` es `true` (booleano) **y** `gh` está instalado y autenticado con **permiso de escritura** **y** el repo es de GitHub. Si falta cualquiera → **no-op** (silencioso salvo un aviso breve): el `.md` es la verdad y el plan se materializa igual. Es una **proyección one-way** (`.md` → GitHub): plan → issue **PADRE**, tarea → **SUB-ISSUE**. Corre una vez el set de tareas es definitivo (tras Paso 5.5).

> **Degradación (C3, best-effort).** En TODOS los modos de fallo —`gh` ausente/viejo (sin `--parent`), sin red, repo no-GitHub, `gh` sin auth, **authed sin permiso de escritura (403)**, rate-limit/error a mitad de bucle— **avisa y continúa**: **nunca** abortes la materialización del `.md`. La proyección puede quedar **parcial**; el re-run la reanuda de forma idempotente por `issue:`. Este playbook **no garantiza** sync remoto (paginación, rate-limit, auth, issue borrada): es **best-effort**; la reconciliación vive en `/doctor`.

1. **Resolver `repo`**: usa `features.github-tracking.repo` si está; si no, el remoto por defecto: `gh repo view --json nameWithOwner -q .nameWithOwner`. Con **múltiples remotos** (fork `origin` vs `upstream`) se usa el que resuelva `gh repo view`; **recomienda fijar `repo`** en la config para desambiguar.
2. **Body de cada issue (PADRE y SUB-ISSUE)** — construir con `--body-file` (nunca `--body` interpolado; seguro ante backticks/`$`/markdown):
   - Volcar el **cuerpo completo** del `.md` (el del **plan** para el padre; el de la **tarea** para la sub-issue) **quitando SOLO el bloque de frontmatter YAML** (el delimitado por el **primer par** de `---` al inicio; **conserva** cualquier `---` posterior del cuerpo — reglas horizontales o `---` dentro de bloques de código).
   - Anteponer un **banner de espejo**: `> ⚠️ Espejo generado desde \`<ruta-del-.md>\`. La **fuente de verdad** es el .md; no edites esta issue a mano.`
   - Cerrar con un **link** a la ruta del `.md` en el repo.
   - **Límite de tamaño**: si el body supera el máximo de GitHub (~65536 chars), **trunca** el cuerpo y cierra con `> …(truncado — ver el .md para el contenido completo)`, conservando banner + link (no dejes que `gh` falle por longitud).
3. **Labels** — crear si faltan (`gh label create … -R <repo>`; **"ya existe" NO es fallo** → aplica la label igual; solo un fallo **real** degrada → issue sin esa label + aviso):
   - **`pkg:<package>`** en **padre y sub-issues**, derivada del frontmatter `package:` (color `5319E7`, descripción `Package: <package> (task-pipeline)`). Si el `package` tiene caracteres no válidos para una label de GitHub, **sanea o degrada** (sin bloquear el `.md`).
   - **`plan`** solo en el **PADRE** (como hoy). `issue-type-plan` (si está configurado y disponible en el ORG) es opcional para el padre.
   - **`--type` NO se pasa** (issue types nativos = **org-only**; se omite — ver README → GitHub tracking).
4. **Alta en el Project** (solo si `features.github-tracking.project` está) — para **padre y sub-issues**: resolver `<owner>` del `repo`; `gh project item-add <project> --owner <owner> --url <url>` y fijar Status **`Backlog`** (`gh project item-edit … --single-select-option-id <id>`, resolviendo la opción **por nombre, case-insensitive**). Si no hay `project`, la opción no existe, falla (403/red) o el item **ya está** en el Project → **salta + avisa** (no duplica, no bloquea).
5. **Plan → issue PADRE**: si el `.md` del plan **no** tiene `issue:` aún, `gh issue create` (título como argumento de `--title`; body/labels/alta según pasos 2-4). Escribe `issue: <n>` en el frontmatter del plan **inmediatamente**. **Si el `create` del padre FALLA → NO crees sub-issues sueltas**: aborta la proyección del plan (aviso); el `.md` queda materializado igual.
6. **Tarea → SUB-ISSUE**: por cada tarea cuyo `.md` **no** tenga `issue:`, `gh issue create --parent <nº-padre> …` (body/labels/alta según pasos 2-4) y escribe `issue: <n>` en su frontmatter **inmediatamente tras** crearla (minimiza la ventana del exactly-once).
7. **Idempotencia / re-proyección (re-sync no duplica; SÍ re-vuelca el body)**: si un `.md` **ya** tiene `issue:`, **no** crees otra; en una **re-proyección explícita** (re-run de `/plan-task` o `/doctor`) **actualiza** la existente con `gh issue edit --body-file` (re-genera el body desde el `.md`, paso 2) y re-aplica labels/alta idempotentemente. Si el número **ya no existe** en GitHub (borrada a mano) → **avisa** y deja la reconciliación a `/doctor` (**no** recrees a ciegas).
8. **Títulos adversarios**: pasa el título como **argumento** (`--title` con el valor entre comillas — **comillas simples** si contiene backticks/`$` para evitar la sustitución de shell), nunca interpolado en una cadena. El markdown en el título es cosmético (aceptable); lo que no puede pasar es que rompa el shell.
9. **`depends_on`**: **NO** se proyecta como dependencia nativa de GitHub; como mucho, una nota de texto en el body de la sub-issue.

**Exactly-once (límite honesto)**: si el proceso muere **entre** crear la issue y escribir `issue:` en el `.md`, un re-run no puede saber que ya existe y **podría** crear una segunda. Se minimiza escribiendo `issue:` inmediatamente (paso 6); el residual lo detecta/limpia `/doctor`. Declarado como límite best-effort.

**Concurrencia — no duplicar el PADRE (T-B)**: antes de crear el padre (paso 5), si el `.md` del plan **ya** trae `issue:` (p.ej. traído por `pull`/merge de la rama donde se proyectó primero), **reutilízalo** — NO crees otro. **Límite conocido (no se previene en duro)**: dos ramas **frescas** del mismo plan, ambas con el flag on, proyectadas por separado, crean **padres duplicados** + `issue:` en conflicto al mergear (es el residual "mismo plan, dos ramas" extendido a la proyección). Mitigación: **una sola rama proyecta el plan**; lo detecta `/doctor` (reconciliación) y lo documenta la guía de usuario.

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
