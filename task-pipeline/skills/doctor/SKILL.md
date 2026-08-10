---
name: doctor
description: Diagnostica y alinea un repo que YA adoptó la convención task-pipeline contra lo que espera el plugin actual. Verifica primero (read-only) y luego, por cada problema, muestra el diff y aplica el fix SOLO tras tu aprobación. Úsalo cuando sospeches drift tras actualizar el plugin (identificadores viejos, secciones de config ausentes, rutas muertas, estructura incompleta). No inicializa repos: para eso está `/task-init`.
---

Alineas un repo **ya adoptado** con la versión actual del plugin. Frontera clara con `/task-init`:
`task-init` **bootstrapea desde cero** (materializa la convención la primera vez); `doctor` **revisa un
repo existente** y corrige el drift acumulado tras actualizar el plugin. `doctor` **no inicializa** nada
en un repo virgen.

> **Frontera con `fact-checker`**: `doctor` verifica el **drift de convención** de un repo adoptado
> (identificadores, estructura, secciones de config y de la DoD); `fact-checker` verifica la **veracidad
> de las afirmaciones** de una sesión. No se solapan, aunque ambas sean read-only.

El flujo tiene **dos fases** y una regla que no se rompe: **Fase 1 no edita nada; Fase 2 no edita nada
sin tu aprobación explícita, y siempre te enseña el diff ANTES de pedírtela.** Nada se auto-edita a ciegas.

> **Plantillas de referencia**: para comparar lo materializado en el repo contra lo que trae el plugin
> hoy, localiza las semillas por ruta relativa a ESTE skill: `../plan-task/templates/` (mismo patrón que
> `task-init`). `${CLAUDE_PLUGIN_ROOT}` no se expande en el cuerpo de un `SKILL.md`; usa la tool **Read**.

## Fase 0 — Gate de adopción (¿hay algo que revisar?)

Mira, en read-only, si el repo **ha adoptado** la convención. Marcadores (cualquiera basta):
`.claude/plans`, `.claude/tasks`, `.claude/specs`, `.claude/task-pipeline.yml`, `docs/guides/task-lifecycle.md`.

- **Ningún marcador** → el repo **no está inicializado**. No crees ni edites nada: informa y remite a
  **`/task-init`** (`/task-init` bootstrapea; `doctor` solo revisa lo ya adoptado). Fin.
- **Al menos un marcador** → el repo está adoptado (aunque sea parcialmente): sigue a la Fase 1.

## Fase 1 — Verificación (READ-ONLY, nunca edita)

Recorre estas categorías **sin tocar ningún fichero** y construye una **lista numerada de
problemas**. Para cada uno anota: qué es, dónde (fichero:línea), y quién lo posee (repo consumidor vs
artefacto del plugin — ver "Propiedad" abajo).

1. **Identificadores de skill desfasados** — restos del rename del plugin en los ficheros del repo:
   `grill-me` (skill vieja), `/task` como comando (hoy `/plan-task`), ruta `skills/task/` (hoy
   `skills/plan-task/`). Busca en los docs/config materializados del repo (p.ej.
   `docs/guides/task-lifecycle.md`, `.claude/task-pipeline.yml`, specs/HOW-TO).
2. **Secciones de config esperadas ausentes** — en `.claude/task-pipeline.yml`: p.ej. falta la sección
   `models:` (routing de modelo por fase, ver README del plugin → "Routing de modelo por fase"). Su
   ausencia no rompe nada (todo hereda la sesión), pero conviene ofrecer añadirla comentada. Al
   proponer/actualizar `models:`, contempla las **fases con subagente ruteables** (`design-review`,
   `scenario-coverage`, `fact-checker`) y su presencia en la cabecera de lectores. **Nota**: una clave de
   fase concreta ausente (p.ej. `models.fact-checker`) **no** es drift — el default es inherit.
   Igual con el flag opt-in **`features.caveman`** (`off`|`lite`|`full`, desde 0.11.0): su
   ausencia **no** es drift (default `off`, como cualquier comportamiento opt-in); doctor
   puede **ofrecer** añadirlo comentado como nicety, pero **nunca** lo reporta como problema
   bloqueante. El hook `caveman.sh` que lo consume es **plugin-owned** (solo-reporte).
   Lo mismo con **`features.github-tracking`** (bloque opt-in, default off — T-E): su **ausencia
   no es drift**; doctor puede ofrecerlo comentado como nicety, **nunca** reportarlo como problema.
   La lógica que lo consume (los pasos condicionales de `/plan-task` y del lifecycle) es
   **plugin-owned**; la **reconciliación** del drift md↔GitHub es una categoría aparte (ver abajo).
