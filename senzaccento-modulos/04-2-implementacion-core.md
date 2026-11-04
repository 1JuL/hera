# 04.2 Implementación Core

**Tipo:** plan de desarrollo para un agente.
**Entregable del cronograma:** funcionalidades críticas programadas.
**Leer antes:** `00-CONTEXTO.md`, `04-1-entorno-dev-setup.md` y el documento "Hera - Diseño de APIs y Webhooks" (v2).
**Requisitos cubiertos:** RF-01 a RF-10, RNF-01, RNF-02, RNF-05, RNF-06, RNF-07, RNF-09. Historias: HU1 a HU4, HU8, HU9, HU11, HU5 parcial.

## Alcance

Incluye: esquema de base de datos con RLS, autenticación y consentimiento, perfil del negocio, formulario de diagnóstico, motor de recomendación, mapa de oportunidades, guía paso a paso, asistente (interfaz y Edge Function con proveedor simulado), panel de estadísticas, contacto por WhatsApp.

No incluye: llamadas reales a Gemini/Groq, SMTP, SMS y OAuth (módulo `04-3`); HU6, HU7, HU10.

## Plan de desarrollo

Cada fase termina con un PR revisado y pruebas pasando.

### Fase 1. Base de datos y seguridad

1. Migración `0001_core.sql` con las tablas de la sección 4 del documento de API: `profiles`, `consents`, `businesses`, `document_summaries`, `form_versions`, `diagnostics`, `technologies`, `rules`, `recommendations`, `guide_progress`, `conversations`, `messages`, `usage_counters`, `feedback`, `assistant_cache`.
2. RLS activo en todas. Políticas de propietario (`user_id = auth.uid()`) y de catálogo de solo lectura. Función `is_admin()`.
3. Trigger en `auth.users` que crea la fila de `profiles`.
4. Vista `v_catalog_for_business`.
5. RPC `submit_diagnostic` y `my_stats` (ver contratos en la sección 5.3 del documento).
6. Seed en `supabase/seed/`: formulario v1, catálogo y reglas (ver "Contenido del catálogo").
7. `npm run db:types` para generar `src/types/database.ts`.

### Fase 2. Autenticación y consentimiento (RNF-06)

1. Rutas públicas: `/login`, `/registro`, `/recuperar`. Rutas protegidas bajo un `AuthGuard`.
2. Registro con correo y contraseña, y botones de Google y Facebook (la configuración del proveedor se hace en `04-3`).
3. Pantalla de consentimiento previa al primer acceso: texto del aviso, casilla sin marcar por defecto, registro en `consents` con la versión vigente. Sin consentimiento no se accede a ninguna pantalla de datos.
4. Pantalla de verificación de celular (opcional) con campo de teléfono y código OTP. Deja listo el flujo; funciona con números de prueba en local.
5. Hook `useSession` y store de Zustand para el usuario.

### Fase 3. Perfil del negocio y carga de archivos (RF-01)

1. Formulario de negocio: nombre, sector, tamaño, empleados, municipio, nivel de recursos, canales. Validación con Zod.
2. Pantalla de carga: acepta PDF, XLSX, DOCX y CSV de hasta 10 MB.
3. Parsers en `src/engine/parsers/` (`parseFile(file): Promise<BusinessSignals>`) con PDF.js, SheetJS, mammoth.js y PapaParse. Todo corre en el navegador.
4. El usuario ve el resumen extraído, edita o descarta campos y aprueba antes de guardar en `document_summaries`. El archivo original nunca se sube.
5. Botón para eliminar un resumen.

### Fase 4. Diagnóstico y motor de reglas (RF-01 a RF-03)

1. Cuestionario por pasos con React Hook Form + Zod, una sección por área (ventas, gestión, marketing, pagos). Barra de progreso. Guarda borrador en `diagnostics.answers` en cada paso. Permite retomar.
2. Tipos en `src/engine/types.ts`: `Business`, `Answer`, `Technology`, `Rule`, `DiagnosticResult`.
3. `recommend()` en `src/engine/recommend.ts`, función pura:
   - Evalúa cada regla activa contra las respuestas (operadores `eq`, `neq`, `in`, `contains`, `not_contains`, `gte`, `lte`; combinadores `all`, `any`, `not`).
   - Suma el peso de las reglas activadas al puntaje del área y lo normaliza entre 0 y 1.
   - Filtra el catálogo por sector, tamaño y recursos del negocio.
   - Ordena con `afinidad = 0.5*puntaje_area + 0.2*ajuste_sector + 0.2*ajuste_recursos + 0.1*facilidad`.
   - Devuelve necesidades, al menos dos áreas prioritarias, procesos optimizables con sus categorías de tecnología, y recomendaciones con `benefit`, `rationale` y `rule_ids`.
4. `buildMap(result)` en `src/engine/map.ts`: nodos `business`, `area`, `process`, `technology` y aristas `has_need`, `involves`, `optimized_by`.
5. Al enviar: validar que existan las cuatro áreas, llamar `recommend()`, luego `supabase.rpc('submit_diagnostic', ...)`. Mostrar pantalla de progreso mientras tanto.

### Fase 5. Resultados, mapa y guía (RF-04 a RF-07, RF-10)

