---
id: task-pipeline-sdd-validation-gate
package: task-pipeline
status: pending          # pending | active | completed | cancelled
branch: plan/task-pipeline/sdd-validation-gate
created: 2026-08-14
updated: 2026-08-14
---

# Gate de validación de formato + completitud de artefactos SDD (plan-stub)

> **Plan-stub** (follow-up, sin descomponer). Registrado a petición del owner durante la extensión del plan
> `sdd-y-stack-poliglota` (tarea 10). No arrancar hasta priorizarlo.

## Contexto y problema

La capa SDD (plan `sdd-y-stack-poliglota`) shipeó **plantillas + flujo + prompt de activación + doctor de
presencia**, pero **NO** hay verificación de que el **contenido** de los artefactos SDD esté **bien formado
ni completo** cuando se escriben/cierran. Hoy solo existen piezas parciales, ninguna valida formato:

- **Plantillas** (task 04): prescriben EARS / MADR 5-estados / disciplina Gherkin / `[NECESITA ACLARACIÓN]` /
  numeración `NNNN`·`FR-00x`·`SC-00x` — pero es **guía al escribir**, no comprobación posterior.
- **Línea de DoD gated** (task 06): checkbox manual "spec+CU creados/actualizados o 'sin cambios'" — no
  verifica que estén bien formados.
- **`/doctor`** (task 07): valida **presencia/ausencia** del scaffolding + **enlaces rotos** al CU — **no**
  valida el contenido/formato de un artefacto ya escrito.
- **`scenario-coverage`**: endurece los escenarios del CU por **cobertura de comportamiento** — no el
  formato/estructura de la spec o el ADR.
- **`/fact-checker`**: verifica afirmaciones **factuales** de la sesión — no el formato SDD.
- Repo `stack: none` (sin runner) → toda verificación es por inspección/grep; no hay linter automático.

**Hueco exacto**: un **gate de validación SDD** al escribir/cerrar que compruebe formato + completitud.

## Objetivos (a afinar en grilling/design-review)

1. **Validación de formato por artefacto**:
   - **spec.md**: requisitos en patrón **EARS** válido; ids `FR-00x`/`SC-00x` bien formados; user stories P1/P2/P3.
   - **adr.md**: **estado MADR coherente** (uno de los 5; `accepted` solo si cerrado); secciones MADR presentes.
   - **caso-de-uso.md**: bloque **Gherkin** con la disciplina de `task.md` (declarativo, 1 escenario = 1
     comportamiento, G/W/T, `Scenario Outline` para fronteras).
2. **Completitud**: **`[NECESITA ACLARACIÓN: …]` sin resolver** = artefacto no cerrado (bloqueo o aviso).
3. **Trazabilidad**: `FR` ↔ `CU` ↔ escenario; **CUs sin huérfanos** (todo CU enlazado desde una spec; todo
   `## Scenarios` de tarea enlaza a un CU existente — esto último ya lo cubre doctor parcialmente).

## Alcance y fuera de alcance (borrador)

- **Dentro**: una de dos formas (decidir en design-review): (a) **fase/gate nueva `sdd-lint`** (subagente o
  inline) en el cierre, gated por `features.sdd`; o (b) **categoría nueva de `/doctor`** que **valida
  contenido** (no solo presencia). Solo corre con `features.sdd` on.
- **Fuera**: un linter con runner (repo `stack: none`); autogenerar contenido; validar repos sin SDD.

## Decisiones abiertas (para grilling)

- ¿Gate en el **cierre de tarea** (como mutation/fact-checker) o categoría de **`/doctor`** on-demand, o ambas?
- ¿**Bloquea** el cierre (como fact-checker INCORRECTO) o **avisa** (como NO VERIFICABLE)?
- ¿Cómo se valida **EARS** por inspección sin runner (heurística de patrones vs subagente QA)?
- ¿Solapa con `scenario-coverage` (Gherkin del CU) — se integra ahí o es fase aparte?

## Registro de cambios del plan

- 2026-08-14: creado como plan-stub (follow-up de la extensión de `sdd-y-stack-poliglota`, tarea 10; hueco
  señalado por el owner). Sin descomponer; pendiente de priorización + grilling/design-review.
