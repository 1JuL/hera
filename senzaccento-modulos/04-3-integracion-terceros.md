# 04.3 Integración de Terceros

**Tipo:** plan de desarrollo para un agente.
**Entregable del cronograma:** APIs externas vinculadas. Alcance confirmado por el equipo: LLM, correo, SMS y WhatsApp. No hay pagos.
**Leer antes:** `00-CONTEXTO.md`, `04-1-entorno-dev-setup.md`, `04-2-implementacion-core.md` (Fase 6).
**Requisitos cubiertos:** RF-08, RF-09, RNF-03, RNF-06, autenticación social.

## Alcance

| Integración | Punto de integración | Costo |
|---|---|---|
| Gemini (principal) y Groq (respaldo) | Edge Function `assistant-chat` | Gratis con cuota |
| Correo transaccional | Supabase Auth, SMTP propio | Plan gratuito de un proveedor (Resend o Brevo; verificar límites vigentes) |
| SMS OTP | Supabase Auth, proveedor SMS | No gratuito |
| Google y Facebook | Supabase Auth, OAuth | Gratis |
| WhatsApp | Enlace `wa.me` | Gratis |

## Decisiones previas que el equipo debe cerrar

Estas decisiones bloquean partes del módulo. El agente no las toma por su cuenta.

1. **Proveedor y presupuesto de SMS.** Supabase solo envía SMS con proveedores externos (Twilio, Vonage, MessageBird, TextLocal). Ninguno es gratuito de forma indefinida. Hasta decidir, el flujo funciona con números de prueba.
2. **Dominio de correo.** Para SPF y DKIM se necesita un dominio propio. Sin dominio, el proveedor SMTP suele exigir un remitente de prueba con restricciones.
3. **Facebook Login.** Exige crear una app de Meta y una política de privacidad pública. Evaluar si aporta frente a Google.

## Plan de desarrollo

### Fase 1. LLM en `assistant-chat`

1. Crear `supabase/functions/_shared/llm.ts` con la interfaz:

```ts
export interface LLMProvider {
  name: string;
  generate(input: { system: string; history: ChatMessage[]; user: string; stream?: boolean }): Promise<LLMResult | ReadableStream>;
}
```

2. Implementar `GeminiProvider` y `GroqProvider` llamando por `fetch` a sus APIs REST. Claves desde `Deno.env.get('GEMINI_API_KEY')` y `GROQ_API_KEY`.
3. `llmClient` selecciona el proveedor por la variable `LLM_PROVIDER` y aplica el respaldo: ante `429`, `5xx` o timeout de 20 s, un solo reintento con el otro proveedor.
4. Prompt de sistema (en `_shared/prompts.ts`, versionado):
   - Responder en español de Colombia, lenguaje sencillo, máximo 120 palabras por respuesta.
   - Hablar solo de las tecnologías del catálogo recibido como contexto. No inventar herramientas, precios ni cifras.
   - Ser neutral entre proveedores.
   - Orientar, no decidir: el emprendedor elige.
   - Si no sabe o la pregunta está fuera de alcance, decirlo y ofrecer el contacto humano por WhatsApp.
5. Antes de llamar al LLM: eliminar correo, nombre y teléfono del contexto. El contexto incluye solo perfil del negocio (sector, tamaño, municipio, recursos), áreas prioritarias, fichas de tecnologías relevantes y el texto del usuario.
6. Streaming por SSE con eventos `token`, `visual`, `done`, `error`. El campo `visuals` referencia nodos del mapa o tarjetas por ID; el asistente no genera gráficos.
7. Caché de respuestas a preguntas frecuentes (tabla `assistant_cache` con hash normalizado de la pregunta y `diagnostic_id` nulo) para ahorrar cuota.
8. Modo de respaldo: si ambos proveedores fallan, `502 UPSTREAM_ERROR`; el cliente muestra preguntas guiadas predefinidas y el botón de WhatsApp.
9. Registrar tokens consumidos por conversación (sin contenido).

### Fase 2. Correo (SMTP propio)

1. Crear cuenta en el proveedor elegido y verificar el dominio (registros SPF, DKIM y, si el proveedor lo pide, DMARC).
2. En Supabase: *Authentication > Emails > SMTP Settings*, activar SMTP personalizado con host, puerto 587 (STARTTLS), usuario, contraseña y remitente.
3. Subir el límite en *Authentication > Rate Limits > Email sent* a un valor coherente con el plan del proveedor.
4. Personalizar las plantillas de confirmación, recuperación de contraseña y cambio de correo en español sencillo.
5. Documentar el procedimiento en `docs/smtp.md` sin credenciales.

