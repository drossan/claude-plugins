---
id: task-pipeline-sdd-validation-gate-01
package: task-pipeline
plan: sdd-validation-gate
status: done
priority: 1
depends_on: []
estimate: 4h
actual: ~1h30m
issue: 52
created: 2026-08-14
updated: 2026-08-14
---

# Skill `sdd-lint`: gate model-driven de validación de artefactos SDD

## Description

La skill **autoritativa** del gate: valida el **formato + completitud** de los artefactos SDD (spec EARS /
caso-de-uso Gherkin / ADR MADR) por **inspección**, como `fact-checker`/Spec-Kit `analyze`. Emite comandos
`grep`/`test` **fijos y documentados** para lo mecánico + **juicio** para lo semántico. **Fuente ÚNICA de
reglas** (design-review Opción 3). Invocable `/sdd-lint [pkg]`.

## Spec

- **Frontmatter**: `name: sdd-lint` + `description` (gate de validación SDD; úsalo en el cierre con
  `features.sdd` on, o a mano para auditar). Solo aplica con `features.sdd` on; con off → no-op + aviso.
- **Checks MECÁNICOS (comandos deterministas que la skill emite)** — ERROR salvo que se indique:
  - **Vocabulario MADR cerrado**: la línea `- **Estado**:` de cada `adr/NNNN-*.md` ∈ {`proposed`, `accepted`,
    `rejected`, `deprecated`, `superseded`}; desconocido = **ERROR**.
  - **`[NECESITA ACLARACIÓN` sin resolver** en un artefacto **materializado** (`.claude/specs/**`) = **ERROR**
    (incompletitud = gate, rescate GAINUP P8): grep del token literal. **Las plantillas del plugin se
    reescriben (tarea 04, Opción C)** para que su mención de la convención **no case** el literal → pasan el
    lint. (Decisión scenario-coverage: reescribir plantilla, no exención por-ruta ni juicio semántico.)
  - **Secciones obligatorias** por artefacto (spec: user stories/Requisitos EARS/Criterios; CU: secciones
    Cockburn + bloque Gherkin; adr: Estado/Contexto/Decisión) presentes = grep `## `.
  - **Ids** `FR-00x`/`SC-00x` bien formados (regex); `adr` numeración `NNNN` desde `0001`.
  - **Enlaces rotos**: el `## Scenarios` de una tarea (SDD on) enlaza a un CU que **existe** (`test -f`); un
    `superseded by NNNN` apunta a un ADR existente; el `spec.md` enlaza a CUs existentes.
  - **Huérfanos/duplicados**: CU no enlazado desde ninguna spec (AVISO); `FR`/`SC`/CU-id duplicado (ERROR).
- **Checks SEMÁNTICOS (juicio, subagente fresco)** — reporta ERROR/AVISO con descarte explícito:
  - **EARS bien-formado**: cada FR encaja en un patrón (ubicuo/`When`/`While`/`If…then`/`Where`) — no prosa
    suelta disfrazada de "DEBERÁ".
  - **Coherencia de estado MADR**: `accepted` solo si la decisión está cerrada (Resultado + Confirmación
    presentes); si no, debería ser `proposed`.
  - **Disciplina Gherkin del CU**: declarativo (no imperativo), 1 escenario = 1 comportamiento, G/W/T,
    `Scenario Outline` para fronteras (mismas reglas que `task.md`).
  - **Trazabilidad con sentido**: FR↔CU↔escenario mapea de forma coherente.
- **Severidad**: **ERROR bloquea** el cierre / **AVISO se reconoce, no bloquea** (como `fact-checker`
  `INCORRECTO`/`NO VERIFICABLE`). **Ante duda de parseo, demota a AVISO** (no bloquear por regex frágil).
- **Modelo del subagente**: config-driven (lee `models.sdd-lint`; ausente/`inherit` → hereda sesión). Mismo
  patrón que `fact-checker`/`scenario-coverage`.
- **Salida**: informe con hallazgos por artefacto, cada uno ERROR|AVISO + evidencia (fichero:línea / comando).

### Hardening (scenario-coverage) — materializar en el Gherkin
- **Vocabulario MADR case-insensitive**: `Accepted`/`ACCEPTED` = estado válido (no ERROR por mayúsculas).
- **Scope de duplicados de ids = por-package** (`FR`/`SC` únicos dentro de su `spec.md`; CU-id dentro del package).
- **Convivencia inline↔CU**: un `## Scenarios` con Gherkin **inline** (tarea pre-flag) **NO** es "enlace roto"
  por no tener enlace a CU — solo se comprueba el enlace **si lo hay** (respeta "no migrar a la fuerza").
