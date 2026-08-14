# Changelog — task-pipeline

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado [SemVer](https://semver.org/lang/es/). La versión vive en
`.claude-plugin/plugin.json` (es la que resuelve el marketplace).

## [Unreleased]

> Entradas del plan **sdd-y-stack-poliglota** (#35 stack por-package · #36 SDD nativo). La tarea de
> release (08) las consolida bajo un único header de versión con su bump SemVer.

### Added
- **Schema `stack.packages.<pkg>`** (#35) — override de stack **por-workspace** para monorepos poliglotas.
  El `stack:` top-level pasa a ser el **default/fallback**; una entrada de package pisa **solo las claves
  que declara** (herencia parcial). La **regla de resolución se enuncia en un único sitio canónico**
  (README → "Configuración por repo" → "Stack por-package") y las demás sedes (YAML seed comentado, los
  dos `task-lifecycle`, el contrato de lectura de `plan-task`) **apuntan** a él. `packages` ausente =
  comportamiento histórico y **no es drift**; `stack.packages` malformado = config **legible** que no
  aborta el resto de la lectura. Los **lectores** (`/mutation`, `/task-init`, `/doctor`) llegan en las
  tareas siguientes del plan.
- **`/mutation` agnóstico por herramienta y por-package** (#35) — resuelve `stack.packages.<pkg>.mutation-tool`
  (fallback al top-level) y **despacha**: `stryker` (JS/TS, **camino verificado**, gotchas pnpm), `mutmut`
  (Python, **referencia** con banner "⚠️ no verificada"), un **escape genérico `mutation-command: "<cmd>"`**
  para cualquier otro lenguaje (referencia, mismo banner) y `none` (no-op "sin gate"). Un `mutation-command`
  que sale con código ≠ 0 **falla** el gate (no se silencia por ser referencia); herramienta desconocida sin
  `mutation-command` = no-op con aviso. **Solo Stryker se afirma verificado**; `cosmic-ray`/`cargo-mutants`/
  `gremlins` quedan como **ejemplos en docs**, no ramas shipeadas.
- **`/task-init` detecta el lenguaje por-workspace y siembra `stack.packages`** (#35) — infiere el lenguaje
  de marcadores (`package.json`→JS/TS, `pyproject.toml`/`setup.py`→Python, `Cargo.toml`→Rust, `go.mod`→Go),
  propone el stack por lenguaje (mapa coherente con `/mutation`: Rust/Go vía escape `mutation-command`) y lo
  escribe **solo tras `AskUserQuestion`** de confirm. Detección ambigua / en conflicto / sin marcador / sin
  canal → **no adivina**. La escritura es **aditiva** sobre un `.claude/task-pipeline.yml` ya materializado
  (no reescribe el fichero; no duplica una entrada existente) y sanea/pregunta ante nombres no válidos como
  clave YAML. El `HOW-TO-START-A-TASK.md` del package gana un bloque **"Stack de este package"** que
  **refleja** `stack.packages.<pkg>` (el YAML sigue siendo la fuente de verdad).
- **Set de plantillas SDD** (#36) — cuatro semillas nuevas en `templates/`, gated por `features.sdd`:
  **`spec.md`** (GitHub Spec Kit + EARS: user stories P1/P2/P3, requisitos `FR-00x` en EARS, criterios
  `SC-00x`, convención `[NECESITA ACLARACIÓN: …]`) → `.claude/specs/<pkg>/spec.md`; **`caso-de-uso.md`**
  (Cockburn *fully-dressed* + Gherkin, **único hogar del Gherkin** con la disciplina de `task.md`) →
  `.claude/specs/<pkg>/casos-de-uso/<id>.md`; **`adr.md`** (MADR 4.0.0, **los 5 estados** proposed/accepted/
  rejected/deprecated/superseded, status fiel a la fuente) → `.claude/specs/adr/NNNN-titulo.md`;
  **`adr-index.md`** (numeración `NNNN` desde `0001`, **sin `ADR-0000` de relleno**). `templates/README.md`
  gana la **lista canónica** de nombres/ubicaciones SDD (única fuente que `/doctor` referencia). El plugin
  envía **plantillas, no contenido**: ningún spec/CU/ADR de un package se autogenera.
- **Flag `features.sdd`** (#36) — booleano **opt-in** (default `off`) que activa la capa SDD, con el patrón
  de `caveman`/`github-tracking`: **fuera de todo preset** (`mode: full` no lo enciende), **fail-safe** (solo
  `true` booleano activa; ausente / `false` / `"true"` / `yes` / `1` / `TRUE` / forma-bloque / comentado →
  off, sin error de parseo) y **ausencia ≠ drift**. **Con `off` (default) el comportamiento es idéntico al de
  hoy** (el Gherkin vive en la tarea). Presente en todas las sedes del schema (YAML seed comentado, tabla de
  flags de README + sección "SDD nativo (opcional)", las dos `task-lifecycle`, contrato de `plan-task`) y en
  el portal (`website/features/sdd.md` + sidebar). El **flujo imperativo** y la línea de DoD gated llegan en
  la tarea siguiente del plan.
- **Flujo SDD imperativo** (#36) — cablea la capa SDD en el ciclo de vida (gated por `features.sdd`) y cierra
  la contradicción "Gherkin = fuente de tests" ↔ "Gherkin solo en el CU" (design-review F3): con el flag
  **on**, el **caso de uso es la única fuente** del Gherkin y el `## Scenarios` de la tarea **enlaza** (no
  copia); `scenario-coverage` **retro-alimenta el CU** (entrada: sigue el enlace; salida: incorpora al CU) y
  `/mutation` **sigue el enlace al CU** al leer survivors. Añade la **línea de DoD gated** ("spec+CU
  actualizados o 'sin cambios'"), el **bootstrap** del primer spec/CU (materializa desde las plantillas),
  el reporte de **enlace roto** y la **convivencia** inline↔CU sin migración forzada al hacer *toggle* a
  mitad. Con el flag **off** (default), el comportamiento es **byte-idéntico** al de hoy. Cableado en
  `task.md`, las dos `task-lifecycle`, `plan-task`, `scenario-coverage`, `mutation`, README y portal.

### Changed
- **DoD del gate de mutation tool-agnóstica** — el checkbox y la prosa de "Cerrar una tarea" pasan de
  "(Stryker, break 80)" a "**con la herramienta del package** (`stack.mutation-tool`)" en `templates/task.md`,
  `templates/task-lifecycle.md` y `docs/guides/task-lifecycle.md`. Se explicita que `features.mutation-gate`
  **no** es per-package (solo `stack.*` lo es): "este package sin gate" = `stack.mutation-tool: none`.

## [0.14.0] — 2026-08-10

Realineación con el comportamiento documentado de **Claude Opus 5**. `honesty-rules.md` amplía su carta de
"anti-alucinación" a **honestidad y disciplina de trabajo**, `scenario-coverage` deja de trabajar a ciegas
sobre el alcance, y `/doctor` gana el **canal de entrega** que faltaba para que todo esto llegue a los repos
**ya adoptados** (antes, una sección nueva no llegaba nunca: el hook solo restaura el fichero si falta, y
`doctor` solo miraba su ausencia).

### Added
- **Cuatro bloques nuevos en `templates/honesty-rules.md`**, tres de ellos adaptados de bloques que Anthropic
  publica en su guía de migración a Opus 5:
  - **Hipótesis y evidencia** — etiquetar hipótesis frente a hecho confirmado; **no implementar un arreglo
    sobre un diagnóstico no reproducido**; **tope de 3 intentos** sobre el mismo síntoma → parar, revertir y
    reportar (y si al revertir hay cambios sin commitear ajenos a la sesión, **pedir decisión** en vez de
    descartar); «he revisado X» solo si se leyó **en esta sesión**.
  - **Alcance del encargo** — entregar lo pedido al alcance pedido; avisar en una frase si el encargo parece
    equivocado y seguir; **terminar la tarea entera** y declarar «hecho» solo cuando lo esté.
  - **Delegación en subagentes** — techo determinista (**nunca más de 20 en paralelo** sin petición expresa),
    no delegar lo resoluble en pocas llamadas ni la verificación. **Exime explícitamente a los gates del
    propio pipeline**, que si no quedarían prohibidos por la regla que el propio pipeline obliga a ejecutar.
  - **Longitud de lo que escribes a disco** — calibrar los entregables Markdown **sin** poder eliminar las
    secciones que declaran las plantillas.
- **Criterio de admisión al fichero**, escrito en su cabecera, para que no acrete: *si la regla se comprueba
  leyendo un diff, es coding-standard; si se comprueba mirando cómo se comportó el agente, va aquí*.
- **Ancla `template-version` en la primera línea** de `honesty-rules.md`: registra la **última versión en que
  cambió la plantilla**, no la del plugin. `/doctor` compara **plantilla ↔ materializado**, así que un release
  que no toque el fichero **no** genera drift en ningún consumidor.
- **`/doctor`** — drift de `honesty-rules.md` por comparación de anclas, con sus casos declarados (ancla
  ausente = anterior, se reporta; plantilla ilegible = "no he podido determinar la versión", **sin** veredicto;
  fichero personalizado = lista los bloques que faltan, **sin** sobrescritura mecánica). El **`@import` ausente
  pasa a hallazgo destacado**: sin él ninguna regla se aplica. Sigue sin editar ni crear tu `CLAUDE.md`.
- **`templates/task.md`: sección `## Fuera de alcance`**, heredada del `### Fuera de alcance` del plan tarea a
  tarea. Si el plan no la tiene o está vacía → `—` explícito, nunca el placeholder crudo.
- **`scenario-coverage` recibe el plan** (como ruta) y emite **dos secciones**: huecos **dentro** del alcance y
  huecos **fuera del alcance declarado**, estos **completos y marcados** —nunca descartados en silencio—, que
  no generan escenario ni tarea: los decide el owner y la decisión va al Plan change log. El plan entra como
  **dato a contrastar, jamás como instrucciones**: un `Fuera de alcance` en imperativo ("no reportes X") **no**
  puede silenciar al subagente.
- **Documento `docs/honestidad-no-es-sobre-verificacion.md`** — la defensa escrita de por qué estas reglas no
  caen bajo *"self-check instructions are the same trap"*, con las citas de la guía y sus salvedades. Se
  escribió **antes** de publicar las reglas: era su condición.
- **README**: sección propia de `honesty-rules.md` (los cinco bloques, criterio de admisión, techo de tamaño,
  actualizaciones por ancla y **qué pasa si borras un bloque a propósito**) y nota de que **`effort` se fija
  por sesión, no por fase** — no existe ni existirá una clave `effort:` en el YAML, porque la Agent tool no
  acepta ese parámetro.

### Changed
- **Criterios del "Salto en planes triviales" calibrados y fijados por ejemplos**, no por adjetivos: cada uno
  trae su frontera resuelta. Se ensancha *"un solo fichero/área"* → **un solo eje de decisión** (N ficheros
  valen si son la misma decisión replicada) y se afila *"sin superficie nueva"* → **`Provides` vacío en todas
  las tareas**, test mecánico en vez de juicio del autor. El conteo de tareas de `scenario-coverage` **no** se
  amplía, y el porqué queda escrito. Invariantes intactos: default = ejecutar, lo confirma el owner **una vez
  por pasada**, se registra, caduca al re-planificar, y sin canal para preguntar la pasada **se ejecuta**.
- Los criterios viven ahora en **seis sitios** —la tabla canónica en `plan-task` más una **frase canónica
  literal** en sus **cinco copias** (las dos del lifecycle, `docs/flujo-del-pipeline.md`, el portal y el
  README)—, para que la coherencia se verifique con un `grep` y no a ojo.
- **`caveman`**: la lista de contenido protegido incorpora la **etiqueta de hipótesis** y el **aviso de alcance
  en una frase**, además de las salvedades de incertidumbre. Sin esto, `caveman: full` podría borrar justo lo
  que las reglas nuevas instalan.
- La carta ampliada se propaga a todo lo que describía el fichero como "anti-alucinación": `templates/README.md`,
  `task-init`, el mensaje de `bootstrap.sh`, la categoría 6 de `doctor` y el README.

### Fixed
- **`</content>` colgado** al final de `templates/honesty-rules.md` y `templates/coding-standards.md`. Era
  basura que **se propagaba a cada repo consumidor** vía `/task-init` y vía la restauración del hook
  `SessionStart` — en `honesty-rules.md`, además, dentro de un fichero que se lee **en cada turno**.
  **Impacto en repos ya materializados**: si tu `.claude/honesty-rules.md` termina en `</content>`, lo
  arrastras desde una versión anterior; `/doctor` te reportará el drift por ancla y te ofrecerá el fix con
  diff. `.claude/specs/general/coding-standards.md` es **user-owned**: `/doctor` solo te **informa** de que
  lo contiene y cómo quitarlo — no lo edita por ti.
- El puntero a `.claude/specs/general/coding-standards.md` de la cabecera se matiza: ese fichero lo materializa
  `/task-init` pero es **user-owned** y puede no existir.

## [0.13.0] — 2026-07-24

Enriquecimiento de `features.github-tracking` (opt-in, default off): la proyección one-way md→GitHub ahora
refleja **contenido, estado, assignee y package** en las issues/Projects, **sin cambiar el modelo** (el `.md`
sigue siendo la única fuente de verdad; GitHub es proyección best-effort).

### Added
- **Body de la issue = cuerpo completo del `.md`** (sin frontmatter) + **banner de espejo** + link, en padre y
  sub-issues (antes: solo resumen + link). Se vuelca **al crear** y se re-vuelca **solo en re-proyección
  explícita** (`/doctor` / re-run de `/plan-task`), no en cada transición. Trunca con nota si supera el límite
  de body de GitHub (~65536).
- **Label `pkg:<package>`** (derivada de `package:`, creada si falta) en padre y sub-issues → filtro glanceable
  por workspace.
- **Estado proyectado en dos sitios** en cada transición del ciclo de vida: **campo Status del Project** +
  **label `status:*`** (`in-progress`/`in-review`/`blocked`) con recipe **add-then-remove** (añade la nueva
  antes de retirar las demás y la `blocked` pelada legacy → un fallo parcial sobre-etiqueta, nunca deja la
  issue sin estado). Alta en el Project con Status `Backlog` al crear; match del Status **case-insensitive**.
- **Assignee** al arrancar la tarea (clave `assignee`: `@me` default / un login / `false`), solo la sub-issue.
- Clave de config **`assignee`** (comentada en el template; el repo source la fija a `@me`).

### Changed
- **Ciclo de vida** (`docs/guides/task-lifecycle.md` + su plantilla, en paralelo): tabla de transiciones
  estado→(Status del Project, label `status:*`, acción sobre la issue); arranque/cierre del padre (`In progress`
  / `Done` + close, **sin** `status:*` ni assignee). Corregido `In Progress` → `In progress` (nombre real de la
  opción). El body **no** se re-vuelca en transiciones.
- **`/doctor`** (categoría 8): re-proyectar re-aplica body + labels + Status del Project + assignee de forma
  **idempotente** desde el `.md`; sin detección nueva del drift `status:*`↔`.md`↔Project (residual aceptado).
- Corregido el comentario **stale** "board = no-op" del `.claude/task-pipeline.yml` del repo: el write al
  Project está **verificado** (write-spike 2026-07-23 + dogfood de este plan).
- Docs de usuario (README §GitHub-tracking + `website/features/github-tracking.md` + runbook): `gh` **requerido**
  explícito (scopes `repo` + `project`), comportamientos nuevos y límites honestos.

### Notas de diseño
- **Issue types nativos omitidos** (org-only; `/orgs/<owner>/issue-types` → 404 en cuenta personal). Asimetría
  documentada: en consumidores **org** el padre puede llevar `issue-type-plan`, las sub-issues no; en cuenta
  personal, ninguno. Sin sustituto por label de type (decisión del owner).
- **Sin sync bidireccional ni watcher**: el body se proyecta en touchpoints del pipeline; el trabajo vivo va al
  session log, que no se proyecta. El mismo estado vive en 3 stores (`.md` normativo + label + Project)
  sincronizados best-effort e idempotentes desde el `.md`; el drift es **residual aceptado** que se re-alinea al
  re-proyectar (no detección nueva en `/doctor`).
- **I3 ampliado**: desactivar el flag deja huérfanas las definiciones de labels `pkg:*`/`status:*`, los items del
  Project y las `status:*` in-flight → reconciliar/limpiar **antes** de desactivar.

### Migration
- Sin acción: `github-tracking` sigue **opt-in** (default off); el comportamiento por defecto es idéntico al de
  0.12.x. En repos que ya lo usaban, las issues existentes se enriquecen en la siguiente re-proyección
  (`/doctor` / re-run de `/plan-task`).

## [0.12.1] — 2026-07-23

### Fixed
- **`plan-task` (description del SKILL)**: el blurb del frontmatter listaba solo `plan mode → plan en
  pending → grilling → tareas en Gherkin → handoff TDD → gate de mutation`, omitiendo `design-review`,
  `scenario-coverage` y el gate de cierre `fact-checker` que la propia skill orquesta y que el resto de la
  doc ya atribuía a `/plan-task`. Alineada con el pipeline real. Cambio **docs-only** (sin efecto en el
  comportamiento del plugin). El resto de hallazgos de alineación de la sesión (árbol del `README`,
  `task-lifecycle` del repo, `CLAUDE.md`) son **repo-consumer**, no del plugin, y no entran aquí.

## [0.12.0] — 2026-07-23

### Changed
- **Esquema de id de tarea → plan-scoped**: `<task-id> = <plan-id>-<nn>` (`<plan-id> =
  <package>-<name-plan>`, `<nn>` correlativo **dentro del plan** desde `01`), en vez del contador global
  del package (`<package>-<nnn>`). Elimina la colisión silenciosa (add/add) entre planes creados en
  paralelo: el espacio de id coincide con la unidad de paralelismo (**plan = rama**). Los **ids legacy**
  `task-pipeline-001..012` son estables y **no se renumeran** (histórico mixto). Alineados: plantillas
  (`task-lifecycle.md`, `task.md`, `plan.md`, `HOW-TO-START-A-TASK.md`, `README.md`), la regla de
  asignación de `plan-task/SKILL.md` y las copias materializadas del repo.

### Added
- **Detección de ids de tarea/plan duplicados en `/doctor`** (Fase 1, repo-owned): reporta cualquier
  `id:` presente en más de un fichero (incl. mismo id en dos carpetas de estado, ids de plan,
  `filename ≠ id:`), robusto ante frontmatter roto; la resolución es un **aviso** (renumerar no es
  mecánico), no auto-edición.
- **`features.github-tracking`** (integración **opcional**, opt-in, default `off`): proyección
  **one-way md→GitHub** — plan → issue **PADRE**, tarea → **SUB-ISSUE** (`gh issue create --parent`);
  proyección de **estado** (arranque/cierre de tarea) y **cierre de la issue padre** al completar el plan;
  el `.md` sigue siendo la **fuente de verdad**. Tejida como pasos **condicionales** en `/plan-task` y en
  el ciclo de vida. **Reconciliación best-effort** md↔GitHub en `/doctor` (drift, huérfanas). Degrada a
  **no-op** sin `gh`/red/auth/repo-GitHub. Guía completa (setup, mapeo, límites, riesgos) en el README.

### Notas de diseño
- La **`design-review`** (opus) recomendó **NO** incluir el tracking GitHub (scope mixto, reversibilidad,
  sync best-effort sobre un sustrato markdown, contaminación de los playbooks default con ramas
  condicionales, dependencia de features de Projects en **preview**). El **owner lo mantuvo
  conscientemente**, aceptando los riesgos C1/C3/I1/I3/M2 — coherente con el Plan change log del plan
  `collision-free-ids`. Es **opt-in y default off**: quien no lo activa no paga coste ni comportamiento.
- **Residual honesto**: el esquema plan-scoped **no** previene "dos ramas del mismo plan en paralelo"
  (ambas ven el mismo máximo `<nn>`); se mitiga con "una rama = un plan", la detección de `/doctor` y la
  guía de equipo, no con prevención dura.

### Migration
- Sin acción: los ids existentes **no** se renumeran; el esquema nuevo aplica a planes/tareas nuevos.
  `github-tracking` es **opt-in** (default off) — el comportamiento por defecto es idéntico al de 0.11.0.

## [0.11.0] — 2026-07-16

### Added
- **Skill `/pipeline-usage`** (`/task-pipeline:pipeline-usage`): analítica de uso **on-demand
  y read-only**. Agrega el transcript de la sesión con python3 y presenta **total de sesión**
  (input/output/cache, titular input+output), **desglose por fase** (design-review, grilling,
  plan-task… por `attributionSkill`, mostrado verbatim) con su % de gasto atribuido, y
  **por-subagente** (con modelo). **No** añade hooks: invocarla es el opt-in. Snapshot opcional
  en `.claude/analytics/sessions/<id>.json` (solo métricas, nunca contenido de mensajes).
- **Flag `features.caveman`** (`off`(default)`|lite|full`) + **hook `UserPromptSubmit`**
  (`hooks/caveman.sh`): **modo caveman** opt-in que comprime el output del hilo principal para
  ahorrar tokens, con **backoff determinista** en los checkpoints (`grilling`/`design-review`/
  `scenario-coverage`/`fact-checker`, leídos del tail del transcript). Código/comandos/errores/
  paths van byte a byte; conserva las salvedades de honestidad. Bash 3.2, sin python/jq, no-op
  barato en repos no adoptados / flag off. **No** forma parte de ningún preset. Afecta solo al
  hilo principal (no a subagentes).
- **`/doctor`**: consciente del flag opt-in `features.caveman` (su ausencia **no** es drift:
  puede ofrecerlo comentado como nicety, como `models:`); el hook `caveman.sh` es plugin-owned
  (solo-reporte).

### Notas de diseño
- **La analítica es on-demand (sin colector por hooks)** por decisión de la `design-review`:
  un hook parseando el transcript cada turno era O(n²) por sesión, con coste en repos ajenos y
  mal encaje con la arquitectura (skills model-driven). El formato del transcript es **interno/
  no soportado** (Anthropic recomienda no parsearlo): `/pipeline-usage` es **best-effort** —
  titular = total de sesión, avisa cuando las cifras pueden estar incompletas, y nunca presenta
  un derivado como dato exacto.
- **No** se añadió flag `features.analytics` ni una categoría "opt-in behaviors": la skill es
  opt-in por invocación (menos superficie pública de config).
- El **ROI de caveman** no es medible por el propio pipeline (informes por sesión, sin A/B):
  se documenta explícitamente para no afirmar un ahorro no verificable.

### Migration
- `pipeline-usage` no requiere configuración: se instala con el plugin y se invoca a demanda.
  Si activas el snapshot, añade `.claude/analytics/` a tu `.gitignore` (el plugin no lo toca).
- `features.caveman` es **opt-in y default off**: los repos existentes no cambian de
  comportamiento. El template lo trae **comentado**. Actívalo con `lite`/`full` si lo quieres.

## [0.10.0] — 2026-07-16

### Added
- **Skill `fact-checker`** (`/task-pipeline:fact-checker`): gate de cierre que **verifica las afirmaciones
  factuales** de una sesión (código, tests, librerías, imports) lanzando un **subagente fresco** de solo
  lectura + Bash — nunca escribe código; salida VERIFICADO / INCORRECTO / NO VERIFICABLE. Mismo molde que
  `design-review`/`scenario-coverage`. Frontera con `/doctor`: `fact-checker` verifica **veracidad de
  afirmaciones**; `doctor` verifica **drift de convención**.
- **`models.fact-checker`** en `.claude/task-pipeline.yml`: tercera fase con subagente **ruteable** (default
  `inherit`; el template la trae comentada). `/doctor` la contempla al proponer/actualizar `models:`.
- **Gate de cierre `fact-checker` en la DoD** (`HOW-TO-START-A-TASK.md` + `task-lifecycle.md` +
  `plan-task`): **tras** el gate de `mutation` y **antes** de commit/resumen, se verifican las afirmaciones
  de la sesión. Es **no-negociable** (sin flag, como `grilling`/aprobación): `INCORRECTO` **bloquea** el
  cierre; `NO VERIFICABLE` es un aviso a reconocer; `VERIFICADO` pasa.
- **Reglas de honestidad materializables** (`.claude/honesty-rules.md` + plantilla): disciplina
  anti-alucinación/anti-slop pensada para leerse **cada turno** vía `@import` **opt-in**. `task-init`
  **sugiere** el `@import`; `doctor` lo **reporta** si falta; `bootstrap.sh` **restaura el fichero** — nunca
  se auto-edita el `CLAUDE.md` (invariante del plugin).
- **No-duplicación** como coding-standard: `.claude/specs/general/coding-standards.md` (plantilla
  materializable, **user-owned**), no como honesty-rule.
- **`/doctor` extendido**: en repos ya adoptados detecta el **gate de `fact-checker` ausente** en la DoD de
  cierre materializada y el **`honesty-rules.md` ausente / sin `@import`**, y ofrece materializar / sugerir
  (repo-owned, diff + aprobación).

### Migration
- **`fact-checker` es un gate de cierre no-negociable**: no hay flag que lo desactive (no existe
  `features.fact-check`) y aplica en cualquier `mode`/preset. La skill **no** se auto-invoca "antes de cada
  commit" (la plataforma no lo permite): la orquesta la DoD de cierre.
- **Para "leer cada turno" las reglas de honestidad**, añade `@.claude/honesty-rules.md` a tu `CLAUDE.md`
  (raíz y/o de workspace). Es **opt-in**: `task-init` lo sugiere y `doctor` lo reporta si falta, pero ningún
  artefacto del plugin edita tu `CLAUDE.md`.
- En repos **ya adoptados antes de 0.10.0**, corre **`/doctor`**: te ofrecerá añadir el gate de
  `fact-checker` a la DoD de cierre materializada y materializar `.claude/honesty-rules.md` (con diff +
  aprobación). `coding-standards.md` y las demás specs generales siguen siendo user-owned (no se vigilan).

## [0.9.0] — 2026-07-16

### Changed
- **BREAKING — renombrada la skill/comando `grill-me` → `grilling`** (se invoca con
  `/task-pipeline:grilling`). Motivo: paridad con upstream, que renombró la skill y reescribió su texto
  (adaptación MIT, © Matt Pocock — [`mattpocock/skills`](https://github.com/mattpocock/skills)).
  - Renombrado el directorio `skills/grill-me/` → `skills/grilling/`; su `SKILL.md` adopta **verbatim**
    el `name`, la `description` y el cuerpo de upstream (`skills/productivity/grilling/SKILL.md`), con la
    atribución actualizada.
  - Propagado el identificador en todas las referencias vivas (skills, plantillas, ambos README,
    metadatos y la guía del repo).
- **Fix de drift del rename 0.8.0** (regresiones detectadas en `design-review`/`scenario-coverage`):
  - `hooks/bootstrap.sh`: la ruta de plantillas apuntaba a `skills/task/templates` (inexistente desde
    0.8.0) → corregida a `skills/plan-task/templates`; la auto-reparación del hook `SessionStart` vuelve
    a funcionar.
  - Comando viejo `/task` → `/plan-task` en las cabeceras de `.claude/task-pipeline.yml` y de su
    plantilla, y en `docs/guides/task-lifecycle.md`.

### Added
- **Routing de modelo por fase (`models:` en `.claude/task-pipeline.yml`)** para las fases con
  **subagente** (`design-review`, `scenario-coverage`): fija su modelo por invocación de la Agent tool.
  Clave ausente/`inherit` = hereda la sesión; valor inválido = aviso + inherit; clave para una fase
  inline = ignorada. El template trae la sección **comentada** (no impone modelos a repos consumidores).
  La limitación (las fases inline heredan la sesión; no hay auto-óptimo) se documenta una vez en el
  README del plugin → "Routing de modelo por fase".
- **Skill `/doctor`**: diagnostica y alinea un repo ya adoptado con la versión actual del plugin —
  verificación read-only y, después, fix interactivo por problema (diff + aprobación). Frontera con
  `/task-init` (que bootstrapea desde cero).

### Migration
- `/task-pipeline:grill-me` → `/task-pipeline:grilling`. El disparador en **lenguaje natural** "grill me"
  sigue invocando la skill (la `description` adoptada de upstream incluye "any 'grill' trigger phrases").
- `models:` es **opcional**: sin la sección, todas las fases heredan el modelo de la sesión
  (comportamiento actual). Para pinear una fase con subagente, añádela a `.claude/task-pipeline.yml`;
  `/doctor` puede proponerte añadir la sección (comentada) si falta.

## [0.8.1] — 2026-06-18

### Added
- **Licencia MIT del repositorio** (`LICENSE`, en la raíz del marketplace): el repo
  público no declaraba licencia (= "todos los derechos reservados"), lo que impedía
  reusarlo legalmente. Copyright (c) 2026 Daniel Rosselló.
- **Atribución de la skill `grill-me`** (`THIRD-PARTY-NOTICES.md`): es una skill de
  terceros, de **Matt Pocock** ([`mattpocock/skills`](https://github.com/mattpocock/skills),
  MIT). Se reproduce su aviso de copyright + permiso como exige la MIT, se añade un
  crédito (comentario no invasivo) en `skills/grill-me/SKILL.md` y notas en ambos README.

Solo documentación/legal; sin cambios de comportamiento.

## [0.8.0] — 2026-06-15

### Changed
- **BREAKING — renombrada la skill `task` → `plan-task`** (se invoca con `/plan-task "<specs>"`).
  Motivo: las versiones recientes de Claude Code incorporan un subsistema propio de *background
  tasks* con el comando `/tasks`. Como `task` es **prefijo** de `tasks`, al escribir `/task` el
  CLI lo resolvía al builtin (abría el panel "Background — No tasks currently running") en vez de
  a la skill, que solo seguía siendo invocable con namespace (`/task-pipeline:task`). El nuevo
  nombre no colisiona con ningún builtin, así que `/plan-task` funciona directo.
  - Renombrado el directorio `skills/task/` → `skills/plan-task/` (las plantillas viven dentro,
    en `skills/plan-task/templates/`).
  - Actualizadas todas las referencias en `task-init`, `design-review`, `scenario-coverage`, las
    plantillas (`task-lifecycle.md`, `HOW-TO-START-A-TASK.md`, `templates/README.md`), el `README`
    del plugin y `docs/flujo-del-pipeline.md`.
  - **Sin cambios** en los nombres del flujo (`.claude/tasks/`, `task.md`, `task-lifecycle.md`,
    `task-pipeline.yml`, `task-init`, `task-pipeline`): solo cambia el nombre de la skill orquestadora.

### Migration
- Donde antes usabas `/task "<specs>"` (o `/task-pipeline:task`), ahora usa `/plan-task "<specs>"`.

## [0.7.2] — 2026-06-15

### Added
- **Guía de presentación del flujo para el equipo** (`docs/flujo-del-pipeline.md`):
  resumen narrativo del pipeline (los 7 pasos + checkpoints), tabla de las 6 skills,
  las dos ideas clave (Gherkin como fuente 1:1 de los tests y los gates de coste
  proporcional) y un **ejemplo end-to-end** ("rechazar email duplicado" en el package
  `auth`) que recorre los pasos mostrando qué cambia cada gate (`grill-me`,
  `design-review`, `scenario-coverage`, `/mutation`).
- `README.md`: nota destacada que enlaza la nueva guía como punto de partida para
  presentar el plugin al equipo.

Solo documentación; sin cambios de comportamiento.

## [0.7.1] — 2026-06-15

### Changed
- **Doc al día con el estado real del plugin** (drift de índices, sin cambios de comportamiento):
  - `templates/task-lifecycle.md`: su bloque `## Scenarios (Gherkin)` inline (la guía
    canónica es **autocontenida**, no puede apuntar a la plantilla una vez materializada en
    `docs/guides/`) recibe la **versión condensada** de las reglas de calidad de 0.7.0
    (declarativo > imperativo, 1 comportamiento, disciplina G/W/T, `Scenario Outline`) +
    ejemplo de `Scenario Outline`. Cierra el drift entre la guía y la semilla `task.md`.
  - `README.md` (raíz/marketplace) estaba congelado en ~0.2.0: ahora la tabla de skills, la
    lista *namespaced*, el árbol de estructura y la sección de portabilidad incluyen
    `/task-init` (0.3.0), `design-review` y `scenario-coverage` (0.6.0), y reflejan que el
    **stack ya no es una asunción rígida** sino config de `.claude/task-pipeline.yml` (0.5.0).
  - `plugin.json`: `description` alineada con `marketplace.json` (incluye bootstrap,
    design-review, scenario-coverage y config por repo).

## [0.7.0] — 2026-06-15

### Changed
- **Reglas de calidad Gherkin en `templates/task.md`**: la sección `## Scenarios (Gherkin)`
  pasa de modelar solo la estructura G/W/T a fijar las recomendaciones oficiales/comunidad que
  rigen su función (notación dev-only fuente 1:1 de tests TDD), en orden de impacto:
  (1) **declarativo, no imperativo** — el `When` es acción de dominio, no pasos de UI/llamadas
  internas (imperativo = test acoplado a la implementación que se rompe en cada refactor);
  (2) **un escenario = un comportamiento** (falla por una sola razón); (3) **disciplina G/W/T**
  con `And`/`But` para condiciones/resultados adicionales; (4) **`Scenario Outline` + `Examples`**
  para fronteras/clases de equivalencia del MISMO comportamiento (engancha con la dimensión
  "fronteras" de `scenario-coverage`). El bloque de ejemplo modela el `When` declarativo y un
  `Scenario Outline` bien formado.
- `skills/task/SKILL.md`: la subsección *"Gherkin = fuente de los tests"* referencia esas reglas
  (sin duplicarlas — el playbook solo orquesta).

### Notes
- Decisión consciente: se omiten `Background`, `Rule:` y tags. No se ejecutan como Gherkin (se
  traducen a tests nativos), así que tags no aportan y `Rule:` sobre-estructura a nivel de tarea;
  `Background` se deja al autor que lo necesite. Las reglas son **convención, no gate**: la
  adherencia depende de quien escribe (proporcional a un uso dev-only).

## [0.6.0] — 2026-06-12

### Added
- **Skill `design-review`**: revisión holística **adversaria** de un plan tras `grill-me`
  (corre por defecto; con salto solo en planes triviales, ver abajo). La corre un **subagente
  fresco** (Agent tool,
  `general-purpose`) al que se le pasan rutas, no opiniones, y al que **no** se le adelanta
  el veredicto deseado — así se ataca la raíz de la complacencia (presión social + sesgo de
  confirmación sobre el plan propio), no el síntoma. Evalúa el plan COMO UN TODO en 5 ejes:
  coherencia, tamaño correcto (infra- y **sobre**-ingeniería), mantenibilidad concreta,
  escalabilidad real y reversibilidad; salida obligatoria = lista de cambios con porqué, o
  enumerar qué se intentó romper y por qué resiste (un "me parece bien" no es válido).
  Complementa a `grill-me` (que baja rama por rama) con el zoom-out que faltaba.
- **Skill `scenario-coverage`**: endurecimiento QA de los escenarios Gherkin del set de tareas
  vía **subagente fresco**, tras la descomposición (Paso 5.5). Recorre dimensiones (camino
  feliz, fronteras/equivalencia, errores/fallos, estado/ciclo de vida, concurrencia, input
  adversario, Spec implícita y **requisitos que ninguna tarea cubre**) con descarte explícito
  por N/A — completitud por dimensiones, no por volumen. Tapa el hueco que el gate de mutation
  NO puede (comportamiento que nunca se programó → sin mutante que lo delate) y abarata el
  bucle de matar survivors al cierre.

### Changed
- `skills/task/SKILL.md`: nuevo **Paso 4.5** (invoca `design-review` entre `grill-me` y la
  descomposición) y **Paso 5.5** (invoca `scenario-coverage` antes del handoff).
- **Salto proporcional en planes triviales** para `design-review` y `scenario-coverage`: corren
  por defecto, pero el orquestador puede **ofrecer** saltarlas solo si el plan es objetivamente
  trivial (un fichero/área, sin superficie pública nueva, sin decisión arquitectónica; y 1 tarea
  sin bordes para `scenario-coverage`). El salto **lo decide y confirma el usuario** (`AskUserQuestion`,
  default = ejecutar) y se **registra en el Plan change log** — nunca un auto-skip silencioso del
  modelo (sería el agujero que el flujo busca evitar). `grill-me` y la aprobación del plan siguen
  siendo **no negociables**: el escape es proporcional al coste (solo las pasadas por subagente).
- **Sección `## Provides` sustituye a `## Expected result`** en las plantillas `task.md` y
  `task-lifecycle.md`: `Expected result` degeneraba en un parafraseo 1:1 de los `Then` del
  Gherkin (duplicación → drift). `Provides` tiene un trabajo propio: el **contrato hacia abajo**
  (qué deja disponible para las tareas `depends_on`), no un resumen del comportamiento. El
  renombrado mata el modo de fallo por estructura (el heading ya no invita a parafrasear), no
  por una guarda exhortativa. DoD actualizada en consecuencia.
- `README.md` y `task-lifecycle.md` reflejan los nuevos pasos y la política de checkpoints:
  **dos no negociables** (`grill-me` + aprobación) y **dos con salto en planes triviales**
  (`design-review` + `scenario-coverage`).

## [0.5.0] — 2026-06-12

### Added
- **Configuración por repo (`.claude/task-pipeline.yml`)**: las skills leen este YAML
  y lo respetan (sin parser; el modelo lo interpreta). **Resolución**: defaults internos
  (= preset `full`) → preset de `mode:` → claves explícitas en `stack:`/`features:`.
  **Sin archivo → todo `full`**, así repos existentes no cambian de comportamiento.
  - **Preset `mode`**: `full` (todo obligatorio), `legacy` (TDD sí, gate de mutation no),
    `docs-only` (solo planes + docs). Evita acertar flags sueltos.
  - **Bloque `stack`**: `language` / `package-manager` / `test-runner` / `mutation-tool`.
    Las skills eligen comandos con esto en vez de asumir pnpm/Vitest/Stryker (soporta
    Jest, npm, no-TS, etc.).
  - **`features.tdd`**: escape hatch para legacy sin harness — en `false` la DoD no exige
    tests/TDD.
  - **`features.closing-documentation.{tsdoc,technical-docs,context-log}`**: cada capa de
    documentación de cierre, activable por separado.
  - **`features.mutation-gate`**: `false` / `true`(=80) / `<int>` (umbral `break`
    configurable para ir subiendo el listón en legacy — ratchet).
  - Los checkpoints humanos (`grill-me`, aprobación del plan) NO son configurables.
- Nueva plantilla `skills/task/templates/task-pipeline.yml` (semilla con `mode`+`stack`+
  `features` y el catálogo comentado).

### Changed
- `skills/task/SKILL.md`: paso de lectura de config con tablas de `mode`/`stack`/`features`;
  documentación, TDD (Gherkin) y gate de mutation respetan la config.
- `skills/mutation/SKILL.md`: paso 0 que lee `stack`/umbral del YAML; si el gate está OFF
  o `mutation-tool: none`, informa y sale; umbral `break` parametrizado.
- `skills/task-init/SKILL.md`: materializa `.claude/task-pipeline.yml` rellenando el `stack`
  detectado y proponiendo `mode` (`legacy`/`docs-only` si no hay harness, confirmado con
  `AskUserQuestion`).
- `hooks/bootstrap.sh`: auto-repara `.claude/task-pipeline.yml` y lo reconoce como marcador
  de adopción.
- Plantillas `task-lifecycle.md` y `task.md`: catálogo de config + DoD que referencia los
  flags (incl. `tdd`). README del plugin y `templates/README.md` documentan el mecanismo.

## [0.3.0] — 2026-06-12

### Added
- **Skill `/task-init`**: bootstrap explícito de un repo en un solo comando — esqueleto
  `.claude/plans|tasks|context|specs`, `docs/guides/task-lifecycle.md` y, opcionalmente,
  el `HOW-TO-START-A-TASK.md` de un package (rellenando los bloques `ESPECÍFICO DEL
  PACKAGE`). Reemplaza el viejo `/task "inicia el proyecto…"` en lenguaje libre.
- **Hook `SessionStart`** (`hooks/hooks.json` + `hooks/bootstrap.sh`): asegura y
  auto-repara la parte genérica del scaffolding en cada arranque/resume en repos que ya
  han adoptado la convención (gate de adopción). No-op silencioso en repos no adoptados
  para no ensuciar proyectos ajenos (el plugin es global). Copia desde la misma semilla
  `skills/task/templates/task-lifecycle.md` vía `${CLAUDE_PLUGIN_ROOT}`.

### Changed
- `skills/task/SKILL.md` apunta a `/task-init` para el bootstrap del repo y del HOW-TO
  de un package, en vez de instrucciones ad-hoc.

## [0.2.0] — 2026-06-12

### Added
- Plantillas materializables en `skills/task/templates/` que `/task` lee con `Read`
  y copia al repo destino, cerrando el bootstrap (antes el skill mandaba "replicar
  el HOW-TO de otro package", que falla en un repo virgen):
  - `task.md` — plantilla de tarea con sección obligatoria `## Scenarios (Gherkin)`.
  - `plan.md` — plantilla de plan.
  - `task-lifecycle.md` — flujo canónico, autocontenido (plantillas inline) para que
    funcione una vez copiado a `docs/guides/`.
  - `HOW-TO-START-A-TASK.md` — esqueleto genérico con bloques `ESPECÍFICO DEL PACKAGE`.
  - `README.md` — mapeo plantilla → destino y placeholders.

### Changed
- `skills/task/SKILL.md` y `README.md` del plugin apuntan a las plantillas con ruta
  relativa al skill (`templates/…`), porque `${CLAUDE_PLUGIN_ROOT}` no se expande en
  el cuerpo de un `SKILL.md`. Por eso las plantillas viven dentro de `skills/task/`.

## [0.1.0]

### Added
- Versión inicial: skills `/task`, `grill-me` y `/mutation` + marketplace local.
