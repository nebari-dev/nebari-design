/**
 * SSR-safety check for every `registry:ui` component and `registry:hook` item.
 *
 * Auto-discovers items from `registry.json` and verifies each one:
 * 1. Does not throw during `renderToString`.
 * 2. Produces non-empty HTML.
 * 3. Does not emit React's "useLayoutEffect does nothing on the server" warning.
 *
 * Run in the `ssr` Vitest project (Node environment, no jsdom) so the test
 * surface matches what an actual SSR renderer sees.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface RegistryItem {
  name: string;
  type: string;
  files: { path: string; type: string }[];
}

const registry = JSON.parse(
  readFileSync(new URL('../registry.json', import.meta.url), 'utf-8'),
) as { items: RegistryItem[] };

// `registry:ui` and `registry:hook` entries ship React code.
const uiItems = registry.items.filter((item) => item.type === 'registry:ui');
const hookItems = registry.items.filter(
  (item) => item.type === 'registry:hook',
);

/** Convert a kebab-case registry name to the PascalCase export name. */
function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

describe('SSR safety — every registry:ui component', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Silence and capture React's server-render warnings so we can assert on them.
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  for (const item of uiItems) {
    const componentName = toPascalCase(item.name);

    it(`${item.name} (${componentName}) renders to non-empty HTML without useLayoutEffect warnings`, async () => {
      const mod = await import(`@/components/ui/${item.name}.tsx`);
      const Component = mod[componentName] as React.ComponentType | undefined;

      expect(
        Component,
        `Module @/ui/${item.name} does not export "${componentName}"`,
      ).toBeDefined();

      // biome-ignore lint/style/noNonNullAssertion: guarded by the toBeDefined assertion above
      const html = renderToString(createElement(Component!));

      expect(
        html.trim(),
        `${componentName} produced empty HTML on the server`,
      ).not.toBe('');

      const hasLayoutEffectWarning = errorSpy.mock.calls.some(
        (args: unknown[]) =>
          args.some(
            (arg: unknown) =>
              typeof arg === 'string' &&
              arg.includes('useLayoutEffect does nothing on the server'),
          ),
      );
      expect(
        hasLayoutEffectWarning,
        `${componentName} emitted "useLayoutEffect does nothing on the server"`,
      ).toBe(false);
    });
  }
});

describe('SSR safety — every registry:hook item', () => {
  // Import-time safety, auto-discovered: a hook file that touches `window`,
  // `document`, or `localStorage` at module scope throws here (Node has none).
  for (const item of hookItems) {
    for (const file of item.files) {
      const importPath = file.path.replace(/^registry\/nebari/, '@');

      it(`${file.path} imports on the server without touching browser globals`, async () => {
        await expect(import(importPath)).resolves.toBeDefined();
      });
    }
  }

  // Render-time safety needs a component to render, so each hook gets an
  // explicit probe below. A new registry:hook item must add its own.
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  function expectNoLayoutEffectWarning(name: string) {
    const hasLayoutEffectWarning = errorSpy.mock.calls.some((args: unknown[]) =>
      args.some(
        (arg: unknown) =>
          typeof arg === 'string' &&
          arg.includes('useLayoutEffect does nothing on the server'),
      ),
    );
    expect(
      hasLayoutEffectWarning,
      `${name} emitted "useLayoutEffect does nothing on the server"`,
    ).toBe(false);
  }

  it('useThemePreference renders on the server with system defaults', async () => {
    const { useThemePreference } = await import('@/hooks/use-theme-preference');

    function Probe() {
      const { themeMode, isDarkMode } = useThemePreference();
      return createElement('div', null, `${themeMode}:${isDarkMode}`);
    }

    const html = renderToString(createElement(Probe));

    // Without a window there is no stored preference and no OS signal.
    expect(html).toContain('system:false');
    expectNoLayoutEffectWarning('useThemePreference');
  });

  it('ThemeProvider + useTheme render on the server', async () => {
    const { ThemeProvider, useTheme } = await import('@/hooks/theme-provider');

    function Probe() {
      const { themeMode, isDarkMode } = useTheme();
      return createElement('div', null, `${themeMode}:${isDarkMode}`);
    }

    const html = renderToString(
      createElement(ThemeProvider, null, createElement(Probe)),
    );

    expect(html).toContain('system:false');
    expectNoLayoutEffectWarning('ThemeProvider');
  });
});