### Fase 3. SMS (OTP)

1. Con el proveedor decidido, en Supabase *Authentication > Providers > Phone*: activar y cargar credenciales. Ajustar expiración del OTP a 300 s.
2. Cliente: tras el registro, `supabase.auth.updateUser({ phone })` y luego `supabase.auth.verifyOtp({ phone, token, type: 'phone_change' })`. Para ingreso solo con celular (opcional), `signInWithOtp({ phone })` y `verifyOtp({ phone, token, type: 'sms' })`.
3. Normalizar números colombianos a formato E.164 (`+57` + 10 dígitos).
4. Protección de costo y abuso: activar CAPTCHA en Auth (Cloudflare Turnstile o hCaptcha), un SMS por usuario por día, límite por IP y alerta cuando se supere un umbral de envíos.
5. En desarrollo y QA usar *Test Phone Numbers and OTPs*; no consumen SMS reales. Retirar los números de prueba del proyecto de producción antes del lanzamiento.
6. La verificación por SMS es opcional salvo que el equipo decida lo contrario. El resto de la app no depende de ella.

### Fase 4. OAuth (Google y Facebook)

1. Google: crear credenciales OAuth en Google Cloud Console (tipo aplicación web), con la URI de callback de Supabase (`https://<ref>.supabase.co/auth/v1/callback`). Cargar *Client ID* y *Secret* en Supabase.
2. Facebook: crear la app en Meta for Developers, habilitar Facebook Login, añadir la misma URI de callback y la URL de la política de privacidad.
3. Cliente: `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })`.
4. Manejar el retorno en `/auth/callback`, crear el perfil y exigir el consentimiento si es primer ingreso.

### Fase 5. WhatsApp

1. El número vive en `VITE_WHATSAPP_NUMBER`. Enlace: `https://wa.me/57<número>?text=<texto codificado>`.
2. Mensaje prellenado cercano y sin datos personales: "Hola, acabo de hacer mi diagnóstico en Hera y me gustaría hablar con alguien del equipo."
3. Disponible en la pantalla de resultados y en el asistente (cuando falla el LLM o el usuario lo pide).
4. Registrar el evento `contact_whatsapp_clicked` en analítica (ver `06-2`).

## Criterios de aceptación

**LLM**
- [ ] Una pregunta de prueba obtiene respuesta en español sencillo en menos de 8 s, con streaming visible.
- [ ] Si se simula un `429` en Gemini, la respuesta llega por Groq sin error visible.
- [ ] Si ambos proveedores fallan, el usuario ve preguntas guiadas y el botón de WhatsApp.
- [ ] El asistente solo menciona tecnologías presentes en el catálogo (prueba con 10 preguntas, incluidas 3 que inducen a inventar).
- [ ] Una prueba automática verifica que el payload enviado al LLM no contiene correo, nombre ni teléfono.
- [ ] Ninguna clave aparece en el bundle del cliente ni en el repositorio.
- [ ] El 21.º mensaje en un minuto recibe `429` con `Retry-After`.

**Correo**
- [ ] Registro, recuperación de contraseña y cambio de correo entregan el mensaje a una bandeja real (no spam) en menos de 1 minuto.
- [ ] Se envían al menos 10 correos seguidos sin recibir `over_email_send_rate_limit`.
- [ ] El remitente muestra el dominio del proyecto, no el de Supabase.

**SMS**
- [ ] Con número de prueba, el flujo completo de verificación funciona en local y en preproducción.
- [ ] Con un número real colombiano, el OTP llega y se verifica (una prueba controlada).
- [ ] CAPTCHA activo: un script que intenta 20 solicitudes consecutivas es bloqueado antes de generar 20 SMS.
- [ ] Los números de prueba no existen en producción.

**OAuth y WhatsApp**
- [ ] Login con Google funciona en local y en producción, crea el perfil y exige consentimiento en el primer ingreso.
- [ ] Login con Facebook funciona o queda descartado por decisión documentada.
- [ ] El enlace de WhatsApp abre el chat con el mensaje prellenado en móvil y en escritorio.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cuota gratuita del LLM agotada en la demo | Respaldo entre proveedores, caché, cuota por usuario, modo de preguntas guiadas |
| Costo de SMS no controlado | Opcional, CAPTCHA, tope diario, alerta |
| Datos enviados a un proveedor que puede usarlos para mejorar sus productos | Sin datos personales en el payload; informar en la política de privacidad (`07-1`) |
| Cambio de condiciones de los planes | Interfaz `LLMProvider` y configuración por variables; revisar los límites antes de cada prueba de usuario |
