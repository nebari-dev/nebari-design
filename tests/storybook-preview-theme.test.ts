import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { describe, expect, it } from 'vitest';
import { syncPreviewTheme } from '../.storybook/theme';

describe('Storybook preview theme', () => {
  it('follows theme global updates outside story decorators', () => {
    const listeners = new Map<string, (payload: unknown) => void>();
    syncPreviewTheme({
      on: (event, listener) => {
        listeners.set(event, listener as (payload: unknown) => void);
      },
    });

    expect(document.documentElement).not.toHaveClass('dark');

    listeners.get(GLOBALS_UPDATED)?.({
      globals: { theme: 'dark' },
    });

    expect(document.documentElement).toHaveClass('dark');
    expect(document.body).toHaveStyle({
      backgroundColor: 'var(--background)',
    });
  });
});
