---
id: task-pipeline-opus5-realignment
package: task-pipeline
status: active           # pending | active | completed | cancelled
branch: plan/task-pipeline/opus5-realignment
issue: 27                # issue PADRE proyectada (features.github-tracking)
created: 2026-08-09
updated: 2026-08-09
---

# Realineación del pipeline con el comportamiento documentado de Opus 5

## Contexto y problema

Desarrolladores reportan sobre Opus 5 dos patrones que queman tiempo y tokens:

1. **Bucles de diagnóstico falso** — asume un error inexistente, actúa sobre esa hipótesis
   sin confirmarla, y cada "arreglo" genera el siguiente. Un caso reportado: un día entero
   persiguiendo un problema que no existía.
2. **Desvío de alcance** — se le pide una feature (compatibilidad MySQL+PG en una API con
   TypeORM) y acaba generando trabajo de despliegue, refactors no pedidos y tareas fuera del
   encargo.

### Qué dice la fuente autoritativa

`shared/model-migration.md` (guía de migración a Opus 5 de Anthropic, empaquetada en la skill
`claude-api`) documenta ambos como comportamiento conocido del modelo. Los bloques aplicables:

- **Scope creep → instrucción de prompt.** Anthropic publica un bloque literal y afirma que
  *"en pruebas, esta instrucción redujo los cambios de alcance a casi cero sin producir
  preguntas de clarificación excesivas"*.
- **Delegación → cap determinista.** *"you likely want an explicit cap. **A deterministic
  ceiling on spawn count is the reliable lever**"*. Opus 5 delega **más** que 4.8 — dirección
  opuesta a la generación anterior.
- **Entregables escritos más largos.** Los ficheros que el modelo escribe a disco (informes,
  Markdown) son más largos; hay instrucción publicada para calibrarlos. Este repo produce
  **exclusivamente** Markdown.
- **Token burn → borrar scaffolding de verificación.** *"Las instrucciones que le dicen que
  verifique ('incluye un paso de verificación final', 'usa un subagente para verificar') ahora
  causan sobre-verificación. Eliminarlas reduce la sobre-verificación sin regresión de
  capacidad."* Y la línea hermana: *"**Self-check instructions are the same trap** — 'double-check
  your answer', 're-verify before responding'… **invierte una best-practice estándar** de prompting."*

Lo último **apunta a este plugin**: `design-review`, `scenario-coverage` y `fact-checker`
lanzan subagentes de verificación, y `design-review` está pineado a `opus`. Un usuario del hilo
de Reddit lo reporta desde campo: *"inyectando tests/challenges y todo tipo de verificaciones…
consumimos más tokens, perdemos más tiempo"*.

### Qué NO cubre el plugin hoy (el hueco real)

`templates/honesty-rules.md` cubre "no inventes símbolos" y "no afirmes que los tests pasan".
**No cubre** el clúster que causa el bucle: hipótesis presentada como hecho, arreglo sobre
diagnóstico no reproducido, cambio de teoría sin evidencia, síntoma en vez de causa raíz.
`templates/task.md` **no tiene** acotación de alcance (el plan sí: `templates/plan.md:31`). Y no
hay cap de delegación ni calibración de longitud de entregables en ninguna parte.

### El canal de entrega está roto (hallazgo de `grilling`)

- **`hooks/bootstrap.sh:65`** — `if [ ! -f "$HONESTY" ]`: solo restaura si el fichero **falta**.
- **`skills/doctor/SKILL.md:68-73`** (cat. 6) — solo comprueba **ausencia** del fichero y del
  `@import`. **No compara contenido**.

En un repo ya adoptado, las secciones nuevas **nunca llegarían**. La detección de drift no es un
extra: es el canal de entrega, y va dentro de cada tarea que añade una sección. Precedente:
`doctor` cat. 5 ya implementa "drift de plantilla" con **ancla de versión** (*"desde 0.10.0"*).

Segundo punto único de fallo: `honesty-rules.md` solo se lee cada turno si el repo consumidor
añadió `@.claude/honesty-rules.md` a su `CLAUDE.md`, y **el plugin nunca edita `CLAUDE.md` por
diseño**. Sin ese `@import`, ninguna regla de comportamiento del plugin se aplica.

