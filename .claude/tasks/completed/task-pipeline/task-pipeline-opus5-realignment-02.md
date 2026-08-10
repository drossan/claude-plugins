---
id: task-pipeline-opus5-realignment-02
package: task-pipeline
plan: opus5-realignment
status: done
priority: 1
depends_on: [task-pipeline-opus5-realignment-01]
estimate: 3h
actual: 1h
issue: 28
created: 2026-08-09
updated: 2026-08-09
---

# Disciplina hipótesis/evidencia y anti-bucle, con la defensa escrita

## Description

Ataca el clúster de síntomas que **ningún fichero del plugin cubre hoy** y que es el mecanismo del
día perdido reportado: *"se enfoca en síntomas en vez de causa raíz"*, *"dificultades para
distinguir hipótesis de hechos confirmados"*, *"cambia constantemente de teoría sin evidencia"*,
*"loops interminables donde cada arreglo crea otro problema"*.

**Está condicionada.** `design-review` señaló que añadir instrucciones de verificación al fichero de
máxima frecuencia es la trampa que el propio plan cita. Solo se cierra si la defensa se sostiene por
escrito; cualquier regla para la que no se sostenga, se retira.

## Spec

**Sección nueva** en `templates/honesty-rules.md`:
- Etiquetar explícitamente **hipótesis** vs **hecho confirmado**; no presentar la primera como el segundo.
- **No implementar un arreglo sobre un diagnóstico no reproducido**: hace falta salida real que lo demuestre.
- **Tope de intentos sobre el mismo síntoma** → parar, revertir y reportar. El tope es un **número
  concreto escrito en la regla**, no "unos cuantos": sin número no es verificable ni aplicable.
- No afirmar "he revisado X" sin haberlo leído **en esta sesión**. Si el contexto se compactó o la
  sesión se reanudó, esa lectura **no cuenta**: se repite o se etiqueta como no verificada.
- **Causa raíz antes que síntoma**.

**Parar y revertir con trabajo del owner mezclado**: si al alcanzar el tope hay cambios sin
commitear que no son de esta sesión, se **reporta el estado y se pide decisión**; no se descarta
trabajo sin confirmación.

**Presupuesto del fichero**: `honesty-rules.md` se inyecta **cada turno**. La tarea declara un techo
de tamaño para el fichero materializado y, si los bloques de la 01 más esta sección lo exceden, se
recorta **antes** de publicar. El plan declara el coste por turno como trade consciente; esta tarea
le pone número.

**Protección frente a `caveman`** (hueco transversal detectado por QA): `hooks/caveman.sh:66-67`
solo hace backoff en las cuatro fases de checkpoint, y su lista de contenido a preservar **no
incluye** las etiquetas de hipótesis ni el aviso de alcance en una frase. Añadirlas a esa lista y al
README: con `caveman: full`, la compresión no puede borrar justo lo que estas reglas instalan.

