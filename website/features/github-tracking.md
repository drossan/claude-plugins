# github-tracking (opcional)

Integración **opt-in** (default `off`) que **proyecta** el trabajo a GitHub Issues/Projects para tener un
orden global glanceable + tablero. El `.md` sigue siendo la **única fuente de verdad**; GitHub es una
**proyección one-way** (`.md` → GitHub).

## Qué proyecta

- **Plan → issue PADRE**; **tarea → SUB-ISSUE** (`gh issue create --parent`).
- **Estados**: `active` → In Progress · `done` → issue cerrada / Done · `cancelled` → cerrada "not planned"
  · `blocked` → label `blocked`.
- Al completar el plan, la **issue PADRE se cierra** (GitHub no la auto-cierra al cerrar sus sub-issues).

## Activar

En `.claude/task-pipeline.yml`:

```yaml
features:
  github-tracking:
    enabled: true
    repo: owner/name        # opcional; default = el repo actual
    project: 3              # opcional; nº de Project v2 para el tablero
```

Requiere `gh` reciente autenticado con permiso de escritura. Sin `gh`, sin red, sin auth o repo no-GitHub →
**no-op** (el flujo local no cambia).

## Límites honestos

- Proyección **best-effort**: la reconciliación vive en `/doctor` (no garantiza consistencia ante
  paginación, rate-limit, auth caída o issues borradas a mano).
- **Concurrencia**: dos ramas proyectando el **mismo plan** crean padres duplicados; mitigación: **una sola
  rama proyecta el plan**.
- Techos de GitHub: **100 sub-issues por padre**.

> **Fuente canónica**: setup, mapeo, ciclo de vida del padre y riesgos aceptados en el
> [README del plugin → GitHub tracking](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md).
