# Session log — task-pipeline-model-routing-per-phase-03

## 2026-08-18 — Arranque (nota retroactiva)

- `depends_on: [01]` → 01 está `done`. Sin bloqueo.
- Tarea movida a `.claude/tasks/active/task-pipeline/task-pipeline-model-routing-per-phase-03.md`,
  `status: active`. Misma rama del plan.
- **Nota de proceso**: el diseño del schema (contenido JSON) y su materialización dogfood se hicieron
  antes de mover formalmente el fichero de tarea a `active/` (secuencia invertida respecto al HOW-TO). No
  afecta al resultado — mismo repo, misma rama, sin otra tarea `active` en paralelo — pero se registra
  como desviación del orden canónico.
- Alcance: JSON schema completo del `task-pipeline.yml` + modeline en ambos YAML + clave-ancla de
  versión. Materialización general en consumidores + drift es la tarea 05 (fuera de alcance aquí).

## 2026-08-18 — Cierre

### Resumen

Creado `task-pipeline/skills/plan-task/templates/task-pipeline.schema.json` (JSON Schema draft-07, fuente
canónica) cubriendo `mode`/`stack`(+`packages`)/`features`(+bloques opt-in)/`models`. Materializada una
copia dogfood en `.claude/task-pipeline.schema.json` de este repo. Añadido el modeline
`# yaml-language-server: $schema=./task-pipeline.schema.json` como primera línea de ambos
`task-pipeline.yml`. Documentado en una nueva subsección del README del plugin.

### Decisiones técnicas + porqué

- **Ubicación del schema fuente**: `skills/plan-task/templates/` (junto al resto de plantillas
  materializables), no un directorio nuevo — reutiliza el patrón ya establecido y verificado
  (`../plan-task/templates/<fichero>`) que `doctor`/`task-init` usan para leer semillas across-skill, sin
  inventar una convención nueva solo para el schema.
- **Ruta relativa copy-paste-safe**: el modeline usa `./task-pipeline.schema.json` en ambos YAML (mismo
  directorio que el `.yml` que lo referencia). Así, cuando la tarea 05 materialice el schema junto al
  `.claude/task-pipeline.yml` de un consumidor, el modeline del template funciona sin reescritura de ruta.
- **`x-task-pipeline-schema-version`**: es una clave top-level **del propio fichero de schema** (no del
  YAML de datos) — versiona el contrato del schema en sí, independiente del `version` del `plugin.json`.
  Fijada a `"1.0.0"` (greenfield). Task 05 la usará para detectar drift comparando la versión materializada
  en el consumidor contra la que trae el plugin instalado.
- **`models`**: `properties` para las 4 fases conocidas (autocompletado de claves) + `additionalProperties`
  con el mismo `$ref` (una clave desconocida como `models.foo` sigue tipada, no se rechaza — coherente con
  RN-3 del CU: se ignora en runtime, no rompe).
- **`$defs` → `definitions`**: corregido tras escribir el fichero — `$defs` es de JSON Schema 2019-09+;
  con `"$schema": "draft-07"` declarado, el keyword canónico es `definitions` (`$ref` resuelve igual por
  JSON Pointer, pero `definitions` es lo correcto para la draft declarada).
- **Doc técnica**: añadida una subsección al README del plugin ("Autocompletado con JSON schema"); **no**
  se añadió una fila a la tabla "Plantillas" (`## Plantillas`) porque esa tabla documenta lo que
  `/plan-task`/`/task-init` **ya** materializan automáticamente, y la materialización del schema en
  consumidores es explícitamente la tarea 05 (aún no implementada) — añadir la fila ahora sería una
  afirmación prematura.

### Verificación corrida + resultado

- `python3 -m json.tool` sobre ambos ficheros de schema (fuente + copia dogfood): **JSON válido**.
- Ambos `task-pipeline.yml` (con el modeline añadido) siguen parseando con PyYAML.
- **Validación real contra `jsonschema` (Draft7Validator)**, instalado ad-hoc para verificación (no es
  dependencia del proyecto): 10 casos cubriendo los escenarios del CU-json-schema —
  alias válido, id libre aceptado, lista rechazada, `mode` fuera de enum rechazado, `mode` válido
  aceptado, clave desconocida en `models` permitida (tipada, no rota), `mutation-gate` como bool/int,
  override parcial de `stack.packages`, y un documento `task-pipeline.yml`-completo válido. **Los 10
  pasan** como se esperaba.
- **Gate `sdd-lint`**: ningún fichero bajo `.claude/specs/` cambió en esta tarea → resultado de la tarea 01
  (sin ERROR, 1 AVISO menor ya reconocido) sigue vigente por invarianza de entrada.
- **Gate `fact-checker`**: 6/6 VERIFICADO (incl. los 6 sub-casos de validación jsonschema).

### Documentación actualizada (rutas + motivo)

- `task-pipeline/README.md` — nueva subsección "Autocompletado con JSON schema" en
  "Configuración por repo".
- **SDD**: sin cambios de spec/CU (el CU-json-schema ya existía; esta tarea lo consume, no lo edita).

### Ficheros / commits

Nuevo: `task-pipeline/skills/plan-task/templates/task-pipeline.schema.json`,
`.claude/task-pipeline.schema.json`. Modificados: ambos `task-pipeline.yml` (modeline),
`task-pipeline/README.md`. Commit de cierre pendiente.

### Tiempo real

~45 min (estimate: 4h).

### Follow-ups

- Ninguno nuevo.
