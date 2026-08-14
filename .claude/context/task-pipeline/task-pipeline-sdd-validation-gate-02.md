# Session log — task-pipeline-sdd-validation-gate-02

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [01]` → done ✔; rama del plan ✔; sin otra tarea active ✔.
- Tarea 02 → active; GitHub #53 → In progress.
- **Objetivo**: helper Bash `sdd-lint.sh` (subconjunto mecánico determinista, **NO bloqueante**, best-effort;
  la skill 01 es la autoritativa) para CI de consumidores con runner + **fixtures aseverados**
  known-good/known-bad + doc de cableado. Hogar: `scripts/` (no es hook de evento).

## 2026-08-14 — Cierre

### Resumen
Creado `task-pipeline/scripts/sdd-lint.sh` (helper mecánico, no bloqueante, best-effort) + `scripts/README.md`
(doc + cableado CI + expectativas aseveradas) + `scripts/fixtures/` (known-good + 5 known-bad). Checks: estado
MADR (5, case-insensitive), `[NECESITA ACLARACIÓN]`, ids `FR`/`SC` + duplicados por-package, sección EARS,
enlace ADR roto. Exit 0/2/1; AVISOS a stderr; cero-verde-falso.

### Decisiones + porqué
- **Hogar `scripts/`** (no `hooks/`): no es hook de evento (design-review: "no es hook, no es skill, es helper").
- **Bug corregido**: primera versión usaba `mapfile` (Bash 4+); macOS trae **Bash 3.2** → reescrito con
  `while read < <(...)` (proceso-sustitución mantiene `ERRORS` en el shell principal). Portabilidad era
  requisito del plan (BSD/macOS ↔ GNU/Linux); `grep -E` sin `-P`/`\d`.
- **Fixtures aseverados** (no "correr y mirar"): `scripts/README.md` fija qué ERROR reporta cada known-bad;
  verificación = reproducir exit codes. Responde a la crítica "fixtures = teatro" de la design-review.

### Verificación corrida + resultado
- `bash -n` OK; **known-good → exit 0 limpio**; **5/5 known-bad → ERROR específico + exit 2**; guards
  (ruta vacía → exit 0 + aviso; inexistente → exit 1). Corrido en Bash 3.2 (macOS).
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **9/9 VERIFICADO** — el verificador **ejecutó** el
  script sobre los fixtures y confirmó exit codes/salidas (verificación determinista, no NO VERIFICABLE).
- Sin identificadores muertos; no cableado a `hooks.json`.

### Docs · ficheros · tiempo · follow-ups
- `scripts/sdd-lint.sh`, `scripts/README.md`, `scripts/fixtures/**` (nuevos) + `CHANGELOG.md`.
- Estimado 3h · real ~1h. GitHub: #53 In progress → Done/close; padre #51 In progress.
- Siguiente: tarea 03 (cablear el gate en el cierre).
