---
name: sdd-lint
description: Gate de validación de formato + completitud de los artefactos SDD (spec EARS · caso-de-uso Gherkin · ADR MADR) — comprueba que estén bien formados, completos y trazables antes de cerrar una tarea. Corre en el cierre con `features.sdd` on (tras `mutation`, antes de `fact-checker`), o a mano para auditar (`/sdd-lint [package]`). Solo aplica a la capa SDD opt-in; con `features.sdd` off es no-op.
---

Verificas que los artefactos SDD (spec/caso-de-uso/ADR) son **válidos y completos**, no solo que existen
(eso lo mira `/doctor`). Eres la **fuente autoritativa** de las reglas de formato SDD: lo **mecánico** lo
resuelves emitiendo **comandos `grep`/`test` fijos y deterministas**; lo **semántico** (juicio) lo delega un
**subagente fresco**. Reportas **ERROR** (bloquea el cierre) o **AVISO** (se reconoce, no bloquea) — mismo
modelo que `fact-checker` (`INCORRECTO`/`NO VERIFICABLE`).

> **Frontera con `/doctor` y `fact-checker`**: `/doctor` valida **presencia/estructura** del scaffolding SDD
> (¿existe `.claude/specs/adr/`?); `fact-checker` verifica **afirmaciones de la sesión**; **`sdd-lint`**
> valida el **contenido** de los artefactos SDD (¿este ADR tiene un estado MADR válido?, ¿esta spec es EARS?).
> No se solapan. El caso "`features.sdd` on pero **0 artefactos** aún" es de `/doctor` (scaffolding ausente),
> **no** de `sdd-lint` (que valida lo que existe) → aquí es **N/A**.

## Paso 0 — Config y alcance

Lee `.claude/task-pipeline.yml` con **Read**.

- **`features.sdd` off / ausente / no-canónico** (fail-safe) → **no-op**: informa "SDD off, nada que validar"
  y sal. **Excepción**: en invocación **manual** (`/sdd-lint`) **audita igualmente** pero **avisa** que SDD
  está off (útil para decidir si activarlo). El **gate automático** del cierre sí es no-op con off.
- **Alcance**: `/sdd-lint <package>` → solo ese package; **sin argumento** → **todos** los packages con
  artefactos SDD, atribuyendo cada hallazgo a su package. `<package>` inexistente → **avísalo** (no falles en
  silencio).
- **Modelo del subagente semántico** (config-driven): lee `models.sdd-lint` (no hay parser: interprétalo con
  `Read`). Ausente/`inherit` → no pases `model`; alias/id válido → pásalo; valor inválido → **avisa** y cae a
  inherit.

## Paso 1 — Reunir los artefactos

Por cada package en alcance:

- `spec.md` → `.claude/specs/<pkg>/spec.md`
- Casos de uso → `.claude/specs/<pkg>/casos-de-uso/*.md`
- ADR (globales del repo) → `.claude/specs/adr/NNNN-*.md` + `adr-index.md`
- Enlaces al CU desde las tareas del package con `features.sdd` on → el `## Scenarios` de cada
  `.claude/tasks/**/<pkg>/*.md` (con SDD on **enlaza** a un CU).

## Paso 2 — Checks MECÁNICOS (comandos deterministas)

Emite estos comandos (o equivalentes) y clasifica cada hallazgo. Son deterministas: la misma entrada da la
misma salida. **Ante duda de parseo, demota a AVISO** (no bloquees por una regex que no previó un formato).

| Check | Comando (idea) | Severidad |
|---|---|---|
| **Estado MADR válido** (∈ 5, **case-insensitive**) | `grep -iE '^- \*\*Estado\*\*: *(proposed\|accepted\|rejected\|deprecated\|superseded)' adr/NNNN-*.md` — si no matchea → estado no canónico | **ERROR** |
| **`[NECESITA ACLARACIÓN` sin resolver** (solo artefactos materializados `.claude/specs/**`) | `grep -rn '\[NECESITA ACLARACIÓN' .claude/specs/<pkg>` | **ERROR** |
| **Secciones obligatorias** (spec: user stories/EARS/criterios; CU: Cockburn+Gherkin; ADR: Estado/Contexto/Decisión) | `grep -c '^## '` por sección esperada | **ERROR** si falta |
| **Ids bien formados** `FR-000`/`SC-000` (3 díg.); ADR `NNNN` desde `0001` | `grep -oE '\b(FR\|SC)-[0-9]+\b'` y filtra los que no acaban en 3 díg. **Usa `\b`** para no matchear `NFR-001` (contiene `FR-001`) ni el placeholder `FR-00x` | **ERROR** si mal formado |
| **Enlaces rotos**: `## Scenarios`→CU, `superseded by NNNN`→ADR, `spec`→CU | por cada enlace, `test -f <ruta>` | **ERROR** si no existe |
| **Huérfanos/duplicados**: CU no enlazado desde ninguna spec (AVISO); `FR`/`SC`/CU-id **duplicado por-package** (ERROR) | `grep` + `sort` + `uniq -d` | ver col. |

