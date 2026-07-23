# Session log — task-pipeline-docs-portal-and-tracking-06

## 2026-07-23 — Arranque

- Movida a `active/`, `status: active`. Issue **#17** → In progress en Project #2.
- Objetivo: enlaces README→web (con salvedad go-live), carve-out de la narrativa de stack (#4: CLAUDE.md +
  HOW-TO + comentario de task-pipeline.yml), coherencia final (grep) y runbook fuente única (ya en -01).

## 2026-07-23 — Cierre

**Resumen**: wire-up final + coherencia.
- **Enlaces README→web**: root `README.md` y `task-pipeline/README.md` enlazan a
  `drossan.github.io/claude-plugins/` **con salvedad de go-live** (Pages off + primer tag).
- **Carve-out #4** en los 3 sitios que afirmaban "no pnpm": `CLAUDE.md`, HOW-TO, comentario de
  `task-pipeline.yml` → `website/` es sub-proyecto pnpm aislado, no el harness del pipeline.
- **Runbook fuente única**: no se duplicó; el de `-01` (`github-tracking-runbook.md`) es el único.
- **Coherencia**: versión plugin.json 0.12.1 = CHANGELOG top; allowlist del barrido **corregida** (era
  imprecisa: los renames son 0.8.0 y 0.9.0, no ≤0.8.1; +`doctor` +auto-descripción) — hallazgo incidental
  del `fact-checker`, arreglado por estar en la tarea de coherencia.

**Verificación**: `fact-checker` (subagente fresco) = **7/7 VERIFICADO** (con el matiz de la allowlist, ya
corregido); build del portal verde; sin identificadores renombrados vivos; atribución Matt Pocock intacta.

**Ficheros**: `README.md`, `task-pipeline/README.md`, `CLAUDE.md`, HOW-TO, `.claude/task-pipeline.yml`.
**Tiempo real**: ~1h. **Proyección**: issue #17 cerrada; Project #2 item → Done.
