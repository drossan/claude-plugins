---
id: task-pipeline-003
package: task-pipeline
plan: grilling-and-model-routing
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: [task-pipeline-001, task-pipeline-002]
estimate: 3h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Parte C — Skill `doctor`: verifica y alinea un repo ya iniciado

## Description

Comando nuevo para **diagnosticar y alinear** un repo que YA adoptó la convención contra lo que espera
el plugin actual. Frontera con `/task-init` (bootstrap desde cero): `doctor` **no inicializa**, revisa
un repo existente. Flujo en dos fases (owner): **verificación read-only primero**; luego, **por cada
problema**, muestra el diff, propone el fix (preguntando qué opción si hay varias; si solo hay una, la
propone) y lo aplica **solo tras aprobación**. Nada se auto-edita a ciegas.

> `depends_on: [001, 002]` — `doctor` detecta la sección `models:` ausente, cuyo contrato define 002.

## Spec

- Nueva `skills/doctor/SKILL.md` (frontmatter `name: doctor` + description).
- **Fase 1 — verificación (read-only)**: detectar, sin editar: (a) identificadores de skill desfasados
  (`grill-me`, `/task`, `skills/task/`); (b) secciones de config ausentes esperadas (p.ej. `models:`);
  (c) rutas muertas en hooks; (d) estructura de convención incompleta. **Allowlist**: NO marcar las
  menciones históricas legítimas (CHANGELOG ≤ 0.8.1, atribución).
- **Fase 2 — fix interactivo por problema**: mostrar el diff **antes** de pedir aprobación; si hay
  varias opciones → preguntar cuál (`AskUserQuestion`); si una sola → proponerla; aplicar **solo tras
  aprobación**; prosa customizada/ambigua → reportar como aviso, NO auto-editar.
- **Fronteras de acción**: repo NO adoptado → informar y remitir a `/task-init`, sin crear/editar nada.
  Drift en un fichero del **propio plugin** (no del repo consumidor) → solo-reporte + remitir a
  actualizar el plugin (no editar el plugin). Idempotente: una 2ª pasada tras aplicar todo da "sano".
- **Robustez**: config YAML malformada → reportar legible, no abortar con error crudo. Fix aprobado que
  no puede aplicarse (fichero read-only o cambiado desde el diff) → reportar y dejar intacto.
- Registrar `doctor`: tabla de skills + lista de comandos namespaced (`/task-pipeline:doctor`) en ambos
  README, y en la descripción-prosa de `plugin.json`/`marketplace.json` (no hay array de skills).

## Scenarios (Gherkin)

