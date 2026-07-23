---
id: task-pipeline-collision-free-ids-03
package: task-pipeline
plan: collision-free-ids
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 2
depends_on: [task-pipeline-collision-free-ids-01]
estimate: 2h
actual:
created: 2026-07-23
updated: 2026-07-23
---

# Check de ids duplicados en `/doctor`

## Description

Red de seguridad: que `/doctor` **detecte** dos ficheros que comparten el mismo `id:` (el residual honesto
del esquema — mismo nombre de plan, o dos ramas extendiendo el mismo plan). Es detección, no prevención.
Depende de -01 (esquema + acotación de name-plan). Respeta las dos fases de `doctor` (Fase 1 read-only;
Fase 2 con diff + aprobación) y su modelo de Propiedad (esto es **repo-owned**).

## Spec

- **`task-pipeline/skills/doctor/SKILL.md`** — **Fase 1**: nueva categoría (repo-owned) "ids duplicados":
  recorrer `.claude/tasks/**` y `.claude/plans/**` y reportar cualquier `id:` que aparezca en **más de un
  fichero** (nombrando **todos** los implicados, no solo dos). Cubre:
  - **ids de tarea** duplicados (el caso `013.md` de dos ramas), **incluido** el mismo id en **dos carpetas
    de estado distintas** (`pending/` y `completed/` tras un merge).
  - **ids de plan** duplicados (dos ficheros de plan con el mismo `id`: mismo `<name-plan>`, dos ramas).
  - **filename ≠ `id:`** del propio fichero (drift que rompe el modelo "filename = id").
- **Robustez de parseo**: un `.md` **sin `id:`** o con **frontmatter YAML roto** se reporta como **no
  parseable** (aviso) y el check **sigue** — no aborta ni inventa un duplicado (paralelo a la regla de
  "Config malformada" que doctor ya tiene para `task-pipeline.yml`).
- **Fase 2**: como el arreglo **no es mecánico** (renombrar un id rompe `depends_on`/links), se trata como
  **aviso** (regla 4 de doctor): mostrar los ficheros en conflicto y **sugerir** la resolución sin
  auto-escribir. **Aviso extra (T-H)**: si la tarea en conflicto **ya tiene `issue:`** (proyectada en D2),
  advertir que renumerar desincroniza `.md`↔issue (hay que re-proyectar / actualizar la issue).
- **Idempotencia**: repo **sano** (sin ids repetidos) → **no** se reporta nada (sin falso positivo). Los ids
  legacy `task-pipeline-001..012` son únicos entre sí → no lo disparan.

## Scenarios (Gherkin)

```gherkin
Feature: Detección de ids de tarea/plan duplicados en /doctor

  Scenario: doctor reporta dos ficheros de tarea con el mismo id
    Given un repo adoptado con dos ficheros de tarea que comparten id: task-pipeline-foo-01
    When corro /doctor
    Then la Fase 1 reporta el id duplicado y nombra ambos ficheros
    And la Fase 2 lo trata como aviso (sugerencia de resolución), sin auto-editar

  Scenario: doctor reporta dos planes con el mismo id
    Given dos ficheros de plan que comparten id: task-pipeline-foo (mismo name-plan, dos ramas)
    When corro /doctor
    Then reporta el id de plan duplicado y nombra ambos ficheros

  Scenario: Mismo id en dos carpetas de estado distintas
    Given task-pipeline-foo-03.md presente en pending/ y en completed/ (residuo de merge)
    When corro /doctor
    Then reporta el id duplicado entre estados

  Scenario: 3 o más ficheros con el mismo id se nombran todos
    Given tres ficheros que comparten un id
    When corro /doctor
    Then el reporte nombra los tres

  Scenario: Un fichero cuyo nombre no coincide con su id:
    Given una tarea guardada como foo-07.md pero con id: foo-09 en el frontmatter
    When corro /doctor
    Then reporta la incoherencia filename↔id como aviso

  Scenario: Frontmatter roto o sin id: no rompe el check
    Given un repo adoptado con una tarea sin id: (o con YAML inválido)
    When corro /doctor
    Then ese fichero se reporta como no parseable (aviso) y el check sigue
    And no aborta ni da un falso duplicado

  Scenario: Aviso de desincronización si la tarea duplicada ya está proyectada (T-H)
    Given un id duplicado donde una de las tareas ya tiene issue: (D2)
    When /doctor propone renumerar para resolver
    Then advierte que renumerar desincroniza el .md de su issue y hay que re-proyectar

  Scenario: doctor no da falso positivo en un repo sano
    Given un repo adoptado sin ids repetidos
    When corro /doctor
    Then no se reporta ningún id duplicado

  Scenario: Los ids legacy no disparan el check
    Given un repo con task-pipeline-001..012 (todos únicos)
    When corro /doctor
    Then no se reporta duplicado por los ids legacy
```

## Provides

- —

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado corriendo `/doctor` sobre un repo de prueba con drift inyectado y
      sobre uno sano.
- [ ] Spec cumplida; respeta las dos fases y la Propiedad de doctor; robusto ante frontmatter roto.
- [ ] Gate de mutation — **N/A**.
- [ ] Gate de `fact-checker` superado. **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (el SKILL); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-03.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos.
