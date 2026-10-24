# CU-routing-contrato — Routing de modelo de una fase con subagente

- **Ámbito**: pipeline `task-pipeline` (fases con subagente)
- **Nivel**: subfunción
- **Actor primario**: la skill que lanza el subagente (`design-review`, `scenario-coverage`, `fact-checker`, `sdd-lint`)
- **Interesados e intereses**:
  - Mantenedor del repo — que el modelo por fase se controle por repo sin tocar el plugin.
  - Adoptante — que un YAML sin `models:` (o sin fichero) no rompa nada (todo hereda la sesión).

## Precondiciones

- Existe (o no) `.claude/task-pipeline.yml` con (o sin) una sección `models:`.

## Garantía mínima

- Nunca se lanza un subagente con un `model` roto de forma no manejada: ante duda o fallo, se hereda la
  sesión y se avisa; nunca se aborta la fase por el routing.

## Garantía de éxito (postcondición)

- El subagente arranca con el modelo correcto: el de `models.<fase>` si resuelve, o el de la sesión.

## Disparador

- Una fase con subagente va a lanzarse (Paso 2/3 de su skill).

## Escenario principal (éxito)

1. La skill lee `models.<fase>` de `.claude/task-pipeline.yml` (con `Read`; no hay parser).
2. Normaliza el valor (trim; alias case-insensitive). Si es un alias conocido o un id de modelo, lo pasa
   como `model` a la Agent tool.
3. El subagente arranca con ese modelo.

## Extensiones (flujos alternativos y de error)

- **1a.** La clave está ausente o vale `inherit`: no se pasa `model` (hereda la sesión).
- **1b.** El fichero **no existe**: todas las fases heredan la sesión (como el resto del YAML: "sin archivo = full").
- **1c.** La sección `models:` existe pero está **vacía** (sin sub-claves): equivale a ausencia (inherit).
- **1d.** El fichero es **ilegible por YAML malformado**: se reporta y se cae a `inherit` (no se aborta).
- **1e.** El fichero es **ilegible por IO/permisos** (no por sintaxis): se reporta el fallo de lectura y se
  cae a `inherit` (no se aborta).
- **1f.** `models:` tiene **tipo equivocado** (p.ej. escalar `models: opus` en vez de mapa): sección
  inusable → aviso + `inherit` para todas las fases.
- **2a.** El valor, tras normalizar, **no es un alias conocido**: se trata como **id de modelo** y se pasa
  tal cual a la Agent tool.
- **2b.** La Agent tool **falla al lanzar** con ese id (modelo retirado / sin permisos de cuenta/org): se
  avisa y se re-lanza **sin** `model` (fallback a `inherit`). Es un fallo *post*-preflight, distinto del typo.
- **1g.** La clave es de una fase **inline** (no ruteable) o **no corresponde a ninguna fase conocida**
  (`models.foo`): se **ignora** (sin efecto). `/doctor` puede señalarla como posible typo (ver su CU).
- **1h.** La fase es `sdd-lint` y `features.sdd` está **off** (o malformado → off por fail-safe): la clave
  `models.sdd-lint` **no tiene efecto**.

## Reglas de negocio

- **RN-1** — Fases ruteables: **3 siempre** (`design-review`, `scenario-coverage`, `fact-checker`) **+
  `sdd-lint` solo con `features.sdd` on**. Las inline (`grilling`, `plan-task`, `mutation`, `doctor`,
  `task-init`, `pipeline-usage`) **no** se rutan por `models:`.
- **RN-2** — **Normalización + validación**: el valor se **trimea**; los alias (`opus|sonnet|haiku|fable|
  inherit`) casan **case-insensitive**; cualquier otro valor se trata como **id de modelo** (pass-through).
  El "preflight" solo distingue alias-conocido de no-alias; la validación **real** del id ocurre al lanzar
  (extensión 2b). No hay lista de ids de referencia embebida.
- **RN-3** — Una clave que no es ni una fase conocida ni una fase inline (`models.foo`) se ignora; su única
  consecuencia es un posible aviso de `/doctor` (no rompe el routing).

## Criterios de aceptación (Gherkin)

