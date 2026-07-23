# website/ — portal de documentación (VitePress)

Sub-proyecto **aislado** del resto del repo: tiene su propio toolchain (pnpm + VitePress) y **no** cambia el
`stack: none` del pipeline (los entregables del plugin siguen siendo Markdown + Bash). VitePress solo escanea
`website/**` (nunca `docs/guides`, `.claude/**` ni los README de la raíz).

## Requisitos

- Node ≥ 18 (probado con v20).
- pnpm.

## Comandos (desde `website/`)

```bash
pnpm install            # instala VitePress (usa el pnpm-lock.yaml versionado)
pnpm docs:dev           # servidor de desarrollo con hot-reload
pnpm docs:build         # build de producción → website/.vitepress/dist/
pnpm docs:preview       # sirve el build de producción en local
```

## Notas

- **`base: '/claude-plugins/'`** en `.vitepress/config.mts` (project-site de GitHub Pages, sirve en
  `drossan.github.io/claude-plugins/`). Está **atado al nombre del repo**: un rename/fork/dominio custom lo
  rompe (footgun documentado en el runbook de github-tracking).
- El deploy a Pages lo hace el workflow `.github/workflows/deploy-docs.yml` (tarea `-05`), disparado por
  **tags `v*`**. El *encendido* de Pages (Settings → Pages → Source: GitHub Actions) es acción manual del owner.
- **Gotcha del entorno `github-pages`** (verificado 2026-07-23): el entorno auto-creado al encender Pages
  solo permite deploys desde **`main`**. Como el trigger es por **tag `v*`**, hay que autorizar los tags o
  el job `deploy` falla (el `build` pasa): Settings → Environments → **github-pages** → *Deployment branches
  and tags* → añadir regla **`v*`** (tipo **Tag**). Requiere admin. Atajo para publicar sin admin: lanzar el
  workflow con **`workflow_dispatch`** desde `main` (`main` sí está permitida por defecto).
- `node_modules/`, `.vitepress/cache/` y `.vitepress/dist/` están en el `.gitignore` de la raíz; el
  `pnpm-lock.yaml` **sí** se versiona (builds reproducibles).