1. Pantalla de resultados: áreas prioritarias, tecnologías por área (mínimo tres si el catálogo alcanza), filtro por categoría, beneficio en una frase y "por qué te lo recomendamos" visibles sin salir de la pantalla.
2. Relación proceso-tecnología visible de forma explícita (HU9).
3. Mapa con React Flow: nodos por tipo, expandir y contraer áreas, vista legible en 360 px de ancho, accesible con teclado.
4. Guía paso a paso por tecnología (mínimo 3 pasos) con casillas que persisten en `guide_progress`.
5. Historial de diagnósticos y navegación entre resultados sin repetir el diagnóstico.

### Fase 6. Asistente y contacto (RF-08, RF-09)

1. Edge Function `assistant-chat` con interfaz `LLMProvider` y una implementación `MockProvider` que devuelve respuestas fijas. Incluye validación de JWT, cuota por usuario en `usage_counters`, carga de contexto con el JWT del usuario, persistencia en `messages` y respuesta JSON o SSE. La integración real queda en `04-3`.
2. Pantalla del asistente: orbe reactivo a la voz en el panel derecho, panel izquierdo con el mapa o la tecnología en foco y la transcripción de la conversación (ver Figma, marco "Asistente").
3. Voz con Web Speech API (`SpeechRecognition` y `speechSynthesis`). Detectar compatibilidad (Firefox no la soporta bien) y mostrar siempre "Prefiero escribir".
4. Mensaje de bienvenida y límites claros: el asistente orienta, no decide por el usuario.
5. Botón de WhatsApp en la pantalla de resultados con `https://wa.me/<VITE_WHATSAPP_NUMBER>?text=<mensaje cercano prellenado>`.

### Fase 7. Estadísticas (RF-10)

1. Panel con Recharts: cobertura por área, número de oportunidades, avance de pasos completados (`my_stats`).
2. Cualquier cifra de beneficio o ganancia se muestra marcada como "ilustrativa" con su fórmula visible. No presentar como resultado medido (HU10 está fuera de alcance).

## Contenido del catálogo (seed)

- Cuatro áreas obligatorias: ventas, gestión, marketing, pagos.
- Mínimo 5 tecnologías por área (propuesta: garantiza 3 después de filtrar por sector y tamaño). Cada una con: nombre, categoría, áreas, sectores, tamaños, `cost_level`, `ease_level`, beneficio en una frase sin tecnicismos y 3 a 5 pasos de guía.
- Fuentes: documentación pública de Siigo, Alegra, Treinta, Bold, Wompi y WhatsApp Business, datos.gov.co, MinTIC. Guardar la URL de cada fuente en un campo `source_url`.
- Neutralidad: el catálogo se organiza por categoría; ningún orden comercial.
- Si el agente no tiene una fuente verificable para un dato, deja `TODO(equipo)` y no lo inventa.

## Criterios de aceptación

**Seguridad y datos**
- [ ] Todas las tablas tienen RLS. Una prueba con dos usuarios confirma que A no lee ni modifica datos de B.
- [ ] Sin `consents` vigente, ninguna pantalla de datos carga (RNF-06.1).
- [ ] El archivo original nunca sale del navegador; solo se guarda el resumen aprobado.
- [ ] Un diagnóstico `submitted` no puede modificarse (`409`).

**Diagnóstico (HU1)**
- [ ] El formulario cubre ventas, gestión, marketing y pagos.
- [ ] Un usuario de prueba lo completa en menos de 10 minutos.
- [ ] El resultado muestra al menos 2 áreas prioritarias.
- [ ] Se puede cerrar el navegador a mitad y retomar el borrador.

**Recomendaciones (HU2 a HU4)**
- [ ] Mínimo 3 tecnologías por área cuando el catálogo lo permite.
- [ ] Ninguna tecnología mostrada contradice sector, tamaño o recursos declarados.
- [ ] Cada tecnología muestra beneficio en una frase y motivo de la recomendación sin cambiar de pantalla.
- [ ] El filtro por categoría funciona.
- [ ] `recommend()` con el mismo input devuelve siempre el mismo resultado.

**Procesos y mapa (HU9, RF-06)**
- [ ] El resultado identifica al menos un proceso optimizable y lo vincula a una tecnología de forma visible.
- [ ] El mapa se construye del diagnóstico individual, no de una lista genérica.
- [ ] El mapa es legible y operable en un viewport de 360 x 640 sin scroll horizontal.

**Guía y asistente (HU8, RF-07, RF-08)**
- [ ] Cada tecnología tiene guía de 3 pasos o más y el avance persiste al recargar.
- [ ] El asistente responde en texto con el proveedor simulado y respeta la cuota (`429` al exceder 20 mensajes por minuto).
- [ ] Si Web Speech no está disponible, la opción de escribir está visible y funcional.

**Contacto y estadísticas (HU11, RF-09, RF-10)**
- [ ] El botón de WhatsApp está visible en resultados y abre el chat con el mensaje prellenado.
- [ ] Las estadísticas derivan de datos reales del sistema; las cifras estimadas están rotuladas como ilustrativas.

**Rendimiento (RNF-02)**
- [ ] Pantallas principales cargan en menos de 3 s con conexión normal.
- [ ] `recommend()` más el guardado completan en menos de 5 s.
- [ ] La navegación responde en menos de 2 s.

## Definición de hecho

`lint`, `typecheck`, `test` y `build` pasan; migraciones aplican desde cero con `db:reset`; los criterios anteriores están marcados; el PR describe cualquier `TODO(equipo)`.
