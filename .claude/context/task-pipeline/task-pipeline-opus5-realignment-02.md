# Session log — task-pipeline-opus5-realignment-02

> Append-only. Sección de hipótesis/evidencia y anti-bucle en `templates/honesty-rules.md`, con la
> justificación escrita como condición de publicación, techo de tamaño y protección frente a `caveman`.

## 2026-08-09 — Arranque

- Gate OK: `depends_on: [01]` en `completed/` ✓; rama del plan ✓; única tarea `active` ✓.
- Proyección GitHub: **#28** → Project `In progress` + label + assignee.
- Stack `none`: TDD/mutation **N/A**; gate `fact-checker` **sí**.

## 2026-08-09 — La justificación (se escribe ANTES de publicar, es la condición)

Entregable en **`task-pipeline/docs/honestidad-no-es-sobre-verificacion.md`** (fichero nuevo, dentro del
plugin, para que la tarea 05 lo enlace desde el README).

**Hallazgo que refuerza la defensa por encima de lo que suponía el plan.** La Spec citaba un solo apoyo
(el bloque de Fable 5 *"audit each claim…"*). Verificado en la fuente: hay **dos**, y el segundo es más
directo todavía.

| Línea de `model-migration.md` | Cita | Qué respalda |
|---|---|---|
| `:1456` | *"Before reporting progress, **audit each claim against a tool result from this session**. Only report work you can point to evidence for; if something is not yet verified, say so explicitly."* | etiquetar hipótesis; «he revisado X» solo en esta sesión |
| `:1454` | *"in testing this **nearly eliminated fabricated status reports**"* | eficacia medida, no opinión |
| `:1460` | *"…**check that the evidence actually supports that specific action. A signal that pattern-matches to a known failure may have a different cause.**"* | **es** la regla del diagnóstico no reproducido, publicada |

El argumento tiene dos ejes, desarrollados en el doc:

1. **Distinción de objeto.** La trampa (`:1064`, `:1066`) es **una pasada adicional sobre trabajo ya
   hecho** («double-check your answer», «usa un subagente para verificar»). Nuestras reglas **no añaden
   pasada**: acotan qué se puede **afirmar o hacer la primera vez**. Si toda regla de evidencia cayera
   bajo la trampa, la guía se contradiría a sí misma dentro del mismo fichero — y no lo hace.
   Segundo motivo, específico de Opus 5: la guía dice que **verifica su propio trabajo** sin que se lo
   pidan; de ahí **no** se sigue que se abstenga de **actuar sobre una hipótesis no reproducida**. Son
   comportamientos distintos, y el segundo es el que motivó el plan.
2. **Coste relativo.** Estas reglas no lanzan subagentes ni añaden fases: su coste es su tamaño, una vez
   por turno — por eso llevan techo medible. Enfrente, el bucle que previenen costó **un día**. Es el
   mismo cálculo coste/beneficio que hace la guía para borrar el scaffolding; cambia el resultado.

**Salvedad honesta escrita en el doc**: `:1456` y `:1460` están publicadas en la sección de **Fable 5**,
no en la de Opus 5. No se afirma que Anthropic las prescriba para Opus 5. Soportan un peso menor y más
seguro: en la taxonomía de Anthropic, **una regla de evidencia no es una instrucción de
auto-verificación**. Además este fichero se materializa en repos que pueden correr cualquier modelo.

### Veredicto regla a regla — 4 publicadas, 1 absorbida, 0 retiradas por la defensa

| Regla | Veredicto |
|---|---|
| Etiquetar hipótesis vs hecho confirmado | **publicada** |
| No implementar sobre diagnóstico no reproducido | **publicada** (respaldo directo `:1460`) |
| Tope de intentos | **publicada** — no añade pasada, **retira** intentos: es un cortacircuitos |
| «He revisado X» solo en esta sesión | **publicada** (`:1456` casi literal) |
| **Causa raíz antes que síntoma** | **ABSORBIDA** en la regla del diagnóstico, como su frase final *«arregla la causa que reprodujiste, no el síntoma que viste»* |

**Motivo de la absorción, registrado**: no falla la defensa (no es sobre-verificación). Falla por otra
vía: **no es verificable como regla aparte** —¿quién decide qué es «la raíz»?— y, una vez exiges
reproducir la causa, es **redundante**. Publicarla suelta habría sido acretar una regla vaga en un
fichero que se lee cada turno, justo lo que el criterio de admisión de la tarea 01 existe para impedir.
Su contenido operativo **sí se entrega**, dentro de la regla que sí es verificable.

## 2026-08-09 — Techo de tamaño (el número que pedía la Spec)

- **Techo: 7 000 bytes / ~110 líneas** del fichero materializado, medido con `wc -c`.
- Trazabilidad real: **1 698 B** antes del plan → **5 097 B** tras la 01 → **6 191 B / 93 líneas** ahora.
  **Margen restante: 809 B.**
- El número es un **juicio declarado como tal**, elegido para que **ate**: dejaba a esta tarea menos de
  2 000 B, así que obligó a redactar corto. Superarlo no es motivo para subir el techo, sino para
  recortar o mover la regla a un coding-standard.

## 2026-08-09 — Verificación de los escenarios

**Ejecutados** (hooks Bash reales):

