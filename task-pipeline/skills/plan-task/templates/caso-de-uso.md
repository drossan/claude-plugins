# CU-<id> — <título del caso de uso>

> **Plantilla SDD** (Cockburn *fully-dressed* + Gherkin). Materialízala en
> `.claude/specs/<package>/casos-de-uso/<id>.md`. **Gated por `features.sdd`** (opt-in, default off). Es el
> **"CÓMO"** del actor para una capacidad de la `spec.md` del package (enlazado desde ella).

- **Ámbito**: `<sistema / subsistema>`
- **Nivel**: `<objetivo de usuario | subfunción>`
- **Actor primario**: `<actor>`
- **Interesados e intereses**:
  - `<interesado>` — `<qué le importa que salga bien>`

## Precondiciones

- `<lo que debe ser cierto antes de empezar>`

## Garantía mínima

- `<lo que el sistema garantiza aunque el CU falle a mitad>`

## Garantía de éxito (postcondición)

- `<estado del mundo tras completar el CU con éxito>`

## Disparador

- `<qué inicia el caso de uso>`

## Escenario principal (éxito)

1. `<paso del actor / respuesta del sistema>`
2. `<...>`
3. `<...>`

## Extensiones (flujos alternativos y de error)

> Numeradas contra el paso del escenario principal que extienden (`3a`, `3b`, …).

- **3a.** `<condición>`: `<manejo>`
- **3b.** `<condición>`: `<manejo>`

## Reglas de negocio

- **RN-1** — `<regla / invariante>`

## Criterios de aceptación (Gherkin)

> **Este es el ÚNICO hogar del Gherkin** de esta capacidad (anti-duplicación). Con `features.sdd` **ON**, el
> `## Scenarios (Gherkin)` de la tarea **enlaza aquí en vez de copiar** los escenarios (se cablea en la tarea
> del flujo SDD). Por eso este bloque **hereda las MISMAS reglas de disciplina que `templates/task.md`** —no
> puede degradar la calidad que hoy exige la tarea:
>
> 1. **Declarativo, no imperativo**: describe **QUÉ** comportamiento, no **CÓMO** se invoca (nada de UI/clicks/pasos internos).
> 2. **Un escenario = un comportamiento**: si aparece `When…Then…When…Then`, son dos escenarios; cada uno falla por **una** sola razón.
> 3. **Given/When/Then**: `Given` = estado previo (en pasado); `When` = **UNA** acción de dominio; `Then` = resultado observable. `And`/`But` para condiciones o resultados extra.
> 4. Cubre **camino feliz Y bordes/errores**.
> 5. **`Scenario Outline` + `Examples`** para fronteras (una tabla en vez de N escenarios calcados).

```gherkin
Feature: <capacidad de este caso de uso>

  Scenario: <caso concreto — camino feliz>
    Given <precondición, en pasado>
    When <una acción de dominio>
    Then <resultado observable y verificable>

  Scenario: <error / borde>
    Given <precondición>
    When <acción>
    Then <error esperado, código o efecto>
```
