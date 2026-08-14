# Session log — task-pipeline-portal-redesign-02

Task: Tema Mermaid — spike de mecanismo (claro+oscuro) + paleta por rol + muestra (issue #60).
Plan: portal-redesign (issue #58). Rama: plan/task-pipeline/portal-redesign.

## 2026-08-14 — arranque + spike

- Task → active. Objetivo: resolver el mecanismo de theming legible en claro Y oscuro (classDef hex literal
  no se adapta al modo oscuro) + paleta por rol + muestra a APROBAR por el owner antes de que 03-06 dibujen.
- Plan: (1) medir baseline dark actual; (2) elegir mecanismo; (3) muestra; (4) render-check claro+oscuro.

### Spike — resultado (verificado en navegador, claro y oscuro)

- **Mecanismo elegido**: `classDef` por rol con **fill claro + texto oscuro EXPLÍCITO** (`color:#1f2937`).
  Clave: fijar el color de texto → mode-agnóstico. Sin eso, mermaid en oscuro pone texto claro = ilegible.
  Los elementos sin estilo (aristas, fondo de subgraph, título) los adapta el plugin al cambiar de modo.
- **Paleta por rol**:
  - `classDef human fill:#fde68a,stroke:#d97706,color:#1f2937`  (checkpoint humano — ámbar)
  - `classDef agent fill:#bfdbfe,stroke:#2563eb,color:#1f2937`  (subagente adversario — azul)
  - `classDef gate  fill:#fecaca,stroke:#dc2626,color:#1f2937`  (gate — rojo)
  - `classDef normal fill:#e2e8f0,stroke:#64748b,color:#1f2937` (paso/artefacto — gris)
- **Redondeo**: nodos con sintaxis `(...)` (rect redondeado) / `([...])` (stadium inicio/fin). **Agrupación**:
  `subgraph`. **Acentos** en labels: OK (probado "aprobación").
- **a11y**: el rol no depende SOLO del color — cada nodo lleva su **etiqueta nombrada** (grilling,
  design-review…) y hay **leyenda** textual bajo el diagrama (canal no-cromático).
- Muestra temporal en `website/muestra-tema.md` (se borra tras aprobar); build verde. **Pendiente: aprobación
  del owner** antes de documentar la convención y cerrar.

## 2026-08-14 — cierre

- **Owner aprobó** el estilo. Convención documentada en `website/DIAGRAM-THEME.md`; muestra temporal borrada.
- Gates: TDD/mutation/sdd-lint N/A. **fact-checker** (sonnet): 5/5 VERIFICADO (build real exit 0 sin dead
  links; DIAGRAM-THEME.md con las 4 classDef; srcExclude; muestra borrada).
- Auto-commit (git-automation, sin co-autor). Task → done/completed. Sub-issue #60 → cerrada + Project Done.
- **Siguiente**: 03/04/05/06 (contenido) ya pueden arrancar — dependían de 01+02, ambas done. Aplican el tema.

<!-- append-only -->
