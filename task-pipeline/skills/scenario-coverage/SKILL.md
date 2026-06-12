---
name: scenario-coverage
description: Endurece los escenarios Gherkin de un set de tareas mediante un subagente QA fresco que busca comportamientos NO cubiertos por dimensiones (fronteras, errores, estado, concurrencia, input adversario, lo que la Spec implica pero no fija) con descarte explícito. Úsala tras descomponer un plan en tareas (Paso 5 de `/task`), o cuando el usuario quiera una revisión QA de los escenarios de una o varias tareas.
---

Cubres el hueco que **ningún gate posterior tapa**. El gate de mutation testing verifica la *calidad de los tests sobre el código que existe*, pero es ciego a los **requisitos que se olvidaron**: si un comportamiento nunca se programó, no hay mutante que lo delate. Aquí cazas esos huecos al planificar — y de paso abaratas el bucle de matar survivors al cierre, porque mejores escenarios = mejores tests de entrada.

**Meta: completitud por dimensiones, no volumen.** No se trata de meter más escenarios (eso es sobre-ingeniería: tests frágiles e irrelevantes). Se trata de recorrer un conjunto conocido de ejes y, para cada uno, tener un escenario **o** un "N/A porque…" explícito. La completitud se vuelve visible sin forzar casos que no aplican.

**Por qué un subagente fresco**: quien escribió los escenarios sufre el sesgo de *"ese caso obviamente está cubierto"*. Un QA que no los redactó no lo da por hecho. No le adelantes que los escenarios están "completos".

## Paso 1 — Reunir el material

- **Dentro de `/task`**: todas las tareas recién creadas del plan (`.claude/tasks/pending|active/<package>/*.md`) y la(s) spec(s) en `.claude/specs/<package>/`.
- **Standalone**: la(s) tarea(s) que indique el usuario; si es ambiguo, pregunta con `AskUserQuestion`.

Revisa el **set completo**, no tarea a tarea: así cazas huecos *dentro* de una tarea y huecos *entre* tareas (un comportamiento que **ninguna** tarea cubre).

## Paso 2 — Lanzar el subagente QA (Agent tool)

Lanza **un subagente fresco** con la **Agent tool** (`subagent_type: general-purpose`). Pásale rutas (que lea tareas y specs con `Read`) y permítele explorar el codebase en **read-only**. No debe editar nada.

Prompt EXACTO para el subagente (sustituye `<RUTAS_TAREAS>` y `<RUTAS_SPECS>`):

```
Eres un ingeniero de QA independiente. Lee las tareas en <RUTAS_TAREAS> (su
sección `## Scenarios (Gherkin)`) y las specs en <RUTAS_SPECS>. Explora el
codebase en read-only lo necesario. No edites nada.

Tu trabajo es encontrar COMPORTAMIENTOS QUE LOS ESCENARIOS NO CUBREN, mirando el
set completo de tareas (huecos dentro de una tarea Y huecos que ninguna tarea
cubre). Recorre estas dimensiones; para cada una, di si hay escenario, propón el
que falta, o márcala "N/A porque…":

1. Camino feliz — ¿están todos los casos de éxito principales?
2. Fronteras y clases de equivalencia — vacío, 0, 1, n, máximo, off-by-one, límites.
3. Errores y fallos — input inválido, dependencia ausente, timeout, permisos, IO.
4. Estado y ciclo de vida — transiciones, reentrada, idempotencia, orden de operaciones.
5. Concurrencia / contención — si aplica.
6. Input adversario — malformado, hostil, inesperado.
7. Spec implícita — lo que la Spec asume pero no fija explícitamente.
8. Requisito ausente — comportamiento que el producto necesita y que NINGUNA tarea
   contempla todavía (el hueco que el mutation testing no puede detectar).

NO infles: si una dimensión no aplica a una tarea (p.ej. concurrencia en una
función pura), márcala N/A con su porqué en vez de inventar escenarios.

SALIDA OBLIGATORIA: por tarea (y una sección "transversal" para huecos entre
tareas), lista los escenarios que faltan en Gherkin (Given/When/Then concretos y
verificables) con la dimensión que los motiva; y enumera las dimensiones que
descartaste con su porqué. Un "los escenarios están completos" sin recorrer las
8 dimensiones NO es salida válida.
```

## Paso 3 — Presentar y decidir

Traslada los huecos al usuario sin filtrarlos. Decidid juntos cuáles incorporar (algunos pueden ser fuera de scope → al plan, no a la tarea). Añade los escenarios aceptados a la sección `## Scenarios (Gherkin)` de la tarea correspondiente; si el hueco es un requisito que ninguna tarea cubre, puede implicar una **tarea nueva** (vuelve a la descomposición del plan).

No avances (en `/task`: al handoff TDD) hasta que los escenarios reflejen las dimensiones relevantes o su descarte justificado.
