# 07.2 Feedback Loop

**Tipo:** plan de desarrollo para un agente.
**Entregable del cronograma:** canal abierto para reporte de errores del usuario.
**Leer antes:** `00-CONTEXTO.md`, `04-2-implementacion-core.md`, `06-2-analytics-monitoreo.md`, `07-1-proteccion-datos.md`.
**Requisitos cubiertos:** RNF-01, RNF-03, RF-09 (acompañamiento cercano), objetivo de evaluación con usuarios.

## Alcance

Un canal para que cualquier usuario reporte errores o sugerencias desde la aplicación, que llegue al equipo, se clasifique, se atienda y se le responda. Incluye también un canal para quienes no pueden iniciar sesión.

## Diseño

| Elemento | Definición |
|---|---|
| Entrada en la app | Botón fijo "Reportar un problema" en el pie y en el menú, y desde la pantalla de error de la aplicación |
| Entrada sin sesión | En login y registro: enlace "¿No puedes ingresar?" con correo de soporte y enlace `wa.me` |
| Almacenamiento | Tabla `feedback` en Supabase |
| Aviso al equipo | Database Webhook en `INSERT` -> Edge Function `notify-feedback` -> correo o webhook de Discord |
| Triage | Revisión en Supabase Studio o una vista de administración; issues en GitHub con etiquetas |
| Cierre | Respuesta al usuario si autorizó contacto; registro del estado |

### Tabla `feedback`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | Nulo si el reporte es anónimo |
| `type` | text | `error`, `sugerencia`, `duda`, `otro` |
| `message` | text | Máximo 1000 caracteres |
| `rating` | smallint | Opcional, 1 a 5 (satisfacción) |
| `contact_ok` | boolean | El usuario autoriza que lo contacten |
| `contact_channel` | text | Correo de la cuenta o WhatsApp, solo si `contact_ok` |
| `page` | text | Ruta donde estaba |
| `app_version` | text | `VITE_APP_VERSION` |
| `user_agent` | text | Navegador y sistema |
| `viewport` | text | Ancho x alto |
| `sentry_event_id` | text | Si viene de la pantalla de error |
| `status` | text | `nuevo`, `en_revision`, `resuelto`, `descartado` |
| `severity` | text | `critica`, `alta`, `media`, `baja` (la asigna el equipo) |
| `github_issue` | text | URL del issue si se creó |
| `created_at`, `updated_at` | timestamptz | |

RLS: insertar permitido a usuarios autenticados (`user_id = auth.uid()`); leer y actualizar solo `is_admin()`. Sin lectura del propio reporte en v1. Límite: 5 reportes por usuario por hora, aplicado con un trigger o una función de verificación.

## Plan de desarrollo

1. **Migración** con la tabla, índices (`status`, `created_at`), RLS y el límite por usuario.
2. **Componente `FeedbackDialog`** (shadcn `Dialog`) con: tipo, mensaje, satisfacción opcional, casilla "Autorizo que me contacten" con selección de canal. Datos técnicos (`page`, `app_version`, `user_agent`, `viewport`) se añaden automáticamente y se muestran al usuario de forma resumida y transparente. Sin capturas de pantalla (privacidad).
3. **Aviso en el formulario:** "No escribas contraseñas ni datos financieros." Contador de caracteres. Validación con Zod. Texto en español sencillo.
4. **Confirmación:** mensaje "Gracias, lo vamos a revisar" y, si autorizó contacto, el plazo estimado de respuesta.
5. **Pantalla de error global** (`Sentry.ErrorBoundary`) con botón "Reportar este problema" que abre el diálogo con `sentry_event_id` precargado.
6. **Canal sin sesión:** bloque en login y registro con correo de soporte y enlace `wa.me` con mensaje prellenado ("Hola, tengo un problema para ingresar a Hera").
7. **Edge Function `notify-feedback`:**
   - Valida el encabezado `x-webhook-secret` contra `WEBHOOK_SECRET`.
   - Construye un aviso con tipo, severidad sugerida, página, versión y los primeros 200 caracteres del mensaje.
   - Envía a Discord (URL de webhook en secreto `DISCORD_WEBHOOK_URL`) o por correo.
   - Responde `200` en menos de 5 s y es idempotente por `id`.
8. **Database Webhook** en Supabase: tabla `feedback`, evento `INSERT`, destino `POST /functions/v1/notify-feedback`, con el encabezado del secreto.
9. **Triage:**
   - Plantilla de issue en `.github/ISSUE_TEMPLATE/feedback.md` y etiquetas `feedback`, `bug`, `ux`, `sugerencia`, `critico`.
   - Procedimiento en `docs/feedback-proceso.md`: revisión diaria durante la validación y semanal después; un responsable de turno; criterios de severidad iguales a los de `05-2`.
   - Metas de atención propuestas: crítico en 24 h, alto en 3 días, el resto en la revisión semanal.
10. **Cierre del ciclo:** vista de administración mínima (ruta `/admin/feedback` protegida por `is_admin()`) o uso de Supabase Studio para cambiar `status`, `severity` y `github_issue`. Si `contact_ok`, el responsable responde por el canal elegido y deja constancia.
11. **Métricas:** evento `feedback_submitted` en analítica (sin contenido); indicadores semanales: reportes nuevos, tiempo mediano de primera respuesta, porcentaje resuelto, tipos más frecuentes.
12. **Privacidad:** el contenido de `feedback` no se envía a PostHog, Sentry ni al LLM; el aviso a Discord se limita a 200 caracteres y debe usarse un canal privado del equipo. Los reportes entran en el inventario y en la política de retención de `07-1`, y se eliminan junto con la cuenta.

## Criterios de aceptación

- [ ] Un usuario autenticado puede enviar un reporte en menos de 1 minuto desde cualquier pantalla y ve la confirmación.
- [ ] El reporte guarda automáticamente página, versión, navegador y tamaño de pantalla, sin capturas ni contenido de formularios.
- [ ] El equipo recibe el aviso en menos de 1 minuto desde el envío (probado de extremo a extremo con el Database Webhook).
- [ ] `notify-feedback` rechaza solicitudes sin el secreto correcto (`401`).
- [ ] Un usuario no puede leer reportes de otros ni listar la tabla; un administrador sí (prueba de RLS).
- [ ] El límite de 5 reportes por hora por usuario se aplica (el sexto devuelve error controlado).
- [ ] Desde la pantalla de error global se puede reportar con el evento de Sentry precargado.
- [ ] Quien no puede iniciar sesión encuentra en login y registro un correo y un enlace de WhatsApp funcionales.
- [ ] Existe `docs/feedback-proceso.md` con responsables, severidades y plazos, y un reporte de prueba recorrió el ciclo completo (nuevo, en revisión, resuelto, respuesta al usuario).
- [ ] Al eliminar una cuenta se eliminan sus reportes.
- [ ] El diálogo es accesible por teclado y legible en 360 px de ancho.
