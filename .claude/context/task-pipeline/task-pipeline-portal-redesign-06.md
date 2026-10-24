# Session log — task-pipeline-portal-redesign-06

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01, 02]` `completed` ✔; sin otra tarea `active` (03/04/05 cerradas) ✔.
- **Objetivo**: sección **Capas opcionales** — las 4 páginas `features/*` autocontenidas (sin tapón al
  README), minucia enlazada según el mapa canónico:
  - `sdd.md`: añadir **"El flujo, con y sin SDD"** (qué se mantiene / qué cambia) + diagrama que sitúa
    spec/CU/ADR junto al bucle plan→task→context; re-estilar el diagrama del gate `sdd-lint` con la paleta por
    rol (gate=rojo). Preservar las **garantías opt-in** (fail-safe).
  - `git-automation.md`: soften tapón; `conventional-commits` ya está como flag independiente.
  - `github-tracking.md`: **re-estilar el diagrama** hoy con tema por defecto → paleta por rol (neutro);
    soften tapón; preservar límites honestos.
  - `caveman.md`: soften tapón; modos off/lite/full.
- Fuente de sustancia: `task-pipeline/README.md` (§SDD, §Git automation, §GitHub tracking, §Caveman).

## 2026-08-14 — Cierre

### Resumen
Sección **Capas opcionales** — 4 páginas autocontenidas, tapón "Fuente canónica → README" → "Profundizar (opcional)":
- `features/sdd.md`: **nueva** sección **"El flujo, con y sin SDD"** (tabla qué se mantiene/qué cambia) +
  **diagrama** que sitúa spec/CU/ADR junto al bucle plan→task→context; gate `sdd-lint` **re-estilado** con la
  paleta por rol (rojo). Garantías opt-in preservadas.
- `features/git-automation.md`: tapón → Profundizar (conventional-commits ya era flag independiente).
- `features/github-tracking.md`: **diagrama re-estilado** con el tema (era tema por defecto) → nodos gris
  redondeados; límites honestos preservados; tapón → Profundizar.
- `features/caveman.md`: tapón → Profundizar.

### Verificación corrida + resultado
- `pnpm docs:build`: **exit 0**, sin dead links.
- Diagramas en navegador (preview fresco :4182, claro Y oscuro): SDD 2 SVG (flujo 6 gris + gate 4 rojo);
  github-tracking 1 SVG (6 gris); texto `#1f2937`, sin error, ambos modos.
- **Gate `fact-checker`** (subagente fresco `sonnet`): **12/12 VERIFICADO, 0 INCORRECTO** — cada capa fiel al
  README; tapón "Fuente canónica" eliminado en las 4 (grep = 0). (Matiz: el sub-detalle "ADR NNNN desde 0001,
  sin ADR-0000" es fiel; su fuente exacta es `templates/README.md`, no el README principal.)

### Docs · GitHub · follow-ups
- `website/features/{sdd,git-automation,github-tracking,caveman}.md` (4 edits).
- GitHub (best-effort): cerrar #64 **bloqueado por el clasificador de permisos** → pendiente owner.
- Estimado 4h · real ~1h30m. Siguiente: task 07 (Referencia + gate de cierre del portal).
