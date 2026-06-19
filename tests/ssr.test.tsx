/**
 * SSR-safety check for every `registry:ui` component.
 *
 * Auto-discovers components from `registry.json` and verifies each one:
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
}

const registry = JSON.parse(
  readFileSync(new URL('../registry.json', import.meta.url), 'utf-8'),
) as { items: RegistryItem[] };

// Only `registry:ui` entries ship React components.
const uiItems = registry.items.filter((item) => item.type === 'registry:ui');

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
      const mod = await import(`@/ui/${item.name}.tsx`);
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

      const hasLayoutEffectWarning = errorSpy.mock.calls.some((args) =>
        args.some(
          (arg) =>
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
