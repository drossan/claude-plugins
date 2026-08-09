# Session log — task-pipeline-opus5-realignment-04

> Append-only. Tensar/calibrar los criterios del "Salto en planes triviales" (`design-review` /
> `scenario-coverage`) y dejarlos coherentes en todas sus copias.

## 2026-08-09 — Arranque

- **Plan arrancado**: `opus5-realignment` → `.claude/plans/active/task-pipeline/`, `status: active`.
  Rama `plan/task-pipeline/opus5-realignment` cortada desde `main` (local ya al día con `origin/main`;
  `git pull` falló por falta de acceso al remoto en este entorno — conocido, no bloquea).
- **Proyección GitHub** (`features.github-tracking: enabled`): padre **#27** → Project Status
  `In progress` (verificado). Tarea **#30** → Project `In progress` + label `status: in-progress` +
  assignee `danielrosse` (verificado).
- **Gate OK**: `depends_on: []` (sin bloqueos); rama del plan ✓; única tarea `active` del plan ✓.
- **Stack `none`**: TDD y gate de mutation = **N/A**. Gherkin = criterios de aceptación verificables por
  inspección / `grep`. Gate de `fact-checker` **sí** aplica.

### Corrección de Spec detectada en el arranque (verificada por `grep -rn "trivial" --include=*.md`)

La Spec afirma que los criterios viven en **CUATRO** sitios. Verificado: el **número era correcto; la
membresía, no** — falla en dos puntos. (Corrección posterior del gate `fact-checker`, ver más abajo: en
el arranque enuncié esto como "son cinco los que enumeran", y era inexacto. Antes del cambio enumeraban
**cuatro** ficheros, pero **no los cuatro de la tabla**.)

| Sitio | Realidad |
|---|---|
| `task-pipeline/skills/plan-task/SKILL.md:45-54` | fuente canónica, **enumera** ✓ (en la tabla) |
| `task-pipeline/skills/plan-task/templates/task-lifecycle.md:229-231` | **enumera** abreviado ✓ (en la tabla) |
| `docs/guides/task-lifecycle.md:222-224` | **enumera** abreviado ✓ (en la tabla) |
| `website/guia/pipeline.md:21-22` | listado en la tabla pero **NO enumera**: solo "criterios estrictos" |
| `task-pipeline/docs/flujo-del-pipeline.md:80-83` | **enumera** ("un solo fichero, sin API pública nueva, sin decisión arquitectónica") y **NO está en la tabla** |

