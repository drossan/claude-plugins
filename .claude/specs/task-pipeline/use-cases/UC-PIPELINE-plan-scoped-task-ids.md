---
id: UC-PIPELINE-plan-scoped-task-ids
package: task-pipeline
status: draft             # draft perpetuo mientras el repo no tenga runner de tests (stack.test-runner: none): sin tests tagueados, un UC no puede pasar a active
trace:
  - task-pipeline/skills/plan-task/SKILL.md
  - task-pipeline/skills/plan-task/templates/task-lifecycle.md
  - docs/guides/task-lifecycle.md
  - task-pipeline/README.md
created: 2026-07-31
updated: 2026-07-31
---

# UC-PIPELINE-plan-scoped-task-ids — Asignar ids de tarea con ámbito de plan

## Intent

Quien descompone un plan obtiene ids de tarea únicos y estables sin coordinarse
con nadie: el correlativo se calcula dentro del plan y, como plan = rama, dos
ramas paralelas nunca compiten por el mismo número al mergear. **La regla que lo
gobierna: el espacio de nombres del id coincide con la unidad de paralelismo (el
plan), nunca con un contador global del package.**

## Actors and trigger

- **Actor:** quien conduce `/plan-task` (humano + orquestador) al descomponer un plan.
- **Trigger:** la creación de cada tarea nueva en el Paso 5 de `/plan-task`
  (incluida la re-planificación in-place de un plan activo).

## Main flow

1. Se determina el `<plan-id>` de la tarea nueva (= `<package>-<name-plan>`).
2. Se recorren TODAS las tareas existentes de ese plan, en TODOS los estados
   (`pending`, `active`, `completed`, `cancelled`).
3. Se toma el máximo correlativo `<nn>` y se asigna `max + 1` — `01` si el plan
   no tiene ninguna — con el formato de ancho fijo por tramos que fija AC5.
4. El id resultante `<plan-id>-<nn>` nombra el fichero (filename = id) y su
   frontmatter `id:`; el campo `plan:` coincide con el `<name-plan>` embebido.

## Alternative flows / errors

- **Plan sin tareas previas** (paso 2): la primera tarea recibe `01`; continúa en
  el paso 4.
- **Correlativos de tareas cerradas o canceladas** (paso 3): cuentan para el
  máximo y nunca se reutilizan — reusar el `<nn>` de una `cancelled` colisionaría
  dentro del propio plan al re-planificar; continúa en el paso 4 dejando el hueco.
- **Histórico con ids legacy** (paso 2): los ids del esquema anterior
  (`<package>-<nnn>`, contador global) no pertenecen a ningún plan — no entran en
  el cómputo y no se renumeran jamás; el histórico mixto es lo esperado y el caso
  continúa en el paso 3.
- **Dos ramas extendiendo el MISMO plan** (paso 3): ambas ven el mismo máximo y
  asignan el mismo `<nn>` — colisión residual conocida que este esquema NO
  previene; el caso termina y la detección diferida vive en `/doctor` (fuera de
  este UC).

## Acceptance criteria (Gherkin)

```gherkin
Feature: UC-PIPELINE-plan-scoped-task-ids — ids de tarea con ámbito de plan

  Scenario: AC1 · la primera tarea de un plan nace con el correlativo 01
    Given un plan "api-bootstrap-foundation" sin ninguna tarea en ningún estado
    When se descompone el plan y se crea su primera tarea
    Then su id es "api-bootstrap-foundation-01"
    And el nombre del fichero coincide con el id

  Scenario: AC2 · el correlativo es el máximo del plan más uno, contando todos los estados
    Given un plan con las tareas "-01" (completed), "-02" (cancelled) y "-03" (pending)
    When se crea la siguiente tarea del plan
    Then su correlativo es "04"
    And ningún correlativo de una tarea completed o cancelled se reutiliza

  Scenario: AC3 · dos planes del mismo package numeran de forma independiente
    Given los planes "api-plan-a" y "api-plan-b" del mismo package, cada uno con tareas propias
    When cada plan crea su siguiente tarea
    Then cada correlativo sale del máximo de SU plan
    And ningún cómputo usa un contador global del package

  Scenario: AC4 · los ids legacy conviven sin renumerarse ni contar
    Given un package "api" con tareas legacy "api-001" a "api-012" del esquema global anterior
    When se crea la primera tarea de un plan nuevo del package
    Then la tarea nueva recibe el correlativo "01" dentro de su plan
    And ningún id legacy se renumera ni entra en el cómputo

  Scenario Outline: AC5 · formato del correlativo según el máximo del plan
    Given un plan cuyo máximo correlativo es <máximo>
    When se crea la siguiente tarea
    Then el sufijo del id es <siguiente>

    Examples:
      | máximo  | siguiente |
      | ninguno | 01        |
      | 09      | 10        |
      | 99      | 100       |
```

## Out of scope

- La unicidad del `<plan-id>` y la restricción del `<name-plan>` (kebab-case sin
  sufijo numérico ambiguo, parseo inequívoco del id) → «Layout de directorios» de
  `docs/guides/task-lifecycle.md`.
- La detección de ids duplicados — el residual «dos ramas del mismo plan» que
  este esquema no previene, y el «mismo `<name-plan>` en paralelo» — → categoría
  «ids de tarea/plan duplicados» de `task-pipeline/skills/doctor/SKILL.md`.
- La proyección del id a GitHub (issue/sub-issue) → «GitHub tracking (opcional)»
  de `task-pipeline/README.md`.

## Notes / links

- El esquema sustituyó a un contador global de package (`<package>-<nnn>`) que
  provocaba conflictos add/add silenciosos al mergear ramas paralelas. El porqué
  completo, la disciplina de equipo (una rama = un plan) y cómo resolver una
  colisión están en el README del plugin → «Trabajo en equipo y colisiones de id».
- El formato del correlativo (ancho fijo por tramos: 2 dígitos, 3 a partir de la
  tarea 100) preserva el orden lexicográfico; **AC5 es su única spec** — el main
  flow lo referencia a propósito para no duplicarlo.

## Change log

- 2026-07-31: creado (`draft`) fuera de plan — piloto de dogfooding del flag
  `features.use-cases` en el repo source del plugin. Permanece en `draft` mientras
  el repo no tenga runner de tests que taguear (`stack.test-runner: none`).
- 2026-07-31: design-review adversaria — `trace:` ampliado a los 4 ficheros donde
  se edita el comportamiento; `adr:` retirado del frontmatter; detectada una
  contradicción main flow ↔ AC5 en el formato del correlativo.
- 2026-07-31: el owner restaura la estructura narrativa completa (Actors and
  trigger, Main flow, Alternative flows) revirtiendo el recorte de la review; la
  contradicción no vuelve — el main flow ahora **referencia** AC5 para el formato
  en vez de duplicarlo (lección del hallazgo: referenciar, no repetir).
