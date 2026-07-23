---
id: task-pipeline-collision-free-ids-01
package: task-pipeline
plan: collision-free-ids
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 2h
actual: 1h
created: 2026-07-23
updated: 2026-07-23
---

# Esquema de id plan-scoped en plantillas + task-lifecycle

## Description

Definir el nuevo esquema de id `<task-id> = <plan-id>-<nn>` (correlativo DENTRO del plan desde `01`) en las
plantillas semilla y en el ciclo de vida canónico, con la **regla explícita** "NO es un contador global del
package". Es la base de todo el plan D1: -02 (asignación), -03 (detección) y -05 (materializados) dependen
de que el esquema esté fijado aquí. No toca `plan-task/SKILL.md` (eso es -02).

## Spec

- **`templates/task-lifecycle.md`** (`task-pipeline/skills/plan-task/templates/`): sustituir la definición
  del `<task-id>` (hoy `<package>-<nnn>`, "contador monótono por package") por
  `<task-id> = <plan-id>-<nn>`, con `<plan-id> = <package>-<name-plan>` y `<nn>` correlativo **dentro del
  plan** desde `01`. Añadir la regla "no contador global del package" y una nota de convivencia con ids
  **legacy** opacos (`task-pipeline-001..012`), que **no** se renumeran.
- **Acotar `<name-plan>` para un parseo inequívoco (T-G).** El esquema debe fijar cómo se separa `<plan-id>`
  de `<nn>` para que -02 (contar) y -03 (resolver filenames) sean deterministas: `<name-plan>` en
  kebab-case **sin sufijo numérico ambiguo**, y/o definir que `<nn>` es el **último segmento de 2 dígitos**.
  Ejemplo del fallo: `name-plan = phase-01` → `task-pipeline-phase-01-01` (irrecuperable por parseo).
- **Formato de `<nn>`**: 2 dígitos con cero a la izquierda desde `01`; declarar qué pasa en la tarea 100
  (3 dígitos o tope documentado) para no romper el orden lexicográfico.
- **Coherencia `plan:` ↔ `id`**: como `id` embebe el `<name-plan>`, la plantilla nota que el campo `plan:`
  del frontmatter y el `<name-plan>` embebido en `id` deben coincidir.
- **`templates/task.md`**: `id:` del frontmatter y ejemplos usan el nuevo formato.
- **`templates/plan.md`**: la sección **Tasks** usa el nuevo formato en sus ejemplos.
- **`templates/HOW-TO-START-A-TASK.md`** y **`templates/README.md`**: cualquier ejemplo/mención del esquema,
  coherente con el nuevo.
- **NO** tocar aún las copias materializadas del repo (eso es -05) ni `plan-task/SKILL.md` (eso es -02).

## Scenarios (Gherkin)

<!-- stack:none → criterios de aceptación verificables por inspección / grep. -->

```gherkin
Feature: Esquema de id plan-scoped en las plantillas

  Scenario: La plantilla del ciclo de vida define el id plan-scoped
    Given templates/task-lifecycle.md tras esta tarea
    When busco la definición de <task-id>
    Then dice <task-id> = <plan-id>-<nn> con <nn> correlativo dentro del plan desde 01
    And declara explícitamente que NO es un contador global del package

  Scenario: Convivencia con ids legacy documentada
    Given la definición del id en la plantilla
    When la leo
    Then una nota aclara que los ids legacy (task-pipeline-001..012) no se renumeran y conviven

  Scenario: El esquema acota name-plan para que el id sea inequívoco (T-G)
    Given la definición de <task-id> en las plantillas tras esta tarea
    When leo las reglas del <name-plan>
    Then exige kebab-case sin sufijo numérico ambiguo (o define <nn> como el último segmento de 2 dígitos)
    And un ejemplo muestra por qué un name-plan que acaba en número rompe el parseo

  Scenario: Coherencia entre el campo plan: y el name-plan embebido en id
    Given templates/task.md tras esta tarea
    When leo el frontmatter y su comentario
    Then aclara que plan: y el <name-plan> embebido en id deben coincidir

  Scenario Outline: Formato de <nn> en fronteras
    Given un plan con <n> tareas
    When derivo el <nn> de la última
    Then el formato es <formato>

    Examples:
      | n   | formato |
      | 1   | 01      |
      | 9   | 09      |
      | 100 | 100     |

  Scenario Outline: Las plantillas usan el nuevo formato en sus ejemplos
    Given la plantilla <plantilla> tras esta tarea
    When inspecciono sus ejemplos de id
    Then usan el formato <plan-id>-<nn> y no <package>-<nnn> como esquema vivo

    Examples:
      | plantilla                |
      | task.md                  |
      | plan.md                  |
      | HOW-TO-START-A-TASK.md   |
      | README.md                |

  Scenario: Sin esquema viejo vivo en las plantillas
    Given el árbol de templates/ tras esta tarea
    When ejecuto grep del contador global <package>-<nnn> como definición de esquema
    Then no aparece como esquema vigente (solo, si acaso, citado como "esquema anterior")
```

## Provides

- El esquema de id canónico `<task-id> = <plan-id>-<nn>`, la regla anti-contador-global y **la acotación de
  `<name-plan>`** (parseo inequívoco), consumidos por -02 (asignación), -03 (detección) y -05 (materializados).

## Definition of Done

- [x] Tests TDD — **N/A** (stack `none`).
- [x] Cada escenario Gherkin verificado como criterio de aceptación (inspección + `grep` de plantillas).
- [x] Spec cumplida; el esquema y la acotación de `<name-plan>` disponibles para -02/-03/-05.
- [x] Gate de mutation — **N/A** (`stack.mutation-tool: none`).
- [x] Gate de `fact-checker` superado (8/8 VERIFICADO). **No-negociable.**
- [x] Doc: **TSDoc N/A**; **doc técnica** (las plantillas SON la doc); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-01.md`.
- [x] Barrido `grep` reforzado sin identificadores muertos (allowlist intacta).
