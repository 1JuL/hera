# 05.2 QA de Interfaz

**Tipo:** plan de pruebas + automatización para un agente.
**Entregable del cronograma:** app probada en diversos navegadores y móviles.
**Leer antes:** `00-CONTEXTO.md`, `04-2-implementacion-core.md`, `05-1-pruebas-unitarias.md`.
**Requisitos cubiertos:** RNF-01, RNF-02, RNF-04, RNF-05, y accesibilidad.

## Matriz de dispositivos y navegadores

| Entorno | Cómo se prueba | Obligatorio |
|---|---|---|
| Chrome (escritorio) | Playwright `chromium` | Sí |
| Edge (escritorio) | Playwright con `channel: 'msedge'` | Sí |
| Firefox (escritorio) | Playwright `firefox` | Sí |
| Safari (escritorio) | Playwright `webkit` (aproximación) | Recomendado |
| Android Chrome | Playwright dispositivo `Pixel 7` y un teléfono real del equipo | Sí |
| iPhone Safari | Playwright dispositivo `iPhone 14` y un iPhone real del equipo | Sí |
| Pantalla pequeña | Viewport 360 x 640 | Sí |
| Tablet | Viewport 768 x 1024 | Recomendado |

Servicios de dispositivos en la nube (BrowserStack, LambdaTest) tienen planes gratuitos limitados o solo para código abierto; verificar antes de depender de ellos. La opción gratuita garantizada son los dispositivos reales del equipo más Playwright.

## Plan de desarrollo

### Fase 1. Automatización E2E con Playwright

1. `npx playwright install --with-deps`. Configurar `playwright.config.ts` con los proyectos de la matriz y `baseURL` configurable (local o preview de Vercel).
2. Datos de prueba: usuario de prueba creado por script contra Supabase local (o el proyecto de preproducción), con teléfono de prueba y OTP fijo. Los E2E no usan el LLM real: el cliente se apunta a una Edge Function con `MockProvider`.
3. Flujos a automatizar (cada uno en los 6 proyectos de la matriz):
   1. Registro, confirmación de correo (Mailpit en local), consentimiento y primer ingreso.
   2. Login y logout; recuperación de contraseña.
   3. Creación del negocio y carga de un archivo de muestra con aprobación del resumen.
   4. Diagnóstico completo: responder, cerrar, retomar el borrador, enviar.
   5. Resultados: áreas prioritarias, filtro por categoría, beneficio y motivo visibles, relación proceso-tecnología.
   6. Mapa: expandir y contraer áreas, abrir detalle de una tecnología.
   7. Guía: marcar pasos y recargar; el avance persiste.
   8. Asistente por texto; con voz solo en Chromium, y verificar el aviso y la opción de escribir en Firefox y WebKit.
   9. Botón de WhatsApp: verifica que el enlace `wa.me` tiene el mensaje esperado.
   10. Panel de estadísticas con cifras rotuladas.
   11. Reporte de problema (feedback).
   12. Exportar y eliminar datos personales.
4. Capturas y trazas (`trace: 'retain-on-failure'`) como artefactos del CI.

### Fase 2. Responsive (RNF-05)

1. Prueba automática en 360 x 640, 390 x 844 y 768 x 1024: `document.documentElement.scrollWidth <= window.innerWidth` en cada pantalla.
2. El formulario completo se llena desde un viewport móvil sin scroll horizontal.
3. El mapa mantiene nodos y textos legibles (tamaño de fuente mínimo 12 px) en 360 px; se puede hacer zoom y arrastrar con el dedo.
4. Elementos interactivos de al menos 44 x 44 px y separados entre sí.
5. Teclado virtual: los campos enfocados no quedan tapados.

### Fase 3. Accesibilidad y rendimiento

1. `@axe-core/playwright` en cada pantalla: cero violaciones `serious` o `critical`.
2. Navegación completa por teclado en login, formulario, resultados y mapa; foco visible.
3. Contraste mínimo AA en la paleta verde de Senzaccento.
4. Lighthouse (CLI o `lighthouse-ci`) en móvil sobre la versión desplegada: Performance, Accessibility y Best Practices mayores o iguales a 85 en las pantallas principales.
5. Medir carga de pantallas principales (objetivo < 3 s) y respuesta de navegación (< 2 s) bajo conexión simulada "4G rápido".

### Fase 4. Pruebas con usuarios (RNF-01)

1. Reclutar 8 a 10 emprendedores de Sabana Centro o personas con perfil equivalente.
2. Protocolo: tarea "completa el diagnóstico y dime qué tecnología te recomienda y por qué", sin ayuda. Un integrante observa y registra: tiempo, tropiezos, dudas, necesidad de ayuda.
3. Medir: porcentaje que completa sin ayuda directa (meta 80 %), tiempo del diagnóstico (meta menos de 10 minutos), comprensión del beneficio de cada tecnología y del mapa.
4. Encuesta posterior (Google Forms) con escala de satisfacción y la pregunta de conocimiento de beneficios antes y después, según el objetivo 3 del proyecto.
5. Consentimiento informado por escrito y datos sin identificar en el informe.
6. Los hallazgos se convierten en issues con etiqueta `ux` y prioridad.

### Fase 5. Informe

Generar `docs/qa-interfaz-informe.md` con: matriz ejecutada (pasa o falla por entorno), defectos encontrados y su estado, resultados de accesibilidad y Lighthouse, resultados de las pruebas con usuarios.

## Criterios de aceptación

- [ ] Los 12 flujos E2E pasan en Chromium, Firefox, WebKit, Pixel 7 e iPhone 14 en el CI.
- [ ] Verificación manual en al menos un Android real y un iPhone real, con evidencia (capturas o video corto).
- [ ] Ninguna pantalla presenta scroll horizontal en 360 x 640 (RNF-05).
- [ ] El mapa de oportunidades es legible y operable en 360 px.
- [ ] Funciona en Chrome, Edge y Firefox modernos y desde computador y móvil (RNF-04).
- [ ] Cero violaciones axe `serious` o `critical`; navegación por teclado completa.
- [ ] Lighthouse móvil mayor o igual a 85 en Performance, Accessibility y Best Practices en las pantallas principales.
- [ ] Pantallas principales cargan en menos de 3 s y la navegación responde en menos de 2 s (RNF-02).
- [ ] En Firefox y Safari, la ausencia de reconocimiento de voz muestra aviso claro y la alternativa de escribir.
- [ ] Al menos 80 % de los usuarios de prueba completa el diagnóstico sin ayuda directa y en menos de 10 minutos (RNF-01).
- [ ] Todos los defectos `crítico` y `alto` están cerrados; los demás tienen issue y decisión documentada.
- [ ] Informe de QA entregado en `docs/`.

## Clasificación de defectos

| Severidad | Definición | Acción |
|---|---|---|
| Crítico | Impide completar el flujo principal o expone datos de otro usuario | Bloquea el lanzamiento |
| Alto | El flujo se completa con rodeos o falla en un navegador de la matriz | Se corrige antes del lanzamiento |
| Medio | Molestia visible sin impedir la tarea | Planificado |
| Bajo | Detalle estético | Backlog |
