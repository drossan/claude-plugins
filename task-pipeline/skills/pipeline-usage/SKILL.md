---
name: pipeline-usage
description: >-
  Informe de uso/consumo de la sesión bajo demanda: tokens (input/output/cache),
  modelo, tiempo y desglose por fase (design-review, grilling, plan-task…) y por
  subagente, leyendo el transcript de la sesión. Read-only y best-effort (el formato
  del transcript es interno/no soportado). Úsala cuando quieras saber cuánto ha
  costado una sesión o una fase concreta, o dónde optimizar. No se auto-ejecuta:
  invocarla es el opt-in.
---

# pipeline-usage — analítica de uso del pipeline (on-demand, read-only)

Reportas el consumo de la sesión **cuando te invocan**. No hay hooks ni recolección
automática: el coste solo se paga cuando alguien pide el informe.

## Honestidad primero (léelo — no lo saltes)

El desglose se obtiene **parseando el transcript JSONL**, cuyo formato Anthropic
documenta como **interno y sujeto a cambios entre versiones** (recomienda no
parsearlo). Por tanto estas cifras son **best-effort**:

- El **titular honesto es el total de sesión**; el por-fase y el por-subagente son
  extras que pueden estar **incompletos** (en una sesión de implementación normal, la
  mayor parte del gasto NO lleva `attributionSkill` y queda como "baseline sin fase").
- Estas cifras pueden **no cuadrar** con las que reporta la plataforma (p. ej.
  `subagent_tokens` de la Agent tool cuenta distinto). No las presentes como exactas.
- Si algo no se puede garantizar (falta `python3`, esquema no reconocido, % atribuido
  bajo, líneas corruptas, sin datos) → **dilo explícitamente**. Nunca inventes un
  número ni lo presentes como hecho. Es coherente con `honesty-rules.md`.
- **Privacidad**: solo se leen métricas (tokens, modelo, timestamp, `attributionSkill`).
  **Nunca** se lee ni se emite el texto de los mensajes.

## Paso 1 — Localizar la sesión

1. Deriva el directorio del proyecto: `~/.claude/projects/<slug>/`, donde `<slug>` es
   el `cwd` con `/` y `.` sustituidos por `-` (p. ej. `/Users/me/dev/foo` →
   `-Users-me-dev-foo`). Puedes confirmar el slug listando `~/.claude/projects/` y
   buscando el que corresponde al `cwd` actual.
2. La **sesión actual** = el `*.jsonl` de **nivel superior más reciente** en ese
   directorio (los subagentes viven en `<uuid>/subagents/agent-*.jsonl`, NO en el
   nivel superior). Si el usuario pide otra sesión o "todas", ajusta la lista.
3. Distingue **"no hay directorio de proyecto / transcript"** de **"hay directorio
   pero sin datos legibles"** — son mensajes distintos, no fabriques cifras en ninguno.

## Paso 2 — Comprobar python3

La agregación usa **python3** (no jq). Comprueba `command -v python3`. Si **no está**:
informa "necesito `python3` para agregar el uso; no puedo darte cifras sin él" y
**para** (no improvises una suma a mano ni inventes números).

## Paso 3 — Agregar y presentar

Ejecuta este agregador (pásale la ruta del transcript de nivel superior; deriva sus
subagentes solo). Está probado contra transcripts reales; no lo reescribas salvo que
el esquema haya cambiado:

