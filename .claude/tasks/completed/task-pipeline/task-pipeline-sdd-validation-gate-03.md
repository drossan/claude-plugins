---
id: task-pipeline-sdd-validation-gate-03
package: task-pipeline
plan: sdd-validation-gate
status: done
priority: 1
depends_on: [task-pipeline-sdd-validation-gate-01]
estimate: 2h
actual: ~45m
issue: 54
created: 2026-08-14
updated: 2026-08-14
---

# Cablear `sdd-lint` como gate de cierre (gated `features.sdd`) + reconocimiento en `/doctor`

## Description

Integra la skill `sdd-lint` (01) como **gate de cierre**: corre en la DoD (con `features.sdd` on),
**antes de `fact-checker`** (secuencia `mutation → sdd-lint → fact-checker`, que lo atestigua). Un **ERROR
bloquea** el cierre (como `fact-checker` `INCORRECTO`); AVISO se reconoce. `/doctor` reconoce el gate
(ausencia ≠ drift con SDD off). Con `features.sdd` off (default) **nada cambia**.

## Spec

- **Línea de DoD** gated `· solo si features.sdd` en `templates/task.md` + las dos `task-lifecycle`: "Gate
  `sdd-lint` superado — artefactos SDD sin ERROR de formato/completitud (AVISO se reconoce)".
- **"Cerrar una tarea"** (2×lifecycle): paso condicional — con `features.sdd` on, tras `mutation` y **antes de
  `fact-checker`**, corre `sdd-lint`; **ERROR bloquea** hasta corregir; `fact-checker` luego **atestigua** "el
  gate `sdd-lint` pasó" (como atestigua mutation).
- **`plan-task/SKILL.md`**: nota — `sdd-lint` es gate de cierre (no fase de `/plan-task`); tabla de flags no
  cambia (es intrínseco a `features.sdd`, sin flag propio).
- **`/doctor`**: reconoce la skill `sdd-lint` como parte de la capa SDD; su **ausencia no es drift** con
  `features.sdd` off (coherente con cat. 2). Si SDD on y la skill falta (repo desalineado) → ofrecer alinear
  (actualizar el plugin, solo-reporte, plugin-owned).
- **Off = byte-idéntico a hoy**: sin `features.sdd`, ni la línea ni el paso aparecen.
- **Hardening (scenario-coverage)** — materializar en el Gherkin:
  - Tarea que declara **"sin cambios de spec/CU"** con `features.sdd` on: el gate **sí corre** sobre el
    package (puede bloquear por rot preexistente) — decidir/declarar; **recomendado**: corre igual (la
    validez del package no depende de si esta tarea lo tocó).
  - **`features.mutation-gate: false`** (sin gate de mutation): la secuencia colapsa a `sdd-lint →
    fact-checker` (no se salta `sdd-lint`).
  - **`features.sdd` no-canónico** (`"true"` string) al cerrar → fail-safe **off** (como el resto del plugin);
    el gate no corre.
  - **`sdd-lint` no puede ejecutarse** (falla la invocación, no que reporte ERROR) → se avisa y **no** se
    marca el cierre como "gate pasado" (no falso-verde).
  - **Convivencia inline↔CU** (igual que tarea 01): una tarea con Gherkin inline pre-flag no bloquea por
    "enlace roto".
  - **Idempotencia**: tras corregir el ERROR, re-cerrar ya no bloquea.

## Fuera de alcance

- La skill (01), el helper Bash (02), `checkTemplate`/fix MADR (04).
- Un flag propio para el gate (es intrínseco a `features.sdd`, decidido en grilling).

## Scenarios (Gherkin)

```gherkin
Feature: sdd-lint como gate de cierre

  Scenario: la línea de DoD aparece solo con SDD on
    Given `features.sdd` on
    When se materializa una tarea
    Then su DoD incluye "Gate `sdd-lint` superado"
    And con `features.sdd` off esa línea NO aparece

  Scenario: secuencia de cierre mutation → sdd-lint → fact-checker
    Given `features.sdd` on y una tarea que toca artefactos SDD
    When se cierra
    Then `sdd-lint` corre tras `mutation` y antes de `fact-checker`
    And `fact-checker` atestigua que el gate `sdd-lint` pasó

  Scenario: ERROR de sdd-lint bloquea el cierre
    Given `sdd-lint` reporta un ERROR de formato/completitud
    When se intenta cerrar la tarea
    Then el cierre se bloquea hasta corregir (como `fact-checker` INCORRECTO)

  Scenario: AVISO no bloquea
    Given `sdd-lint` reporta solo AVISOS
    When se cierra la tarea
    Then los avisos se reconocen y el cierre no se bloquea

  Scenario: doctor no reporta la ausencia como drift con SDD off
    Given un repo sin la capa SDD y `features.sdd` off
    When corro `/doctor`
    Then NO reporta `sdd-lint` ausente como drift

  Scenario: off = comportamiento actual
    Given `features.sdd` off (default)
    When se cierra una tarea
    Then no corre `sdd-lint` ni aparece su línea de DoD (byte-idéntico a hoy)
```

## Provides

El gate `sdd-lint` cableado en el cierre (DoD + lifecycle) — el contrato que sigue una sesión con SDD on.

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [x] Spec cumplida; DoD espejo consistente (task.md ↔ 2×lifecycle)
- [x] Gate de `fact-checker` superado — en especial "off = idéntico a hoy" · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `task.md` + 2×lifecycle + `plan-task/SKILL.md` + `doctor/SKILL.md` + CHANGELOG · technical-docs
- [x] Histórico de la tarea — session log · context-log
- [x] Barrido `grep` reforzado: DoD espejo consistente; sin identificadores muertos
