#!/usr/bin/env bash
#
# task-pipeline — SessionStart hook (parte GENÉRICA, determinista).
#
# Asegura el scaffolding genérico de un repo que YA HA ADOPTADO la convención
# .claude/plans|tasks|specs|context (árbol de carpetas + docs/guides/task-lifecycle.md),
# y lo auto-repara si algo se borró. NO inventa la convención en repos que no la
# usan: si no detecta adopción, sale en silencio (cero ficheros, cero contexto),
# para no ensuciar repos no relacionados — recuerda que el plugin es global.
#
# La adopción INICIAL de un repo es explícita: el usuario corre `/task-init`.
# Este hook solo mantiene sano lo genérico una vez adoptado.
#
# Solo emite contexto al modelo cuando realmente ha tenido que crear/restaurar
# algo; en un repo sano es un no-op silencioso.

set -eu

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
TEMPLATES="${CLAUDE_PLUGIN_ROOT:-}/skills/plan-task/templates"
LIFECYCLE="$PROJECT_DIR/docs/guides/task-lifecycle.md"
FEATURES="$PROJECT_DIR/.claude/task-pipeline.yml"

cd "$PROJECT_DIR" 2>/dev/null || exit 0

# --- gate de adopción --------------------------------------------------------
# El repo "usa task-pipeline" si ya existe alguno de estos marcadores.
adopted=0
for marker in .claude/plans .claude/tasks .claude/specs .claude/task-pipeline.yml docs/guides/task-lifecycle.md; do
  if [ -e "$marker" ]; then adopted=1; break; fi
done
[ "$adopted" -eq 1 ] || exit 0   # no adoptado → no-op silencioso

# --- asegurar el esqueleto de carpetas --------------------------------------
created=0
for kind in plans tasks; do
  for state in pending active completed cancelled; do
    d=".claude/$kind/$state"
    if [ ! -d "$d" ]; then mkdir -p "$d" && created=1; fi
  done
done
for d in .claude/context .claude/specs docs/guides; do
  if [ ! -d "$d" ]; then mkdir -p "$d" && created=1; fi
done

# --- asegurar la guía canónica del ciclo de vida ----------------------------
restored_guide=0
if [ ! -f "$LIFECYCLE" ] && [ -f "$TEMPLATES/task-lifecycle.md" ]; then
  cp "$TEMPLATES/task-lifecycle.md" "$LIFECYCLE" && restored_guide=1
fi

# --- asegurar la config de features (defaults) ------------------------------
restored_features=0
if [ ! -f "$FEATURES" ] && [ -f "$TEMPLATES/task-pipeline.yml" ]; then
  cp "$TEMPLATES/task-pipeline.yml" "$FEATURES" && restored_features=1
fi

# --- reportar SOLO si hemos cambiado algo ------------------------------------
if [ "$created" -eq 0 ] && [ "$restored_guide" -eq 0 ] && [ "$restored_features" -eq 0 ]; then
  exit 0   # todo en su sitio → silencio
fi

msg="task-pipeline: scaffolding genérico asegurado en este repo."
if [ "$restored_guide" -eq 1 ]; then
  msg="$msg Restaurado docs/guides/task-lifecycle.md desde la plantilla del plugin."
fi
if [ "$restored_features" -eq 1 ]; then
  msg="$msg Restaurado .claude/task-pipeline.yml (config de features, defaults ON) desde la plantilla del plugin."
fi
msg="$msg Para inicializar un package nuevo (su HOW-TO-START-A-TASK.md) usa /task-init <package>."

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$msg"
