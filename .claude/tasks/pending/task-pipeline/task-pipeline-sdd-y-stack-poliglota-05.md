---
id: task-pipeline-sdd-y-stack-poliglota-05
package: task-pipeline
plan: sdd-y-stack-poliglota
status: pending
priority: 1
depends_on: [task-pipeline-sdd-y-stack-poliglota-04]
estimate: 2h
actual:
issue: 42                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#42
created: 2026-08-13
updated: 2026-08-14
---

# Flag `features.sdd` (booleano, opt-in)

## Description

Añade el flag opt-in **`features.sdd`** (booleano) en **todas** las sedes del schema, con el patrón exacto
de `caveman`/`github-tracking`: **default off, fuera de todo preset, ausencia ≠ drift, fail-safe** (solo
`true` booleano activa). Es **booleano**, no bloque (F5 del design-review: al cortar el sitio, no hay
sub-toggle `.site` que justifique la forma-bloque; añadir `.site` luego sería aditivo). La **doc de esta
feature** (página de portal + fila de tabla + entrada de CHANGELOG del flag) se escribe **en esta tarea**.

## Spec

- **YAML seed** (`templates/task-pipeline.yml`): `# sdd: false` **comentado** en `features:`, con la nota
  opt-in/fail-safe (solo `true` activa; ausente/`false`/no-canónico → off) y "fuera de preset · ausencia no
  es drift". El template **no impone** (comentado).
- **README**: fila `features.sdd` en la tabla de flags + una **sección `## SDD nativo (opcional)`** con la
  parte del **flag** (qué es, opt-in, fail-safe, qué envía — plantillas de la tarea 04). El **flujo**
  imperativo se documenta en la tarea 06 (append a esta sección).
- **Ambas copias de `task-lifecycle`** (`templates/` + `docs/guides/`): fila `features.sdd` en su tabla de
  flags, con la misma redacción "opt-in, no gate de DoD salvo con flag on, ausencia ≠ drift".
- **`plan-task/SKILL.md`**: fila `features.sdd` en el contrato de config (Paso "Config del repo").
- **Portal**: `website/features/sdd.md` (Activar / Qué envía / Garantías opt-in) + **registrar** la página
  en el grupo `Opcional` del sidebar en `website/.vitepress/config.mts` (para que no quede huérfana).
- **CHANGELOG**: entrada `### Added` del flag con la tranquilización "opt-in default off — comportamiento
  por defecto idéntico" (la consolidación de versión la hace la tarea 08).
- **Fail-safe**: solo `features.sdd: true` (booleano) activa; ausente / `false` / `"true"` / `yes` / `1` /
  comentado → **off**. **Fuera de todo preset** (`mode: full` NO lo enciende). **Ausencia ≠ drift**.

## Fuera de alcance

- El **flujo SDD imperativo** y la **línea de DoD** (tarea 06).
- Las **plantillas** (tarea 04) y el **seed del sitio** (diferido).

## Scenarios (Gherkin)

```gherkin
Feature: Flag opt-in features.sdd

  Scenario: el flag aparece en todas las sedes del schema
    Given el cambio aplicado
    Then `features.sdd` está en: seed YAML (comentado), tabla de flags de README + sección SDD,
         las dos tablas de flags de lifecycle, y el contrato de `plan-task/SKILL.md`

  Scenario Outline: fail-safe — solo `true` activa
    Given `features.sdd: <valor>`
    When se resuelve la config
    Then SDD está ON solo si <activo>

    Examples:
      | valor     | activo |
      | true      | sí     |
      | false     | no     |
      | "true"    | no     |
      | yes       | no     |
      | 1         | no     |
      | TRUE      | no     |
      | (ausente) | no     |

  Scenario: fuera de preset
    Given `mode: full` sin `features.sdd`
    When se resuelven las features
    Then ningún preset enciende `features.sdd` (debe ser explícito)

  Scenario: ausencia no es drift
    Given un repo sin `features.sdd`
    When corre `/doctor` (implementado en 07)
    Then la ausencia NO se reporta como drift

  Scenario: features.sdd como bloque en vez de booleano
    Given `features.sdd: { enabled: true }` (forma de bloque, no booleana)
    When se resuelve la config
    Then SDD queda OFF (valor no-canónico) sin producir un error de parseo

  Scenario: página de portal registrada
    Given `website/`
    Then existe `features/sdd.md`
    And está registrada en el grupo `Opcional` del sidebar en `.vitepress/config.mts`
```

## Provides

El flag booleano `features.sdd` (default off, fail-safe) + su superficie de doc; el gate on/off que leen la
DoD y el flujo de la tarea 06 y el reconocimiento de `/doctor` (tarea 07).

## Definition of Done

- [ ] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep`)
- [ ] Spec cumplida; `Provides` disponible para 06/07
- [ ] Gate de `fact-checker` superado — en especial "el flag está en las N sedes" y "fail-safe solo true" · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [ ] Doc técnica: fila en tabla de flags (README + 2×lifecycle) + `plan-task/SKILL.md` + `website/features/sdd.md` + `config.mts` + entrada CHANGELOG · technical-docs
- [ ] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-05.md` · context-log
- [ ] Barrido `grep` reforzado: tablas de flags espejo consistentes (README ↔ 2×lifecycle)
