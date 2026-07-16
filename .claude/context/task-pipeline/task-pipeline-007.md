# Histórico — task-pipeline-007 (reglas de honestidad @import opt-in + no-duplicación)

> Session log append-only.

## 2026-07-16 — Apertura

- **Gate OK**: `depends_on: []` (sin dependencias) ✓; ninguna tarea `active` al arrancar (006 done) ✓;
  rama `plan/task-pipeline/honesty-and-verification` ✓.
- Diseño fijado por design-review (R2: NO auto-editar el `CLAUDE.md`; "cada turno" vía `@import` opt-in) y
  scenario-coverage (SC-B: doctor reporta honesty-rules.md ausente; SC-C: coding-standards.md user-owned —
  ni bootstrap lo restaura ni doctor lo vigila).
- Estado del repo: **sin `CLAUDE.md`**, **sin `.claude/specs/general/`**, **sin `honesty-rules.md`**.
  `bootstrap.sh` restaura por `cp` `task-lifecycle.md` + `task-pipeline.yml`.

## Plan de ejecución

1. Nueva plantilla `templates/honesty-rules.md` (reglas del owner: verificar símbolo antes de afirmar; "No
   he verificado esto"; no afirmar tests/compilación sin ejecutar; no inventar errores/API/trazas;
   preguntar antes de añadir libs; "No lo sé" > suposición).
2. Nueva plantilla `templates/coding-standards.md` (no-duplicación como coding-standard, user-owned).
3. `bootstrap.sh`: restaurar `.claude/honesty-rules.md` por `cp` si falta (como task-lifecycle); NUNCA
   tocar el `CLAUDE.md`. NO restaurar coding-standards.md (SC-C).
4. `task-init/SKILL.md`: materializar honesty-rules.md (si no existe) + **sugerir** el `@import` (no
   escribir el CLAUDE.md); materializar coding-standards.md como spec general (user-owned).
5. `doctor/SKILL.md`: reportar honesty-rules.md ausente y/o `@import` ausente → **sugerir** (no editar el
   CLAUDE.md); NO vigilar coding-standards.md (SC-C).
6. `templates/README.md`: catalogar las dos plantillas nuevas + política restore/watch.

**Decisión de alcance** (consistente con 006): entrego **plantillas + comportamiento** (task-init/doctor/
bootstrap). NO hand-materializo `.claude/honesty-rules.md` ni `.claude/specs/general/coding-standards.md`
en ESTE repo: el Spec nombra las plantillas y las conductas, no "materializar en este repo"; la propagación
a repos adoptados es de `bootstrap`/`doctor` (SC-B), y este repo es el fixture natural del escenario "repo
adoptado sin honesty-rules.md". Además este repo no tiene `CLAUDE.md`, así que el `@import` no se cablearía
aquí de todos modos. Verificación = `bash -n` + correr `bootstrap.sh` sobre fixtures en /tmp.

## Cierre

### Decisiones + porqué
- **Alcance = plantillas + comportamiento, sin hand-materializar en este repo** (ver arriba). Consistente
  con 006. Este repo es el fixture del escenario "doctor reporta honesty-rules.md ausente" y no tiene
  `CLAUDE.md` donde cablear el `@import`.
- **`coding-standards.md` con plantilla propia** (`templates/coding-standards.md`) en vez de contenido
  improvisado por `task-init`: el plugin desaconseja improvisar contenido; los skills leen semillas con
  `Read`. La no-duplicación va ahí (coding-standard), NO en `honesty-rules.md` (que la disclaima).
- **`bootstrap.sh` solo restaura `honesty-rules.md`** (patrón `cp` de task-lifecycle), NO
  `coding-standards.md` (SC-C: user-owned como testing/security/…). NUNCA toca el `CLAUDE.md` (R2): el
  `@import` es opt-in; el hook solo restaura el fichero.
