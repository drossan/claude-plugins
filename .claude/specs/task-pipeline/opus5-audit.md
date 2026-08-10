# Baseline de coste y valor de las fases con subagente

> Producido por `task-pipeline-opus5-realignment-06` (2026-08-10). **Read-only**: ningún fichero del
> plugin se modificó al elaborarlo. Su destinatario es un **plan posterior**, no este.

## Limitaciones, antes que los números

Se declaran primero a propósito: condicionan cómo hay que leer todo lo demás.

1. **El eje de valor es auto-reportado**, sobre **n=6** planes. Las entradas del `Registro de cambios
   del plan` las escribió **el mismo orquestador que corrió la fase** que se está evaluando. No hay
   evaluador independiente.
2. **La atribución de tokens es best-effort.** En los 13 transcripts mapeados, solo el **26,7%** de las
   entradas con `usage` del hilo principal llevan `attributionSkill`: **el 73,3% del gasto de nivel
   superior queda sin atribuir**. Por eso el coste por fase se calcula **exclusivamente sobre los
   transcripts de los subagentes**, donde la fase sí es identificable con certeza (vía
   `subagents/*.meta.json` → `description`).
3. **Los datos son de `claude-opus-4-8`, no de Opus 5.** Verificado: las 42 ejecuciones de subagente
   medidas corrieron **todas** en `claude-opus-4-8`. Este informe describe el coste **histórico** del
   pipeline; **no** mide el comportamiento de Opus 5, que es lo que motivó el plan. Cualquier
   extrapolación a Opus 5 es una hipótesis, no un resultado.
4. **Las dos fases producen hallazgos de granularidad muy distinta** (ver "El sesgo estructural"). Esto
   afecta al veredicto de forma material y se detectó **a ciegas**, antes de ver ninguna cifra.

## Método: el orden es parte del resultado

**Mitad A (valor) se cerró antes de consultar ninguna cifra de coste.** La declaración de ceguera y el
cierre fechado están en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-06.md`. Hasta
cerrar A no se leyó ningún transcript ni se ejecutó ninguna agregación.

**Unidad de conteo, fijada antes de contar.** La cifra "23" del borrador original mezclaba tres unidades
y **no era reproducible**; se descartó. Definición usada:

> Un **hallazgo** es una recomendación individual atribuible a `design-review` o `scenario-coverage` que
> el change log registra **con identidad propia** (viñeta, número, o etiqueta tipo `#4`/`SC-B`/`T-G`).
> Lo que solo *detalla* un ítem ya contado no cuenta aparte.

Casos resueltos por escrito, para que ninguno quede sin clasificar:

| Caso | Destino |
|---|---|
| Aceptado **en parte** y anulado en parte | **cambio material** (la fase cambió el plan; que el owner recortara su alcance no lo anula) |
| Descarte explícito de la propia fase (*"N/A porque…"*) | **no es un hallazgo**; no entra en ningún bucket |
| Una recomendación con N riesgos de apoyo | **un** hallazgo (los riesgos son su argumentación) |
| Hallazgos de `grilling` o del owner | **fuera**: `grilling` es inline y no se rankea |

## Mitad A — valor (a ciegas)

| Fase | Hallazgos | Cambio material | Cosmético | Anulado por el owner |
|---|---:|---:|---:|---:|
| `design-review` | 37 | **26** | 2 | **9** |
| `scenario-coverage` | 112 | **111** | 1 | 0 |
| **Total** | **149** | **137** | **3** | **9** |

Tres lecturas, escritas antes de ver el coste:

- **El cosmético es del 2%** (3 de 149). Ninguna de las dos fases produce ruido de redacción. La
  pregunta no es si aportan, sino cuánto cuesta lo que aportan.
- **Los 9 anulados son todos de `design-review`.** El tercer bucket no era una hipótesis defensiva: sin
  él, la fase pineada a `opus` cargaría con 9 recomendaciones correctas que el owner decidió no aplicar.
- **El sesgo estructural.** `design-review` emite pocas piezas grandes (arquitectura, alcance,
  reversibilidad); `scenario-coverage` emite muchas pequeñas (un borde, un error, un estado). Cualquier
  métrica *por hallazgo* favorece a `scenario-coverage` **por construcción**. No se corrige con un
  factor inventado: se declara.

