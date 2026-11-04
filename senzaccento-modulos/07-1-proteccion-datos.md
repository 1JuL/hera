# 07.1 Protección de Datos

**Tipo:** plan de desarrollo + insumo legal para revisión.
**Entregable del cronograma:** políticas de privacidad y términos (Habeas Data).
**Leer antes:** `00-CONTEXTO.md`, `04-2-implementacion-core.md` (Fase 2), `06-2-analytics-monitoreo.md`.
**Requisitos cubiertos:** RNF-06 completo. Marco normativo: Ley 1581 de 2012 y su reglamentación (Decreto 1377 de 2013, compilado en el Decreto 1074 de 2015).

**Aviso:** este archivo organiza el trabajo técnico y deja borradores. No es asesoría jurídica. Los textos legales deben ser revisados por el asesor jurídico de la Universidad o el docente antes de publicarse. Las referencias normativas deben verificarse en las fuentes oficiales (Superintendencia de Industria y Comercio, SIC).

## Decisiones previas que el equipo debe cerrar

El agente no las inventa; deja marcadores `[POR DEFINIR]` en los borradores.

1. **Responsable del tratamiento.** Un equipo estudiantil no es persona jurídica. Definir si el responsable es la Universidad de La Sabana (con el docente como contacto) u otra figura. Nombre, NIT, dirección y correo de contacto.
2. **Canal para titulares.** Un correo dedicado (por ejemplo, `privacidad@<dominio>`) para consultas y reclamos.
3. **Retención.** Qué se conserva, por cuánto tiempo y qué pasa al terminar el proyecto (propuesta: eliminar o anonimizar todos los datos de usuarios al cierre de la validación, en una fecha publicada).
4. **Transferencia internacional.** Supabase, Vercel, Google (Gemini), Groq, PostHog y Sentry pueden procesar datos fuera de Colombia. La Ley 1581 restringe la transferencia a países sin nivel adecuado de protección salvo autorización expresa del titular u otras excepciones. Confirmar con el asesor y reflejarlo en el consentimiento.
5. **Registro Nacional de Bases de Datos (RNBD).** Verificar con el asesor si aplica al responsable.

## Inventario de datos

| Dato | Tabla | Finalidad | Sensible | Retención propuesta |
|---|---|---|---|---|
| Correo, nombre, teléfono | `auth.users`, `profiles` | Cuenta y verificación | No | Mientras exista la cuenta |
| Perfil del negocio (sector, tamaño, municipio, recursos, canales) | `businesses` | Generar el diagnóstico | No | Mientras exista la cuenta |
| Resumen de archivos aprobado por el usuario | `document_summaries` | Enriquecer el perfil | Potencialmente: puede contener datos financieros del negocio | Mientras exista la cuenta; eliminable por el usuario en cualquier momento |
| Respuestas, resultados, progreso de guía | `diagnostics`, `recommendations`, `guide_progress` | Recomendar y acompañar | No | Mientras exista la cuenta |
| Conversaciones con el asistente | `conversations`, `messages` | Continuidad del asistente | Puede contener datos libres | Definir (propuesta: 90 días) |
| Reportes de problemas | `feedback` | Mejorar el prototipo | Puede contener datos libres | Definir |
| Consentimientos | `consents` | Prueba de autorización | No | Mientras exista la cuenta más el plazo que indique el asesor |
| Eventos de uso (sin datos personales) | PostHog | Medir usabilidad | No | Según configuración de PostHog |
| Errores técnicos | Sentry | Estabilidad | No (con `sendDefaultPii: false`) | Según configuración de Sentry |

Datos que la aplicación no debe pedir ni almacenar: documentos de identidad, datos de salud, origen étnico, creencias, datos de menores, datos de tarjetas o cuentas bancarias. El formulario y los parsers deben descartar columnas o campos que parezcan identificadores personales o financieros.

## Plan de desarrollo

### Fase 1. Documentos legales (borradores para revisión)

Crear en `docs/legal/`:

1. `politica-tratamiento-datos.md`. Estructura mínima: responsable e información de contacto; datos recolectados (según el inventario); finalidades; base de la autorización; derechos del titular (conocer, actualizar, rectificar, solicitar prueba de la autorización, ser informado del uso, presentar quejas ante la SIC, revocar la autorización y solicitar la supresión, acceder gratuitamente a sus datos); procedimiento y canal para consultas y reclamos con los plazos legales vigentes (verificar los vigentes: la Ley 1581 establece 10 días hábiles para consultas y 15 para reclamos, prorrogables); proveedores y transferencia internacional; medidas de seguridad; retención; vigencia y cambios de la política.
2. `aviso-privacidad.md`. Versión corta (una pantalla) para mostrar antes de recolectar datos: quién, qué, para qué, derechos y dónde leer la política completa.
3. `terminos-y-condiciones.md`. Estructura: qué es Hera y su carácter de prototipo académico; las recomendaciones son orientativas y no constituyen asesoría profesional; el usuario decide qué tecnología implementar; neutralidad (no se vende ni promociona ninguna herramienta); limitación de responsabilidad; uso aceptable; propiedad intelectual; disponibilidad no garantizada (prototipo); contacto; ley aplicable.
4. Texto del consentimiento (`consentimiento.md`) con casillas separadas y sin marcar de antemano: (a) autorización para el tratamiento descrito (obligatoria), (b) transferencia a proveedores fuera de Colombia (obligatoria para usar el asistente; si se rechaza, el resto de la app funciona sin asistente), (c) analítica de uso (opcional).
5. Todo texto en español sencillo (nivel de lectura de un emprendedor sin formación técnica); cada documento incluye la versión y la fecha, y marca `[POR DEFINIR]` donde falte información.

