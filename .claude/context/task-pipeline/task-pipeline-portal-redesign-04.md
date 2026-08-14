# Session log — task-pipeline-portal-redesign-04

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01, 02]` ambas `completed` ✔; rama del plan ✔; sin otra tarea `active` (03 cerrada) ✔.
- **Objetivo**: sección **Conceptos** = modelo estático (qué/por qué), sin recorrer fases. 3 páginas:
  `conceptos/modelo.md` (plan/task/context/specs y sus relaciones), `conceptos/estados.md` (máquinas de estado
  de plan y task, tema de la 02), `conceptos/ramas-e-ids.md` (main integración, `plan/<pkg>/<name>`, ids
  plan-scoped + residual honesto).
- **Frontera Conceptos↔Pipeline** (decisión de grilling): Conceptos **define**; Pipeline **secuencia**.
  Conceptos enlaza a Pipeline en vez de repetir las fases. Las máquinas de estado viven aquí (la task 05 las
  saca de `guia/pipeline.md` y enlaza).
- Fuente de sustancia: `task-pipeline/README.md` (§Convención, §Trabajo en equipo y colisiones de id) +
  `docs/guides/task-lifecycle.md`. Mapa de fuente canónica: colisiones de id → detalle enlaza al README.

## 2026-08-14 — Cierre

### Resumen
Sección **Conceptos** materializada (3 stubs → contenido):
- `conceptos/modelo.md`: el modelo estático — árbol `.claude/`, los 4 artefactos (plan/task/context/specs) en
  tabla, cómo se relacionan (1 flowchart neutro con el tema de la 02), y "skills = playbooks". Enlaza a
  Pipeline/Estados/Ramas en vez de recorrer fases.
- `conceptos/estados.md`: `status:` = fuente de verdad + mover el `.md` = una operación; 2 máquinas de estado
  (plan lineal; tarea con `in_review`/`blocked`/reapertura `done→active`). Defiere el "cuándo" a Pipeline.
- `conceptos/ramas-e-ids.md`: `main` integración, `plan/<pkg>/<name>`, ids plan-scoped + el porqué + el
  residual honesto; detalle de resolución → link al README (mapa canónico).

### Verificación corrida + resultado
- `pnpm docs:build`: **exit 0**, sin dead links.
- Diagramas en navegador (preview fresco :4180, claro Y oscuro): modelo flowchart = 1 SVG, 7 nodos gris
  `#e2e8f0`, texto `#1f2937`; estados = 2 stateDiagram (14 nodos) legibles en ambos modos.
- **Gate `fact-checker`** (subagente fresco `sonnet`): **12/12 VERIFICADO, 0 INCORRECTO** — modelo, estados
  (incl. que `in_review`/`blocked`/reapertura existen), ids plan-scoped y frontera Conceptos↔Pipeline fieles.
- **Aprendizaje**: verificar diagramas SIEMPRE en preview **recién arrancado**. Un `docs:preview` viejo sirve
  chunks con hash caducado → 404 → la hidratación de Mermaid falla en silencio (SVG=0 sin error). No es bug
  del contenido; el build y el server fresco renderizan bien.

### Docs · GitHub · follow-ups
- `website/conceptos/{modelo,estados,ramas-e-ids}.md` (3 edits).
- GitHub (best-effort): cerrar #62 **bloqueado por el clasificador de permisos** → pendiente owner.
- Estimado 3h · real ~1h30m. Siguiente: task 05 (El pipeline paso a paso) — saca las máquinas de estado de
  `guia/pipeline.md` y enlaza a `conceptos/estados`.
