# Histórico — task-pipeline-collision-free-ids-11

## 2026-07-23 — Sesión única (arranque + cierre)

**Resumen.** Documentada la integración GitHub opcional para el usuario: sección "GitHub tracking
(opcional)" en `task-pipeline/README.md` (setup, config, mapeo, ciclo de vida del padre, límites y
riesgos aceptados), enlace desde `docs/guides/task-lifecycle.md`, y mención en los catálogos raíz
(`README.md` + `CLAUDE.md`, T-F).

**Decisiones + porqué.**
- **Honestidad sobre límites** (honesty-rules): Projects jerárquico en public preview, techos 100/8, no
  hay épica nativa, sync best-effort. No se vende robustez que la feature no da.
- **Historia de huérfanas COHERENTE con -10**: "reconciliar ANTES de desactivar" — misma frase que
  `doctor/SKILL.md`. Requisito explícito de la Spec (contar la misma historia).
- **Guía completa en el README** (fuente única) + enlace desde el flujo: no duplicar.
- **Catálogos**: root README (celda del plugin) + CLAUDE.md (arquitectura) mencionan github-tracking y la
  capacidad ampliada de `/doctor` (ids duplicados + reconciliación).

**Verificación (stack `none`).** 7 escenarios por inspección + `grep`: sección README:168-205 (setup/
config/mapeo/padre/límites/riesgos/fuente-de-verdad); T-B y huérfanas coherentes con doctor:105-107;
catálogos (README:11, CLAUDE.md:59-63); enlace con ancla válida (`#github-tracking-opcional`) y ruta
`../../task-pipeline/README.md` existente. **Gate `fact-checker`** (subagente fresco, inherit):
**8/8 VERIFICADO**, 0 INCORRECTO (matiz menor: "sync best-effort" está bajo "Riesgos aceptados", no bajo
"Límites"; el contenido existe).

**Docs actualizadas.** README del plugin (doc de usuario), README raíz + CLAUDE.md (catálogos), enlace en
el flujo. Histórico = este fichero. TSDoc N/A.

**Ficheros/commits.** `task-pipeline/README.md`, `README.md`, `CLAUDE.md`, `docs/guides/task-lifecycle.md`.
Commit `docs: guía de la integración GitHub (README + catálogos + enlace)` con este task-id.

**Tiempo real.** ~30min (estimado 2h).

**Follow-ups.** Última pieza de comportamiento de D2. Queda -06 (release: version bump + CHANGELOG +
`claude plugin validate .`), que cierra el plan.
