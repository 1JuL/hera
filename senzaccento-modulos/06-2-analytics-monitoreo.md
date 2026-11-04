# 06.2 Analytics & Monitoreo

**Tipo:** instructivo + plan de eventos.
**Entregable del cronograma:** tracking de eventos y logs de errores activos.
**Leer antes:** `00-CONTEXTO.md`, `06-1-despliegue.md`.
**Requisitos cubiertos:** RNF-01 (medición de usabilidad), RNF-03 (disponibilidad 95 %), RNF-06 (privacidad), objetivos del proyecto.

## Herramientas

| Necesidad | Herramienta gratuita | Dónde corre |
|---|---|---|
| Analítica de uso | PostHog (nivel gratuito) | Cliente |
| Errores y rendimiento | Sentry (plan gratuito) | Cliente y Edge Functions |
| Disponibilidad | UptimeRobot (plan gratuito) | Externo |
| Logs de plataforma | Panel de Supabase (retención de 7 días en el plan gratuito, según fuentes consultadas) y de Vercel | Plataforma |
| Encuestas de validación | Google Forms | Externo |

Verificar los límites vigentes de cada plan antes de configurar.

## Principio de privacidad

Los eventos no contienen datos personales ni contenido ingresado por el usuario (nombre, correo, teléfono, respuestas abiertas, texto del asistente, nombre del negocio). Se identifica al usuario con un ID aleatorio (el UUID de Supabase) y nada más. Esto se declara en la política de privacidad (`07-1`).

## Pasos

### 1. PostHog

1. Crear proyecto en PostHog y copiar la clave y el host a `VITE_POSTHOG_KEY` y `VITE_POSTHOG_HOST`.
2. `npm install posthog-js`. Inicializar en `src/lib/analytics.ts` con:
   - `autocapture: false` (solo eventos explícitos),
   - `capture_pageview: false` y registro manual por ruta,
   - `disable_session_recording: true`,
   - `persistence: 'localStorage'`,
   - desactivar en desarrollo salvo `VITE_ANALYTICS_DEBUG=true`.
3. Tras el login: `posthog.identify(user.id)` sin propiedades personales. Al cerrar sesión: `posthog.reset()`.
4. Envolver el SDK en una función `track(event, props)` con una lista blanca de eventos y propiedades; cualquier evento fuera de la lista se descarta y falla una prueba unitaria.
5. Respetar el consentimiento: si el usuario no acepta la analítica en la pantalla de consentimiento, no se inicializa PostHog.

### 2. Taxonomía de eventos

| Evento | Propiedades permitidas | Para qué |
|---|---|---|
| `signup_completed` | `method` (email, google, facebook) | Adopción |
| `consent_accepted` | `version` | Cumplimiento |
| `phone_verified` | | Uso de SMS (control de costo) |
| `business_created` | `sector`, `size`, `municipality` | Perfil de usuarios |
| `file_parsed` | `kind`, `result` (ok, error) | Uso de carga de archivos |
| `diagnostic_started` | `form_version` | Embudo |
| `diagnostic_step_completed` | `area`, `step_index` | Embudo, abandono por paso |
| `diagnostic_submitted` | `duration_seconds`, `rules_version` | RNF-01 (menos de 10 min) |
| `results_viewed` | `priority_areas`, `n_recommendations` | Embudo |
| `recommendation_opened` | `technology_slug`, `area` | Interés |
| `map_node_expanded` | `node_type` | Uso del mapa |
| `guide_step_toggled` | `technology_slug`, `step_index`, `completed` | HU8 |
| `assistant_message_sent` | `input` (text, voice) | Uso del asistente |
| `assistant_error` | `code` | Calidad |
| `voice_unsupported` | `browser` | RNF-04 |
| `contact_whatsapp_clicked` | `origin` (results, assistant) | RF-09 |
| `feedback_submitted` | `type` | Feedback loop |
| `stats_viewed` | | RF-10 |

Embudo principal: registro, consentimiento, negocio, diagnóstico iniciado, diagnóstico enviado, resultados vistos, recomendación abierta, guía iniciada, contacto o asistente.