3. **Rutas muertas en hooks** — si un hook del plugin resuelve un directorio de plantillas que no existe
   (`test -d`), repórtalo. Los hooks son **del plugin** (ver Propiedad): solo-reporte.
4. **Estructura de convención incompleta** — falta alguna carpeta esperada:
   `.claude/plans/{pending,active,completed,cancelled}`, `.claude/tasks/{…}`, `.claude/context`,
   `.claude/specs`, `docs/guides`.
5. **Gate de cierre `fact-checker` ausente en la DoD materializada** (drift de plantilla) — desde
   **0.10.0** el cierre de tarea incluye el gate no-negociable de `fact-checker` (verificar las
   afirmaciones factuales de la sesión antes de commit/resumen). Si el repo materializó
   `docs/guides/task-lifecycle.md` (sección "Cerrar una tarea") o algún
   `.claude/specs/<package>/HOW-TO-START-A-TASK.md` (bloque de cierre) **antes** de 0.10.0 y **no
   mencionan** el gate, repórtalo (repo-owned): en Fase 2 ofrece añadir la línea / re-materializar la
   sección desde la plantilla actual (`../plan-task/templates/`), con diff + aprobación. Es un gate
   no-negociable: **no** busques ni propongas un flag para desactivarlo — no existe.
6. **Reglas de honestidad: ausencia, desactualización y `@import`** (repo-owned, opt-in) — **tres**
   comprobaciones independientes. Se hacen las tres; una no cancela a las otras.

   **6a. Fichero ausente.** Si `.claude/honesty-rules.md` **falta**, repórtalo y ofrece
   **materializarlo** desde la plantilla (`../plan-task/templates/honesty-rules.md`) en Fase 2
   (diff + aprobación).

   **6b. Fichero desactualizado — drift por ANCLA DE PLANTILLA.** El fichero materializado y la
   plantilla llevan, en su primera línea, un ancla con la **última versión en que cambió la plantilla**:

   ```
   <!-- task-pipeline template-version: 0.14.0 — … -->
   ```

   El check es **comparar las dos anclas**, no comparar prosa:

   - Lee el ancla de la **plantilla** (`../plan-task/templates/honesty-rules.md`) y la del **fichero
     materializado** (`.claude/honesty-rules.md`).
   - **Ancla del materializado < ancla de la plantilla** → **drift**: repórtalo **nombrando las dos
     versiones** ("tu fichero es de la 0.13.0; la plantilla actual es 0.14.0").
   - **Ancla ausente en el materializado** → se materializó **antes de que existiera el ancla**: cuenta
     como **anterior** y **se reporta**. No te lo saltes por no poder parsear una versión.
   - **Anclas iguales** → **no hay drift**, aunque la versión del plugin sea posterior. Por eso el ancla
     registra la versión de la **plantilla** y no la del plugin: un release que no toque este fichero
     **no** debe marcar a todos los consumidores.
   - **No puedes leer el ancla de la plantilla** (plantilla ilegible/ausente) → di *"no he podido
     determinar la versión de la plantilla"* y **no emitas veredicto de drift** para este fichero. Un
     veredicto sin referencia no es un veredicto.
   - **Nunca uses `plugin.json`** como referencia: no está al alcance de este skill (solo llegas a
     `../plan-task/templates/`) y la versión del plugin no es la de la plantilla.

   **Fichero personalizado + ancla vieja** (frecuente: el consumidor adaptó la prosa): **no** ofrezcas
   sobrescritura mecánica. Reporta **qué bloques de la plantilla actual no aparecen** en su fichero
   (compara por encabezado de sección) y deja la edición al owner — es la regla 4 de la Fase 2.

   **Alcance del drift-check: solo `honesty-rules.md`.** Las **tareas ya materializadas** (`.claude/tasks/**`)
   **no** se drift-checkean: son histórico, hay decenas de copias y reportar una por cada tarea vieja
   sería ruido, no diagnóstico. Las secciones nuevas de `templates/task.md` (p.ej. `## Fuera de alcance`)
   aplican a las tareas **nuevas**, vía plantilla.

   **6c. `@import` ausente — HALLAZGO DESTACADO.** Si el fichero existe pero ningún `CLAUDE.md` (raíz o de
   workspace) lo `@importa` (`@.claude/honesty-rules.md`), **destácalo por encima del resto de la lista**
   y explica el porqué con estas palabras: **sin ese `@import`, el fichero no se lee cada turno y
   NINGUNA regla de comportamiento del plugin se aplica** — las reglas están en disco pero muertas. No es
   un aviso menor: es el punto único de fallo de todo lo que materializa el plugin.
   - **SUGIERE** la línea a añadir; **nunca** edites el `CLAUDE.md` (invariante: no tocas su prosa ni su
     config; el `@import` es opt-in del usuario).
   - Si el repo **no tiene** `CLAUDE.md`, emite **el mismo hallazgo destacado** y **no lo crees**.

   **Specs generales user-owned.** **No** vigiles la *ausencia* de `.claude/specs/general/coding-standards.md`
   ni de las otras (`testing.md`/`error-handling.md`/`security.md`/`git-workflow.md`): son **user-owned** y
   su ausencia **no es drift**. Excepción de **solo-reporte**: si `coding-standards.md` **existe** y
   contiene la cadena `</content>` (basura que versiones antiguas de la plantilla propagaron),
   **infórmalo y di cómo quitarlo a mano** — **no lo auto-edites**, es del usuario.
