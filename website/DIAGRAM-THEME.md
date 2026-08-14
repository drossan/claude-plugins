# Convención de diagramas Mermaid del portal

> Documentación **interna** (excluida de las páginas vía `srcExclude`). Aprobada por el owner el 2026-08-14
> (task `task-pipeline-portal-redesign-02`). **Todo diagrama del portal usa esta paleta por rol.**

## Regla clave (por qué funciona en claro Y oscuro)

Cada clase de rol fija el **color de texto explícito** (`color:#1f2937`). Sin eso, en modo oscuro Mermaid
pone texto claro sobre el fill claro → **ilegible**. Con texto oscuro fijo + fill claro, el nodo se lee en
ambos modos. Los elementos **sin clase** (aristas, fondo de `subgraph`, título) los adapta el plugin al
conmutar de modo — no los toques.

## Paleta por rol (copia estas `classDef` al final de cada diagrama)

```
classDef human  fill:#fde68a,stroke:#d97706,color:#1f2937
classDef agent  fill:#bfdbfe,stroke:#2563eb,color:#1f2937
classDef gate   fill:#fecaca,stroke:#dc2626,color:#1f2937
classDef normal fill:#e2e8f0,stroke:#64748b,color:#1f2937
```

| Clase | Significado | Color |
|---|---|---|
| `human` | Checkpoint humano (grilling, aprobación del plan) | ámbar |
| `agent` | Subagente adversario (design-review, scenario-coverage, fact-checker) | azul |
| `gate` | Gate de cierre (mutation, sdd-lint, fact-checker como gate) | rojo |
| `normal` | Paso / artefacto / nodo neutro | gris |

## Convenciones de forma

- **Redondeo**: nodos con `(texto)` (rect redondeado). Inicio/fin con `([texto])` (stadium).
- **Agrupación**: usa `subgraph "Título"` para agrupar fases relacionadas (p.ej. los gates de cierre).
- **Asignar rol**: `A("grilling"):::human`.

## Accesibilidad

El rol **no depende solo del color**: cada nodo lleva su **etiqueta nombrada** y todo diagrama incluye una
**leyenda** textual debajo (`<small>ámbar = checkpoint humano · azul = subagente · rojo = gate · gris = paso</small>`).

## Verificación (obligatoria por diagrama)

`pnpm docs:build` verde **no basta** (Mermaid renderiza en cliente). Cargar la página en el navegador en
**claro Y oscuro** y confirmar que el SVG renderiza y es legible en ambos.
