# Session log — task-pipeline-sdd-validation-gate-04

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque + Cierre

- **Gate**: `depends_on: [01]` done ✔; rama del plan ✔. Tarea 04 → active → done; GitHub #55 In progress → Done.

### Resumen
`/doctor` declara el invariante **"las plantillas SDD pasan su propio lint"** (P7); `spec.md` **reescrito**
(Opción C: describe el marcador de aclaración pendiente sin instanciar el literal `[NECESITA ACLARACIÓN`);
`adr.md` clarifica "MADR = *Markdown Architectural Decision Records*". Verificado: 0 "MADR Any" shipeado.

### Bug encontrado y corregido (en 01/02, cerradas)
- Correr `/sdd-lint` sobre las **propias plantillas** (que es el punto de `checkTemplate`) destapó que el
  check de ids `(FR|SC)-[0-9]+` daba **falsos positivos**: `NFR-001` (contiene `FR-001`) y la notación
  placeholder `FR-00x` (matchea `FR-00`). **Corregido con `\b`** (frontera de palabra, portable BSD/GNU) en
  `scripts/sdd-lint.sh` (tarea 02) **y** en la skill `sdd-lint/SKILL.md` (tarea 01). Verificado ejecutando:
  la plantilla ahora pasa (exit 0) y los fixtures siguen 0/2×5.
- **Por qué se cambian ficheros de tareas cerradas**: el bug lo destapa `checkTemplate` (tarea 04) y afecta a
  la fuente única de reglas (skill 01) + su réplica (helper 02); arreglarlo aquí es lo coherente. Va en el
  commit de la 04 con nota.

### Decisiones + porqué
- **Opción C (reescribir plantilla)** — decisión del owner en scenario-coverage: la plantilla describe el
  marcador en prosa (sigue enseñando la convención) sin el literal matcheable; un artefacto real que escriba
  `[NECESITA ACLARACIÓN: pregunta]` **sí** bloquea.
- **Fix MADR = no-op de corrección** (la superficie shipeada nunca dijo "Any"; el "Any" solo estaba en el
  plan-stub/research). Se añade la clarificación "Architectural" a `adr.md` por exactitud (MADR revirtió).

### Verificación + resultado
- 4 escenarios Gherkin como criterios de aceptación: cumplidos (plantillas pasan el lint, SDD off no evalúa,
  MADR corregido, plugin-owned solo-reporte).
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **8/8 VERIFICADO** — el verificador **ejecutó** el
  script (plantilla pasa exit 0; `\b` evita NFR-001/FR-00x; fixtures 0/2×5).
- Sin identificadores muertos.

### Docs · tiempo · siguiente
- `templates/spec.md` (reescrito), `templates/adr.md` (MADR), `scripts/sdd-lint.sh` + `sdd-lint/SKILL.md`
  (fix `\b`), `doctor/SKILL.md` (cat. 9 P7), `CHANGELOG.md` (### Added + ### Fixed).
- Estimado 2h · real ~1h. Siguiente: tarea 05 (release + cierre del plan).