## Mitad B — coste

**Mapeo transcript → plan.** No existía en el repo; se construyó contando menciones del `<name-plan>` en
cada transcript y asignando al plan dominante (**≥2× el segundo**). De **21** transcripts:

| Destino | n | Cuáles |
|---|---:|---|
| Mapeados a los 6 planes cerrados | **13** | grilling ×2 · honesty ×3 · usage ×2 · collision ×3 · docs-portal ×1 · gh-enrichment ×2 |
| **Excluido por ambiguo** | 1 | `40d189f7` (usage 97 / collision 56 = 1,7×, por debajo del umbral). **No se reparte con un criterio inventado: se excluye y se declara.** |
| Sin ninguna mención de plan | 4 | `12424884`, `271cad45`, `bd2061a7`, `dca429a4` (todos ≤3 KB) |
| Fuera de población (plan **en curso**, no cerrado) | 3 | los de `opus5-realignment` |

**Transcripts sin mapear: 5 de 21.** Ningún plan cerrado quedó sin transcript, así que no hubo que
declarar "plan sin coste" ni extrapolar desde los demás.

**Agregador propio.** Como declaraba la Spec, `pipeline-usage` toma **un** transcript y emite "POR
SUBAGENTE" **sin clave de fase**; el cruce fase×subagente exige agregador propio. La clave de fase
usada es `subagents/<id>.meta.json` → `description`.

> **Existe una segunda clave de fase, con cobertura parcial.** Los `.jsonl` de subagente **sí** llevan
> `attributionSkill` en 20 de 57 ficheros (598 entradas, con valores `task-pipeline:design-review`,
> `…:scenario-coverage`, `…:fact-checker`). Una primera versión de este informe afirmaba que no
> existía — error de método, detectado por el gate de `fact-checker`. Se mantiene `description` como
> clave porque su cobertura es **completa** (57/57) frente al 35% de `attributionSkill`, pero quien
> re-mida puede cruzar ambas.

**Precios** (verificados en `claude-api` → `shared/`): Opus 4.8 = **$5 / $25 por MTok** (input/output);
caché **read ≈ 0,1×** el input y **write 1,25×** (TTL 5 min).

**Deduplicación obligatoria.** El transcript escribe **una entrada por bloque de contenido**, todas con
el **mismo `message.id`/`requestId` y el mismo `usage` acumulado**. Sumar toda entrada con `usage`
multiplica el gasto por ~3. Las cifras de abajo están **deduplicadas por `(message.id, requestId)`**,
quedándose con la observación final de cada request. (Un primer cálculo sin deduplicar daba $17,90 /
$22,29 / $39,25; lo cazó el gate de `fact-checker` y está corregido.)

| Fase | Ejecuciones | Requests | Coste ($) | Tokens totales | Output |
|---|---:|---:|---:|---:|---:|
| `design-review` | 6 | 50 | **6,47** | 2 621 079 | 105 389 |
| `scenario-coverage` | 6 | 50 | **8,62** | 2 837 218 | 174 821 |
| `fact-checker` | 30 | 140 | **13,14** | 4 620 520 | 190 309 |
| otros subagentes | 4 | 37 | 3,04 | 1 379 701 | 37 416 |

**`fact-checker` se reporta pero NO se rankea** — no produce entradas de `Registro de cambios del plan`
por construcción (es gate de cierre de tarea; su salida vive en `.claude/context/`), así que su
denominador sería **estructuralmente cero** y la regla lo condenaría automáticamente contra un gate
declarado no-negociable. Dato para el owner: **es la fase más cara en términos absolutos** ($13,14, un
42% del gasto de subagentes medido), repartida en 30 ejecuciones — muchas y baratas, no pocas y caras.
Medir su *valor* exige partir de los `INCORRECTO`/`NO VERIFICABLE` reales de `.claude/context/*.md`:
trabajo de otro plan.

## Veredicto

Regla escrita: rankear por **coste por cambio material**; si la peor cuesta **≥3×** que la mejor → plan
de reducción para esa fase.

| Métrica de coste | `design-review` | `scenario-coverage` | Ratio | Resultado |
|---|---:|---:|---:|---|
| **$ ponderado** (la usada) | 0,2489 | 0,0776 | **3,21×** | ≥3× → plan de reducción |
| Tokens totales | 100 811 | 25 561 | 3,94× | ≥3× |
| Solo output | 4 053 | 1 575 | **2,57×** | **<3× → ambas justificadas** |

