---
id: task-pipeline-sdd-proveedor-externo-04
package: task-pipeline
plan: sdd-proveedor-externo
status: pending
priority: 2
depends_on: [task-pipeline-sdd-proveedor-externo-02]
estimate: 3h
actual:
issue: 82
created: 2026-10-24
updated: 2026-10-24
---

# Activación y salud del SDD externo en `/task-init` y `/doctor`

## Description

`/task-init` y `/doctor` ofrecen elegir SDD nativo o externo al activar, y `/doctor` vigila la salud del modo
externo. Plan: `.claude/plans/pending/task-pipeline/sdd-proveedor-externo.md`.

## Spec

- `task-init/SKILL.md` (Paso 1.6) y `doctor/SKILL.md` (cat. 2 + «Activación SDD»): `AskUserQuestion` con **nativo / externo / no**; si externo, pide `provider` como **texto libre** (no se comprueba al escribir). Nunca se activa en silencio; con diff + aprobación.
- «Ya activo» reconoce también el bloque en modo `external` (no reofrece).
- Sin canal para preguntar → no escribe nada y reporta que SDD no se activó.
- `doctor` cat. 9 (scaffolding SDD): solo en modo nativo; en `external` no exige plantillas.
- `doctor` avisa de: (a) `{ enabled: true }` sin `provider` (sigue off en runtime, intención de activar) y de **claves desconocidas** bajo `features.sdd` (p. ej. `provder`); (b) provider configurado **no instalado**, distinguiendo plugin ausente de skill ausente (drift); (c) **artefactos nativos huérfanos** (spec/CU/ADR) en un repo `external`, sin migrar ni borrar. Solo reporta, no escribe.
- La entrada de `provider` rechaza vacío/solo espacios/cancelar sin escribir y entrecomilla valores con `: ` o `#` para no romper el YAML; `features.sdd` malformado previo (`yes`) se trata como off y se ofrece la activación.
- El cambio de nativo a externo es manual; la guarda «ya activo» no lo reofrece (RN-10). Sin canal para preguntar, `/doctor` sigue siendo solo-reporte.

## Fuera de alcance

- Comprobar la existencia del provider al escribir la config.
- Migrar, borrar o convertir artefactos nativos: solo se avisa.
- Invocar al provider (tarea 03).

## Scenarios (Gherkin)

Criterios de aceptación (Gherkin) en el caso de uso (fuente única); esta tarea cubre «Activación guiada de external», «Activación sin canal para preguntar», «Repo ya en external no se reofrece», «Entrada del provider en la activación guiada», «features.sdd malformado antes de activar» y los de `/doctor` («bloque sin provider», «provider no instalado», «clave desconocida», «plugin ausente de skill ausente», «external sin plantillas nativas» y «artefactos nativos huérfanos»):

- [.claude/specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md](../../../specs/task-pipeline/casos-de-uso/sdd-proveedor-externo.md)

## Provides

—

## Definition of Done

<!-- Stack none: TDD y gate de mutation N/A. -->
- [ ] Escenarios del CU cubiertos por esta tarea verificados (leyendo las skills / simulando los casos)
- [ ] Spec cumplida
- [ ] **Gate `sdd-lint` superado** — sin ERROR (AVISO se reconoce)
- [ ] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · `features.github-tracking`
- [ ] **SDD** — spec/CU actualizados, o declarado «sin cambios de spec/CU» aquí y en el session log
- [ ] Doc técnica actualizada · `technical-docs`
- [ ] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-proveedor-externo-04.md` · `context-log`
- [ ] Barrido `grep` reforzado: sin identificadores muertos
