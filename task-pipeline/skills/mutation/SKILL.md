---
name: mutation
description: Gate de mutation testing para cerrar una tarea — selecciona la herramienta por `stack.mutation-tool` del package (Stryker verificado; `mutmut` y el escape `mutation-command` como referencia), corre sobre los ficheros que tocó la tarea, lee los survivors y refuerza los tests hasta superar el umbral (`break`, default 80). Úsalo en el cierre de cada tarea (DoD) o cuando el usuario pida comprobar la calidad de los tests. Opcional: pásale el package (p.ej. `/mutation storage`).
---

Verificas que los tests de la tarea son **de calidad**, no solo que pasan: la herramienta muta el código y comprueba que algún test falla por cada mutación. Un *survivor* = test que falta o assert vacío. El gate se supera con **mutation score ≥ umbral** (`break`, por defecto `80`).

> **Solo el camino Stryker está verificado en este plugin.** `mutmut` (Python) y el escape genérico
> `mutation-command` son **invocaciones de referencia**: se emiten con un **banner "⚠️ no verificada"** y el
> owner confirma el comando contra la doc de la herramienta antes de fiarse del resultado.
> `cosmic-ray`/`cargo-mutants`/`gremlins` son **solo ejemplos** en la nota de "otros lenguajes" (Paso 5),
> no ramas seleccionables shipeadas.

## Paso 0 — Config del repo y selección de herramienta

Lee `.claude/task-pipeline.yml` con **Read** (si existe) y respétalo.

- **Umbral / enable**: `features.mutation-gate` → `false` (o la herramienta resuelta es `none`): **no hay
  gate**; informa y sal sin correr nada. `true` → umbral `break:80`. `<int>` → ese umbral `break`.
  **Este flag NO es per-package** (solo `stack.*` lo es): "este package sin gate de mutation" se expresa con
  `stack.mutation-tool: none` en su entrada de package, **no** con un gate por-package.
