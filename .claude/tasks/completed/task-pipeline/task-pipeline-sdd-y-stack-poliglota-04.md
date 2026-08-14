---
id: task-pipeline-sdd-y-stack-poliglota-04
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 1
depends_on: []
estimate: 3h
actual: ~50m
issue: 41                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#41
created: 2026-08-13
updated: 2026-08-14
---

# Set de plantillas SDD (spec / caso-de-uso / ADR + índice)

## Description

Añade las **tres plantillas SDD** que #36 propone subir al plugin, como **semillas** en
`skills/plan-task/templates/`, basadas en estándares vigentes. Es la base de la capa SDD; el flag (05) y el
flujo (06) se cablean después. **El plugin envía plantillas, no decisiones**: sin `ADR-0000` relleno (eso
es contenido del consumidor). Fija además la **lista canónica de nombres/ubicaciones** de plantillas SDD en
**un** sitio, para que la tarea 07 (doctor) la referencie (F7c).

## Spec

- **`templates/spec.md`** (GitHub Spec Kit + EARS): user stories P1/P2/P3 (testable-independiente) +
  requisitos funcionales en **EARS** (`El sistema DEBERÁ…`, `Cuando <disparador>…`, `Mientras <estado>…`,
  `Donde <feature>…`, `Si <no deseado>, entonces…`) + criterios de éxito `SC-00x` + convención
  **`[NECESITA ACLARACIÓN: …]`** + enlace a su(s) CU. Se materializa en `.claude/specs/<pkg>/spec.md`.
- **`templates/caso-de-uso.md`** (Cockburn fully-dressed + Gherkin): interesados, precondiciones, garantías
  mínimas/éxito, escenario principal numerado, extensiones (3a/3b), reglas + **criterios de aceptación en
  Gherkin**. Se materializa en `.claude/specs/<pkg>/casos-de-uso/<id>.md`. **Nota anti-duplicación: el
  Gherkin vive AQUÍ** (única fuente; la tarea lo enlaza — se cablea en 06). **El bloque Gherkin del CU
  aplica/remite las MISMAS reglas de disciplina** que `templates/task.md` (declarativo, 1 escenario = 1
  comportamiento, G/W/T, `Scenario Outline` para fronteras) — con SDD on el CU es la única fuente de ese
  Gherkin, así que no puede degradar la calidad que hoy exige `task.md`.
- **`templates/adr.md`** (MADR 4.0.0): Estado · Decisores · Contexto · Decision drivers · Opciones
  consideradas · Resultado + Confirmación · Consecuencias. **Documenta los 5 estados** de MADR 4.0.0
  (`proposed`/`accepted`/`rejected`/`deprecated`/`superseded`), no solo 2. **Nota de status fiel a la
  fuente** (`accepted` solo si la decisión está cerrada; si no, `proposed`). Se materializa en
  `.claude/specs/adr/NNNN-titulo.md`.
- **`templates/adr-index.md`**: índice ADR vacío con la convención de numeración `NNNN-titulo.md` desde
  `0001`. **Sin ADR-0000 relleno.**
- **Lista canónica**: en `templates/README.md` (mapeo), fija los nombres + ubicaciones destino de las
  plantillas SDD, marcadas **gated por `features.sdd`**; es la lista que 07 (doctor) referencia.

## Fuera de alcance

- Enviar un **ADR-0000 relleno** ni ningún contenido SDD de un package (el plugin no autogenera contenido).
- Cablear el **flag** (tarea 05) ni el **flujo/DoD** (tarea 06).
- El **seed del sitio VitePress** (diferido a follow-up).

## Scenarios (Gherkin)

```gherkin
Feature: Plantillas SDD como semillas del plugin

  Scenario: spec.md trae Spec Kit + EARS
    Given `templates/spec.md`
    Then contiene user stories P1/P2/P3, patrones EARS de requisitos, criterios `SC-00x`
    And la convención `[NECESITA ACLARACIÓN: …]` y un enlace a su CU

  Scenario: el CU es el único hogar del Gherkin
    Given `templates/caso-de-uso.md`
    Then contiene las secciones Cockburn fully-dressed + un bloque de aceptación Gherkin
    And una nota de que el Gherkin vive solo en el CU (anti-duplicación)

  Scenario: adr.md es MADR 4.0.0 con status fiel
    Given `templates/adr.md`
    Then tiene las secciones MADR 4.0.0 y la nota de status fiel a la fuente
    And `templates/adr-index.md` documenta `NNNN` desde `0001` sin ADR-0000 relleno

  Scenario: lista canónica para doctor
    Given el set de plantillas SDD
    When busco la lista de nombres/ubicaciones de plantillas SDD
    Then existe una única lista canónica (en `templates/README.md`) que la tarea 07 puede referenciar

  Scenario: el mapeo de plantillas incluye las nuevas
    Given `templates/README.md`
    Then mapea spec/caso-de-uso/adr/adr-index a sus destinos `.claude/specs/...`, gated por `features.sdd`

  Scenario: adr.md documenta el ciclo completo de estados MADR
    Given `templates/adr.md`
    Then lista los 5 estados de MADR 4.0.0 (proposed/accepted/rejected/deprecated/superseded), no solo 2

  Scenario: el bloque Gherkin del CU hereda la disciplina de task.md
    Given `templates/caso-de-uso.md`
    Then su bloque de aceptación Gherkin aplica/remite las mismas reglas (declarativo, 1 escenario = 1
         comportamiento, `Scenario Outline`) que `templates/task.md`
```

## Provides

Las plantillas `spec.md`/`caso-de-uso.md`/`adr.md`/`adr-index.md` + las convenciones de ubicación
(`.claude/specs/<pkg>/spec.md`, `.claude/specs/<pkg>/casos-de-uso/<id>.md`, `.claude/specs/adr/NNNN-*.md`) +
la **lista canónica** de plantillas SDD que leen las tareas 05 (flag), 06 (flujo) y 07 (doctor).

## Definition of Done

<!-- TSDoc N/A (Markdown). TDD/mutation N/A (stack none). -->
- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [x] Spec cumplida; `Provides` (plantillas + lista canónica) disponible para 05/06/07
- [x] Gate de `fact-checker` superado — en especial "sin ADR-0000 relleno" y "Gherkin solo en el CU" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: las 4 plantillas + mapeo/lista canónica en `templates/README.md` · technical-docs
- [x] Entrada `### Added` en `CHANGELOG.md` atribuible a esta feature (la consolida la tarea 08) · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-04.md` · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos
