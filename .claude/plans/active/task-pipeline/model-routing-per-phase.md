---
id: task-pipeline-model-routing-per-phase
package: task-pipeline
status: active          # pending | active | completed | cancelled
branch: plan/task-pipeline/model-routing-per-phase
issue: 67                # issue PADRE proyectada (features.github-tracking ON); espejo one-way md→GitHub
created: 2026-08-18
updated: 2026-08-18
---

# Redefinir el modelo por fase: routing + defaults sostenibles + configurador ligero + JSON schema

## Contexto y problema

El usuario aporta una **Guía de Modelos** que reasigna qué LLM (Opus / Sonnet / Haiku / Fable 5) usa cada
fase/skill, pide que sea **configurable** desde `task-pipeline.yml → models:` y que se añada un **JSON
schema** para editar el YAML con autocompletado. Dolor de fondo que domina las decisiones: **el pipeline
gasta demasiados tokens por plan** → default **sostenible (Sonnet)** con Opus **solo donde se gana el sueldo**.

Estado actual (verificado; `.claude/task-pipeline.yml` reconfirmado 2026-08-18 = `design-review: opus`,
`scenario-coverage: sonnet`, `fact-checker: sonnet`, sin `sdd-lint`):

- `models:` rutea **fases con subagente**. Documentado como **3** (`design-review`, `scenario-coverage`,
  `fact-checker`), con un **4º lector no documentado y CONDICIONAL: `sdd-lint`** (rutea solo con
  `features.sdd` on, default off) y **drift de conteo** ya presente (`plan-task/SKILL.md:45` y `README.md:55`
  raíz dicen **2**, README plugin dice **3**). ~14-16 copias vivas del contrato.
- **Hecho de plataforma CORREGIDO** (docs `skills.md`, verificado vía subagente 2026-08-18; *re-confirmar al
  cerrar la tarea 01*): una skill **sí** puede fijar `model:` en frontmatter, inline y sin subagente — el
  README (`README.md:167`) lo negaba y **está desactualizado**. PERO es **por-turno** + **estático** → en
  skills interactivas multi-turno solo pinta el turno 1; el routing **robusto y per-repo sigue siendo
  subagente-only**. Solo "pega" limpio en skills read-only de un turno (`/pipeline-usage`).
- El **template** trae `models:` **comentado a propósito** (invariante *"el template no impone coste"* — se
  **mantiene**, no se voltea). **No existe** JSON schema (greenfield).

## Objetivos

1. **Reconciliar el contrato de fases ruteables y corregir el README.** Formular canónicamente **"3 fases
   siempre ruteables (`design-review`, `scenario-coverage`, `fact-checker`) + `sdd-lint`, que rutea solo con
   `features.sdd` on"** (NO un "4 plano"); documentar el lector silencioso de `sdd-lint`; reconciliar el
   drift 2/3 en todas las copias; corregir la "Limitación de plataforma" del README (frontmatter existe pero
   por-turno + estático; robusto = subagente-only).
   - *Criterio de éxito*: `grep` sin conteos contradictorios; `sdd-lint` documentado como condicional donde
     corresponde; README sin la afirmación desactualizada.
2. **Defaults sostenibles (perfil recomendado).** `design-review: opus` (revisión de más valor, 1×/plan) +
   `scenario-coverage: sonnet` + `fact-checker: sonnet` + `sdd-lint: sonnet`. Es el bloque **comentado** del
   template (invariante **intacta**) y el YAML **activo** de este repo (que casi no cambia: solo añade
   `sdd-lint: sonnet`).
   - *Criterio de éxito*: template comentado con ese perfil + tabla de recomendación inline; este repo con
     `sdd-lint: sonnet` añadido; ningún doc afirma "todo Opus por defecto" ni "voltear invariante".
3. **JSON schema del fichero completo + autocompletado.** Cubre `mode`/`stack`(+packages)/`features`(+opt-in)/
   `models`; valor de modelo `anyOf[enum(opus,sonnet,haiku,fable,inherit), string]`; modeline
   `# yaml-language-server`. **Materializado** en consumidores (decisión del owner, sobre la alternativa URL)
   con ruta relativa; en este repo, ruta relativa.
   - *Criterio de éxito*: schema es JSON válido; ambos YAML lo referencian y parsean; autocompleta alias sin
     rechazar ids.
