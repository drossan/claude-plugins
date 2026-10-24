---
id: task-pipeline-sdd-proveedor-externo
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/sdd-proveedor-externo
issue: 78
created: 2026-10-24
updated: 2026-10-24
---

# SDD con proveedor externo (`features.sdd.provider`)

## Contexto y problema

Hoy `features.sdd: true` (booleano) activa solo la capa SDD **nativa**: spec EARS + casos de uso Gherkin + ADR MADR,
con el Gherkin viviendo solo en el CU y el gate `sdd-lint` entre `mutation` y `fact-checker`. Hay repos que ya usan
otro plugin de SDD y quieren que el pipeline **delegue** en él en vez de imponer los artefactos nativos. Hace falta
poder activar SDD apuntando a un plugin externo nombrado en `.claude/task-pipeline.yml`.

## Objetivos

1. **Contrato de config con proveedor**: `features.sdd` acepta, además del booleano, un bloque
   `{ enabled: true, provider: "<plugin>:<skill>" }`.
   - *Criterio de éxito*: ambos schemas (`.claude/` y `templates/`) son JSON válido y aceptan boolean | objeto; el template YAML muestra el ejemplo comentado.
2. **Modo SDD ∈ {off, native, external}** resuelto de forma única y fail-safe.
   - *Criterio de éxito*: `true` → native (byte-idéntico a hoy); bloque con `enabled: true` + `provider` string no vacío → external; cualquier otra cosa (incl. `{enabled:true}` sin provider) → off en runtime. La regla off/native/external está escrita **una sola vez** (guía del lifecycle) y el resto la enlaza.
3. **Con `external`, lo nativo se apaga y se delega**: sin plantillas/scaffolding SDD, sin `sdd-lint` ni efecto de `models.sdd-lint`, Gherkin de nuevo en la tarea (salvo que la tarea ya enlace a un CU: ese enlace se sigue siempre, sea cual sea el modo). El pipeline **invoca la skill del provider** al arrancar la tarea y al cerrarla (entre `mutation` y `fact-checker`) con el contrato versionado y marcado experimental `phase=start|close task=<ruta> plan=<ruta>`.
   - *Criterio de éxito*: los lectores nativos (`mutation`, `scenario-coverage`, `sdd-lint`, `task.md`) dicen «modo nativo (`sdd: true`)» y no duplican la regla de tres modos; solo actúan en `external` el lifecycle (arranque/cierre), `plan-task` (paso 7.5), la línea de DoD, `task-init` y `doctor`.
   - **Semántica de «no bloquear»**: provider ausente o con error → **aviso que el owner reconoce** (como un AVISO de `sdd-lint`); problemas que reporta el provider → se trasladan como aviso, **nunca ERROR** (el pipeline no valida su contenido).
4. **Activación y salud guiadas**: `/task-init` y `/doctor` ofrecen nativo vs externo con confirmación explícita; el valor de `provider` se pide como texto libre y no se comprueba al escribirlo. «Ya activo» reconoce también el bloque.
   - *Criterio de éxito*: nunca escriben `features.sdd` sin aprobación; sin canal para preguntar lo reportan; `/doctor` avisa de `{enabled:true}` sin provider (sigue off) y de provider configurado pero no instalado.
5. **Specs del repo al día** (este repo es `sdd: true`): `spec.md` FR-002 y un FR nuevo de resolución del modo; `casos-de-uso/routing-contrato.md` con ejemplos del bloque.
   - *Criterio de éxito*: ningún FR/CU contradice el modo `external`.
6. **Docs y release coherentes**.
   - *Criterio de éxito*: README/guías/portal describen los tres modos y el contrato experimental del provider; `pnpm docs:build` en verde; versión y CHANGELOG subidos.

## Alcance y fuera de alcance

### Dentro del alcance
- Clave `features.sdd.provider`, su schema, plantilla y todos los lectores de `features.sdd`.
- Activación guiada en `/task-init` y `/doctor`; documentación y release.
- Orden de cierre respecto a auto-commit y proyección a GitHub (solo la línea del lifecycle que fija que `phase=close` va antes).
- Aviso de `/doctor` por artefactos nativos huérfanos en un repo `external` (solo avisa).

### Fuera de alcance
- Implementar o empaquetar ningún plugin SDD externo, ni validar su contenido (sin gate equivalente a `sdd-lint`).
- Cambiar el comportamiento del modo nativo (`sdd: true` queda byte-idéntico).
- Migrar, borrar o convertir a la fuerza artefactos nativos existentes al pasar a `external`.
- Cambiar el comportamiento de GitHub tracking y git-automation más allá de fijar el orden de `phase=close`.
- Varios providers o un provider por package.

## Recursos externos

- Decisiones del owner (2026-10-24): con provider externo se **delega y se apaga lo nativo**; la config es un **bloque** bajo `features.sdd` (no una clave nueva).
- Ver `task-pipeline/README.md` → "SDD nativo (opcional)", `docs/guides/task-lifecycle.md` → "Flujo SDD", `.claude/specs/task-pipeline/spec.md`.

## Estimación global

