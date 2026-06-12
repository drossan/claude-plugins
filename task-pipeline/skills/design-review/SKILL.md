---
name: design-review
description: Revisión holística adversaria de un plan/diseño mediante un subagente fresco que intenta TUMBAR el conjunto (coherencia, tamaño correcto, mantenibilidad, escalabilidad real, reversibilidad) antes de descomponerlo en tareas. Úsala tras cerrar `grill-me`, o cuando el usuario quiera una review de diseño "paso atrás" sobre cualquier plan ya decidido.
---

Cierras el zoom-out que `grill-me` no hace. `grill-me` baja **rama por rama** resolviendo cada decisión local; aquí subes y miras el **plan COMO UN TODO**: ¿las piezas encajan?, ¿es del tamaño correcto?, ¿sobrevive al tiempo?

**Por qué un subagente y no tú**: la complacencia nace de la presión social acumulada en la conversación y del sesgo de confirmación sobre tu propio plan. Si revisas tú, dirás "todo idóneo". Por eso esta review **la corre un agente fresco sin rapport**, al que no le cuentas que el plan es tuyo ni que al usuario le gusta. Esa es toda la garantía del mecanismo: no la diluyas haciéndola tú.

## Paso 1 — Reunir el material (sin sesgar)

Identifica qué revisar:

- **Dentro de `/task`**: el plan recién refinado en `.claude/plans/pending|active/<package>/<name-plan>.md` y su **Plan change log**.
- **Standalone**: el plan/diseño que indique el usuario; si es ambiguo, pregunta con `AskUserQuestion`.

Localiza también las specs/HOW-TO relevantes (`.claude/specs/<package>/`) para que el revisor pueda contrastar contra el problema real.

## Paso 2 — Lanzar el subagente adversario (Agent tool)

Lanza **un subagente fresco** con la **Agent tool** (`subagent_type: general-purpose`). Pásale **rutas, no opiniones**: que lea el plan, el change log y las specs con `Read`, y que pueda explorar el codebase en **read-only**. **No** debe editar nada ni se le adelanta el veredicto deseado.

Prompt EXACTO para el subagente (sustituye `<RUTA_PLAN>` y `<RUTAS_SPECS>`):

```
Eres un revisor de diseño independiente. Lee el plan en <RUTA_PLAN>, su Plan
change log y las specs en <RUTAS_SPECS>. Explora el codebase en read-only lo
necesario. No edites nada.

Tu trabajo es DEFENDER EL CASO EN CONTRA de este diseño antes de que se apruebe.
Míralo COMO UN TODO, no decisión por decisión. Para cada eje no afirmes que
cumple: demuéstralo con evidencia del plan/código, o señala dónde falla.

1. Coherencia — ¿las decisiones encajan entre sí o hay tensiones/contradicciones?
2. Tamaño correcto — ¿es lo más simple que resuelve el problema REAL de hoy?
   Señala tanto lo infra-construido como lo SOBRE-construido (abstracciones o
   "escalabilidad" que nadie ha pedido todavía).
3. Mantenibilidad concreta — cuando cambie X en 6 meses, ¿qué se rompe y quién
   lo paga? Nombra los puntos frágiles; no digas "es mantenible".
4. Escalabilidad real — ¿qué crecimiento es plausible de verdad y qué se está
   resolviendo "por si acaso"? Cuestiona lo segundo.
5. Reversibilidad — ¿qué decisiones son caras de deshacer? Esas merecen más
   escrutinio que las baratas.

SALIDA OBLIGATORIA, una de dos:
 (a) Lista concreta de cambios recomendados, cada uno con su porqué y el eje que
     lo motiva, o
 (b) si el plan aguanta: enumera QUÉ intentaste romper en cada eje y por qué
     resiste. Un "me parece bien" sin mostrar qué revisaste NO es salida válida.
```

## Paso 3 — Presentar hallazgos sin filtrar hacia el sí

Traslada al usuario los hallazgos del subagente **tal cual**, sin suavizarlos para defender el plan. Si discrepas de algún hallazgo, dilo con argumento — pero no lo entierres.

## Paso 4 — Decidir e iterar

Con el usuario, decide qué cambios aplicar. Registra cada uno en el **Plan change log** del plan. Si los cambios alteran el **scope o el enfoque de forma material**, re-preséntalos para aprobación (misma regla que el re-plan). Si el plan necesita otra vuelta, repite desde el Paso 2.

No avances (en `/task`: a descomponer en tareas) hasta que el plan haya **sobrevivido** a la review o se haya ajustado en consecuencia.
