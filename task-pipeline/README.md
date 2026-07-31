# task-pipeline (plugin de Claude Code)

Pipeline de trabajo guiado para iniciar y ejecutar tareas con calidad:

```
/plan-task "<specs>"  →  plan mode  →  plan en .claude/plans/pending/<package>/
                 →  grilling (refinar rama a rama, checkpoint humano)
                 →  design-review (zoom-out adversario vía subagente, checkpoint)
                 →  descomponer en tareas con escenarios Gherkin
                 →  scenario-coverage (QA adversario de escenarios vía subagente)
                 →  handoff al flujo TDD (Red → Green → Refactor)
                 →  /mutation (gate de calidad de tests, Stryker break 80)
                 →  fact-checker (gate de cierre: verifica las afirmaciones de la sesión)
```

Checkpoints humanos: **`grilling`** y **aprobación del plan** son **no negociables**. Las dos pasadas caras por subagente (**`design-review`**, **`scenario-coverage`**) corren por defecto pero admiten un **salto proporcional** solo en planes triviales (criterios estrictos + confirmación del owner + log). No es fire-and-forget, por diseño.

> 📖 ¿Presentando el pipeline al equipo? Empieza por [docs/flujo-del-pipeline.md](docs/flujo-del-pipeline.md) — resumen del flujo, las skills y las ideas clave, con un ejemplo end-to-end.

