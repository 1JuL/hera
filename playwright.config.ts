import { defineConfig, devices } from '@playwright/test';

// Base URL can change: local by default, or a Vercel preview with E2E_BASE_URL
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './tests/e2e',
  // Fail the build if someone leaves test.only in the code
  forbidOnly: !!process.env.CI,
  // Retry once in CI to reduce flaky results
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // Keep a trace only when a test fails
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Start the built app automatically when we test locally
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4173',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  // Browser and device matrix from the QA plan (05-2-qa-interfaz.md)
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'android-pixel7', use: { ...devices['Pixel 7'] } },
    { name: 'iphone14', use: { ...devices['iPhone 14'] } },
    { name: 'small-360x640', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 640 } } },
    { name: 'tablet-768x1024', use: { ...devices['iPad (gen 7)'], viewport: { width: 768, height: 1024 } } },
  ],
});
