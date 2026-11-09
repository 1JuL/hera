import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Screens of the app and a short name for the test titles
const screens = [
  { path: '/', name: 'login' },
  { path: '/inicio', name: 'inicio' },
  { path: '/carga-datos', name: 'carga de datos' },
  { path: '/mapa', name: 'mapa de oportunidades' },
  { path: '/asistente', name: 'asistente' },
  { path: '/estadisticas', name: 'estadísticas' },
];

for (const screen of screens) {
  test.describe(`Pantalla: ${screen.name}`, () => {
    test('carga sin errores de consola', async ({ page }) => {
      const errors: string[] = [];
      // Collect every console error while the page loads
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(screen.path);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });

    test('no tiene scroll horizontal (RNF-05)', async ({ page }) => {
      await page.goto(screen.path);
      await page.waitForLoadState('networkidle');
      // The page must not be wider than the viewport
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('no tiene violaciones graves de accesibilidad', async ({ page }) => {
      await page.goto(screen.path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).analyze();
      // Only serious and critical problems fail the test
      const severe = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(severe.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  });
}

test('login: muestra campos de correo y contraseña', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('una ruta inexistente redirige a /inicio', async ({ page }) => {
  await page.goto('/ruta-que-no-existe');
  await expect(page).toHaveURL(/\/inicio$/);
});