### Bugs preexistentes en el fichero que vamos a tocar (hallazgo de `design-review`)

- `templates/honesty-rules.md:31` y `templates/coding-standards.md:17` llevan un **`</content>`
  colgado** — basura que se propaga a cada repo vía `/task-init` y vía `bootstrap.sh:65`, en un
  fichero leído cada turno. Además generaría **drift espurio permanente** con la detección nueva.
- La cabecera de la plantilla apunta a `.claude/specs/general/coding-standards.md`, que **no
  existe** en este repo (verificado). Puntero colgante.

### El coste honesto de este plan

Estas reglas **no** cuestan tokens por fase, pero **sí por turno**: `honesty-rules.md` (31 líneas
hoy) crece e se inyecta en cada turno de cada sesión de cada repo adoptado, para siempre. Este
repo además dogfoodea `features.caveman: lite` — paga un hook para comprimir output mientras
este plan expande el input por turno. Es un trade consciente, no coste cero.

### Resultado buscado

Que un repo que adopte `task-pipeline` reciba disciplina de alcance, de delegación, de longitud
de entregables y de hipótesis/evidencia; que esas reglas **puedan llegar** también a los repos ya
adoptados; que se use la palanca de coste **ya construida** (el salto en planes triviales) en vez
de esperar a un estudio; y que la decisión sobre las fases con subagente se tome con datos y una
regla con denominador válido.

## Objetivos

1. **Acotar alcance, delegación y longitud por defecto.**
   - *Criterio de éxito*: `templates/honesty-rules.md` y `templates/task.md` materializados en un
     repo de prueba contienen los tres bloques; `grep` lo confirma tras `/task-init`.
2. **Cortar el bucle hipótesis→arreglo→daño, con la defensa escrita.**
   - *Criterio de éxito*: `honesty-rules.md` exige marcar hipótesis vs hecho, prohíbe implementar
     sobre un diagnóstico no reproducido y fija un tope de intentos; y el plan argumenta por
     escrito por qué esas reglas no caen bajo *"self-check instructions are the same trap"*.
3. **Que `/doctor` PUEDA entregar las reglas a los repos ya adoptados.**
   - *Criterio de éxito*: `/doctor` en un repo con `honesty-rules.md` de versión anterior reporta
     el drift por **ancla de versión** y ofrece el fix con diff + aprobación. (`/doctor` es
     **pull**: entrega la capacidad, no garantiza la llegada — el push no existe y no se inventa.)
4. **Dejar de expandir alcance desde el propio pipeline, sin cegarlo.**
   - *Criterio de éxito*: el subagente de `scenario-coverage` recibe el plan y **reporta completo**
     los huecos fuera de alcance, marcados como tales.
5. **Bajar el coste de las fases caras hoy, con la palanca ya construida.**
   - *Criterio de éxito*: los criterios del "Salto en planes triviales" (`plan-task/SKILL.md:45-52`)
     quedan tensados y el salto sigue exigiendo confirmación del owner + registro en el change log.
6. **Decidir sobre las fases con subagente por evidencia, con una regla válida.**
   - *Criterio de éxito*: existe `.claude/specs/task-pipeline/opus5-audit.md` con la clasificación
     de valor hecha **antes** de ver el coste, y el veredicto según la regla ordinal — aplicada
     **solo** a las fases que tienen numerador.

## Alcance y fuera de alcance

### Dentro del alcance
- `task-pipeline/skills/plan-task/templates/honesty-rules.md` — 4 bloques nuevos, carta ampliada,
  ancla de versión, fix del `</content>` y del puntero colgante.
- `task-pipeline/skills/plan-task/templates/coding-standards.md` — fix del `</content>`.
- `task-pipeline/skills/plan-task/templates/task.md` — sección `## Fuera de alcance`.
- `task-pipeline/skills/doctor/SKILL.md` — drift por ancla de versión + aviso reforzado del `@import`.
- `task-pipeline/skills/scenario-coverage/SKILL.md` — material de entrada + salida marcada.
- `task-pipeline/skills/plan-task/SKILL.md` — Paso 5.5 y criterios del salto trivial.
- Docs: `README.md` del plugin, `website/`, `docs/guides/task-lifecycle.md`, `CHANGELOG.md`.
- Informe de medición/auditoría (artefacto, no cambio de comportamiento).

