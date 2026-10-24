# 0002. Entrega del JSON schema: materializar en el repo consumidor

- **Estado**: accepted
- **Fecha**: 2026-08-18
- **Decisores**: owner del repo (Daniel). `design-review` recomendaba la Opción URL; el owner eligió
  materializar de forma consciente.

## Contexto y planteamiento del problema

Se añade un JSON schema para que el editor autocomplete/valide `task-pipeline.yml`. El schema vive en el
plugin; el problema es el **template materializado** en repos de terceros, donde el fichero del plugin no
existe. ¿Cómo se referencia el `# yaml-language-server: $schema=…` para que resuelva en el consumidor?

## Decision drivers

- **Que funcione en el consumidor** (donde no está el fichero del plugin).
- **Autocontenido / offline** (sin depender de red ni de que el repo sea público).
- **Mantenimiento**: minimizar superficie de sincronización del contrato.

## Opciones consideradas

- **Opción URL** — modeline apunta a una URL publicada (raw GitHub / Pages). Sin fichero por-repo, sin drift.
- **Opción materializar** — `/task-init` y `/doctor` copian el schema al repo consumidor
  (`.claude/task-pipeline.schema.json`) + modeline relativo; `/doctor` vigila su drift.
- **Opción solo-plugin** — el schema vive solo en el repo del plugin; los consumidores no obtienen autocompletado.

## Resultado de la decisión

Elegida: **Opción materializar**, por decisión explícita del owner: prioriza **autocontenido/offline** y no
depender de que `drossan/claude-plugins` sea público ni de una URL estable. Se asume el coste de
mantenimiento (una categoría de **drift** en `/doctor`).

> Nota: `design-review` recomendaba la **Opción URL** (menos superficie, sin drift). Queda registrado que la
> materialización es una decisión consciente que **duplica la superficie de sincronización** del contrato.

### Confirmación

- `/task-init` y `/doctor` materializan `.claude/task-pipeline.schema.json` (o la ruta canónica que fije la
  tarea) y el modeline lo referencia con ruta relativa.
- `/doctor` detecta y ofrece corregir el **drift** del schema materializado frente al del plugin.

## Consecuencias

- **Buenas**: autocompletado en el consumidor sin red ni repo público; autocontenido.
- **Malas / coste**: cada cambio del contrato del YAML exige tocar el schema **y** marcar drift en los
  consumidores; nueva categoría en `/doctor`; decisión pegajosa de revertir (schema + modeline + categoría).

## Pros y contras de las opciones

- **URL**: 👍 cero fichero por-repo, cero drift · 👎 depende de red + repo público + URL estable.
- **Materializar**: 👍 autocontenido/offline · 👎 duplica superficie de sync; drift a vigilar en `/doctor`.
- **Solo-plugin**: 👍 mínimo esfuerzo · 👎 el consumidor no obtiene autocompletado (objetivo incumplido).
