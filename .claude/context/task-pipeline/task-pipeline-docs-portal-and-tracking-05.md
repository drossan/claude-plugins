# Session log — task-pipeline-docs-portal-and-tracking-05

## 2026-07-23 — Arranque

- Movida a `active/`, `status: active`. Issue **#16** → In progress en Project #2.
- Objetivo: workflow de Actions que construya VitePress y despliegue a Pages. Deploy real inverificable en
  sesión (Pages off, sin admin) → verificación = validez del YAML + build local.

## 2026-07-23 — Cierre

**Resumen**: `.github/workflows/deploy-docs.yml` creado.
- Trigger: `on: push tags: ['v*']` + `workflow_dispatch`. Permisos `pages: write` + `id-token: write`.
  `concurrency: group pages`. Job `deploy` con `needs: build`. Build: pnpm (v9) + Node 20 con cache,
  `pnpm install --frozen-lockfile`, `pnpm docs:build`, `upload-pages-artifact path website/.vitepress/dist`.
  Deploy: `actions/deploy-pages@v4`, environment `github-pages`.

**Decisiones + porqué**: trigger por tag (release) en vez de cada push a main → docs publican con cada
release; `workflow_dispatch` como escape manual. `defaults.run.working-directory: website` solo afecta a los
`run` (por eso el `path` del artifact es repo-root-relative `website/.vitepress/dist`). Actions pineadas a
major (v4/v5/v3) — pin-a-SHA descartado por tamaño del repo (riesgo aceptado en scenario-coverage).

**Verificación**: `actionlint 1.7.12` → EXIT 0 (schema validado, no solo YAML); `yaml.safe_load` OK; build
local re-ejecutado por `fact-checker` = dist en `website/.vitepress/dist`. **Límite honesto (NO VERIFICABLE)**:
el deploy real a Pages corre en infra de GitHub con Pages encendido + admin → **no** ejercitable en sesión;
reconocido, no afirmado como «pasa». `fact-checker` = **7/7 VERIFICADO** (incl. la afirmación de límite).

**Ficheros**: `.github/workflows/deploy-docs.yml`. **Tiempo real**: ~0.5h.
**Follow-up**: encender Pages (owner) para que el primer tag `v*` publique. **Proyección**: #16 cerrada;
Project #2 → Done.
