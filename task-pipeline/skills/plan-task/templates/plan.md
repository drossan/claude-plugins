---
id: <package>-<name-plan>
package: <package>
status: pending          # pending | active | completed | cancelled
branch: plan/<package>/<name-plan>
issue:                   # opcional; solo con features.github-tracking — nº de la issue PADRE proyectada (lo escribe /plan-task)
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <Título del plan>

## Contexto y problema

<De dónde partimos y qué duele. El estado actual del package/repo y por qué
hace falta este trabajo.>

## Objetivos

<Lista numerada. Cada objetivo con su *criterio de éxito* observable.>

1. **<Objetivo>**.
   - *Criterio de éxito*: <verificable, medible>.

## Alcance y fuera de alcance

### Dentro del alcance
- <…>

### Fuera de alcance
- <… lo que explícitamente NO se toca, para acotar>

<!-- Esta lista NO se queda en el plan: cada tarea materializada hereda en su propia sección
     `## Fuera de alcance` los bullets que la acotan a ella (ver `task.md`). Escríbelos pensando en
     que los leerá la sesión que ejecute la tarea, no solo quien apruebe el plan. -->

## Recursos externos

<Docs del proyecto, specs aplicables, referencias técnicas, decisiones de
`grilling` consolidadas (con fecha).>

## Estimación global

- **Tareas totales**: <n> (ver lista al final).
- **Esfuerzo estimado**: <rango de horas / sesiones>.
- **Recursos**: <quién / qué accesos>.

## Criterios de calidad y verificación

- TDD en todas las capas; tests antes de la implementación.
- `pnpm lint` y `pnpm test` en verde tras cada tarea cerrada.
- Gate de mutation testing (Stryker, `break: 80`) por tarea.
- <Criterios específicos del plan (cobertura, integración, e2e manual, etc.)>

## Tasks

<Lista ordenada por prioridad y dependencias. Cada entrada tiene su archivo en
`.claude/tasks/pending/<package>/<task-id>.md`. Marca `[x]` al cerrar.>

- [ ] `<plan-id>-01` (P1) — <título corto>  · depends_on: —
- [ ] `<plan-id>-02` (P2) — <título corto>  · depends_on: <plan-id>-01

## Registro de cambios del plan

- YYYY-MM-DD: creado.
- YYYY-MM-DD: refinado con `grilling` (<n> preguntas, <n> decisiones).
<!-- Toda re-planificación in-place se registra aquí: qué cambió y por qué. -->
