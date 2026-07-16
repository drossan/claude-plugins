# Histórico — task-pipeline-003 (Parte C: skill `doctor`)

> Session log append-only.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: [001, 002]` → ambas `done`; ninguna otra tarea `active`; rama del plan.
- Consume el contrato `models:` de 002 (para detectar su ausencia) y el estado sano de referencia de 001
  (identificadores actuales, hook con ruta correcta).

## Decisiones + porqué

- **`doctor` = playbook model-driven** (stack none), no ejecutable. Frontera con `/task-init`: doctor
  revisa un repo YA adoptado; no inicializa vírgenes (los remite a `/task-init`).
- **Dos fases duras**: Fase 1 read-only (nunca edita) → lista numerada de problemas; Fase 2 por problema:
  diff ANTES de aprobar, `AskUserQuestion` si hay varias opciones, aplica **solo tras aprobación**, cada
  decisión independiente. Nada se auto-edita a ciegas.
- **Propiedad repo vs plugin**: drift en fichero del repo consumidor = fixable; drift en artefacto del
  plugin (hook/SKILL/plantilla) = **solo-reporte** + remite a actualizar el plugin (no parchear la
  instalación). Prosa customizada = aviso, no auto-edita.
- **Allowlist**: nunca marca CHANGELOG (≤0.8.1) ni atribución.
- **Robustez**: YAML malformado → reporte legible, no aborta. Fix que no se puede aplicar (read-only /
  cambiado desde el diff) → reporta, deja intacto, continúa.
- **Idempotencia** por diseño: diagnostica contra el estado actual, no guarda estado entre pasadas.
- **Registro más allá del DoD**: además de ambos README + plugin.json + marketplace.json (requerido),
  actualicé `flujo-del-pipeline.md` ("Las 6 skills"→7 + fila doctor) por coherencia (dogfooding).

## Verificación corrida + resultado (stack none → inspección + fixtures)

Como `doctor` es un playbook (no ejecutable ni registrado como skill en esta sesión), verifiqué en dos
niveles:

1. **Revisión de instrucciones** contra los 17 escenarios Gherkin → cada uno tiene su cláusula explícita
   en el SKILL.md (read-only Fase 1; diff-antes-de-aprobar; AskUserQuestion multi-opción; procesar todos
   respetando cada decisión; idempotencia; no-adoptado→task-init; prosa custom=aviso; allowlist;
   plugin-owned=solo-reporte; YAML malformado; fix no aplicable).
2. **Fixtures de detección** (repos de prueba con `mktemp`): validé que las SEÑALES que prescribe la Fase
   1 discriminan de verdad:
   - **sano** (models: presente, sin identificadores viejos, estructura completa, YAML OK) → 0 problemas.
   - **drift** → detecta `grill-me`/`/task`/`skills/task/` en task-lifecycle.md, `models:` ausente, falta
     `.claude/specs`; y NO marca el `grill-me`/`/task` del CHANGELOG (allowlist OK).
   - **virgen** (sin marcadores) → no-adoptado → remite a `/task-init`, sin crear/editar.
   - **yamlbad** (`.claude/task-pipeline.yml` inválido) → reporta "YAML inválido" sin abortar.

## Docs actualizadas + motivo

- Nueva `skills/doctor/SKILL.md`. Registro: root README (tabla + namespaced + Uso + árbol),
  `task-pipeline/README.md` (tabla), `plugin.json` + `marketplace.json` (prosa), y
  `flujo-del-pipeline.md` (coherencia). JSON válidos.

## Ficheros / commit

- 6 ficheros: `skills/doctor/SKILL.md` (nuevo), 2 README, 2 metadatos JSON, flujo — + PM.
- Commit: `task-pipeline-003: feat: skill doctor (verifica y alinea repos ya iniciados)`.

## Tiempo real

- ~2h (estimate 3h). El diseño del SKILL.md (17 escenarios en dos fases) fue lo más costoso; los
  fixtures de detección lo validaron rápido.

## Follow-ups

- Al ser playbook, la garantía última del flujo interactivo (diff/aprobación) depende de que el modelo
  siga las instrucciones; no hay test automatizado posible con stack none. Un futuro harness `bats` sobre
  la parte determinista (detección) sería el complemento natural (fuera de alcance de este plan).