**Reglas finas (hardening):**
- **Vocabulario MADR case-insensitive**: `Accepted`/`ACCEPTED` es válido.
- **Duplicados por-package**: `FR-001` puede repetirse en dos packages distintos; solo colisiona **dentro** de
  su `spec.md` / package.
- **Convivencia inline↔CU**: si el `## Scenarios` de una tarea trae Gherkin **inline** (tarea materializada
  **antes** de activar `features.sdd`), **no** es "enlace roto" por no tener enlace — solo se comprueba el
  enlace **si existe**. Respeta "no migrar a la fuerza".
- **Enlace con `..` o ruta absoluta** que escapa el repo → **ERROR** (no lo sigas).
- **Fichero ilegible / frontmatter roto** → **AVISO** "no parseable" y **sigue** con el resto (no abortes).

## Paso 3 — Checks SEMÁNTICOS (subagente fresco)

Lanza **un subagente fresco** con la **Agent tool** (`subagent_type: general-purpose`, `model` solo si
`models.sdd-lint` es válido). Pásale las **rutas** de los artefactos (que los lea con `Read`). No debe editar
nada. Prompt:

```
Eres un validador SDD independiente. Lee los artefactos en <RUTAS> (spec.md / casos
de uso / ADR). No edites nada. Juzga SOLO lo semántico (lo mecánico ya se comprobó
aparte); para cada dimensión, di si cumple, o reporta ERROR/AVISO con evidencia
(fichero:línea). No inventes hallazgos; si algo es correcto, dilo.

1. EARS bien-formado (spec): cada requisito funcional encaja en un patrón EARS real
   — ubicuo ("El sistema DEBERÁ …"), event-driven ("Cuando …"), state-driven
   ("Mientras …"), unwanted ("Si …, entonces …"), opcional ("Donde …"). Prosa suelta
   con "DEBERÁ" pegado que no es ninguno de los 5 patrones → AVISO "EARS mal formado".
2. Coherencia de estado MADR (ADR): `accepted` SOLO si la decisión está cerrada
   (secciones Resultado de la decisión + Confirmación con contenido real). Un
   `accepted` sin decisión cerrada → AVISO "estado no fiel a la fuente".
3. Disciplina Gherkin del caso de uso: declarativo (QUÉ, no CÓMO — nada de pasos de
   UI/clicks), 1 escenario = 1 comportamiento, Given/When/Then correctos,
   `Scenario Outline` para fronteras. Escenario imperativo o con dos comportamientos
   → AVISO.
4. Trazabilidad con sentido: los FR de la spec se reflejan en algún CU/escenario; no
   hay CU que no aporte a ningún requisito. Trazabilidad rota evidente → ERROR.

SALIDA: por artefacto, lista de hallazgos, cada uno ERROR|AVISO + evidencia. Si un
artefacto está bien, dilo explícitamente. NO edites nada.
```

## Paso 4 — Consolidar y reportar

Junta lo mecánico (Paso 2) + lo semántico (Paso 3) en **un** informe:

- Agrupa por package y por artefacto; cada hallazgo con su **severidad** (ERROR/AVISO) y evidencia.
- **Veredicto**: si hay **algún ERROR** → el gate **NO pasa** (bloquea el cierre hasta corregir, como
  `fact-checker` `INCORRECTO`). Solo **AVISOS** → el gate **pasa** con los avisos **reconocidos**
  explícitamente. Sin hallazgos → **limpio**.
- **Solo lectura**: `sdd-lint` **no edita** ningún artefacto; reporta para que el humano/sesión corrija.

> **Cierre de tarea** (gate orquestado por la DoD, `features.sdd` on): un **ERROR bloquea** el cierre;
> **AVISO** se reconoce; **limpio** pasa. Corre **tras `mutation`** y **antes de `fact-checker`** (que luego
> atestigua "el gate `sdd-lint` pasó"). Con `features.sdd` off, este gate **no corre** (byte-idéntico a hoy).
