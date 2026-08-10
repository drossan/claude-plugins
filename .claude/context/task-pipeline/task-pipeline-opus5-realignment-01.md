# Session log — task-pipeline-opus5-realignment-01

> Append-only. Disciplina de alcance/delegación/longitud en `templates/honesty-rules.md`, saneado de
> plantillas, `## Fuera de alcance` en `templates/task.md`, y entrega a repos adoptados vía `/doctor`
> con ancla de plantilla.

## 2026-08-09 — Arranque

- Gate OK: `depends_on: []`; rama del plan `plan/task-pipeline/opus5-realignment` ✓; la 04 está en
  `completed/` y no hay otra tarea `active` ✓.
- Proyección GitHub: **#33** → Project `In progress` + label `status: in-progress` + assignee.
- Stack `none`: TDD y mutation = **N/A**. Gate `fact-checker` **sí**.

### Fuente autoritativa localizada (no se inventa ni un bloque)

`claude-api` → `shared/model-migration.md`, sección *Migrating to Claude Opus 5* → *Behavioral shifts
(prompt-tunable)*. Ruta real en disco:
`/private/tmp/claude-501/bundled-skills/2.1.223/.../claude-api/shared/model-migration.md`.

| Bloque del plan | Línea de la guía | Qué publica Anthropic |
|---|---|---|
| Disciplina de alcance | **1070** | instrucción literal; la guía afirma que *"redujo los cambios de alcance a casi cero sin producir preguntas de clarificación excesivas"* (:1068) y que la revisión añade la cláusula **finish-the-whole-task** (:1072) |
| Cap de delegación | **1076-1096** | bloque `## Delegating to subagents` completo, con el techo numérico *"Never use more than 20 parallel agents unless the user explicitly requests it"* (:1090) y *"Review, verification… Verification belongs in your main agent loop"* (:1085) |
| Longitud de entregables | **1062** | instrucción literal para ficheros escritos a disco (:1060 declara que son más largos que en modelos previos) |

Los tres se **adaptan al castellano** conservando lo que carga peso (el techo de 20, la prohibición de
delegar verificación, la cláusula de terminar la tarea entera). No se copian en inglés porque el fichero
es prosa en castellano que se lee cada turno.

### Corrección de la Spec: el puntero a `coding-standards.md` NO está colgado en un consumidor

La Spec pide "resolver el puntero colgante a `.claude/specs/general/coding-standards.md` (no existe
aquí): o se crea, o la cabecera deja de citarlo". Verificado: **`/task-init` SÍ lo materializa**
(`skills/task-init/SKILL.md:67-69`, crea `.claude/specs/general/` y escribe el fichero si no existe).
Luego el puntero **es correcto para un repo bootstrapeado con `/task-init`**; lo que está mal es **este
repo**, que lo cita sin tenerlo (`.claude/specs/` solo contiene `task-pipeline/`).

**Decisión**: (a) **no** se borra la cita de la plantilla —sería romper un puntero válido—; (b) se
**matiza** que el fichero es *user-owned* y puede no existir (es la verdad: `bootstrap.sh` no lo restaura
y `doctor` no lo vigila, `doctor/SKILL.md:76-78,196`); (c) se **materializa en este repo**, que además es
consumidor y debe aplicarse su propia medicina (criterio 9 de la checklist e2e del plan).

## 2026-08-09 — Diseño del ancla de plantilla

Formato, en la **primera línea** del fichero (viaja en la copia sin esfuerzo):

```
<!-- task-pipeline template-version: 0.14.0 — última versión en que cambió esta plantilla; /doctor la compara con la del plugin -->
```

Registra **la última versión en que cambió la plantilla**, no la del plugin. `/doctor` compara
**plantilla ↔ materializado**, ambos a su alcance (`../plan-task/templates/`). **No se usa
`plugin.json`**: verificado que `doctor` no lo alcanza. Consecuencia buscada: un release que no toque
este fichero **no** marca a ningún consumidor.

**Comprobado que es mecánicamente extraíble** (si no, la instrucción sería inimplementable). Con
`grep -m1 -o 'template-version: [0-9][0-9.]*'` sobre cuatro casos simulados:

| Caso | Ancla leída | Veredicto |
|---|---|---|
| consumidor en 0.13.0 | `0.13.0` | DRIFT (0.13.0 < 0.14.0) |
| consumidor en 0.14.0 | `0.14.0` | sin drift |
| fichero sin línea de ancla | *(vacía)* | DRIFT — anterior al ancla, **no** se salta |
| plantilla ilegible/ausente | *(vacía)* | **sin veredicto** (no se inventa drift) |

## 2026-08-09 — Verificación de los escenarios

**Ejecutados de verdad** (hook Bash, tres estados de repo, `bash -n` + corrida real):

