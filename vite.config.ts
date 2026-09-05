import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      // Registry sources import siblings as `@/components/ui/<name>` — the
      // path the shadcn CLI emits for a consumer's default aliases — so map
      // that prefix onto `registry/nebari/ui` ahead of the `@/*` catch-all.
      '@/components/ui': resolve(__dirname, './registry/nebari/ui'),
      '@': resolve(__dirname, './registry/nebari'),
    },
  },
});