### Fuera de alcance
- **Borrar o convertir a inline `design-review` / `scenario-coverage` / `fact-checker`.** Depende
  del veredicto de la tarea 06 → plan posterior.
- **Crear la skill `scope-guard`.** Descartada; `design-review` lo confirmó: *"crear un gate con
  subagente para arreglar el problema del exceso de gates con subagente es autocontradictorio"*.
- **`effort:` por fase.** Imposible: la **Agent tool no acepta parámetro `effort`** (solo
  `description`, `isolation`, `model`, `prompt`, `run_in_background`, `subagent_type`). Solo se
  documenta la palanca de sesión en el README.
- **Que `bootstrap.sh` reconcilie secciones.** Corre con `set -eu` en cada `SessionStart` de cada
  repo del disco; fusionar contenido ahí es donde un fallo silencioso ensucia repos ajenos.
- **Editar el `CLAUDE.md` del consumidor.** Frontera de diseño; se refuerza el aviso, no se cruza.
- **Meter `fact-checker` en el ranking de la tarea 06.** No produce entradas de change log por
  construcción — su valor vive en `.claude/context/`. Ver tarea 06.
- Cambiar código en el repo del API con TypeORM.
- Verificar los issues `anthropics/claude-code#83510` / `#83795` citados en el hilo.

## Recursos externos

- `claude-api` skill → `shared/model-migration.md` → *Migrating to Claude Opus 5* (bloques de
  scope discipline, delegación/cap de spawn, longitud de entregables, corrections; guía de effort)
  y *Migrating to Claude Fable 5* (bloque *"audit each claim against a tool result"*).
- `claude-api` skill → `shared/prompt-audit.md`.
- Hilo `r/PiCodingAgent` "Opus 5 es un fracaso" — **n=1, señal mixta**. Aporta la taxonomía de
  síntomas y un reporte de campo. No se usa como evidencia de nada más.
- Precedentes internos: `doctor` cat. 5 (drift de plantilla con ancla de versión);
  `plan-task/SKILL.md:45-52` (salto en planes triviales).

## Estimación global

- **Tareas totales**: 6 (ver lista al final).
- **Esfuerzo estimado**: 5–7 sesiones. La 06 es la más cara.
- **Recursos**: `python3` (verificado). Datos verificados por `design-review`: **19** transcripts
  de nivel superior (Jul 16 ×7, Jul 17 ×2, Jul 23 ×6, Jul 24 ×2, Jul 31 ×1, Ago 9 ×1), **10**
  directorios de subagentes y 47 `agent-*.jsonl`; **29,7%** de las entradas de nivel superior
  llevan `attributionSkill`, **49,0%** en subagentes.

## Criterios de calidad y verificación

Stack `none` (Markdown + Bash): **no hay runner de tests, lint ni Stryker**. Los ítems de TDD y el
gate de mutation de la DoD son **N/A**; el gate de `fact-checker` **sí** aplica.

- Verificación por **inspección**, `grep`, `test -f`, y **ejecutando la skill/hook** en un repo de
  prueba (adoptado / sano / no adoptado).
- `bash -n hooks/bootstrap.sh` tras cualquier toque al hook.
- **Barrido `grep` reforzado** al cerrar, respetando la allowlist legítima de `CLAUDE.md`.
- Coherencia `description` de `plugin.json` ↔ `marketplace.json` en el release.

### Verificación de extremo a extremo

1. **Repo limpio** → `/task-init` → `grep -c "Fuera de alcance" .claude/honesty-rules.md`; el
   `task.md` copiado trae la sección; **`grep -c "</content>" .claude/honesty-rules.md` → 0**.
2. **Repo adoptado con `honesty-rules.md` borrado** → nueva sesión → el hook lo restaura **con**
   los bloques nuevos y **sin** el `</content>`.
