# Runbook — setup de github-tracking en este repo

> Pasos **manuales del owner** que las skills no pueden ejecutar (falta `admin` en el repo y/o identidad de
> cuenta). La proyección de Issues es automática; lo de abajo es lo que la habilita al 100% (tablero + Pages).
> Materializado por la tarea `task-pipeline-docs-portal-and-tracking-01`; `-06` lo consolida/enlaza.

## Estado actual (2026-07-23)

- `features.github-tracking` **activo** en `.claude/task-pipeline.yml` (`enabled: true`, `repo: drossan/claude-plugins`, `project: 2`).
- Label `plan` creada. Plan proyectado: **issue PADRE #11** + sub-issues **#12-17**. Project v2 **#2** con las 7 issues.

## Gotcha de identidad (lo más importante)

La sesión `gh` está autenticada como **`danielrosse`** (colaborador con `push`), pero el repo lo posee
**`drossan`**. Consecuencias verificadas:

- ✅ Crear/cerrar **Issues** en `drossan/claude-plugins`: funciona (colaborador con push).
- ❌ **Crear Projects v2** de `drossan`: **denegado** (`createProjectV2: danielrosse does not have permission`). Lo crea el owner.
- ❌ **Resolver/editar** el Project de `drossan`: falla (`Could not resolve to a ProjectV2`) hasta que el owner da acceso **Write** a `danielrosse` en el Project.

→ Si quieres que la automatización toque el tablero, **una de dos**: (a) el owner da acceso Write a
`danielrosse` en el Project (hecho), o (b) autenticar `gh` como `drossan` (`gh auth switch`).

## Pasos

### 1. Scope de Projects (si aún no)
```bash
gh auth refresh -s project
```

### 2. Project v2 (lo crea el OWNER, cuenta drossan)
- UI: perfil de `drossan` → **Projects** → **New project** → obtén el número (aquí **2**).
- Da acceso al colaborador: Project → **⚙ Settings** → **Manage access** → invita `danielrosse` con rol **Write**.
- Cablea el número en `.claude/task-pipeline.yml`:
  ```yaml
  features:
    github-tracking:
      project: 2
  ```
- Añadir issues existentes al tablero (si hiciera falta rehacerlo):
  ```bash
  for n in 11 12 13 14 15 16 17; do
    gh project item-add 2 --owner drossan --url https://github.com/drossan/claude-plugins/issues/$n
  done
  ```

### 3. GitHub Pages (requiere `admin` → owner)
- Repo → **Settings** → **Pages** → **Source: GitHub Actions**.
- Sin esto, el workflow de deploy (tarea `-05`) construye pero **no publica**; el sitio da 404.

### 4. Footgun `base` (VitePress project-site)
- `base: '/claude-plugins/'` está **atado al nombre del repo**. Un rename/fork/traslado a org o el paso a
  dominio custom rompe **todos** los assets con 404. Si cambias el nombre del repo o el dominio, **actualiza
  `base`** en la config de VitePress.

## Desactivar github-tracking (precaución)
- Con el flag `off`, la **reconciliación de `/doctor` no corre** → no detecta huérfanas. **Reconcilia ANTES
  de desactivar**; las issues huérfanas que queden se resuelven a mano.
