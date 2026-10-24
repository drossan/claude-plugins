# Session log — task-pipeline-model-routing-per-phase-05

## 2026-08-18 — Arranque

- `depends_on: [01, 02, 03, 04]` → las 4 están `done`. Sin bloqueo.
- Tarea movida a `.claude/tasks/active/task-pipeline/task-pipeline-model-routing-per-phase-05.md`,
  `status: active`. GitHub #72 → In progress.
- Alcance: `/task-init` materializa el schema en bootstrap; `/doctor` reconoce el set ruteable completo,
  detecta los 3 estados de `models:` (ofrecer descomentar / recrear comentado / configurado), señala
  claves espurias como posible typo, materializa el schema si falta y detecta su drift por clave-ancla.
  Sin wizard fase-a-fase. Actualizar `skills/doctor/SKILL.md` y documentar en el README.

## 2026-08-18 — Cierre

### Resumen

`/task-init` (Paso 3b) materializa `.claude/task-pipeline.schema.json` en bootstrap, sin aprobación (repo
nuevo, igual que el resto del Paso 1). `/doctor` reescrito en categoría 2 (tres estados de `models:` +
clave espuria = posible typo) y nueva categoría 11 (schema: materializar si falta / drift por
`x-task-pipeline-schema-version` / reportar sin sobrescribir si es edición manual). README del plugin
actualizado (fila `/doctor`, tabla de plantillas).

### Decisiones técnicas + porqué

- **Regla de comparación de la clave-ancla, precisada tras verificación**: la primera redacción de la cat.
  11 decía "más vieja" sin definir el algoritmo. Un subagente de verificación (fixture
  `manual-edit-schema`, ancla `"1.0.0-custom"`) señaló la ambigüedad (semver-aware vs comparación de
  string). Se resolvió explícitamente: **"más vieja" solo si ambas anclas son SemVer estricto
  (`MAJOR.MINOR.PATCH`, sin sufijo)** y la del repo es menor; cualquier sufijo (`-custom`, `-rc1`) es señal
  de edición manual, nunca de versión antigua (el plugin no emite sufijos en su propia ancla). Ante la
  duda, la regla prefiere "editada" sobre "más vieja" — sobrescribir un schema personalizado es el error
  más caro de los dos.
- **`models:` sin wizard**: cada estado detectado (ausente/comentado/activo) tiene una única acción
  determinista, no una elección del usuario — se corrigió también el ejemplo de la Fase 2 (paso 1) que
  antes citaba `models:` como caso de "varias opciones", lo cual ya no aplica.
- **Tabla de plantillas del README**: en la tarea 03 se decidió **no** añadir la fila del schema porque su
  materialización automática no existía todavía; ahora que `/task-init`/`/doctor` la implementan, la fila
  se añade (consistente con el resto de filas: "qué se materializa y dónde").

### Verificación corrida + resultado

- **CU-configurador-doctor, corriendo la lógica de `doctor`** (Fase 0/1) contra **7 fixtures sintéticos**
  bajo `/tmp/doctor-fixtures/` (el skill opera sobre "el repo" de la sesión sin parámetro de ruta, así que
  se delegó a un subagente que las construyó y las recorrió con Read/Bash sobre rutas absolutas,
  siguiendo literalmente el `SKILL.md` actualizado):
  1. `no-models` (sin sección `models:`) → **coincide**: ofrece recrear el bloque comentado.
  2. `commented-models` (bloque 100% comentado) → **coincide**: ofrece descomentar.
  3. `active-models` (`design-review: opus` activo, resto comentado) → **coincide**: configurado, no ofrece nada.
  4. `spurious-key` (`models.grilling` + `models.qa-fase`) → **coincide**: ambas señaladas como posible typo.
  5. `no-schema` (repo adoptado sin schema) → **coincide**: ofrece materializarlo.
  6. `old-schema` (ancla `0.9.0` vs `1.0.0` del plugin) → **coincide**: drift, ofrece actualizar.
  7. `manual-edit-schema` (ancla `1.0.0-custom` + campo extra) → **coincide** en el resultado (reporta, no
     sobrescribe); señaló la ambigüedad de mecanismo que se corrigió en la redacción (ver arriba).
  **7/7 escenarios verificados**, 1 corrección de redacción aplicada tras el hallazgo.
- **Gate `sdd-lint`**: ningún fichero bajo `.claude/specs/` cambió en esta tarea → resultado de la tarea 01
  sigue vigente por invarianza.
- **Gate `fact-checker`**: 6/6 VERIFICADO.

### Documentación actualizada (rutas + motivo)

- `task-pipeline/skills/doctor/SKILL.md` — categoría 2 reescrita (3 estados + clave espuria), nueva
  categoría 11 (schema), ajustes en Fase 2 (ejemplo + "Fixes seguros típicos" + nuevo párrafo de drift).
- `task-pipeline/skills/task-init/SKILL.md` — nuevo Paso 3b (materializar el schema en bootstrap).
- `task-pipeline/README.md` — fila `/doctor` actualizada; fila del schema añadida a "Plantillas".
- **SDD**: sin cambios de spec/CU (el CU-configurador-doctor ya existía; esta tarea lo consume).

### Ficheros / commits

3 ficheros de skill/doc modificados + este session log. Commit de cierre pendiente.

### Tiempo real

~1h 15min (estimate: 5h).

### Follow-ups

- Ninguno nuevo.