> 🌐 **Portal web**: [drossan.github.io/claude-plugins](https://drossan.github.io/claude-plugins/) (VitePress, se publica con cada release `v*`; vivo tras encender Pages + el primer tag).

## Skills

| Skill | Qué hace |
|---|---|
| `/task-init` | Bootstrapea la convención en el repo (esqueleto `.claude/…` + `task-lifecycle.md` + HOW-TO de un package). Úsalo una vez tras instalar. |
| `/plan-task` | Orquestador del pipeline completo (incl. caso re-plan de un plan activo). |
| `grilling` | Interrogatorio para refinar un plan/diseño, una pregunta a la vez (rama por rama). **Skill de terceros** (MIT, © Matt Pocock — [`mattpocock/skills`](https://github.com/mattpocock/skills)). |
| `design-review` | Revisión holística adversaria del plan vía **subagente fresco** (sin sesgo de autor): coherencia, tamaño correcto, mantenibilidad, escalabilidad real, reversibilidad. Tras `grilling`. |
| `scenario-coverage` | Endurecimiento QA de los escenarios Gherkin vía **subagente fresco**: cobertura por dimensiones (fronteras, errores, estado, requisitos ausentes…) con descarte explícito. Tras descomponer en tareas. |
| `/mutation` | Gate de mutation testing con Stryker (Vitest), por tarea, bucle de matar survivors. |
| `/doctor` | Diagnostica y alinea un repo **ya adoptado** con la versión actual del plugin: verifica (read-only) y corrige el drift (identificadores viejos, `models:` ausente, estructura incompleta, gate/reglas de honestidad ausentes) **solo tras tu aprobación** y con diff. Frontera con `/task-init` (que bootstrapea desde cero). |
| `fact-checker` | **Gate de cierre**: verifica la **veracidad de las afirmaciones** de la sesión (código, tests, librerías, imports) vía **subagente fresco** de solo lectura; salida VERIFICADO/INCORRECTO/NO VERIFICABLE. Lo invoca la DoD de cierre (tras `/mutation`, antes de commit) — **no** se auto-ejecuta. Frontera con `/doctor`: `fact-checker` = veracidad de afirmaciones; `doctor` = drift de convención. |
| `/pipeline-usage` | **Analítica de uso on-demand** (read-only): tokens (input/output/cache), modelo, tiempo y desglose **por fase** (design-review, grilling, plan-task…) y **por subagente** de la sesión, leyendo el transcript. **Best-effort** (el formato del transcript es interno/no soportado): el titular es el total de sesión y avisa cuando las cifras pueden estar incompletas. No hay recolección por hooks: invocarla es el opt-in. |

## Convención que asume el plugin

El plugin NO impone estructura nueva; asume que el repo ya organiza el trabajo así (lo genérico va en el plugin, lo específico del repo se queda en el repo):

```
.claude/
  plans/<estado>/<package>/<name-plan>.md      # estado: pending|active|completed|cancelled
  tasks/<estado>/<package>/<task-id>.md
  context/<package>/<task-id>.md               # histórico de sesión (append-only)
  specs/<package>/HOW-TO-START-A-TASK.md        # gate de ejecución por package
  specs/<package>/use-cases/UC-<AREA>-<slug>.md # (features.use-cases) specs vivas de producto
  task-pipeline.yml                             # config de features del repo (defaults ON)
docs/guides/task-lifecycle.md                  # flujo canónico (estados, plantillas, DoD)
```

## Trabajo en equipo y colisiones de id

El `<task-id>` es **plan-scoped**: `<task-id> = <plan-id>-<nn>` (`<plan-id> = <package>-<name-plan>`, `<nn>` correlativo **dentro del plan** desde `01`). No es un contador global del package. La razón: **el espacio de nombres del id coincide con la unidad de paralelismo**, que aquí es el **plan = rama**. Dos planes distintos = dos espacios de id distintos → **nunca colisionan**.

**Por qué importa.** Con un contador global (`<package>-<nnn>`), dos ramas cortadas del mismo `main` ven el mismo "último número" y asignan el mismo `nnn`; al mergear salta un conflicto **add/add silencioso** (dos `…-013.md` distintos). Con ids plan-scoped eso desaparece salvo el residual de abajo.

**Disciplina de equipo:**

- **Una rama = un plan** (`plan/<package>/<name-plan>`). Todas las tareas del plan caen en esa rama.
- **Una sola tarea `active` por plan** (comparten rama).
- `/plan-task` asigna el `<nn>` contando el máximo existente **en el plan** (todos los estados) + 1 — nunca sobre el package.

**Residual honesto (no se previene en duro):**

- **Mismo `<name-plan>` en paralelo** → misma `<plan-id>` → colisiona, pero es **1 conflicto único, evidente y semántico** (el fichero del plan), no la lluvia silenciosa de antes. Lo caza **`/doctor`** (categoría "ids de tarea/plan duplicados").
- **Dos ramas extendiendo el mismo plan** → ambas ven el mismo máximo `<nn>` y asignan el mismo → colisión **no** prevenida por este esquema (la prevendría un sufijo aleatorio, descartado por el owner). Mitigación: la disciplina de arriba + detección en `/doctor`.

**Cómo se ve en git.** Antes: conflicto **add/add silencioso** (cada rama ignora el número de la otra). Ahora: **1 conflicto único y evidente** en el fichero del plan (o el `.md` de tarea concreto), fácil de reconocer y resolver.

**Cómo resolver una colisión detectada** (por `/doctor` o al mergear):

1. Elige el fichero a cambiar (normalmente el `<nn>` **más nuevo**) y **renumera** su `<task-id>` — **o**, si chocan los planes, **renombra** el `<name-plan>` (y con él la `<plan-id>` de todas sus tareas).
2. **Actualiza los `depends_on`** de las tareas que apuntaban al id renombrado y **cualquier enlace** que lo referencie (contexto/histórico, sección Tasks del plan).
3. Renombra también el fichero (filename = id) y su session log en `.claude/context/`.

## Configuración por repo (`.claude/task-pipeline.yml`)

El pipeline se adapta al repo vía `.claude/task-pipeline.yml`. Las skills lo leen y
lo respetan. **Resolución**: defaults internos (= preset `full`) → preset de `mode:`
→ claves explícitas en `stack:`/`features:`. **Sin archivo → todo `full`** (el
comportamiento histórico, así repos existentes no cambian). `/task-init` lo
materializa rellenando el `stack` detectado, y el hook `SessionStart` lo restaura si
se borra.

**Preset (`mode`)** — para no acertar 5 flags sueltos:

| `mode` | `tdd` | docs | `mutation-gate` | Para |
|---|---|---|---|---|
| `full` (default) | ON | ON | `80` | repos con stack de tests sano |
| `legacy` | ON | ON | OFF | legacy: testeas lo que tocas, pero no llegas a 80 |
| `docs-only` | OFF | ON | OFF | solo orquestar planes + documentar |

**Stack (`stack`)** — `language`, `package-manager`, `test-runner`, `mutation-tool`:
las skills eligen comandos con esto en vez de asumir pnpm/Vitest/Stryker (cubre repos
con Jest, npm, no-TS, etc.).

**Flags (`features`)** — una clave explícita pisa el preset:

| Flag | Valores | Qué controla |
|---|---|---|
| `features.tdd` | `true`/`false` | Exigir tests/TDD en la DoD (escape hatch para legacy sin harness). |
| `features.closing-documentation.tsdoc` | `true`/`false` | Doc en el código. |
| `features.closing-documentation.technical-docs` | `true`/`false` | Doc técnica (README/CLAUDE.md/specs/ADRs). |
| `features.closing-documentation.context-log` | `true`/`false` | Session log en `.claude/context/`. |
| `features.mutation-gate` | `false`/`true`(=80)/`<int>` | Gate de mutation y su umbral `break`. |
| `features.use-cases` | bloque; opt-in (default **off**) | **Specs vivas de producto**: casos de uso `UC-<AREA>-<slug>` con ACs en Gherkin, en `.claude/specs/<package>/use-cases/`. Fuera de todo preset; solo `enabled: true` activa (valor no-canónico → off); `areas:` declara el alias del id por package. Ver [Use cases](#use-cases-opcional--featuresuse-cases). |
| `features.caveman` | `off`(default)/`lite`/`full` | **Comportamiento** opt-in (no gate de DoD): comprime el output del hilo principal para ahorrar tokens, con backoff en los checkpoints. **No** forma parte de ningún preset; valor no-canónico → `off`. Ver [Modo caveman](#modo-caveman-featurescaveman). |

`grilling` y la aprobación del plan **no** son configurables: no negociables por
diseño. `design-review` y `scenario-coverage` corren por defecto; solo se saltan con
el opt-out en planes triviales (criterios + confirmación + log), no por flag de repo.

Si un repo no sigue esta convención, **bootstraséala con `/task-init`** (una vez tras instalar el plugin); `/plan-task` también avisa/ayuda si te la saltas.

## Routing de modelo por fase (`models:`)

Las fases que lanzan un **subagente** (`design-review`, `scenario-coverage`, `fact-checker`) pueden correr con un modelo distinto al de tu sesión. Se configura en la sección `models:` de `.claude/task-pipeline.yml`:

```yaml
models:
  design-review: opus        # alias o id de modelo
  # scenario-coverage:       # ausente / inherit → hereda la sesión
  # fact-checker:            # ausente / inherit → hereda la sesión (verificar es barato)
```

- **Clave ausente o `inherit`** → la fase hereda el modelo de la sesión (no se fuerza nada).
- **Alias o id de modelo** → se pasa como `model` al lanzar el subagente (Agent tool).
- **Valor inválido** (typo / id inexistente) → la skill **avisa** y cae a inherit; nunca lanza un subagente con un `model` roto.
- **Clave para una fase inline** → se ignora (esa fase hereda la sesión).

**Limitación de plataforma.** Solo las fases con **subagente** se pueden rutar, porque el modelo se fija por invocación de la Agent tool. Las fases **inline** —`grilling`, `mutation` y el propio `/plan-task`— corren en la sesión actual y **heredan su modelo**: no hay forma robusta de cambiárselo desde una skill, ni existe un "modelo óptimo" automático que el pipeline pueda elegir por ti (verificado contra `code.claude.com/docs`). Si quieres una fase inline en otro modelo, cambia el modelo de la sesión.

> El template (`skills/plan-task/templates/task-pipeline.yml`) trae `models:` **comentado**: no impone modelos a los repos que adoptan el plugin. Este repo (source del plugin) sí pinea `design-review: opus`.

## Analítica de uso (`/pipeline-usage`)

Skill **on-demand y read-only** que reporta el consumo de la sesión: tokens
(input/output/cache), modelo, duración y desglose **por fase** y **por subagente**,
leyendo el transcript. **No** añade hooks ni recolección automática — invocarla es el
opt-in, y el coste solo se paga cuando pides el informe.

- **Honestidad**: el formato del transcript es **interno/no soportado** (puede cambiar
  entre versiones). El **titular es el total de sesión**; el por-fase suele ser
  minoritario (el grueso del gasto no lleva fase) y se marca **best-effort e
  incompleto**. Nunca presenta un número que no pueda garantizar; si falta `python3`, el
  esquema no cuadra o hay líneas corruptas, **lo dice**.
- **Privacidad**: solo lee **métricas** (tokens/modelo/tiempo/fase), nunca el texto de
  los mensajes. El snapshot opcional vive en `.claude/analytics/sessions/<id>.json`.
- **Repos consumidores**: añade `.claude/analytics/` a **tu** `.gitignore` (métricas
  per-usuario). El plugin **no** toca tu `.gitignore` (invariante).

## Modo caveman (`features.caveman`)

Comportamiento **opt-in** (default `off`) que comprime el **output del hilo principal**
para ahorrar tokens. Se activa con `features.caveman: lite|full` en
`.claude/task-pipeline.yml`; lo aplica el hook `UserPromptSubmit` (`hooks/caveman.sh`),
que inyecta una directiva mínima de compresión.

- **`lite`**: elimina relleno y cortesías, gramática legible. **`full`**: prosa
  telegráfica, fragmentos. En ambos, **código, comandos, errores, rutas y cifras van byte
  a byte** (nunca se comprimen), y las salvedades de incertidumbre («no verificado») se
  conservan (coherencia con `honesty-rules.md`).
- **Backoff determinista en checkpoints**: el hook lee la fase activa del transcript y
  **no** inyecta durante `grilling`/`design-review`/`scenario-coverage`/`fact-checker`
  (donde la claridad manda). No depende del juicio del modelo.
- **Limitación**: afecta solo al **hilo principal**, no al output de los subagentes.
- **ROI honesto**: en flujos con mucho tool-use el ahorro real es modesto (input y tokens
  de herramientas dominan). El pipeline **no puede medir por sí solo** el efecto de caveman
  (los informes de `/pipeline-usage` son por sesión, sin control A/B): actívalo si quieres
  probarlo, no esperes un ahorro garantizado. `off` por defecto y en el template.

## Use cases (opcional — `features.use-cases`)

Feature **opt-in** (default `off`) que añade al pipeline la capa de **specs vivas de
producto**: casos de uso (`UC-<AREA>-<slug>`) con criterios de aceptación en Gherkin, en
`.claude/specs/<package>/use-cases/`. Resuelve una asimetría del pipeline: los planes y
las tareas son **efímeros** (se archivan al cerrar, con su Gherkin dentro), así que sin
esta capa no queda en ningún sitio mantenido *qué hace el software HOY* — el conocimiento
de comportamiento se genera en cada tarea y se entierra con ella.

**Config (`features.use-cases`)** — bloque, mismo fail-safe que `github-tracking`
(**solo `enabled: true` booleano activa**; ausente / `false` / valor no-canónico → off):

| Clave | Qué es |
|---|---|
| `enabled` | `true` (booleano) lo activa. Fuera de todo preset; su ausencia no es drift. |
| `areas` | Mapa `package: AREA` — el alias del id (`MAYÚSCULAS sin guiones`, p.ej. `shop-cart: CART`). Un package **sin entrada** usa el default mecánico: el nombre del package en MAYÚSCULAS sin guiones (`shop-cart` → `SHOPCART`). Declararlo evita el juicio por sesión y las colisiones de alias. Opcional. |

- **El artefacto** (`templates/use-case.md`): `## Intent`, `## Actors and trigger`,
  `## Main flow` (pasos numerados en lenguaje de dominio), `## Alternative flows /
  errors` (cada desvío con el paso donde salta y cómo cierra), `## Acceptance criteria
  (Gherkin)` — cada `Scenario: ACn · …` es un AC —, `## Out of scope` (fronteras
  declaradas, **cada una con destino existente**: un «no existe aún» es un hueco, no una
  frontera), `## Notes / links` y `## Change log`. **Regla anti-drift**: el main flow
  narra el orden, los ACs fijan los detalles (formatos, límites, valores) — cuando un
  dato concreto vive en un AC, el flow lo **referencia** («…con el formato que fija
  AC5») en vez de repetirlo; cada duplicado es una copia que, sin validador, acaba
  contradiciéndose. Frontmatter con `status: draft|active` y `trace:` — los ficheros
  donde **se edita** el comportamiento (rutas desde la raíz; siempre el artefacto
  **vivo**, nunca una plantilla/semilla que se copia; los tests no van ahí — se
  encuentran por su tag). El **nombre del fichero ES el id**, sin contador: un UC es
  global al package y longevo, no plan-scoped, así que un correlativo reintroduciría
  justo la colisión entre ramas que los ids plan-scoped eliminaron.
- **Cómo se teje con el pipeline** (flag on): el plan declara `## Use cases` y los UCs
  existentes se leen **antes** de explorar código (Paso 2); cada tarea referencia en
  `use_cases:` los UC que crea/modifica (Paso 5); `scenario-coverage` recibe los UCs como
  **baseline** — un `Out of scope` con destino existente es frontera declarada, no hueco;
  uno sin destino es candidato a hueco; un AC vigente que el plan altera sin tarea que lo
  actualice es un hueco (Paso 5.5); y la DoD exige **consolidar** al cerrar: el escenario
  que define comportamiento observable del producto se promueve o actualiza como AC del
  UC; el de andamiaje muere con la tarea. Cada AC mapea 1:1 con un test
  `[UC-<AREA>-<slug>] ACn · …`.
- **Ciclo de vida**: nace `draft` (committeable sin tests) → `active` cuando todos sus ACs
  tienen test. Comportamiento retirado = UC borrado (git lo recuerda). Un cambio de
  comportamiento **actualiza** el AC existente, nunca añade uno que lo contradiga; los
  números de AC retirados no se reutilizan (los tags de tests viejos no deben
  re-significarse). Sin harness que taguear — `features.tdd: false` **o**
  `stack.test-runner: none` — los UCs se quedan en `draft`: spec sin verificación
  automática, dicho honestamente (el criterio real de `active` depende de que exista
  runner, no del flag `tdd`).
- **Renombrar un UC** (el slug se elige el primer día, cuando peor se entiende la
  capacidad — pasará) es una operación de primera clase, no un `mv`: (1) renombra fichero
  **e** `id:` a la vez (filename = id); (2) actualiza los `use_cases:` de las tareas en
  **todos** los estados y la sección `## Use cases` de los planes que lo citan; (3)
  actualiza los **tags de tests** `[UC-…]`; (4) anota el rename en el `## Change log` del
  UC (el nombre viejo queda buscable). `/doctor` reporta los cabos sueltos (referencias
  huérfanas, fichero ≠ id) pero no auto-edita.
- **Residual conocido (`ACn` en paralelo)**: dos ramas que añaden ACs al **mismo** UC
  pueden elegir el mismo número. A diferencia de los task-ids (ficheros nuevos → add/add
  silencioso), aquí ambas editan el **mismo fichero** → git da conflicto textual visible
  al mergear; si aun así cuela, `/doctor` reporta el `ACn` duplicado. No se previene en
  duro (mismo criterio que el residual de los task-ids).
- **Reconcilia antes de desactivar**: con `enabled: false` la categoría de `/doctor` **no
  corre** — los UCs que existan quedan huérfanos y sin vigilancia (nadie detecta `trace:`
  muerto ni `active` sin tests). Igual que con `github-tracking`: deja los UCs
  consolidados (o bórralos) **antes** de apagar el flag.
- **Límite honesto (hoy)**: la trazabilidad UC↔código↔test es **disciplina de DoD +
  playbook**, no un validador determinista. `/doctor` (con el flag on) caza el drift grueso
  — fichero ≠ id, `trace:` muerto, `use_cases:` huérfano, `ACn` duplicado, `AREA` que no
  cuadra con `areas:`, UC `active` con AC sin test (grep best-effort) — pero un script de
  trace ejecutable en CI (link-rot + cobertura AC↔test) es la evolución natural y **no
  existe aún**.

## GitHub tracking (opcional)

Integración **opt-in** (default `off`) que **proyecta** el trabajo a GitHub Issues/Projects para tener orden global glanceable + tablero. El `.md` sigue siendo la **única fuente de verdad**; GitHub es una **proyección one-way** (`.md` → GitHub). Se activa con `features.github-tracking.enabled: true` en `.claude/task-pipeline.yml`.

**Setup — la feature REQUIERE `gh`:**

- **No funciona sin `gh`** instalado y autenticado: `gh auth login` con scope **`repo`** (escritura de issues) y, para el tablero (Project), **`project`** (`gh auth refresh -s project`). Requiere una versión **reciente** de `gh` (sub-issues + `gh issue create --parent`).
- Sin `gh`, sin red, sin auth de escritura o repo no-GitHub → **no-op** (el flujo local no cambia).

**Config (`features.github-tracking`):**

| Clave | Qué es |
|---|---|
| `enabled` | `true` (booleano) lo activa. Ausente / `false` / valor no-canónico (`"true"`, `yes`, `1`, …) → **off** (fail-safe). |
| `repo` | `owner/name`; default = el repo actual (`gh repo view --json nameWithOwner`). Fíjalo si hay varios remotos. |
| `project` | nº de Project v2 para el tablero (campos de estado). Opcional. |
| `assignee` | `@me` (default) = identidad `gh` que arranca; un login para fijar otro; `false` = no asignar. Exige colaborador **asignable**. Solo la sub-issue de la tarea. Opcional. |
| `issue-type-plan` | issue type del plan (se define en el ORG); sin él → label `plan`. Avanzado, opcional. |

**Mapeo:**

- **Plan → issue PADRE**; **Task → SUB-ISSUE** (`gh issue create --parent`).
- **Orden global = número de issue** (lo asigna el servidor, monótono, sin colisión).
- **Body = cuerpo completo del `.md`** (sin frontmatter) + **banner de espejo** («⚠️ espejo generado desde `<path>` — la fuente de verdad es el `.md`») + link al `.md`. Se vuelca **al crear** y se re-vuelca **solo en re-proyección explícita** (`/doctor` / re-run de `/plan-task`), **no** en cada transición.
- **Label `pkg:<package>`** (derivada de `package:`, creada si falta) en padre y sub-issues → filtro glanceable por workspace.
- **Alta en el Project** (si hay `project`): padre y sub-issues entran con Status **`Backlog`** al crear.
- **Estados** — proyectados en cada transición en **dos sitios**: label `status:*` en la issue + campo **Status del Project**: `active` → `In progress` + `status: in-progress` (+ **assignee** según `assignee`) · `in-review` → `In review` + `status: in-review` · `blocked` → `status: blocked` (el Project queda en `In progress`) · `done` → cerrada + Project `Done` + `status:*` retirada · `cancelled` → cerrada "not planned" + `Done`. Recipe **add-then-remove** (añade la nueva antes de quitar las demás `status:*`). Mecánica canónica en [`docs/guides/task-lifecycle.md`](../docs/guides/task-lifecycle.md) → "Cerrar una tarea".
- **Ciclo de vida del padre**: al completar el plan, la **issue PADRE se cierra** (con `gh issue close`) + Project `Done`; GitHub **no** la auto-cierra al cerrar sus sub-issues. El padre **no** lleva `status:*` ni assignee.
- `depends_on` **no** se proyecta como dependencia nativa (a lo sumo nota de texto en el body).

**Límites (honestos):**

- La **jerarquía en Projects** (tabla padre/sub-issue) está en **public preview**, no en el Roadmap.
- Techos de GitHub: **100 sub-issues por padre** y **8 niveles** de anidamiento.
- **No hay épica nativa**: el "padre" es una issue normal con sub-issues.
- **Issue types omitidos + asimetría (org)**: los issue types nativos son **org-only** (en cuenta personal, `/orgs/<owner>/issue-types` → 404 verificado). El type se **omite**; en consumidores **org** el padre puede llevar `issue-type-plan` pero las sub-issues **no** llevan type (medio-tipado); en cuenta personal, ninguno.
- **`assignee` exige identidad asignable**: si quien corre (o el login fijado) no es **colaborador asignable** del repo, no asigna + avisa (el resto de la proyección sigue).
- **Status del Project = opciones default**: el match es por nombre **case-insensitive** sobre `Backlog/Ready/In progress/In review/Done` (la opción real es `In progress`, no `In Progress`). Si el Project del consumidor las nombra distinto → salta el Status + avisa (la label `status:*` es el fallback visible).
- **Body sin demonio + límite de tamaño**: el body se vuelca al crear y en re-proyección explícita, **no** en cada guardado del `.md` (no hay watcher; el trabajo vivo va al session log, que **no** se proyecta). Un cuerpo que supere el **límite de body de GitHub (~65536 chars)** se **trunca** con nota «(ver el `.md`)» conservando banner + link.

**Riesgos aceptados** (el owner mantuvo la feature conociéndolos; ver el Plan change log):

- **Proyección concurrente (T-B)**: dos devs proyectando el **mismo plan** en ramas separadas crean **padres duplicados** + `issue:` en conflicto al mergear. **No se previene en duro.** Mitigación: **una sola rama proyecta el plan**; `/doctor` lo detecta (reconciliación).
- **Sync best-effort (C3)**: la reconciliación de `/doctor` **no garantiza** consistencia (paginación, rate-limit, auth caída, issue borrada a mano); ante duda **reporta** y deja la decisión al humano.
- **Huérfanas al desactivar (I3, ampliado)**: con el flag `off` la reconciliación **no corre**, así que **no** detecta huérfanas. Desactivar deja además huérfanas las **definiciones** de labels `pkg:*`/`status:*`, los **items** del Project y las `status:*` pegadas a issues in-flight. Por eso: **reconcilia/limpia ANTES de desactivar** `github-tracking`; lo que quede tras apagarlo se resuelve a mano. (Misma historia que la categoría de reconciliación de `/doctor`.)

## Bootstrap del repo (tras instalar)

Dos mecanismos, complementarios:

- **`/task-init [<package>]`** (explícito, recomendado para arrancar): materializa la
  parte genérica (esqueleto `.claude/…` + `docs/guides/task-lifecycle.md`) y, si le
  pasas un package, su `HOW-TO-START-A-TASK.md` rellenando los bloques específicos.
  Reemplaza el viejo `/plan-task "inicia el proyecto…"` en lenguaje libre.
- **Hook `SessionStart`** (automático, auto-reparable): en cada arranque/resume de
  sesión, si el repo **ya está adoptado** (existe `.claude/plans|tasks|specs` o el
  `task-lifecycle.md`), asegura el esqueleto y restaura `task-lifecycle.md` si se
  borró. En repos **no adoptados** es un no-op silencioso (no ensucia proyectos
  ajenos: el plugin es global). La adopción inicial siempre es explícita con
  `/task-init`.

## Plantillas (`skills/plan-task/templates/`)

El plugin trae las **semillas** que `/plan-task` materializa en el repo (no se inyectan en runtime; el skill las lee con `Read` y las copia al repo, donde luego viven):

| Plantilla | Se materializa en |
|---|---|
| `skills/plan-task/templates/task-lifecycle.md` | `docs/guides/task-lifecycle.md` (flujo canónico, una vez) |
| `skills/plan-task/templates/task-pipeline.yml` | `.claude/task-pipeline.yml` (config del repo: preset/stack/features, una vez) |
| `skills/plan-task/templates/honesty-rules.md` | `.claude/honesty-rules.md` (reglas de honestidad; `@import` opt-in al `CLAUDE.md`, una vez) |
| `skills/plan-task/templates/coding-standards.md` | `.claude/specs/general/coding-standards.md` (no-duplicación; user-owned, una vez) |
| `skills/plan-task/templates/HOW-TO-START-A-TASK.md` | `.claude/specs/<package>/HOW-TO-START-A-TASK.md` (una vez por package) |
| `skills/plan-task/templates/plan.md` | `.claude/plans/pending/<package>/<name-plan>.md` (por plan) |
| `skills/plan-task/templates/task.md` | `.claude/tasks/pending/<package>/<task-id>.md` (por tarea; incluye `## Scenarios (Gherkin)`) |
| `skills/plan-task/templates/use-case.md` | `.claude/specs/<package>/use-cases/UC-<AREA>-<slug>.md` (por caso de uso; solo con `features.use-cases`) |

Detalle y placeholders en `skills/plan-task/templates/README.md`. Esto cierra el bootstrap: `/plan-task` copia desde estas plantillas en vez de "replicar el HOW-TO de otro package".

> Viven **dentro** del skill `plan-task` (no en la raíz del plugin) a propósito: `${CLAUDE_PLUGIN_ROOT}` no se expande en el cuerpo de un `SKILL.md`, así que el skill las referencia con ruta relativa (`templates/…`).

## Config específica del proyecto (no va en el plugin)

- Lista de workspaces/packages.
- `stryker.config.json` por package (runner, globs a mutar, umbral). El plugin trae la plantilla; el repo la materializa. El umbral `break` sale de `features.mutation-gate`.
- `task-lifecycle.md`, specs y HOW-TOs propios del repo.
- Stack (runner/gestor/lenguaje): se declara en `stack:` de `.claude/task-pipeline.yml`. Por defecto el plugin asume **TypeScript + Vitest + pnpm + Stryker**; cámbialo ahí si difiere.

## Instalar en un proyecto

El plugin vive en un marketplace local (carpeta). Para usarlo en cualquier repo:

```
/plugin marketplace add ~/claude-plugins
/plugin install task-pipeline@local-plugins
```

(O en `settings.json`: `extraKnownMarketplaces` con source `directory` apuntando a `~/claude-plugins`, y `enabledPlugins: { "task-pipeline@local-plugins": true }`.)

## Notas

- Las skills son **playbooks que Claude sigue** (model-driven), no scripts deterministas.
- `/mutation` instala Stryker en cada package la **primera vez** (one-time): el primer cierre de tarea de un package tarda algo más.
- Gotcha pnpm verificado: Stryker necesita `"plugins": ["@stryker-mutator/vitest-runner"]` explícito y se invoca con `pnpm exec stryker run` (no `npx`).
