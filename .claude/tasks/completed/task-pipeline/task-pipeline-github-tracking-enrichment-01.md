---
id: task-pipeline-github-tracking-enrichment-01
package: task-pipeline
plan: github-tracking-enrichment
status: done
priority: 1
depends_on: []
estimate: 3h
actual: 2h
issue: 20
created: 2026-07-23
updated: 2026-07-23
---

# Paso 5.7: body completo (banner+link), label `pkg:<package>` y alta en el Project

## Description

Enriquecer la **proyección al crear** (Paso 5.7 de `task-pipeline/skills/plan-task/SKILL.md`). Hoy el body es
*"resumen + link"*; hay que volcar el **cuerpo completo** del `.md` (sin frontmatter) con un **banner de espejo**,
crear/aplicar la label **`pkg:<package>`** y **dar de alta la issue en el Project** con Status inicial `Backlog`.
El `.md` sigue siendo la fuente de verdad; GitHub es proyección one-way best-effort (regla C3: avisa y nunca
bloquees la materialización del `.md`). Este paso **no** proyecta estado de arranque/cierre (eso es la tarea 02).

## Spec

En `task-pipeline/skills/plan-task/SKILL.md`, Paso 5.7 (y coherencia con la degradación C3 ya existente):

- **Body (padre y sub-issue)**: construir con `--body-file` (nunca `--body` interpolado — seguro ante backticks/`$`):
  1. tomar el `.md` (plan para el padre, tarea para la sub-issue) y **quitar SOLO el bloque de frontmatter YAML**
     — el delimitado por el **primer par** de líneas `---` al principio del fichero; **conservar** cualquier `---`
     posterior del cuerpo (reglas horizontales, `---` dentro de bloques de código);
  2. anteponer el **banner**: `> ⚠️ Espejo generado desde \`<ruta-relativa-del-.md>\`. La **fuente de verdad** es el .md; no edites esta issue a mano.`
  3. añadir al final un link a la ruta del `.md` en el repo.
  4. **Límite de tamaño**: si el body resultante supera el máximo de GitHub (~65536 chars), **truncar** el cuerpo y
     cerrar con una nota `> …(truncado — ver el .md para el contenido completo)`, conservando banner + link. No dejar
     que `gh` falle por longitud.
- **Re-vuelco (re-proyección)**: en una **re-proyección explícita** (re-run de `/plan-task` o `/doctor`) de un `.md`
  que **ya** tiene `issue:`, **re-generar el body** desde el `.md` (idempotente, `gh issue edit --body-file`). **NO**
  se re-vuelca en las transiciones de estado (eso es la tarea 02).
- **Label `pkg:<package>`**: derivarla del frontmatter `package:`. Intentar crearla:
  `gh label create "pkg:<package>" --color 5319E7 --description "Package: <package> (task-pipeline)" -R <repo>`.
  **"Ya existe" NO es fallo**: se aplica la label igualmente (régimen permanente). Solo un fallo **real** (p.ej. sin
  permiso) degrada → proyecta la issue **sin** esa label + aviso. Aplicar con `--label`. Si el `package` tiene
  caracteres no válidos para una label de GitHub, **sanea o degrada** (sin bloquear el `.md`).
- **Padre (plan)**: labels `plan` (como hoy; crear si falta ya está contemplado) **+** `pkg:<package>`.
- **Sub-issue (tarea)**: label `pkg:<package>` + `--parent <nº-padre>` (como hoy).
- **Alta en el Project** (solo si `features.github-tracking.project` está): resolver `<owner>` del `repo`; añadir la
  issue (`gh project item-add <project> --owner <owner> --url <url>`) y fijar Status **`Backlog`**
  (`gh project item-edit … --single-select-option-id <id-de-Backlog>`), resolviendo el id de opción **por nombre,
  case-insensitive**. Si no hay `project`, o la opción no existe, o falla (403/red), o el item **ya está** en el
  Project (re-run) → **salta + avisa** (no duplica, no bloquea).
