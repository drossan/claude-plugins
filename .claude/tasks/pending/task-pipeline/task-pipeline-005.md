---
id: task-pipeline-005
package: task-pipeline
plan: honesty-and-verification
status: pending          # pending | active | blocked | in-review | done | cancelled
priority: 1
depends_on: []
estimate: 2h
actual:
created: 2026-07-16
updated: 2026-07-16
---

# Skill `fact-checker` + `models.fact-checker`

## Description

Crear la skill `fact-checker` como **gate de verificación de afirmaciones**, con el **mismo molde** que
`design-review`/`scenario-coverage` (una skill que lanza un `subagent_type: general-purpose` con prompt
EXACTO inline, NO un artefacto `agents/` — decisión R1 del design-review). Verifica afirmaciones que Claude
hizo sobre el código/tests/librerías/imports; **nunca escribe código**; salida
VERIFICADO/INCORRECTO/NO VERIFICABLE. El modelo es config-driven (`models.fact-checker`, default inherit),
igual que los otros dos gates de subagente.

## Spec

- Nueva `skills/fact-checker/SKILL.md`: frontmatter `name: fact-checker` + `description` **honesta** —
  dispara por lenguaje natural ("verifica esto", "fact-check"), pero **no** promete auto-invocación "antes
  de cada commit" (el gate lo orquesta la DoD; ver task 006).
- Cuerpo con el molde de `design-review`:
  - **Paso 1** — reunir las afirmaciones factuales de la conversación reciente (código: "X hace Y";
    tests: "pasan"; librería: "Z soporta W"; import: "este import es correcto").
  - **Paso 2** — leer `models.fact-checker` en `.claude/task-pipeline.yml` (ausente/`inherit` → no pasar
    `model`; alias/id válido → pasarlo; inválido → aviso + inherit); lanzar `subagent_type: general-purpose`
    (tools de solo-lectura + Bash) con **prompt EXACTO** inline: verifica cada afirmación de forma
    independiente (código → leer el fichero; tests → ejecutar el comando **si hay stack**; librería →
    revisar el paquete/doc; import → confirmar en el manifiesto de dependencias); **nunca** aceptar "confía
    en mí"; **nunca** hacer afirmaciones propias; si no se puede verificar → **NO VERIFICABLE**.
  - **Paso 3** — presentar el informe sin filtrar: VERIFICADO (afirmación + evidencia fichero:línea o
    salida de comando), INCORRECTO (afirmación + lo que realmente es cierto), NO VERIFICABLE (afirmación +
    por qué).
- `models.fact-checker` en `.claude/task-pipeline.yml` (comentado/inherit; este repo no lo pinea) y en
  `templates/task-pipeline.yml` (comentado). Añadir `fact-checker` a la lista de **lectores** en la
  cabecera de ambos YAML (junto a `design-review`/`scenario-coverage`).
- **Extensión de `doctor`** (SC-B): al proponer/actualizar la sección `models:`, `doctor` incluye
  `fact-checker` como fase con subagente y su cabecera de lectores lo lista. `models.fact-checker`
  **ausente NO es drift** (default inherit, coherente con 0.9.0).

## Scenarios (Gherkin)

