---
id: task-pipeline-portal-redesign-05
package: task-pipeline
plan: portal-redesign
status: done
priority: 2
depends_on: [task-pipeline-portal-redesign-01, task-pipeline-portal-redesign-02]
estimate: 4h
actual:
issue: 63                    # sub-issue proyectada (github-tracking)
created: 2026-08-14
updated: 2026-08-14
---

# Sección "El pipeline paso a paso": recorrido secuencial (cómo)

## Description

El recorrido **secuencial** de las fases —el "cómo"— usando el modelo que define Conceptos (task 04) sin
redefinirlo. Cada fase con **qué haces / qué ves / por qué**: entrada `/plan-task`, plan mode, grilling,
design-review, descomposición en tareas Gherkin, scenario-coverage, handoff TDD, y los gates de cierre
(mutation → sdd-lint → fact-checker). Sustituye el actual `guia/pipeline.md` (que conserva su slug).

## Spec

- `website/guia/pipeline.md` (slug **pinado** por task 01) reescrito como recorrido fase a fase; y/o
  sub-páginas por fase según la IA de task 01.
- Por fase: **qué haces / qué ves / por qué existe**; los **dos checkpoints humanos** no negociables
  (grilling, aprobación del plan) marcados como tales.
- **Gates de cierre** en orden `mutation → sdd-lint (solo features.sdd) → fact-checker`, con el diagrama de
  ramas ERROR/AVISO usando el tema de task 02.
- **Frase canónica del salto trivial** conservada **literal** (no romper las 5 copias): revisar que sigue
  intacta aquí.
- Usa el modelo de Conceptos (enlaza, no repite el modelo estático).

## Fuera de alcance

- Redefinir el modelo estático (estados/artefactos) — eso es Conceptos (task 04); aquí se usa/enlaza.
- La configuración de cada fase (models/flags) exhaustiva → Referencia (task 07).
- Reescribir el README.

## Scenarios (Gherkin)

> Doc-only: criterios de aceptación por inspección + build.

```gherkin
Feature: sección Pipeline como recorrido secuencial coherente con Conceptos

  Scenario: cada fase explica qué haces, qué ves y por qué
    Given la sección Pipeline
    When se recorre una fase cualquiera
    Then indica qué hace el usuario, qué salida ve y por qué existe la fase

  Scenario: los gates de cierre se muestran en orden
    Given el cierre de una tarea
    When se lee la subsección de gates
    Then aparecen en orden mutation → sdd-lint (solo con features.sdd) → fact-checker
    And el diagrama de ramas ERROR/AVISO se renderiza legible en claro y oscuro

  Scenario: la frase canónica del salto trivial sigue intacta
    Given que /guia/pipeline es una de las 5 copias de la frase canónica
    When se hace grep de la frase tras la reescritura
    Then la frase canónica sigue presente literal (no se rompe la consistencia de las 5 copias)

  Scenario: no redefine el modelo estático
    Given la frontera Conceptos↔Pipeline
    When se inspecciona la sección
    Then referencia el modelo de Conceptos por enlace en vez de reexplicar estados/artefactos
```

### Refuerzos (scenario-coverage 2026-08-14)

- **Contenido en riesgo de pérdida silenciosa sobrevive a la reescritura**: las secciones actuales de
  `guia/pipeline.md` *"Reglas que viajan con el repo"* (honesty-rules) y *"Por qué subagentes frescos"* siguen
  presentes (aquí o reubicadas con enlace). No se pierden al reestructurar.
- **Frase canónica = string EXACTO pinado**: como las 5 copias ya divergen hoy, esta task fija el **texto
  literal** que usa el portal y lo deja consistente en su copia (alinear las 5 = cleanup aparte, decisión owner).
- **Semántica de gates en prosa**, no solo en el diagrama: `Then` el texto explica ERROR-bloquea / AVISO-no.

## Provides

La sección **El pipeline paso a paso**. `Provides`: — (task 07 la barre para coherencia; nada depende de su render).

## Definition of Done

- [x] TDD / gate de mutation: **N/A** (doc-only) — verificación = inspección + `pnpm docs:build`.
- [x] `sdd-lint`: **N/A**; "sin cambios de spec/CU".
- [x] `pnpm docs:build` en verde; sin dead links; slug `/guia/pipeline` conservado (fichero no renombrado).
- [x] Frase canónica del salto trivial **intacta** (grep = 1 match, byte-idéntica a plan-task SKILL); 2 flowcharts verificados claro Y oscuro (7 rojo · 6 gris · 2 ámbar · 2 azul; texto `#1f2937`).
- [x] Frontera con Conceptos respetada (usa/enlaza estados, no redefine; 0 `stateDiagram` aquí).
- [x] Gate de `fact-checker` superado (no-negociable). **12/12 VERIFICADO, 0 INCORRECTO**.
- [x] Proyección de estado a GitHub al cerrar — best-effort  · `features.github-tracking`. **Bloqueado por el clasificador de permisos → pendiente owner**.
- [x] Doc técnica actualizada  · `technical-docs`.
- [x] Session log en `.claude/context/task-pipeline/task-pipeline-portal-redesign-05.md`  · `context-log`.