7. **Ids de tarea/plan duplicados** (repo-owned) — red de seguridad del esquema de id plan-scoped
   (`<task-id> = <plan-id>-<nn>`; ver `docs/guides/task-lifecycle.md`). El id es único por diseño, pero el
   residual honesto (mismo `<name-plan>`, o dos ramas extendiendo el mismo plan) puede colar duplicados al
   mergear. Recorre `.claude/tasks/**` y `.claude/plans/**` y **reporta cualquier `id:` que aparezca en más
   de un fichero, nombrando a TODOS los implicados** (no solo dos). Cubre:
   - **Ids de tarea duplicados** (el caso `…-01.md` que dos ramas crean a la vez), **incluido** el mismo
     `id:` en **dos carpetas de estado distintas** (p.ej. `pending/` y `completed/` tras un merge).
   - **Ids de plan duplicados** (dos ficheros de plan con el mismo `id:`: mismo `<name-plan>`, dos ramas).
   - **`filename` ≠ `id:`** del propio fichero: rompe el invariante "filename = id"; repórtalo como aviso.
   - **Robustez de parseo**: un `.md` **sin `id:`** o con **frontmatter YAML roto** se reporta como **no
     parseable** (aviso) y el check **sigue** — no aborta ni inventa un duplicado (mismo criterio que
     "Config malformada" abajo). Los ids **legacy** únicos entre sí (`<package>-<nnn>`) **no** disparan nada.