| Escenario | Resultado |
|---|---|
| La sección llega a un repo nuevo/adoptado (vía hook) | ✅ `bootstrap.sh` restaura el fichero **idéntico a la plantilla**, con `## Hipótesis y evidencia` y `Tope de 3 intentos` |
| La compresión no borra la etiqueta de hipótesis | ✅ `caveman.sh` con `full` + fase normal inyecta JSON válido que preserva las 4 piezas: etiqueta de hipótesis, aviso de alcance, «no verificado», y lo que quede sin hacer |
| (borde) checkpoint → sin inyección | ✅ output vacío con `attributionSkill: fact-checker` |
| (borde) repo no adoptado → no-op | ✅ output vacío, 0 ficheros |
| El fichero respeta su techo | ✅ 6 191 B ≤ 7 000 B; 93 ≤ 110 líneas |
| El tope de intentos es número concreto | ✅ `Tope de 3 intentos` (`grep -o`) |

`bash -n caveman.sh` OK. Comprobado además que las dos directivas siguen **sin comillas dobles ni
backslashes** (requisito de seguridad JSON del propio hook): 458 y 428 caracteres, limpias.

**Por inspección**:

| Escenario | Evidencia |
|---|---|
| Outline del tope (tope-1 / tope / tope+1) | la regla fija **3** y ordena parar **al llegar**, no después: `tope-1`=puede intentar uno más, `tope`=para+revierte+reporta, `tope+1`=violación |
| Tope con trabajo sin commitear del owner | *"Si al revertir hay cambios sin commitear que no son de esta sesión, no descartes nada: reporta el estado y pide decisión"* |
| Reanudación tras compactación | *"Si el contexto se compactó o la sesión se reanudó, esa lectura no cuenta"* |
| Drift en repo adoptado / ambas secciones comparten ancla | el ancla sigue en **0.14.0** (no la mueve esta tarea): `doctor` detecta ambas secciones con el **mismo** mecanismo de la 01, **sin grep propio** — verificado que `doctor/SKILL.md` no menciona «hipótesis» |
| Cada regla tiene su defensa escrita | tabla regla a regla en `docs/honestidad-no-es-sobre-verificacion.md` |
| Una regla sin defensa no se publica / ninguna la supera | mecanismo ejercitado de verdad con la 5ª regla (absorbida, con motivo registrado). El caso «ninguna supera» no se dio: 4 de 5 pasan con respaldo publicado |

**Límite honesto**, igual que en la 01: la instalación cacheada del plugin es **0.13.0**, así que
`/task-init` y `/doctor` no se pueden ejercitar con el código editado hasta el release de la tarea 05.
Los escenarios que los nombran se verifican por inspección del `SKILL.md` y por el `cp` del hook, que
usa el mismo fichero.

## 2026-08-09 — Cierre de la tarea

### Resumen
Publicada `## Hipótesis y evidencia` en `templates/honesty-rules.md` con 4 reglas (etiquetar hipótesis ·
no implementar sobre diagnóstico no reproducido · tope de **3** intentos con parada, reversión y
protección del trabajo ajeno · «he revisado X» solo en esta sesión). La 5ª candidata se **absorbe** en
la 2ª con su motivo registrado. Entregada la **justificación escrita** como documento del plugin,
enlazable desde el README en la 05. Declarado un **techo de 7 000 B** para el fichero de cada turno, con
trazabilidad. Ampliada la lista de **contenido protegido de `caveman`** en el hook y en el README, para
que la compresión no pueda borrar justo lo que estas reglas instalan.

### Decisiones técnicas + porqué
- **La justificación se escribió antes de la sección**, no después: era la condición de publicación, y
  redactarla al revés la habría convertido en racionalización.
- **La 5ª regla se absorbe, no se retira por la defensa.** Distinguirlo importa: retirarla por
  «sobre-verificación» habría sido falso. Se cae por no ser verificable suelta y ser redundante.
- **El techo se expresa en bytes**, no en «sé breve»: un techo que no se puede medir no es un techo.
- **`caveman` se toca en el hook Y en el README**, con la regla de mantenimiento escrita: toda regla
  futura que dependa de **aparecer en la respuesta** debe añadirse a la lista protegida.
- **`doctor` no se toca**: la Spec pedía explícitamente reutilizar la comparación de anclas de la 01 sin
  grep propio. Verificado que no hace falta ningún cambio.

### Verificación corrida + resultado
- `bootstrap.sh` y `caveman.sh` ejecutados de verdad (4 casos); `bash -n` en el hook tocado; JSON-safety
  de las directivas comprobada.
- Techo: **6 191 B / 93 líneas** contra 7 000 B / 110.
- `fact-checker` (subagente fresco `general-purpose`, inherit): **12 VERIFICADO · 0 INCORRECTO ·
  0 NO VERIFICABLE**. Comprobó las cinco citas literales **y en qué sección cae cada una** (`## Migrating
  to Claude Opus 5` = 902-1140 → `:1064`, `:1066`; `## Migrating to Claude Fable 5` = 1292-1525 →
  `:1454`, `:1456`, `:1460`), confirmando que la salvedad del doc es exacta. Ejecutó él mismo los tres
  casos de `caveman.sh` y la restauración de `bootstrap.sh`.
- TDD y mutation: **N/A** (`stack: none`).

### Docs actualizadas
- `task-pipeline/docs/honestidad-no-es-sobre-verificacion.md` (**nuevo** — la justificación).
- `task-pipeline/skills/plan-task/templates/honesty-rules.md` (sección nueva).
- `task-pipeline/hooks/caveman.sh` + `task-pipeline/README.md` (contenido protegido).
- `.claude/honesty-rules.md` (re-materializado: este repo también es consumidor).

### Tiempo real
~1h (estimate 3h).

### Follow-ups
- **Tarea 05**: enlazar `docs/honestidad-no-es-sobre-verificacion.md` desde el README; si el release no
  es 0.14.0, mover el ancla (una sola vez, cubre 01 y 02).
- El techo de 7 000 B deja **809 B** de margen. Cualquier regla futura entra ahí o desplaza a otra.
