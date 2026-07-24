---
id: task-pipeline-github-tracking-enrichment-05
package: task-pipeline
plan: github-tracking-enrichment
status: done
priority: 3
depends_on: [task-pipeline-github-tracking-enrichment-01, task-pipeline-github-tracking-enrichment-02, task-pipeline-github-tracking-enrichment-03, task-pipeline-github-tracking-enrichment-04]
estimate: 30m
actual: 30m
issue: 24
created: 2026-07-23
updated: 2026-07-24
---

# Release: CHANGELOG 0.13.0 + bump plugin.json + coherencia marketplace

## Description

Cerrar el plan como release. Subir la versión del plugin a **0.13.0** (SemVer minor: feature ampliada,
retrocompatible), añadir la entrada de CHANGELOG (Keep a Changelog) y verificar la coherencia del `description`
entre `plugin.json`, `marketplace.json` y el README. Es la última tarea (depende de 01–04).

## Spec

- **`task-pipeline/.claude-plugin/plugin.json`**: `version` `0.12.1` → **`0.13.0`**.
- **`task-pipeline/CHANGELOG.md`**: nueva sección `## [0.13.0] - 2026-…` (Keep a Changelog), con `### Added` /
  `### Changed`:
  - Body de la issue = cuerpo completo del `.md` + banner de espejo (antes: resumen + link).
  - Label `pkg:<package>` (creada si falta) en padre y sub-issues.
  - Estado proyectado a **campo Status del Project + label `status:*`** (recipe add-then-remove); alta en Project con `Backlog`.
  - Assignee `@me` al arrancar la tarea.
  - Corregido el comentario stale "board = no-op" del config del repo (write al Project verificado).
  - Type nativo: documentado como omitido (org-only) + asimetría en consumidores org.
- **Coherencia**: si el `description` del plugin/marketplace menciona github-tracking, que quede consistente con el
  comportamiento nuevo. Validar con `claude plugin validate .`.

## Scenarios (Gherkin)

```gherkin
Feature: Release 0.13.0

  Scenario: La versión sube a 0.13.0
    Given plugin.json en 0.12.1
    When se aplica el release
    Then plugin.json declara version "0.13.0"

  Scenario: El CHANGELOG narra los cambios de la feature
    Given CHANGELOG.md
    When se añade la sección 0.13.0
    Then lista body-completo, label pkg, status en Project+label, assignee y la corrección del comentario stale
    And sigue el formato Keep a Changelog

  Scenario: El manifest valida y el description es coherente
    Given el plugin actualizado
    When se corre "claude plugin validate ."
    Then valida sin errores
    And el description de plugin.json y marketplace.json no se contradicen con el README
```

## Provides

—

## Definition of Done

- [ ] `plugin.json` en 0.13.0; entrada de CHANGELOG añadida; `claude plugin validate .` en verde.
- [ ] Coherencia `description` plugin ↔ `marketplace.json` ↔ README verificada.
- [ ] Gate de `fact-checker` superado · no-negociable (la afirmación "valida sin errores" exige haber corrido el comando).
- [ ] Documentación: histórico en `.claude/context/task-pipeline/…-05.md`.
- [ ] Cierre del plan: mover a `completed/`, cerrar issue PADRE (best-effort), PR a `main`.
- [ ] TDD/mutation = **N/A** (stack `none`).
