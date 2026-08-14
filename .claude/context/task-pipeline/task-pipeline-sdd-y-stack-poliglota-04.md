# Session log — task-pipeline-sdd-y-stack-poliglota-04

> Histórico append-only. Registro canónico de la tarea.

## 2026-08-14 — Arranque

- **Gate**: `depends_on: []` ✔; rama del plan ✔; sin otra tarea active ✔. Abre el workstream B (#36).
- Tarea 04 movida `pending → active`; GitHub #41 → In progress.
- **Objetivo**: 4 plantillas SDD nuevas en `templates/` (`spec.md` SpecKit+EARS · `caso-de-uso.md`
  Cockburn+Gherkin · `adr.md` MADR 4.0.0 con 5 estados · `adr-index.md` NNNN desde 0001 sin ADR-0000) +
  **lista canónica** de nombres/ubicaciones en `templates/README.md` (para doctor, F7c) + CHANGELOG.
  Gherkin vive solo en el CU (anti-duplicación) con la disciplina de `task.md`.

## 2026-08-14 — Cierre

### Resumen
4 plantillas SDD creadas en `templates/`: `spec.md` (SpecKit+EARS), `caso-de-uso.md` (Cockburn+Gherkin,
único hogar del Gherkin), `adr.md` (MADR 4.0.0, 5 estados), `adr-index.md` (NNNN desde 0001, sin ADR-0000).
`templates/README.md` gana la **lista canónica** SDD (única fuente para doctor). CHANGELOG `### Added`.

### Decisiones + porqué
- **Lista canónica en UNA sección de `templates/README.md`** ("Plantillas SDD (opt-in, features.sdd)"): la
  tarea 07 (doctor) la referencia sin re-enumerar (F7c). Las plantillas SDD **no** se añaden a la tabla de
  plantillas core (son opt-in y gated) → una sola lista, sin duplicar.
- **Gherkin solo en el CU** con nota anti-duplicación + las 5 reglas de disciplina de `task.md` copiadas/
  remitidas: con SDD on el CU es la única fuente, no puede degradar la calidad que hoy exige `task.md` (F3).
- **Sin ADR-0000 relleno**: el índice arranca vacío; la primera decisión real es `0001`. El plugin envía
  plantillas, no contenido (no autogenera specs/CU/ADR de ningún package).
- **5 estados MADR** documentados (no 2) + nota "status fiel a la fuente" (hueco de scenario-coverage).

### Verificación corrida + resultado
- 7 escenarios Gherkin como criterios de aceptación (grep/inspección + `test -f`): cumplidos.
- **Gate `fact-checker`** (subagente fresco, `sonnet`): **9/9 VERIFICADO**, 0 INCORRECTO. Confirma sin
  ADR-0000 (find `*0000*` vacío), Gherkin solo en CU, mapeo de destinos coincidente con cada plantilla.
- Sin identificadores muertos en la superficie nueva.

### Docs actualizadas + motivo
- `templates/spec.md`, `templates/caso-de-uso.md`, `templates/adr.md`, `templates/adr-index.md` (nuevas).
- `templates/README.md` — lista canónica SDD.
- `task-pipeline/CHANGELOG.md` — `### Added`.

### Ficheros / commits · tiempo · follow-ups
- 5 ficheros (4 nuevos + README) + CHANGELOG + arranque/cierre. Commit en la rama del plan.
- Estimado 3h · real ~50m.
- GitHub: #41 In progress → Done/close; padre #37 sigue In progress.
- Follow-ups: tarea 05 (flag `features.sdd`, `depends_on: 04`) y 06 (flujo) consumen estas plantillas y la
  lista canónica; tarea 07 (doctor) referencia la lista.