3. **Repo no adoptado** → el hook sigue siendo **no-op silencioso**.
4. **`/doctor`** con `honesty-rules.md` de versión anterior → reporta drift **por ancla de
   versión**, muestra diff, no aplica sin aprobación. Un fichero editado legítimamente por el
   consumidor **no** debe marcarse por diferencia de prosa.
5. **`/doctor`** en un repo sin el `@import` → hallazgo destacado, y sigue **sin** editar `CLAUDE.md`.
6. **`/scenario-coverage`** sobre un plan con `Fuera de alcance` no vacío → lista los huecos fuera
   de alcance **completos y marcados**, sin proponerlos como tarea.
7. **Repo consumidor real** (API con TypeORM): confirmar que existe `@.claude/honesty-rules.md` en
   su `CLAUDE.md` **antes de dar el plan por cerrado**. Sin ese eslabón nada de esto se aplica allí.
8. **`claude plugin validate .`** y barrido `grep` antes del release.
9. **Este repo se aplica su propia medicina** (criterio de cierre del plan): su
   `.claude/honesty-rules.md` tiene el ancla del release y los cuatro bloques, y `/doctor` sobre
   este repo **no reporta drift**. Es source del plugin **y** consumidor con `@import` activo; sin
   esto publicaríamos reglas que nosotros no cumplimos.

## Tasks

- [ ] `task-pipeline-opus5-realignment-01` (P1) — Disciplina de alcance, delegación y longitud + fixes de plantilla + drift por versión en `/doctor` + aviso `@import`  · depends_on: —
- [ ] `task-pipeline-opus5-realignment-02` (P1) — Hipótesis/evidencia y anti-bucle, con la defensa escrita + drift en `/doctor`  · depends_on: `task-pipeline-opus5-realignment-01`
- [ ] `task-pipeline-opus5-realignment-03` (P2) — `scenario-coverage` recibe el plan y reporta los huecos fuera de alcance marcados  · depends_on: `task-pipeline-opus5-realignment-01`
- [ ] `task-pipeline-opus5-realignment-04` (P2) — Tensar los criterios del "Salto en planes triviales"  · depends_on: —
- [ ] `task-pipeline-opus5-realignment-05` (P3) — Docs (README/website/lifecycle) + CHANGELOG + bump 0.14.0  · depends_on: `…-02`, `…-03`, `…-04`
- [ ] `task-pipeline-opus5-realignment-06` (P3) — Baseline: valor a ciegas → coste → veredicto con la regla corregida  · depends_on: —

### Detalle por tarea

**01 — Disciplina de alcance, delegación y longitud (+ canal de entrega + fixes).**
- **Fixes previos, en la misma edición**: borrar el `</content>` de `templates/honesty-rules.md:31`
  y `templates/coding-standards.md:17`; resolver el puntero colgante a
  `.claude/specs/general/coding-standards.md` (no existe: o se crea, o la cabecera deja de citarlo).
- **Carta ampliada**: la cabecera hoy expulsa activamente lo que no es veracidad. Se amplía a
  "honestidad **y disciplina de trabajo**", **dejando escrito el criterio de admisión al fichero**
  (qué entra y qué sigue siendo coding-standard) para que no acrete. El nombre del fichero **no
  cambia**: está cableado en el `@import`, en `bootstrap.sh:23,65` y en `doctor` cat. 6.
- **Tres bloques nuevos**, todos de la guía de Anthropic: disciplina de alcance; **cap
  determinista de spawn de subagentes**; **calibración de longitud de entregables escritos**.
- `templates/task.md`: sección `## Fuera de alcance`, heredada del plan. Nota en `templates/plan.md`
  y lifecycle.
- **Ancla de versión** en el fichero materializado (patrón de `doctor` cat. 5), para que el drift
  sea `versión_materializada < versión_plugin` en vez de N greps de encabezado por release.
- **`/doctor`**: detección por esa ancla, y elevar el aviso del `@import` faltante a **hallazgo
  destacado** explicando que sin él **ninguna** regla de comportamiento se aplica. Sin editar `CLAUDE.md`.