```gherkin
Feature: `doctor` — verificación y alineación de un repo adoptado

  Scenario: Primero verifica sin tocar nada
    Given un repo con la convención adoptada
    When el usuario corre `doctor`
    Then reporta los problemas detectados sin haber editado ningún fichero

  Scenario: Repo sano
    Given un repo alineado con la versión actual del plugin
    When el usuario corre `doctor`
    Then informa que no hay problemas y no propone cambios

  Scenario: Detecta un identificador de skill desfasado (caso estrella)
    Given un repo cuyo docs/guides/task-lifecycle.md aún dice "grill-me" (o "/task", "skills/task/")
    When el usuario corre `doctor`
    Then lo reporta como drift y propone actualizarlo al identificador actual tras aprobación

  Scenario: Detecta una sección de config ausente
    Given un `.claude/task-pipeline.yml` sin sección `models:`
    When el usuario corre `doctor`
    Then propone añadirla (comentada) como fix seguro tras aprobación

  Scenario: Detecta una ruta muerta en un hook
    Given un hook cuyo directorio de plantillas no resuelve
    When el usuario corre `doctor`
    Then lo reporta en la fase de verificación

  Scenario: Detecta estructura de convención incompleta
    Given un repo adoptado al que le falta una carpeta esperada (p.ej. .claude/specs)
    When el usuario corre `doctor`
    Then lo reporta y propone crearla tras aprobación

  Scenario: El usuario ve el diff antes de aprobar
    Given un problema con un fix propuesto
    When `doctor` pide aprobación
    Then muestra el diff ANTES de que el usuario decida
    And solo escribe el fichero si la respuesta es aprobar

  Scenario: Problema con varias opciones de arreglo
    Given un problema que admite varias formas de arreglarlo
    When `doctor` lo presenta
    Then pregunta al usuario qué opción antes de aplicar nada

  Scenario: Procesa todos los problemas respetando cada decisión
    Given un repo con tres problemas detectados
    When el usuario aprueba el primero, rechaza el segundo y aprueba el tercero
    Then el estado final tiene aplicados solo el primero y el tercero
    And se recorrieron los tres sin saltarse ninguno

  Scenario: doctor es idempotente
    Given un repo en el que doctor ya aplicó todos los fixes aprobados
    When el usuario vuelve a correr `doctor`
    Then informa que no hay problemas y no propone cambios

  Scenario: doctor en un repo no adoptado no bootstrapea
    Given un repo que nunca adoptó la convención (sin ningún marcador)
    When el usuario corre `doctor`
    Then informa que no está inicializado y remite a /task-init, sin crear ni editar nada

  Scenario: La prosa customizada no se auto-edita
    Given drift en un documento materializado que el usuario personalizó
    When `doctor` lo detecta
    Then lo reporta como aviso y no lo edita automáticamente

  Scenario: No marca como drift las menciones históricas legítimas
    Given entradas de CHANGELOG ≤ 0.8.1 y la atribución que citan "grill-me" como nombre histórico
    When el usuario corre `doctor`
    Then no las propone como fixes

  Scenario: Drift en un artefacto del propio plugin es solo-reporte
    Given un problema localizado en un fichero del plugin (no del repo consumidor)
    When `doctor` lo detecta
    Then lo reporta y remite a actualizar el plugin, sin intentar editarlo

  Scenario: Config malformada no rompe la verificación
    Given un `.claude/task-pipeline.yml` con YAML inválido
    When el usuario corre `doctor`
    Then lo reporta como problema legible y no aborta con un error crudo

  Scenario: Un fix aprobado que no puede aplicarse se reporta sin corromper
    Given un fix aprobado sobre un fichero read-only o cambiado desde el diff mostrado
    When `doctor` intenta aplicarlo
    Then informa del fallo, deja el fichero intacto y continúa con el siguiente problema

  Scenario: doctor aparece en la superficie documental
    Given ambos README tras añadir doctor
    Then figura en la tabla de skills y en la lista de comandos namespaced (/task-pipeline:doctor)
    And la descripción-prosa de plugin.json/marketplace.json lo menciona de forma coherente
```

## Provides

- Comando `/task-pipeline:doctor` — alineación para repos ya iniciados. Su registro en metadatos lo
  consume 004 (CHANGELOG/`Added`). Nada más aguas abajo depende de él.

## Definition of Done

> Stack `none`: TDD y mutation = **N/A**; escenarios = spec de comportamiento; verificación manual
> (correr `doctor` sobre repos de prueba con drift inyectado y comprobar el flujo).
- [ ] Cada escenario verificado sobre repos de prueba (sano, con drift, no adoptado, YAML malformado).
- [ ] Fase 1 nunca edita; Fase 2 muestra diff antes de aprobar y aplica solo tras aprobación; idempotente.
- [ ] Allowlist: no marca menciones históricas; plugin-owned drift = solo-reporte; prosa customizada = aviso.
- [ ] `doctor` registrado en `plugin.json` / `marketplace.json` / tabla de skills + comandos de ambos README.
- [ ] Doc técnica: entrada de `doctor` en el README del plugin (qué hace, frontera con `task-init`).
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-003.md`.
- [ ] Commit `task-pipeline-003: feat: skill doctor (verifica y alinea repos ya iniciados)`.
