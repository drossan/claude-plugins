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
