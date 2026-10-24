---
id: task-pipeline-sdd-proveedor-externo-03
package: task-pipeline
plan: sdd-proveedor-externo
status: pending
priority: 1
depends_on: [task-pipeline-sdd-proveedor-externo-02]
estimate: 4h
actual:
issue: 81
created: 2026-10-24
updated: 2026-10-24
---

# Invocación del provider al arrancar y cerrar la tarea (+ degradación y stub)

## Description

En modo `external`, el pipeline invoca la skill del provider al arrancar la tarea y al cerrarla, con un
contrato versionado y experimental. Plan: `.claude/plans/pending/task-pipeline/sdd-proveedor-externo.md`.

## Spec

- **Contrato v1 (experimental)**: `contract=1 phase=start|close task=<ruta> plan=<ruta>`; rutas relativas a la raíz y existentes al invocar (`start` tras mover a `active`; `close` antes de mover a `completed`); `plan=` vacío con aviso si no hay plan legible; el `provider` se pasa como un único identificador (RN-3, RN-5).
- **Reentrada y resultado** (RN-7, RN-8, RN-9): `start` una vez por activación; `close` se reintenta tras un fallo y no se invoca si `mutation` falla; terminar sin error ni reporte = OK; sin respuesta o sin canal = error del provider; cancelar o reabrir no invoca; el pipeline relee la tarea tras cada invocación.
- **Orden de cierre** (RN-6): `phase=close` antes de `fact-checker`, del auto-commit y de la proyección a GitHub; una línea en el lifecycle, sin tocar el comportamiento de esas features.
- Reconocer un aviso = nota en el session log; el pipeline señala la línea de DoD pendiente y no cierra en silencio.
- `docs/guides/task-lifecycle.md` (+ `templates/task-lifecycle.md`): en «Arrancar una tarea», paso de invocación `phase=start`; en «Cerrar una tarea», invocación `phase=close` **tras `mutation`, antes de `fact-checker`** (hueco de `sdd-lint`).
- `plan-task/SKILL.md`: Paso 7.5 pasa a describir ambos modos (native → `sdd-lint`; external → provider `phase=close`).
- `templates/task.md`: línea de DoD «SDD gestionado con `<provider>` (invocado, o "sin cambios" en el session log)» · solo modo external.
- **Degradación**: provider ausente o con error → aviso que el owner reconoce (como un AVISO de `sdd-lint`); lo que reporta el provider → aviso, **nunca ERROR**; no se bloquea el cambio de `status:` del `.md`.
- **Stub de verificación** (skill de prueba, **no se distribuye**) con tres casos: instalado y OK, no instalado, con error. Se define en el session log, no en el plugin.

## Fuera de alcance

- Validar el nombre o el contenido que produce el provider.
- Soportar varios providers o un provider por package.
- Cambiar el comportamiento de GitHub tracking y git-automation más allá de fijar el orden de `phase=close`.

## Scenarios (Gherkin)

Criterios de aceptación (Gherkin) en el caso de uso (fuente única); esta tarea cubre los escenarios de invocación («El provider se invoca al arrancar / al cerrar entre mutation y fact-checker», «Provider no instalado / que falla / sin respuesta», «El provider reporta un problema», «Las rutas pasadas existen», «Tarea sin plan legible», «La invocación lleva la versión», «Provider pasado como único identificador», «Cierre repetido», «Mutation fallida no invoca», «Cierre limpio», «Aviso sin reconocer», «El pipeline relee la tarea», «Cancelar no invoca» y «El orden de close incluye lo que genera el provider en el commit»):

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

El contrato de invocación v1 `contract=1 phase=start|close task=<ruta> plan=<ruta>`, su semántica de degradación y de reentrada, y el orden de cierre, que documenta la tarea 05.

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. Verificación con el stub de provider. -->
- [ ] Escenarios del CU cubiertos por esta tarea verificados con el stub (instalado y OK / no instalado / con error)
- [ ] Spec cumplida; `Provides` disponible para 05
- [ ] **Gate `sdd-lint` superado** — sin ERROR (AVISO se reconoce)
- [ ] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · `features.github-tracking`
- [ ] **SDD** — spec/CU actualizados, o declarado «sin cambios de spec/CU» aquí y en el session log
- [ ] Doc técnica actualizada · `technical-docs`
- [ ] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-03.md` · `context-log`
- [ ] Barrido `grep` reforzado: sin identificadores muertos
