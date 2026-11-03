# Hera - Plataforma de Diagnóstico y Gestión Tecnológica Empresarial
**Desarrollado por:** Grupo Senzaccento

---

## 1. Resumen de Funcionamiento del MVP
Hera es una plataforma web orientada a la evaluación, estructuración y analítica tecnológica para empresas. El MVP permite llevar a cabo un flujo completo desde el diagnóstico hasta el monitoreo estadístico.

### Módulos y Flujo de Pantallas:
1. **Inicio de Sesión (`index.html`):** Portal de acceso institucional con credenciales o autenticación mediante Google y Facebook.
2. **Panel Principal (`inicio.html`):** Hub de navegación del MVP Hera para acceder a los cuatro módulos interactivos.
3. **Carga de Datos (`carga-datos.html`):** Interfaz para la importación de archivos contables/financieros o la resolución de un cuestionario guiado de diagnóstico.
4. **Mapa de Oportunidades (`mapa.html`):** Catálogo interactivo de soluciones tecnológicas categorizadas en 6 áreas de la empresa (Financiera, RRHH, Marketing, Producción, Administración y Logística).
5. **Asistente (`asistente.html`):** Interfaz conversacional híbrida que combina un panel de chat paso a paso con una interfaz activa de reconocimiento por voz.
6. **Estadísticas (`estadisticas.html`):** Dashboard financiero y operativo que incluye:
   - **Menú Lateral Izquierdo:** Menú del espacio de trabajo con accesos a Menú, Finanzas, Tecnología, Inventario, Equipo, Configuración y Centro de Ayuda.
   - **Métricas KPi Top:** Ganancia neta, Ganancia por tecnología, Ingresos totales y Margen operativo.
   - **Gráficos Analíticos:** Comparativa mensual de ganancias (Barras) e Impacto del ROI tecnológico (Gráfico de Dona/Anillo).

---

## 2. Sistema de Diseño (Design System)

### Paleta de Colores
- **Verde Principal (Primary Dark):** `#163A2B`
- **Verde Oscuro Sidebar (Workspace Dark):** `#0E261C`
- **Verde Menta (Accent/Highlights):** `#86CEAB` / `#E8F5EE`
- **Fondo de Interfaz (Background):** `#F4F6F4`
- **Superficies / Tarjetas:** `#FFFFFF`
- **Texto Principal:** `#1E1E1E`
- **Texto Secundario:** `#666666`

### Áreas Temáticas (Mapa de Soluciones)
- **Financiera:** `#E5F6F0`
- **Recursos Humanos:** `#FDF2E9`
- **Marketing:** `#FCEBF5`
- **Producción:** `#F0EBF9`
- **Administración:** `#EBF3FB`
- **Logística:** `#E0F7FA`

### Tipografía y Escala
- **Familia Primaria:** `Segoe UI`, `Inter`, `system-ui`, sans-serif.
- **Títulos de Pantalla (H1):** `28px` | Bold (`700`)
- **Títulos de Sección (H2/H3):** `18px` - `22px` | SemiBold (`600`)
- **Texto Base (Body):** `14px` | Regular (`400`)
- **Labels / Captions:** `11px` - `12px` | Medium (`500`)

---

## 3. Instalación y Ejecución
1. Descarga e instala los archivos manteniendo exactamente la estructura de carpetas `css/`, `js/` y `.html`.
2. Para que las gráficas del módulo de **Estadísticas** se rendericen correctamente, se requiere conexión a internet para cargar la biblioteca **Chart.js** por CDN.
3. Abre `index.html` en el navegador para iniciar el prototipo.