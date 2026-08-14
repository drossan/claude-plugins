---
id: task-pipeline-sdd-y-stack-poliglota-03
package: task-pipeline
plan: sdd-y-stack-poliglota
status: done
priority: 2
depends_on: [task-pipeline-sdd-y-stack-poliglota-01, task-pipeline-sdd-y-stack-poliglota-02]
estimate: 2h
actual: ~40m
issue: 40                # sub-issue proyectada (github-tracking) — drossan/claude-plugins#40
created: 2026-08-13
updated: 2026-08-14
---

# `/task-init` detección de lenguaje por-workspace + HOW-TO refleja el stack

## Description

Extiende `/task-init` para **detectar el lenguaje por workspace** (best-effort) y, **con confirm humano**
(`AskUserQuestion`, como ya hace con `mode`), materializar `stack.packages` con el stack correcto por
lenguaje. El `HOW-TO-START-A-TASK.md` del package **refleja** ese stack (Q2 "ambos": el YAML es la fuente,
el HOW-TO lo refleja para el humano). No promete detección infalible (F7b del design-review).

## Spec

- **Paso 0 (detección)**: por workspace, infiere el lenguaje de marcadores: `package.json`→JS/TS,
  `pyproject.toml`/`setup.py`→Python, `Cargo.toml`→Rust, `go.mod`→Go. **Best-effort**.
- **Mapa lenguaje→stack por defecto** (coherente con la tarea 02): JS/TS→`vitest`+`stryker`+`pnpm`;
  Python→`pytest`+`mutmut`+(`uv`|`pip`). Rust/Go → `test-runner` del lenguaje + **`mutation-tool` vía el
  escape `mutation-command`** (no una tool nombrada shipeada), coherente con "cosmic-ray/cargo-mutants/
  gremlins solo en docs".
- **Confirm humano**: antes de escribir `stack.packages`, `AskUserQuestion` con la propuesta detectada;
  solo escribe al confirmar. **Detección ambigua/desconocida** → **no adivina**: pregunta (sin default
  silencioso).
- **HOW-TO refleja**: al materializar `HOW-TO-START-A-TASK.md` del package, incluye un bloque "Stack de
  este package" que coincide con `stack.packages.<pkg>` y **nota que el YAML es la fuente de verdad**.
- **Actualización incremental (no es "no pisar")**: la regla de idempotencia de `/task-init` ("nunca pises
  un fichero que ya existe") es a nivel de **fichero completo**. Añadir `stack.packages.<pkg>` a un
  `.claude/task-pipeline.yml` **ya materializado** (repo ya adoptado) o el bloque "Stack de este package" a
  un `HOW-TO` existente es **una edición aditiva**, no una sobrescritura: se **añade** la entrada sin tocar
  el resto del fichero. Nunca duplica una entrada `stack.packages.<pkg>` ya presente.
- **Alcance del escaneo**: el bootstrap genérico (Paso 1, sin package) puede escanear **todos** los
  workspaces de una vez; `/task-init <package>` inicializa uno. Declara cuál aplica en cada modo.
- **Sin canal para `AskUserQuestion`**: si no hay canal para preguntar, **no** escribe `stack.packages` a
  ciegas — lo deja sin fijar y lo reporta (no adivina).
- **Nombre de workspace no válido como clave YAML** (espacios, `:`) → **sanea o pregunta**; no escribe una
  clave que rompa el YAML.

## Fuera de alcance

- Detección **infalible** (es best-effort + confirm).
- Ser la **fuente de verdad** del stack (lo es el YAML; el HOW-TO solo refleja).
- **Correr** ninguna herramienta; instalar toolchains.

## Scenarios (Gherkin)

```gherkin
Feature: Bootstrap de stack por-package en /task-init

  Scenario: detecta Python en un workspace
    Given un workspace con `pyproject.toml`
    When `/task-init` escanea los workspaces
    Then propone `{ language: python, test-runner: pytest, mutation-tool: mutmut }` para ese package

  Scenario: confirma con el humano antes de escribir
    Given una propuesta de stack por-package detectada
    When `/task-init` va a escribir `stack.packages`
    Then lanza `AskUserQuestion` con la propuesta
    And solo escribe el bloque al confirmar

  Scenario: detección desconocida no adivina
    Given un workspace sin marcador reconocible
    When `/task-init` escanea
    Then NO fija un stack por defecto en silencio; pregunta al usuario

  Scenario: el HOW-TO refleja el stack
    Given un package inicializado con `stack.packages.<pkg>`
    When se materializa su `HOW-TO-START-A-TASK.md`
    Then contiene un bloque "Stack de este package" que coincide con `stack.packages.<pkg>`
    And nota que el YAML es la fuente de verdad (el HOW-TO solo refleja)

  Scenario Outline: detección por marcador según lenguaje
    Given un workspace con el marcador <marcador>
    When `/task-init` escanea los workspaces
    Then propone el stack de <lenguaje> para ese package

    Examples:
      | marcador       | lenguaje                  |
      | package.json   | javascript/typescript     |
      | Cargo.toml     | rust (mutation-command)   |
      | go.mod         | go (mutation-command)     |

  Scenario: workspace con marcadores en conflicto
    Given un workspace con `package.json` Y `pyproject.toml` a la vez
    When `/task-init` escanea
    Then trata el caso como ambiguo y pregunta (mismo camino que "sin marcador"), sin asumir ninguno

  Scenario: añadir stack.packages a un YAML ya materializado
    Given `.claude/task-pipeline.yml` ya existe (repo previamente adoptado, sin `stack.packages`)
    When `/task-init <package-nuevo>` detecta y confirma un stack
    Then AÑADE la entrada `stack.packages.<package-nuevo>` sin tocar el resto del fichero
    And no lo trata como "fichero que ya existe, no pisar"
```

## Provides

`/task-init` que siembra `stack.packages` según el lenguaje detectado (con confirm) y un HOW-TO que refleja
el stack del package.

## Definition of Done

- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / correr `/task-init` en un repo de prueba poliglota)
- [x] Spec cumplida; `Provides` disponible
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `task-init/SKILL.md` + `templates/HOW-TO-START-A-TASK.md` (bloque de stack reflejado) · technical-docs
- [x] Entrada `### Added` en `CHANGELOG.md` atribuible a esta feature (la consolida la tarea 08) · technical-docs
- [x] Histórico de la tarea — session log en `.claude/context/task-pipeline/task-pipeline-sdd-y-stack-poliglota-03.md` · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos
