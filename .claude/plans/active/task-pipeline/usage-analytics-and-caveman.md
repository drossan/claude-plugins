---
id: task-pipeline-usage-analytics-and-caveman
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/usage-analytics-and-caveman
created: 2026-07-16
updated: 2026-07-16
---

# Analytics de uso (`/pipeline-usage`) + modo caveman-lite (opt-in)

## Contexto y problema

El plugin `task-pipeline` (v0.10.0) no expone **telemetría** de su propio coste:
no sabes cuántos tokens/tiempo/qué modelo consume una sesión ni sus fases. El
usuario quiere (1) un **registro analítico** de uso, y (2) evaluar un **modo
caveman** (compresión de output) opcional.

Este plan pasó por `grilling` **y** `design-review` (subagente fresco, opus). La
review —apoyada en datos reales de este repo— tumbó el diseño original (colector por
hooks cada turno) y forzó un **re-scope**. Lo esencial que cambió:

- **Analytics = skill on-demand `pipeline-usage`, SIN hooks nuevos.** El patrón
  correcto en un plugin de *skills model-driven* no es un hook Bash parseando JSONL
  cada turno (era O(n²) por sesión, spawn de python por turno en repos ajenos, y
  superficie que ensucia proyectos que solo quieren el plugin). Una skill que parsea
  el transcript **cuando la invocas** elimina todo eso y encaja con la arquitectura.
- **Sin flag `features.analytics` ni "categoría de flags opt-in".** Al ser on-demand
  y read-only, *invocar la skill es el opt-in*: no hace falta flag ni una categoría
  nueva de config (superficie pública cara de deshacer, según la review).
- **Caveman se mantiene, pero con backoff DETERMINISTA** (el hook lee la fase activa;
  no se fía del juicio del modelo) y sin la justificación falsa de "analytics lo
  medirá" (resúmenes por sesión sin control A/B no aíslan su efecto).

### Hechos verificados (contra datos reales de este repo)

- **Transcript JSONL** (`~/.claude/projects/<slug>/<uuid>.jsonl`): `message.model`,
  `message.usage` (4 componentes: `input`, `output`, `cache_creation`, `cache_read`),
  `timestamp`, `attributionSkill`, `attributionPlugin`, `agentName`, `isSidechain`.
- **Principal y subagente son ficheros SEPARADOS**: los subagentes viven en
  `<session>/subagents/agent-<id>.jsonl` (con `usage`/`model` limpios) → **cero
  doblecontar**. `meta.json` del subagente trae `agentType` (= `general-purpose` para
  las fases del pipeline).
- **La atribución por-fase es minoritaria**: en una sesión real de 514 mensajes con
  `usage`, **solo el 8.6% (44) tenía `attributionSkill`**; el 91.4% es "baseline" sin
  fase. → El **titular honesto es el total de sesión**; el por-fase es un extra
  best-effort.
- **La clave de fase es plataforma-owned e inestable**: coexisten
  `task-pipeline:grill-me` (55) y `task-pipeline:grilling` (51), más `init` (13,
  ajeno). Las fases-subagente (`design-review` 38, `scenario-coverage` 26, `doctor`
  49) **sí** aparecen como `attributionSkill` → el "design-review gastó X" es
  obtenible, pero sobre esa base inestable.
- **El formato ya está derivando**: `cache_creation` (objeto) convive con
  `cache_creation_input_tokens` (escalar); hay dir `tool-results/` externalizado;
  claves duplicadas `session_id`/`sessionId`. Anthropic documenta el formato como
  interno y "no lo parsees" (`code.claude.com/docs/en/sessions.md`).
- **Hooks** (`code.claude.com/docs/en/hooks.md`): `UserPromptSubmit` puede inyectar
  `hookSpecificOutput.additionalContext`; recibe `transcript_path`, `session_id`,
  `cwd`, `prompt`. Molde existente: `hooks/bootstrap.sh` + `hooks/hooks.json`.
- **Entorno**: `python3` y `jq` presentes aquí; Bash de macOS es **3.2** (sin arrays
  asociativos) → orquestación 3.2-compatible; agregación en **python3**.

### Principios de diseño (de la review)

- **Honestidad > número bonito**: `pipeline-usage` presenta el total de sesión como
  titular robusto y **grita** si el esquema no cuadra o la fracción atribuida es baja
  ("cifras best-effort, formato interno no soportado, posiblemente incompletas").
  Nunca presenta un número derivado como hecho. Coherente con `honesty-rules.md`.
- **No ensuciar repos ajenos / no coste por turno**: analytics no añade hooks; el
  único hook nuevo (caveman) hace **no-op en Bash barato** (adopción + flag) antes de
  cualquier trabajo, y **no** corre nada si `caveman: off`/ausente.
- **Superficie mínima**: sin flag de analytics, sin categoría nueva; un solo flag de
  comportamiento (`features.caveman`) documentado junto a los features existentes.

## Objetivos

1. **Skill `pipeline-usage` (on-demand, read-only).**
   - *Criterio de éxito*: invocada, lee el transcript de la sesión (y opcionalmente
     las pasadas del proyecto) y presenta **total de sesión** (4 componentes; titular
     input+output, cache aparte), **por-fase best-effort** (por `attributionSkill`,
     mostrado tal cual aparece — sin mapa de rename hardcodeado, evitando el string
     `grill-me` vivo) con su **% de gasto atribuido**, y **por-subagente** (de
     `subagents/*.jsonl`, con modelo). Si el esquema no se reconoce o falta python3 →
     **aviso ruidoso**, no número falso. Opcional: snapshot en
     `.claude/analytics/sessions/<session_id>.json`.
2. **Modo caveman-lite, opt-in, con backoff determinista.**
   - *Criterio de éxito*: con `features.caveman: lite|full`, el hook `UserPromptSubmit`
     inyecta la directiva mínima (comprime prosa; código/comandos/errores/paths
     byte-a-byte) **salvo** cuando la fase activa (leída del tail del transcript) es un
     checkpoint (`grilling`/`design-review`/`scenario-coverage`/`fact-checker`), donde
     **no inyecta**. Con `off`/ausente o repo no adoptado → **no inyecta nada** (no-op
     verificable). Afecta al hilo principal, no a subagentes (documentado).
3. **Coherencia del plugin (docs, doctor, versión).**
   - *Criterio de éxito*: `features.caveman` en el YAML del repo (dogfood `lite`) y en
     el template (comentado); `pipeline-usage` documentada en README; `/doctor` detecta
     (report-only) el flag/hook de caveman; `plugin.json` bump SemVer + CHANGELOG;
     `claude plugin validate .` OK; barrido `grep` sin identificadores muertos.

## Alcance y fuera de alcance

### Dentro del alcance
- **Skill `pipeline-usage`** (playbook Markdown model-driven; agrega vía python3).
- **Flag `features.caveman`** (`off|lite|full`) en repo YAML + template (comentado).
- **Hook `UserPromptSubmit`** caveman-lite (Bash 3.2, gate barato, backoff determinista
  por tail), registrado en `hooks/hooks.json`.
- Gitignorear `.claude/analytics/` **en este repo** (edición manual, solo aquí).
- `/doctor` consciente del flag/hook de caveman (report-only); README; versión/CHANGELOG.

### Fuera de alcance
- **Colector de analytics por hooks** (`Stop`/`SubagentStop`) — descartado por la review
  (O(n²) por turno, coste en repos ajenos, mal fit arquitectónico).
- **Flag `features.analytics`** y la **categoría "opt-in behaviors"** — innecesarios
  (analytics es on-demand; menos superficie pública).
- Vendorizar el caveman externo (`ultra`/`wenyan`/`cavecrew`/`compress`); comprimir
  `honesty-rules.md`/`CLAUDE.md`; exportador OTel/statusline; tocar `.gitignore` de
  repos ajenos o el `CLAUDE.md` del usuario; rutar fases inline.

## Recursos externos
- Caveman: `github.com/juliusbrussee/caveman` (MIT). Benchmark: micro-versión ≈ skill
  completo; ROI real en flujos con tool-use = 14–40%, a veces <1%.
- Doc oficial: `hooks.md`, `sessions.md` (formato interno, no parsear),
  `statusline.md`/`monitoring-usage.md`/`headless.md` (soportadas = totales de sesión).
- Interno: `hooks/bootstrap.sh` + `hooks/hooks.json` (molde con gate de adopción);
  `skills/doctor/SKILL.md` (grep-sweep + drift); `templates/task-pipeline.yml`
  (invariante "template no impone coste"); las skills existentes como estilo.

## Estimación global
- **Tareas totales**: 4 (skill · flag caveman · hook caveman · cierre).
- **Esfuerzo estimado**: 3–4 sesiones. Riesgo mayor: la agregación honesta+ruidosa de
  `pipeline-usage` y el backoff determinista por tail del hook caveman.
- **Recursos**: repo de prueba (adoptado/sano/no adoptado); python3.

## Criterios de calidad y verificación

> **Stack `none`** (skills Markdown + hooks Bash): TDD y gate de mutation = **N/A**.
> Gherkin = **criterios de aceptación** verificables por inspección / `grep` / `test`
> / **corriendo la skill o el hook** en un repo de prueba.

- `pipeline-usage`: correr sobre un transcript real y comprobar total de sesión +
  por-fase best-effort + por-subagente; forzar esquema irreconocible / sin python3 y
  ver el **aviso ruidoso** (no número falso).
- Hook caveman: `bash -n`; ejecutar en repo adoptado/sano/no adoptado con
  `caveman: off|lite|full`; verificar **no-op** (off/no adoptado) y **backoff** (fase
  checkpoint en el tail → no inyecta). Gate barato en Bash antes de cualquier trabajo.
- `claude plugin validate .` OK; coherencia `plugin.json`/`marketplace.json`/CHANGELOG.
- **Barrido `grep` reforzado** sin `grill-me`/`/task`/`skills/task/` vivos (allowlist:
  atribución Matt Pocock + CHANGELOG ≤ 0.8.1). Ojo: `pipeline-usage` **no** hardcodea
  `grill-me` (muestra las claves tal cual las lee).
- **Gate `fact-checker`** (no-negociable) al cerrar cada tarea.

## Tasks

> Analytics (009) y caveman (010–011) son independientes; el cierre (012) depende de
> todas. Descomposición con Gherkin definitivo tras `scenario-coverage`.

- [x] `task-pipeline-009` (P1) — Skill **`pipeline-usage`** on-demand: agrega el/los transcript(s) con python3; total de sesión + por-fase best-effort (claves tal cual) + por-subagente; **degradación ruidosa**; snapshot opcional en `.claude/analytics/sessions/`; gitignorear `.claude/analytics/` en este repo; docs README  · depends_on: —  ✅ done (fact-checker OK)
- [x] `task-pipeline-010` (P2) — Flag **`features.caveman`** (`off|lite|full`, default off): repo YAML (dogfood `lite`) + template (comentado) + docs (junto a features existentes, sin categoría nueva)  · depends_on: —  ✅ done (fact-checker OK)
- [x] `task-pipeline-011` (P2) — Hook **`UserPromptSubmit`** caveman-lite: gate barato (adopción+flag) en Bash 3.2; inyecta directiva mínima; **backoff determinista** por tail del transcript (fase checkpoint → no inyecta); `hooks.json`  · depends_on: task-pipeline-010  ✅ done (15 casos verificados, fact-checker OK)
- [ ] `task-pipeline-012` (P3) — Cierre: `/doctor` report-only del flag/hook de caveman + README (`pipeline-usage` + caveman) + bump `plugin.json` (0.11.0) + CHANGELOG + `plugin validate`  · depends_on: task-pipeline-009, task-pipeline-011

## Registro de cambios del plan
- 2026-07-16: creado. Decisiones previas del owner: un plan combinado; caveman =
  opción 3 (propio mínimo); analytics = hook + skill; analytics primero.
- 2026-07-16: refinado con `grilling` (7 ramas, 8 decisiones): parse best-effort +
  consistencia interna + marcador de esquema; 4 tokens crudos (titular input+output);
  python3 único; recogida `Stop`+`SubagentStop`; almacenamiento resumen por sesión;
  caveman switch solo-YAML `off|lite|full`, `UserPromptSubmit`, backoff model-driven;
  dogfood (`analytics: true`, `caveman: lite`, gitignore).
- 2026-07-16: **re-scope tras `design-review` (opus, subagente fresco)**. Verificado
  contra datos reales: 91.4% del gasto sin `attributionSkill`; `grill-me`/`grilling`
  coexisten (choca con el grep-sweep si se hardcodea); formato ya derivando. Cambios:
  (a) **analytics pasa a skill on-demand `pipeline-usage`, sin colector por hooks**;
  (b) **eliminado el flag `features.analytics` y la categoría "opt-in behaviors"**
  (invocar = opt-in); (c) titular = total de sesión, por-fase best-effort con **aviso
  ruidoso** (honestidad); (d) **caveman se mantiene** pero con **backoff determinista**
  (hook lee la fase activa) y se borra la justificación "analytics lo medirá"; (e) la
  skill **no hardcodea `grill-me`** (muestra las claves tal cual). Scope: de ~6 a 4
  tareas. Aguantó la review: no-op en repos ajenos, cero doblecontar, reversibilidad
  del formato en disco, privacidad, no tocar CLAUDE.md/.gitignore ajenos.
- 2026-07-16: descompuesto en 4 tareas (009–012) + `scenario-coverage` (subagente QA
  fresco). Hallazgo **crítico verificado**: `attributionSkill` lleva **prefijo
  `task-pipeline:`** (valor real `task-pipeline:grilling`) → el backoff de la 011 debía
  matchear con prefijo o **nunca se dispararía** (habría inyectado caveman en pleno
  grilling); corregido en la spec de 011 y en la 009 (claves mostradas verbatim). Otros
  huecos incorporados: flag comentado no-activo, hook Bash-puro sin spawn de python/jq,
  valores no canónicos → off, cache objeto/escalar sin doblar, JSONL corrupto, privacidad
  + aviso de gitignore al consumidor, % atribuido bajo, session_id/sessionId, caveman ×
  honesty-rules. Corrección de propiedad en `/doctor` (012): el hook es **plugin-owned**
  (solo-reporte), solo el flag es repo-owned. Sin tareas nuevas (todo cabe en 009–012).
