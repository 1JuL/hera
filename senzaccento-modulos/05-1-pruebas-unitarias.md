# 05.1 Pruebas Unitarias

**Tipo:** plan de desarrollo para un agente.
**Entregable del cronograma:** testeo de lógica interna y funciones críticas.
**Leer antes:** `00-CONTEXTO.md`, `04-2-implementacion-core.md`.
**Requisitos cubiertos:** RNF-06, RNF-07, RNF-09, y la corrección de RF-02, RF-03, RF-04, RF-06.

## Alcance

| Capa | Herramienta | Qué se prueba |
|---|---|---|
| Motor de reglas y mapa (`src/engine`) | Vitest | Evaluación de reglas, puntuación, filtros, determinismo, generación del mapa |
| Parsers de archivos | Vitest + archivos de ejemplo | Extracción de señales de PDF, XLSX, DOCX y CSV |
| Esquemas y formularios | Vitest + Testing Library | Validaciones Zod, navegación por pasos, guardado de borrador |
| Utilidades del cliente | Vitest | Normalización de teléfono E.164, mapeo de errores a mensajes sencillos |
| Esquema y RLS de Postgres | pgTAP (`supabase test db`) | Políticas de acceso, RPC, constraints |
| Edge Functions | `deno test` | Validación de JWT, cuota, saneamiento de contexto, selección y respaldo de proveedor LLM |

Las llamadas a Gemini, Groq, SMTP y SMS se simulan siempre. Las pruebas unitarias no consumen cuotas ni envían mensajes reales.

## Plan de desarrollo

### Fase 1. Infraestructura

1. Configurar Vitest (`jsdom`, `globals`, `setupFiles`) y cobertura con `@vitest/coverage-v8`.
2. Script `npm run test:coverage`. Umbrales mínimos en `vite.config.ts`: `src/engine` 90 % de líneas y 85 % de ramas; resto del código 60 % de líneas.
3. Carpeta `src/test/fixtures/` con catálogo, reglas y formulario pequeños y determinísticos, y archivos de muestra (un PDF con texto, un XLSX de ventas, un DOCX, un CSV).
4. Carpeta `supabase/tests/` para pgTAP y `supabase/functions/**/*.test.ts` para Deno.
5. Workflow `ci.yml` que corre lint, typecheck, Vitest con cobertura y `supabase test db` en cada pull request.

### Fase 2. Motor de reglas (prioridad máxima)

Casos mínimos para `recommend()`:

1. Cada operador de condición (`eq`, `neq`, `in`, `contains`, `not_contains`, `gte`, `lte`) y combinador (`all`, `any`, `not`), con casos verdadero, falso y valor ausente.
2. Suma de pesos y normalización del puntaje de área entre 0 y 1.
3. Fórmula de afinidad con valores calculados a mano (al menos 5 casos con resultado esperado documentado).
4. Filtro por sector, tamaño y recursos: una tecnología fuera del perfil nunca aparece.
5. Mínimo de tres tecnologías por área cuando el catálogo las tiene; menos cuando no.
6. Al menos dos áreas prioritarias cuando las respuestas lo permiten; caso con una sola área activada.
7. Cada recomendación trae `rationale` no vacío y `rule_ids`.
8. Determinismo: 100 ejecuciones con el mismo input producen resultados idénticos (incluido el orden).
9. Empates: el desempate es estable (por `slug`).
10. Entradas inválidas (respuestas faltantes, reglas con operador desconocido) devuelven error tipado, no excepción no controlada.
11. Perfiles de referencia (3 o más negocios ficticios de sectores distintos) con resultado esperado revisado por el equipo ("pruebas de oro"). Cualquier cambio en reglas o catálogo que altere estas salidas obliga a actualizarlas de forma explícita.

Casos mínimos para `buildMap()`: un nodo `business`; un nodo por área prioritaria; aristas `has_need`, `involves`, `optimized_by` coherentes; ninguna arista huérfana; IDs únicos.

### Fase 3. Parsers, esquemas y formularios

1. Parsers: cada formato devuelve las señales esperadas; archivo vacío, corrupto, de más de 10 MB o de tipo no permitido produce un error claro y no se queda cargando.
2. Los parsers no realizan llamadas de red (prueba que falla si se invoca `fetch`).
3. Zod: negocio, respuestas y feedback aceptan válidos y rechazan inválidos con mensajes en español.
4. Formulario por pasos: avanzar, retroceder, guardar borrador al cambiar de paso, no permitir enviar con un área obligatoria sin responder.
5. Utilidades: normalización de teléfonos colombianos (`3001234567`, `+57 300 123 4567`, `573001234567`).

### Fase 4. Base de datos (pgTAP)

1. Para cada tabla de usuario: el usuario A no puede `select`, `update` ni `delete` filas de B; un usuario anónimo no ve nada.
2. Catálogo (`technologies`, `rules`, `form_versions`): lectura autenticada permitida, escritura por un usuario normal denegada.
3. `submit_diagnostic`: éxito en `draft`; `409` si ya fue enviado; error si el diagnóstico es de otro usuario; error si falta un área obligatoria; inserta las `recommendations` y marca `submitted` en una sola transacción (falla a medias = nada persiste).
4. Un diagnóstico `submitted` no admite `update` de `answers`.
5. `usage_counters` no es accesible con rol `authenticated`.
6. Trigger de creación de `profiles` al registrar un usuario.
7. `feedback`: un usuario inserta pero no lee; un admin lee.

### Fase 5. Edge Functions (Deno)

1. `assistant-chat`: rechaza sin JWT (`401`); rechaza el mensaje 21 en un minuto (`429`); no acepta contenido vacío ni de más de 1000 caracteres.
2. El payload que se envía al proveedor no contiene correo, nombre ni teléfono (usar un usuario de prueba con datos reconocibles y buscarlos en el payload).
3. Respaldo: con proveedor principal simulado en `429`, `500` y timeout, se usa el secundario; con ambos fallando, `502`.
4. `delete-account` borra filas y usuario; `export-my-data` devuelve solo datos del solicitante.
5. `notify-feedback` rechaza sin `x-webhook-secret` correcto.

## Criterios de aceptación

- [ ] `npm test` ejecuta todas las pruebas de Vitest en menos de 60 segundos y pasa.
- [ ] `supabase test db` y `deno test` pasan.
- [ ] Cobertura de `src/engine` mayor o igual a 90 % de líneas y 85 % de ramas; el CI falla si baja.
- [ ] Existen al menos 3 pruebas de oro de `recommend()` con perfiles de sectores distintos.
- [ ] Existe una prueba automática por cada tabla de usuario que confirma el aislamiento por RLS.
- [ ] Existe una prueba que demuestra que el contexto enviado al LLM no contiene datos personales.
- [ ] Ninguna prueba llama a servicios externos reales ni requiere claves.
- [ ] El CI corre todas las suites en cada pull request y bloquea el merge si alguna falla.
- [ ] Cada bug corregido durante QA añade una prueba que lo reproduce.

## Convenciones

- Archivos `*.test.ts` junto al código que prueban.
- Nombres de prueba en español describiendo el comportamiento: `"no recomienda tecnologías fuera del sector declarado"`.
- Un caso por prueba. Datos de entrada mínimos y legibles.
- Sin dependencia de la hora ni del azar (fijar fecha y semilla).
