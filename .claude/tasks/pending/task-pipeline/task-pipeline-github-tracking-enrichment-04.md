---
id: task-pipeline-github-tracking-enrichment-04
package: task-pipeline
plan: github-tracking-enrichment
status: pending
priority: 2
depends_on: [task-pipeline-github-tracking-enrichment-01, task-pipeline-github-tracking-enrichment-02, task-pipeline-github-tracking-enrichment-03]
estimate: 2h
actual:
issue: 23
created: 2026-07-23
updated: 2026-07-23
---

# Docs de usuario: README + website + runbook (requisito gh y límites)

## Description

Documentar de cara al usuario los comportamientos nuevos y sus **límites honestos**, y dejar **explícito que la
feature requiere `gh`** (petición directa del owner). Tres destinos: `task-pipeline/README.md` §"GitHub tracking",
`website/features/github-tracking.md` (portal VitePress) y el runbook `.claude/specs/task-pipeline/github-tracking-runbook.md`.
No duplicar la mecánica fina: el comportamiento canónico vive en el lifecycle (tarea 02) y en Paso 5.7 (tarea 01);
aquí se resume + se enlazan + se listan los límites.

## Spec

Contenido a reflejar (README + website; el runbook actualiza los comandos `gh` concretos):

- **Requisito `gh`** explícito: la feature **no funciona sin `gh`** instalado y autenticado; scopes `repo` (issues)
  y `project` (tablero). Sin `gh`/red/auth/repo-no-GitHub → **no-op** (el flujo local no cambia).
- **Comportamientos nuevos** (resumen + link al lifecycle): body = **cuerpo completo del `.md` + banner de espejo**
  (no solo resumen); label **`pkg:<package>`** (creada si falta); estado en **campo Status del Project + label
  `status:*`** (recipe add-then-remove); **assignee `@me`** al arrancar; alta en el Project con `Backlog`.
- **Límites honestos** (nuevos o reforzados):
  - **Type omitido** + **asimetría**: en consumidores **org** el padre puede llevar `issue-type-plan` pero las
    sub-issues **no** llevan type (medio-tipado); en cuenta personal, ni uno ni otro (org-only, 404 verificado).
  - **`@me`** exige que la identidad que corre sea **colaborador asignable**; si no, no asigna + avisa.
  - **Status del Project**: solo funciona con las **opciones default** (`Backlog/Ready/In progress/In review/Done`,
    match case-insensitive); si el Project del consumidor las nombra distinto → no-op + avisa.
  - **Body**: se vuelca al crear y en re-proyección explícita, **no** en cada guardado del `.md` (no hay demonio).
    Un cuerpo muy largo puede toparse con el **límite de tamaño de body** de GitHub (~65536) → se **trunca** con nota
    «(ver .md)» conservando banner + link.
  - **I3 ampliado**: desactivar el flag deja huérfanas las **definiciones** de labels `pkg:*`/`status:*`, los
    **items** del Project y las `status:*` pegadas a issues in-flight → **reconciliar/limpiar antes de desactivar**.
- **Runbook** `.claude/specs/task-pipeline/github-tracking-runbook.md`: actualizar los comandos `gh` concretos
  (create con `--body-file` + `--label pkg:*`, `label create`, `project item-add`/`item-edit` con `--single-select-option-id`,
  `issue edit --add-assignee`), coherentes con las tareas 01/02.
- **Coherencia**: el texto de la feature en README ↔ `marketplace.json` ↔ `description` del plugin (lo cierra la tarea 05).

## Scenarios (Gherkin)

```gherkin
Feature: Documentación de github-tracking enriquecido

  Scenario: El README exige gh explícitamente
    Given la sección "GitHub tracking" del README del plugin
    When se lee el bloque de setup
    Then dice explícitamente que la feature requiere gh instalado y autenticado
    And enumera los scopes repo y project

  Scenario: Se documentan los comportamientos nuevos con enlace al canónico
    Given el README y website/features/github-tracking.md
    When se leen
    Then describen body-completo+banner, label pkg, status en Project+label, assignee @me y alta en Project
    And enlazan al lifecycle/Paso 5.7 como fuente canónica sin duplicar la mecánica

  Scenario: Se documentan los límites honestos
    Given la sección de límites/riesgos
    When se lee
    Then incluye type omitido + asimetría org, @me colaborador-asignable, Status opciones-default, body sin daemon, e I3 ampliado

  Scenario: El runbook refleja los comandos gh nuevos
    Given github-tracking-runbook.md
    When se inspecciona
    Then los comandos incluyen --body-file, label create, project item-add/item-edit y add-assignee coherentes con las tareas 01/02

  Scenario: Website y README no se contradicen
    Given ambos documentos
    When se comparan los comportamientos y límites
    Then coinciden (mismo mensaje, sin afirmaciones divergentes)

  # --- Añadido por scenario-coverage (QA) ---

  Scenario: Se documenta el límite de tamaño de body
    Given la sección de límites de README/website
    When se lee
    Then menciona que un cuerpo muy largo puede toparse con el límite de body de la issue y cómo se degrada (truncado + link)

  Scenario: El resumen de docs no contradice el canónico
    Given README/website y el lifecycle/Paso 5.7 canónicos
    When se comparan (p.ej. label de bloqueo)
    Then ambos usan "status: blocked" (no la label "blocked" pelada legacy)
```

## Provides

Documentación de usuario alineada; base para la nota de CHANGELOG (tarea 05). Nada de código depende de esto.

## Definition of Done

- [ ] Spec cumplida: README §GitHub-tracking + website + runbook actualizados; `gh` requerido explícito; límites listados.
- [ ] Escenarios verificados por inspección; `pnpm docs:build` en `website/` en verde (sub-proyecto aislado, ver CLAUDE.md).
- [ ] Gate de `fact-checker` superado · no-negociable (verificar que cada afirmación de límite es real, no inventada).
- [ ] Documentación: histórico en `.claude/context/task-pipeline/…-04.md`.
- [ ] TDD/mutation = **N/A** (stack `none`); proyección de estado al cerrar · best-effort.
