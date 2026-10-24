---
id: task-pipeline-sdd-proveedor-externo-05
package: task-pipeline
plan: sdd-proveedor-externo
status: active
---
# Session log — task-pipeline-sdd-proveedor-externo-05

> Histórico append-only. Registro canónico de la tarea.

## 2026-10-24 — Arranque

- **Gate**: `depends_on` (-03, -04) en `done` ✔; rama `plan/task-pipeline/sdd-proveedor-externo` ✔; sin otra tarea active ✔.
- Tarea movida a `active/`.

## 2026-10-24 — Implementación y cierre

### Cambios
- `README.md`: «SDD nativo» → «SDD: nativo o externo» (tabla de tres modos enlazando la regla única, modo nativo, modo externo con contrato v1 experimental, degradación, idempotencia y riesgo RN-5); fila de `features.sdd`, routing de `models.sdd-lint` y fila de `/sdd-lint`.
- `docs/flujo-del-pipeline.md`, `website/features/sdd.md` (sección «SDD externo» + mermaid), `guia/configuracion.md`, `guia/pipeline.md`, sidebar y `CANONICAL-SOURCES.md`: tres modos, enlazando la regla sin copiarla.
- Follow-up de la 03: «features.sdd on» barrido en `plan-task/SKILL.md` (líneas 41/47/136/153), README y `doctor/SKILL.md:54`.
- Release 0.18.0: `plugin.json` (versión + description), `marketplace.json` (description), `CHANGELOG.md`.

### Decisiones
- `marketplace.json` no tiene campo `version`: el criterio «versión coincide en los tres» se cumple solo para `plugin.json` y CHANGELOG; en marketplace se alinea la `description`.
- En `plan-task/SKILL.md` no se enlaza la regla con ruta relativa (no resolvería desde la skill): se cita «Modo SDD» de `docs/guides/task-lifecycle.md`, como ya hacía la línea 216.
- `website/guia/tu-primer-plan.md` (walkthrough histórico con SDD off) no se toca.

### Verificación (stack none)
- `claude plugin validate .` ✔; `cd website && pnpm docs:build` ✔ (6.1 s); `json.tool` de ambos manifests ✔.
- `scripts/sdd-lint.sh .claude/specs`: sin ERROR mecánico. Sin cambios de spec/CU.
- Barrido `grep` reforzado: solo allowlist (doctor, grilling).
- `fact-checker` (sonnet): 6/6 VERIFICADO. Matiz: no se comprobó que el heading de `task-lifecycle.md` genere exactamente el slug `modo-sdd-off-native-external` (el build de VitePress no marca enlaces muertos a ese `.md` externo al portal, que apunta a GitHub).

### Follow-ups
- Validar el contrato v1 contra un provider real (nota abierta del plan).
- Ampliar el escenario «ya en external» a `/task-init` (de la 04).
