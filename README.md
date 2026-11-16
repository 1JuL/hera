# HERA - Plataforma de Diagnóstico y Gestión Tecnológica Empresarial
**Desarrollado por:** Grupo Senzaccento · Universidad de La Sabana

---

## 1. Resumen de Funcionamiento
**HERA** es una aplicación web progresiva (PWA) orientada al autodiagnóstico digital, identificación de brechas tecnológicas y recomendación neutral de herramientas TIC para microempresas (MiPymes) de Sabana Centro (Chía, Cajicá y Zipaquirá).

### Stack Tecnológico
- **Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **Enrutamiento:** React Router v7 (`BrowserRouter` con rutas protegidas)
- **Visualización de Datos:** Recharts (Radar, Barras, Canales)
- **Backend / Autenticación:** Supabase (`@supabase/supabase-js`) con modo desarrollo local si no se configuran credenciales
- **Asistente IA:** Webhook n8n RAG (`VITE_N8N_WEBHOOK_URL`) con motor RAG local de respaldo + Web Speech API (voz y texto)
- **PWA:** `manifest.webmanifest`, Service Worker (`sw.js`) y sugerencia de instalación por sesión

---

## 2. Módulos y Flujo de Pantallas

1. **Inicio de Sesión (`/`, `/login`):**
   - Acceso mediante correo/contraseña o Google OAuth con Supabase.
   - Si no hay variables de entorno configuradas, habilita un modo de prueba local para explorar la plataforma.
2. **Panel Principal (`/inicio`):**
   - Hub de navegación responsivo (1 columna en móvil, 2×2 en tableta, 4 columnas en escritorio) hacia los cuatro módulos principales y resumen del estado del diagnóstico en curso.
3. **Carga de Datos y Diagnóstico (`/carga-datos`):**
   - **Cuestionario en Línea:** Asistente paso a paso (`QuestionnaireWizard`) con guardado automático de borrador, modalidad rápida o extendida, y consentimiento informado (Ley 1581 de 2012).
   - **Importación / Exportación Excel y JSON:** Descarga de plantilla oficial o respuestas actuales y carga masiva con reporte de validación (`ImportDialog`, `ImportReport`).
4. **Mapa de Oportunidades TIC (`/mapa`):**
   - Catálogo curado de soluciones tecnológicas organizadas en **9 áreas empresariales**.
   - Resaltado automático de áreas prioritarias basado en los resultados del diagnóstico.
   - Buscador transversal y filtros rápidos (*Con IA*, *Open Source*, *100% Gratis*, *Freemium*, *Bajo Costo*).
   - Modales de detalle por área (`AreaDetailModal`) y guías prácticas de implementación en 3 pasos (`ToolImplementationModal`) con enlace directo al asistente.
5. **Asistente Conversacional (`/asistente`):**
   - Interfaz híbrida de chat por texto y voz (dictado por micrófono y lectura en voz alta).
   - Motor RAG conectado a n8n con respaldo local (`ragEngine.ts`) que responde saludos, cortesías, consultas sobre el diagnóstico y recomendaciones contextualizadas con tarjetas interactivas.
6. **Panel de Estadísticas (`/estadisticas`):**
   - Dashboard analítico de ancho completo con métricas KPI clave (Índice Global de Madurez, Brechas Prioritarias, Pagos Digitales y Disciplina Financiera).
   - Gráficos interactivos: Radar de Madurez Digital por Área con tarjetas individuales detalladas, Brechas Prioritarias, Canales de Venta y Medios de Pago, Disciplina Financiera y Comparativa Nacional (DANE EMICRON).

---

## 3. Accesibilidad, Responsividad y PWA

- **Ajustes de Lectura (Barra Superior):** Botón con ícono de ojo (`Eye`) que abre un modal compacto para ajustar en tiempo real el tamaño de **Subtítulos y secciones** y **Textos descriptivos y guías** (*Normal*, *Grande*, *Muy Grande*), pensado especialmente para mejorar la visibilidad en adultos mayores.
- **Modo Claro y Modo Oscuro:** Interruptor (`Sun`/`Moon`) en la barra superior con persistencia en `localStorage` y alto contraste en todas las pantallas y gráficos.
- **Navegación Móvil Fija:** Barra superior fija (`fixed`) con menú hamburguesa superpuesto sobre el contenido para cambiar de sección desde cualquier punto del scroll.
- **Instalación como App (PWA):** Incluye manifiesto, iconos (`192×192`, `512×512` y SVG), Service Worker y un aviso compacto de instalación que reaparece al iniciar una nueva sesión si fue cerrado.

---

## 4. Sistema de Diseño (Design System)

### Identidad y Paleta de Colores
- **Verde Principal (Primary):** `#163A2B`
- **Verde Oscuro (Dark Surface):** `#0E261C`
- **Verde Menta (Accent):** `#86CEAB` / `#E8F5EE`
- **Fondo Claro (Light Background):** `#F4F6F4`
- **Superficies / Tarjetas:** `#FFFFFF` (Modo Claro) / `#12281E` (Modo Oscuro)
- **Texto Principal:** `#1E1E1E` (Modo Claro) / `#F0F5F2` (Modo Oscuro)
- **Texto Secundario:** `#666666` (Modo Claro) / `#B4CFC2` (Modo Oscuro)

### Activos Gráficos (`public/`)
- `hera-logo-dark.svg`, `hera-logo-light.svg`, `hera-logo.svg`: Wordmark tipográfico oficial de HERA.
- `hera-favicon.svg`, `pwa-192x192.png`, `pwa-512x512.png`: Iconografía de la aplicación y PWA.

---

## 5. Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Configurar variables de entorno (opcional para modo local):**
   Copia `.env.example` a `.env` y completa las credenciales si usarás Supabase o el webhook de n8n:
   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_N8N_WEBHOOK_URL=
   ```
3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
4. **Generar compilación de producción:**
   ```bash
   npm run build
   ```
