---
id: task-pipeline-007
package: task-pipeline
plan: honesty-and-verification
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 3
depends_on: []
estimate: 2.5h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Reglas de honestidad (`@import` opt-in) + no-duplicación (coding-standard)

## Description

Materializar las **reglas de honestidad** para que se lean **cada turno** SIN invadir el `CLAUDE.md` del
usuario (decisión R2): fichero de reglas + `@import` **opt-in** (`task-init` lo **sugiere**, `doctor` lo
**reporta** si falta, `bootstrap.sh` restaura solo el fichero — nunca se auto-edita el `CLAUDE.md`). La
regla de **no-duplicación** de código va como **coding-standard** (no honesty-rule): a
`.claude/specs/general/coding-standards.md`, donde el HOW-TO ya apunta.

## Spec

- **Nueva plantilla `templates/honesty-rules.md`** (semilla materializable) con las reglas del owner:
  verificar símbolo (función/clase/import) leyendo el fichero o con grep antes de afirmarlo — nunca
  inventar símbolos; si no se puede verificar → decir "No he verificado esto" y no escribir código que
  dependa de ello; preguntar antes de añadir una librería nunca referenciada; no afirmar éxito de
  tests/compilación sin haber ejecutado el comando en la sesión; nunca inventar mensajes de error /
  respuestas de API / trazas; ante la duda, "No lo sé" / "Necesito verificar primero" > suposición.
- **Materialización a `.claude/honesty-rules.md`** en el repo consumidor.
- **`task-init`**: materializa `.claude/honesty-rules.md` (si no existe) y **SUGIERE** al usuario añadir
  `@.claude/honesty-rules.md` a su `CLAUDE.md` — **no** lo escribe (mismo patrón que la sugerencia del HOW-TO
  hoy). Idempotente.
- **`doctor`**: en la fase de verificación, si `.claude/honesty-rules.md` falta o el `CLAUDE.md` no lo
  `@importa`, lo **reporta** (fase 1) y propone materializar el fichero / **sugiere** el `@import` — pero
  **no** edita el `CLAUDE.md` (respeta su invariante de no tocar prosa del usuario).
- **`bootstrap.sh`**: añade `.claude/honesty-rules.md` a los ficheros que restaura por `cp` si faltan
  (como `task-lifecycle.md`). **No** toca el `CLAUDE.md`.
- **No-duplicación** en `.claude/specs/general/coding-standards.md` (crear la spec si no existe): "no
  duplicar código bajo ningún concepto salvo aprobación explícita del usuario". `task-init` la materializa
  como parte de las specs generales.
- **`coding-standards.md` es user-owned** (SC-C): `task-init` lo materializa con la no-duplicación, pero
  `bootstrap.sh` **NO** lo restaura ni `doctor` lo vigila — igual que las otras specs generales que el
  HOW-TO referencia (`testing.md`, `error-handling.md`, `security.md`, `git-workflow.md`), que **siguen
  siendo punteros no materializados a propósito**. Solo `honesty-rules.md` entra en `bootstrap`/`doctor`.
- **`doctor` reporta `honesty-rules.md` ausente** (SC-B): en un repo adoptado sin el fichero, lo reporta y
  ofrece materializarlo (repo-owned, con diff + aprobación); el `@import` faltante lo **sugiere**, no lo añade.

## Scenarios (Gherkin)

