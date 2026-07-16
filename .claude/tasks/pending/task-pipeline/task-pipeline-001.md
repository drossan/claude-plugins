---
id: task-pipeline-001
package: task-pipeline
plan: grilling-and-model-routing
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 2h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Parte A — Rename `grill-me`→`grilling` + sync upstream + propagación + fix `bootstrap.sh`

## Description

Alinear la skill de interrogatorio con upstream (`mattpocock/skills` → `grilling`, MIT): renombrar
`skills/grill-me/` → `skills/grilling/`, adoptar el texto/description nuevos verbatim, y **propagar** el
identificador `grill-me`→`grilling` en todas las referencias vivas del repo. Además, cerrar dos
**regresiones vivas** del rename 0.8.0 detectadas en `design-review` y `scenario-coverage`:
`bootstrap.sh` apunta a un directorio de plantillas inexistente, y el comando viejo `/task` sigue vivo
en las cabeceras de los `task-pipeline.yml`.

## Spec

- Renombrar dir `task-pipeline/skills/grill-me/` → `task-pipeline/skills/grilling/`.
- `grilling/SKILL.md`: `name: grilling`; `description` y `body` **verbatim de upstream** (la description
  ya contiene "any 'grill' trigger phrases" → preserva el disparador NL "grill me"); conservar el
  comentario de atribución (actualizado: "basada en `grilling` (antes `grill-me`) de Matt Pocock…").
- Propagar `grill-me`→`grilling` (prosa/headers/descripciones): `skills/plan-task/SKILL.md` (incl.
  header "Paso 4"), `skills/design-review/SKILL.md`, `skills/task-init/SKILL.md`, plantillas
  (`task-lifecycle.md`, `plan.md`, `HOW-TO-START-A-TASK.md`, `task-pipeline.yml`), docs
  (`task-pipeline/README.md`, `docs/flujo-del-pipeline.md`, `docs/guides/task-lifecycle.md`, root
  `README.md`), metadatos (`plugin.json`, `marketplace.json`), `.claude/task-pipeline.yml` (L14).
- **Fix regresión #1** — `bootstrap.sh:20`: `.../skills/task/templates` → `.../skills/plan-task/templates`.
- **Fix regresión #2** — comando viejo `/task`→`/plan-task` en las cabeceras `.claude/task-pipeline.yml:3`
  y `templates/task-pipeline.yml:3` (y cualquier `skills/task/` residual). Restos del rename 0.8.0.
- **Allowlist del barrido**: son legítimas y NO se tocan las menciones de `grill-me` en (a) atribución
  (comentario de `SKILL.md` + `THIRD-PARTY-NOTICES.md`) y (b) CHANGELOG ≤ 0.8.1. Solo desaparecen los
  identificadores **operativos** (nombre de skill, comando, ruta de directorio, header de paso).
- Atribución: `THIRD-PARTY-NOTICES.md` (título `## …/skills/grilling` + nota "corresponde a `grilling`
  actual"); crédito a Matt Pocock en ambos README apuntando a `grilling`.

## Scenarios (Gherkin)

```gherkin
Feature: Skill de interrogatorio alineada con upstream `grilling`

  Scenario: La skill se invoca por su nombre nuevo
    Given el plugin task-pipeline instalado
    When el usuario invoca el comando del interrogatorio
    Then responde la skill `grilling`
    And ya no existe una skill llamada `grill-me`

  Scenario: El disparador en lenguaje natural sigue vivo con la description verbatim
    Given la description de `grilling` adoptada verbatim de upstream
    When el usuario pide "grill me" sobre un plan
    Then se activa `grilling` (la description incluye "any 'grill' trigger phrases")

  Scenario: El barrido distingue las menciones históricas legítimas
    Given el repositorio tras el rename
    When se barre "grill-me" en el repo
    Then las únicas apariciones vivas son las de la atribución (SKILL.md, THIRD-PARTY-NOTICES.md)
         y el historial del CHANGELOG (≤ 0.8.1)
    And no queda ningún "grill-me" como identificador operativo (skill, comando, ruta, header)

  Scenario: No quedan referencias vivas al comando viejo `/task`
    Given el repositorio tras el rename 0.8.0
    When se barren los identificadores históricos `/task` (comando) y `skills/task/`
    Then solo aparecen en el CHANGELOG (≤ 0.8.1)
    And ni `.claude/task-pipeline.yml` ni `templates/task-pipeline.yml` los citan como comando/ruta vivos

  Scenario: El hook de bootstrap apunta a una ruta de plantillas que existe
    Given el hook SessionStart `bootstrap.sh` con CLAUDE_PLUGIN_ROOT resuelto al root real del plugin
    When resuelve su directorio de plantillas
    Then apunta a un directorio que existe (`skills/plan-task/templates`)

  Scenario: El hook restaura la guía cuando falta en un repo adoptado
    Given un repo que ya adoptó la convención pero sin `docs/guides/task-lifecycle.md`
    When arranca la sesión y corre el hook de bootstrap
    Then el hook restaura la guía desde la plantilla del plugin

  Scenario: El hook corregido no toca un repo ya sano (no-op silencioso)
    Given un repo adoptado con `docs/guides/task-lifecycle.md` presente
    When arranca la sesión y corre el hook con la ruta corregida
    Then el hook no restaura nada y no emite additionalContext

  Scenario: La atribución refleja el nombre actual
    Given `THIRD-PARTY-NOTICES.md` y ambos README
    When se lee la atribución de la skill de terceros
    Then acredita a Matt Pocock y apunta a `grilling` (antes `grill-me`)
```

## Provides

- La skill se llama `grilling` (comando `/task-pipeline:grilling`) — nombre estable que consumen 002/004.
- `bootstrap.sh` con ruta correcta + `task-pipeline.yml` sin `/task` vivo — estado sano de referencia
  que 003 (`doctor`) usa para detectar drift sin marcar la propia plantilla del plugin.

## Definition of Done

> Stack `none`: TDD y mutation = **N/A**; escenarios = spec de comportamiento; verificación manual/script.
> TSDoc = N/A (Markdown/Bash).
- [ ] Cada escenario verificado manualmente o por script.
- [ ] Barrido reforzado (no solo un string): `grill-me`, `/task` (comando), `skills/task/` → solo restos
      legítimos (allowlist: atribución + CHANGELOG ≤ 0.8.1); `test -d` de la ruta del hook (con root real) OK.
- [ ] Spec cumplida; `Provides` disponible para 002/003/004.
- [ ] Doc técnica: atribución (`THIRD-PARTY-NOTICES.md` + READMEs) al día.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-001.md`.
- [ ] Commit `task-pipeline-001: feat!: rename grill-me → grilling + sync upstream + fix bootstrap/task drift`.
