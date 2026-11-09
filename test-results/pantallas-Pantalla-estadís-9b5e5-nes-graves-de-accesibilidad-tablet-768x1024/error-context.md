# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pantallas.spec.ts >> Pantalla: estadísticas >> no tiene violaciones graves de accesibilidad
- Location: tests\e2e\pantallas.spec.ts:38:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "color-contrast: Elements must meet minimum color contrast ratio thresholds",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "Senzaccento Hera" [ref=e5]:
      - /url: /inicio
      - generic [ref=e6]: Senzaccento
      - generic [ref=e7]: Hera
    - navigation [ref=e8]:
      - link "Inicio" [ref=e9]:
        - /url: /inicio
      - link "Carga de Datos" [ref=e10]:
        - /url: /carga-datos
      - link "Mapa" [ref=e11]:
        - /url: /mapa
      - link "Asistente" [ref=e12]:
        - /url: /asistente
      - link "Estadísticas" [ref=e13]:
        - /url: /estadisticas
  - generic [ref=e15]:
    - complementary [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Espacio de trabajo
        - list [ref=e19]:
          - listitem [ref=e20]:
            - button "Menú" [ref=e21] [cursor=pointer]
          - listitem [ref=e28]:
            - button "Finanzas" [ref=e29] [cursor=pointer]
          - listitem [ref=e33]:
            - button "Tecnología" [ref=e34] [cursor=pointer]
          - listitem [ref=e38]:
            - button "Inventario" [ref=e39] [cursor=pointer]
          - listitem [ref=e45]:
            - button "Equipo" [ref=e46] [cursor=pointer]
          - listitem [ref=e53]:
            - button "Configuración" [ref=e54] [cursor=pointer]
          - listitem [ref=e59]:
            - button "Centro de ayuda" [ref=e60] [cursor=pointer]
      - generic [ref=e65]:
        - generic [ref=e66]: MG
        - generic [ref=e67]:
          - strong [ref=e68]: María García
          - generic [ref=e69]: Senzaccento
    - main [ref=e70]:
      - generic [ref=e71]:
        - generic [ref=e72]:
          - heading "Buenos días, María" [level=2] [ref=e73]
          - paragraph [ref=e74]: Aún no se ha completado el autodiagnóstico de tu negocio.
        - generic [ref=e75]:
          - link "Completar Cuestionario" [ref=e76]:
            - /url: /carga-datos
          - button "Ver con Datos Demo" [ref=e81] [cursor=pointer]
      - generic [ref=e86]:
        - heading "Diagnóstico no completado todavía" [level=3] [ref=e90]
        - paragraph [ref=e91]: Para visualizar las métricas reales de madurez por área, brechas prioritarias y mezcla de canales de tu negocio, completa el cuestionario rápido en el módulo de Carga de Datos.
        - generic [ref=e92]:
          - link "Ir a Carga de Datos y Diagnóstico" [ref=e93]:
            - /url: /carga-datos
          - button "Cargar negocio de ejemplo (Sabana Centro)" [ref=e94] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | // Screens of the app and a short name for the test titles
  5  | const screens = [
  6  |   { path: '/', name: 'login' },
  7  |   { path: '/inicio', name: 'inicio' },
  8  |   { path: '/carga-datos', name: 'carga de datos' },
  9  |   { path: '/mapa', name: 'mapa de oportunidades' },
  10 |   { path: '/asistente', name: 'asistente' },
  11 |   { path: '/estadisticas', name: 'estadísticas' },
  12 | ];
  13 | 
  14 | for (const screen of screens) {
  15 |   test.describe(`Pantalla: ${screen.name}`, () => {
  16 |     test('carga sin errores de consola', async ({ page }) => {
  17 |       const errors: string[] = [];
  18 |       // Collect every console error while the page loads
  19 |       page.on('console', (msg) => {
  20 |         if (msg.type() === 'error') errors.push(msg.text());
  21 |       });
  22 |       page.on('pageerror', (err) => errors.push(err.message));
  23 |       await page.goto(screen.path);
  24 |       await page.waitForLoadState('networkidle');
  25 |       expect(errors).toEqual([]);
  26 |     });
  27 | 
  28 |     test('no tiene scroll horizontal (RNF-05)', async ({ page }) => {
  29 |       await page.goto(screen.path);
  30 |       await page.waitForLoadState('networkidle');
  31 |       // The page must not be wider than the viewport
  32 |       const overflow = await page.evaluate(
  33 |         () => document.documentElement.scrollWidth - window.innerWidth
  34 |       );
  35 |       expect(overflow).toBeLessThanOrEqual(0);
  36 |     });
  37 | 
  38 |     test('no tiene violaciones graves de accesibilidad', async ({ page }) => {
  39 |       await page.goto(screen.path);
  40 |       await page.waitForLoadState('networkidle');
  41 |       const results = await new AxeBuilder({ page }).analyze();
  42 |       // Only serious and critical problems fail the test
  43 |       const severe = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
> 44 |       expect(severe.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
     |                                                       ^ Error: expect(received).toEqual(expected) // deep equality
  45 |     });
  46 |   });
  47 | }
  48 | 
  49 | test('login: muestra campos de correo y contraseña', async ({ page }) => {
  50 |   await page.goto('/');
  51 |   await expect(page.locator('input[type="email"]')).toBeVisible();
  52 |   await expect(page.locator('input[type="password"]')).toBeVisible();
  53 |   await expect(page.locator('button[type="submit"]')).toBeVisible();
  54 | });
  55 | 
  56 | test('una ruta inexistente redirige a /inicio', async ({ page }) => {
  57 |   await page.goto('/ruta-que-no-existe');
  58 |   await expect(page).toHaveURL(/\/inicio$/);
  59 | });
  60 | 
```