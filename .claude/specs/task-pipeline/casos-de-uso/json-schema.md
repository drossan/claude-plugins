# CU-json-schema — Autocompletado del `task-pipeline.yml` vía JSON schema

- **Ámbito**: edición de `.claude/task-pipeline.yml` (ayuda de editor)
- **Nivel**: objetivo de usuario
- **Actor primario**: quien edita el `task-pipeline.yml` en un editor con `yaml-language-server`
- **Interesados e intereses**:
  - Editor del YAML — autocompletar claves/valores y ver errores sin memorizar el contrato.
  - Mantenedor — que el schema no imponga validación en runtime (no hay parser).

## Precondiciones

- Existe el fichero de schema (JSON) y el `task-pipeline.yml` lleva el modeline `# yaml-language-server`.

## Garantía mínima

- El schema es **JSON válido**; si el editor no soporta el modeline o la ruta no resuelve, el YAML sigue
  siendo válido y funcional (el modeline es un comentario).

## Garantía de éxito (postcondición)

- El editor sugiere claves y valores del contrato; marca valores fuera de dominio; no rechaza ids de modelo.

## Disparador

- El usuario abre/edita `task-pipeline.yml` en el editor.

## Escenario principal (éxito)

1. El editor lee el modeline `# yaml-language-server: $schema=…` y carga el schema.
2. Al editar una clave de `models:`, el editor sugiere `opus|sonnet|haiku|fable|inherit`.
3. Un id de modelo libre (`claude-sonnet-5`) se acepta sin marcarse como error.

## Extensiones (flujos alternativos y de error)

- **1a.** El editor no soporta `yaml-language-server`: sin autocompletado; el YAML sigue válido (no rompe).
- **1b.** El modeline apunta a una **ruta inexistente/rota** (p.ej. tras mover el `.yml`, la ruta relativa
  deja de resolver): el YAML sigue parseando; sin autocompletado; **sin aviso** (limitación del editor, no
  del plugin) — documentado como coste de la ruta relativa.
- **1c.** No hay `python3` para la verificación `python3 -m json.tool`: la verificación cae a otra
  herramienta (`node`/`jq`) o se marca **NO VERIFICABLE** en el histórico (no bloquea).
- **2a.** El usuario teclea un valor de modelo desconocido: el editor lo **sugiere** vía el `enum` pero
  **no** lo rechaza (el contrato permite "alias **o** id").

## Reglas de negocio

- **RN-1** — El valor de `models.<fase>` = `anyOf[enum(opus,sonnet,haiku,fable,inherit), string]`: el enum
  da autocompletado; la rama `string` no rechaza ids. `fable` es válido en el schema aunque no se recomiende.
- **RN-2** — El schema cubre **todo** el fichero: `mode`, `stack` (+ `packages`), `features` (+ bloques
  opt-in) y `models`. Es **ayuda de editor**, no validación en runtime.

## Criterios de aceptación (Gherkin)

```gherkin
Feature: Autocompletado del task-pipeline.yml vía JSON schema

  Scenario: El schema es JSON válido
    Given el fichero de schema del task-pipeline.yml
    When se valida como JSON (python3 -m json.tool)
    Then el parseo es correcto (exit 0)

  Scenario: Sin python3 → verificación no bloqueante
    Given un entorno sin python3
    When se intenta validar el schema como JSON
    Then se usa node/jq o se marca NO VERIFICABLE en el histórico (no bloquea el cierre)

  Scenario: El YAML referencia el schema y parsea
    Given un task-pipeline.yml con el modeline "# yaml-language-server: $schema=..."
    When se parsea el YAML
    Then el parseo es correcto (el modeline es un comentario)

  Scenario: Alias de modelo sugerido
    Given un editor con yaml-language-server y el schema cargado
    When el usuario edita el valor de models.design-review
    Then el editor sugiere opus, sonnet, haiku, fable, inherit

  Scenario: Id de modelo libre aceptado
    Given el schema cargado en el editor
    When el usuario escribe "models.design-review: claude-sonnet-5"
    Then el valor no se marca como error

  Scenario: Valor no-escalar rechazado
    Given el schema cargado en el editor
    When el usuario escribe "models.design-review: [opus, sonnet]" (lista)
    Then el editor marca error (viola anyOf[enum, string])

  Scenario: Cobertura fuera de models (mode)
    Given el schema cargado en el editor
    When el usuario escribe "mode: produccion" (fuera del enum full/legacy/docs-only)
    Then el editor marca error

  Scenario: Modeline con ruta rota → sin autocompletado, sin romper
    Given un task-pipeline.yml con "# yaml-language-server: $schema=./no-existe.json"
    When se abre en un editor con soporte
    Then el YAML sigue parseando y no hay autocompletado (sin aviso)
```