- **Tareas totales**: 5 (ver lista al final).
- **Esfuerzo estimado**: 5–6 sesiones.
- **Recursos**: este repo; sin dependencias nuevas.

## Criterios de calidad y verificación

- Stack `none`: verificación por `grep` / `python3 -m json.tool` / parseo de ambos YAML / `claude plugin validate .` / `cd website && pnpm docs:build`.
- Recorrido manual de los tres modos (off / `true` / bloque con provider) en un repo de prueba, con un **stub de provider** (skill de prueba, no se distribuye) y tres casos: instalado y OK, no instalado, con error.
- TDD y gate de mutation: N/A. `fact-checker` aplica en cada cierre.

## Tasks

- [x] `task-pipeline-sdd-proveedor-externo-01` (P1) — Contrato `features.sdd.provider`: schemas + template YAML + regla de modos única (lifecycle) + `spec.md`/CU del repo  · depends_on: —
- [ ] `task-pipeline-sdd-proveedor-externo-02` (P1) — Lectores nativos: redacción «modo nativo» y seguir siempre el enlace al CU  · depends_on: task-pipeline-sdd-proveedor-externo-01
- [ ] `task-pipeline-sdd-proveedor-externo-03` (P1) — Invocación del provider (arranque/cierre, contrato `phase/task/plan`), degradación y stub de verificación  · depends_on: task-pipeline-sdd-proveedor-externo-02
- [ ] `task-pipeline-sdd-proveedor-externo-04` (P2) — Activación y salud en `/task-init` y `/doctor`  · depends_on: task-pipeline-sdd-proveedor-externo-02
- [ ] `task-pipeline-sdd-proveedor-externo-05` (P3) — Docs, portal y release  · depends_on: task-pipeline-sdd-proveedor-externo-03, task-pipeline-sdd-proveedor-externo-04

## Registro de cambios del plan

- 2026-10-24: creado (plan mode aprobado por el owner).
- 2026-10-24: refinado con `grilling` (3 preguntas, 3 decisiones):
  1. Provider no instalado o que falla → **avisar y no bloquear**; la línea de DoD queda sin marcar hasta que el owner la reconozca.
  2. El pipeline **invoca el provider automáticamente** (no solo lo enlaza en la DoD).
  3. Puntos de invocación: **arranque de tarea** y **cierre** (hueco de `sdd-lint`, entre `mutation` y `fact-checker`), pasándole la ruta de la tarea y la del plan.
  Resueltas sin pregunta: `provider` es un único string no vacío (sin validar formato); Gherkin vuelve a la tarea en `external`; `sdd-lint` y `models.sdd-lint` sin efecto. Decomposición ampliada de 4 a 5 tareas (la invocación es una pieza propia).
- 2026-10-24: `design-review` (Opus, subagente fresco) → 8 hallazgos, **los 8 aceptados** por el owner:
  1. Contrato versionado y experimental `phase=start|close task=<ruta> plan=<ruta>`.
  2. Regla off/native/external escrita una sola vez y enlazada; los lectores nativos solo cambian de redacción (tarea 02 recortada).
  3. «No bloquear» definido: provider ausente/con error = aviso que se reconoce; lo que reporta el provider = aviso, nunca ERROR.
  4. `spec.md` (FR-002 + FR nuevo) y `routing-contrato.md` entran en la tarea 01 (el repo es `sdd: true`).
  5. `/doctor` avisa de `{enabled:true}` sin provider (sigue off) y de provider no instalado (tarea 04).
  6. El enlace a un CU se sigue siempre, sea cual sea el modo (tarea 02).
  7. Stub de provider de prueba (no distribuido) con 3 casos (tarea 03).
  8. Valor de `provider` como texto libre sin comprobar al escribir; «ya activo» reconoce el bloque (tarea 04). Decidido por la sesión por ser rutinario.
  Nota abierta: el plan no nombra un plugin real que motive la integración; se valida el contrato contra el stub y se revisa con el primer provider real.
- 2026-10-24: `scenario-coverage` (Sonnet, subagente fresco) → 22 huecos dentro del alcance y 5 fuera. Incorporados al CU `sdd-proveedor-externo.md` (fuente única). Decisiones del owner:
  1. Contrato `contract=1 phase=… task=… plan=…`, rutas relativas y existentes al invocar (RN-3).
  2. Seguridad: se rechaza un provider que apunta al propio `task-pipeline`; el valor es un único identificador; el riesgo de config hostil se documenta (RN-5). Sin confirmación en la primera invocación.
  3. Reentrada y resultado: propuesta de la sesión aceptada (RN-7); sin timeout propio (RN-8).
  4. **B2 incorporado al alcance**: `phase=close` va antes del auto-commit y de la proyección a GitHub (RN-6). **B1 incorporado**: `/doctor` avisa de artefactos nativos huérfanos, sin migrar ni borrar. B3, B4 y B5 descartados (B5 pasa a «Fuera de alcance» del plan).
  Decididas por la sesión por ser rutinarias: concurrencia N/A (una tarea `active` por plan) y cancelar/reabrir no invoca al provider (RN-9); cambio de nativo a externo manual, sin reofrecer (RN-10); `/sdd-lint` manual en `external` audita y avisa, como con SDD off (RN-4).