8. **Reconciliación md↔GitHub** (repo-owned, **best-effort** — **solo si** `features.github-tracking.enabled`
   **y** `gh` disponible/autenticado). Detecta el drift entre los `.md` (fuente de verdad) y su proyección
   GitHub (la proyección la tejen `/plan-task` y el ciclo de vida del plan). Casos a reportar:
   - `.md` de tarea `done` (o `cancelled`) con su issue **open**.
   - `.md` de **plan** `completed` con su issue **PADRE open** (mirror del cierre del padre del lifecycle).
   - `.md` con `issue: <n>` cuyo número **no existe** (borrada) o resuelve a un **repo distinto** del `repo`
     de referencia (config `repo` o `gh repo view`) — "otro repo" solo es detectable con esa referencia.
   - `.md` de tarea **sin** `issue:` con el flag on (proyección **pendiente**).
   - **Huérfanas (I3)**: sub-issue bajo el padre del plan **sin** `.md` que la gobierne.
   - **Degradación (4 casos)**: flag off / sin red / repo no-GitHub / **flag on pero `gh` sin auth** → esta
     categoría **se salta con gracia** (aviso, no crash); doctor sigue con sus checks locales.
   - **Límite best-effort (C3)**: **no** garantiza consistencia — no maneja de forma fiable la paginación
     (tope **100 sub-issues/padre**), rate-limit ni auth caída; **ante duda, reporta** y deja la decisión al
     humano. No prometas sync fuerte.
   - **Desactivar el flag y huérfanas (I3, historia coherente con la guía de usuario)**: con el flag off
     esta categoría **no corre**, así que **no** detecta huérfanas. Por eso la regla es **reconciliar ANTES
     de desactivar** `github-tracking`; las huérfanas que queden tras apagarlo se resuelven a mano.
   - **Re-proyección idempotente (sin detección nueva)**: al reconciliar (Fase 2) se re-aplica **desde el
     `.md`** el **body**, las labels (`pkg:*`/`status:*`), el **Status del Project** y el **assignee** de
     forma **idempotente** (recipe add-then-remove del ciclo de vida); **no** hay detección nueva del drift
     `status:*`↔`.md`↔Project (es residual aceptado: se re-alinea al re-proyectar, no se diagnostica aparte).

**Allowlist — NO marcar nunca como drift** (son menciones históricas legítimas, no identificadores vivos):

- El **CHANGELOG** y cualquier entrada de versión histórica (p.ej. ≤ 0.8.1) que narra el rename.
- La **atribución** de skills de terceros (`THIRD-PARTY-NOTICES.md`, comentario de crédito en un `SKILL.md`),
  que cita el nombre anterior a propósito.

**Config malformada**: si `.claude/task-pipeline.yml` no es YAML válido, repórtalo como un problema
**legible** ("YAML inválido en la línea N: …") y sigue con el resto de categorías. **No** abortes con un
error crudo ni intentes parsearlo a la fuerza.

**Propiedad (repo vs plugin)** — determina si un problema es accionable aquí:

- **Del repo consumidor** (docs/config materializados, estructura de carpetas) → candidato a fix en Fase 2.
- **Del propio plugin** (un hook, un `SKILL.md`, una plantilla dentro del plugin instalado) → **solo-reporte**:
  no edites el plugin desde aquí; remite a **actualizar el plugin** (`/plugin marketplace update …`). El
  drift del plugin se arregla publicando una versión nueva, no parcheando la instalación local.

**Cierre de la Fase 1:**

- **Sin problemas** → informa que el repo está **sano y alineado** con la versión actual del plugin y **no
  propongas ningún cambio**. Fin.
- **Con problemas** → presenta la lista numerada (marcando cuáles son solo-reporte) y pasa a la Fase 2.

## Fase 2 — Fix interactivo, problema a problema (solo tras aprobación)

Recorre **todos** los problemas accionables, **uno por uno**, sin saltarte ninguno. Para cada uno:

1. **Preparar el fix** sin escribir aún:
   - Si el problema admite **una sola** forma razonable de arreglarlo → prepárala.
   - Si admite **varias** (p.ej. editar el identificador in-place *o* re-materializar el doc desde la
     plantilla actual; añadir `models:` comentada *o* con un valor) → **pregunta con `AskUserQuestion`**
     qué opción quiere el usuario **antes** de tocar nada.
2. **Mostrar el diff ANTES de pedir aprobación**: enseña el cambio propuesto (antes → después, o un diff
   unificado) para que el usuario decida con la información delante.
3. **Aplicar SOLO si aprueba**: si la respuesta es aprobar, escribe el fichero (Edit/Write). Si la
   respuesta es rechazar, **no escribas nada** y pasa al siguiente problema. Cada decisión es
   independiente: aprobar el #1, rechazar el #2 y aprobar el #3 deja aplicados **solo** el #1 y el #3, y
   los tres se han recorrido.
4. **Prosa customizada / ambigua**: si el drift está en un documento que el usuario claramente
   **personalizó** (no es la plantilla tal cual), o el arreglo no es mecánico ni evidente, **repórtalo
   como aviso** y **no lo auto-edites**: dile qué viste y déjale a él el cambio.
5. **Solo-reporte (plugin-owned)**: los problemas marcados como del plugin no se aplican aquí; reitéralos
   como aviso con la acción recomendada (actualizar el plugin).
