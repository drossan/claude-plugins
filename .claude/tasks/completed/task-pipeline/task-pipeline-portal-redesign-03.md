---
id: task-pipeline-portal-redesign-03
package: task-pipeline
plan: portal-redesign
status: done
priority: 2
depends_on: [task-pipeline-portal-redesign-01, task-pipeline-portal-redesign-02]
estimate: 4h
actual:
issue: 61                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Sección "Empezar": Qué es + Instalación + Tu primer plan (walkthrough)

## Description

La puerta de entrada. Reescribe **Qué es** (autocontenido, sin deflectar) e **Instalación**, y crea la pieza
de mayor valor contra "no queda claro cómo funciona": **Tu primer plan**, un walkthrough end-to-end basado en
un **caso REAL del propio repo** (un plan/task cerrado representativo), con extractos abreviados de plan.md,
task.md (Gherkin), session-log, y qué ve el usuario en cada checkpoint humano.

## Spec

- `website/guia/que-es.md`: reescrito autocontenido (qué es, qué problema resuelve, cuándo usarlo) sin
  "Fuente canónica → README" como tapón; enlace de *profundizar* opcional al final.
- `website/guia/instalacion.md`: autocontenido (marketplace add → install → verificar), sin deflectar.
- **Nueva** `website/guia/tu-primer-plan.md`: walkthrough e2e con un caso real cerrado del repo (elegir uno
  representativo, p.ej. de `.claude/plans/completed/` + sus tasks/context). Extractos **abreviados** y
  **marcados como copias congeladas** (VitePress no incluye `.claude/**`) → van al barrido de coherencia.
  Muestra: entrada `/plan-task` → grilling → design-review → tareas Gherkin → cierre con gates; y qué decide
  el humano en cada checkpoint.
- Respeta el **mapa de fuente canónica** (task 01) y el **tema Mermaid** (task 02) en cualquier diagrama.

## Fuera de alcance

- El detalle exhaustivo de cada fase (eso es la sección Pipeline, task 05) — aquí es un recorrido introductorio.
- Reescribir el README del plugin.

## Scenarios (Gherkin)

> Doc-only: criterios de aceptación por inspección + `pnpm docs:build`.

```gherkin
Feature: sección Empezar autocontenida con walkthrough real

  Scenario: Qué es se entiende sin ir al README
    Given la página que-es reescrita
    When un lector nuevo la lee entera
    Then entiende qué es el plugin, qué problema resuelve y cuándo usarlo sin necesitar el README
    And el único enlace al README es de "profundizar" opcional, no un tapón

  Scenario: el walkthrough sigue un caso real de principio a fin
    Given la página tu-primer-plan
    When se recorre
    Then muestra extractos reales (abreviados) de un plan.md, un task.md con Gherkin y un session-log de un caso cerrado del repo
    And explica qué ve/decide el humano en grilling y en la aprobación del plan

  Scenario: los extractos congelados quedan trazados
    Given extractos copiados de .claude/** al portal
    When se inspecciona la página
    Then cada extracto se marca como copia (con su origen) para el barrido de coherencia
```

### Refuerzos (scenario-coverage 2026-08-14)

- **Esta task ELIGE el caso real del walkthrough** (corrige la nota del plan que lo situaba en la 02): la
  elección se registra al arrancar la task; extractos abreviados de un plan/task/context **cerrado**.
- **Extracto congelado que DIVERGE de su origen se detecta**: no basta con etiquetar el origen. `Given` un
  extracto con su ruta de origen en `.claude/**`, `When` se compara con el contenido actual de esa ruta,
  `Then` coincide, o la divergencia se declara con fecha de congelación.

## Provides

La sección **Empezar** completa (que-es, instalacion, tu-primer-plan). `Provides`: — (ninguna task depende de
su contenido; la task 07 solo la barre para coherencia).

## Definition of Done

- [x] TDD / gate de mutation: **N/A** (doc-only) — verificación = inspección + `pnpm docs:build`.
- [x] `sdd-lint`: **N/A**; "sin cambios de spec/CU".
- [x] `pnpm docs:build` en verde; sin dead links.
- [x] Diagramas (si los hay) verificados en claro Y oscuro con el tema de task 02 (1 diagrama de journey; fills y texto `#1f2937` confirmados en navegador en ambos modos).
- [x] Cada página se entiende sin salir del portal; enlaces al README solo como "profundizar".
- [x] Gate de `fact-checker` superado (no-negociable) — incl. que los extractos citan fielmente el caso real. **16/16 VERIFICADO, 0 INCORRECTO**.
- [x] Proyección de estado a GitHub al cerrar — best-effort  · `features.github-tracking`. **Intentado; el cierre de #61 lo bloqueó el clasificador de permisos → pendiente del owner** (best-effort satisfecho).
- [x] Doc técnica / extractos marcados como copia congelada  · `technical-docs`.
- [x] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-03.md`  · `context-log`.