4. **Modelo en skills inline, honesto con el límite.** `model: haiku` en frontmatter **solo de
   `/pipeline-usage`** (read-only, un turno). El resto inline se **documenta** como recomendación de modelo
   de **sesión** (`grilling` opus; `/plan-task`, `/mutation`, `/doctor`, `/task-init` sonnet). **Sin** hint
   de escalado automático (eliminado): planes complejos → subir `design-review` a opus a mano (una fila de
   la tabla lo dice).
   - *Criterio de éxito*: frontmatter solo en `/pipeline-usage`; tabla inline presente; ninguna maquinaria
     de auto-detección de complejidad.
5. **Configurador ligero + `/doctor` + cierre.** `/task-init` y `/doctor` **ofrecen descomentar** el bloque
   `models:` con el perfil (una frase; **sin** wizard fase-a-fase ni lógica duplicada); ambos **materializan
   el schema** y `/doctor` **detecta su drift** + **recrea** el bloque comentado si falta + **reconoce** el
   set ruteable (3 + `sdd-lint` condicional). Website + CHANGELOG + bump `0.16.0`.
   - *Criterio de éxito*: `/doctor` o `/task-init` sobre un repo sin `models:` ofrece descomentar (no wizard),
     materializa el schema y `/doctor` marca drift si el schema quedó viejo; `pnpm docs:build` verde;
     `plugin.json` → `0.16.0`.

## Alcance y fuera de alcance

### Dentro del alcance
- Contrato `models:` (definición canónica "3 + sdd-lint condicional") + corrección del README + reconciliar copias.
- Bloque comentado con el perfil (`design-review: opus` + resto `sonnet`) en el template + tabla de
  recomendación inline; este repo activo (+ `sdd-lint: sonnet`).
- JSON schema del fichero completo + modeline + **materialización** en consumidores + **drift** en `/doctor`.
- `model: haiku` en frontmatter de `/pipeline-usage` (solo esa).
- `/task-init` + `/doctor`: **ofrecer descomentar** el bloque (sin wizard); `/doctor` recrea + reconoce el set.
- Website (`configuracion.md` + `que-es.md` + nav). CHANGELOG + bump `0.16.0` + coherencia de `description`.

### Fuera de alcance
- **Hint de escalado automático a Opus** (eliminado: es el "análisis automático poco fiable" que el plan evita).
- **Configurador interactivo fase-a-fase** y su duplicación en 2 skills (encogido a "ofrecer descomentar").
- **`model: haiku` en `/task-init`** (su turno 1 es el de juicio; degradarlo perjudica; + rompería la invariante).
- **Voltear la invariante** del template / **matriz "todo Opus"** por defecto (revertidos).
- **Forzar modelo per-repo en skills inline** (frontmatter estático + por-turno): se documenta.
- **Fable 5 como recomendación** en la tabla de docs. *Matiz*: `fable` es valor válido/autocompletable del schema.
- **Reducir el coste por otras vías** (nº/tamaño de pasadas; `effort` de sesión = la palanca principal según
  el README): fuera de este plan — el plan abarata el **precio por token**, no elimina las re-lecturas (dolor
  resuelto **parcialmente**, declarado honestamente). Follow-up.
- Tocar el toolchain del `website/` o renombrar ids legacy.

## Recursos externos

- **Mapa de touch-points** (Explore, 2026-08-18) + **design-review** (Opus, 2026-08-18): el núcleo es fuerte;
  los extras del grilling (configurador, frontmatter en task-init, hint, materialización) eran sobre-ingeniería
  → recortados. `sdd-lint` = lector condicional; drift 2/3 real; `/task-init` es multi-turno (por eso no Haiku).
- **Verificación de plataforma** (claude-code-guide, 2026-08-18): skills soportan `model:` en frontmatter
  (`skills.md`), override **por-turno** e inline; `.claude/agents` soportan `model:`; el routing robusto
  per-invocación sigue siendo el `model` del Agent tool (subagente). *Re-confirmar el mecanismo por-turno al
  cerrar la tarea 01.*
