# Session log — task-pipeline-sdd-y-stack-poliglota-08

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque + Cierre (release only)

- **Gate**: `depends_on: [01..07]` → todas done ✔; rama del plan ✔; sin otra tarea active ✔.
- Tarea 08 movida a `active/`; GitHub #45 → In progress. (Nota: el `status:` del frontmatter quedó en
  `pending` durante el arranque por un descuido — lo detectó el `fact-checker` de cierre; resuelto pasando
  directo a `done` al cerrar, sin estado intermedio inconsistente.)

### Resumen
Release **v0.15.0** del plan `sdd-y-stack-poliglota` (solo release, sin comportamiento nuevo):
- **Bump SemVer**: `plugin.json` 0.14.0 → **0.15.0** (minor: features opt-in retrocompatibles). Precondición
  verificada (estaba en 0.14.0).
- **Manifiestos**: `plugin.json` + `marketplace.json` — `description` menciona ahora **stack multi-lenguaje
  por-package** + **SDD nativo opt-in**, coherentes entre sí. JSON válido en ambos.
- **CHANGELOG**: `## [Unreleased]` → **`## [0.15.0] — 2026-08-14`** (único header) agrupando los 7 `### Added`
  (tareas 01–07) + 1 `### Changed` + la tranquilización "opt-in default off — comportamiento por defecto
  idéntico al de 0.14.0". El header `## [0.14.0]` sigue intacto debajo.
- **Nav**: `website/features/sdd.md` registrada en el sidebar `Opcional` (`config.mts`).
- **Retro**: añadida al plan (estimación vs real, sorpresas —regresión del header 0.14.0 en la tarea 01—,
  corte de B4 a follow-up).

### Verificación corrida + resultado
- 5 escenarios Gherkin como criterios de aceptación (grep/inspección/`test -d`): cumplidos.
- **Coherencia e2e**: frase canónica **byte-intacta** (git log -S main..HEAD vacío: ningún commit del plan
  la tocó); espejos de flags (README + 2×lifecycle) consistentes; nav alcanzable; manifiestos coherentes.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **10/10 VERIFICADO**, 0 INCORRECTO. Confirma versión
  0.15.0, 0.14.0 no absorbido, CHANGELOG consolidado, frase canónica presente.
- Sin identificadores muertos en la superficie de release.

### Docs actualizadas + motivo
- `task-pipeline/.claude-plugin/plugin.json` (versión + description), `.claude-plugin/marketplace.json`
  (description), `task-pipeline/CHANGELOG.md` (consolidación 0.15.0), plan (retro).

### Ficheros / commits · tiempo · follow-ups
- 3 ficheros de release + plan (retro) + arranque/cierre. Commit en la rama del plan.
- Estimado 2h · real ~30m. **Cierra el plan** (workstream A #35 + B #36 + C release).
- GitHub: #45 → Done/close; **padre #37 → Done/close** al cerrar el plan.
- Follow-up abierto: plan-stub `sdd-site-vitepress` (seed VitePress diferido, B4) en `pending/`.
