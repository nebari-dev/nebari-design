import { resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const alias = { '@': resolve(__dirname, './registry/nebari') };

export default defineConfig({
  resolve: { alias },
  test: {
    coverage: {
      provider: 'v8',
      include: ['registry/nebari/**/*.{ts,tsx}'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    projects: [
      // Unit tests for the registry components (jsdom).
      {
        plugins: [react(), tailwindcss()],
        resolve: { alias },
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/**/*.test.{ts,tsx}'],
          exclude: ['tests/ssr.test.tsx'],
        },
      },
      // SSR-safety check for every registry:ui component (Node, no jsdom).
      {
        plugins: [react(), tailwindcss()],
        resolve: { alias },
        test: {
          name: 'ssr',
          globals: true,
          environment: 'node',
          include: ['tests/ssr.test.tsx'],
        },
      },
      // Every story rendered in a real browser (Playwright/Chromium), with the
      // a11y addon failing the run on axe violations (preview `a11y.test`).
      {
        plugins: [
          storybookTest({
            configDir: resolve(__dirname, '.storybook'),
            tags: {
              include: ['test'],
              exclude: ['icons-gallery'],
              skip: [],
            },
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
