# Git automation (opcional)

Automatiza el **commit** al cerrar una tarea y la **PR** al cerrar el plan. **Opt-in** (default `off`): sin
el bloque, commit y PR son **manuales**, exactamente como hoy.

## Activar

En `.claude/task-pipeline.yml`:

```yaml
features:
  git-automation:
    auto-commit: true     # commit `<task-id>: <mensaje>` al cerrar cada tarea
    auto-pr: true         # PR de la rama del plan al cerrar el PLAN (requiere auto-commit)
    co-author: false      # default: NO añade el trailer de co-autor a los commits automáticos
  conventional-commits: true   # default ON: formato `<task-id>: <conventional commit>`
```

## Qué hace

- **`auto-commit`**: al cerrar una tarea (tras pasar su DoD, incluido `fact-checker`), la sesión commitea
  `<task-id>: <mensaje>`.
- **`auto-pr`**: al cerrar la **última** tarea del plan, abre la PR a la rama de integración. **Requiere
  `auto-commit`**; con `auto-pr: true` y `auto-commit: false` queda **inerte** + aviso.
- **`co-author`** (default `false`): controla si los commits **de la automatización** llevan el trailer de
  co-autor. No rige los commits **manuales**.
- **`features.conventional-commits`** (default `true`): formato del mensaje; `false` lo relaja a mensaje
  libre (mantiene el prefijo `<task-id>:`).

## Garantías opt-in

- **Fail-safe**: solo `true` booleano activa cada toggle; ausente / `false` / `"true"` / `yes` / `1` /
  no-canónico → **off**.
- **Fuera de todo preset**; **ausencia ≠ drift** (`/doctor` no la reporta).
- **Off = comportamiento idéntico al de hoy** (commit y PR manuales).
- **Best-effort**: si el commit/PR automático falla (git/gh), se avisa y **no** se bloquea el cambio de
  `status:` del `.md`.

> **Fuente canónica**: detalle en el
> [README del plugin → Git automation](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md).
