# Session log — task-pipeline-opus5-realignment-06

> Append-only. Baseline de valor y coste de `design-review` y `scenario-coverage`. **El orden es
> parte del método**: la mitad A (valor) se clasifica **a ciegas**, antes de consultar ninguna cifra
> de tokens.

## 2026-08-10 — Arranque

- Gate OK: `depends_on: []`; rama del plan ✓; única `active` ✓ (la 05 quedó en `completed/`).
- Proyección GitHub: **#32** → Project `In progress` + label + assignee.
- Read-only: esta tarea **no cambia comportamiento**; su entregable es un informe.

### Declaración de ceguera (mitad A)

**En el momento de abrir esta sesión no se ha consultado ninguna cifra de tokens, coste o `usage`.**
No se ha ejecutado `/pipeline-usage`, ni se ha leído ningún `.jsonl` de transcript, ni se ha hecho
`grep` de `usage`/`input_tokens`/`output_tokens` en ninguna parte. Lo único que se ha leído del repo
son ficheros `.md` de `.claude/plans|tasks`.

La mitad A se cierra **antes** de tocar nada de eso, y su cierre queda fechado más abajo. Si en algún
punto se rompiera la ceguera, lo clasificado después se marcaría **no ciego**.

## 2026-08-10 — Paso 0: la unidad de conteo, fijada ANTES de contar

La cifra **"23"** del borrador del plan mezclaba tres unidades distintas (entradas fechadas en unos
planes, hallazgos numerados en otros) y **no es reproducible**. Se descarta y no se reutiliza.

**Definición única — «hallazgo»:** *una recomendación individual, atribuible a una pasada de
`design-review` o de `scenario-coverage`, que el Registro de cambios del plan registra como tal.*

Reglas de conteo, escritas antes de mirar ningún plan:

1. **El numerador es el hallazgo, no la entrada fechada.** Una entrada de change log del tipo
   *"revisado con design-review — 2 bloqueantes y 10 hallazgos"* que después enumera los cambios
   aplicados cuenta como **tantos hallazgos como ítems enumerados**, no como uno.
2. **Un ítem enumerado = un hallazgo**, aunque toque varios ficheros.
3. **Sub-ítems anidados** bajo un ítem numerado **no** cuentan aparte: son el detalle del mismo hallazgo.
4. **Atribución**: solo cuentan los hallazgos que el change log atribuye explícitamente a
   `design-review` o a `scenario-coverage`. Los de `grilling` y los del owner **no entran** (grilling
   es inline y no está en el ranking).
5. **Caso obligatorio — «aceptado en parte y anulado en parte»**: va a **cambio material**. Motivo: la
   fase produjo un cambio real en el plan; que el owner recortara su alcance no lo convierte ni en
   cosmético ni en anulado. El bucket «anulado por el owner» se reserva para el hallazgo **anulado por
   completo**. Con esta regla **ningún hallazgo queda sin clasificar**.

**Los tres buckets:**

- **Cambio material** — cambió el plan, una tarea, su Spec o su alcance de forma sustantiva.
- **Cosmético** — redacción, orden, precisión de una cifra, coherencia de nombres; nada que altere lo
  que se va a construir.
- **Recomendación correcta anulada por el owner** — la fase acertó y el owner decidió no aplicarla.
  **No cuenta como coste de la fase**: meterlo en «cosmético» castigaría a `design-review` por los
  overrides del propio owner, y es la fase pineada a `opus`.

### Regla de granularidad, afinada al chocar con los datos (sigue siendo pre-coste)

Los change logs son heterogéneos: unos numeran (`#1`…`#9`, `R1`, `SC-A`, `T-G`), otros enumeran en
prosa. Para que el conteo sea reproducible fijo el corte **antes de contar**:

> **Cuenta como hallazgo todo ítem con identidad propia en el texto** — una viñeta, un número, una
> etiqueta (`T-A`, `#4`, `SC-B`) o un elemento nombrado dentro de una lista enumerada. **No** cuenta
> aparte lo que solo *detalla* un ítem ya contado.