```bash
python3 - "<RUTA_DEL_TRANSCRIPT>.jsonl" <<'PY'
import json, os, sys, glob, collections
from datetime import datetime

def parse_ts(s):
    if not isinstance(s, str): return None
    try: return datetime.fromisoformat(s.replace('Z', '+00:00'))
    except Exception: return None

def agg(path):
    """Agrega un JSONL. SOLO métricas (usage/model/timestamp/attributionSkill). Nunca texto."""
    tot = collections.Counter(); models = collections.Counter()
    phases = collections.defaultdict(lambda: collections.Counter())
    usage_entries = attributed = dropped = schema_warn = 0
    tmin = tmax = None
    try: f = open(path, errors='replace')
    except OSError: return None
    with f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: o = json.loads(line)
            except Exception: dropped += 1; continue          # línea corrupta/incompleta
            ts = parse_ts(o.get('timestamp'))
            if ts:
                tmin = ts if tmin is None or ts < tmin else tmin
                tmax = ts if tmax is None or ts > tmax else tmax
            m = o.get('message')
            if not (isinstance(m, dict) and isinstance(m.get('usage'), dict)): continue
            u = m['usage']; usage_entries += 1
            if 'input_tokens' not in u and 'output_tokens' not in u: schema_warn += 1
            it = u.get('input_tokens', 0) or 0
            ot = u.get('output_tokens', 0) or 0
            cc = u.get('cache_creation_input_tokens', 0) or 0   # ESCALAR: se cuenta una vez
            cr = u.get('cache_read_input_tokens', 0) or 0       # (ignoramos el objeto cache_creation)
            tot['input'] += it; tot['output'] += ot
            tot['cache_creation'] += cc; tot['cache_read'] += cr
            if m.get('model'): models[m['model']] += it + ot
            sk = o.get('attributionSkill')                      # se muestra VERBATIM (con prefijo task-pipeline:)
            if sk:
                attributed += 1
                phases[sk]['input'] += it; phases[sk]['output'] += ot
    dur = (tmax - tmin).total_seconds() if (tmin and tmax) else None
    return dict(tot=tot, models=models, phases=phases, usage_entries=usage_entries,
                attributed=attributed, dropped=dropped, schema_warn=schema_warn, dur=dur)

path = sys.argv[1]
r = agg(path)
if r is None:
    print("SIN DATOS: no se pudo abrir el transcript."); sys.exit(0)
if r['usage_entries'] == 0:
    print("SIN DATOS DE USO: no hay entradas con usage legibles en este transcript.")
    if r['dropped']: print(f"  ({r['dropped']} líneas descartadas por corruptas/incompletas)")
    sys.exit(0)

t = r['tot']; head = t['input'] + t['output']
pct = 100 * r['attributed'] / r['usage_entries']
dur = f"{r['dur']:.0f}s" if r['dur'] is not None else "N/A"
print("== TOTAL DE SESIÓN (titular best-effort) ==")
print(f"  input+output: {head:,}   (input {t['input']:,} / output {t['output']:,})")
print(f"  cache: creation {t['cache_creation']:,} · read {t['cache_read']:,}  (informativo; NO en el titular)")
print(f"  modelos (por input+output): {dict(r['models'])}")
print(f"  duración: {dur}   ·   entradas con usage: {r['usage_entries']}")
avisos = []
if r['dropped']:     avisos.append(f"{r['dropped']} líneas corruptas descartadas")
if r['schema_warn']: avisos.append(f"{r['schema_warn']} entradas con esquema de usage no reconocido")
if avisos: print("  ⚠️  " + "; ".join(avisos))
print(f"\n== POR FASE (best-effort · {pct:.1f}% del gasto atribuido a fase) ==")
if pct < 50:
    print(f"  ⚠️  AVISO: solo {pct:.1f}% del gasto lleva fase. El desglose por fase está INCOMPLETO;")
    print(f"      fíate del TOTAL DE SESIÓN, no de la suma de las fases.")
if not r['phases']:
    print("  (ninguna entrada con attributionSkill: sin atribución de fase disponible)")
for sk, c in sorted(r['phases'].items(), key=lambda kv: -(kv[1]['input'] + kv[1]['output'])):
    print(f"  · {sk}: {c['input'] + c['output']:,}  (in {c['input']:,} / out {c['output']:,})")

sub_dir = path[:-6] + '/subagents' if path.endswith('.jsonl') else ''
subs = sorted(glob.glob(os.path.join(sub_dir, 'agent-*.jsonl'))) if sub_dir and os.path.isdir(sub_dir) else []
print("\n== POR SUBAGENTE ==")
if not subs:
    print("  (sin subagentes en esta sesión)")
for s in subs:
    rs = agg(s)
    if not rs or rs['usage_entries'] == 0: continue
    ts = rs['tot']
    print(f"  · {os.path.basename(s)}: {ts['input'] + ts['output']:,} tok  modelos={dict(rs['models'])}")
PY
```

Presenta el resultado al usuario **tal cual sale**, en prosa clara, respetando los
avisos. Recuerda encabezar con que es best-effort y que el titular es el total de
sesión. Las claves de fase se muestran **verbatim** (llevan prefijo `task-pipeline:` y
puede aparecer `init` u otras ajenas, o claves históricas): no las reescribas ni
inventes un mapa de renombrado.

## Paso 4 — Snapshot opcional

Si el usuario quiere histórico entre sesiones, escribe un snapshot **solo con las
métricas** (nunca texto de mensajes) en
`.claude/analytics/sessions/<id>.json`, donde `<id>` = el **nombre del fichero de
transcript sin extensión** (id determinista y estable; evita la ambigüedad de las
claves `session_id`/`sessionId` del contenido). Re-invocar **sobreescribe** (last-write-wins).

> **Repos consumidores**: `.claude/analytics/` guarda métricas per-usuario; **añádelo
> tú a tu `.gitignore`** — el plugin no toca el `.gitignore` de tu repo (invariante).

## Descarte explícito

- No se estima coste en USD (requeriría una tabla de precios por modelo que se
  desactualiza; sería un número no verificable presentado como dato).
- No hay recolección por hooks ni control A/B: esta skill mide *lo que hay*, no aísla
  el efecto de cambios (p. ej. no puede demostrar por sí sola el ROI del modo caveman).
