# Histórico — task-pipeline-collision-free-ids-10

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Añadida a `doctor/SKILL.md` la reconciliación best-effort md↔GitHub: nota T-E
("`github-tracking` ausente no es drift") en la categoría 2, nueva **categoría 8 de Fase 1**
(reconciliación, solo con flag on + `gh`) y su tratamiento en Fase 2 (re-proyección desde el `.md`,
aviso para lo no mecánico). Corregida de paso la cabecera de Fase 1 ("cuatro" → sin número).

**Decisiones + porqué.**
- **T-E como nota en categoría 2** (junto a caveman/models): mismo patrón opt-in; su ausencia nunca es
  problema, a lo sumo nicety comentada. Evita el falso positivo que el owner quería descartar.
- **Categoría 8 best-effort declarado (C3)**: honestidad explícita — no promete consistencia; no maneja
  paginación (100 sub-issues/padre), rate-limit ni auth caída; ante duda reporta. Coherente con
  honesty-rules (no sobrevender).
- **Contradicción off↔huérfanas resuelta (opción b)**: con flag off la categoría no corre → regla
  "reconciliar ANTES de desactivar". -11 contará la MISMA historia.
- **Degradación con gracia** en los 4 casos (flag off / sin red / repo no-GitHub / gh sin auth): doctor
  sigue con los checks locales, nunca crashea.
- **Fix de coherencia (fact-checker)**: la cabecera de Fase 1 decía "estas cuatro categorías" (ya stale a
  6 antes; mis -03/-10 la llevaron a 8) → cambiada a "estas categorías" (sin número, no vuelve a quedar
  stale).

**Verificación (stack `none`, skill model-driven).** 11 escenarios por inspección + `grep` (doctor:51-54
T-E; 91-107 categoría 8; 171-175 Fase 2). "Sin falso positivo con flag off" y "no dispara en repo sano"
se sostienen por el gating condicional. Verificación **con GitHub en vivo = NO VERIFICABLE** reproducible
en `stack:none` (reconocido). **Gate `fact-checker`** (subagente fresco, inherit): **9/9 VERIFICADO**
(el e2e en vivo es NO VERIFICABLE a nivel de ejecución; la meta-afirmación es correcta), 0 INCORRECTO.

**Docs actualizadas.** El SKILL ES la doc técnica. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/skills/doctor/SKILL.md`. Commit `feat(doctor): reconciliación
best-effort md↔GitHub` con este task-id.

**Tiempo real.** ~35min (estimado 3h).

**Follow-ups.** -11 documenta la integración para el usuario (setup/mapeo/límites) contando la MISMA
historia de huérfanas (reconciliar antes de desactivar). Con -10 cierra la detección de D2.
