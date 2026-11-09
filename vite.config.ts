/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Vitest settings for unit tests
  test: {
    // Use jsdom so tests can use localStorage and the DOM
    environment: 'jsdom',
    // Allow describe/it/expect without importing them
    globals: true,
    // Only run test files that live inside src
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      // Use the V8 engine to measure coverage
      provider: 'v8',
      // Measure only the logic files we test (not UI components yet)
      include: [
        'src/features/stats/lib/**',
        'src/features/stats/benchmarks.ts',
        'src/features/diagnostic/schema/**/*.ts',
        'src/features/diagnostic/lib/**',
      ],
      reporter: ['text', 'html'],
    },
  },
});
