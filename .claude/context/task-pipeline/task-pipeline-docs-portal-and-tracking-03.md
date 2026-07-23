# Session log — task-pipeline-docs-portal-and-tracking-03

## 2026-07-23 — Arranque

- Movida a `active/`, `status: active`. Issue **#14** → In progress en Project #2.
- Entorno verificado: node v20.19.1, pnpm 9.15.9, registry npm 200. VitePress estable = **1.6.4** (`npm view`).

## 2026-07-23 — Cierre

**Resumen**: scaffold VitePress aislado en `website/`, build verde.

**Entregado**:
- `website/package.json` (pnpm, `type: module`, scripts `docs:dev/build/preview`, `vitepress` **pineado a
  1.6.4** exacto).
- `website/.vitepress/config.mts`: `lang: es-ES`, `base: '/claude-plugins/'`, `srcExclude: ['**/README.md']`,
  `ignoreDeadLinks` en default (false → build falla ante enlaces rotos). srcDir = `website/` (VitePress solo
  escanea website/**).
- `website/index.md` (home hero mínimo) + `website/README.md` (cómo correr; **excluido** del sitio).
- `.gitignore` raíz: `website/node_modules|.vitepress/dist|.vitepress/cache`; `pnpm-lock.yaml` versionado.

**Decisiones + porqué**:
- Toolchain en `website/` (no en la raíz) → sub-proyecto aislado; no cambia `stack: none` del pipeline.
- Versión **pineada** (no `^`) porque el `--frozen-lockfile` del workflow (`-05`) lo requiere.
- `srcExclude` del README: VitePress publicaba `website/README.md` como `README.html` (doc de dev filtrada
  como página) — lo caché al leer el informe de `fact-checker`; excluido y reconstruido → dist limpio.

**Verificación** (build real, no «debería»): `pnpm install` + `pnpm docs:build` → `build complete` exit 0;
dist = `index.html` + `404.html` (sin README.html, sin `.md` del repo fuera de website/). `fact-checker`
(subagente fresco, re-corrió el build) = **7/7 VERIFICADO**. `git check-ignore` OK; lockfile no ignorado;
`stack: none` intacto.

**Ficheros**: `website/{package.json,.vitepress/config.mts,index.md,README.md,pnpm-lock.yaml}`, `.gitignore`.
**Tiempo real**: ~1h. **Follow-up**: nav/sidebar y páginas reales en `-04`; deploy en `-05`.
**Proyección**: issue #14 cerrada; Project #2 item → Done.
