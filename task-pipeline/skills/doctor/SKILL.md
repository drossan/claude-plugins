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

Recorre estas cuatro categorías **sin tocar ningún fichero** y construye una **lista numerada de
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
6. **Reglas de honestidad ausentes o sin `@import`** (repo-owned, opt-in) — dos comprobaciones
   independientes:
   - Si `.claude/honesty-rules.md` **falta**, repórtalo y ofrece **materializarlo** desde la plantilla
     (`../plan-task/templates/honesty-rules.md`) en Fase 2 (diff + aprobación).
   - Si el fichero existe pero el `CLAUDE.md` (raíz o de workspace) **no lo `@importa`**
     (`@.claude/honesty-rules.md`), repórtalo y **SUGIERE** añadir la línea — pero **no** edites el
     `CLAUDE.md` (invariante: nunca tocas su prosa/config; el `@import` es opt-in del usuario). Si el repo
     **no tiene** `CLAUDE.md`, no lo crees: solo nota que el `@import` es opt-in.
   **No** vigiles `.claude/specs/general/coding-standards.md` ni las otras specs generales
   (`testing.md`/`error-handling.md`/`security.md`/`git-workflow.md`): son **user-owned** y su ausencia
   **no es drift**.
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

**Ids duplicados / `filename` ≠ `id:` (no mecánico → aviso, regla 4):** renumerar un id **no** es un fix
seguro — rompería los `depends_on` y los enlaces que apuntan a él, y hay que elegir cuál de los ficheros en
conflicto cambia. Trátalo como **aviso**: nombra los ficheros implicados y **sugiere** la resolución
(renumerar el `<nn>` más nuevo **o** renombrar el `<name-plan>`, actualizando `depends_on`/enlaces), **sin
auto-editar**. **Aviso extra (T-H)**: si alguna de las tareas en conflicto **ya tiene `issue:`** (proyectada
en GitHub por `features.github-tracking`), advierte que renumerar **desincroniza** el `.md` de su issue → hay
que re-proyectar / actualizar la issue (ver la reconciliación de `/doctor`).

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
- **No edita el `CLAUDE.md`** del usuario: sugiere el `@import` de `honesty-rules.md`, nunca lo añade.
- **No vigila** `coding-standards.md` ni las demás specs generales user-owned: su ausencia no es drift.
