---
id: <package>-<nnn>
package: <package>
plan: <name-plan>
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 2h
actual:
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <Título de la tarea>

## Description

<Qué hay que hacer y por qué. El contexto justo para arrancar la sesión sin
releer todo el plan. Apunta a la spec aplicable de `.claude/specs/` que marca
el contrato y los anti-patrones.>

## Spec

<El contrato concreto: qué se crea/toca, ficheros, firmas, reglas, límites.
Lista de bullets verificables, no prosa. Enlaza la(s) spec(s) del artefacto.>

## Scenarios (Gherkin)

<!-- Cada escenario es la fuente 1:1 de un test TDD — el `Then` es el assert.
     Cubre el camino feliz Y los bordes/errores (el mutation testing del cierre
     los exige: un survivor suele ser un escenario sin assert real).
     Si la tarea no produce código testeable (p.ej. bootstrap de tipos, doc-only),
     sustituye los escenarios por una nota que lo justifique y di cómo se verifica
     (p.ej. "verificación = compila / valida"). -->

```gherkin
Feature: <capacidad que aporta esta tarea>

  Scenario: <caso concreto del camino feliz>
    Given <precondición / estado>
    When <acción>
    Then <resultado observable y verificable>

  Scenario: <caso de error / borde>
    Given ...
    When ...
    Then <error esperado, código, efecto>
```

## Expected result

<Estado final observable cuando la tarea está hecha: qué compila, qué responde,
qué pueden hacer otros módulos. Comprobable desde fuera.>

## Definition of Done

<!-- Las líneas marcadas (flag) solo aplican si su flag en .claude/task-pipeline.yml
     no está desactivado (por preset `mode` o clave explícita). Default (o sin
     archivo) = todas obligatorias. Si desactivas un flag en el repo, borra su línea
     de esta DoD al materializar la tarea. -->
- [ ] Tests escritos ANTES de la implementación (TDD) — Red → Green → Refactor  · (flag `features.tdd`)
- [ ] Cada escenario Gherkin tiene al menos un test (camino feliz + bordes/errores)  · (flag `features.tdd`)
- [ ] Todos los tests en verde
- [ ] Spec y resultado esperado cumplidos
- [ ] Lint / format / typecheck OK
- [ ] Gate de mutation testing superado (Stryker, umbral `break`) — sin survivors por debajo del umbral  · (flag `features.mutation-gate`)
- [ ] Documentación actualizada — tres capas (cada una según `features.closing-documentation.*`):
  - [ ] **TSDoc en el código** — todo símbolo público (funciones, clases, tipos, puertos, errores) documentado con TSDoc, al crearlo (no al final)  · (flag `tsdoc`)
  - [ ] **Doc técnica (contexto)** — README / `CLAUDE.md` del package / `.claude/specs/` / ADRs donde aplique  · (flag `technical-docs`)
  - [ ] **Histórico de la tarea** — session log en `.claude/context/<package>/<task-id>.md` (qué se hizo + por qué)  · (flag `context-log`)
- [ ] Docs de dev / usuario final + `pnpm changeset` donde aplique
