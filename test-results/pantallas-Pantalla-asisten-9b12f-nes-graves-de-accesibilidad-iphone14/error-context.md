# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pantallas.spec.ts >> Pantalla: asistente >> no tiene violaciones graves de accesibilidad
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
  - main [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - heading "WhatsApp Business" [level=3] [ref=e20]
            - generic [ref=e21]: Tecnología en foco
          - paragraph [ref=e22]: Versión gratuita de WhatsApp para negocios.
          - generic [ref=e23]:
            - generic [ref=e24]:
              - strong [ref=e25]: "Usted:"
              - text: ¿Cómo puedo vender mis productos por WhatsApp?
            - generic [ref=e26]:
              - strong [ref=e27]: "Asistente Hera:"
              - text: Cree una cuenta de WhatsApp Business, suba fotos y precios de sus productos y comparta el enlace con sus clientes.
        - generic [ref=e28]:
          - generic [ref=e29]:
            - textbox "Prefiero escribir... (presiona Enter)" [ref=e30]
            - button "Enviar" [ref=e31] [cursor=pointer]
          - button "Ver paso a paso" [ref=e36] [cursor=pointer]
      - generic [ref=e41]:
        - button "Escuchando" [ref=e42] [cursor=pointer]
        - generic [ref=e47] [cursor=pointer]
        - heading "Le estoy escuchando" [level=4] [ref=e49]
        - paragraph [ref=e50]: Hable con normalidad, yo le respondo.
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