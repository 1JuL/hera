# 05.3 Pruebas de Carga

**Tipo:** plan de pruebas + scripts para un agente.
**Entregable del cronograma:** validación de la respuesta bajo tráfico simulado.
**Leer antes:** `00-CONTEXTO.md`, `04-2-implementacion-core.md`.
**Requisitos cubiertos:** RNF-02 (rendimiento), RNF-03 (disponibilidad).

## Alcance y límites

La carga real del prototipo es baja: pruebas de usuario con decenas de personas. El objetivo no es escalar a miles de usuarios sino demostrar que el sistema cumple los tiempos de RNF-02 con un tráfico mayor al esperado y que no se rompe por los límites de la capa gratuita.

Reglas de seguridad de las pruebas:

1. No ejecutar pruebas de carga contra el proyecto de producción.
2. Nunca llamar a Gemini ni a Groq: `assistant-chat` se prueba con `MockProvider` (variable `LLM_PROVIDER=mock`). Un ensayo de carga con el LLM real agotaría la cuota gratuita.
3. No enviar correos ni SMS reales: usar números de prueba y confirmación de correo desactivada solo en el entorno de pruebas.
4. Las pruebas contra un proyecto gratuito de Supabase consumen transferencia (5 GB al mes en el plan gratuito, según fuentes consultadas; verificar). Limitar la duración y el tamaño de las respuestas.
5. Entornos: (a) Supabase local en Docker para iterar scripts (los tiempos no son representativos de la red real); (b) un segundo proyecto gratuito de Supabase como preproducción para la medición final.

## Herramienta

k6 (código abierto, gratuito). Instalación: `brew install k6` (macOS), `choco install k6` (Windows) o el paquete oficial para Linux; verificar con `k6 version`. Scripts en `tests/load/`.

## Escenarios

| Escenario | Operaciones | Carga | Umbral (RNF-02) |
|---|---|---|---|
| S1 Lectura de catálogo | Login, `GET technologies`, `GET rules`, `GET form_versions` | 30 usuarios virtuales (VU) durante 3 min | p95 menor a 2 s, errores menores a 1 % |
| S2 Diagnóstico | Login, crear negocio, crear diagnóstico, 4 `PATCH` de respuestas, RPC `submit_diagnostic` con un resultado precalculado | Rampa de 0 a 30 VU en 2 min, 3 min sostenido | RPC p95 menor a 5 s; `PATCH` p95 menor a 2 s; errores menores a 1 % |
| S3 Resultados | `GET diagnostics?select=*,recommendations(*,technologies(*))` | 30 VU durante 3 min | p95 menor a 2 s |
| S4 Asistente (proveedor simulado) | `POST assistant-chat` con conversación de 5 mensajes | 20 VU durante 3 min respetando 20 mensajes por minuto por usuario | p95 menor a 3 s, `429` solo cuando se excede la cuota |
| S5 Mixto | Distribución 40 % S1, 30 % S2, 20 % S3, 10 % S4 | 50 VU durante 5 min | Todos los umbrales anteriores |
| S6 Picos | 100 VU durante 1 min contra S1 | Detectar el punto de degradación | Registrar el p95 y la tasa de errores; no hay umbral |
| S7 Resistencia | S5 con 10 VU durante 30 min | Detectar fugas o degradación progresiva | Sin crecimiento sostenido de latencia |

El cálculo de `recommend()` ocurre en el navegador; no se prueba en carga del servidor. Su tiempo se mide en el módulo `05-2` y en pruebas de rendimiento del cliente con perfiles grandes.

## Plan de desarrollo

1. **Usuarios de prueba.** Script `tests/load/seed-users.ts` que crea N usuarios (por ejemplo 100) con correo `loadtest+<n>@example.test` y consentimiento registrado, solo en el entorno de pruebas. Script de limpieza al finalizar.
2. **Librería común.** `tests/load/lib/auth.js`: login con `POST /auth/v1/token?grant_type=password`, devuelve el JWT; cabeceras `apikey` y `Authorization`.
3. **Un archivo por escenario** con `options.thresholds`, por ejemplo:

```js
export const options = {
  stages: [
    { duration: '2m', target: 30 },
    { duration: '3m', target: 30 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{scenario:submit}': ['p(95)<5000'],
    http_req_duration: ['p(95)<2000'],
  },
};
```

4. **Resultado precalculado.** Para S2 se guarda un `DiagnosticResult` válido en `tests/load/fixtures/result.json`, generado una vez con `recommend()`.
5. **Ejecución.** `k6 run tests/load/s5-mixto.js --out json=tests/load/results/s5.json`. Repetir cada escenario 3 veces y tomar la mediana.
6. **Observación del servidor.** Mientras corre, revisar en el panel de Supabase: uso de CPU y memoria de la base, conexiones activas, errores de funciones, y la transferencia consumida.
7. **Análisis.** Identificar cuellos de botella (consultas sin índice, políticas RLS costosas, `select` demasiado amplios) y corregir con índices en `user_id`, `diagnostic_id` y `business_id`, y con `select` explícitos. Volver a medir.
8. **Informe.** `docs/pruebas-carga-informe.md` con: escenarios, resultados (p50, p95, p99, errores, rps), comparación con umbrales, cuellos de botella y correcciones, límites observados de la capa gratuita.

## Criterios de aceptación

- [ ] Scripts k6 para S1 a S7 versionados en `tests/load/` y ejecutables con un solo comando por escenario, con instrucciones en `tests/load/README.md`.
- [ ] En S5 (50 VU, 5 min) todos los umbrales de RNF-02 se cumplen: lecturas p95 menor a 2 s, RPC de envío p95 menor a 5 s, tasa de errores menor a 1 %.
- [ ] En S4, las respuestas con proveedor simulado tienen p95 menor a 3 s y el exceso de cuota devuelve `429`, no `500`.
- [ ] S6 documenta el punto en que el sistema se degrada y el comportamiento al superarlo (errores controlados, sin pérdida de datos).
- [ ] S7 no muestra crecimiento sostenido de latencia ni de errores en 30 minutos.
- [ ] Ninguna prueba toca producción ni consume cuota de Gemini/Groq ni envía correo o SMS reales (verificado revisando logs).
- [ ] Consultas críticas con `EXPLAIN` sin escaneo secuencial sobre tablas grandes; índices en columnas de RLS y claves foráneas.
- [ ] Informe entregado con los límites observados del plan gratuito y la recomendación de capacidad para las pruebas de usuario.
- [ ] Los datos de prueba se eliminan al terminar.

## Interpretación

Si no se cumplen los umbrales, el orden de corrección es: índices y `select` explícitos, simplificar políticas RLS, reducir llamadas por pantalla, caché en el cliente con TanStack Query. Subir de plan no es parte de este módulo; si los límites del plan gratuito son la causa, se documenta como riesgo.
