---
name: mutation
description: Gate de mutation testing con Stryker para cerrar una tarea — corre sobre los ficheros que tocó la tarea, lee los survivors y refuerza los tests hasta superar el umbral (break 80). Úsalo en el cierre de cada tarea (DoD) o cuando el usuario pida comprobar la calidad de los tests. Opcional: pásale el package (p.ej. `/mutation storage`).
---

Verificas que los tests de la tarea son **de calidad**, no solo que pasan: Stryker muta el código y comprueba que algún test falla por cada mutación. Un *survivor* = test que falta o assert vacío. El gate se supera con **mutation score ≥ umbral** (`break`, por defecto `80`).

## Paso 0 — Leer la config del repo

Lee `.claude/task-pipeline.yml` con **Read** (si existe) y respétalo:

- `features.mutation-gate` → `false` (o `stack.mutation-tool: none`): **no hay gate**; informa y sal sin correr nada. `true` → umbral `break:80`. `<int>` → ese umbral `break`.
- `stack.test-runner` / `stack.package-manager` → elige runner y gestor reales (abajo se asume **Vitest + pnpm**; si difiere, ajusta el plugin del runner y los comandos: p.ej. `@stryker-mutator/jest-runner` + `"testRunner": "jest"`).

Sin archivo, asume los defaults (`break:80`, Vitest + pnpm).

## Paso 1 — Package y ficheros tocados

- **Package**: el de `$ARGUMENTS` si se pasa; si no, dedúcelo del diff de la tarea.
- **Ficheros a mutar**: solo los de producción que tocó la tarea, dentro de `src/`:

  ```bash
  git diff --name-only <base>...HEAD; git diff --name-only; git diff --name-only --staged
  ```

  Filtra a `**/<package>/src/**` y excluye tests, `*.d.ts` y barrels triviales. Mutar solo lo cambiado mantiene el gate en segundos.

## Paso 2 — Asegurar el setup de Stryker en el package (one-time)

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

Script en `package.json`: `"mutation": "stryker run"`.

> **Gotchas verificados (pnpm)** — sin esto no arranca:
> - `"plugins": ["@stryker-mutator/vitest-runner"]` **obligatorio**: pnpm rompe el auto-descubrimiento (`Cannot find TestRunner plugin "vitest"`).
> - Invocar con **`pnpm exec stryker run`** o el script `mutation`. **NO `npx`**.
> - Gitignorar `.stryker-tmp/` y `reports/mutation/`.

## Paso 3 — Correr el gate (scope a lo cambiado)

```bash
cd <ruta-del-package>
pnpm exec stryker run --mutate "<fichero1>,<fichero2>" 2>&1 | tail -40
```

Con `thresholds.break` al umbral configurado, Stryker sale con código ≠ 0 si baja de él → el gate falla.

## Paso 4 — Matar survivors (bucle TDD)

Por cada `[Survived]`:

1. Lee la mutación (operador, fichero:línea): te dice qué comportamiento ningún test comprueba.
2. Suele ser un escenario Gherkin sin assert real, un mensaje/contexto de error no verificado o una rama sin cubrir. **Añade o refuerza el test** (sin tocar el código de producción para "facilitar" el kill — es trampa).
3. Re-corre. Repite hasta superar `break: 80`.

**Mutantes equivalentes**: algunos survivors no se pueden matar. No persigas kills imposibles: documéntalos. No bajes el umbral para esquivarlos sin acuerdo del usuario.

## Paso 5 — Reportar

Mutation score final + desglose, tests añadidos (qué survivor mataba cada uno), equivalentes documentados, y confirma el checkbox de la DoD: *Mutation testing gate passed (Stryker, break 80)*.
