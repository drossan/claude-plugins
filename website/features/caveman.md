# Modo caveman (opcional)

Comportamiento **opt-in** (default `off`) que comprime el **output del hilo principal** para ahorrar tokens.
Lo aplica un hook `UserPromptSubmit` que inyecta una directiva mínima de compresión.

## Activar

En `.claude/task-pipeline.yml`:

```yaml
features:
  caveman: lite    # off (default) | lite | full
```

- **`lite`**: elimina relleno y cortesías; gramática legible.
- **`full`**: prosa telegráfica, fragmentos.

En ambos, **código, comandos, errores, rutas y cifras van byte a byte** (nunca se comprimen).

**Contenido protegido de la compresión** — coherente con `honesty-rules.md`: si la compresión pudiera
borrarlo, `caveman` desactivaría justo las reglas que ese fichero instala. Se conservan siempre las
**salvedades de incertidumbre** ("no verificado"), la **etiqueta de lo que es hipótesis** frente a hecho
confirmado, el **aviso de alcance en una frase**, y **lo que quede sin hacer o sin verificar**.

## Garantías

- **Backoff determinista en checkpoints**: el hook **no** inyecta durante `grilling`, `design-review`,
  `scenario-coverage` ni `fact-checker` (donde la claridad manda). No depende del juicio del modelo.
- **Solo el hilo principal**: no afecta al output de los subagentes.

## ROI honesto

En flujos con mucho tool-use el ahorro real es modesto (input y tokens de herramientas dominan). Actívalo si
quieres probarlo; no esperes un ahorro garantizado.

> **Fuente canónica**: detalle en el
> [README del plugin → Modo caveman](https://github.com/drossan/claude-plugins/blob/main/task-pipeline/README.md).
