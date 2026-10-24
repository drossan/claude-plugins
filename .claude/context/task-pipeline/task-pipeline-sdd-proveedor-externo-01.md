# Session log — task-pipeline-sdd-proveedor-externo-01

> Histórico append-only. Registro canónico de la tarea.

## 2026-10-24 — Arranque + implementación

- **Gate**: `depends_on: []` ✔; rama `plan/task-pipeline/sdd-proveedor-externo` (desde `main`) ✔; sin otra tarea active ✔.
- Plan y tarea movidos a `active/`; GitHub #78 (padre) y #79 → *In progress* (Project), label `status: in-progress` + assignee en #79.
- Incidente: el `mkdir -p` con tres rutas creó un directorio `" "` en la raíz y arrastró los dos `mv`. Detectado en el siguiente paso, ficheros devueltos a `active/` y directorio vacío eliminado. Sin pérdida.

### Cambios
- `.claude/task-pipeline.schema.json` y `templates/task-pipeline.schema.json`: `features.sdd` → `oneOf` boolean | objeto `{enabled, provider}`. Byte-idénticos (`cmp`), JSON válido (`json.tool`).
- `templates/task-pipeline.yml`: ejemplo **comentado** del bloque; descomentado parsea a `{enabled: True, provider: 'plugin:skill'}`.
- `docs/guides/task-lifecycle.md` + `templates/task-lifecycle.md`: sección «Modo SDD: off / native / external» (regla única, tabla de resolución, ilegible, provider propio, identificador único, schemas = ayuda de editor) y fila de la tabla de features. La copia de plantilla remite al README del plugin en vez de enlazar al CU del repo (no existe en consumidores).
- `spec.md`: FR-002 → modo nativo; **FR-012** (resolución del modo); enlace al CU nuevo.
- `routing-contrato.md`: ext. 1h y Scenario Outline con bloque con/sin provider.

### Verificación
- `jsonschema`: acepta `true`, `false`, bloque con provider, `{enabled:true}`, `provider:""` (documentado como off en runtime) y rechaza `"yes"`.
- Escenarios del CU cubiertos (Resolución del modo, Modo nativo no cambia, Config ilegible, Provider propio): por `grep` de cada regla en el lifecycle; el modo nativo no cambia porque solo se añadió una sección y una fila, sin tocar skills ni pasos de cierre.
- `sdd-lint` mecánico: sin `[NECESITA ACLARACIÓN`, ids bien formados sin duplicados, secciones presentes, enlaces OK.
- Barrido de ids muertos: solo `HOW-TO-START-A-TASK.md` (allowlist: describe el propio barrido).

## 2026-10-24 — Gate `sdd-lint`

- Mecánico: limpio. Semántico (subagente sonnet): **0 ERROR**, AVISOS reconocidos:
  - FR-012 mezcla ubicuo + «Si…entonces» con dos disparadores; la cláusula de YAML ilegible es redundante con «cualquier otra cosa → off». Se deja así (atómico no es requisito; coherente con el CU).
  - CU `sdd-proveedor-externo`: escenarios «Provider no instalado» (3 Then) y «Rutas existen al invocar» (start+close) juntan comportamientos relacionados; extensión 4a antes que 3a. Artefacto del plan ya endurecido por `scenario-coverage`; fuera de esta tarea.
  - Corregido: faltaba la fila «ausente» en el Outline de `routing-contrato.md`.
- Declaración SDD: spec (FR-002, FR-012) + CU (`routing-contrato`) actualizados en esta tarea.

## 2026-10-24 — Cierre

- `fact-checker` (sonnet): 9/9 VERIFICADO, 0 INCORRECTO. Matiz 7: el bloque sin provider en 1h queda cubierto por «malformado → off»; el Outline sí lo lista. Hallazgo extra aplicado: la fila `features.sdd` de la tabla tenía el texto añadido fuera de la última celda → corregido en ambos lifecycles.
- Tiempo real: ~1.5h. Follow-up: tarea 02 (lectores nativos). DoD: TDD/mutation N/A (stack none).