6. **Fix que no se puede aplicar**: si al intentar escribir el fichero falla (read-only, o el fichero
   cambió desde que mostraste el diff), **informa del fallo, deja el fichero intacto y continúa** con el
   siguiente problema. No dejes el fichero a medias.

Fixes seguros típicos (repo-owned, mecánicos): actualizar un identificador desfasado al actual; añadir
una carpeta que falta del esqueleto; añadir la sección `models:` **comentada** a `.claude/task-pipeline.yml`;
añadir la línea del gate de `fact-checker` a la DoD de cierre materializada (o re-materializar la sección
desde la plantilla) **cuando el doc no esté personalizado** — si lo está, aplica la regla 4 (aviso, no
auto-edición); materializar `.claude/honesty-rules.md` ausente desde la plantilla (el `@import` al
`CLAUDE.md` **no** se aplica: solo se sugiere).

**Drift de `honesty-rules.md` por ancla (cat. 6b):** si el fichero **no** está personalizado, el fix
mecánico es **re-materializarlo desde la plantilla actual**, con diff + aprobación. El ancla viaja en la
copia, así que una **segunda pasada de `doctor` ya no reporta drift** de ese fichero. Si **sí** está
personalizado, aplica la regla 4: lista los bloques que faltan y **no sobrescribas**.

**Ids duplicados / `filename` ≠ `id:` (no mecánico → aviso, regla 4):** renumerar un id **no** es un fix
seguro — rompería los `depends_on` y los enlaces que apuntan a él, y hay que elegir cuál de los ficheros en
conflicto cambia. Trátalo como **aviso**: nombra los ficheros implicados y **sugiere** la resolución
(renumerar el `<nn>` más nuevo **o** renombrar el `<name-plan>`, actualizando `depends_on`/enlaces), **sin
auto-editar**. **Aviso extra (T-H)**: si alguna de las tareas en conflicto **ya tiene `issue:`** (proyectada
en GitHub por `features.github-tracking`), advierte que renumerar **desincroniza** el `.md` de su issue → hay
que re-proyectar / actualizar la issue (ver la reconciliación de `/doctor`).

**Reconciliación md↔GitHub (solo con el flag on):** re-proyecta **desde el `.md`** (la fuente de verdad):
crear la issue que falta, cerrar la que quedó `open`, con **diff + aprobación** problema a problema. Lo **no
mecánico** —**huérfana**, `repo` cambiado, número **inexistente**— es **aviso**, no auto-edición. Si `gh` no
está disponible/autenticado, **sáltala con gracia** (aviso) y sigue con los checks locales; es **best-effort**
(no promete consistencia — ver el límite C3 en Fase 1).

## Idempotencia

`doctor` diagnostica contra el **estado actual** del repo. Tras aplicar los fixes aprobados, una segunda
pasada vuelve a verificar desde cero: los problemas resueltos ya no aparecen, así que informa "sano" (los
rechazados y los solo-reporte seguirán listándose hasta que se resuelvan por su vía). No guardes estado
entre ejecuciones: la verdad es el repo.

## Qué NO hace este skill

- **No inicializa** un repo virgen (eso es `/task-init`).
- **No edita** en la Fase 1, ni edita nada en la Fase 2 sin diff + aprobación.
- **No edita el plugin** (hooks, SKILLs, plantillas del plugin): eso es solo-reporte + actualizar el plugin.
- **No toca** el CHANGELOG ni la atribución (menciones históricas legítimas).
- **No sobrescribe** prosa que el usuario personalizó: la reporta como aviso.
- **No edita el `CLAUDE.md`** del usuario: sugiere el `@import` de `honesty-rules.md` (como **hallazgo
  destacado** si falta), nunca lo añade — ni lo crea si no existe.
- **No vigila** la *ausencia* de `coding-standards.md` ni de las demás specs generales user-owned: no es
  drift. Si existe y arrastra `</content>`, lo **informa** sin auto-editarlo.
- **No drift-checkea las tareas ya materializadas**: son histórico. Las secciones nuevas de la plantilla
  de tarea llegan a las tareas **nuevas**.
- **No usa `plugin.json`** para decidir drift: compara **ancla de plantilla ↔ ancla del materializado**.