```gherkin
Feature: Reglas de honestidad materializadas sin invadir el CLAUDE.md

  Scenario: task-init materializa el fichero de reglas y SUGIERE el @import
    Given un repo que se inicializa con task-init
    When corre la materialización genérica
    Then crea `.claude/honesty-rules.md` desde la plantilla
    And sugiere al usuario añadir `@.claude/honesty-rules.md` a su CLAUDE.md
    But no edita el CLAUDE.md

  Scenario: doctor reporta el @import ausente sin añadirlo
    Given un repo con `.claude/honesty-rules.md` pero cuyo CLAUDE.md no lo @importa
    When el usuario corre doctor
    Then reporta que el @import falta y sugiere añadirlo
    But no edita el CLAUDE.md

  Scenario: El hook restaura el fichero de reglas si se borra
    Given un repo adoptado al que le falta `.claude/honesty-rules.md`
    When arranca la sesión y corre bootstrap
    Then restaura `.claude/honesty-rules.md` desde la plantilla
    And no toca el CLAUDE.md

  Scenario: El hook no re-inyecta nada en el CLAUDE.md
    Given un repo cuyo usuario quitó el @import de su CLAUDE.md a propósito
    When arranca la sesión y corre bootstrap
    Then el CLAUDE.md queda intacto (el hook no lo edita)

  Scenario: La no-duplicación vive como coding-standard, no como honesty-rule
    Given los artefactos materializados
    When se busca la regla de no-duplicación
    Then está en `.claude/specs/general/coding-standards.md`
    And no en `.claude/honesty-rules.md`

  Scenario: task-init no pisa un honesty-rules.md existente
    Given un repo cuyo `.claude/honesty-rules.md` ya existe (posiblemente personalizado)
    When se corre task-init
    Then respeta el fichero sin sobrescribirlo e informa
    And sigue sugiriendo el @import si aún falta

  Scenario: task-init sugiere el @import aunque no exista CLAUDE.md
    Given un repo sin CLAUDE.md
    When task-init materializa honesty-rules.md
    Then sugiere crear/añadir `@.claude/honesty-rules.md` en un CLAUDE.md
    But no crea ni edita ningún CLAUDE.md por su cuenta

  Scenario: El hook no materializa nada en un repo no adoptado
    Given un repo que nunca adoptó la convención (sin marcadores .claude/…)
    When arranca la sesión y corre bootstrap
    Then no crea `.claude/honesty-rules.md`
    And sale como no-op silencioso

  Scenario: El hook no re-copia honesty-rules.md si ya está
    Given un repo adoptado cuyo `.claude/honesty-rules.md` ya existe
    When corre bootstrap
    Then deja el fichero intacto
    And no reporta cambios por ese fichero

  Scenario: doctor reporta un honesty-rules.md ausente y ofrece materializarlo
    Given un repo adoptado sin `.claude/honesty-rules.md`
    When el usuario corre doctor
    Then reporta que el fichero falta
    And ofrece materializarlo desde la plantilla (repo-owned) con diff + aprobación

  Scenario: coding-standards.md es user-owned (no se restaura ni se vigila)
    Given un repo cuyo `.claude/specs/general/coding-standards.md` se borró
    When arranca la sesión (bootstrap) y, aparte, se corre doctor
    Then bootstrap no lo restaura (como las otras specs generales testing/security/…)
    And task-init no lo pisa si ya existe
```

## Provides

- `.claude/honesty-rules.md` (+ su plantilla) leído cada turno una vez el usuario opta por el `@import`;
  la regla de no-duplicación en `specs/general/coding-standards.md`. Lo consume la 008 (registro/release).

## Definition of Done

> Stack `none`: verificación por inspección + correr `bootstrap.sh`/flujo en repos de prueba (con y sin
> CLAUDE.md, con y sin el fichero de reglas).
- [ ] Cada escenario verificado (fixtures: repo sin CLAUDE.md, con CLAUDE.md sin @import, fichero borrado).
- [ ] `bootstrap.sh`: `bash -n` OK; restaura el fichero; NUNCA toca el CLAUDE.md.
- [ ] `task-init`/`doctor` sugieren/reportan el `@import` sin auto-editarlo.
- [ ] No-duplicación en `specs/general/coding-standards.md`, no en `honesty-rules.md`.
- [ ] Spec cumplida; `Provides` disponible para 008.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-007.md`.
- [ ] Commit `task-pipeline-007: feat: reglas de honestidad (@import opt-in) + no-duplicación`.