**02 — Hipótesis/evidencia + anti-bucle, con la defensa escrita.**
Sección nueva en `honesty-rules.md`: etiquetar hipótesis vs hecho confirmado; no implementar un
arreglo sobre un diagnóstico no reproducido; tope de intentos sobre el mismo síntoma → parar,
revertir y reportar; no afirmar "he revisado X" sin haberlo leído en esta sesión; causa raíz antes
que síntoma. **+ detección en `/doctor`.**

**Justificación obligatoria** (si no se sostiene, la tarea se cae): argumentar por escrito por qué
estas reglas **no** caen bajo *"self-check instructions are the same trap"* — apoyándose en que
Anthropic publica un bloque casi idéntico para Fable 5 (*"audit each claim against a tool result
from this session; only report work you can point to evidence for"*), y en que la trampa que la
guía describe es **re-verificar trabajo propio ya hecho**, mientras estas reglas prohíben **afirmar
o actuar sin evidencia**. Más el argumento de coste: el bucle que previenen cuesta órdenes de
magnitud más que la regla. Si al redactarlo el argumento no se sostiene para alguna regla concreta,
esa regla se retira.

**03 — `scenario-coverage`: contexto sin ceguera.**
- Paso 1: el material incluye **el plan**. Contemplar el modo standalone (puede no haber plan):
  entonces no hay filtro y se dice.
- Prompt del subagente: **"repórtalo completo y márcalo como fuera del alcance declarado"**, en
  sección propia. **No** "repórtalo sin escenario": pedirle que reporte de forma degradada dispara
  el mismo mecanismo de filtrado literal que la guía describe y deprimiría el reporte en sí.
  Razón de fondo: descartar en silencio mataría la dimensión 8 (*"requisito que NINGUNA tarea
  contempla"*), que es la razón de ser de la skill.
- Ajustar el Paso 5.5 de `plan-task/SKILL.md`.

**04 — Tensar el "Salto en planes triviales".**
`plan-task/SKILL.md:45-52` ya define cuándo se puede ofrecer saltar `design-review` y
`scenario-coverage`. Es la palanca de coste **ya construida** que el plan ignoraba: tensarla reduce
el gasto **hoy**, sin esperar a la tarea 06. Se revisan los criterios (hoy exigen un solo
fichero/área, sin superficie nueva, sin decisión arquitectónica). Invariantes que **no** se tocan:
el default sigue siendo ejecutar, el salto lo confirma el owner, y queda registrado en el change log.

**05 — Docs + release.**
README (explicación ampliada de `honesty-rules`, criterio de admisión al fichero, y nota de la
palanca de `effort` a nivel de sesión junto a la limitación de plataforma ya documentada),
`website/guia/pipeline.md`, `docs/guides/task-lifecycle.md`, `CHANGELOG.md` (Keep a Changelog) y
bump de `plugin.json` a **0.14.0**; coherencia de `description` con `marketplace.json`.

**06 — Baseline (read-only). Dos mitades, orden obligatorio.**

*Alcance del ranking — corregido.* Se rankean **solo `design-review` y `scenario-coverage`**.
`fact-checker` **queda fuera**: no produce entradas de `Registro de cambios del plan` por
construcción (es gate de cierre de tarea; su salida vive en `.claude/context/`), así que su
denominador sería estructuralmente cero y la regla lo condenaría automáticamente — contra un gate
declarado no-negociable en cuatro sitios del repo. Su coste sí es medible (118 entradas de `usage`
a nivel superior + 98 en subagentes) y se **reporta**, pero no entra al ranking. Si se quiere medir
su valor, la fuente son los `INCORRECTO`/`NO VERIFICABLE` reales en `.claude/context/*.md`, y eso
es trabajo de otro plan.

*Paso 0 — fijar la unidad ANTES de contar.* La cifra "23" del borrador mezclaba **tres unidades**
(entradas fechadas en unos planes, hallazgos numerados en otros). Se fija **una** unidad —
hallazgo/recomendación individual, no entrada fechada — y se **re-deriva** el total. La cifra
anterior no es reproducible y no se reutiliza.

*Mitad A — valor, a ciegas.* Clasificar cada hallazgo de los 6 planes cerrados en **tres** buckets:
**cambio material**, **cosmético**, y **recomendación correcta anulada por el owner** (verificado
que existe: `collision-free-ids`, `docs-portal-and-tracking`, `github-tracking-enrichment` #4 y #7).
El tercer bucket **no cuenta como coste de la fase** — meterlo en "cosmético" castigaría a
`design-review` por los overrides del propio owner, y es justo la fase pineada a `opus`. Todo esto
**sin haber mirado ninguna cifra de tokens**.

*Mitad B — coste.* Después: mapear **transcript → plan** como paso explícito (no existe ese mapeo
en el repo; hay que construirlo) y restringir la población a los transcripts de los 6 planes
cerrados — no los 19. **Declarado**: el agregador que trae `pipeline-usage/SKILL.md` toma **un**
transcript y emite "POR SUBAGENTE" **sin clave de fase**; el cruce fase×subagente que esta mitad
necesita **requiere un agregador propio**. Es obtenible (los subagentes sí llevan
`attributionSkill`), pero no es lo que la skill emite tal cual.

*Veredicto.* Rankear por **coste por cambio material**. Si la peor cuesta **≥3×** que la mejor →
plan de reducción para **esa** fase. Si no → se cierran como justificadas y se documenta.

*Limitaciones que el informe debe declarar con estas palabras:* el eje de valor es
**auto-reportado** (las entradas las escribió el mismo orquestador que corrió la fase), n=6; la
atribución de tokens es **best-effort** (29,7% a nivel superior, 49,0% en subagentes) y el informe
debe decir **qué porcentaje quedó sin atribuir**.

Entregable: `.claude/specs/task-pipeline/opus5-audit.md`, incluyendo los hallazgos de
`/claude-api prompt-audit` (target `claude-opus-5`) con diff propuesto **sin aplicar**.

## Registro de cambios del plan

- 2026-08-09: creado.
- 2026-08-09: `scope-guard` **descartado** (owner). Motivo: la guía de Anthropic recomienda una
  instrucción de prompt para scope creep y desaconseja gates/subagentes de verificación añadidos.
- 2026-08-09: **no** se tocan `design-review`/`scenario-coverage`/`fact-checker` en este plan (owner).
- 2026-08-09: refinado con `grilling` (7 preguntas, 7 decisiones):
  1. La detección de drift se **funde en las tareas de contenido**; no hay tarea de doctor aparte.
     Motivo: `bootstrap.sh:65` solo restaura si el fichero falta y `doctor` cat. 6 solo mira
     ausencia — sin detección publicaríamos reglas muertas para los repos ya adoptados.
  2. La medición se parte en **dos mitades con orden obligatorio** (valor a ciegas → coste).
  3. Las reglas viven en **`honesty-rules.md` con la carta ampliada**, conservando el nombre.
  4. **`effort:` por fase descartado** por imposible (la Agent tool no tiene ese parámetro).
  5. `scenario-coverage` **reporta los huecos fuera de alcance** en vez de descartarlos.
  6. `/doctor` **eleva el aviso del `@import`**; la checklist e2e comprueba el repo consumidor.
  7. Regla de decisión **ordinal con puerta relativa ≥3×**, no umbral porcentual absoluto.
- 2026-08-09: revisado con `design-review` (subagente fresco, `opus`) — **veredicto: no aguantaba**.
  2 bloqueantes y 10 hallazgos. Cambios aplicados:
  1. **[Bloqueante ①]** `fact-checker` **sale del ranking** de la tarea 06. Su denominador era
     estructuralmente cero (no produce entradas de change log), así que la regla ≥3× lo condenaba
     automáticamente — contra un gate declarado no-negociable. Se reporta su coste, no se rankea.
     La tarea 06 se **reordena al final**: nadie depende de ella y su salida alimenta un plan
     posterior; ponerla primero bloqueaba la mitigación real con la sesión más cara.
  2. **[Bloqueante ②]** La tarea 02 pasa a exigir **justificación escrita** de por qué sus reglas
     no caen bajo *"self-check instructions are the same trap"* (línea de la guía que el plan
     citaba de forma incompleta). Si el argumento no se sostiene para una regla, esa regla se retira.
  3. Se fija **una** unidad de conteo antes de contar y se **re-deriva** el total: la cifra "23"
     mezclaba tres unidades distintas y no era reproducible.
  4. Tercer bucket **"recomendación correcta anulada por el owner"**: sin él, la métrica castigaba
     a `design-review` por los overrides del propio owner.
  5. **Mapeo transcript→plan** como paso explícito y población restringida a los 6 planes; se
     declara que el cruce fase×subagente **requiere un agregador propio** (la skill no lo emite).
     Corrige una afirmación no verificada sobre lo que hace una herramienta.
  6. Se incorporan las **dos palancas baratas** que el plan ignoraba: el **cap determinista de
     spawn** (bloque publicado por Anthropic, a la tarea 01) y **tensar el "Salto en planes
     triviales"** ya existente (tarea 04 nueva) — que baja el coste hoy sin esperar a medir.
  7. Se añade el bloque **"longitud de entregables escritos"**, el más aplicable a un repo que
     produce exclusivamente Markdown.
  8. Se arreglan los bugs preexistentes del fichero que tocamos: `</content>` colgado en
     `templates/honesty-rules.md:31` y `templates/coding-standards.md:17`, y el puntero colgante a
     `.claude/specs/general/coding-standards.md` (no existe).
  9. La detección en `/doctor` usa **ancla de versión** (patrón de la cat. 5) en vez de N greps de
     encabezado por release, que degradarían a ruido o marcarían para siempre a los consumidores
     que editaron legítimamente su fichero.
  10. Se **registra explícitamente** que ampliar la carta de `honesty-rules.md` revierte una
      frontera decidida por una `design-review` anterior (*"no-duplicación es un coding-standard,
      no va aquí ni se lee cada turno"*), y se deja escrito el nuevo criterio de admisión al fichero.
  11. Objetivo 3 rebajado: `/doctor` es **pull**, entrega la capacidad, no garantiza la llegada.
  12. Se declara el **coste por turno** del plan (fichero leído cada turno, en tensión con el hook
      `caveman`) en vez de anunciar "sin coste de tokens por fase".
  13. Tarea 03: el prompt pide **"repórtalo completo y márcalo fuera de alcance"**, no "repórtalo
      sin escenario" — pedir un reporte degradado dispararía el mismo filtrado literal.
- 2026-08-09: endurecido con `scenario-coverage` (subagente QA fresco, ~45 escenarios propuestos).
  **Seis defectos de Spec corregidos**, no solo escenarios añadidos:
  1. **El ancla de versión era inimplementable y daba falso positivo en cada release.** Se
     especificaba `versión_materializada < versión_plugin`, pero ningún `SKILL.md` lee `plugin.json`
     y `doctor` no lo alcanza (solo llega a `../plan-task/templates/`); además un release que solo
     tocara `website/` habría marcado a todos los consumidores. **Corregido**: el ancla registra la
     última versión en que **cambió la plantilla**, y `doctor` compara **plantilla ↔ materializado**.
     Sale más simple y sí es implementable.
  2. **`task.md` no tenía canal de entrega**: se materializa una vez por tarea, hay decenas de
     copias sin ancla y el drift-check habría reportado N problemas por N tareas viejas.
     **Corregido**: las tareas ya materializadas son histórico y **no** se drift-checkean.
  3. **La regla ≥3× volvía a dividir por cero**: sacamos a `fact-checker` por denominador cero y
     dejamos la regla sin caso `0 cambios materiales`, plausible para `scenario-coverage`.
     **Corregido**: los tres casos degenerados se declaran **"no rankeable"**.
  4. **El cap de spawn contradecía al propio pipeline**: `honesty-rules.md` ordenaría un techo de
     subagentes mientras `/plan-task` obliga a lanzar tres fases con subagente. **Corregido**:
     exención explícita de las fases del pipeline dentro del propio bloque.
  5. **El `Fuera de alcance` entraba en el prompt de un subagente que obedece literalmente**: uno
     redactado como orden ("no reportes X") habría silenciado la dimensión 8 que la tarea protege.
     **Corregido**: el plan se pasa como **dato a contrastar**, nunca como instrucciones.
  6. **Los criterios de salto viven en CUATRO sitios**, no dos — y la copia de
     `templates/task-lifecycle.md` es la que llega a los consumidores. **Corregido** en la tarea 04.
  Además: **este repo se auto-aplica las reglas** como criterio de cierre (su `honesty-rules.md` ya
  divergía de la plantilla y su `CLAUDE.md` sí hace `@import`); entran los dos huecos transversales
  **`caveman` × reglas nuevas** (su lista de contenido preservado no incluía las etiquetas de
  hipótesis) y **opt-out deliberado del consumidor**; y se propaga la carta ampliada a los cinco
  sitios que describen el fichero como "anti-alucinación".
  **Escenarios: triage deliberado.** Se absorben los ligados a los seis defectos y los bordes
  baratos (ancla ausente, release que no toca plantilla, idempotencia de `doctor`, repo sin
  `CLAUDE.md`, `Fuera de alcance` degenerado, 0-de-n explícito, plan ilegible, denominadores
  degenerados, "no afirmar que el build pasa sin ejecutarlo"). **Se rechazan** los que exigirían
  re-descomponer las tareas por tamaño y los de dimensiones que el revisor mismo marcó N/A
  (concurrencia en artefactos Markdown de una sola rama; input adversario donde la entrada es el
  propio repo versionado). Motivo del rechazo, escrito aquí a propósito: absorber los ~45 habría
  sido la deriva de alcance que este plan existe para frenar.
- 2026-08-09: **plan arrancado** (`active`), rama `plan/task-pipeline/opus5-realignment`. Primera tarea:
  la **04** (sin `depends_on`, mejor ratio valor/coste), no la 01.
- 2026-08-09: **corrección de Spec de la tarea 04 durante su ejecución** (`grep -rn "trivial"`
  verificado). La Spec decía que los criterios de salto viven en **CUATRO** sitios; son **CINCO** y la
  tabla fallaba en dos puntos: `website/guia/pipeline.md` estaba listado pero **no enumeraba** criterios
  (solo "criterios estrictos"), y `task-pipeline/docs/flujo-del-pipeline.md:80-83` **sí los enumeraba** y
  **faltaba**. Sin corregirlo, los docs del plugin habrían quedado contradiciendo la skill tras calibrar
  — justo el fallo que el escenario "Los criterios no divergen entre copias" existe para impedir.
  `README.md:16,109` solo referencian, no enumeran → fuera del barrido. Ajustados en la tarea 04: tabla
  de Spec, `Provides`, DoD (cuatro→cinco) y dos escenarios (uno nuevo: un sitio que enumera no puede
  quedarse fuera del barrido aunque no esté en la Spec).
- 2026-08-09: **decisión de calibración (tarea 04)** — de los cuatro criterios, **dos se ensanchan y dos
  se afilan**, no los cuatro. Se ensancha "un solo fichero/área" → **"un solo eje de decisión"** (N
  ficheros valen si son la misma decisión replicada), que era el criterio que bloqueaba de facto a los
  planes de este repo, donde una decisión se propaga a 4-5 copias por convención. Se afila "no crea
  superficie/API nueva" → **`Provides` vacío en todas las tareas**, test mecánico en vez de juicio del
  propio autor. **NO se amplía el conteo de tareas** de `scenario-coverage` pese a ser el candidato
  obvio: el valor de esa pasada es la dimensión 8 (*requisito que ninguna tarea contempla*) y crece con
  el número de tareas — evidencia en este mismo plan, donde `scenario-coverage` sobre un set de tareas
  **de solo texto** detectó seis defectos de Spec. Ampliarlo habría saltado la pasada que produjo el
  hallazgo más valioso del plan.
<!-- Toda re-planificación in-place se registra aquí: qué cambió y por qué. -->
