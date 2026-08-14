# Session log — task-pipeline-sdd-y-stack-poliglota-09

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: [05, 07]` → done ✔; rama del plan ✔; sin otra tarea active ✔. Extensión del plan.
- Tarea 09 movida `pending → active`; GitHub #47 → In progress.
- **Objetivo**: `/task-init` (install) y `/doctor` (repo legacy sin `features.sdd`) **preguntan** con
  `AskUserQuestion` si activar SDD; al confirmar escriben `features.sdd: true` (+ doctor materializa scaffold
  ADR, cat. 9). Sin canal → no activa. Idempotente. Nunca auto sin confirmar.

## 2026-08-14 — Cierre

### Resumen
`/task-init` gana el **Paso 1.6** (prompt de activación SDD en install nueva) y `/doctor` gana el paso
**"Activación SDD"** en Fase 2 (ofrecer activar en repo legacy). Ambos: `AskUserQuestion` → al confirmar
escriben `features.sdd: true` + materializan `.claude/specs/adr/adr-index.md` desde la semilla; declinar/sin
canal → no tocan; idempotente; nunca auto. CHANGELOG bajo 0.15.0 (sin bump).

### Decisiones + porqué
- **Materializar solo el scaffold ADR global** (`adr-index.md`) al activar; el `spec.md`/CU per-package lo
  crea el **flujo on-demand** (tarea 06) — coherente con el matiz honesto que ya di: doctor no autogenera
  contenido per-package, solo el scaffold global.
- **doctor: activación en Fase 2, ausencia sigue ≠ drift** (cat. 2) — la ausencia no es problema; la
  activación es un *ofrecimiento* interactivo, no un fix forzado.

### Verificación corrida + resultado
- 6 escenarios Gherkin como criterios de aceptación (grep/inspección): cumplidos.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **6/6 VERIFICADO**, 0 INCORRECTO (confirma que
  `templates/adr-index.md` existe; único matiz estético: "Activación SDD" es lead-in en negrita, no header).
- Sin identificadores muertos (los de doctor son cat. 1, allowlist).

### Docs actualizadas · ficheros/commits · tiempo · follow-ups
- `task-init/SKILL.md` (Paso 1.6), `doctor/SKILL.md` (cat. 2 + Fase 2 Activación SDD), `CHANGELOG.md`.
- Commit en la rama del plan (bundla la reapertura del plan + scaffolding de 10/11/12). Estimado 2h · real ~30m.
- GitHub: #47 In progress → Done/close; padre #37 In progress (reabierto).
- Siguiente: tarea 10 (schema git-automation + conventional-commits, `depends_on: —`).