Dos decisiones derivadas, declaradas:

- **Los descartes explícitos NO son hallazgos.** Cuando la fase dice *"descartado con motivo: tope 100
  sub-issues (N/A)"*, eso es su propio N/A, no una recomendación. No entra en ningún bucket.
- **Una recomendación con N riesgos de apoyo es UN hallazgo.** En `collision-free-ids`,
  *"design-review recomendó NO añadir D2 (C1/C2/C3/I1/I2/I3/M1/M2)"* es **una** recomendación anulada,
  no ocho. Ahora bien, los riesgos **quedaron registrados en el plan**, y eso sí es un cambio material
  aparte.

## 2026-08-10 — Mitad A: clasificación de valor (A CIEGAS, sin ninguna cifra de coste)

### `design-review`

| Plan | Hallazgos | Material | Cosmético | Anulado por owner |
|---|---|---|---|---|
| `grilling-and-model-routing` | 6 (`#1`–`#6`) | 3 | 0 | **3** (`#2` doctor, `#3` rename, `#4` `models:`) |
| `honesty-and-verification` | 7 | 5 | 2 | 0 |
| `usage-analytics-and-caveman` | 5 (re-scope a–e) | 5 | 0 | 0 |
| `collision-free-ids` | 2 | 1 (riesgos registrados) | 0 | **1** ("no añadir D2") |
| `docs-portal-and-tracking` | 8 | 6 (`#4`–`#8` + corrección de orden) | 0 | **2** (split; VitePress-vs-simple) |
| `github-tracking-enrichment` | 9 (`#1`–`#9`) | 6 | 0 | **3** (`#2`, `#4`, `#7`) |
| **TOTAL** | **37** | **26** | **2** | **9** |

### `scenario-coverage`

| Plan | Hallazgos | Material | Cosmético | Anulado por owner |
|---|---|---|---|---|
| `grilling-and-model-routing` | 15 | 14 | 1 (`verbatim` vs trigger NL) | 0 |
| `honesty-and-verification` | 15 | 15 | 0 | 0 |
| `usage-analytics-and-caveman` | 11 | 11 | 0 | 0 |
| `collision-free-ids` | 26 | 26 | 0 | 0 |
| `docs-portal-and-tracking` | 25 | 25 | 0 | 0 |
| `github-tracking-enrichment` | 20 | 20 | 0 | 0 |
| **TOTAL** | **112** | **111** | **1** | **0** |

### Lo que salta a la vista, dicho antes de ver un solo token

1. **La cifra "23" del borrador no se parecía a nada.** El total real con una unidad única es **149**
   hallazgos (37 + 112). Confirmado que no era reproducible; bien descartada.
2. **Las dos fases producen hallazgos de granularidad radicalmente distinta.** `design-review` emite
   pocas piezas grandes (arquitectura, alcance, reversibilidad); `scenario-coverage` emite muchas
   pequeñas (un borde, un error, un estado). **Esto sesga estructuralmente el ratio
   coste/cambio-material a favor de `scenario-coverage`**, y hay que decirlo antes de que el número
   parezca objetivo. No lo corrijo con un factor inventado: lo **declaro** como limitación.
3. **Los 9 anulados son todos de `design-review`, ninguno de `scenario-coverage`.** El tercer bucket no
   era una hipótesis: sin él, `design-review` cargaría con 9 hallazgos correctos que el owner decidió
   no aplicar — y es justo la fase pineada a `opus`.
4. **El cosmético casi no existe** (2 + 1 de 149, un 2%). Ninguna de las dos fases está produciendo
   ruido de redacción; la discusión no es "aportan o no aportan", es "cuánto cuesta lo que aportan".

**MITAD A CERRADA — 2026-08-10.** Hasta esta línea no se ha consultado ninguna cifra de tokens, coste
ni `usage`, ni se ha leído ningún transcript. Todo lo anterior sale exclusivamente de los seis
`.claude/plans/completed/task-pipeline/*.md`.

