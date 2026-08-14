---
id: task-pipeline-portal-redesign-04
package: task-pipeline
plan: portal-redesign
status: pending
priority: 2
depends_on: [task-pipeline-portal-redesign-01, task-pipeline-portal-redesign-02]
estimate: 3h
actual:
issue: 62                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Sección "Conceptos": el modelo estático (qué/por qué)

## Description

Explica el **modelo mental** del plugin sin recorrer las fases (eso es la task 05). Es el "qué/por qué"
estático que el resto del portal usa: cómo se organiza el trabajo (plan → task → context → specs), los
estados y sus transiciones, los artefactos, las ramas y los ids plan-scoped. Frontera nítida con Pipeline
(decisión de grilling): Conceptos **define**, Pipeline **secuencia**.

## Spec

- **Nueva** sección/página(s) `website/conceptos/...` (según IA de task 01): 
  - Modelo mental: qué es un plan, una task, el context/session-log, las specs; cómo se relacionan.
  - **Estados** de plan y de task con **máquinas de estado** (diagrama con el tema de task 02).
  - **Ramas**: `main` como integración, `plan/<package>/<name-plan>`, commit `<task-id>: ...`.
  - **Ids plan-scoped**: qué son, por qué (evitar colisiones en equipo), el residual honesto.
- **NO** recorre las fases del pipeline (grilling/design-review/gates) más allá de nombrarlas como concepto;
  su secuencia es la task 05. Enlaza a Pipeline en vez de repetir.
- Respeta mapa de fuente canónica (01) y tema Mermaid (02).

## Fuera de alcance

- El recorrido secuencial de fases (task 05).
- La minucia de configuración (tabla completa de flags → Referencia, task 07).
- Reescribir el README.

## Scenarios (Gherkin)

> Doc-only: criterios de aceptación por inspección + build.

```gherkin
Feature: sección Conceptos como modelo estático sin solapar con Pipeline

  Scenario: explica el modelo sin recorrer las fases
    Given la sección Conceptos
    When se lee
    Then define plan/task/context/specs, estados, ramas e ids
    And NO describe la secuencia de fases (grilling→design-review→...) — eso lo enlaza a la sección Pipeline

  Scenario: los estados se muestran como máquinas de estado legibles
    Given las transiciones de estado de plan y task
    When se renderiza el diagrama en claro y en oscuro
    Then ambas máquinas de estado son legibles en los dos modos con el tema compartido

  Scenario: los ids plan-scoped se explican con su porqué
    Given la convención <plan-id>-<nn>
    When se lee la subsección de ids
    Then explica el formato, por qué es plan-scoped (colisiones) y el residual conocido (dos ramas del mismo plan)
```

## Provides

La sección **Conceptos**. `Provides`: — (la Pipeline la referencia como enlace, no depende de su render).

## Definition of Done

- [ ] TDD / gate de mutation: **N/A** (doc-only) — verificación = inspección + `pnpm docs:build`.
- [ ] `sdd-lint`: **N/A**; "sin cambios de spec/CU".
- [ ] `pnpm docs:build` en verde; sin dead links.
- [ ] Máquinas de estado verificadas legibles en claro Y oscuro.
- [ ] Frontera con Pipeline respetada (no recorre fases); enlaza en vez de repetir.
- [ ] Gate de `fact-checker` superado (no-negociable).
- [ ] Proyección de estado a GitHub al cerrar — best-effort  · `features.github-tracking`.
- [ ] Doc técnica actualizada  · `technical-docs`.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-04.md`  · `context-log`.
