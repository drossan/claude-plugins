# Spec — <feature / capacidad>

> **Plantilla SDD** (GitHub Spec Kit + EARS). Materialízala en `.claude/specs/<package>/spec.md`.
> **Gated por `features.sdd`** (opt-in, default off): sin el flag, esta capa no existe. Es el **"QUÉ"**
> (requisitos), fuente de verdad **viva** que cada tarea actualiza. El **"CÓMO"** del actor vive en los
> **casos de uso** enlazados; las **decisiones** de arquitectura, en los **ADR**. Lo que no sepas, márcalo
> con **`[NECESITA ACLARACIÓN: <pregunta>]`** en vez de inventar un requisito.

## Resumen

<1–2 frases: qué capacidad cubre esta spec y para quién.>

## User stories

> Priorizadas **P1/P2/P3**. Cada una **testable e independiente** (se valida por sí sola).

- **US-1 (P1)** — Como `<rol>`, quiero `<capacidad>`, para `<beneficio>`.
- **US-2 (P2)** — Como `<rol>`, quiero `<capacidad>`, para `<beneficio>`.
- **US-3 (P3)** — Como `<rol>`, quiero `<capacidad>`, para `<beneficio>`.

## Requisitos funcionales (EARS)

> Notación **EARS**. Un requisito por línea, id `FR-00x`. Patrones:
> - **Ubicuo**: El sistema DEBERÁ `<respuesta>`.
> - **Event-driven**: **Cuando** `<disparador>`, el sistema DEBERÁ `<respuesta>`.
> - **State-driven**: **Mientras** `<estado>`, el sistema DEBERÁ `<respuesta>`.
> - **Opcional**: **Donde** `<feature presente>`, el sistema DEBERÁ `<respuesta>`.
> - **Unwanted**: **Si** `<condición no deseada>`, **entonces** el sistema DEBERÁ `<respuesta>`.

- **FR-001** — El sistema DEBERÁ `<...>`.
- **FR-002** — Cuando `<disparador>`, el sistema DEBERÁ `<...>`.
- **FR-003** — Si `<condición no deseada>`, entonces el sistema DEBERÁ `<...>`.

## Requisitos no funcionales

- **NFR-001** — `<rendimiento / seguridad / accesibilidad / …>`. `[NECESITA ACLARACIÓN: <umbral?>]`

## Criterios de éxito

> Observables y medibles. Id `SC-00x`.

- **SC-001** — `<resultado medible>`.
- **SC-002** — `<resultado medible>`.

## Casos de uso

> El **"CÓMO"** del actor. El **Gherkin de aceptación vive en el CU, no aquí** (anti-duplicación): esta
> spec **enlaza**, no copia escenarios.

- [CU-`<id>`: `<título>`](./casos-de-uso/`<id>`.md)

## Fuera de alcance

- `<lo que esta spec explícitamente no cubre>`

## Aclaraciones pendientes

> Consolida aquí los `[NECESITA ACLARACIÓN: …]` abiertos; una spec con aclaraciones pendientes no está
> cerrada.

- `[NECESITA ACLARACIÓN: <pregunta>]`