### Fase 2. Implementación en la aplicación

1. Rutas públicas `/privacidad`, `/terminos` y `/aviso`, renderizadas desde los archivos Markdown versionados (por ejemplo con `react-markdown`), enlazadas en el pie de página de todas las pantallas y en el registro.
2. Constante `CONSENT_VERSION` ligada a la versión de los documentos. El cambio de versión obliga a aceptar de nuevo.
3. Pantalla de consentimiento (ya creada en `04-2`): casillas separadas, enlaces a los documentos, registro en `consents` con la versión; la casilla de analítica activa o no PostHog (`06-2`).
4. Registro: no se puede crear la cuenta sin aceptar (a). Un usuario que ingresa por OAuth sin consentimiento vigente es redirigido a la pantalla antes de ver datos.
5. Sección "Mi privacidad" en la cuenta del usuario con:
   - ver y editar datos personales,
   - descargar mis datos (`export-my-data`),
   - eliminar mi cuenta y mis datos (`delete-account`) con confirmación,
   - revocar la analítica y el consentimiento del asistente,
   - eliminar un resumen de archivo,
   - enlace al canal de consultas y reclamos.
6. `delete-account` elimina en una operación: `profiles`, `businesses`, `document_summaries`, `diagnostics`, `recommendations`, `guide_progress`, `conversations`, `messages`, `feedback` propio, `consents` y el usuario de `auth.users`. Debe indicar en la respuesta qué se eliminó. Los respaldos existentes caducan según la retención de `06-3`; informarlo en la política.
7. `export-my-data` devuelve un JSON con todos los datos del solicitante, legible y documentado.
8. Minimización: revisión del esquema y los formularios para eliminar cualquier campo que no use una regla del motor.
9. Archivos: confirmar en la interfaz, antes de procesar, que el archivo se lee en el dispositivo y no se sube; el usuario revisa el resumen antes de guardarlo.
10. Asistente: aviso visible de que no debe escribirse información personal ni financiera sensible; saneamiento en el servidor (ver `04-3`).
11. Retención: tarea programada (Edge Function con `pg_cron`, si está disponible en el plan, o workflow de GitHub Actions) que elimina `messages` más antiguos que el plazo definido.
12. Cierre del proyecto: script `scripts/purge-validation-data.sql` documentado para eliminar o anonimizar los datos al terminar la validación.

### Fase 3. Seguridad como obligación legal

1. Lista de verificación de seguridad del documento de API (sección 7) completada y evidenciada: RLS, claves, HTTPS, contraseñas gestionadas por Supabase Auth, sin datos personales a LLM ni analítica.
2. Procedimiento de incidentes en `docs/incidentes.md`: quién decide, cómo se contiene, cómo se notifica a los afectados y, si el asesor lo indica, a la SIC. Un incidente típico: exposición accidental de una clave o de datos de otro usuario.
3. Control de acceso del equipo: quién tiene acceso a `service_role`, al panel de Supabase y a los respaldos; lista en `docs/accesos.md` sin credenciales; autenticación en dos pasos activa en GitHub, Supabase y Vercel.

## Criterios de aceptación

**Documentos**
- [ ] Existen la política de tratamiento, el aviso de privacidad, los términos y el texto de consentimiento, con versión y fecha, en español sencillo.
- [ ] Todos los `[POR DEFINIR]` están resueltos y el asesor jurídico o el docente aprobó los textos (registrado en el PR).
- [ ] La política describe la transferencia a proveedores fuera de Colombia y cómo se obtiene la autorización.

**Aplicación**
- [ ] Sin aceptar la autorización principal no se puede crear una cuenta ni acceder a pantallas de datos.
- [ ] Las casillas del consentimiento no vienen marcadas y son independientes; rechazar el consentimiento del asistente deshabilita el asistente sin romper el resto.
- [ ] Rechazar la analítica impide que PostHog se inicialice (verificar en la pestaña de red).
- [ ] Un cambio en `CONSENT_VERSION` fuerza a un usuario existente a aceptar de nuevo antes de continuar.
- [ ] La política, los términos y el aviso son accesibles sin iniciar sesión y desde el pie de página.
- [ ] "Descargar mis datos" entrega un JSON completo del usuario en menos de 10 segundos.
- [ ] "Eliminar mi cuenta" borra todos los datos del usuario (verificado con una consulta que no devuelve filas de ese `user_id` en ninguna tabla) y el usuario no puede volver a iniciar sesión.
- [ ] Un usuario puede eliminar un resumen de archivo individual.
- [ ] El tiempo de respuesta a consultas y reclamos está documentado y hay un buzón activo.

**Seguridad**
- [ ] La verificación de RLS pasa (ver `05-1`) y no existe `service_role` en el cliente ni en el repositorio.
- [ ] Autenticación en dos pasos activa en las cuentas de GitHub, Supabase y Vercel de los 4 integrantes.
- [ ] `docs/incidentes.md` y `docs/accesos.md` existen.
- [ ] Hay un plan de eliminación o anonimización de datos al cierre del proyecto con fecha publicada en la política.

## Fuera de alcance de este módulo

Registro ante la SIC (si aplica), contratos de encargo con proveedores y cualquier concepto jurídico vinculante. El módulo deja la evidencia técnica; la decisión legal es del asesor.
