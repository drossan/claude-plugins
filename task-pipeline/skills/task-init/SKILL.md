---
name: task-init
description: Inicializa (bootstrapea) la convención del plugin task-pipeline en un repo — esqueleto .claude/plans|tasks|context|specs, docs/guides/task-lifecycle.md y, opcionalmente, el HOW-TO-START-A-TASK.md de un package. Úsalo UNA vez tras instalar el plugin, antes de tu primer `/plan-task`. Ejemplos: `/task-init`, `/task-init api`.
---

Eres el bootstrapper del flujo `task-pipeline`. Tu único trabajo es dejar el repo
listo para que `/plan-task "<specs>"` arranque sin tener que improvisar la estructura.
Hay dos mitades:

1. **Genérica** (siempre): el esqueleto de carpetas y la guía canónica del ciclo
   de vida. Es determinista — copiar plantillas.
2. **Específica de package** (si te pasan un package en `$ARGUMENTS`, o si lo
   acuerdas con el usuario): el `HOW-TO-START-A-TASK.md` del package, que requiere
   rellenar bloques con criterio.

> **Plantillas (semillas)**: viven en el skill hermano `plan-task`, en
> `skills/plan-task/templates/` (mismo plugin). `${CLAUDE_PLUGIN_ROOT}` no se expande en
> el cuerpo de un `SKILL.md`, así que localízalas con la tool **Read** por ruta
> relativa al directorio de ESTE skill: `../plan-task/templates/`. Si tienes la ruta
> absoluta de este skill (`.../task-pipeline/skills/task-init/`), las plantillas
> están en `.../task-pipeline/skills/plan-task/templates/`. **Léelas y materialízalas**;
> no improvises el contenido.

> **Idempotente**: nunca pises un fichero que ya existe. Si un destino ya está,
> respétalo y solo informa. Si dudas si sobrescribir algo, pregunta con
> `AskUserQuestion`.

## Paso 0 — Detectar contexto del repo

Antes de escribir nada, mira el repo en read-only:

