# 0001. Modelos por defecto sostenibles: Sonnet + `design-review` en Opus, sin escalado automático

- **Estado**: accepted
- **Fecha**: 2026-08-18
- **Decisores**: owner del repo (Daniel), refinado con `grilling` + `design-review` (subagente Opus).

## Contexto y planteamiento del problema

El pipeline lanza varias pasadas de subagente por plan (design-review, scenario-coverage, fact-checker,
sdd-lint), cada una re-leyendo contexto. En Opus, el coste por plan es **insostenible**. La Guía de Modelos
del owner proponía Opus en casi todas las fases críticas. ¿Qué perfil de modelos recomienda el plugin por
defecto sin dispararse el coste ni degradar las fases donde el modelo fuerte pesa de verdad?

## Decision drivers

- **Coste/sostenibilidad**: el modelo es la palanca dominante del gasto por plan.
- **Calidad donde importa**: `design-review` es la revisión adversaria holística; corre 1×/plan y es donde
  el modelo fuerte más se nota.
- **No imponer coste al consumidor**: el template no debe forzar un modelo (invariante).
- **Honestidad**: evitar mecanismos de "auto-detección de complejidad" poco fiables (el modelo no sabe lo
  que no sabe; el propio pipeline calibra "trivial/complejo" por ejemplos, no por juicio del modelo).

## Opciones consideradas

- **Opción A** — Todo Opus (la Guía tal cual).
- **Opción B** — Todo Sonnet + un **hint de escalado automático** a Opus en `design-review`.
- **Opción C** — `design-review: opus` + `scenario-coverage`/`fact-checker`/`sdd-lint: sonnet`, **sin**
  escalado automático (el usuario sube a Opus a mano cuando lo necesita).

## Resultado de la decisión

Elegida: **Opción C**, porque captura casi todo el ahorro (3 de 4 fases en Sonnet, incluidas las pasadas
repetidas/de cierre) sin degradar la revisión de más valor, y **elimina** el hint de escalado (Opción B),
cuyo disparador correría en Sonnet y sería el "análisis automático poco fiable" que el resto del pipeline
evita a propósito. El perfil es **recomendación comentada** en el template (no se impone); este repo lo
dogfoodea activo.

### Confirmación

- El template trae `models:` comentado con `design-review: opus` + resto `sonnet`.
- `grep` sin conteos contradictorios; una fila de la tabla de recomendación indica "planes complejos →
  `design-review: opus` (o sesión en Opus)".
- No existe ninguna maquinaria de auto-escalado en `/plan-task`.

## Consecuencias

- **Buenas**: coste por plan mucho menor por defecto; calidad preservada en `design-review`; sin feature
  frágil de auto-análisis; invariante "el template no impone coste" intacta.
- **Malas / coste**: abarata el **precio por token**, no elimina las **re-lecturas de contexto** (dolor
  resuelto parcialmente; la palanca `effort` de sesión queda como follow-up). Un plan complejo requiere que
  el usuario suba `design-review`/sesión a Opus manualmente.

## Pros y contras de las opciones

- **A (todo Opus)**: 👍 máxima calidad · 👎 coste insostenible; impone coste al consumidor.
- **B (Sonnet + hint)**: 👍 barato y "auto" · 👎 el disparador corre en el modelo débil → poco fiable; añade
  maquinaria que contradice la filosofía del pipeline.
- **C (design-review Opus + resto Sonnet)**: 👍 ahorro real sin degradar lo importante; simple · 👎 el
  usuario decide manualmente cuándo escalar el resto.