- **`/sdd-lint [pkg]`**: con arg, valida solo ese package (no reporta ERROR de otro); sin arg, **agrega**
  todos los packages atribuyendo cada hallazgo a su package. `[pkg]` inexistente → aviso claro, no silencio.
- **Invocación manual con `features.sdd` off**: **audita igualmente** pero **avisa** que SDD está off (útil
  para decidir si activarlo); el **gate automático** (tarea 03) sigue siendo no-op con off.
- **Errores de lectura** (distintos de "duda de parseo"): fichero ilegible / frontmatter roto → AVISO "no
  parseable", **sigue** con el resto (no aborta). Enlace con `..`/ruta absoluta que escapa el repo → ERROR.
- **Frontera con `/doctor` cat. 9**: "flag on, 0 artefactos SDD" lo cubre `/doctor` (scaffolding ausente),
  **no** `sdd-lint` (que valida lo que existe) — declarar N/A explícito.

## Fuera de alcance

- El **helper Bash** (tarea 02), el **cableado del gate en el cierre** (tarea 03), `/doctor`/fix MADR (04).
- `--strict` y check `adr-index` stale (diferidos, ver plan).

## Scenarios (Gherkin)

```gherkin
Feature: Gate de validación SDD (skill model-driven)

  Scenario: estado MADR inválido = ERROR (bloquea)
    Given un `adr/0001-x.md` con `- **Estado**: aceptado` (no canónico)
    When corro `/sdd-lint`
    Then reporta ERROR "estado MADR inválido" (∈ los 5 válidos) y bloquea

  Scenario: [NECESITA ACLARACIÓN] sin resolver = ERROR
    Given un `spec.md` con un `[NECESITA ACLARACIÓN: …]` sin resolver
    When corro `/sdd-lint`
    Then reporta ERROR de incompletitud y bloquea

  Scenario: enlace roto de la tarea a un CU inexistente = ERROR
    Given `features.sdd` on y el `## Scenarios` de una tarea enlaza a un CU que no existe
    When corro `/sdd-lint`
    Then reporta ERROR "enlace a CU inexistente" (no asume "sin escenarios")

  Scenario: FR que no es EARS = AVISO (no bloquea)
    Given un `spec.md` con un FR en prosa suelta que no encaja en ningún patrón EARS
    When corro `/sdd-lint`
    Then reporta AVISO "EARS mal formado" y NO bloquea

  Scenario: MADR accepted sin decisión cerrada = AVISO
    Given un ADR `accepted` sin sección Resultado/Confirmación
    When corro `/sdd-lint`
    Then reporta AVISO "estado no fiel a la fuente"

  Scenario: duda de parseo demota a AVISO
    Given un artefacto cuyo formato el check mecánico no puede parsear con seguridad
    When corro `/sdd-lint`
    Then lo reporta como AVISO (no ERROR) — no bloquea por regex frágil

  Scenario: features.sdd off = no-op
    Given `features.sdd` off (default)
    When corro `/sdd-lint`
    Then informa que SDD está off y no valida nada

  Scenario: artefactos limpios = pasa
    Given specs/CU/ADR bien formados y completos
    When corro `/sdd-lint`
    Then no hay ERROR (a lo sumo avisos reconocidos) y el gate pasa
```

## Provides

La skill/gate `sdd-lint` (autoritativa) + su contrato de severidad (ERROR bloquea / AVISO no) que leen el
cableado del cierre (tarea 03), el helper Bash (02, replica el subconjunto mecánico) y `/doctor` (04).

## Definition of Done

<!-- Stack none: TDD/mutation N/A. Verificación por inspección + correr la skill sobre artefactos de prueba. -->
- [x] Escenarios Gherkin verificados como criterios de aceptación (inspección / correr `/sdd-lint` sobre artefactos con defectos inyectados)
- [x] Spec cumplida; `Provides` disponible para 02/03/04
- [x] Gate de `fact-checker` superado (INCORRECTO bloquea) · no-negociable
- [x] Proyección de estado a GitHub al cerrar — best-effort · features.github-tracking ON
- [x] Doc técnica: `skills/sdd-lint/SKILL.md` + entrada CHANGELOG (la consolida 05) · technical-docs
- [x] Histórico de la tarea — session log · context-log
- [x] Barrido `grep` reforzado: sin identificadores muertos
