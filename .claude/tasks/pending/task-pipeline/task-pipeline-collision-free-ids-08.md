---
id: task-pipeline-collision-free-ids-08
package: task-pipeline
plan: collision-free-ids
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-collision-free-ids-07]
estimate: 3h
actual:
created: 2026-07-23
updated: 2026-07-23
---

# Proyección md→GitHub tejida en `/plan-task` (condicional por flag)

## Description

Tejer en `/plan-task`, como **pasos condicionales por flag**, la creación de la proyección GitHub al
materializar un plan y sus tareas: issue **padre** para el plan + **sub-issues** para las tareas, con
idempotencia vía `issue:`. Fuente de verdad = el `.md`; GitHub = proyección one-way. Depende de -07 (flag +
campo). Riesgos aceptados I1 (contamina el playbook default con ramas condicionales) y C3 (best-effort).
El cierre del padre y la disciplina concurrente viven en `-12`; el estado de tarea en `-09`.

## Spec

- **`task-pipeline/skills/plan-task/SKILL.md`** — nuevos pasos **condicionales** (solo si
  `features.github-tracking.enabled` **y** `gh` autenticado con permiso de escritura **y** el repo es de
  GitHub):
  - **Resolver `repo`**: de `features.github-tracking.repo` o, si ausente, del remoto por defecto
    (`gh repo view --json nameWithOwner -q .nameWithOwner`). **Spec implícita**: si hay múltiples remotos
    (fork `origin` vs `upstream`), documentar cuál se usa (el que resuelve `gh repo view`) y recomendar fijar
    `repo` para desambiguar.
  - **Label/issue-type**: si se usa `--label plan`, **crear la label si no existe** (`gh label create`) o
    degradar (crear sin label + aviso); si `issue-type-plan` está configurado y disponible, usarlo.
  - **Plan → issue padre**: `gh issue create` (título = título del plan, body = resumen + link al `.md`).
  - **Task → sub-issue**: por cada tarea, `gh issue create --parent <nº-padre>`; **si el padre falló, NO
    crear sub-issues sueltas** → abortar la proyección del plan (avisar), el `.md` se materializa igual.
  - **Escribir `issue: <n>`** en el frontmatter de cada `.md` **inmediatamente tras** crear su issue
    (minimiza la ventana del exactly-once; ver degradación).
  - **Idempotencia**: si el `.md` **ya** tiene `issue:`, **no** crear; actualizar con `gh issue edit`. Si el
    número ya **no existe** en GitHub (borrada a mano) → **avisar** y dejar a `-10` (no recrear a ciegas).
  - **Títulos adversarios**: construir el comando de forma segura ante títulos con comillas, backticks,
    `$` o markdown (no romper el shell; el markdown en el título es cosmético, aceptable).
  - `depends_on`: NO se proyecta como dependencia nativa; como mucho, nota de texto en el body.
- **Degradación / fallos (C3)** — en todos estos casos **avisar y continuar**; el `.md` es la verdad y el
  plan se materializa igual (proyección no-op parcial, nunca aborta la materialización del `.md`):
  `gh` ausente/viejo (sin `--parent`) · sin red · repo no-GitHub · `gh` sin auth · **authed sin permiso de
  escritura (403)** · rate-limit/error a mitad de bucle (estado parcial: unas issues creadas, otras no →
  el re-run reanuda idempotente por `issue:`).
- **NO** tocar el cierre de tarea (`-09`), el cierre de plan/concurrencia (`-12`) ni `/doctor` (`-10`).

## Scenarios (Gherkin)