## 2026-08-10 — Mitad B: coste (tras cerrar A)

**Mapeo transcript → plan** construido con menciones del `<name-plan>` y umbral de dominancia **≥2×**
sobre el segundo. De **21** transcripts: **13 mapeados** a los 6 planes cerrados, **1 excluido por
ambiguo** (`40d189f7`: usage 97 / collision 56 = 1,7×, bajo el umbral — se excluye declarándolo en vez
de repartirlo con un criterio inventado), **4 sin ninguna mención** (todos ≤3 KB) y **3 fuera de
población** (son de este plan, que no está cerrado). **5 de 21 sin mapear.** Ningún plan cerrado se
quedó sin transcript, así que no hubo que declarar "plan sin coste" ni extrapolar.

**Agregador propio**, como anticipaba la Spec: `pipeline-usage` emite "POR SUBAGENTE" **sin clave de
fase**. La clave que sí existe es `subagents/<id>.meta.json` → `description`. El coste se calcula
**solo sobre transcripts de subagente**, donde la fase es identificable con certeza — en el hilo
principal el **73,3%** del gasto no lleva `attributionSkill`.

**Precios verificados en la fuente** (no asumidos): `model-migration.md:908` y `models.md:73` →
Opus 4.8 = **$5/$25 por MTok**; `prompt-caching.md:141` → caché read **≈0,1×**, write **1,25×** (TTL 5m).

| Fase | n | $ | tokens | output |
|---|---:|---:|---:|---:|
| `design-review` | 6 | 17,90 | 9 027 681 | 106 636 |
| `scenario-coverage` | 6 | 22,29 | 9 822 198 | 175 827 |
| `fact-checker` (reportada, **no rankeada**) | 30 | 39,25 | 15 786 076 | 192 997 |

### Hallazgo que condiciona todo el informe

**Las 42 ejecuciones de subagente medidas corrieron en `claude-opus-4-8`**, no en Opus 5. La línea base
describe el coste **histórico**; **no** mide el comportamiento del modelo que motivó el plan.

## 2026-08-10 — Veredicto y por qué no se abre el plan de reducción

Regla aplicada tal cual: coste por cambio material, puerta ≥3×.

| Métrica | DR | SC | Ratio | Resultado |
|---|---:|---:|---:|---|
| **$ ponderado** (la usada) | 0,6885 | 0,2008 | **3,43×** | ≥3× |
| Tokens totales | 347 218 | 88 488 | 3,92× | ≥3× |
| Solo output | 4 101 | 1 584 | **2,59×** | **<3×** |

**Casos degenerados: los tres comprobados, ninguno aplica.** Ambas fases tienen numerador y denominador
estrictamente positivos; cero divisiones por cero, cero "no rankeable".

**Veredicto formal: plan de reducción para `design-review`.** Y tres razones verificadas para no
tratarlo como concluyente: (1) **se invierte con la métrica** —solo-output da 2,59× y absuelve—; (2)
**bastan 4 hallazgos más** (>29,7 frente a 26) para bajar de 3×, dentro del error de un conteo manual
sobre prosa heterogénea; (3) el **sesgo de granularidad declarado a ciegas** empuja en la misma
dirección que el veredicto.

**Dónde se abre el plan de reducción — registrado: NO se abre ahora.** Motivo: la señal es débil y los
datos son de **Opus 4.8**, mientras la decisión que interesa es sobre Opus 5. Abrirlo con esta evidencia
sería **actuar sobre un diagnóstico no reproducido**, justo lo que prohíbe la regla que este mismo plan
acaba de publicar. Secuencia registrada en el informe: re-medir sobre Opus 5 (≥3 planes) → usar antes la
palanca ya calibrada (salto en planes triviales, tarea 04) → y solo si el ratio se sostiene con **ambas**
métricas, acotar el prompt de `design-review`, no eliminar la fase.

