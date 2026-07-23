---
id: task-pipeline-docs-portal-and-tracking-02
package: task-pipeline
plan: docs-portal-and-tracking
status: pending
priority: 1
depends_on: []
estimate: 1.5h
actual:
issue: 13                 # SUB-ISSUE (padre #11)
created: 2026-07-23
updated: 2026-07-23
---

# Alinear la documentación con el código (5 hallazgos) + bump `0.12.1` + CHANGELOG

## Description

Corregir los 5 hallazgos de drift docs↔código de la auditoría (2026-07-23). Cuatro son **repo-consumer**;
**uno es plugin-source** (`plan-task/SKILL.md` description) → al tocar el plugin, la disciplina de release
(`CLAUDE.md`) exige **bump `0.12.0 → 0.12.1`** en `plugin.json` + entrada en `CHANGELOG.md`. **No** se toca el
template genérico (`skills/plan-task/templates/task-lifecycle.md`): el drift está en la **copia del repo**.

## Spec

- **[H1, README raíz]** `README.md` árbol de estructura: añadir `pipeline-usage/SKILL.md` (9 skills) y
  `hooks/caveman.sh`; el comentario de `hooks.json` debe citar **ambos** eventos (`SessionStart→bootstrap.sh`
  y `UserPromptSubmit→caveman.sh`).
- **[H2, task-lifecycle copia]** `docs/guides/task-lifecycle.md`: sustituir la ramificación desde `dev` por
  **`main` es la rama de integración**; marcar los comandos `pnpm/Vitest/Stryker/TSDoc/changeset` como
  **N/A en este repo (`stack: none`)** o adaptarlos, sin borrar el esqueleto genérico. **NO** tocar el
  template origen.
- **[H3, CLAUDE.md]** aclarar el shorthand «`stack: none`» → describir el `stack:` real (`language: other` +
  `*: none`) para que no induzca a un `grep "stack: none"` fallido.
- **[H4, plugin-source]** `task-pipeline/skills/plan-task/SKILL.md` description: incluir
  `design-review`/`scenario-coverage`/`fact-checker` en el pipeline que orquesta.
- **[H5, README raíz]** `README.md` L31: el ejemplo de pin no debe usar `@v0.1.0` (versión antigua) — usar un
  placeholder claro o la versión vigente.
- **[Release]** `plugin.json` → `0.12.1`; `CHANGELOG.md` → entrada `## [0.12.1]` (Keep a Changelog),
  docs-only, coherente con `plugin.json` y con la description de `marketplace.json`/`plugin.json`.

## Scenarios (Gherkin)

```gherkin
Feature: Documentación alineada con el estado real del repo

  Scenario: el árbol del README refleja las 9 skills y ambos hooks
    Given el árbol de estructura del README raíz desactualizado
    When se alinea con skills/ y hooks/ reales
    Then el árbol lista las 9 skills incluida pipeline-usage
    And lista caveman.sh además de bootstrap.sh
    And el comentario cita los dos eventos de hooks.json

  Scenario: la guía canónica del repo usa la rama de integración real
    Given la guía que ramifica desde "dev"
    When se tailora a este repo
    Then la guía indica main como rama de integración
    And no instruye "git switch dev"

  Scenario: la guía no exige un stack que el repo no tiene
    Given la guía con comandos pnpm/Vitest/Stryker/TSDoc/changeset como obligatorios
    When se tailora al stack real (none)
    Then esos comandos quedan marcados N/A o adaptados, sin romper el esqueleto genérico

  Scenario: el template genérico del plugin queda intacto
    Given el drift vive en la copia del repo
    When se corrige la copia
    Then skills/plan-task/templates/task-lifecycle.md no cambia (grep sin diff)

  Scenario: la description de plan-task nombra el pipeline completo
    Given la description que omite design-review/scenario-coverage/fact-checker
    When se corrige el frontmatter de plan-task/SKILL.md
    Then la description incluye esas tres fases

  Scenario: tocar el plugin sube la versión y el CHANGELOG
    Given plugin.json en 0.12.0 y un cambio en un fichero plugin-source
    When se cierra el fix del plugin
    Then plugin.json es 0.12.1
    And CHANGELOG.md tiene una entrada 0.12.1 coherente con esa versión

  Scenario: el barrido de cierre no deja afirmaciones falsas
    Given los docs corregidos
    When se hace el grep de honestidad de cierre
    Then no quedan símbolos inexistentes ni identificadores renombrados vivos
    But se conserva la allowlist legítima (atribución a Matt Pocock; CHANGELOG ≤ 0.8.1)

  Scenario: CLAUDE.md describe el stack real, no un literal "stack: none" (H3)
    Given CLAUDE.md afirmando literalmente que el YAML "declara stack: none"
    When se corrige el hallazgo H3
    Then CLAUDE.md describe stack.language: other + package-manager/test-runner/mutation-tool: none
    And un grep de "stack: none" ya no induce a un match inexistente

  Scenario: el ejemplo de pin no cita una versión antigua (H5)
    Given README L31 con el ejemplo @v0.1.0
    When se corrige el hallazgo H5
    Then el ejemplo usa un placeholder claro o la versión vigente
    And no queda ninguna referencia a @v0.1.0

  Scenario: la description de marketplace.json queda coherente con la del plugin
    Given plugin.json y marketplace.json con descriptions que deben concordar
    When se cierra el bump a 0.12.1
    Then la description de marketplace.json es coherente con la de plugin.json
    And ninguna de las dos afirma un pipeline distinto del real

  Scenario: la entrada 0.12.1 no sobre-declara features de repo como si fueran del plugin
    Given que el único cambio plugin-source es la description de plan-task/SKILL.md
    When se redacta la entrada [0.12.1] del CHANGELOG
    Then describe el fix docs-only del plugin
    And no atribuye al plugin el website/ ni la activación de github-tracking (que son del repo consumidor)
```

## Provides

- Docs canónicas (README, task-lifecycle, CLAUDE.md) **alineadas** → base fiable a la que la web (`-04`)
  puede **enlazar** sin heredar drift. Versión del plugin en `0.12.1` (el tag que dispara el deploy #8).

## Definition of Done

- [ ] Los 5 hallazgos corregidos (H1-H5) verificables por inspección/grep.
- [ ] `plugin.json` = `0.12.1` + entrada `CHANGELOG.md [0.12.1]` coherente (incl. `marketplace.json` si aplica).
- [ ] Template genérico **no** tocado (grep sin diff).
- [ ] Barrido `grep` de cierre limpio; allowlist legítima intacta.
- [ ] Gate de `fact-checker` superado — no-negociable.
- [ ] Proyección de estado a GitHub al cerrar — best-effort.
- [ ] Histórico de la tarea (`.claude/context/…`) actualizado.
- [ ] N/A (`stack: none`): TDD, tests, gate de mutation, TSDoc, `pnpm changeset` (el CHANGELOG es manual aquí).