- ¿Es un monorepo con workspaces (pnpm-workspace.yaml, packages/*, apps/*) o un
  repo de un solo package? Esto te da los nombres de `<package>` posibles.
- ¿Qué runner de tests usa (Vitest, Jest, otro) y gestor (pnpm, npm, yarn)? El
  plugin asume **Vitest + pnpm + Stryker `break: 80`**; si el repo difiere, ajusta
  los comandos al materializar las plantillas en vez de copiarlos a ciegas.
- **Lenguaje por workspace (best-effort)**: para cada workspace, infiere el lenguaje
  de sus marcadores — `package.json`→JS/TS, `pyproject.toml`/`setup.py`→Python,
  `Cargo.toml`→Rust, `go.mod`→Go. Es **best-effort**, no promete detección infalible.
  Si un workspace tiene marcadores **en conflicto** (p.ej. `package.json` **Y**
  `pyproject.toml`) o **ninguno reconocible**, trátalo como **ambiguo** → no adivines:
  se pregunta en el Paso 1.5.
- ¿Ya hay algo de la convención (`.claude/plans`, `docs/guides/task-lifecycle.md`)?
  Si sí, este repo ya está parcialmente adoptado: completa lo que falte, no dupliques.

## Paso 1 — Materializar la parte genérica

1. Crea el esqueleto de carpetas (si no existe):
   `.claude/plans/{pending,active,completed,cancelled}/`,
   `.claude/tasks/{pending,active,completed,cancelled}/`,
   `.claude/context/`, `.claude/specs/`, `docs/guides/`.
2. Lee `../plan-task/templates/task-lifecycle.md` con **Read** y escríbela en
   `docs/guides/task-lifecycle.md` **solo si no existe**. Ajusta los comandos del
   runner si el repo no usa pnpm/Vitest.
3. Lee `../plan-task/templates/task-pipeline.yml` con **Read** y escríbela en
   `.claude/task-pipeline.yml` **solo si no existe**. Es la config del repo (preset
   `mode`, `stack`, features). **Rellénala con lo que detectaste en el Paso 0** en vez
   de copiar los defaults a ciegas:
   - `stack`: `language`, `package-manager`, `test-runner`, `mutation-tool` reales.
   - `mode`: si **no hay runner de tests** o el repo es legacy sin harness, propón
     `legacy` (TDD sobre lo que tocas, sin gate de mutation) o `docs-only` (solo
     planes + docs) y **confírmalo con `AskUserQuestion`** antes de fijarlo. Si hay
     stack de tests sano, deja `full`.
   El usuario puede editarla luego. No la sobrescribas si ya existe.
4. Lee `../plan-task/templates/honesty-rules.md` con **Read** y escríbela en
   `.claude/honesty-rules.md` **solo si no existe**. Son las reglas de honestidad **y de
   disciplina de trabajo** (verificar antes de afirmar, alcance del encargo, cap de
   delegación en subagentes, longitud de los entregables escritos), pensadas para leerse
   **cada turno**. Cópiala **entera, tal cual**: su primera línea es el ancla
   `template-version` que `/doctor` usa para detectar drift. Para que surtan
   efecto, **SUGIERE** al usuario añadir la línea `@.claude/honesty-rules.md` a su
   `CLAUDE.md` (raíz y/o del workspace) — pero **no** edites el `CLAUDE.md` tú: el
   `@import` es **opt-in** del usuario (misma disciplina que la sugerencia del HOW-TO en
   el paso siguiente). Si el repo **no tiene** `CLAUDE.md`, sugiere crearlo con esa
   línea; **no lo crees ni lo edites tú**.
5. Materializa la spec general **`coding-standards.md`**: crea `.claude/specs/general/`
   si no existe, lee `../plan-task/templates/coding-standards.md` con **Read** y
   escríbela en `.claude/specs/general/coding-standards.md` **solo si no existe**. Trae
   la regla de **no-duplicación**; es **user-owned** (la extiendes tú). Las demás specs
   generales que el HOW-TO referencia (`testing.md`, `error-handling.md`, `security.md`,
   `git-workflow.md`) siguen siendo **punteros que rellenas tú**: no las materialices
   con contenido inventado.

> El hook `SessionStart` del plugin auto-repara esta parte genérica en cada sesión
> una vez el repo está adoptado (incl. restaurar `.claude/honesty-rules.md` si se
> borra) — pero **nunca** toca el `CLAUDE.md`. `coding-standards.md`, por ser
> user-owned, **no** la restaura el hook. Tú la creas la primera vez.

## Paso 1.5 — Stack por-package (`stack.packages`, monorepo poliglota)

Solo si hay **más de un lenguaje** entre los workspaces (o el usuario lo pide). Siembra
`stack.packages.<pkg>` para que cada workspace resuelva su runner/mutation por lenguaje. La **regla de
resolución es canónica** en el README del plugin → "Configuración por repo" → "Stack por-package" (el
`stack:` top-level es el default/fallback; una entrada de package pisa **solo** las claves que declara).

**Alcance del escaneo** (declara cuál aplica):
- **`/task-init` sin package** (bootstrap genérico): puede escanear **todos** los workspaces de una vez y
  proponer una entrada por cada uno cuyo lenguaje difiera del `stack:` top-level.
- **`/task-init <package>`**: inicializa **ese** package; propone solo su entrada.

**Mapa lenguaje → stack por defecto** (coherente con `/mutation`, tarea del selector de herramienta):

| Lenguaje | `test-runner` | `mutation-tool` |
|---|---|---|
| JS/TS | `vitest` (o `jest` si lo detectas) | `stryker` |
| Python | `pytest` | `mutmut` |
| Rust | `cargo test` | `none` + `mutation-command: "cargo mutants"` (referencia) |
| Go | `go test` | `none` + `mutation-command: "gremlins ..."` (referencia) |

Rust/Go usan el **escape `mutation-command`** (no una tool nombrada shipeada), coherente con
"cosmic-ray/cargo-mutants/gremlins solo en docs" de `/mutation`.

**Confirm humano (obligatorio)**: antes de escribir `stack.packages`, lanza **`AskUserQuestion`** con la
propuesta detectada (por package). **Solo escribe al confirmar** — igual que ya haces con `mode`. Detección
**ambigua / desconocida / en conflicto** → **no fijes un default en silencio**: pregunta. **Sin canal para
`AskUserQuestion`** (entorno no interactivo) → **no** escribas `stack.packages` a ciegas: déjalo sin fijar y
**repórtalo** (no adivinar es preferible a acertar por suerte).

**Escritura ADITIVA (no "no pisar el fichero entero")**: la idempotencia de `/task-init` ("nunca pises un
fichero que ya existe") es a nivel de **fichero completo**. Añadir `stack.packages.<pkg>` a un
`.claude/task-pipeline.yml` **ya materializado** (repo previamente adoptado, sin `stack.packages`) es una
**edición aditiva**: **añade** el bloque/entrada sin tocar el resto del fichero — **no** lo trates como
"fichero que ya existe, no pisar". **Nunca dupliques** una entrada `stack.packages.<pkg>` ya presente: si
existe, respétala e informa.

**Clave YAML válida**: la clave del map es el `<package>` (nombre de workspace, el mismo de
`.claude/tasks|plans/<package>/`). Si el nombre no es una clave YAML válida (espacios, `:`, etc.) →
**sanea o pregunta**; nunca escribas una clave que rompa el YAML.

## Paso 2 — HOW-TO del package (si aplica)

Si `$ARGUMENTS` nombra un package (o el usuario lo pide), y no existe ya su
`.claude/specs/<package>/HOW-TO-START-A-TASK.md`:

1. Lee `../plan-task/templates/HOW-TO-START-A-TASK.md` con **Read**.
2. Materialízalo en `.claude/specs/<package>/HOW-TO-START-A-TASK.md` rellenando los
   bloques marcados `ESPECÍFICO DEL PACKAGE`:
   - **Bloque "Stack de este package"**: rellénalo con `stack.packages.<package>` (o el
     `stack:` top-level si el package no tiene override). El bloque **refleja** el YAML;
     **nota explícitamente que el YAML es la fuente de verdad** (si divergen, manda el
     YAML). Debe **coincidir** con `stack.packages.<package>`.
   - **Niveles de test por artefacto** (dominio/use cases → unit con mocks de
     puertos; repos/endpoints → integración; adapters → suite de contrato…).
   - **Reglas de arquitectura** del workspace (dirección de dependencias,
     autorización, TS estricto, etc.).
   - **Tabla de specs aplicables** (`.claude/specs/<package>/…` y
     `.claude/specs/general/…`).
   - **Comando de filtro** del runner (p.ej. `pnpm --filter <package>`).
3. Sustituye todos los `<package>` por el nombre real.
4. Sugiere referenciarlo desde el `CLAUDE.md` del workspace (y el raíz) para que se
   tenga en cuenta en toda tarea.

> **HOW-TO ya existente**: si el `HOW-TO-START-A-TASK.md` del package ya está (repo
> adoptado), **no lo reescribas**; pero **sí** añade/actualiza solo el bloque "Stack de
> este package" para que refleje `stack.packages.<package>` — es una edición **aditiva**
> del bloque, no una sobrescritura del fichero.

Si no te pasan package, no inventes uno: deja la parte genérica lista y di al
usuario que corra `/task-init <package>` cuando quiera inicializar uno (o que
`/plan-task` lo creará al vuelo en el primer plan de ese package).

## Paso 3 — Reportar y handoff

Reporta en pocas líneas: qué creaste, qué ya existía (respetado), y el package
inicializado si lo hubo. Cierra indicando el siguiente paso:

> Repo listo. Arranca trabajo nuevo con `/plan-task "<tus especificaciones>"` — el
> pipeline hará plan mode → plan en pending → `grilling` → tareas Gherkin → TDD →
> gate de mutation (`/mutation`).

## Qué NO hace este skill

- **No** crea planes ni tareas (eso es `/plan-task`).
- **No** corre `grilling` ni entra en plan mode.
- **No** instala Stryker (eso lo hace `/mutation` la primera vez en cada package).
- **No** edita ni crea el `CLAUDE.md` del usuario: **sugiere** el `@import` de
  `.claude/honesty-rules.md`, nunca lo escribe (invariante del plugin).
