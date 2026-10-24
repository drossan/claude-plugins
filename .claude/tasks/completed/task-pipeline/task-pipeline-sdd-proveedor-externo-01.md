---
id: task-pipeline-sdd-proveedor-externo-01
package: task-pipeline
plan: sdd-proveedor-externo
status: done
priority: 1
depends_on: []
estimate: 3h
actual: 1.5h
issue: 79
created: 2026-10-24
updated: 2026-10-24
---

# Contrato `features.sdd.provider`: schemas, template, regla de modos y specs del repo

## Description

Fija el contrato de config del modo SDD externo y la **única** definición de la regla off/native/external, que
el resto de tareas enlaza. Plan: `.claude/plans/pending/task-pipeline/sdd-proveedor-externo.md`.

## Spec

- `.claude/task-pipeline.schema.json` y `task-pipeline/skills/plan-task/templates/task-pipeline.schema.json`
  (hoy idénticos): `features.sdd` pasa a `oneOf` boolean | objeto `{ enabled: boolean, provider: string }`. Ambos JSON válidos.
- `task-pipeline/skills/plan-task/templates/task-pipeline.yml`: ejemplo **comentado** del bloque con `provider` (no impone nada).
- **Regla de modos escrita una sola vez** en `docs/guides/task-lifecycle.md` (y su copia `templates/task-lifecycle.md`): off / native / external, con la tabla de resolución de RN-1.
- `.claude/specs/task-pipeline/spec.md`: actualizar **FR-002** («donde `features.sdd` esté on» → modo nativo) y añadir un FR nuevo de resolución del modo; enlazar el CU nuevo en «Casos de uso».
- `.claude/specs/task-pipeline/casos-de-uso/routing-contrato.md`: ejemplos con el bloque.
- La regla de modos cubre la tabla completa del CU (incl. `provider` vacío/null/lista/solo espacios, `enabled` ausente o no booleano, claves extra toleradas, `yes`/`[true]`/null → off, YAML ilegible → off con aviso) y el rechazo de un provider que apunta al propio `task-pipeline` (RN-5).
- Los schemas son ayuda de editor: aceptan `provider: ""` y `{enabled:true}`, que en runtime son off; se documenta en el lifecycle para no dar falsa sensación de validación. Ambos schemas siguen byte-idénticos.

## Fuera de alcance

- Implementar o empaquetar ningún plugin SDD externo, ni validar su contenido.
- Cambiar el comportamiento del modo nativo (`sdd: true` queda byte-idéntico).

## Scenarios (Gherkin)

Criterios de aceptación (Gherkin) en el caso de uso (fuente única); esta tarea cubre «Resolución del modo SDD», «El modo nativo no cambia», «Config ilegible no activa SDD» y «Provider que apunta al propio pipeline»:

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

La clave `features.sdd.provider`, los dos schemas actualizados y la regla de modos única del lifecycle, que consumen las tareas 02–05.

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. Verificación por inspección / grep / json.tool / parseo YAML. -->
- [x] Escenarios del CU cubiertos por esta tarea verificados como criterios de aceptación (inspección / `grep` / `python3 -m json.tool` / parseo de ambos YAML)
- [x] Spec cumplida; `Provides` disponible para 02–05
- [x] **Gate `sdd-lint` superado** — sin ERROR (AVISO se reconoce); tras verificar, antes de `fact-checker`
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · `features.github-tracking`
- [x] **SDD** — spec (EARS) + CU actualizados en esta tarea (FR-002, FR nuevo, CU), o declarado «sin cambios de spec/CU» aquí y en el session log
- [x] Doc técnica actualizada (lifecycle + template) · `technical-docs`
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-01.md` · `context-log`
- [x] Barrido `grep` reforzado: sin identificadores muertos
