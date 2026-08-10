import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '@/hooks/theme-provider';
import {
  DEFAULT_THEME_STORAGE_KEY,
  isThemeMode,
  THEME_MODES,
  themeBootstrapScript,
  useThemePreference,
} from '@/hooks/use-theme-preference';

type ChangeListener = (event: MediaQueryListEvent) => void;

/**
 * jsdom has no `matchMedia`; install a controllable stand-in whose `matches`
 * can flip mid-test, firing registered `change` listeners like a real OS
 * preference change.
 */
function installMatchMedia(initialMatches = false) {
  const listeners = new Set<ChangeListener>();
  const state = { matches: initialMatches };

  const mediaQueryList = {
    get matches() {
      return state.matches;
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      listeners.delete(listener);
    }),
  };

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQueryList),
  );

  return {
    mediaQueryList,
    listeners,
    setMatches(next: boolean) {
      state.matches = next;
      const event = { matches: next } as MediaQueryListEvent;
      for (const listener of listeners) {
        listener(event);
      }
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('useThemePreference', () => {
  it('exposes the theme mode constants and guard', () => {
    expect(THEME_MODES).toEqual(['light', 'dark', 'system']);
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('midnight')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });

  it('defaults to system mode when nothing is stored', () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useThemePreference());

    expect(result.current.themeMode).toBe('system');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('honors a stored preference', () => {
    installMatchMedia(false);
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useThemePreference());

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement).toHaveClass('dark');
  });

  it('falls back to system when the stored value is invalid', () => {
    installMatchMedia(false);
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, 'midnight');
    const { result } = renderHook(() => useThemePreference());

    expect(result.current.themeMode).toBe('system');
  });

  it('reads and writes a caller-configured storage key', () => {
    installMatchMedia(false);
    window.localStorage.setItem('nebari-chat:themeMode', 'dark');
    const { result } = renderHook(() =>
      useThemePreference({ storageKey: 'nebari-chat:themeMode' }),
    );

    expect(result.current.themeMode).toBe('dark');

    act(() => result.current.setThemeMode('light'));
    expect(window.localStorage.getItem('nebari-chat:themeMode')).toBe('light');
    expect(window.localStorage.getItem(DEFAULT_THEME_STORAGE_KEY)).toBeNull();
  });

  it('follows the OS preference while in system mode', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useThemePreference());

    expect(result.current.themeMode).toBe('system');
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement).toHaveClass('dark');
  });

  it('flips isDarkMode when the OS preference changes in system mode', () => {
    const media = installMatchMedia(false);
    const { result } = renderHook(() => useThemePreference());

    expect(result.current.isDarkMode).toBe(false);

    act(() => media.setMatches(true));
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement).toHaveClass('dark');

    act(() => media.setMatches(false));
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('ignores the OS preference in explicit light and dark modes', () => {
    const media = installMatchMedia(true);
    const { result } = renderHook(() => useThemePreference());

    act(() => result.current.setThemeMode('light'));
    expect(result.current.isDarkMode).toBe(false);

    act(() => media.setMatches(false));
    act(() => result.current.setThemeMode('dark'));
    expect(result.current.isDarkMode).toBe(true);
  });

  it('toggles the .dark class on the document element', () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useThemePreference());

    act(() => result.current.setThemeMode('dark'));
    expect(document.documentElement).toHaveClass('dark');

    act(() => result.current.setThemeMode('light'));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('persists the preference and survives a remount', () => {
    installMatchMedia(false);
    const first = renderHook(() => useThemePreference());
    act(() => first.result.current.setThemeMode('dark'));
    first.unmount();

    const second = renderHook(() => useThemePreference());
    expect(second.result.current.themeMode).toBe('dark');
  });

  it('keeps working in memory when storage reads and writes throw', () => {
    installMatchMedia(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    const { result } = renderHook(() => useThemePreference());
    expect(result.current.themeMode).toBe('system');

    act(() => result.current.setThemeMode('dark'));
    expect(result.current.themeMode).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('stays light when matchMedia is unavailable', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => {
        throw new Error('not implemented');
      }),
    );

    const { result } = renderHook(() => useThemePreference());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('removes the media query listener on unmount', () => {
    const media = installMatchMedia(false);
    const { unmount } = renderHook(() => useThemePreference());

    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.mediaQueryList.removeEventListener).toHaveBeenCalled();
    expect(media.listeners.size).toBe(0);
  });
});

describe('ThemeProvider / useTheme', () => {
  function Consumer() {
    const { themeMode, isDarkMode, setThemeMode } = useTheme();
    return (
      <button type="button" onClick={() => setThemeMode('dark')}>
        {themeMode}:{String(isDarkMode)}
      </button>
    );
  }

  it('shares the hook state with descendants', () => {
    installMatchMedia(false);
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, 'dark');

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('dark:true');
  });

  it('passes its storageKey option through to the hook', () => {
    installMatchMedia(false);
    window.localStorage.setItem('app:themeMode', 'light');

    render(
      <ThemeProvider storageKey="app:themeMode">
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('light:false');
  });

  it('throws a clear error when useTheme is used outside a provider', () => {
    // Silence React's error boundary logging for the expected throw.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(
      'useTheme must be used within a <ThemeProvider>.',
    );
  });
});

describe('themeBootstrapScript', () => {
  it('embeds the default storage key', () => {
    expect(themeBootstrapScript()).toContain(
      `localStorage.getItem("${DEFAULT_THEME_STORAGE_KEY}")`,
    );
  });

  it('embeds a custom storage key', () => {
    expect(themeBootstrapScript('nebari-chat:themeMode')).toContain(
      'localStorage.getItem("nebari-chat:themeMode")',
    );
  });

  it('resolves dark exactly like the hook when executed pre-paint', () => {
    const media = installMatchMedia(false);
    const run = () => {
      new Function(themeBootstrapScript())();
    };

    // Stored dark wins over a light OS.
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, 'dark');
    run();
    expect(document.documentElement).toHaveClass('dark');

    // Stored light wins over a dark OS.
    media.setMatches(true);
    window.localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, 'light');
    run();
    expect(document.documentElement).not.toHaveClass('dark');

    // No stored preference follows the OS.
    window.localStorage.removeItem(DEFAULT_THEME_STORAGE_KEY);
    run();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('is non-fatal when storage is unavailable', () => {
    installMatchMedia(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    expect(() => {
      new Function(themeBootstrapScript())();
    }).not.toThrow();
  });
});