- Contrato canónico: `task-pipeline/README.md:151-181`. Copias a reconciliar: ambos `task-pipeline.yml`,
  `README.md:55` (raíz), `plan-task/SKILL.md:45`, `docs/guides/task-lifecycle.md:64-66`,
  `docs/flujo-del-pipeline.md:118-120`, `CLAUDE.md:56-57,73-74`, `HOW-TO-START-A-TASK.md:49`,
  `website/guia/configuracion.md:63-68`. `/doctor` `skills/doctor/SKILL.md:41-46,234,252`.

## Estimación global

- **Tareas totales**: 7 (ver lista al final).
- **Esfuerzo estimado**: 5-7 sesiones (doc/config-heavy; el schema y los cambios en `/doctor` son las piezas
  con más sustancia).
- **Recursos**: solo este repo. `features.github-tracking` y `git-automation` **ON** → proyección a GitHub +
  auto-commit por tarea; auto-PR al cerrar el plan.

## Criterios de calidad y verificación

- **Stack `none`**: TDD y gate de mutation **N/A**. Escenarios Gherkin = **criterios de aceptación** por
  **inspección / `grep` / `test -f` / correr la skill** (`/doctor`/`/task-init` sobre un repo de prueba sin
  `models:` o con schema viejo), no con runner.
- **`features.sdd` ON**: cada tarea enlaza su Gherkin al **caso de uso** (fuente única) y pasa `/sdd-lint` al
  cerrar; si el package no tiene `spec.md`/CU, se materializan desde plantillas antes.
- **Barrido `grep` reforzado** al cerrar: sin conteos de fase contradictorios ni identificadores muertos.
- **YAML**: ambos parsean (PyYAML); schema es **JSON válido** (`python3 -m json.tool`); validación
  YAML↔schema por **inspección/best-effort** (no se añaden dependencias).
- **Website**: `pnpm docs:build` verde. **Gate `fact-checker`** en cada cierre (no-negociable).

## Tasks

