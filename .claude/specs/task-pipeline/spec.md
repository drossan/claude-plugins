# Spec — Routing de modelo por fase (configurable y sostenible)

> **Spec SDD** (GitHub Spec Kit + EARS) del package `task-pipeline`. Seed inicial: cubre la capacidad
> **"qué modelo usa cada fase/skill"** (contrato `models:`, defaults sostenibles, JSON schema, configurador).
> Crecerá para cubrir otras capacidades del plugin. El **"CÓMO"** vive en los casos de uso enlazados; las
> **decisiones** en los ADR `0001`/`0002`.

## Resumen

Define cómo el pipeline elige el modelo de cada fase: routing per-repo (`models:` en
`.claude/task-pipeline.yml`) para las fases con **subagente**, un **default sostenible** (Sonnet, con Opus
solo en `design-review`) que **no se impone** al consumidor, y un **JSON schema** para editar el YAML con
autocompletado. Para las fases **inline**, el modelo se **recomienda** (no se fuerza), salvo el frontmatter
de `/pipeline-usage`.

## User stories

- **US-1 (P1)** — Como mantenedor de un repo, quiero **fijar por repo** el modelo de cada fase con
  subagente, para controlar coste/calidad sin tocar el código del plugin.
- **US-2 (P1)** — Como adoptante del plugin, quiero un **default sostenible** que **no me imponga coste**,
  para que el pipeline sea asequible sin configurar nada.
- **US-3 (P2)** — Como editor del `task-pipeline.yml`, quiero **autocompletado/validación** en el editor,
  para editarlo sin errores de sintaxis ni de valores.
- **US-4 (P3)** — Como adoptante, quiero que `/task-init` y `/doctor` me **ofrezcan** configurar los
  modelos y **mantengan el schema al día**, para no editar a ciegas.

## Requisitos funcionales (EARS)

- **FR-001** — El sistema DEBERÁ rutar el modelo de las **3 fases con subagente siempre ruteables**
  (`design-review`, `scenario-coverage`, `fact-checker`) leyendo `models.<fase>` de `.claude/task-pipeline.yml`.
- **FR-002** — **Donde** `features.sdd` esté **on**, el sistema DEBERÁ rutar además el subagente semántico
  de `sdd-lint` vía `models.sdd-lint` (con `features.sdd` off, esa clave no tiene efecto).
- **FR-003** — **Cuando** `models.<fase>` esté ausente o valga `inherit`, el sistema DEBERÁ heredar el
  modelo de la sesión (no pasar `model` al subagente).
- **FR-004** — **Si** `models.<fase>` trae un valor inválido (typo / id inexistente), **entonces** el
  sistema DEBERÁ avisar y caer a `inherit` (nunca lanzar el subagente con un `model` roto).
- **FR-005** — El sistema DEBERÁ **ignorar** claves de `models:` para fases inline (no ruteables).
- **FR-006** — El **template** (`skills/plan-task/templates/task-pipeline.yml`) DEBERÁ enviar `models:`
  **comentado** (no impone coste/modelo); el **perfil recomendado** documentado es `design-review: opus` +
  `scenario-coverage`/`fact-checker`/`sdd-lint: sonnet`.
- **FR-007** — `/pipeline-usage` DEBERÁ declarar `model: haiku` en su frontmatter (read-only, un turno). El
  resto de fases inline **no** llevan frontmatter de modelo: su modelo se **documenta** como recomendación
  de sesión.
- **FR-008** — El `.claude/task-pipeline.yml` (y el template) DEBERÁ referenciar un **JSON schema** vía
  `# yaml-language-server: $schema=…`; el valor de una clave de `models:` DEBERÁ aceptar un alias
  (`opus|sonnet|haiku|fable|inherit`) **o** un id de modelo libre.
- **FR-009** — **Cuando** `models:` falte o esté comentado, `/task-init` y `/doctor` DEBERÁN **ofrecer
  descomentar** el bloque con el perfil recomendado (sin wizard fase-a-fase, sin escribir nada sin aprobación).
- **FR-010** — `/doctor` DEBERÁ **materializar** el schema si falta y **avisar de drift** si el schema
  materializado en el repo está desincronizado con el del plugin.
- **FR-011** — **Si** `.claude/task-pipeline.yml` es **ilegible** (YAML malformado), **entonces** la fase
  DEBERÁ reportarlo y caer a `inherit` (no abortar).

## Requisitos no funcionales

- **NFR-001** — El default **no impone coste** al consumidor: `models:` va comentado en el template; el
  `effort` de sesión sigue siendo la palanca principal de coste (documentado, fuera del alcance del routing).
- **NFR-002** — Sin dependencias nuevas: el JSON schema es **ayuda de editor**, no validación en runtime
  (no hay parser; el modelo interpreta el YAML).

## Criterios de éxito

- **SC-001** — `grep` no encuentra conteos de fase **contradictorios** en la documentación (contrato
  reconciliado: "3 siempre + `sdd-lint` condicional").
- **SC-002** — El schema es **JSON válido** (`python3 -m json.tool`) y ambos YAML **parsean** con el modeline.
- **SC-003** — Correr `/doctor` o `/task-init` sobre un repo **sin** `models:` **ofrece** descomentar y **no**
  escribe nada sin aprobación; con schema viejo, `/doctor` **marca drift**.
- **SC-004** — `pnpm docs:build` (website) en **verde** con la doc de `configuracion.md` actualizada.

## Casos de uso

- [CU-routing-contrato: Routing de modelo por fase](./casos-de-uso/routing-contrato.md)
- [CU-json-schema: Autocompletado del `task-pipeline.yml` vía JSON schema](./casos-de-uso/json-schema.md)
- [CU-configurador-doctor: Ofrecer `models:` y mantener el schema (`/task-init`, `/doctor`)](./casos-de-uso/configurador-doctor.md)
- [CU-frontmatter-inline: Modelo por frontmatter en `/pipeline-usage`](./casos-de-uso/frontmatter-inline.md)

## Fuera de alcance

- **Forzar** el modelo de fases inline multi-turno (`grilling`, `/plan-task`, `/mutation`, `/doctor`,
  `/task-init`): el frontmatter es por-turno + estático → solo se **documenta** la recomendación de sesión.
- **Escalado automático** a Opus por análisis de complejidad (descartado: análisis poco fiable).
- Reducir el coste por vías distintas al modelo (nº/tamaño de pasadas; `effort` de sesión).

## Aclaraciones pendientes

- _(ninguna; spec cerrada)_