| Escenario | Resultado |
|---|---|
| El hook restaura la versión saneada | ✅ restaura con los 3 bloques, `</content>` = 0, ancla presente, **no** crea `CLAUDE.md` |
| Un repo ajeno sigue intacto | ✅ `exit 0`, output vacío, 0 ficheros creados |
| (extra) repo adoptado sano, 2ª pasada | ✅ silencio total |

**Verificados por inspección/`grep`** (`/task-init` y `/doctor` son `SKILL.md` = instrucciones, no código
ejecutable; además la instalación cacheada del plugin es la **0.13.0**, así que correr `/doctor` ahora
ejercitaría la skill vieja, no la editada — se declara como límite, no se maquilla):

| Escenario | Evidencia |
|---|---|
| Repo nuevo recibe la plantilla saneada | plantilla sin `</content>`; `## Alcance del encargo`, `## Delegación en subagentes`, `## Longitud de lo que escribes a disco` presentes; cabecera con criterio de admisión. El `cp` del hook usa el **mismo** fichero que `/task-init` |
| El cap no bloquea las fases del pipeline | exención explícita en `templates/honesty-rules.md:56-59` |
| La longitud no canibaliza secciones obligatorias | `:66-68` lo prohíbe nombrando `plan.md`, `task.md`+Gherkin, DoD y session log |
| Outline de herencia de `Fuera de alcance` (3 filas) | reglas 1-3 del comentario de `templates/task.md` + Paso 5 de `plan-task/SKILL.md` |
| Repo adoptado detecta fichero desactualizado | `doctor` 6b: reporta **nombrando ambas versiones** |
| Release que no toca la plantilla no genera drift | `doctor` 6b: "anclas iguales → no hay drift, aunque la versión del plugin sea posterior" |
| Fichero anterior al ancla | `doctor` 6b: ancla ausente = anterior, **se reporta** |
| No se puede determinar el ancla de la plantilla | `doctor` 6b: *"no he podido determinar la versión de la plantilla"*, sin veredicto |
| Personalizado + desactualizado | `doctor` 6b: sin sobrescritura mecánica, lista bloques que faltan (regla 4) |
| 2ª pasada de doctor tras el fix | Fase 2: el ancla viaja en la copia → no reaparece; + sección Idempotencia |
| Tareas materializadas no generan ruido | `doctor` 6b: "Alcance del drift-check: solo `honesty-rules.md`" |
| `@import` ausente = hallazgo destacado | `doctor` 6c: destacado + *"NINGUNA regla de comportamiento se aplica"* |
| Repo adoptado sin `CLAUDE.md` | `doctor` 6c: mismo hallazgo, **no lo crea** |
| Basura en fichero user-owned | `doctor` cat. 6, párrafo final: informa `</content>` en `coding-standards.md`, **no auto-edita** |

## 2026-08-09 — Fuera de alcance respetado (dogfooding de la propia regla)

Encontrados **tres `</content>` reales** más, en session logs históricos
(`.claude/context/task-pipeline/task-pipeline-006.md:89`, `-007.md:93`, `-008.md:74`). **No se tocan**:
el encargo son las dos plantillas, `.claude/context/` es append-only y no se entrega a ningún consumidor.
Queda como follow-up para que decida el owner — que es exactamente lo que ordena el bloque de alcance
que esta tarea instala.

## 2026-08-09 — Gate `fact-checker` (subagente fresco `general-purpose`, inherit)

**12 VERIFICADO · 0 INCORRECTO · 0 NO VERIFICABLE.** El verificador coteja frase a frase el castellano
contra la fuente inglesa y concluye que **ninguna afirmación del texto adaptado carece de respaldo**;
además ejecutó él mismo `bash -n` y las dos corridas del hook en `/tmp`.

**Dos añadidos que NO están en la fuente inglesa** (los señaló el verificador; se registran aquí porque
uno tiene fondo):

1. **La exención de los gates del pipeline (`:56-59`) RELAJA la regla publicada.** La guía dice, sin
   excepciones, *"Review, verification, or to double check your work. Verification belongs in your main
   agent loop"* (`model-migration.md:1085`). Nuestro bloque exime a `design-review`,
   `scenario-coverage` y `fact-checker`. **Es deliberado y lo exige la Spec de esta tarea**: sin esa
   línea estaríamos enviando a cada repo consumidor una regla que **contradice a `/plan-task`**, que
   obliga a lanzar esas tres fases. Queda escrito que es **una decisión de este repo, no de Anthropic**,
   y que la tensión es real: la tarea **06** del plan es precisamente la que medirá si esas tres fases
   se justifican. Si su veredicto es que no, esta exención es lo primero que hay que revisar.
