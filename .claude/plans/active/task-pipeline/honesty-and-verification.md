---
id: task-pipeline-honesty-and-verification
package: task-pipeline
status: active          # pending | active | completed | cancelled
branch: plan/task-pipeline/honesty-and-verification
created: 2026-07-16
updated: 2026-07-16
---

# Disciplina de honestidad y verificación (fact-checker + reglas + no-duplicación)

> Refinado con `grilling` (D1–D5) y `design-review` (R1–R3 + endurecimientos). Pendiente: descomposición
> Gherkin → `scenario-coverage`. Stack sobre `plan/task-pipeline/grilling-and-model-routing` (0.9.0, PR #6).

## Contexto y problema

Los gates actuales cubren **planificación** (`grilling`, `design-review`, `scenario-coverage`) y
**calidad de tests** (`mutation`). Ninguno verifica la **veracidad de las afirmaciones** que Claude hace
al ejecutar/cerrar ("los tests pasan", "la función X hace Y", "la lib Z soporta W", "este import existe"),
ni impone **disciplina anti-alucinación / anti-slop**. El owner aporta tres piezas. Extiende la release
0.9.0 (PR #6 sin mergear; depende de la convención `models:` y del patrón de registro de `doctor`).

## Objetivos

1. **Skill `fact-checker`** (mismo molde que `design-review`/`scenario-coverage`) como gate de cierre.
   - *Criterio*: `skills/fact-checker/SKILL.md` lee `models.fact-checker` y lanza `general-purpose` con
     prompt EXACTO inline; tools de solo-lectura + Bash; **nunca escribe código**; salida
     VERIFICADO/INCORRECTO/NO VERIFICABLE; `description` honesta (no promete auto-invocación).
2. **Gate orquestado en la DoD** (NO flag): antes de commit y del resumen final.
   - *Criterio*: la DoD del HOW-TO + `task-lifecycle` + cierre de `plan-task` mandan invocar `fact-checker`
     antes de commit/resumen; es no-negociable (barato+nuclear, como `grilling`/aprobación). Sin
     `features.fact-check`.
3. **Reglas de honestidad "leer cada turno"** vía `@import` **opt-in** (sin invadir el `CLAUDE.md`).
   - *Criterio*: `.claude/honesty-rules.md` materializado; `task-init` **sugiere** el `@import` (no lo
     escribe); `doctor` **reporta** si falta (no lo añade); `bootstrap.sh` restaura solo el fichero. El
     `CLAUDE.md` del usuario nunca se auto-edita (invariante del plugin intacta).
4. **Regla de no-duplicación** de código como **coding-standard**, no honesty-rule.
   - *Criterio*: vive en `.claude/specs/general/coding-standards.md` (donde el HOW-TO ya apunta), no en
     `honesty-rules.md`.
5. **Modelo de `fact-checker` config-driven**, default **inherit** (coherente con los otros gates).
   - *Criterio*: `models.fact-checker` en config repo (comentado/inherit) + template comentado; ausente =
     hereda sesión. Si el owner quiere `sonnet` por barato, es valor explícito, no default oculto.
6. **Registro + release**: `fact-checker` en READMEs/metadatos/flujo (patrón `doctor`) + bump (tentativo
   0.10.0) + CHANGELOG (Added + Migration). Incluye una frase de **frontera `fact-checker` ↔ `doctor`**.

## Alcance y fuera de alcance

### Dentro
- `skills/fact-checker/SKILL.md` (skill, NO `agents/`).
- `models.fact-checker` en config repo + template + cabeceras yml (lectores) — como `models.<fase>` de 0.9.0.
- Gate en la DoD de `templates/HOW-TO-START-A-TASK.md` + `templates/task-lifecycle.md` + cierre de `plan-task`.
- `.claude/honesty-rules.md` (reglas de honestidad) + `@import` **opt-in** (task-init sugiere, doctor
  reporta, bootstrap restaura el fichero).
- No-duplicación en `.claude/specs/general/coding-standards.md`.
- Registro de `fact-checker` en ambos README + `plugin.json`/`marketplace.json` + `flujo-del-pipeline.md`;
  frase de frontera con `doctor`.
- Release (bump + CHANGELOG).

### Fuera
- **`agents/`** (descartado en R1: skill es coherente y la auto-delegación no se usa).
- **Auto-editar el `CLAUDE.md`** del usuario (R2) y hook de aviso en commit (D3).
- **Flag `features.fact-check`** (R3: gate no-negociable en la DoD).
- Harness de tests (stack sigue `none`); `fact-checker` "corre tests" solo aplica en repos consumidores.

## Recursos externos

- Contenido base de `fact-checker` y reglas de honestidad: aportados por el owner.
- Precedentes: patrón de gate-subagente (`skills/design-review/SKILL.md`, `scenario-coverage/SKILL.md`);
  registro de `doctor`; convención `models:` (task-002); invariante "no tocar `CLAUDE.md` del usuario"
  (`task-init/SKILL.md:79`, `doctor/SKILL.md`); `cp`-only en `bootstrap.sh`; specs en
  `HOW-TO-START-A-TASK.md` (tabla, apunta a `specs/general/coding-standards.md`).
- Plataforma verificada: `code.claude.com/docs`.

## Estimación global

- **Tareas**: 4 (ver abajo). Se endurecen con `scenario-coverage`.
- **Esfuerzo**: 1–2 sesiones (Markdown/config; sin código ejecutable).
- **Recursos**: owner (checkpoints) + subagentes.

## Criterios de calidad y verificación

> Stack `none`: TDD/mutation = **N/A**. Verificación por inspección / `grep` / `bash -n` / fixtures /
> correr el hook y el flujo en repos de prueba (sano / con drift / con y sin CLAUDE.md).

- `skills/fact-checker/SKILL.md`: frontmatter válido; lee `models.fact-checker`; `description` honesta;
  molde coherente con los otros dos gates de subagente.
- Gate en la DoD (HOW-TO + lifecycle + plan-task cierre); sin flag; frontera con `doctor` explícita.
- `honesty-rules.md` materializado; `@import` **opt-in** (task-init sugiere / doctor reporta / bootstrap
  restaura fichero); `CLAUDE.md` NUNCA auto-editado. no-duplicación en `specs/general/coding-standards.md`.
- `models.fact-checker` default inherit (config repo comentado; template comentado; cabeceras con lectores).
- `fact-checker` registrado en las superficies documentales; CHANGELOG con Added + Migration.

## Tasks

<Descomposición pendiente de endurecer con `scenario-coverage`.>

- [x] `task-pipeline-005` (P1) — Skill `fact-checker` (molde design-review) + `models.fact-checker` (config repo + template + cabeceras)  · depends_on: —
- [x] `task-pipeline-006` (P2) — Gate en la DoD (HOW-TO + task-lifecycle + cierre `plan-task`) + frontera con `doctor`  · depends_on: 005
- [x] `task-pipeline-007` (P3) — `honesty-rules.md` + `@import` opt-in (task-init sugiere / doctor reporta / bootstrap restaura) + no-duplicación en `specs/general/coding-standards.md`  · depends_on: —
- [ ] `task-pipeline-008` (P4) — Registro de `fact-checker` en metadatos/READMEs/flujo + release (bump + CHANGELOG Added/Migration)  · depends_on: 005, 006, 007

## Registro de cambios del plan

- 2026-07-16: creado (borrador aprobado en plan mode).
- 2026-07-16: refinado con `grilling` (5 decisiones): **D1** mecanismo "cada turno" = `CLAUDE.md`+`@import`;
  **D2** modelo config-driven default sonnet; **D3** enforcement DoD + flag `features.fact-check`;
  **D4** stack sobre grilling-and-model-routing; **D5** integración completa task-init/doctor/bootstrap.
- 2026-07-16: **`design-review`** (subagente fresco, `model: opus`). El plan NO aguantó tal cual; hallazgos
  y resolución del owner:
  - **R1 (aceptado)** `fact-checker` → **skill**, no `agents/` (revierte Camino A): la auto-delegación no
    se usa (D3), un agent solo añadía coste + un 2º patrón de subagente. Molde `design-review`.
  - **R2 (aceptado, con matiz)** NO auto-editar el `CLAUDE.md` del usuario (rompería la invariante del
    plugin). Se conserva "cada turno" vía `@import` **opt-in**: materializar `honesty-rules.md`,
    `task-init` **sugiere** el @import, `doctor` **reporta** si falta, `bootstrap` restaura solo el
    fichero. (Corrige D1/D5.)
  - **R3 (aceptado)** dropear `features.fact-check`: gate barato+nuclear = **no configurable** por la
    propia lógica del plugin; entra en la DoD como `grilling`/aprobación. (Corrige D3.)
  - **(aceptado)** `models.fact-checker` default **inherit** (no una 3ª semántica). (Corrige D2.)
  - **(aceptado)** no-duplicación es un **coding-standard** → `specs/general/coding-standards.md`, no en
    `honesty-rules.md` ni leído cada turno.
  - **(aceptado)** añadir frase de **frontera `fact-checker` ↔ `doctor`** (se solapan en read-only).
  - **(no bloquea)** el plan se mantiene ÚNICO: la asimetría de riesgo que motivaba separarlo desaparece
    al hacer el `@import` opt-in (no invasivo). Tareas bien separadas por concern.
- 2026-07-16: **`scenario-coverage`** (subagente QA fresco) sobre las 4 tareas. Incorporados:
  endurecimientos por dimensión en 005 (modelo inválido, YAML malformado, 0/mixto de afirmaciones,
  "tests pasan" sin runner→NO VERIFICABLE, "confía en mí", read-only sin afirmaciones propias), 007
  (repo no adoptado→no-op, ficheros ya existentes no se pisan, CLAUDE.md inexistente) y 008 (conteo/
  diagrama de flujo, frontera con doctor, prosa sin auto-invocación). Decisiones del owner:
  - **SC-A** — al cierre: `INCORRECTO` bloquea; `NO VERIFICABLE` = aviso a reconocer (no bloquea);
    `VERIFICADO` pasa. Orden: fact-checker tras `mutation`. (Task 006.)
  - **SC-B** — extender `doctor` (repartido en 005/006/007) para que en repos YA adoptados detecte el
    gate de fact-checker ausente, `honesty-rules.md` ausente y contemple `fact-checker` en `models:`.
    Cierra el hueco transversal (los cambios en plantillas no llegan a repos ya materializados).
  - **SC-C** — `coding-standards.md` **user-owned**: `task-init` lo materializa, pero NO lo restaura
    `bootstrap` ni lo vigila `doctor` (como las otras specs generales); solo `honesty-rules.md` se gestiona.
