import { resolve } from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Local-only browser test for the complete Lucide icon gallery.
 *
 * The default Vitest configuration excludes `icons-gallery` because rendering
 * and axe-scanning the full catalog can exceed the GitHub Actions timeout.
 * Run this standalone configuration with `bun run test:icons`.
 */
export default defineConfig({
  plugins: [
    storybookTest({
      configDir: resolve(__dirname, '.storybook'),
      tags: {
        include: ['icons-gallery'],
        exclude: [],
        skip: [],
      },
    }),
  ],
  test: {
    name: 'icons',
    testTimeout: 60_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
