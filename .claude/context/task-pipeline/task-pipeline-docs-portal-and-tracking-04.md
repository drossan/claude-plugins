# Session log — task-pipeline-docs-portal-and-tracking-04

## 2026-07-23 — Arranque

- Movida a `active/`, `status: active`. Issue **#15** → In progress en Project #2.
- Objetivo: contenido curado (onboarding) + nav/sidebar + frontera anti-drift (enlazar al spec canónico en
  rutas estables; prohibido `.claude/plans|tasks/`; sin versión hardcodeada). Verificación = build sin
  enlaces rotos + grep de enlaces sitio→repo contra el árbol real.

## 2026-07-23 — Cierre

**Resumen**: 7 páginas curadas + nav/sidebar + frontera anti-drift.
- `guia/que-es.md`, `guia/instalacion.md`, `guia/pipeline.md`, `skills/index.md` (las 9 skills),
  `features/github-tracking.md`, `features/caveman.md`; home (`index.md`) con hero + features.
- `config.mts`: nav (Inicio/Guía/Skills) + sidebar (Guía / Skills / Opcional).

**Frontera anti-drift aplicada**: el spec profundo NO se copia; cada página da resumen curado + enlace
"fuente canónica" a **rutas estables** (`blob/main/<ruta>` sin ancla de línea): README raíz,
`task-pipeline/README.md`, `CHANGELOG.md`, `docs/guides/task-lifecycle.md`. **Prohibido** enlazar a
`.claude/plans|tasks/` (solo menciones en prosa, que no se pudren). Sin versión hardcodeada (instalación usa
`@<tag>` + enlace al CHANGELOG).

**Gotcha registrado**: el `grep` del entorno es ugrep + zsh no word-splitea `$FILES` con saltos de línea →
un primer barrido dio falsos "OK" (grep fallando, no limpio). Rehecho con `find -print0 | xargs -0`.

**Verificación**: `pnpm docs:build` verde (dead-link check activo → sin enlaces internos rotos); greps
robustos: 0 enlaces a `.claude/plans|tasks`, 0 anclas `#L`, 0 versión hardcodeada; 4 destinos canónicos
existen (`test -f`). `fact-checker` (subagente fresco, re-build + re-grep) = **7/7 VERIFICADO**.

**Ficheros**: `website/{index.md,guia/*.md,skills/index.md,features/*.md,.vitepress/config.mts}`.
**Tiempo real**: ~1.5h. **Follow-up**: enlaces README→web + coherencia en `-06`.
**Proyección**: issue #15 cerrada; Project #2 item → Done.