- **`task-init`/`doctor` SUGIEREN el `@import`, nunca lo escriben**; reforzado en sus "Qué NO hace".
  `doctor` cat. 6 con dos comprobaciones independientes (fichero ausente / `@import` ausente) + salvaguarda
  "sin CLAUDE.md, no lo crees".
- **Ambos catálogos de plantillas** (`templates/README.md` + README del plugin) actualizados para no
  diverger (accuracy > split artificial; paralelo a la sync de 006).

### Verificación corrida + resultado (stack none → fixtures del hook + inspección + gate fact-checker)
- **Fixtures de `bootstrap.sh` en /tmp (5 casos)** → 5/5 verde:
  A (adoptado sin honesty, con CLAUDE.md sin @import): restaura honesty-rules.md, CLAUDE.md byte-idéntico,
  no inyecta @import, no crea coding-standards.md. B (no adoptado): no-op silencioso, no crea nada.
  C (scaffolded completo, honesty ya existe): silencio, no re-copia. D (coding-standards borrado): NO se
  restaura. E (CLAUDE.md sin @import + honesty presente): CLAUDE.md byte-idéntico.
- `bash -n bootstrap.sh` OK.
- **Gate `fact-checker` dogfooded** (subagente general-purpose independiente, inherit): 8 afirmaciones,
  incluida re-ejecución propia de los fixtures A/B → **8/8 VERIFICADO**, 0 INCORRECTO, 0 NO VERIFICABLE.
- Los 11 escenarios Gherkin cubiertos:
  1 (task-init materializa + sugiere @import, no edita CLAUDE.md) ✓ insp. (task-init paso 4 + "Qué NO hace").
  2 (doctor reporta @import ausente sin añadirlo) ✓ insp. (doctor cat. 6-ii).
  3 (hook restaura el fichero) ✓ fixture A.
  4 (hook no re-inyecta en CLAUDE.md) ✓ fixtures A/E.
  5 (no-duplicación = coding-standard, no honesty-rule) ✓ insp. (grep).
  6 (task-init no pisa honesty existente, sigue sugiriendo @import) ✓ insp. ("solo si no existe" + idempotente).
  7 (task-init sugiere @import aunque no haya CLAUDE.md, no lo crea) ✓ insp. (paso 4 "no lo crees ni lo edites tú").
  8 (hook no materializa en repo no adoptado) ✓ fixture B.
  9 (hook no re-copia honesty si ya está, sin reporte) ✓ fixture C.
  10 (doctor reporta honesty ausente y ofrece materializar con diff+aprobación) ✓ insp. (doctor cat. 6-i + Fase 2).
  11 (coding-standards user-owned: no se restaura ni se pisa) ✓ fixture D + insp. (task-init "solo si no existe", doctor "no vigila").

### Docs / ficheros / commit
- Nuevos: `templates/honesty-rules.md`, `templates/coding-standards.md`.
- Editados: `hooks/bootstrap.sh` (restaura honesty), `skills/task-init/SKILL.md` (pasos 4-5 + "Qué NO hace"),
  `skills/doctor/SKILL.md` (Fase 1 cat. 6 + fix seguro + "Qué NO hace"), `templates/README.md` + `README.md`
  (catálogos).
- Commit: `task-pipeline-007: feat: reglas de honestidad (@import opt-in) + no-duplicación`.

### Tiempo real
- ~1h (estimate 2.5h).

### Follow-ups
- **008 (registro/release)**: consume esto. Registrar `honesty-rules.md`/no-duplicación en las superficies
  user-facing del README del plugin (prosa de bootstrap/convención) si procede, CHANGELOG (Added +
  Migration) y contemplar que el hook ahora restaura un fichero más. La frontera con doctor y el bump a
  0.10.0 (referenciado por doctor cat. 5, de 006) también son de 008.
- **Este repo quedará auto-detectable por `doctor` cat. 6** (honesty-rules.md ausente) — intencional
  (fixture). El owner puede correr `/doctor` o `/task-init` para materializarlo cuando quiera.
</content>