```gherkin
Feature: Routing de modelo por fase con subagente

  Scenario: Valor válido → se pasa como model al subagente
    Given un task-pipeline.yml con "models.design-review: opus"
    When la fase design-review va a lanzar su subagente
    Then el subagente se lanza con model = opus

  Scenario: Clave ausente → hereda la sesión
    Given un task-pipeline.yml sin la clave models.scenario-coverage
    When la fase scenario-coverage va a lanzar su subagente
    Then el subagente se lanza sin forzar model (hereda la sesión)

  Scenario: inherit explícito → hereda la sesión
    Given un task-pipeline.yml con "models.fact-checker: inherit"
    When la fase fact-checker va a lanzar su subagente
    Then el subagente se lanza sin forzar model

  Scenario: Fichero de config ausente → todo hereda la sesión
    Given un repo sin .claude/task-pipeline.yml
    When una fase con subagente rutea su modelo
    Then el subagente se lanza sin forzar model (sin error)

  Scenario: Sección models vacía → equivale a ausencia
    Given un task-pipeline.yml con "models:" y ninguna sub-clave
    When la fase design-review va a lanzar su subagente
    Then el subagente se lanza sin forzar model (inherit)

  Scenario: Valor inválido tipográfico de alias → aviso y fallback a inherit
    Given un task-pipeline.yml con "models.design-review: opuss"
    When la fase design-review va a lanzar su subagente
    Then se avisa del valor no reconocido
    And el subagente se lanza sin forzar model (inherit)

  Scenario Outline: Normalización de alias (trim + case-insensitive)
    Given un task-pipeline.yml con "models.design-review: <valor>"
    When la fase design-review va a lanzar su subagente
    Then el subagente se lanza con model = opus

    Examples:
      | valor    |
      | opus     |
      | OPUS     |
      | " opus " |

  Scenario: Id de modelo libre (no alias) → pass-through
    Given un task-pipeline.yml con "models.fact-checker: claude-sonnet-5"
    When la fase fact-checker va a lanzar su subagente
    Then el subagente se lanza con model = claude-sonnet-5

  Scenario: Id plausible pero la invocación falla → aviso y fallback
    Given "models.design-review" con un id de modelo retirado o sin permisos
    When la Agent tool falla al lanzar con ese model
    Then se avisa del fallo
    And la fase se re-lanza sin forzar model (inherit)

  Scenario: YAML ilegible (malformado) → se reporta y se hereda
    Given un task-pipeline.yml con YAML malformado
    When una fase con subagente lee su clave de models
    Then se reporta que el YAML es ilegible
    And el subagente se lanza sin forzar model (no se aborta)

  Scenario: Config ilegible por IO/permisos → se reporta y se hereda
    Given un task-pipeline.yml sin permisos de lectura
    When una fase intenta leer su clave de models
    Then se reporta el fallo de lectura
    And el subagente se lanza sin forzar model (no se aborta)

  Scenario: models con tipo equivocado (escalar) → sección inusable
    Given un task-pipeline.yml con "models: opus" (escalar, no mapa)
    When una fase con subagente lee su clave
    Then se avisa de que la sección models es inusable
    And la fase hereda el modelo de la sesión

  Scenario: Clave para fase inline → ignorada
    Given un task-pipeline.yml con "models.mutation: opus"
    When corre la fase inline mutation
    Then la clave se ignora y la fase hereda el modelo de la sesión

  Scenario: Clave que no corresponde a ninguna fase → ignorada
    Given un task-pipeline.yml con "models.foo: opus"
    When corre el pipeline
    Then la clave se ignora (sin efecto en el routing)

  Scenario Outline: sdd-lint rutea solo con SDD on
    Given un task-pipeline.yml con "models.sdd-lint: sonnet" y "features.sdd: <sdd>"
    When el gate sdd-lint va a lanzar su subagente semántico
    Then el ruteo de sdd-lint <efecto>

    Examples:
      | sdd     | efecto                              |
      | true    | aplica (subagente en sonnet)        |
      | false   | no tiene efecto (sdd-lint no corre) |
      | quizas  | no tiene efecto (sdd off fail-safe) |

  Scenario: features.sdd pasa de off a on a mitad del plan
    Given tareas cerradas con features.sdd off y "models.sdd-lint: sonnet" ya presente sin efecto
    When el usuario activa features.sdd: true antes de cerrar la siguiente tarea
    Then models.sdd-lint empieza a aplicar en las tareas restantes
```
