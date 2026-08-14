# Session log — task-pipeline-portal-redesign-01

Task: IA + navegación + slugs estables/redirects + mapa de fuente canónica (issue #59).
Plan: portal-redesign (issue #58). Rama: plan/task-pipeline/portal-redesign.

## 2026-08-14 — arranque

- Task movida a `active/`, status `active`. Es el **contrato de estructura** del que dependen 02-07.
- Contexto: proyección GitHub hecha (padre #58 + subs #59-#65, sub-issues nativas + Project 2 Backlog).
- SDD = N/A (sin baseline); TDD/mutation = N/A (stack none, doc). Verificación = inspección + `pnpm docs:build`
  + navegación real de redirects.
- Plan de trabajo de esta task: (1) diseñar la nueva IA de 5 secciones y el mapeo de páginas; (2) decidir el
  mecanismo de redirect de VitePress; (3) reorganizar `nav`+`sidebar` en `config.mts`; (4) crear el mapa de
  fuente canónica; (5) activar el buscador local; (6) `srcExclude` del mapa; (7) verificar build + redirects.

## 2026-08-14 — implementación

- **`config.mts`**: `nav`+`sidebar` reorganizados a las **5 secciones** (Empezar/Conceptos/El pipeline paso a
  paso/Capas opcionales/Referencia). **Buscador local** activado (`search: { provider: 'local' }`).
  `srcExclude` ampliado con `CANONICAL-SOURCES.md`.
- **Slugs**: se **conservan TODOS** los existentes (que-es, instalacion, pipeline, configuracion, skills,
  features/*) → **0 redirects** necesarios (decisión: reagrupar el sidebar, no mover ficheros). El refuerzo de
  "redirect real por navegación" queda **N/A** (nada se movió); documentado en el mapa por si a futuro se mueve.
- **Páginas nuevas (stubs)**: `guia/tu-primer-plan.md` (→ task 03), `conceptos/{modelo,estados,ramas-e-ids}.md`
  (→ task 04), `referencia/cli.md` (→ task 07). Resuelven el sidebar; las rellenan sus tasks.
- **Mapa de fuente canónica**: `website/CANONICAL-SOURCES.md` (interno, excluido de páginas) con la regla
  por-tema portal↔README + nota de redirects.
- **Verificación**: `pnpm docs:build` **en verde, sin dead links** (todos los slugs resuelven). Warning de
  chunk-size = cosmético (mermaid). Provides materializado (nav/sidebar + tabla de slugs + mapa canónico).

## 2026-08-14 — cierre

- Gates: TDD/mutation/sdd-lint **N/A** (doc-only, sin baseline SDD). **fact-checker** (sonnet): los 7 claims
  **VERIFICADO** (build real exit 0 sin dead links; ficheros/slugs confirmados). Sin INCORRECTO ni NO VERIFICABLE.
- Auto-commit (git-automation, `co-author:false` → sin trailer de Claude). Task → `done`, movida a `completed/`.
- github-tracking: sub-issue #59 → cerrada + Project 2 `Done` (best-effort).
- **Siguiente recomendada**: task 02 (tema Mermaid) — su muestra necesita tu aprobación antes de que 03-06
  dibujen. 02 no depende de 01, pueden ir en cualquier orden; 03-06 dependen de ambas.

<!-- append-only: añadir entradas conforme avanza la task -->