- **Type**: **NO** se pasa `--type` (org-only; omitido — dejar comentario que lo explique).
- **`depends_on`**: **NO** se proyecta como dependencia nativa de GitHub; a lo sumo una nota de texto en el body.
- Mantener intactas: idempotencia por `issue:` (re-run no duplica issue ni item de Project), exactly-once (escribir
  `issue:` inmediatamente), fronteras de tamaño (0/100/101+), y "si el `create` del padre falla → no crees
  sub-issues sueltas + el `.md` se materializa igual".

## Scenarios (Gherkin)

```gherkin
Feature: Proyección enriquecida al crear la issue (Paso 5.7)

  Scenario: La sub-issue recibe el cuerpo completo de la tarea, sin frontmatter, con banner y link
    Given una tarea recién creada con frontmatter y secciones Description/Spec/Scenarios/Provides/DoD
    And features.github-tracking.enabled es true con gh autenticado y con escritura
    When se proyecta la tarea a su sub-issue
    Then el body de la issue contiene las secciones del .md sin el bloque de frontmatter
    And empieza con el banner de espejo que nombra la ruta del .md
    And termina con un link a la ruta del .md

  Scenario: El padre recibe el cuerpo del plan con las labels plan y pkg
    Given un plan sin issue: y una o más tareas
    When se proyecta el plan a su issue PADRE
    Then el body del padre es el cuerpo del plan sin frontmatter, con banner y link
    And el padre lleva las labels "plan" y "pkg:<package>"

  Scenario: La label pkg se crea si no existe y se aplica a la issue
    Given el repo no tiene la label "pkg:task-pipeline"
    When se proyecta una issue del package task-pipeline
    Then la label "pkg:task-pipeline" se crea antes de aplicarla
    And la issue queda etiquetada con "pkg:task-pipeline"

  Scenario: Si crear la label falla, la issue se proyecta igual con aviso
    Given la creación de la label pkg falla (p.ej. sin permiso)
    When se proyecta la issue
    Then la issue se crea sin la label pkg
    And se emite un aviso
    And la materialización del .md no se bloquea

  Scenario: La issue se da de alta en el Project con Status Backlog
    Given features.github-tracking.project apunta a un Project accesible con campo Status
    When se crea la issue
    Then la issue queda como item del Project
    And su Status inicial es "Backlog" resuelto por nombre case-insensitive

  Scenario: Sin project configurado, la issue se crea igual sin tocar el tablero
    Given features.github-tracking.project no está configurado
    When se proyecta la issue
    Then la issue se crea con su body y label
    And no se intenta ninguna operación de Project

  Scenario: Nunca se pasa el issue-type nativo
    Given cualquier proyección de tarea
    When se construye el comando gh issue create
    Then no incluye la opción --type

  Scenario Outline: Título/body adversario no rompe el shell
    Given una tarea cuyo título o cuerpo contiene <caracter>
    When se construye el comando de creación
    Then el título va como argumento de --title y el body vía --body-file, sin interpolar en shell

    Examples:
      | caracter        |
      | comillas dobles |
      | backticks       |
      | signo dólar     |

  # --- Añadidos por scenario-coverage (QA) ---

  Scenario: El stripping solo quita el frontmatter inicial, no los --- internos del cuerpo
    Given una tarea cuyo cuerpo contiene una línea "---" (regla horizontal o dentro de un bloque de código)
    When se construye el body de la issue
    Then solo se elimina el bloque de frontmatter delimitado por el primer par de ---
    And las líneas "---" del cuerpo se conservan

  Scenario: Un cuerpo que supera el límite de body de GitHub se trunca sin romper
    Given una tarea cuyo cuerpo sin frontmatter supera el máximo de body de una issue
    When se proyecta la tarea
    Then el body se trunca y cierra con una nota "(truncado — ver el .md)"
    And conserva el banner y el link
    And no se produce un fallo de gh por longitud

  Scenario: Si la label pkg ya existe, la issue se etiqueta igual (no se degrada)
    Given el repo ya tiene la label "pkg:task-pipeline" de una proyección anterior
    When se proyecta una issue del package task-pipeline
    Then "ya existe" no se trata como fallo
    And la issue queda etiquetada con "pkg:task-pipeline"

  Scenario: Un fallo real de creación de la label degrada sin bloquear el .md
    Given la creación de la label pkg falla por falta de permiso
    When se proyecta la issue
    Then la issue se crea sin la label pkg con aviso
    And la materialización del .md no se bloquea

  Scenario Outline: Un package con caracteres problemáticos no rompe la proyección
    Given una tarea cuyo package es <package>
    When se deriva y aplica la label pkg
    Then la label se crea/aplica saneada, o se degrada con aviso sin bloquear el .md

    Examples:
      | package      |
      | con espacios |
      | May/Uscul@s  |

  Scenario: Con project configurado, un fallo de tablero no bloquea la creación
    Given features.github-tracking.project apunta a un Project pero item-add/item-edit devuelve error (403/red)
    When se crea la issue
    Then la issue se crea con su body y label pkg
    And la operación de Project se salta con aviso
    And la materialización del .md no se bloquea

  Scenario: Si el Project no tiene la opción Backlog, el item se añade sin fijar Status
    Given el campo Status del Project no tiene ninguna opción que case (case-insensitive) con "Backlog"
    When se da de alta la issue en el Project
    Then el item queda en el Project sin fijar Status inicial
    And se emite un aviso

  Scenario: Re-proyectar un .md que ya tiene issue: no duplica y re-vuelca el body
    Given una tarea cuyo .md ya tiene issue:, cuya issue ya es item del Project, y cuyo cuerpo cambió
    When se re-ejecuta la proyección explícita (re-run de /plan-task o /doctor)
    Then no se crea una segunda issue ni un segundo item de Project
    And re-aplicar la label pkg no produce error
    And el body de la issue se re-genera desde el .md (cuerpo sin frontmatter + banner + link)

  Scenario: Si el create del padre falla, no se crean sub-issues sueltas
    Given features.github-tracking activo pero gh issue create del PADRE devuelve error
    When se proyecta el plan
    Then no se crea ninguna sub-issue
    And el plan y las tareas quedan materializados en .md con aviso

  Scenario: depends_on no se proyecta como dependencia nativa
    Given una tarea con depends_on no vacío
    When se proyecta a su sub-issue
    Then no se crea ninguna relación de dependencia nativa en GitHub
    And como mucho aparece como nota de texto en el body
```

