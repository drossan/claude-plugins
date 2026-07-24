---
id: task-pipeline-github-tracking-enrichment-03
package: task-pipeline
plan: github-tracking-enrichment
status: done
priority: 2
depends_on: [task-pipeline-github-tracking-enrichment-01, task-pipeline-github-tracking-enrichment-02]
estimate: 1h
actual: 0.5h
issue: 22
created: 2026-07-23
updated: 2026-07-24
---

# Config: clave `assignee` en el template + corregir comentario stale del repo

## Description

Reflejar la superficie de configuración mínima decidida (grilling decisión 8): añadir **una** clave nueva opcional
`assignee` al bloque `github-tracking` del **template** de config, y **corregir** en el `.claude/task-pipeline.yml`
de este repo el comentario **stale** que afirma que el tablero es un no-op para `danielrosse` (el write-spike lo
desmiente). No se añaden toggles por-comportamiento; los prefijos de label van hardcodeados.

## Spec

- **Template** `task-pipeline/skills/plan-task/templates/task-pipeline.yml`, bloque `github-tracking` (comentado):
  - Añadir, **comentada**, la clave `assignee` con su resolución:
    `# assignee: "@me"   # opcional; @me (default) = identidad gh que arranca la tarea; un login para fijar otro;`
    `#                   # false para no asignar. Requiere que la identidad sea colaborador ASIGNABLE del repo.`
  - **Cableado real**: esta clave la **consume la tarea 02** (lógica de assignee del arranque); no es doc muerta.
    Los escenarios de `@me`/login/`false` viven en la tarea 02.
  - Mantener **`issue-type-plan`** intacta (válida para consumidores org).
  - Una línea que remita a los nuevos comportamientos (body completo, `pkg:` label, `status:*`, alta en Project) al
    README (no duplicar la prosa).
- **Repo** `.claude/task-pipeline.yml` (líneas ~78–83): **corregir** el comentario que dice
  `board = no-op best-effort hasta dar acceso…` → reflejar que **el acceso ya está concedido y el write está
  verificado** (spike 2026-07-23), citando las opciones reales del Status. Opcional: fijar `assignee: "@me"` explícito.
- Invariante: el **template no impone comportamiento** a consumidores (todo comentado); el repo source sí puede activar.

## Scenarios (Gherkin)

```gherkin
Feature: Superficie de configuración de github-tracking

  Scenario: El template documenta la clave assignee comentada
    Given el template task-pipeline.yml
    When se inspecciona el bloque github-tracking
    Then contiene la clave assignee comentada con su regla de resolución (@me / login / false)
    And sigue conteniendo issue-type-plan intacta
    And no impone ningún comportamiento (todas las claves comentadas)

  Scenario: El comentario stale del repo queda corregido
    Given .claude/task-pipeline.yml con el comentario "board = no-op"
    When se aplica la tarea
    Then el comentario refleja que el write al Project está verificado (spike 2026-07-23)
    And no afirma que danielrosse no resuelve el Project

  Scenario: No se añaden toggles por-comportamiento
    Given el bloque github-tracking del template
    When se buscan flags para desactivar body-completo o pkg-label o status-label por separado
    Then no existe ninguno (las piezas van ON con enabled: true)
```

## Provides

La **config declarada** (`assignee`, comentario corregido) que la doc de la tarea 04 referencia como fuente de las
claves. Nada de código depende de esto aguas abajo salvo la coherencia doc.

## Definition of Done

- [ ] Spec cumplida: `assignee` comentada en el template; comentario stale del repo corregido; `issue-type-plan` intacta.
- [ ] Escenarios verificados por inspección (`grep`/lectura); YAML válido.
- [ ] Gate de `fact-checker` superado · no-negociable.
- [ ] Documentación: histórico en `.claude/context/task-pipeline/…-03.md`.
- [ ] TDD/mutation = **N/A** (stack `none`); proyección de estado al cerrar · best-effort.