Consecuencia: calibrar sin tocar `flujo-del-pipeline.md` dejaría los **docs del plugin contradiciendo la
skill** — justo lo que el escenario "Los criterios no divergen entre copias" existe para impedir. Se
incorpora como quinto sitio. `task-pipeline/README.md:16,109` solo **referencian** ("criterios estrictos +
confirmación + log"), no enumeran → no divergen y no se tocan. Las menciones del `CHANGELOG.md`
(:300, :320-322, :334) son **histórico narrativo** → allowlist de `CLAUDE.md`, no se tocan.

### Plan de pasos

1. Calibrar el bloque canónico en `plan-task/SKILL.md` (4 criterios, cada uno con **frontera resuelta por
   ejemplo**) + los 7 invariantes + el porqué citando el comportamiento de Opus 5.
2. Propagar **una única frase abreviada idéntica** a los otros cuatro sitios (greppable literal).
3. Verificar los 12 escenarios Gherkin por inspección/`grep`.
4. Gate `fact-checker` → cierre (histórico, task → `completed/`, tick en el plan, proyección a #30).

## 2026-08-09 — Calibración: qué se ensancha y qué NO

De los cuatro criterios, **dos se ensanchan y dos se afilan**. El plan pedía "aplicable a más planes
genuinamente pequeños **sin volverse un agujero**"; ensanchar los cuatro habría sido el agujero.

| Criterio | Antes | Ahora | Efecto |
|---|---|---|---|
| 1 | "toca un solo fichero/área" | **un solo eje de decisión** (N ficheros valen si son la *misma* decisión replicada; son dos ejes si podrían resolverse distinto) | **ensancha** |
| 2 | "no crea superficie/API pública nueva (nada que iría en `Provides`)" | **`Provides` vacío en todas las tareas** — test mecánico | **afila** |
| 3 | "no hay decisión arquitectónica ni nada transversal" | igual, + frontera por ejemplo | afila (aclara) |
| 4 | "1 tarea sin caminos de error/borde reales" | **igual, con el conteo declarado NO ampliable** + frontera por ejemplo | afila |

**Por qué el 1 era el que bloqueaba de facto.** "Un solo fichero" es inaplicable en este repo por
construcción: la convención obliga a propagar una decisión a 4-5 copias. El criterio prohibía el salto
exactamente en la clase de plan para la que se escribió. Contar decisiones en vez de ficheros lo arregla
sin abrir nada: el discriminador ("¿podrían resolverse distinto?") es una pregunta contestable, no un
adjetivo.

**Por qué el 2 se afila en vez de ensancharse.** Mi primer borrador decía "un contrato consumible cuenta;
la prosa, no" — y eso deja que **el autor decida si su propio `Provides` cuenta**, que es el agujero que
el criterio existe para tapar. Además contradecía el escenario `un fichero pero declara Provides → no se
ofrece`. Sustituido por un test mecánico: `Provides` distinto de `—` en cualquier tarea → no se ofrece.
Consecuencia honesta: **esta misma tarea declara `Provides`, así que su plan no habría calificado**.

**Por qué el 4 NO se amplía, siendo el candidato obvio.** El valor de `scenario-coverage` es la dimensión
8 (*requisito que ninguna tarea contempla*) y crece con el número de tareas. Evidencia dentro de este
mismo plan: `scenario-coverage` corrió sobre un set de tareas **de solo texto** y encontró **seis
defectos de Spec**, no escenarios sueltos. Ampliar el conteo habría saltado justo la pasada que produjo
el hallazgo más valioso del plan. El bloque lo deja escrito para que nadie lo "ensanche" luego por
parecer inconsistente con el criterio 1.

**Sobre el porqué de Opus 5**: el texto cita lo que la guía de migración **documenta** (delega más;
las instrucciones de verificar provocan sobre-verificación) y declara explícitamente que el rendimiento
relativo de estas dos pasadas **no está medido** — eso lo mide la tarea 06. Sin esa frase, esta tarea
estaría pre-juzgando el veredicto de la 06.

## 2026-08-09 — Verificación de los escenarios Gherkin (criterios de aceptación)

Los 13 escenarios (11 originales + 2 añadidos), trazados contra `plan-task/SKILL.md:45-63`:

| Escenario | Resultado |
|---|---|
| Outline frontera: 1 fichero / sin `Provides` / sin arquitectura / 1 tarea → se ofrece | ✅ los 4 criterios en verde |
| Outline: un fichero pero declara `Provides` → no se ofrece | ✅ criterio 2 mecánico (`Provides` ≠ `—`) |
| Outline: 2 tareas con caminos de error → no para `scenario-coverage` | ✅ criterio 4, columna "NO se ofrece" |
| Outline: 2 ficheros de la misma área, sin superficie nueva → *fijado por ejemplo* | ✅ **resuelto**: criterio 1, ejemplo "4 ficheros, una decisión" vs "clave + lector = 2 decisiones" |
| Owner acepta el salto | ✅ oferta con default = ejecutar + entrada en Plan change log |
| Owner rechaza el salto | ✅ el registro solo existe cuando hay salto |
| Plan no trivial no admite ni la oferta | ✅ "si tu caso no encaja, no lo estires — no lo ofreces" |
| El orquestador no puede saltar por su cuenta | ✅ bullet 1 ("nunca tú en silencio") |
| Aceptar un salto no arrastra el otro | ✅ "Las dos decisiones son independientes" |
| Sesión sin canal de pregunta | ✅ "Sin canal para preguntar → ejecutas la pasada y no registras ningún salto" |
| Un plan trivial deja de serlo | ✅ "La trivialidad caduca" + registro de invalidación |
| Los criterios no divergen entre copias | ✅ `grep` normalizado: frase canónica 4/4, `1 tarea sin caminos de error` 5/5 |
| (nuevo) Un sitio que enumera no queda fuera del barrido | ✅ `flujo-del-pipeline.md` incorporado + Spec corregida |
| Outline checkpoints humanos intactos | ✅ `SKILL.md:6,43,178` sin tocar (`git diff` no los roza) |

## 2026-08-09 — Gate `fact-checker` (subagente fresco `general-purpose`, inherit)

`models.fact-checker` comentado → **inherit**, sin `model`. Dos pasadas:

- **Pasada 1 — 9 VERIFICADO, 1 INCORRECTO.** El INCORRECTO tumbó mi enunciado del arranque: dije "son
  **cinco** los que enumeran" cuando antes del cambio enumeraban **cuatro** — el número de la Spec era
  correcto y lo que fallaba era **la membresía** (listaba `website/`, que no enumeraba; omitía
  `flujo-del-pipeline.md`, que sí). **Bloqueó el cierre.** Corregido en los tres ficheros de bookkeeping.
- **Pasada 2 (re-verificación de la afirmación corregida) — VERIFICADO** en sus cuatro partes, más
  confirmación de que ninguno de los tres ficheros sigue afirmando el enunciado viejo.
- **Resultado del gate: 10 VERIFICADO · 0 INCORRECTO · 0 NO VERIFICABLE.**
- Observación menor del verificador, **aplicada**: "copias" se usaba con dos significados. Fijado:
  **sitio** = los 5 (fuente incluida), **copia** = las 4 no-fuente.

## 2026-08-09 — Cierre de la tarea

### Resumen
Calibrados los criterios del "Salto en planes triviales" en `plan-task/SKILL.md`: de cuatro bullets con
adjetivos a una **tabla de 4 criterios, cada uno con su frontera resuelta por ejemplo** (columna "se
puede ofrecer" / "NO se ofrece"), más los **siete invariantes** (tres de ellos —decisiones
independientes, sin canal de pregunta, la trivialidad caduca— **no estaban** en el texto anterior) y el
porqué anclado a lo que la guía de Opus 5 documenta. Declarada una **frase canónica literal** y
propagada a las cuatro copias, lo que hace la coherencia greppable en vez de comparable a ojo.

### Decisiones técnicas + porqué
- **Dos criterios se ensanchan, dos se afilan** (tabla arriba). Ensanchar los cuatro habría convertido
  el salto en el agujero que el plan quiere evitar.
- **El criterio 4 no amplía el conteo de tareas**, con la razón escrita en el propio bloque y evidencia
  de este mismo plan.
- **`Provides` vacío como test mecánico** en vez de "prosa vs contrato": quien escribe el `Provides` no
  puede ser quien decide si cuenta.
- **Frase canónica única** en vez de repetir la tabla en cada copia: menos superficie de divergencia y
  verificable con un `grep` normalizado.
- **`flujo-del-pipeline.md` entra al alcance** aunque la Spec no lo listara: enumeraba los criterios
  viejos y habría dejado los docs del plugin contradiciendo la skill.
- **No se toca `README.md`**: solo referencia la regla, no la enumera → no diverge.

### Verificación corrida + resultado
- 13 escenarios Gherkin trazados uno a uno (tabla arriba) — todos ✅.
- `grep` normalizado (`python3`, colapsando espacios/`>`/guiones): frase canónica en **4/4** copias;
  `1 tarea sin caminos de error` en **5/5** sitios.
- Criterios viejos vivos: **0** fuera de `CHANGELOG.md` (histórico) y `.claude/` (histórico).
- Barrido `grep` reforzado de ids muertos (`grill-me`, `skills/task/`, `/task` como comando): todos los
  hits en la **allowlist legítima** de `CLAUDE.md` (atribución Matt Pocock, CHANGELOG narrando renames,
  `doctor` nombrando los patrones que detecta, `CLAUDE.md` describiendo el propio barrido).
- `pnpm docs:build` en `website/`: **build complete**, exit 0 (VitePress 1.6.4).
- `fact-checker`: **10 VERIFICADO / 0 INCORRECTO / 0 NO VERIFICABLE** (tras corregir uno que bloqueó).
- TDD y gate de mutation: **N/A** (`stack.test-runner: none`, `mutation-tool: none`).

### Docs actualizadas
- `task-pipeline/skills/plan-task/SKILL.md` — fuente canónica (tabla + invariantes + frase canónica).
- `task-pipeline/skills/plan-task/templates/task-lifecycle.md` — semilla de los repos consumidores.
- `docs/guides/task-lifecycle.md` — copia materializada de este repo.
- `task-pipeline/docs/flujo-del-pipeline.md` — docs del plugin (sitio omitido por la Spec).
- `website/guia/pipeline.md` — portal; pasa de referenciar a enumerar.

### Ficheros tocados
- Los cinco de arriba.
- (bookkeeping) plan → `active/` + Registro de cambios; task `.md` → `completed/`; este session log.

### Tiempo real
~1h (estimate 1h).

### Follow-ups
- **Tarea 05 (docs/release)**: el `CHANGELOG.md` de 0.14.0 debe narrar la calibración **y** que la
  coherencia ahora se verifica por frase canónica literal. El README (`:16`, `:109`) sigue referenciando
  sin enumerar — decisión consciente, no drift; si la 05 quiere enumerar allí, se convierte en un **sexto
  sitio** a mantener.
- **`/doctor`**: los criterios viejos ("un fichero/área") pueden seguir vivos en el
  `docs/guides/task-lifecycle.md` de repos **ya adoptados**. Hoy `doctor` no lo detecta. Encaja con el
  ancla de versión de la **tarea 01** — la frase canónica literal es un patrón `grep` listo para usarse.
- **Convención de commits rota en esta rama**: `9a54f58`, `86f9eb0`, `191e7fe` y `a9129e5` se crearon
  fuera de esta sesión y **no** llevan el prefijo `<task-id>:` que exige el lifecycle.
