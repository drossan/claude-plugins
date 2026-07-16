---
id: task-pipeline-honesty-and-verification
package: task-pipeline
status: pending          # pending | active | completed | cancelled
branch: plan/task-pipeline/honesty-and-verification
created: 2026-07-16
updated: 2026-07-16
---

# Disciplina de honestidad y verificación (fact-checker + reglas + no-duplicación)

> Plan refinado con `grilling` (5 decisiones, abajo). Pendiente: `design-review` → descomposición
> Gherkin → `scenario-coverage`. Stack sobre `plan/task-pipeline/grilling-and-model-routing` (0.9.0, PR #6).

## Contexto y problema

Los gates actuales cubren **planificación** (`grilling`, `design-review`, `scenario-coverage`) y
**calidad de tests** (`mutation`). Ninguno verifica la **veracidad de las afirmaciones** que Claude hace
al ejecutar/cerrar ("los tests pasan", "la función X hace Y", "la lib Z soporta W", "este import existe"),
ni impone **disciplina anti-alucinación / anti-slop** proactiva. Una afirmación falsa en el resumen final
o antes de un commit no la caza nada. El owner aporta tres piezas (Camino A: agent + orquestación). Extiende
la release 0.9.0 (PR #6 sin mergear; depende de la convención `models:` y del patrón de registro de `doctor`).

## Objetivos

1. **Subagente `fact-checker`** (primer artefacto `agents/` del plugin) como gate de fase de cierre.
   - *Criterio*: existe `agents/fact-checker.md` (tools read-only + Bash; nunca escribe código; salida
     VERIFICADO/INCORRECTO/NO VERIFICABLE); `description` honesta (nudge, no promete auto-invocación);
     modelo config-driven (`models.fact-checker`, default `sonnet`); registrado en READMEs + metadatos.
2. **Reglas de honestidad "leer cada turno"** vía `CLAUDE.md` + `@import` (nativo).
   - *Criterio*: `.claude/honesty-rules.md` materializado + `@import` desde el `CLAUDE.md` del repo; leído
     cada turno de forma nativa.
3. **Regla de no-duplicación de código** (salvo aprobación del usuario), en el mismo artefacto de reglas.
   - *Criterio*: la regla figura en `honesty-rules.md`.
4. **Gate config-driven**: flag `features.fact-check` (default ON) + orquestación en DoD/HOW-TO/plan-task.
   - *Criterio*: la DoD del HOW-TO y el cierre de `plan-task` mandan invocar `fact-checker` antes de
     commit/resumen salvo `features.fact-check: false`.
5. **Ciclo de vida integrado**: `task-init` materializa; `doctor` verifica; `bootstrap.sh` restaura.
   - *Criterio*: las tres skills/hook gestionan el nuevo artefacto de reglas como el resto de la convención.
6. **Release** (tentativo 0.10.0, minor) con Added + Migration.

## Alcance y fuera de alcance

### Dentro
- `agents/fact-checker.md` (nuevo directorio `agents/` en el plugin).
- Orquestación del gate en `templates/HOW-TO-START-A-TASK.md` (DoD) + cierre de `plan-task`; flag
  `features.fact-check` en config repo + template + lectura en `plan-task`.
- Artefacto `honesty-rules.md` (reglas de honestidad + no-duplicación) + mecanismo `@import`.
- Extender `task-init` (materializa reglas + @import), `doctor` (verifica), `bootstrap.sh` (restaura).
- Registro de `fact-checker` en ambos README + `plugin.json`/`marketplace.json` + `flujo-del-pipeline.md`.
- Release (bump + CHANGELOG).

### Fuera
- Cambiar el comportamiento de los gates existentes.
- Harness de tests (stack sigue `none`); `fact-checker` "corre tests" solo aplica en repos consumidores.
- Auto-invocación "mágica" del subagente (imposible por plataforma) y hook de aviso en commit (descartado
  en D3).

## Recursos externos

- Contenido base de `fact-checker` y reglas de honestidad: aportados por el owner.
- Precedentes en el repo: registro de `doctor`; convención `models:` (task-002); materialización vía
  plantillas + hook (`task-init`, `bootstrap.sh`).
- Plataforma verificada (agents/subagentes/hooks/`@import` de CLAUDE.md): `code.claude.com/docs`.

## Estimación global

- **Tareas**: ~4 (se fija tras `design-review` + descomposición).
- **Esfuerzo**: 1–2 sesiones (Markdown/config; sin código ejecutable).
- **Recursos**: owner (checkpoints) + subagentes design-review/scenario-coverage.

## Criterios de calidad y verificación

> Stack `none`: TDD/mutation = **N/A**. Verificación por inspección / `grep` / `bash -n` / fixtures /
> correr el hook y el flujo en repos de prueba (sano / con drift / sin CLAUDE.md).

- `agents/fact-checker.md` con frontmatter válido; `description` honesta; modelo config-driven.
- `features.fact-check` en config repo + template (comentado/def ON) y leído por `plan-task`/HOW-TO.
- `honesty-rules.md` + `@import` materializados por `task-init`, verificados por `doctor`, restaurados
  por `bootstrap.sh` (idempotente; no sobrescribe un CLAUDE.md existente sin cuidado).
- `fact-checker` registrado en las superficies documentales (como `doctor`).
- Metadatos coherentes; CHANGELOG con Added + Migration.

## Tasks

<Descomposición pendiente (`plan-task` Paso 5) + endurecimiento (`scenario-coverage`). Tentativa:>

- [ ] `task-pipeline-005` (P1) — `agents/fact-checker.md` (agente + description honesta + modelo config-driven)  · depends_on: —
- [ ] `task-pipeline-006` (P2) — Orquestación del gate: `features.fact-check` + DoD/HOW-TO + cierre `plan-task`  · depends_on: 005
- [ ] `task-pipeline-007` (P3) — Reglas (`honesty-rules.md` + no-duplicación) + `@import` + integración `task-init`/`doctor`/`bootstrap.sh`  · depends_on: —
- [ ] `task-pipeline-008` (P4) — Registro de `fact-checker` en metadatos/READMEs + release (bump + CHANGELOG)  · depends_on: 005, 006, 007

## Registro de cambios del plan

- 2026-07-16: creado (borrador aprobado en plan mode).
- 2026-07-16: refinado con `grilling` (5 decisiones):
  - **D1** — mecanismo "leer cada turno" = `CLAUDE.md` + `@import` de `honesty-rules.md` (nativo, sin
    coste por turno). Alternativas (hook UserPromptSubmit / SessionStart) descartadas.
  - **D2** — modelo de `fact-checker` **config-driven** (`models.fact-checker`), default `sonnet` en
    frontmatter (verificar es barato; resolución: param por invocación > frontmatter > sesión). Difiere a
    propósito del default inherit de design-review/scenario-coverage.
  - **D3** — enforcement por **DoD/orquestación** + flag `features.fact-check` (default ON). Sin hook
    (un hook no puede invocar el subagente y el plugin evita determinismo).
  - **D4** — secuenciado = **stack** sobre `plan/task-pipeline/grilling-and-model-routing` (no esperar al
    merge de #6).
  - **D5** — **integración completa** del ciclo de vida del artefacto de reglas: `task-init` materializa +
    @import, `doctor` verifica, `bootstrap.sh` restaura.
