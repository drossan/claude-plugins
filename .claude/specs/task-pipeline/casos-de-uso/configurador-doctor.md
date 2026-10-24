# CU-configurador-doctor — Ofrecer `models:` y mantener el schema (`/task-init`, `/doctor`)

- **Ámbito**: skills `/task-init` y `/doctor`
- **Nivel**: objetivo de usuario
- **Actor primario**: usuario que bootstrapea (`/task-init`) o realinea (`/doctor`) un repo
- **Interesados e intereses**:
  - Adoptante — que se le **ofrezca** configurar los modelos sin imponérselos, y que el schema esté al día.
  - Mantenedor — que la oferta no cree "otra copia autoritativa" del contrato ni escriba sin aprobación.

## Precondiciones

- Repo ya adoptado (`/doctor`) o en bootstrap (`/task-init`), con o sin `models:` / schema en su repo.

## Garantía mínima

- Nada se escribe sin **aprobación** del usuario (diff previo), salvo el bootstrap inicial de `/task-init`.
  La ausencia de `models:` **no** es drift duro. Un schema **editado a mano** no se sobrescribe en silencio.

## Garantía de éxito (postcondición)

- Si el usuario acepta, el bloque `models:` queda descomentado con el perfil recomendado; el schema está
  materializado y sincronizado (o se ha respetado su edición manual).

## Disparador

- Corre `/task-init` (bootstrap) o `/doctor` (realineado).

## Escenario principal (éxito)

1. La skill detecta el estado de `models:` (ausente del todo / presente-comentado / activo).
2. Si está **presente-comentado**, **ofrece** (una frase) descomentar el bloque con el perfil recomendado.
3. Si el usuario acepta, descomenta el bloque; si no, no toca nada.
4. La skill comprueba el schema: lo materializa si falta y compara su versión (drift) si existe.

## Extensiones (flujos alternativos y de error)

- **1a.** `models:` **ausente del todo** (ni comentado): `/doctor` **recrea el bloque comentado** (perfil de
  referencia, sin valores activos) con diff + aprobación — acción **distinta** de "ofrecer descomentar".
- **1b.** `models:` **activo** (alguna sub-clave con valor): se trata como **configurado** → no se ofrece
  nada (no dar la lata), aunque otras sub-claves sigan comentadas ("a medias" = configurado).
- **2a.** El usuario **rechaza** la oferta: el bloque sigue comentado; no se escribe nada.
- **4a.** El schema **ya existe y coincide** con el del plugin (misma versión-ancla): **no-op** (no drift).
- **4b.** El schema **falta**: `/task-init` lo materializa en bootstrap (sin aprobación, repo nuevo);
  `/doctor` lo materializa en repo ya adoptado **con diff + aprobación**.
- **4c.** El schema existe pero su **versión-ancla es más vieja** que la del plugin: `/doctor` reporta drift
  y **ofrece** actualizarlo (diff + aprobación).
- **4d.** El schema **difiere pero no por versión** (editado a mano por el consumidor): `/doctor` **reporta**
  la divergencia y **no** sobrescribe (misma regla que para prosa personalizada); ofrece con diff, decide el usuario.
- **1c.** `models:` contiene una **clave espuria** (fase inline `models.grilling`, o inexistente
  `models.qa-fase`): `/doctor` la señala como **posible typo** (no la borra en silencio).

## Reglas de negocio

- **RN-1** — **Sin wizard fase-a-fase**: la oferta es "descomentar el bloque", **una sola** oferta, no un
  cuestionario por fase (evita duplicar la lista de fases en dos skills — la enfermedad que el plan cura).
- **RN-2** — `/doctor` **reconoce** el set ruteable "3 + `sdd-lint` condicional"; la **ausencia** de
  `models:` o de una clave concreta **no** es drift (default = inherit).
- **RN-3** — **Ancla de drift del schema**: como JSON no admite comentarios (el truco `template-version` de
  `honesty-rules.md` no vale), el schema lleva una **clave-ancla** de versión (p.ej. top-level
  `"x-task-pipeline-schema-version": "<ver>"`); `/doctor` compara esa clave con la del plugin.

## Criterios de aceptación (Gherkin)

```gherkin
Feature: Ofrecer models y mantener el schema en task-init/doctor

  Scenario: models presente-comentado → se ofrece descomentar, sin escribir sin aprobación
    Given un repo cuyo task-pipeline.yml tiene el bloque models comentado
    When corre /doctor
    Then ofrece descomentar el bloque con el perfil recomendado
    And no escribe nada hasta que el usuario aprueba

  Scenario: El usuario acepta descomentar
    Given /doctor ha ofrecido descomentar el bloque models
    When el usuario aprueba
    Then el task-pipeline.yml queda con models activo con el perfil recomendado
    And una segunda pasada de /doctor ya no ofrece descomentar

  Scenario: El usuario rechaza la oferta
    Given /doctor ha ofrecido descomentar el bloque models
    When el usuario rechaza
    Then el bloque sigue comentado y no se modifica el fichero

  Scenario: models ausente del todo → recrea el bloque comentado
    Given un repo cuyo task-pipeline.yml no tiene ninguna sección models
    When corre /doctor
    Then ofrece recrear el bloque models COMENTADO (perfil de referencia, sin valores activos) con diff + aprobación

  Scenario: models a medias → se trata como configurado
    Given un task-pipeline.yml con design-review: opus activo y las demás claves comentadas
    When corre /doctor
    Then no ofrece descomentar (se considera configurado)

  Scenario: clave espuria en models → posible typo
    Given un task-pipeline.yml con "models.grilling: opus" (fase inline)
    When corre /doctor
    Then la señala como posible typo y no la borra en silencio

  Scenario: schema sincronizado → no-op
    Given un repo con task-pipeline.schema.json de la misma versión-ancla que el plugin
    When corre /doctor
    Then no reporta drift ni ofrece nada sobre el schema

  Scenario: schema ausente en repo ya adoptado → materializar con aprobación
    Given un repo adoptado sin task-pipeline.schema.json
    When corre /doctor
    Then muestra el diff (fichero nuevo) y solo lo materializa si el usuario aprueba

  Scenario: schema ausente en bootstrap → materializar
    Given un repo nuevo en /task-init
    When corre el bootstrap
    Then materializa el schema y el modeline lo referencia por ruta relativa

  Scenario: schema con versión-ancla vieja → drift, y aceptar lo resuelve
    Given un repo con task-pipeline.schema.json de versión-ancla anterior a la del plugin
    When corre /doctor y el usuario aprueba la actualización
    Then el schema queda igual al del plugin
    And una segunda pasada ya no reporta drift

  Scenario: schema editado a mano → se reporta, no se sobrescribe
    Given un task-pipeline.schema.json que difiere del plugin por edición manual (no por versión)
    When corre /doctor
    Then reporta la divergencia y NO sobrescribe sin decisión explícita del usuario
```