```gherkin
Feature: Verificación de afirmaciones (skill fact-checker)

  Scenario: Una afirmación de código verdadera se marca VERIFICADO con evidencia
    Given una afirmación reciente de que la función `foo` valida el email
    And el fichero fuente confirma esa validación
    When se corre fact-checker sobre la afirmación
    Then la reporta como VERIFICADO con la evidencia (fichero:línea)

  Scenario: Una afirmación falsa se marca INCORRECTO con lo que realmente es
    Given una afirmación de que "los tests pasan" que no se ejecutó
    When fact-checker la verifica y el comando de test falla
    Then la reporta como INCORRECTO con el resultado real

  Scenario: Una afirmación no comprobable se marca NO VERIFICABLE sin inventar
    Given una afirmación que no se puede verificar en este entorno
    When se corre fact-checker
    Then la reporta como NO VERIFICABLE con el motivo
    And no fabrica evidencia ni una conclusión

  Scenario: El subagente arranca con el modelo configurado
    Given `models.fact-checker` fijado a un alias válido en el YAML del repo
    When fact-checker lanza su subagente
    Then el subagente arranca con ese modelo

  Scenario: Sin pin, el subagente hereda el modelo de la sesión
    Given `models.fact-checker` ausente o en inherit
    When fact-checker lanza su subagente
    Then hereda el modelo de la sesión y no se fuerza ninguno

  Scenario: La description dispara por lenguaje natural pero no promete auto-invocación
    Given la description de fact-checker
    When se lee su texto
    Then invita a usarla para verificar afirmaciones
    And no afirma que se ejecuta automáticamente antes de cada commit

  Scenario: Un models.fact-checker inválido avisa y cae a inherit
    Given `models.fact-checker` con un id de modelo inexistente
    When fact-checker va a lanzar su subagente
    Then avisa del valor inválido
    And lanza el subagente heredando el modelo de la sesión, sin pasar un model roto

  Scenario: Un task-pipeline.yml ilegible no rompe la lectura del modelo
    Given un `.claude/task-pipeline.yml` que no es YAML válido
    When fact-checker intenta leer `models.fact-checker`
    Then lo reporta de forma comprensible
    And cae a inherit sin abortar con un error crudo

  Scenario: Sin afirmaciones factuales, el informe no inventa ninguna
    Given una sesión reciente sin afirmaciones factuales
    When se corre fact-checker
    Then informa que no hay nada que verificar
    And no fabrica afirmaciones ni veredicto

  Scenario: Una pasada mixta reporta cada clase sin que una tape a las demás
    Given tres afirmaciones: una verdadera, una falsa y una no verificable
    When se corre fact-checker en una pasada
    Then reporta VERIFICADO, INCORRECTO y NO VERIFICABLE respectivamente
    And la INCORRECTO no oculta las otras entradas

  Scenario: "Los tests pasan" en un repo sin runner es NO VERIFICABLE
    Given una afirmación de que "los tests pasan" en un repo cuyo stack no tiene test-runner
    When fact-checker intenta verificarla
    Then no puede ejecutar el comando de test
    And la reporta como NO VERIFICABLE por falta de stack, nunca como VERIFICADO

  Scenario: Una afirmación respaldada solo por "confía en mí" no se acepta
    Given una afirmación cuya única evidencia es "ya lo comprobé, confía en mí"
    When fact-checker la verifica
    Then no la da por buena por esa justificación
    And la reporta según la evidencia real (NO VERIFICABLE o INCORRECTO)

  Scenario: El subagente verifica sin escribir ni añadir afirmaciones propias
    Given un conjunto de afirmaciones a verificar
    When corre el subagente (solo lectura + Bash)
    Then no modifica ningún fichero
    And solo emite veredictos sobre las afirmaciones dadas, sin introducir nuevas

  Scenario: doctor contempla fact-checker en models: y en la cabecera de lectores
    Given un repo adoptado al que doctor propone añadir/actualizar `models:`
    When doctor construye la propuesta
    Then incluye `fact-checker` como fase con subagente ruteable
    And la cabecera de lectores del YAML lista `fact-checker`
    But `models.fact-checker` ausente no se marca como drift (default inherit)
```

## Provides

- Skill `fact-checker` (comando `/task-pipeline:fact-checker`) con contrato de salida
  VERIFICADO/INCORRECTO/NO VERIFICABLE — la invoca la task 006 (gate en la DoD) y la documenta la 008.
- `models.fact-checker` como fase con subagente (mismo contrato que `models.<fase>` de 0.9.0), que
  `doctor` podrá contemplar.

## Definition of Done

> Stack `none`: TDD y mutation = **N/A**; escenarios = spec de comportamiento; verificación por inspección
> de las instrucciones + (donde haya stack) correr la skill sobre afirmaciones de prueba. TSDoc = N/A.
- [ ] Cada escenario verificado por inspección del SKILL.md y del YAML.
- [ ] `models.fact-checker` en config repo (comentado) + template (comentado) + cabeceras con el lector.
- [ ] Spec cumplida; `Provides` disponible para 006/008.
- [ ] Doc técnica: coherencia con el molde de `design-review`/`scenario-coverage`.
- [ ] Session log en `.claude/context/task-pipeline/task-pipeline-005.md`.
- [ ] Commit `task-pipeline-005: feat: skill fact-checker + models.fact-checker`.
