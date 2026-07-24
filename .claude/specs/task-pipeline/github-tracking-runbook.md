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
- ✅ **Resolver/editar** el Project de `drossan`: **funciona** — el owner ya dio acceso **Write** a `danielrosse`. Write al Status del board **VERIFICADO** (write-spike 2026-07-23 + dogfood `github-tracking-enrichment` tareas 02/03/04: items `Backlog→In progress→Done`, `exit=0`).

→ El acceso ya está concedido: la automatización toca el tablero. Alternativa (si se pierde): autenticar
`gh` como `drossan` (`gh auth switch`). Opciones reales del Status: `Backlog · Ready · In progress · In
review · Done` (match por nombre **case-insensitive** — la opción real es `In progress`, no `In Progress`).

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

## Comandos `gh` de la proyección (referencia — coherentes con Paso 5.7 y el lifecycle)

> El playbook lo tejen `/plan-task` (Paso 5.7, al crear) y `docs/guides/task-lifecycle.md` (transiciones de
> estado). Estos son los comandos concretos que ejecutan; aquí como referencia del owner. `OWNER=drossan`,
> `R=drossan/claude-plugins`, `P=2`.

```bash
# Crear label de package (idempotente: "already exists" NO es fallo)
gh label create "pkg:task-pipeline" -R "$R" --color 5319E7 --description "Package: task-pipeline (task-pipeline)"
# Familia de labels de estado (colores sugeridos)
gh label create "status: in-progress" -R "$R" --color FBCA04 --description "(task-pipeline)"
gh label create "status: in-review"  -R "$R" --color 0E8A16 --description "(task-pipeline)"
gh label create "status: blocked"    -R "$R" --color B60205 --description "(task-pipeline)"

# Crear la issue (body completo desde fichero — nunca --body interpolado; label de package)
gh issue create -R "$R" --title "<título>" --body-file <cuerpo.md> --label "pkg:task-pipeline"        # padre
gh issue create -R "$R" --parent <nº-padre> --title "<título>" --body-file <cuerpo.md> --label "pkg:task-pipeline"  # sub-issue

# Alta en el Project + fijar Status (resolver el option-id por nombre, case-insensitive)
gh project item-add "$P" --owner "$OWNER" --url https://github.com/$R/issues/<n>
gh project item-edit --project-id <PVT_…> --id <PVTI_…> --field-id <PVTSSF_…> --single-select-option-id <opt-id>

# Transición de estado (recipe add-then-remove) + assignee al arrancar
gh issue edit <n> -R "$R" --add-label "status: in-progress"     # 1º añade la nueva
gh issue edit <n> -R "$R" --remove-label "status: in-review"    # 2º quita las demás status:* (y la `blocked` pelada legacy)
gh issue edit <n> -R "$R" --add-assignee @me                    # acumula; no se desasigna al cerrar
gh issue close <n> -R "$R"                                      # done  (idempotente: cerrar una cerrada = no-op)
gh issue close <n> -R "$R" --reason "not planned"              # cancelled
gh issue reopen <n> -R "$R"                                     # reapertura done → active
```

## Desactivar github-tracking (precaución)
- Con el flag `off`, la **reconciliación de `/doctor` no corre** → no detecta huérfanas. **Reconcilia ANTES
  de desactivar**; las issues huérfanas que queden se resuelven a mano.
