import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  async viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        '@/components/ui': resolve(
          import.meta.dirname,
          '../registry/nebari/ui',
        ),
        '@': resolve(import.meta.dirname, '../registry/nebari'),
      },
    };
    // Vite 8's Rolldown dep optimizer otherwise serves React's CJS entry raw,
    // without synthesizing a `default` export, so Storybook's internal
    // `import React from "react"` fails at runtime. Force the React packages
    // to be pre-bundled (include) with ESM interop (needsInterop).
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        'react',
        'react-dom',
        'react-dom/client',
      ],
      needsInterop: [
        ...(viteConfig.optimizeDeps?.needsInterop ?? []),
        'react',
        'react-dom',
        'react-dom/client',
      ],
    };
    return viteConfig;
  },
};

export default config;