2. **"Esto no autoriza a eliminar secciones obligatorias" (`:66-68`)** — guarda añadida, no contradice la
   fuente; la exige el escenario "La calibración de longitud no canibaliza secciones obligatorias".

## 2026-08-09 — Cierre de la tarea

### Resumen
`templates/honesty-rules.md` pasa de 31 líneas de disciplina anti-alucinación a un fichero con **carta
ampliada** (honestidad **y** disciplina de trabajo) + **criterio de admisión escrito** + **ancla de
plantilla** + **tres bloques nuevos** adaptados de la guía de migración a Opus 5 (alcance del encargo,
cap de delegación con la exención del pipeline, longitud de los entregables escritos). Saneadas las dos
plantillas (`</content>`). `templates/task.md` gana `## Fuera de alcance` con su regla de herencia,
cableada en el Paso 5 de `/plan-task` y anotada en las otras tres superficies. `/doctor` gana el **canal
de entrega**: drift por comparación de anclas y el `@import` ausente como hallazgo destacado.

### Decisiones técnicas + porqué
- **Ancla = versión de la plantilla, no del plugin.** Comparación plantilla↔materializado, ambos al
  alcance de `doctor`. Un release que no toque el fichero no marca a nadie. Verificado extraíble.
- **El puntero a `coding-standards.md` no se borra**: `/task-init` sí materializa ese fichero, así que
  el puntero es válido en un consumidor. Se matiza que es user-owned y se materializa en este repo.
- **La carta se amplía revirtiendo una frontera anterior.** Una `design-review` previa decidió que
  "no-duplicación es un coding-standard, no va aquí ni se lee cada turno". Sigue siendo cierto — por eso
  el criterio de admisión se **escribe** en la cabecera con un test operativo: *si la regla se comprueba
  leyendo un diff, es coding-standard; si se comprueba mirando cómo se comportó el agente, va aquí*. Sin
  ese test, el fichero acretaría.
- **Coste declarado**: este fichero se lee **cada turno** en cada repo adoptado. Pasa de 31 a 78 líneas.
  Es el trade que el plan aceptó explícitamente, no coste cero.

### Verificación corrida + resultado
- Hook ejecutado en 3 estados (adoptado sin fichero / no adoptado / adoptado sano) + `bash -n`: ✅.
- Ancla: 4 casos simulados (vieja / igual / ausente / plantilla ilegible) → los 4 resuelven bien.
- 16 escenarios Gherkin trazados (2 ejecutados, 14 por inspección — `/task-init` y `/doctor` son
  instrucciones, no código).
- `grep -c "</content>"` en las dos plantillas → **0**.
- `fact-checker`: **12 VERIFICADO / 0 INCORRECTO / 0 NO VERIFICABLE**, incluido el cotejo frase a frase
  contra la fuente inglesa.
- TDD y mutation: **N/A** (`stack: none`).

### Límite honesto declarado
La instalación cacheada del plugin es la **0.13.0**: correr `/doctor` o `/task-init` ahora ejercitaría
las skills **viejas**, no las editadas. Por eso esos escenarios se verifican por inspección del `SKILL.md`
y no "ejecutando la skill". Se ejercitarán de verdad tras el release de la tarea 05.

### Docs actualizadas
- `templates/honesty-rules.md`, `templates/coding-standards.md`, `templates/task.md`, `templates/plan.md`,
  `templates/task-lifecycle.md`, `templates/README.md`.
- `skills/doctor/SKILL.md` (cat. 6 completa + Fase 2 + "Qué NO hace").
- `skills/task-init/SKILL.md` (descripción de la carta + copiar el ancla tal cual).
- `skills/plan-task/SKILL.md` (Paso 5: herencia de `Fuera de alcance`).
- `docs/guides/task-lifecycle.md` (plantilla de tarea).
- Materializados en este repo: `.claude/honesty-rules.md`, `.claude/specs/general/coding-standards.md`.

### Tiempo real
~1,5h (estimate 3h).

### Follow-ups
- **Tarea 05 (release)**: si el release NO acaba siendo 0.14.0, hay que **actualizar el ancla** de
  `templates/honesty-rules.md` (hoy apunta a una versión sin publicar; `plugin.json` sigue en 0.13.0).
  Y el README del plugin (`:239`) + `website/` deben recoger la carta ampliada.
- **Tarea 02**: añade su sección sobre esta base; debe **subir el ancla** si toca la plantilla, y revisar
  la lista de contenido preservado del hook `caveman` para las etiquetas de hipótesis.
- **Tres `</content>` históricos** en `.claude/context/task-pipeline/task-pipeline-006/007/008.md`:
  fuera del encargo, decisión del owner.
- **Tensión registrada**: la exención del cap contradice la regla publicada por Anthropic. Revisar si la
  tarea 06 concluye que las fases con subagente no se justifican.