**Casos degenerados: ninguno se dio.** Se comprobaron los tres —0 cambios materiales con coste >0; >0
cambios materiales con coste 0; ambos 0— y **ninguno aplica**: las dos fases tienen numerador y
denominador estrictamente positivos. No hubo ninguna división por cero ni ningún "no rankeable".

**Veredicto formal: plan de reducción para `design-review`.**

**Y por qué no hay que creérselo demasiado.** Tres razones, todas verificadas:

1. **El veredicto se invierte según la métrica de coste.** Con *solo output* —los tokens caros,
   $25/MTok— el ratio baja a **2,57×** y ambas fases quedan justificadas. La regla ≥3× se escribió sin
   fijar la métrica, y resulta que la métrica decide el resultado.
2. **Bastan DOS hallazgos más para invertirlo.** `design-review` necesitaría **>27,8** cambios
   materiales en vez de 26 para bajar de 3×. Sobre 26, y con conteo manual de prosa heterogénea, **2
   está muy dentro del error del método**: el veredicto formal se sostiene sobre un margen de menos del
   8%.
3. **El sesgo de granularidad, declarado a ciegas, apunta en la misma dirección** que el veredicto. Si
   se contaran los argumentos de apoyo de `design-review` con la granularidad con la que se cuentan los
   escenarios de `scenario-coverage`, su numerador subiría por encima de ese umbral sin que cambie nada
   real.

**Dónde se abre el plan de reducción**: **no se abre ahora**. Motivo registrado: la señal es débil
(punto 1 y 2) y, sobre todo, **los datos son de Opus 4.8** (limitación 3), mientras que la decisión que
interesa es sobre Opus 5. Abrir un plan para recortar `design-review` con esta evidencia sería actuar
sobre un diagnóstico no reproducido — exactamente lo que las reglas que este mismo plan acaba de
publicar prohíben.

**Lo que sí procede, en este orden:**

1. **Re-medir sobre Opus 5** con ≥3 planes nuevos. Esta línea base sirve de comparación.
2. Antes de tocar `design-review`, usar la palanca **ya construida y ya calibrada**: el salto en planes
   triviales (tarea 04). Es reversible y no toca la fase.
3. Si tras re-medir el ratio se sostiene ≥3× con **ambas** métricas, entonces sí: plan de reducción,
   empezando por acotar el prompt de `design-review`, no por eliminar la fase.

## Auditoría de prompts (`prompt-audit`, target `claude-opus-5`) — sin aplicar

Superficie: los 9 `SKILL.md` (**1 087 líneas**) y las plantillas de `plan-task`.

**Resultado: superficie limpia. Diff propuesto: ninguno.** La propia guía lo contempla — *"an audit
that finds nothing should change nothing… on a clean surface, report that it is clean"*.

| Grupo de anti-patrón | Hallazgos |
|---|---|
| **1a. Lenguaje de presión / hedges** | 6 coincidencias, **todas legítimas** por la keep list: `OBLIGATORIA` en las especificaciones de salida de `design-review` y `scenario-coverage` es **format-pinning** de un output sensible al formato; `IMPERATIVO` en el gate del HOW-TO es una **operación frágil con secuencia única**; *"intenta tumbar"* / *"trata de"* **describen la tarea del subagente**, no presionan al lector. |
| **Scaffolding de verificación** (lo que la guía manda **borrar**) | **0 instrucciones**. La única coincidencia es el texto que **explica la trampa** en `plan-task/SKILL.md:48`, no una instrucción de verificar. |
| 2. Ficheros de skill frágiles · 3. Descripciones de tool · 4. Config de request | Sin hallazgos: no hay descripciones de tool propias ni configuración de request en el plugin. |

**Matiz que importa para el veredicto de arriba:** el plugin no lleva scaffolding de verificación *en
el prompt* porque su verificación es **arquitectónica** — fases separadas con subagente. La guía de
Opus 5 manda borrar la primera; sobre la segunda no dice nada, y es precisamente lo que mediría el
punto 1 de "lo que sí procede".

**Ningún fichero del plugin fue modificado** por esta auditoría (verificable con `git status`).