**Justificación obligatoria** (entregable; va al session log y a la doc técnica): argumentar por
escrito por qué estas reglas **no** caen bajo *"self-check instructions are the same trap"*. Dos ejes:
1. **Distinción de objeto**: la trampa es **re-verificar trabajo propio ya hecho**; estas reglas
   prohíben **afirmar o actuar sin evidencia**. Apoyo: Anthropic publica un bloque casi idéntico para
   Fable 5 (*"audit each claim against a tool result from this session; only report work you can
   point to evidence for"*).
2. **Coste relativo**: el bucle que previenen cuesta órdenes de magnitud más que la regla.

Si el argumento **no se sostiene para una regla concreta**, esa regla se retira y se registra. Si no
se sostiene para **ninguna**, la tarea se cierra **sin cambio** y el ancla no se mueve por ella.

**`skills/doctor/SKILL.md`**: la sección entra en la comparación de anclas que provee la tarea 01 —
sin grep propio. Al ir en el mismo release que la 01, **comparten ancla**.

## Scenarios (Gherkin)

```gherkin
Feature: Disciplina hipótesis/evidencia entregada, acotada y defendida

  Scenario: La sección llega a un repo nuevo
    Given un repo sin la convención del plugin
    When se bootstrapea el repo con /task-init
    Then el honesty-rules.md materializado contiene la sección de hipótesis y evidencia
    And contiene el tope de intentos expresado como número concreto

  Scenario: La sección llega a un repo ya adoptado
    Given un repo adoptado cuyo honesty-rules.md tiene un ancla anterior
    When se ejecuta /doctor
    Then reporta el drift usando la comparación de anclas de la tarea 01
    And ofrece el fix con diff y aprobación

  Scenario: Ambas secciones del release comparten ancla
    Given que la tarea 01 fijó el ancla de la plantilla en este release
    When esta tarea añade su sección en el mismo release
    Then el ancla no cambia respecto a la que fijó la tarea 01
    And /doctor detecta ambas secciones con el mismo mecanismo

  Scenario Outline: El tope de intentos es verificable
    Given una sesión con <n> intentos de arreglo sobre el mismo síntoma sin causa reproducida
    When se evalúa la regla
    Then el comportamiento esperado es <resultado>

    Examples:
      | n       | resultado                  |
      | tope-1  | puede intentar uno más     |
      | tope    | para, revierte y reporta   |
      | tope+1  | violación de la regla      |

  Scenario: Tope alcanzado con trabajo sin commitear del owner
    Given una sesión que alcanza el tope con cambios no commiteados ajenos a la sesión
    When aplica la regla de parar y revertir
    Then reporta el estado y pide decisión al owner
    And no descarta trabajo sin confirmación

  Scenario: Reanudación tras compactación de contexto
    Given una sesión reanudada cuyo contexto original fue compactado
    When el modelo va a afirmar "he revisado X"
    Then repite la lectura, o la etiqueta como no verificada en esta sesión

  Scenario: La compresión no borra la etiqueta de hipótesis
    Given features.caveman en modo full y estas reglas en vigor
    When el modelo responde con una hipótesis no confirmada
    Then la etiqueta de hipótesis y el aviso de alcance sobreviven a la compresión

  Scenario: El fichero de cada turno respeta su techo
    Given honesty-rules.md con los bloques de la tarea 01 y esta sección
    When se mide el fichero materializado
    Then su tamaño está dentro del techo declarado
    And si lo excede, se recorta antes de publicar

  Scenario: Cada regla publicada tiene su defensa escrita
    Given la sección redactada
    When se revisa antes de cerrar la tarea
    Then cada regla tiene un argumento escrito de por qué no es sobre-verificación
    And el argumento cubre la distinción de objeto y el coste relativo

  Scenario: Una regla sin defensa no se publica
    Given una regla candidata para la que el argumento no se sostiene
    When se redacta la justificación
    Then la regla se retira de la sección
    And la retirada queda registrada con su motivo

  Scenario: Ninguna regla supera la justificación
    Given que el argumento no se sostiene para ninguna de las reglas candidatas
    When se cierra la tarea
    Then no se publica ninguna sección nueva
    And la tarea se cierra como "sin cambio" con las retiradas registradas
    And el ancla no se mueve por esta tarea
```

## Provides

- La sección de hipótesis/evidencia en `templates/honesty-rules.md` (o su ausencia justificada).
- El **argumento escrito** de por qué las reglas de honestidad del plugin no son sobre-verificación
  — la tarea 05 lo enlaza desde el README.
- La lista de contenido protegido de `caveman` ampliada.

## Definition of Done

- [x] Tests escritos ANTES de la implementación (TDD) — **N/A**: stack `none`, sin runner
- [x] Cada escenario Gherkin tiene al menos un test — **N/A**: verificación por inspección / ejecutando skill y hook
- [x] Todos los escenarios verificados: **6 ejecutados** (4 casos reales de `caveman.sh`/`bootstrap.sh` + techo + tope) y el resto por inspección
- [x] El tope de intentos está escrito como número concreto — **3** (`templates/honesty-rules.md:37`)
- [x] El techo de tamaño está declarado (**7 000 B / 110 líneas**) y el materializado lo respeta: **6 191 B / 93 líneas**, margen 809 B
- [x] `bash -n hooks/caveman.sh` tras tocarlo — OK, + JSON-safety de las dos directivas (sin `"` ni `\\`)
- [x] **Cada regla publicada tiene su defensa escrita** — tabla regla a regla en `docs/honestidad-no-es-sobre-verificacion.md`. **0 retiradas por la defensa**; la 5ª (*causa raíz*) **absorbida** en la 2ª, con su motivo registrado (no verificable suelta + redundante)
- [x] Spec cumplida; lo declarado en `Provides` disponible
- [x] Lint / format / typecheck — **N/A** (Markdown + Bash)
- [x] Gate de mutation testing — **N/A**: `stack.mutation-tool: none`
- [x] Gate de `fact-checker` superado · **no-negociable, sin flag** — 12 VERIFICADO / 0 INCORRECTO / 0 NO VERIFICABLE
- [x] Proyección de estado a GitHub al cerrar — `issue: 28` · `features.github-tracking: enabled`
- [x] Documentación — tres capas:
  - [x] Doc en el código — **N/A** (Markdown + Bash)
  - [x] Doc técnica — `task-pipeline/docs/honestidad-no-es-sobre-verificacion.md` (nuevo) + README (contenido protegido)
  - [x] Histórico — session log en `.claude/context/task-pipeline/task-pipeline-opus5-realignment-02.md`
- [x] Docs de dev / usuario final — se consolidan en la tarea 05
