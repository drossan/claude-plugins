#!/usr/bin/env bash
# sdd-lint.sh — helper Bash OPCIONAL y NO bloqueante de validación SDD (subconjunto mecánico).
#
# ⚠️ Best-effort. La AUTORIDAD es la skill `/sdd-lint` (task-pipeline); este helper cubre solo el
#    subconjunto DETERMINISTA (grep/test) para que un repo consumidor CON runner/CI lo cablee y tenga
#    validación desatendida. Puede ir por detrás de las reglas de la skill. NO es un hook de evento y
#    NO forma parte del gate de cierre.
#
# Uso:   scripts/sdd-lint.sh [RUTA]      (RUTA por defecto: .claude/specs)
# Salida: exit 0 = sin ERROR · exit 2 = algún ERROR · exit 1 = uso/entorno.
#         Los AVISOS van a stderr y NO cambian el exit code.
# Deps: solo grep/test/find/sort/uniq/dirname/ls (sin Node, sin dependencias).
#
# Portabilidad: Bash 3.2+ (macOS incluido — SIN `mapfile`); `grep -E` (BSD y GNU) sin `-P`/`\d`.

set -u

ROOT="${1:-.claude/specs}"
ERRORS=0
err()  { printf 'ERROR: %s\n' "$1"; ERRORS=$((ERRORS + 1)); }
warn() { printf 'AVISO: %s\n' "$1" >&2; }

if [ ! -d "$ROOT" ]; then
  printf 'sdd-lint: no existe la ruta "%s" — nada que validar.\n' "$ROOT" >&2
  exit 1
fi

# Guard cero-verde-falso: si no hay ningún artefacto SDD, dilo (no salgas 0 "silencioso").
ARTIFACT_COUNT=$(find "$ROOT" -type f \( -name 'spec.md' -o -path '*/casos-de-uso/*.md' -o -path '*/adr/[0-9]*.md' \) 2>/dev/null | wc -l | tr -d ' ')
if [ "$ARTIFACT_COUNT" -eq 0 ]; then
  printf 'sdd-lint: no se han encontrado artefactos SDD bajo "%s" (spec.md / casos-de-uso/ / adr/).\n' "$ROOT" >&2
  exit 0
fi

MADR_STATES='proposed|accepted|rejected|deprecated|superseded'

# 1) [NECESITA ACLARACIÓN] sin resolver = ERROR (incompletitud). Solo artefactos materializados.
while IFS= read -r hit; do
  [ -n "$hit" ] && err "[NECESITA ACLARACIÓN] sin resolver → $hit"
done < <(grep -rn '\[NECESITA ACLARACIÓN' "$ROOT" 2>/dev/null | cut -d: -f1-2)

# 2) Estado MADR ∈ 5 (case-insensitive). Un ADR sin línea de Estado válida = ERROR.
while IFS= read -r adr; do
  [ -z "$adr" ] && continue
  if ! grep -qiE "^- \*\*Estado\*\*: *($MADR_STATES)" "$adr"; then
    err "estado MADR no canónico o ausente (∈ proposed/accepted/rejected/deprecated/superseded) → $adr"
  fi
done < <(find "$ROOT" -type f -path '*/adr/[0-9]*.md' 2>/dev/null)

# 3/4) Por cada spec.md: ids bien formados, duplicados por-package, sección EARS obligatoria.
while IFS= read -r spec; do
  [ -z "$spec" ] && continue
  # 3a) ids FR-000 / SC-000 con 3 dígitos.
  while IFS= read -r bad; do
    [ -n "$bad" ] && err "id mal formado (usa FR-000 / SC-000 con 3 dígitos) → $spec: $bad"
  done < <(grep -oE '(FR|SC)-[0-9]+' "$spec" 2>/dev/null | grep -vE '(FR|SC)-[0-9]{3}$')
  # 3b) duplicados por-package (dentro del mismo spec).
  while IFS= read -r dup; do
    [ -n "$dup" ] && err "id duplicado en el spec → $spec: $dup"
  done < <(grep -oE '(FR|SC)-[0-9]{3}' "$spec" 2>/dev/null | sort | uniq -d)
  # 4) sección obligatoria EARS.
  grep -qE '^## Requisitos funcionales' "$spec" 2>/dev/null \
    || err "sección obligatoria ausente: '## Requisitos funcionales (EARS)' → $spec"
done < <(find "$ROOT" -type f -name 'spec.md' 2>/dev/null)

# 5) Enlace ADR roto: 'superseded by NNNN' cuyo ADR NNNN no existe = ERROR.
while IFS= read -r adr; do
  [ -z "$adr" ] && continue
  dir=$(dirname "$adr")
  while IFS= read -r n; do
    [ -z "$n" ] && continue
    if ! ls "$dir"/"$n"-*.md >/dev/null 2>&1; then
      err "enlace ADR roto: 'superseded by $n' sin fichero $n-*.md → $adr"
    fi
  done < <(grep -oiE 'superseded by [0-9]{4}' "$adr" 2>/dev/null | grep -oE '[0-9]{4}')
done < <(find "$ROOT" -type f -path '*/adr/[0-9]*.md' 2>/dev/null)

if [ "$ERRORS" -gt 0 ]; then
  printf 'sdd-lint: %d ERROR(es). La skill /sdd-lint es la autoritativa (incluye checks semánticos).\n' "$ERRORS" >&2
  exit 2
fi
printf 'sdd-lint: sin ERROR mecánico (revisa AVISOS en stderr; los checks semánticos los hace /sdd-lint).\n'
exit 0
