# Session log — task-pipeline-011 (Hook `caveman.sh`)

Plan: `usage-analytics-and-caveman` · Rama: `plan/task-pipeline/usage-analytics-and-caveman`
Stack `none`: verificación = `bash -n` + ejecución con stdin simulado en repo de prueba
(adoptado/no adoptado, flag off/lite/full, tail con/sin checkpoint).

## 2026-07-16 — Implementación

- Gate: 011 `active`, `depends_on: [010]` (done); rama del plan; única `active`. OK.
- Hook `UserPromptSubmit` Bash 3.2: gate barato (adopción → flag ignorando comentarios →
  fase del tail), backoff determinista (checkpoints con prefijo `task-pipeline:`),
  directiva mínima lite/full con preservación byte-a-byte, exit 0 siempre. Sin python/jq.

## 2026-07-16 — Verificación y cierre

**Bug encontrado (en el TEST, no en el hook):** la primera matriz falló en `lite` porque
macOS tiene FS case-insensitive y mis repos de prueba `lite`/`LITE` colisionaban (el
segundo sobrescribía al primero). Rehecha con nombres sin colisión → el hook es correcto.

**Verificación (bash -n + ejecución con stdin simulado, 15 casos):**
- Sin salida: no-adoptado, flag off/comentado/ausente, checkpoints (grilling/design-review/
  scenario-coverage/fact-checker, con prefijo `task-pipeline:`), tail-mix (última sin fase +
  anterior design-review → toma design-review), no-canónico (`LITE`, `"lite"`), sin
  transcript_path, transcript inexistente. exit 0 en todos.
- Inyecta: lite+sin-fase (lite), lite+plan-task (lite), lite+grill-me (lite; no es
  checkpoint), full+sin-fase (full). JSON válido con cláusula byte-a-byte + salvedad honestidad.
- Corregido: quité el literal `grill-me` de un comentario del hook (scenario-coverage T3
  exigía no reintroducirlo) → 0 `grill-me` en el hook.

**Gate `fact-checker`: PASA (5/5 VERIFICADO).** Matiz reconocido: mi afirmación "grep
python/jq = 0" era literalmente inexacta (1 mención en comentario `sin python/jq`); el
hook **no invoca** python/jq — claim sustantiva correcta, no bloquea.

**Ficheros:** `task-pipeline/hooks/caveman.sh` (nuevo, +x), `task-pipeline/hooks/hooks.json`
(registro UserPromptSubmit). Tiempo real: ~40 min. Commit pendiente (autorizado).
