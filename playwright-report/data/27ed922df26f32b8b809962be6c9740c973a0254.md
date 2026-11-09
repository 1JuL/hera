# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pantallas.spec.ts >> Pantalla: login >> no tiene violaciones graves de accesibilidad
- Location: tests\e2e\pantallas.spec.ts:38:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "label: Form elements must have labels",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Senzaccento" [level=2] [ref=e5]
  - generic [ref=e6]:
    - heading "Sign In" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - text: Don't have an account?
      - button "Create now" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: E-mail
        - textbox [ref=e13]: example@gmail.com
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - textbox [ref=e16]: "********"
      - button "Sign in" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - button "Continue with Google" [ref=e19] [cursor=pointer]
      - button "Continue with Facebook" [ref=e25] [cursor=pointer]
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