## 2026-08-10 — Auditoría de prompts

`prompt-audit` (target `claude-opus-5`) sobre los 9 `SKILL.md` (1 087 líneas) y las plantillas.
**Superficie limpia, diff propuesto: ninguno** — la propia guía contempla ese resultado (*"an audit that
finds nothing should change nothing"*). Las 6 coincidencias de lenguaje de presión son legítimas por su
keep list (format-pinning de salida, operación frágil, y verbos que **describen** la tarea del
subagente). **0 instrucciones de auto-verificación**: la única coincidencia es el texto que *explica* la
trampa. **`git status task-pipeline/` limpio**: la auditoría no modificó nada.

## 2026-08-10 — Gate `fact-checker`: un error de método REAL, corregido

**9 VERIFICADO · 3 INCORRECTO (corregidos) · 0 NO VERIFICABLE**, más un **hallazgo transversal
material** que el verificador levantó por su cuenta y que obligó a recalcular medio informe.

### El hallazgo que importa: doble conteo del `usage`

Mi agregador sumaba **toda** entrada con `message.usage`. El transcript escribe **una entrada por bloque
de contenido**, todas con el **mismo `message.id`/`requestId` y el mismo `usage` acumulado` — así que
sumarlas multiplica el gasto. Ejemplo que citó: cinco entradas consecutivas con el mismo `msg id`, todas
con `cache_creation=16307`, contadas cinco veces.

**Recalculado deduplicando por `(message.id, requestId)`** (última observación de cada request):

| Fase | Antes ($) | **Ahora ($)** | Requests reales |
|---|---:|---:|---:|
| `design-review` | 17,90 | **6,47** | 50 |
| `scenario-coverage` | 22,29 | **8,62** | 50 |
| `fact-checker` | 39,25 | **13,14** | 140 |

Las cifras absolutas estaban **infladas ~2,8×**. Los **ratios aguantan** (3,43→**3,21×**;
3,92→**3,94×**; 2,59→**2,57×**) y el **veredicto formal no cambia**. Pero un dato sí cambia, y a peor
para el veredicto: el punto de equilibrio baja de 29,7 a **27,79**, o sea **bastan ~2 cambios materiales
más** —no 4— para invertirlo. Refuerza el argumento del propio informe de que la señal es frágil.

### Los otros dos INCORRECTO

1. **`attributionSkill` SÍ existe en los `.jsonl` de subagente** — 598 entradas en 20 de 57 ficheros,
   con valores `task-pipeline:design-review` / `…:scenario-coverage` / `…:fact-checker`. Mi
   comprobación inicial no lo vio porque busqué en `*/*.jsonl` y los subagentes cuelgan de
   `*/subagents/*.jsonl`. Corregido en el informe: se mantiene `description` como clave (cobertura
   57/57 frente al 35% de `attributionSkill`) pero se **declara que existe la alternativa**.
2. **57 ficheros `agent-*.jsonl`, no 56** (subieron durante esta propia sesión). Sin efecto en el
   cálculo: los 13 mapeados aportan 46 subagentes.

**Un tercer "INCORRECTO" que no lo era del informe**: le pregunté si *todas* las ejecuciones eran
`claude-opus-4-8` y encontró 86 entradas de `claude-haiku-4-5-20251001` en el bucket **"otros"** (tres
subagentes de verificación técnica ajenos a las tres fases). La afirmación **del informe** —"las **42
ejecuciones medidas** corrieron todas en `claude-opus-4-8`"— la confirmó **exacta**. Falló mi pregunta,
más amplia que el texto. Lo dejo escrito para no apuntarme una precisión que no tuve.

**Verificó además, recomputando por su cuenta**: las tres tablas de tokens dígito a dígito, los precios
contra la fuente, los tres ratios, el punto de equilibrio, el 26,7% de cobertura de atribución, el
ratio 1,73× de `40d189f7`, que `git status --porcelain task-pipeline/` está vacío, y los seis puntos que
el informe debe declarar.
