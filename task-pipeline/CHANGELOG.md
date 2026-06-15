# Changelog — task-pipeline

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado [SemVer](https://semver.org/lang/es/). La versión vive en
`.claude-plugin/plugin.json` (es la que resuelve el marketplace).

## [0.7.0] — 2026-06-15

### Changed
- **Reglas de calidad Gherkin en `templates/task.md`**: la sección `## Scenarios (Gherkin)`
  pasa de modelar solo la estructura G/W/T a fijar las recomendaciones oficiales/comunidad que
  rigen su función (notación dev-only fuente 1:1 de tests TDD), en orden de impacto:
  (1) **declarativo, no imperativo** — el `When` es acción de dominio, no pasos de UI/llamadas
  internas (imperativo = test acoplado a la implementación que se rompe en cada refactor);
  (2) **un escenario = un comportamiento** (falla por una sola razón); (3) **disciplina G/W/T**
  con `And`/`But` para condiciones/resultados adicionales; (4) **`Scenario Outline` + `Examples`**
  para fronteras/clases de equivalencia del MISMO comportamiento (engancha con la dimensión
  "fronteras" de `scenario-coverage`). El bloque de ejemplo modela el `When` declarativo y un
  `Scenario Outline` bien formado.
- `skills/task/SKILL.md`: la subsección *"Gherkin = fuente de los tests"* referencia esas reglas
  (sin duplicarlas — el playbook solo orquesta).

### Notes
- Decisión consciente: se omiten `Background`, `Rule:` y tags. No se ejecutan como Gherkin (se
  traducen a tests nativos), así que tags no aportan y `Rule:` sobre-estructura a nivel de tarea;
  `Background` se deja al autor que lo necesite. Las reglas son **convención, no gate**: la
  adherencia depende de quien escribe (proporcional a un uso dev-only).

## [0.6.0] — 2026-06-12

### Added
- **Skill `design-review`**: revisión holística **adversaria** de un plan tras `grill-me`
  (corre por defecto; con salto solo en planes triviales, ver abajo). La corre un **subagente
  fresco** (Agent tool,
  `general-purpose`) al que se le pasan rutas, no opiniones, y al que **no** se le adelanta
  el veredicto deseado — así se ataca la raíz de la complacencia (presión social + sesgo de
  confirmación sobre el plan propio), no el síntoma. Evalúa el plan COMO UN TODO en 5 ejes:
  coherencia, tamaño correcto (infra- y **sobre**-ingeniería), mantenibilidad concreta,
  escalabilidad real y reversibilidad; salida obligatoria = lista de cambios con porqué, o
  enumerar qué se intentó romper y por qué resiste (un "me parece bien" no es válido).
  Complementa a `grill-me` (que baja rama por rama) con el zoom-out que faltaba.
- **Skill `scenario-coverage`**: endurecimiento QA de los escenarios Gherkin del set de tareas
  vía **subagente fresco**, tras la descomposición (Paso 5.5). Recorre dimensiones (camino
  feliz, fronteras/equivalencia, errores/fallos, estado/ciclo de vida, concurrencia, input
  adversario, Spec implícita y **requisitos que ninguna tarea cubre**) con descarte explícito
  por N/A — completitud por dimensiones, no por volumen. Tapa el hueco que el gate de mutation
  NO puede (comportamiento que nunca se programó → sin mutante que lo delate) y abarata el
  bucle de matar survivors al cierre.

### Changed
- `skills/task/SKILL.md`: nuevo **Paso 4.5** (invoca `design-review` entre `grill-me` y la
  descomposición) y **Paso 5.5** (invoca `scenario-coverage` antes del handoff).
- **Salto proporcional en planes triviales** para `design-review` y `scenario-coverage`: corren
  por defecto, pero el orquestador puede **ofrecer** saltarlas solo si el plan es objetivamente
  trivial (un fichero/área, sin superficie pública nueva, sin decisión arquitectónica; y 1 tarea
  sin bordes para `scenario-coverage`). El salto **lo decide y confirma el usuario** (`AskUserQuestion`,
  default = ejecutar) y se **registra en el Plan change log** — nunca un auto-skip silencioso del
  modelo (sería el agujero que el flujo busca evitar). `grill-me` y la aprobación del plan siguen
  siendo **no negociables**: el escape es proporcional al coste (solo las pasadas por subagente).
- **Sección `## Provides` sustituye a `## Expected result`** en las plantillas `task.md` y
  `task-lifecycle.md`: `Expected result` degeneraba en un parafraseo 1:1 de los `Then` del
  Gherkin (duplicación → drift). `Provides` tiene un trabajo propio: el **contrato hacia abajo**
  (qué deja disponible para las tareas `depends_on`), no un resumen del comportamiento. El
  renombrado mata el modo de fallo por estructura (el heading ya no invita a parafrasear), no
  por una guarda exhortativa. DoD actualizada en consecuencia.
- `README.md` y `task-lifecycle.md` reflejan los nuevos pasos y la política de checkpoints:
  **dos no negociables** (`grill-me` + aprobación) y **dos con salto en planes triviales**
  (`design-review` + `scenario-coverage`).

## [0.5.0] — 2026-06-12

### Added
- **Configuración por repo (`.claude/task-pipeline.yml`)**: las skills leen este YAML
  y lo respetan (sin parser; el modelo lo interpreta). **Resolución**: defaults internos
  (= preset `full`) → preset de `mode:` → claves explícitas en `stack:`/`features:`.
  **Sin archivo → todo `full`**, así repos existentes no cambian de comportamiento.
  - **Preset `mode`**: `full` (todo obligatorio), `legacy` (TDD sí, gate de mutation no),
    `docs-only` (solo planes + docs). Evita acertar flags sueltos.
  - **Bloque `stack`**: `language` / `package-manager` / `test-runner` / `mutation-tool`.
    Las skills eligen comandos con esto en vez de asumir pnpm/Vitest/Stryker (soporta
    Jest, npm, no-TS, etc.).
  - **`features.tdd`**: escape hatch para legacy sin harness — en `false` la DoD no exige
    tests/TDD.
  - **`features.closing-documentation.{tsdoc,technical-docs,context-log}`**: cada capa de
    documentación de cierre, activable por separado.
  - **`features.mutation-gate`**: `false` / `true`(=80) / `<int>` (umbral `break`
    configurable para ir subiendo el listón en legacy — ratchet).
  - Los checkpoints humanos (`grill-me`, aprobación del plan) NO son configurables.
- Nueva plantilla `skills/task/templates/task-pipeline.yml` (semilla con `mode`+`stack`+
  `features` y el catálogo comentado).

### Changed
- `skills/task/SKILL.md`: paso de lectura de config con tablas de `mode`/`stack`/`features`;
  documentación, TDD (Gherkin) y gate de mutation respetan la config.
- `skills/mutation/SKILL.md`: paso 0 que lee `stack`/umbral del YAML; si el gate está OFF
  o `mutation-tool: none`, informa y sale; umbral `break` parametrizado.
- `skills/task-init/SKILL.md`: materializa `.claude/task-pipeline.yml` rellenando el `stack`
  detectado y proponiendo `mode` (`legacy`/`docs-only` si no hay harness, confirmado con
  `AskUserQuestion`).
- `hooks/bootstrap.sh`: auto-repara `.claude/task-pipeline.yml` y lo reconoce como marcador
  de adopción.
- Plantillas `task-lifecycle.md` y `task.md`: catálogo de config + DoD que referencia los
  flags (incl. `tdd`). README del plugin y `templates/README.md` documentan el mecanismo.

## [0.3.0] — 2026-06-12

### Added
- **Skill `/task-init`**: bootstrap explícito de un repo en un solo comando — esqueleto
  `.claude/plans|tasks|context|specs`, `docs/guides/task-lifecycle.md` y, opcionalmente,
  el `HOW-TO-START-A-TASK.md` de un package (rellenando los bloques `ESPECÍFICO DEL
  PACKAGE`). Reemplaza el viejo `/task "inicia el proyecto…"` en lenguaje libre.
- **Hook `SessionStart`** (`hooks/hooks.json` + `hooks/bootstrap.sh`): asegura y
  auto-repara la parte genérica del scaffolding en cada arranque/resume en repos que ya
  han adoptado la convención (gate de adopción). No-op silencioso en repos no adoptados
  para no ensuciar proyectos ajenos (el plugin es global). Copia desde la misma semilla
  `skills/task/templates/task-lifecycle.md` vía `${CLAUDE_PLUGIN_ROOT}`.

### Changed
- `skills/task/SKILL.md` apunta a `/task-init` para el bootstrap del repo y del HOW-TO
  de un package, en vez de instrucciones ad-hoc.

## [0.2.0] — 2026-06-12

### Added
- Plantillas materializables en `skills/task/templates/` que `/task` lee con `Read`
  y copia al repo destino, cerrando el bootstrap (antes el skill mandaba "replicar
  el HOW-TO de otro package", que falla en un repo virgen):
  - `task.md` — plantilla de tarea con sección obligatoria `## Scenarios (Gherkin)`.
  - `plan.md` — plantilla de plan.
  - `task-lifecycle.md` — flujo canónico, autocontenido (plantillas inline) para que
    funcione una vez copiado a `docs/guides/`.
  - `HOW-TO-START-A-TASK.md` — esqueleto genérico con bloques `ESPECÍFICO DEL PACKAGE`.
  - `README.md` — mapeo plantilla → destino y placeholders.

### Changed
- `skills/task/SKILL.md` y `README.md` del plugin apuntan a las plantillas con ruta
  relativa al skill (`templates/…`), porque `${CLAUDE_PLUGIN_ROOT}` no se expande en
  el cuerpo de un `SKILL.md`. Por eso las plantillas viven dentro de `skills/task/`.

## [0.1.0]

### Added
- Versión inicial: skills `/task`, `grill-me` y `/mutation` + marketplace local.
