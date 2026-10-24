---
id: task-pipeline-portal-redesign-06
package: task-pipeline
plan: portal-redesign
status: done
priority: 2
depends_on: [task-pipeline-portal-redesign-01, task-pipeline-portal-redesign-02]
estimate: 4h
actual:
issue: 64                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Sección "Capas opcionales": SDD, git-automation, github-tracking, caveman

## Description

Cada capa opt-in explicada **completa y autocontenida** (sin deflectar), respetando el mapa de fuente
canónica: el portal explica lo necesario para entender y activar cada capa; la minucia exhaustiva (tablas de
límites, nombres exactos de opciones) enlaza al README. Incluye el **flujo con y sin SDD** (la pieza que el
owner señaló como poco clara).

## Spec

- `website/features/sdd.md`: reescrito autocontenido, con la sección **"El flujo, con y sin SDD"** (qué se
  mantiene / qué cambia) + diagrama con el tema de task 02 que sitúa specs/CU/ADR junto al bucle
  plan→task→context; el gate `/sdd-lint` con sus ramas ERROR/AVISO.
- `website/features/git-automation.md`: auto-commit/auto-PR/co-author + `conventional-commits` como flag
  **independiente**; completo y sin deflectar.
- `website/features/github-tracking.md`: proyección one-way, plan→padre / task→sub-issue, estados; minucia
  (tabla de límites, nombres de Status) **enlaza** al README (canónico), no la duplica entera.
- `website/features/caveman.md`: modos off/lite/full, autocontenido.
- Todas: enlaces al README solo como "profundizar".

## Fuera de alcance

- Reescribir el README (canónico para la minucia enlazada).
- El seed de sitio para consumidores (`sdd-site-vitepress`).
- Cambiar la funcionalidad de las capas (solo documentar).

## Scenarios (Gherkin)

> Doc-only: criterios de aceptación por inspección + build.

```gherkin
Feature: capas opcionales completas y autocontenidas

  Scenario: cada capa se entiende y se sabe activar sin ir al README
    Given la página de una capa opcional
    When un lector la lee
    Then entiende qué hace, cómo se activa (clave YAML) y sus garantías opt-in sin necesitar el README

  Scenario: SDD explica el flujo con y sin el flag
    Given la página de SDD
    When se lee la sección de flujo
    Then contrasta qué se mantiene y qué cambia con features.sdd on
    And un diagrama sitúa spec/CU/ADR junto al bucle plan→task→context, legible en claro y oscuro

  Scenario: la minucia de referencia enlaza en vez de duplicarse
    Given detalle exhaustivo también presente en el README (p.ej. tabla de límites de github-tracking)
    When se inspecciona la página de la capa
    Then el portal resume + enlaza al README canónico en vez de copiar la tabla entera

  Scenario: conventional-commits se presenta como flag independiente
    Given la página de git-automation
    When se lee
    Then aclara que conventional-commits es un flag aparte (no una sub-clave de git-automation)
```

### Refuerzos (scenario-coverage 2026-08-14)

- **Listón "no-tapón" aplicado a las 4 páginas** (no solo a "Empezar"): cada capa se entiende sin ir al README.
- **Las "Garantías opt-in" (fail-safe) se preservan**: el detalle actual de qué valores no-canónicos caen a
  `off` no se recorta al simplificar para autocontenido.
- **El diagrama HOY existente de `github-tracking.md` se re-estila** con la paleta por rol de task-02 (no queda
  con el tema por defecto).

## Provides

La sección **Capas opcionales** (sdd, git-automation, github-tracking, caveman). `Provides`: — (task 07 barre coherencia).

## Definition of Done

- [x] TDD / gate de mutation: **N/A** (doc-only) — verificación = inspección + `pnpm docs:build`.
- [x] `sdd-lint`: **N/A**; "sin cambios de spec/CU".
- [x] `pnpm docs:build` en verde; sin dead links.
- [x] Diagramas (incl. el de flujo SDD) verificados en claro Y oscuro: SDD = flujo 6 gris + gate 4 rojo; github-tracking = 5(→6) gris. Texto `#1f2937` en ambos modos, sin error.
- [x] Cada capa autocontenida; minucia enlazada al README según el mapa de fuente canónica (sección "Profundizar").
- [x] Gate de `fact-checker` superado (no-negociable) — datos de cada capa fieles al comportamiento real. **12/12 VERIFICADO, 0 INCORRECTO** (+ tapón "Fuente canónica" eliminado en las 4).
- [x] Proyección de estado a GitHub al cerrar — best-effort  · `features.github-tracking`. **Bloqueado por el clasificador de permisos → pendiente owner**.
- [x] Doc técnica actualizada  · `technical-docs`.
- [x] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-06.md`  · `context-log`.
