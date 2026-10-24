# Session log — task-pipeline-portal-redesign-05

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01, 02]` `completed` ✔; sin otra tarea `active` (03, 04 cerradas) ✔.
- **Objetivo**: reescribir `guia/pipeline.md` (slug **pinado**) como recorrido **secuencial** de fases —cada
  una con qué haces / qué ves / por qué—; usar el modelo de Conceptos por enlace (no redefinir estados);
  re-estilar el flowchart principal con el **tema de la 02** (paleta por rol + subgraph de gates) y añadir un
  diagrama de ramas ERROR/AVISO de los gates de cierre.
- **A preservar** (scenario-coverage): la **frase canónica del salto trivial** literal
  ("una sola decisión replicada, sin contrato nuevo ni decisión arquitectónica"); las secciones *"Reglas que
  viajan con el repo"* (honesty-rules) y *"Por qué subagentes frescos"*; semántica de gates ERROR-bloquea /
  AVISO-no en **prosa**, no solo en diagrama.
- **Mover**: las 2 máquinas de estado salen de `guia/pipeline.md` → ahora viven en `conceptos/estados` (task
  04); aquí se enlazan.

## 2026-08-14 — Cierre

### Resumen
`guia/pipeline.md` reescrito como recorrido secuencial:
- **Flowchart principal** re-estilado con el tema de la 02 (paleta por rol: grilling/aprobación=ámbar,
  design-review/scenario-coverage=azul, gates=rojo en un **subgraph** "Gates de cierre", pasos=gris; stadium
  para inicio/fin).
- **8 fases** con **qué haces / qué ves / por qué**; los 2 checkpoints humanos marcados no-negociables.
- **Diagrama de ramas ERROR/AVISO** de los gates de cierre + semántica en **prosa** (ERROR/INCORRECTO bloquea,
  AVISO/NO VERIFICABLE se reconoce).
- **Frase canónica** literal e intacta. Preservadas *"Alcance: el pipeline no lo expande solo"*, *"Reglas que
  viajan con el repo"*, *"Por qué subagentes frescos"*. Máquinas de estado **movidas** a `conceptos/estados`
  (enlace), no duplicadas.

### Verificación corrida + resultado
- `pnpm docs:build`: **exit 0**, sin dead links; slug `/guia/pipeline` conservado.
- 2 flowcharts en navegador (preview fresco :4181, claro Y oscuro): svgCount 2, sin error; fills =
  7 rojo · 6 gris · 2 ámbar · 2 azul, texto `#1f2937` en ambos modos.
- `grep` frase canónica = **1 match**, byte-idéntica a `plan-task/SKILL.md`.
- **Gate `fact-checker`** (subagente fresco `sonnet`): **12/12 VERIFICADO, 0 INCORRECTO** — secuencia, orden
  de gates, semántica ERROR/AVISO, no-negociables, frase canónica, alcance, honesty-rules, sin stateDiagram.

### Docs · GitHub · follow-ups
- `website/guia/pipeline.md` (reescrito).
- GitHub (best-effort): cerrar #63 **bloqueado por el clasificador de permisos** → pendiente owner.
- Estimado 4h · real ~1h45m. Siguiente: task 06 (Capas opcionales).