- [x] `task-pipeline-model-routing-per-phase-01` (P1) — Contrato canónico ("3 ruteables + `sdd-lint`
  condicional") + documentar el lector silencioso + reconciliar el drift 2/3 en todas las copias + **corregir
  la limitación del README** (frontmatter por-turno + estático; robusto = subagente-only)  · depends_on: —
- [x] `task-pipeline-model-routing-per-phase-02` (P2) — YAML `models:`: bloque **comentado** con el perfil
  (`design-review: opus` + resto `sonnet`) + tabla de recomendación inline (template); **este repo** añade
  `sdd-lint: sonnet` (activo); invariante **intacta**  · depends_on: 01
- [x] `task-pipeline-model-routing-per-phase-03` (P2) — JSON schema del `task-pipeline.yml` completo +
  modeline (este repo ruta relativa) + `anyOf[enum,string]` para modelos  · depends_on: 01
- [x] `task-pipeline-model-routing-per-phase-04` (P2) — Frontmatter `model: haiku` en **`/pipeline-usage`**
  (solo esa; con cláusula de compat de versión)  · depends_on: —
- [x] `task-pipeline-model-routing-per-phase-05` (P3) — `/task-init` + `/doctor`: **ofrecer descomentar** el
  bloque `models:` (sin wizard) + **materializar el schema**; `/doctor` **detecta drift** del schema, **recrea**
  el bloque comentado y **reconoce** el set (3 + `sdd-lint` condicional)  · depends_on: 01, 02, 03, 04
- [ ] `task-pipeline-model-routing-per-phase-06` (P3) — Website: `configuracion.md` (set ruteable +
  perfil + schema/autocompletado + coste) + `que-es.md`/nav; `pnpm docs:build` verde  · depends_on: 01, 02, 03, 05
- [ ] `task-pipeline-model-routing-per-phase-07` (P4) — Cierre de release: CHANGELOG + bump `0.16.0` +
  coherencia de `description` + barrido `grep` final  · depends_on: 01, 02, 03, 04, 05, 06

## Registro de cambios del plan

- 2026-08-18: creado. Decisiones de scope del owner vía AskUserQuestion.
- 2026-08-18: **refinado con `grilling`** (9 preguntas): `sdd-lint` ruteable; template comentado + configurador;
  default sonnet por coste; frontmatter donde "pega"; corrección del hecho de plataforma; schema materializado.
  (Este registro se corrige abajo con la design-review.)
- 2026-08-18: **`design-review` (subagente Opus)** — hallazgos aceptados; el plan se **encoge de 8 a 7 tareas**:
  - **Hint de escalado ELIMINADO**: su disparador corre en Sonnet y es el "análisis automático poco fiable"
    que el resto del plan evita (calibración por-ejemplos, README "no hay modelo óptimo automático"). Se
    sustituye por una **fila en la tabla de recomendación**. Revierte la decisión del grilling P6.
  - **Perfil default = `design-review: opus` + resto `sonnet`** (antes `sonnet×4`): design-review es la fase
    donde el modelo fuerte más pesa (1×/plan); el ahorro real está en las pasadas repetidas/de cierre. Este
    repo apenas cambia (solo añade `sdd-lint: sonnet`). Revierte el "sonnet×4" del grilling.
  - **`sdd-lint` = condicional, no "4 plano"**: se documenta como "3 siempre + `sdd-lint` con `features.sdd`
    on" para no elevar a la superficie principal una gate que por defecto no rutea.
  - **Frontmatter Haiku solo en `/pipeline-usage`** (fuera de `/task-init`): `/task-init` es multi-turno y su
    turno 1 es el de juicio; Haiku ahí degradaría la decisión y rompería la invariante "no impongo coste".
  - **Configurador encogido**: de wizard fase-a-fase duplicado en 2 skills a "**ofrecer descomentar** el
    bloque" — evita crear más copias autoritativas de la lista de fases (la enfermedad que el plan cura).
  - **Schema materializado + drift**: el owner **mantiene** la materialización pese a que la review recomendaba
    **URL publicada** (menos superficie, sin drift). Decisión consciente del owner (autocontenido/offline).
  - **Honestidad de coste**: el plan abarata el precio por token, no elimina las re-lecturas de contexto; la
    palanca principal (`effort` de sesión) queda fuera de alcance como follow-up.
  - Pendiente: **re-confirmar** el mecanismo "frontmatter por-turno" al cerrar la tarea 01 (load-bearing).
- 2026-08-18: **`scenario-coverage` (subagente QA Sonnet)** sobre el set completo + los 4 CU + el plan.
  Sin enlaces rotos. **(A) huecos incorporados a los CU** (fuente única): `routing-contrato` (models vacío /
  fichero 0-bytes / ilegible por IO ≠ malformado / normalización trim+case-insensitive / id no-alias
  pass-through / fallo de invocación post-preflight → aviso+inherit / tipo escalar / clave inexistente /
  sdd off→on a mitad de plan / sdd malformado fail-safe / yml ausente); `json-schema` (sin python3 →
  NO VERIFICABLE / no-escalar rechazado / cobertura fuera de models / modeline con ruta rota);
  `configurador-doctor` (caminos felices de **aceptar** descomentar y aceptar fix de drift; no-op de schema
  sincronizado; materializar en repo ya adoptado con aprobación; `models:` a-medias = configurado;
  ausente-del-todo → recrea comentado vs presente-comentado → ofrece descomentar; clave espuria = posible
  typo). **Decisiones de diseño resueltas**: ancla de drift = clave-ancla JSON `x-task-pipeline-schema-version`
  (el truco de `honesty-rules.md` no vale en JSON); schema editado a mano → reportar sin sobrescribir
  (tareas 03/05 actualizadas). **(B) fuera de alcance — decisión del owner**: B1 (grep "no hay
  auto-escalado" en tarea 07) y B2 (chequeo "sin Fable en la tabla" en tarea 02) → **ambos incorporados**;
  B3 (guardarraíl "una sola oferta, no fase-a-fase") ya recogido en el CU. Nada tocó las áreas realmente
  fuera de alcance (invariante / inline / website toolchain / ids legacy).
- 2026-08-18: **Proyección a GitHub** (`features.github-tracking`, owner eligió "proyectar ahora"). Padre =
  **#67** (labels `plan` + `pkg:task-pipeline`); tareas 01-07 = **#68-#74** (label `pkg:task-pipeline`);
  todas en el Project 2 "Claude code plugin" con Status **Backlog**, assignee `@me` (drossan). **Degradación
  aceptada**: `gh 2.69.0` **no** soporta `--parent` → issues **planas** con nota de texto "Parte del plan
  #67", **sin** anidación nativa (ni retroactiva al actualizar gh). `issue:` escrito en el frontmatter de
  plan + 7 tareas. Espejo one-way md→GitHub; el `.md` es la fuente de verdad.
- 2026-08-18: **Tarea 01 cerrada** (`done`). Contrato canónico reconciliado en 9 ficheros vivos (README del
  plugin corregido en su "Limitación de plataforma" + conteo 2→3 en las 7 copias restantes). Gates
  `sdd-lint` (1 AVISO menor reconocido) y `fact-checker` (5/6 VERIFICADO, 1 afirmación propia corregida)
  superados. Follow-up detectado (no de este plan): el roster de skills de `README.md` raíz no lista
  `sdd-lint`. Siguiente tarea recomendada: **02** (defaults sostenibles del perfil).
- 2026-08-18: **Tarea 02 cerrada** (`done`). Perfil activo en este repo (+ `sdd-lint: sonnet`), template
  comentado con el mismo perfil, tabla de recomendación de sesión para fases inline en el README del
  plugin (sin `fable`, sin afirmar el frontmatter de `/pipeline-usage` que aún no existe). Gates
  `sdd-lint` (invarianza, sin cambios en `.claude/specs/`) y `fact-checker` (6/6 VERIFICADO) superados.
  Siguiente tarea recomendada: **03** (JSON schema) o **04** (frontmatter `/pipeline-usage`) — ambas sin
  dependencias pendientes entre sí, se pueden hacer en cualquier orden.
- 2026-08-18: **Tarea 03 cerrada** (`done`). JSON schema (draft-07) creado en
  `skills/plan-task/templates/task-pipeline.schema.json`, materializado dogfood en
  `.claude/task-pipeline.schema.json`, modeline `yaml-language-server` en ambos `task-pipeline.yml`,
  clave-ancla `x-task-pipeline-schema-version: "1.0.0"`. Validado con `jsonschema` (Draft7Validator) contra
  10 casos derivados del CU (incl. los 6 verificados por `fact-checker`). Gates `sdd-lint` (invarianza) y
  `fact-checker` (6/6 VERIFICADO) superados. Siguiente tarea recomendada: **04** (frontmatter
  `/pipeline-usage`) — última sin dependencias pendientes antes de que **05** las necesite todas (01, 02,
  03, 04).
- 2026-08-18: **Tarea 04 cerrada** (`done`). `model: haiku` añadido al frontmatter de
  `pipeline-usage/SKILL.md`; confirmado por grep que ninguna otra `SKILL.md` declara `model:`. Cláusula de
  compat de versión: **NO VERIFICABLE** (reconocido, no bloquea). Gates `sdd-lint` (invarianza) y
  `fact-checker` (4/4 VERIFICADO) superados. **Todas las dependencias de la tarea 05 (01, 02, 03, 04) están
  `done`** — siguiente tarea recomendada: **05** (configurador `/task-init`+`/doctor` + materialización/drift
  del schema).
- 2026-08-18: **Tarea 05 cerrada** (`done`). `/task-init` materializa el schema en bootstrap (Paso 3b);
  `/doctor` reescrito: categoría 2 (3 estados de `models:` + clave espuria = posible typo) y nueva
  categoría 11 (schema: materializar / drift por ancla SemVer estricta / reportar sin sobrescribir si es
  edición manual — regla de comparación precisada tras un hallazgo real de ambigüedad en verificación).
  Verificado corriendo la lógica documentada contra 7 fixtures sintéticos (7/7 coinciden). README
  actualizado (fila `/doctor` + tabla de plantillas). Gates `sdd-lint` (invarianza) y `fact-checker` (6/6
  VERIFICADO) superados. Siguiente tarea recomendada: **06** (website: `configuracion.md` + `que-es.md` +
  nav) — depende de 01, 02, 03, 05, todas `done`.