### 3. Sentry (cliente)

1. Crear proyecto React en Sentry; `VITE_SENTRY_DSN`.
2. `npm install @sentry/react`. Inicializar al arrancar la app con `release: VITE_APP_VERSION`, `environment` (`development`, `preview`, `production`), `tracesSampleRate: 0.1`, `sendDefaultPii: false`.
3. Filtro `beforeSend`: eliminar cuerpos de solicitud, valores de formularios y cualquier campo de texto libre.
4. Envolver el árbol con `Sentry.ErrorBoundary` y una pantalla de error amable con botón "Reportar este problema" que abre el feedback (`07-2`) con el ID del evento de Sentry.
5. Subir *source maps* en el build de CI (`@sentry/vite-plugin`) con un token guardado como secreto; no publicar los mapas en el bundle público.

### 4. Sentry (Edge Functions)

1. En `supabase/functions/_shared/sentry.ts`, inicializar el SDK de Sentry para Deno con `SENTRY_DSN_FUNCTIONS` y `sendDefaultPii: false`.
2. Cada función genera un `request_id` (UUID), lo devuelve en el encabezado `X-Request-Id` y lo adjunta a los eventos de Sentry.
3. Registrar para `assistant-chat`: proveedor usado, latencia, tokens consumidos, si hubo respaldo y código de error. No registrar el texto de los mensajes.

### 5. UptimeRobot

1. Monitor HTTP al dominio de producción cada 5 minutos, con palabra clave esperada en el HTML.
2. Monitor HTTP a `https://<ref>.supabase.co/functions/v1/health`. La función ejecuta `select 1` en la base y responde `200 { status: "ok", db: "ok" }`. Esa consulta periódica también genera actividad en el proyecto; verificar con la documentación de Supabase si cuenta para evitar la pausa por inactividad.
3. Alertas por correo a todo el equipo y, opcionalmente, a un canal de Discord o Telegram.
4. Registrar la disponibilidad mensual: es la evidencia de RNF-03 (mínimo 95 % durante las pruebas de usuario).
5. Si el proyecto de Supabase se pausa, la alerta del monitor es la señal para reactivarlo.

### 6. Panel de seguimiento

En PostHog crear un tablero "Validación Hera" con: embudo principal, tiempo mediano de diagnóstico, porcentaje de diagnósticos completados, tecnologías más abiertas, uso del asistente por texto y voz, clics en WhatsApp, navegadores sin voz.

### 7. Medición del objetivo del proyecto

El objetivo es aumentar el conocimiento de beneficios tras interactuar con la propuesta. La analítica de producto no lo mide. Usar un formulario de Google Forms (antes y después de usar Hera) con las mismas 5 a 8 preguntas de conocimiento y una escala de utilidad, sin datos que identifiquen al encuestado. Enlazarlo desde la pantalla de resultados con un ID de sesión aleatorio para emparejar respuestas.

### 8. Revisión periódica

Revisión semanal de 30 minutos durante la validación: errores nuevos en Sentry, embudo, disponibilidad, consumo de cuota del LLM y de SMS.

## Criterios de aceptación

- [ ] Los eventos de la taxonomía llegan a PostHog con las propiedades definidas; un evento fuera de la lista blanca se descarta.
- [ ] Ningún evento, error ni log contiene correo, nombre, teléfono, texto del asistente ni respuestas abiertas (revisión manual de 50 eventos y una prueba automática).
- [ ] Sin consentimiento a la analítica, PostHog no se inicializa (verificar en la pestaña de red).
- [ ] Un error provocado a propósito en el cliente aparece en Sentry con `release` y `environment` correctos y sin datos personales, y su mapa de código fuente es legible.
- [ ] Un error provocado en `assistant-chat` aparece en Sentry con `request_id`.
- [ ] UptimeRobot vigila el sitio y la función `health`; una caída simulada genera una alerta en menos de 10 minutos.
- [ ] Existe un tablero con el embudo y los indicadores listados.
- [ ] El formulario de conocimiento antes y después está listo y enlazado.
- [ ] La disponibilidad del periodo de pruebas se puede calcular a partir del historial del monitor.
