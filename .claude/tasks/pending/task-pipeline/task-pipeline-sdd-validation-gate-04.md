---
id: task-pipeline-sdd-validation-gate-04
package: task-pipeline
plan: sdd-validation-gate
status: pending
priority: 2
depends_on: [task-pipeline-sdd-validation-gate-01]
estimate: 2h
actual:
issue: 55
created: 2026-08-14
updated: 2026-08-14
---

# `/doctor` valida que las plantillas SDD pasan el lint + fix "MADR Architectural"

## Description

Dos piezas de coherencia (rescate GAINUP P7 + corrección de nomenclatura verificada):
1. **`/doctor` valida las PLANTILLAS SDD** (`spec.md`/`caso-de-uso.md`/`adr.md`/`adr-index.md`): deben pasar
   `sdd-lint` limpias — si la plantilla tiene el defecto, toda instancia nueva nace mal (P7, `checkTemplate`).
2. **Fix "MADR *Any*"→"*Architectural*"**: verificado en la research (ago-2026) que MADR **revirtió** de "Any"
   a "Architectural" Decision Records. Corregir las menciones **shipeadas** (plantillas/doc), no los históricos.

## Spec

- **`doctor/SKILL.md`**: nueva comprobación (categoría o extensión de la cat. 9/plantillas) — con `features.sdd`
  on, las plantillas SDD del repo consumidor deben **pasar `sdd-lint`**; si una plantilla materializada tiene
  un defecto de formato → reportarlo (repo-owned, corregible con diff+aprobación). Con SDD off → no evalúa.
  - **Plantillas del propio plugin**: son plugin-owned → solo-reporte + "actualiza el plugin".
- **Fix "Architectural"**: `grep -rn` de "Any Decision" / "Markdown Any" en `templates/adr.md`,
  `adr-index.md`, `templates/README.md`, README del plugin, portal — y corregir a "Architectural Decision
  Records" (MADR 4.0.0). **No** tocar session logs / CHANGELOG histórico (allowlist).
- **Coherencia**: tras el fix, `grep` de "MADR.*Any" en la superficie shipeada = 0.
- **Reescritura del token `[NECESITA ACLARACIÓN]` (Opción C, scenario-coverage)**: `templates/spec.md` hoy
  contiene el literal 4× como texto instructivo (líneas ~7/36/58/61). **Reescribir** esas menciones para que
  **no casen** el check de `sdd-lint` (p.ej. describir la convención sin el corchete crudo, o dejar la mención
  claramente como definición de la convención que el check excluye) → las plantillas **pasan el lint limpias**.
  El literal crudo queda reservado a **artefactos reales** (un `[NECESITA ACLARACIÓN: <pregunta real>]` en un
  `spec.md` materializado = pendiente = ERROR).
- **Hardening (scenario-coverage)**: plantilla **plugin-owned** con defecto → **solo-reporte** ("actualiza el
  plugin"), sin diff+aprobación (distinto de la materializada, que sí es corregible); alcance **global**
  (`adr.md`/`adr-index.md`, uno por repo) vs **per-package** (`spec.md`/CU) del check; contra-escenario
  "plantilla materializada ya limpia → no reporta"; idempotencia del fix; criterio "superficie shipeada vs
  histórico" por ruta (excluye `CHANGELOG.md` y `.claude/context/**`).

## Fuera de alcance

- La skill (01), el helper (02), el cableado del gate (03).
- Cambiar el contenido de MADR más allá del nombre (seguimos 4.0.0, 5 estados).

## Scenarios (Gherkin)

```gherkin
Feature: doctor valida plantillas SDD + nomenclatura MADR

  Scenario: doctor detecta una plantilla SDD que no pasa el lint
    Given `features.sdd` on y una plantilla `spec.md` materializada con un defecto de formato
    When corro `/doctor`
    Then reporta que la plantilla no pasa `sdd-lint` (corregible, con diff + aprobación)

  Scenario: con SDD off no evalúa las plantillas
    Given `features.sdd` off
    When corro `/doctor`
    Then no evalúa que las plantillas SDD pasen el lint

  Scenario: las plantillas del plugin pasan su propio lint
    Given las plantillas `spec.md`/`caso-de-uso.md`/`adr.md`/`adr-index.md` del plugin
    When corro `sdd-lint` sobre ellas
    Then salen limpias (sin ERROR) — no nacen defectuosas las instancias

  Scenario: nomenclatura MADR corregida a Architectural
    Given las plantillas/doc SDD shipeadas
    When busco "MADR ... Any" / "Markdown Any Decision"
    Then no hay coincidencias en la superficie shipeada (todo dice "Architectural", MADR 4.0.0)
    And los históricos (CHANGELOG/session logs) no se han tocado
```

## Provides

`/doctor` que vela por que las plantillas SDD pasen el lint; nomenclatura MADR coherente (Architectural).

## Definition of Done

- [ ] Escenarios Gherkin verificados como criterios de aceptación (inspección / `grep` / correr `sdd-lint` sobre las plantillas)
- [ ] Spec cumplida
- [ ] Gate de `fact-checker` superado — en especial "MADR es Architectural 4.0.0" y "plantillas pasan el lint" · no-negociable
- [ ] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [ ] Doc técnica: `doctor/SKILL.md` + plantillas SDD corregidas + CHANGELOG · technical-docs
- [ ] Histórico de la tarea — session log · context-log
- [ ] Barrido `grep` reforzado: sin "MADR Any" shipeado; sin identificadores muertos