```gherkin
Feature: Proyección md→GitHub al planificar (condicional, one-way)

  Scenario: Con el flag on, plan y tareas se proyectan como padre + sub-issues
    Given un repo de GitHub con gh autenticado (escritura) y github-tracking.enabled: true
    When /plan-task materializa un plan con N tareas
    Then se crea una issue padre para el plan
    And se crea una sub-issue por tarea con --parent apuntando al padre
    And cada .md gana issue: <n> en su frontmatter

  Scenario: La label plan se crea si no existe antes de proyectar
    Given un repo de GitHub sin la label "plan"
    When /plan-task proyecta con el flag on
    Then se crea la label "plan" (o se usa el issue type) antes del create
    And si no se puede crear, se degrada (crear sin label + aviso), no aborta

  Scenario: Idempotencia — re-sync no duplica
    Given un plan ya proyectado (sus .md tienen issue:)
    When se vuelve a ejecutar la proyección
    Then no se crean issues nuevas
    And se actualizan las existentes con gh issue edit

  Scenario: Fallo tras crear la issue y antes de escribir issue: no duplica en re-run
    Given una issue creada en GitHub cuyo .md no llegó a recibir issue: (crash intermedio)
    When se re-ejecuta la proyección
    Then NO se crea una segunda issue para ese .md (se detecta / se avisa del riesgo)
    And si no se puede garantizar, el playbook lo declara como límite best-effort

  Scenario: Si falla el padre, no se crean sub-issues sin --parent
    Given el flag on pero gh issue create del padre falla
    When /plan-task proyecta el plan
    Then NO se crean sub-issues sueltas y se avisa; el .md se materializa igual

  Scenario: Fallo parcial a mitad de bucle (rate-limit) reanuda idempotente
    Given un plan de N tareas donde la 4ª sub-issue devuelve error/429
    When se re-ejecuta la proyección
    Then las ya creadas no se duplican (tienen issue:) y se completan las que faltan

  Scenario Outline: Degradación a no-op en cada modo de fallo
    Given github-tracking en estado <estado>
    When /plan-task materializa un plan
    Then no se aborta la materialización del .md
    And se avisa del fallo de proyección (no-op)

    Examples:
      | estado                         |
      | flag ausente / enabled: false  |
      | sin red                        |
      | repo no-GitHub                 |
      | gh sin autenticar              |
      | gh authed sin permiso (403)    |
      | gh viejo sin --parent          |

  Scenario: issue: apunta a una issue borrada a mano
    Given un .md con issue: <n> cuya issue fue borrada en GitHub
    When se re-ejecuta la proyección
    Then gh issue edit falla → se avisa y se deja la reconciliación a /doctor (no se recrea a ciegas)

  Scenario: Título con comillas/backticks/markdown no rompe el comando
    Given una tarea cuyo título contiene comillas, backticks o $
    When se proyecta
    Then la issue se crea con ese título de forma segura (sin romper el shell)

  Scenario Outline: Fronteras de tamaño del plan
    Given un plan con <n> tareas y el flag on
    When se proyecta
    Then <resultado>

    Examples:
      | n   | resultado                                                        |
      | 0   | solo se crea el padre, sin sub-issues                            |
      | 100 | se crean 100 sub-issues                                          |
      | 101 | la 101ª supera el tope de GitHub → se avisa (límite conocido)     |
```

## Provides

- La proyección inicial (plan padre + sub-issues) y el `issue:` poblado en los `.md`, que consumen `-09`
  (cierre de tarea), `-12` (cierre de plan / concurrencia) y `-10` (reconciliación).

## Definition of Done

- [ ] Tests TDD — **N/A** (stack `none`).
- [ ] Cada escenario Gherkin verificado en un **repo de prueba de GitHub con `gh` autenticado** y con los
      modos de fallo (flag off / sin red / repo no-GitHub / 403 / gh viejo).
- [ ] Spec cumplida; proyección one-way, idempotente, con degradación a no-op y sin abortar el `.md`.
- [ ] Gate de mutation — **N/A**.
- [ ] Gate de `fact-checker` superado. **Reconocer que la verificación con GitHub en vivo es NO VERIFICABLE
      de forma reproducible en `stack:none`** (repo en vivo, manual). **No-negociable.**
- [ ] Doc: **TSDoc N/A**; **doc técnica** (el SKILL; la doc de usuario es `-11`); **histórico** en
      `.claude/context/task-pipeline/task-pipeline-collision-free-ids-08.md`.
- [ ] Barrido `grep` reforzado sin identificadores muertos.
