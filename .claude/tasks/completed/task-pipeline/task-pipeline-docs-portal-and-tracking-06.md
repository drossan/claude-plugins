---
id: task-pipeline-docs-portal-and-tracking-06
package: task-pipeline
plan: docs-portal-and-tracking
status: done
priority: 3
depends_on: [task-pipeline-docs-portal-and-tracking-04, task-pipeline-docs-portal-and-tracking-05]
estimate: 1.5h
actual: 1h
issue: 17                 # SUB-ISSUE (padre #11)
created: 2026-07-23
updated: 2026-07-23
---

# Wire-up: enlaces README↔web + carve-out de narrativa de stack + coherencia + runbook

## Description

Cerrar el círculo: enlazar la web publicada desde los README, **acotar la narrativa de stack (#4)** que la
introducción de `website/`+pnpm volvió falsa, hacer la pasada de coherencia final y consolidar el runbook de
pasos manuales del owner. Depende de `-04` (contenido) y `-05` (deploy).

## Spec

- **Enlaces README→web**: `README.md` raíz y `task-pipeline/README.md` enlazan al sitio publicado
  (`https://drossan.github.io/claude-plugins/`). Reconocer que el enlace queda **vivo tras el primer deploy**
  (post go-live): añadirlo con esa salvedad si el sitio aún no está publicado.
- **[#4] Carve-out de la narrativa de stack**: en `CLAUDE.md` (L18-27) y el HOW-TO (L10-20), aclarar que
  «no hay pnpm/test runner» se refiere a los **entregables del pipeline** (MD+Bash, `stack: none`) y que
  `website/` es un **sub-proyecto aislado** con su propio toolchain pnpm — sin volver falsas esas
  afirmaciones. Sin esto, la web reintroduce el drift que arregla `-02`.
- **[#6] Runbook consolidado**: unificar (o enlazar desde un único punto) los pasos manuales del owner:
  encender Pages, `gh auth refresh -s project`, crear Project v2 + cablear `project:`, y el **footgun
  `base`↔nombre-de-repo** (rename/fork/dominio → 404 masivo).
- **Coherencia final**: barrido `grep` sin identificadores renombrados vivos; enlaces resuelven; allowlist
  legítima intacta.

## Scenarios (Gherkin)

```gherkin
Feature: Cierre de coherencia del portal y la documentación

  Scenario: los README enlazan al portal
    Given el portal listo para desplegar
    When se cierra el wire-up
    Then el README raíz y el README del plugin enlazan al sitio publicado

  Scenario: la narrativa de stack deja de ser falsa tras añadir la web
    Given CLAUDE.md y el HOW-TO afirmando "no hay pnpm en este repo"
    When se acota la narrativa al pipeline y se declara website/ como sub-proyecto
    Then esas afirmaciones ya no son falsas
    And el pipeline sigue documentado como stack none

  Scenario: el runbook reúne todos los pasos manuales del owner
    Given los pasos que requieren admin o scope Projects
    When se consolida el runbook
    Then documenta Pages, scope Projects, creación del Project, wiring project: y el footgun base

  Scenario: la coherencia final no deja drift ni enlaces rotos
    Given el conjunto de docs + web tras todas las tareas
    When se hace el barrido de cierre
    Then no hay identificadores renombrados vivos ni enlaces rotos
    But la allowlist legítima (atribución a Matt Pocock; CHANGELOG ≤ 0.8.1) queda intacta

  Scenario: el enlace al portal se añade reconociendo que aún no está vivo
    Given Pages apagado (go-live es acción del owner)
    When se añade el enlace al portal en los README
    Then el enlace se añade con la salvedad de que quedará vivo tras el primer deploy
    And el barrido de coherencia NO lo trata como enlace roto (excepción declarada, no drift)

  Scenario: el runbook consolidado es fuente única, no un duplicado del de -01
    Given el runbook inicial creado en -01
    When se consolida en -06
    Then existe un único punto de verdad (unificado o enlazado desde uno)
    And no quedan dos runbooks con pasos divergentes

  Scenario: ninguna afirmación "no hay pnpm" queda en falso tras añadir website/
    Given todas las menciones a la ausencia de pnpm/harness (CLAUDE.md, HOW-TO, comentarios de task-pipeline.yml)
    When se aplica el carve-out
    Then cada mención acota "no hay pnpm" a los entregables del pipeline (MD+Bash)
    And reconoce website/ como sub-proyecto aislado con su propio toolchain
    And un grep de "no hay pnpm"/"no existe pnpm" no devuelve ninguna afirmación sin acotar

  Scenario: el carve-out de -06 es coherente con el fix H3 de -02 en CLAUDE.md
    Given CLAUDE.md ya corregido por H3 (stack real descrito)
    When -06 aplica el carve-out de la narrativa de stack
    Then la sección resultante es coherente (no reintroduce el literal "stack: none" ni contradice H3)

  Scenario: la versión es coherente en todo el conjunto tras el plan
    Given plugin.json, CHANGELOG, marketplace.json, el ejemplo de pin del README y el contenido web
    When se hace el barrido de coherencia final
    Then ninguna de esas superficies afirma una versión contradictoria
```

## Provides

- Documentación + portal coherentes y enlazados; runbook único de pasos de owner. Cierra el plan: sin drift
  reintroducido y con el go-live claramente delegado al owner.

## Definition of Done

- [ ] README raíz y del plugin enlazan al portal (con la salvedad de go-live si aún no está vivo).
- [ ] Carve-out de la narrativa de stack aplicado (`CLAUDE.md` + HOW-TO); `grep` confirma que ya no afirman en falso.
- [ ] Runbook consolidado (Pages, scope, Project, wiring, footgun `base`).
- [ ] Barrido `grep` de coherencia limpio; allowlist legítima intacta; enlaces resuelven.
- [ ] Gate de `fact-checker` superado — no-negociable.
- [ ] Proyección de estado a GitHub al cerrar — best-effort.
- [ ] Histórico de la tarea actualizado.
- [ ] N/A (`stack: none`): TDD, gate de mutation, TSDoc.