## Provides

El **body y las labels base** de la issue (cuerpo completo + `pkg:<package>` + alta en Project con `Backlog`) sobre
los que la tarea 02 aplica las **transiciones de estado** (assignee, `status:*`, Status del Project). La tarea 02
asume que una issue ya proyectada tiene su item en el Project y su label `pkg:`.

## Definition of Done

- [ ] Spec cumplida; Paso 5.7 actualizado (body completo+banner+link, `pkg:` label, alta en Project `Backlog`, sin `--type`).
- [ ] Escenarios Gherkin verificados **por inspección + ejecución de la proyección** contra `drossan/claude-plugins` (stack `none`: sin runner de tests; TDD/mutation = **N/A**, ver CLAUDE.md).
- [ ] Gate de `fact-checker` superado — afirmaciones de la sesión verificadas (INCORRECTO bloquea) · no-negociable.
- [ ] Proyección de estado a GitHub al cerrar la tarea (issue → done/close) — best-effort · `features.github-tracking`.
- [ ] Documentación: doc técnica (el propio SKILL.md) + histórico en `.claude/context/task-pipeline/task-pipeline-github-tracking-enrichment-01.md`.
- [ ] Barrido `grep` sin identificadores muertos; coherencia con lifecycle (tarea 02) no rota.
