# <NNNN>. <título de la decisión, en imperativo>

> **Plantilla SDD** (MADR 4.0.0). Materialízala en `.claude/specs/adr/NNNN-titulo.md` (`NNNN` desde
> `0001`). **Gated por `features.sdd`** (opt-in, default off). Registra **una decisión de arquitectura** y
> su porqué, para que perdure más allá de la tarea que la tomó.

- **Estado**: proposed
  <!-- Ciclo de estados de MADR 4.0.0 — usa el FIEL A LA FUENTE, no rellenes con `accepted` por defecto:
       - proposed   → propuesta, aún no cerrada (default al abrir la ADR).
       - accepted   → decidida y en vigor. SOLO si la decisión está cerrada.
       - rejected   → se consideró y se descartó (se conserva por trazabilidad).
       - deprecated → fue aceptada pero ya no se recomienda.
       - superseded → reemplazada por otra ADR; enlázala ("superseded by NNNN-..."). -->
- **Fecha**: YYYY-MM-DD
- **Decisores**: `<quiénes toman la decisión>`

## Contexto y planteamiento del problema

`<El problema y las fuerzas en juego. Puedes plantearlo como una pregunta a resolver.>`

## Decision drivers

- `<driver / criterio que empuja la decisión>`
- `<...>`

## Opciones consideradas

- **Opción 1** — `<...>`
- **Opción 2** — `<...>`
- **Opción 3** — `<...>`

## Resultado de la decisión

Elegida: **`<opción>`**, porque `<justificación frente a los drivers>`.

### Confirmación

`<Cómo se verifica que la implementación cumple la decisión: revisión, test, gate del pipeline, etc.>`

## Consecuencias

- **Buenas**: `<qué mejora>`
- **Malas / coste**: `<qué empeora o qué deuda se asume>`

## Pros y contras de las opciones

- **Opción 1**: 👍 `<pro>` · 👎 `<contra>`
- **Opción 2**: 👍 `<pro>` · 👎 `<contra>`
- **Opción 3**: 👍 `<pro>` · 👎 `<contra>`
