---
id: task-pipeline-collision-free-ids-10
package: task-pipeline
plan: collision-free-ids
status: done             # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-collision-free-ids-07, task-pipeline-collision-free-ids-08, task-pipeline-collision-free-ids-12]
estimate: 3h
actual: 35min
created: 2026-07-23
updated: 2026-07-23
---

# Reconciliación best-effort md↔GitHub en `/doctor`

## Description

Red de seguridad del tracking: que `/doctor` **detecte** el drift entre los `.md` (fuente de verdad) y su
proyección GitHub, y ofrezca **re-proyectar desde el `.md`**. Depende de -07/-08/-12 (necesita conocer el
ciclo de vida del padre que fija `-12`). Riesgo aceptado **C3**: esto es **best-effort**, NO un sync
garantizado — el SKILL debe decirlo. También cubre el **falso positivo del flag ausente** (T-E) que el
owner quiere evitar. Respeta las dos fases de doctor y su Propiedad (el `.md` manda).

## Spec

- **`task-pipeline/skills/doctor/SKILL.md`** — **Fase 1, categoría de config (T-E)**: `features.github-tracking`
  **ausente NO es drift** (default off = opt-in, igual que `caveman`); doctor puede **ofrecerlo comentado**
  como nicety, **nunca** reportarlo como problema. El hook/skill que lo consume es lógica del plugin.
- **Fase 1, categoría de reconciliación** (solo si `github-tracking.enabled` **y** `gh` disponible/authed):
  detectar drift md↔GitHub, best-effort:
  - `.md` de tarea `done` (o `cancelled`) con su issue **open**.
  - `.md` de **plan** `completed` con su issue **padre open** (mirror del cierre que fija `-12`).
  - `.md` con `issue: <n>` cuyo número **no existe** (borrada) o resuelve a un **repo distinto** del `repo`
    de referencia (config o `gh repo view`) — aclarar que "otro repo" solo es detectable con esa referencia.
  - Tarea `.md` **sin** `issue:` con el flag on (proyección pendiente).
  - **Huérfanas (I3)**: sub-issue bajo el padre del plan **sin** `.md` que la gobierne.
- **Fase 2**: re-proyectar **desde el `.md`** (crear la que falta, cerrar la que quedó open) con **diff +
  aprobación**, problema a problema. Lo no mecánico (huérfana, `repo` cambiado, número inexistente) →
  **aviso**, no auto-edición.
- **Degradación (4 casos)**: flag off / sin red / repo no-GitHub / **flag on pero `gh` sin auth** → la
  categoría de reconciliación **se salta con gracia** (aviso, no crash); doctor sigue con sus checks locales.
- **Contradicción off↔huérfanas (honesta)**: con el flag off la categoría no corre → **no** detecta
  huérfanas. Resolver una de dos y **documentarlo** (coordinado con `-11`): (a) la detección de huérfanas
  corre igualmente si hay `issue:` en `.md`; **o** (b) la doc obliga a reconciliar **antes** de desactivar.
- **Límite explícito (C3)** en el SKILL: best-effort — no maneja de forma garantizada paginación (tope 100
  sub-issues/padre), rate-limit ni auth caída; ante duda, **reporta** y deja la decisión al humano.

## Scenarios (Gherkin)

```gherkin
Feature: Reconciliación best-effort md↔GitHub en /doctor

  Scenario: github-tracking ausente NO es drift (T-E)
    Given un repo adoptado sin la clave features.github-tracking
    When corro /doctor
    Then NO se reporta como problema (default off, opt-in como caveman)
    And a lo sumo se OFRECE comentado como nicety

  Scenario: Flag on y proyección consistente → sin falso positivo
    Given el flag on y todas las issues alineadas con sus .md
    When corro /doctor
    Then no se reporta ningún drift md↔GitHub

  Scenario: Detecta un .md done con issue abierta
    Given el flag on y una tarea done cuya issue sigue open
    When corro /doctor
    Then reporta el drift y ofrece cerrar la issue (diff + aprobación)

  Scenario: Detecta un plan completed con su issue padre abierta
    Given el flag on y un plan completed cuyo padre sigue open
    When corro /doctor
    Then reporta el drift del padre

  Scenario: Detecta issue: inexistente
    Given una tarea con issue: 99999 que no existe en el repo
    When corro /doctor
    Then reporta el drift como aviso (no auto-edita)

  Scenario: Detecta tarea sin proyectar con el flag on
    Given el flag on y una tarea sin issue:
    When corro /doctor
    Then reporta la proyección pendiente y ofrece crearla

  Scenario: Detecta una sub-issue huérfana
    Given el flag on y una sub-issue bajo el padre sin .md que la gobierne
    When corro /doctor
    Then reporta la huérfana como aviso (best-effort, no auto-edita)

  Scenario Outline: Degradación con gracia
    Given github-tracking en estado <estado>
    When corro /doctor
    Then la categoría de reconciliación no corre / se salta con aviso
    And doctor completa el resto de checks locales sin fallar

    Examples:
      | estado                       |
      | flag off                     |
      | flag on pero sin red         |
      | flag on pero gh sin auth     |
      | repo no-GitHub               |

  Scenario: Tras desactivar el flag, la contradicción de huérfanas está resuelta/documentada
    Given el flag pasó de on a off y quedaron issues huérfanas
    When corro /doctor
    Then O bien la detección de huérfanas corre igualmente (hay issue: en .md)
    Or el comportamiento remite a la doc (-11): reconciliar ANTES de desactivar

  Scenario: El SKILL declara el límite best-effort
    Given doctor/SKILL.md tras esta tarea
    When leo la categoría de reconciliación
    Then dice explícitamente que es best-effort y que ante duda reporta, sin prometer consistencia fuerte
```

## Provides

- —

## Definition of Done

- [x] Tests TDD — **N/A** (stack `none`).
- [x] Escenarios verificados por inspección + `grep` del SKILL; correr `/doctor` con drift/gh en vivo =
      NO VERIFICABLE reproducible (skill model-driven). Sin-falso-positivo/flag-off por gating condicional.
- [x] Spec cumplida; T-E sin falso positivo; límite best-effort declarado (C3); respeta fases y Propiedad.
- [x] Gate de mutation — **N/A**.
- [x] Gate de `fact-checker` superado (9/9 VERIFICADO; e2e en vivo NO VERIFICABLE, reconocido). **No-negociable.**
- [x] Doc: **TSDoc N/A**; **doc técnica** (el SKILL); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-10.md`.
- [x] Barrido `grep` reforzado sin identificadores muertos.