- **Herramienta (per-package)**: resuelve `stack.packages.<pkg>.mutation-tool` con **fallback** al
  `stack.mutation-tool` top-level (regla de resolución canónica: README del plugin → "Configuración por
  repo" → "Stack por-package"). Dispatch:

  | `mutation-tool` | Lenguaje típico | Invocación de referencia | ¿Verificada? |
  |---|---|---|---|
  | `stryker` | JS/TS | `pnpm exec stryker run` (Pasos 2–4) | ✅ **sí** |
  | `mutmut` | Python | `mutmut run` + `mutmut results` (Paso 5) | ⚠️ no — **banner** |
  | *otra* + `mutation-command: "<cmd>"` | cualquiera | `<cmd>` tal cual (Paso 5) | ⚠️ no — **banner** |
  | `none` | — | no-op: "sin gate", sal | — |

  - `none` → **no-op**: informa "sin gate de mutation para `<pkg>`" y sal.
  - `stryker` → camino **verificado** (Pasos 2–4, gotchas pnpm incluidos), **sin banner**.
  - `mutmut` → invocación de **referencia** Python (Paso 5) + **banner** + aviso de confirmar contra la doc.
  - herramienta no reconocida **con** `stack.packages.<pkg>.mutation-command: "<cmd>"` → corre `<cmd>`
    (Paso 5, referencia, mismo banner).
  - herramienta no reconocida **sin** `mutation-command` → **no-op** + aviso "sin gate: falta
    `mutation-command`". No inventes una invocación para una herramienta que no conoces.
- **Coherencia `language`↔`mutation-tool`**: si la combinación es incoherente (p.ej. `mutmut` con
  `language: rust`), **avisa** — no la corrijas ni la asumas válida.

## Paso 1 — Package y ficheros tocados

- **Package**: el de `$ARGUMENTS` si se pasa; si no, dedúcelo del diff de la tarea. **Si el diff toca
  ficheros de dos o más packages y no se pasó `$ARGUMENTS`**, **pide explícitamente** qué package mutar —
  no asumas ninguno.
- **Ficheros a mutar**: solo los de producción que tocó la tarea, dentro de `src/`:

  ```bash
  git diff --name-only <base>...HEAD; git diff --name-only; git diff --name-only --staged
  ```

  Filtra a `**/<package>/src/**` y excluye tests, `*.d.ts` y barrels triviales. Mutar solo lo cambiado mantiene el gate en segundos.

## Paso 2 — [Stryker] Asegurar el setup en el package (one-time)

> Solo si la herramienta resuelta es `stryker`. Para `mutmut`/`mutation-command`, salta al Paso 5.

Si el package no tiene Stryker, instálalo y crea la config:

```bash
pnpm --filter <pkg> add -D @stryker-mutator/core @stryker-mutator/vitest-runner
```

`<package>/stryker.config.json`:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "plugins": ["@stryker-mutator/vitest-runner"],
  "coverageAnalysis": "perTest",
  "mutate": ["src/**/*.ts", "!src/**/*.d.ts"],
  "thresholds": { "break": 80 },          // usa el umbral de features.mutation-gate si no es 80
  "reporters": ["clear-text", "progress"]
}
```

Script en `package.json`: `"mutation": "stryker run"`. (Con `stack.test-runner: jest` usa
`@stryker-mutator/jest-runner` + `"testRunner": "jest"`.)

> **Gotchas verificados (pnpm)** — sin esto no arranca:
> - `"plugins": ["@stryker-mutator/vitest-runner"]` **obligatorio**: pnpm rompe el auto-descubrimiento (`Cannot find TestRunner plugin "vitest"`).
> - Invocar con **`pnpm exec stryker run`** o el script `mutation`. **NO `npx`**.
> - Gitignorar `.stryker-tmp/` y `reports/mutation/`.

## Paso 3 — [Stryker] Correr el gate (scope a lo cambiado)

```bash
cd <ruta-del-package>
pnpm exec stryker run --mutate "<fichero1>,<fichero2>" 2>&1 | tail -40
```

Con `thresholds.break` al umbral configurado, Stryker sale con código ≠ 0 si baja de él → el gate falla.

## Paso 4 — Matar survivors (bucle TDD)

Aplica a **cualquier** herramienta que reporte survivors (`[Survived]` en Stryker, survivors en el reporte de mutmut, etc.). Por cada survivor:

1. Lee la mutación (operador, fichero:línea): te dice qué comportamiento ningún test comprueba.
2. Suele ser un escenario Gherkin sin assert real, un mensaje/contexto de error no verificado o una rama sin cubrir. **Añade o refuerza el test** (sin tocar el código de producción para "facilitar" el kill — es trampa).
3. Re-corre. Repite hasta superar `break: 80`.

**Mutantes equivalentes**: algunos survivors no se pueden matar. No persigas kills imposibles: documéntalos. No bajes el umbral para esquivarlos sin acuerdo del usuario.

## Paso 5 — [Referencia, NO verificada] mutmut / mutation-command

> Emite **siempre** este banner antes de correr nada por esta vía:
>
> ```
> ⚠️ Invocación de referencia NO verificada en este repo. Confirma el comando contra la
>    doc de <herramienta> antes de fiarte del resultado.
> ```

- **`mutmut` (Python)** — invocación de referencia:

  ```bash
  cd <ruta-del-package>
  mutmut run --paths-to-mutate "<fichero1>,<fichero2>"
  mutmut results          # lee los survivors → bucle del Paso 4
  ```

- **`mutation-command` (escape genérico)** — corre el comando **repo-owned** (`stack.packages.<pkg>.mutation-command`) tal cual; es config del owner y no la reescribes:

  ```bash
  cd <ruta-del-package>
  <mutation-command>
  ```

- **Fallo = fallo del gate**: si la invocación **sale con código ≠ 0**, el gate **FALLA** (igual que un
  Stryker por debajo del umbral). **No se silencia por ser "referencia no verificada"**: el banner avisa
  de la *confianza en el comando*, no exime de su resultado.
- **Otros lenguajes (solo ejemplos, no shipeados)**: `cosmic-ray` (Python), `cargo-mutants` (Rust),
  `gremlins` (Go) se conectan por el escape `mutation-command`, **no** como ramas de esta skill. El plugin
  no finge conocer su CLI.

## Paso 6 — Reportar

Mutation score final + desglose, tests añadidos (qué survivor mataba cada uno), equivalentes documentados,
y confirma el checkbox de la DoD: *gate de mutation superado con la herramienta del package*. Para
`mutmut`/`mutation-command`, **repite el banner "no verificada"** en el reporte de cierre.
