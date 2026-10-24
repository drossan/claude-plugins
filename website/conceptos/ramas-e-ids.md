# Ramas e ids

## Ramas

- **`main` es la rama de integración** — no hay `dev`.
- Cada plan trabaja en su propia rama de feature: **`plan/<package>/<name-plan>`**.
- **Una rama = un plan**: todas las tareas del plan caen en esa rama, y hay **una sola tarea `active` por
  plan** (comparten rama).
- Los commits llevan el prefijo del id de tarea: **`<task-id>: <conventional commit>`**.

## Ids plan-scoped

El `<task-id>` es **plan-scoped**, no un contador global del package:

```
<task-id>  = <plan-id>-<nn>
<plan-id>  = <package>-<name-plan>
<nn>       = correlativo DENTRO del plan, desde 01
```

`/plan-task` asigna el `<nn>` contando el máximo existente **en el plan** (en todos los estados) + 1 —
nunca sobre el package entero.

### Por qué plan-scoped (evitar colisiones)

La clave: **el espacio de nombres del id coincide con la unidad de paralelismo**, que aquí es el **plan =
rama**. Dos planes distintos = dos espacios de id distintos → **nunca colisionan**.

Con un contador **global** (`<package>-<nnn>`), dos ramas cortadas del mismo `main` ven el mismo "último
número" y asignan el mismo `nnn`; al mergear salta un conflicto **add/add silencioso** (dos ficheros
`…-013.md` distintos que git no sabe reconciliar). Con ids plan-scoped eso desaparece, salvo el residual de
abajo.

### El residual honesto (no se previene en duro)

- **Mismo `<name-plan>` en paralelo** → misma `<plan-id>` → colisiona, pero es **1 conflicto único, evidente
  y semántico** (el fichero del plan), no la lluvia silenciosa de antes. Lo caza **`/doctor`**.
- **Dos ramas extendiendo el mismo plan** → ambas ven el mismo máximo `<nn>` y asignan el mismo → colisión
  **no** prevenida por este esquema (la prevendría un sufijo aleatorio, descartado por el owner).
  **Mitigación**: la disciplina de arriba (una rama = un plan) + detección en `/doctor`.

El cambio neto: antes, un conflicto **silencioso** al mergear; ahora, en el peor caso, **1 conflicto único y
evidente** en el fichero del plan, fácil de reconocer y resolver.

## Profundizar (opcional)

El procedimiento paso a paso para **resolver** una colisión detectada (renumerar/renombrar, actualizar
`depends_on` y enlaces, mover el session log) está en el
[README del plugin → Trabajo en equipo y colisiones de id](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md#trabajo-en-equipo-y-colisiones-de-id).
