#!/usr/bin/env bash
#
# task-pipeline — UserPromptSubmit hook: modo caveman-lite (OPT-IN).
#
# Cuando `features.caveman` está en `lite`|`full` en el .claude/task-pipeline.yml del repo,
# inyecta una directiva mínima para COMPRIMIR EL OUTPUT del hilo principal (ahorro de
# tokens), EXCEPTO en los checkpoints del pipeline (backoff determinista: lee la fase
# activa del tail del transcript, no se fía del juicio del modelo).
#
# Invariantes (como bootstrap.sh):
#   - No-op SILENCIOSO en repos NO adoptados (no ensuciar proyectos ajenos).
#   - No-op si el flag está off/ausente/comentado/no-canónico.
#   - Corte BARATO en Bash puro (sin python/jq), en orden: adopción → flag → tail.
#   - NUNCA rompe el turno: todos los caminos terminan en `exit 0`.
#   - Solo afecta al hilo principal (UserPromptSubmit), no al output de subagentes.
#
# NO usamos `set -e` a propósito: un fallo intermedio (p.ej. grep sin match) no debe
# abortar el turno. `set -u` sí, con todas las variables asignadas.

set -u

# Consumir el payload JSON de stdin (no fallar si viene vacío).
input="$(cat 2>/dev/null || true)"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$PROJECT_DIR" 2>/dev/null || exit 0

# --- gate 1: adopción (antes de leer flag o transcript) ----------------------
adopted=0
for marker in .claude/plans .claude/tasks .claude/specs .claude/task-pipeline.yml docs/guides/task-lifecycle.md; do
  if [ -e "$marker" ]; then adopted=1; break; fi
done
[ "$adopted" -eq 1 ] || exit 0

# --- gate 2: flag features.caveman (ignorando líneas comentadas) --------------
FEATURES="$PROJECT_DIR/.claude/task-pipeline.yml"
[ -f "$FEATURES" ] || exit 0

# Toma la primera línea `caveman:` NO comentada; extrae el valor bareword (sin comentario
# de cola ni espacios). Valores con comillas/espacios/mayúsculas NO casan → off (fail-safe).
level="$(grep -E '^[[:space:]]*caveman:[[:space:]]*' "$FEATURES" 2>/dev/null \
  | grep -v -E '^[[:space:]]*#' \
  | head -n1 \
  | sed -E 's/^[[:space:]]*caveman:[[:space:]]*//; s/[[:space:]]*(#.*)?$//')"

case "$level" in
  lite|full) : ;;   # canónico y activo → seguimos
  *)         exit 0 ;;  # off / ausente / comentado / no-canónico → no-op
esac

# --- backoff determinista: fase activa del tail del transcript ---------------
# transcript_path llega en el JSON de stdin. Si no podemos leer el transcript, NO
# inyectamos (fail-safe: podría ser un checkpoint que no vemos).
tp="$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"
[ -n "$tp" ] && [ -f "$tp" ] || exit 0

# attributionSkill más reciente del tail (acotado a N líneas; saltando entradas sin la clave).
phase="$(tail -n 60 "$tp" 2>/dev/null \
  | grep -o '"attributionSkill":"[^"]*"' \
  | tail -n1 \
  | sed -E 's/.*"attributionSkill":"([^"]*)".*/\1/')"

# Checkpoints: casa tanto con prefijo (task-pipeline:grilling) como sin él (grilling).
# Solo cuentan las fases VIVAS; no se matchean nombres de fase antiguos/renombrados
# (así no se reintroduce ningún identificador muerto en el barrido grep del repo).
case "$phase" in
  *grilling|*design-review|*scenario-coverage|*fact-checker) exit 0 ;;  # checkpoint → no inyectar
esac

# --- inyectar la directiva mínima (sin comillas dobles ni backslashes: JSON seguro) ---
# El contenido PROTEGIDO no es negociable: si la compresion pudiera borrarlo, el modo caveman
# desactivaria justo las reglas que honesty-rules.md instala (etiqueta de hipotesis, aviso de
# alcance en una frase). Cualquier regla nueva de honesty-rules.md que dependa de aparecer en la
# RESPUESTA (no solo en el comportamiento) tiene que anadirse aqui tambien.
if [ "$level" = "full" ]; then
  directive="Modo caveman (full): responde en prosa comprimida y telegrafica — elimina relleno, cortesias, preambulos y transiciones; usa fragmentos. NO comprimas ni alteres codigo, comandos, rutas, mensajes de error ni cifras: van byte a byte. Conserva SIEMPRE: las salvedades de incertidumbre (p.ej. no verificado), la etiqueta de lo que es hipotesis frente a hecho confirmado, el aviso de alcance en una frase, y lo que quede sin hacer o sin verificar. No son relleno."
else
  directive="Modo caveman (lite): responde de forma concisa — elimina relleno y cortesias, manten la gramatica legible. NO comprimas ni alteres codigo, comandos, rutas, mensajes de error ni cifras: van byte a byte. Conserva SIEMPRE: las salvedades de incertidumbre (p.ej. no verificado), la etiqueta de lo que es hipotesis frente a hecho confirmado, el aviso de alcance en una frase, y lo que quede sin hacer o sin verificar. No son relleno."
fi

printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$directive"
exit 0
