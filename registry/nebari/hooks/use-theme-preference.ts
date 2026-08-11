import { useCallback, useEffect, useState } from 'react';

const THEME_MODES = ['light', 'dark', 'system'] as const;

type ThemeMode = (typeof THEME_MODES)[number];

/** Storage key used when the caller doesn't pass one. */
const DEFAULT_THEME_STORAGE_KEY = 'nebari:themeMode';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === 'string' &&
    (THEME_MODES as readonly string[]).includes(value)
  );
}

interface UseThemePreferenceOptions {
  /**
   * `localStorage` key the preference persists under. Keep an app's existing
   * key so users don't lose their saved preference.
   *
   * Read once when the hook mounts — pass a constant. Changing it later
   * redirects writes without re-reading the new key's stored value.
   *
   * @default 'nebari:themeMode'
   */
  storageKey?: string;
}

interface UseThemePreferenceResult {
  /** The persisted preference: `'light'`, `'dark'`, or `'system'`. */
  themeMode: ThemeMode;
  /** The resolved appearance — in `'system'` mode this follows the OS. */
  isDarkMode: boolean;
  /** Update (and persist) the preference. */
  setThemeMode: (mode: ThemeMode) => void;
}

function readStoredMode(storageKey: string): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (isThemeMode(stored)) {
      return stored;
    }
  } catch {
    // Storage unavailable (private browsing, disabled cookies) — the
    // preference lives in memory for this session.
  }
  return 'system';
}

function prefersDark(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.matchMedia(DARK_SCHEME_QUERY).matches;
  } catch {
    return false;
  }
}

/**
 * Theme/dark-mode state for apps built on the Nebari theme tokens. Persists a
 * `light` / `dark` / `system` preference, follows the OS while in `system`
 * mode, and toggles the `.dark` class on `<html>` so every token-styled
 * component re-themes automatically.
 *
 * Mount it exactly once (directly or via `ThemeProvider`) — multiple instances
 * would compete over the `<html>` class.
 */
function useThemePreference(
  options: UseThemePreferenceOptions = {},
): UseThemePreferenceResult {
  const { storageKey = DEFAULT_THEME_STORAGE_KEY } = options;

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() =>
    readStoredMode(storageKey),
  );
  const [systemPrefersDark, setSystemPrefersDark] =
    useState<boolean>(prefersDark);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      try {
        window.localStorage.setItem(storageKey, mode);
      } catch {
        // Storage unavailable — keep the in-memory preference.
      }
    },
    [storageKey],
  );

  // Keep `system` mode in sync with the OS preference as it changes. Both
  // `matchMedia` and the `MediaQueryList` event API are guarded: an engine
  // missing either (Safari < 14 has no `addEventListener` here) keeps the
  // light default instead of throwing out of the effect.
  useEffect(() => {
    let mediaQuery: MediaQueryList;
    let onChange: (event: MediaQueryListEvent) => void;
    try {
      mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
      setSystemPrefersDark(mediaQuery.matches);
      onChange = (event: MediaQueryListEvent) =>
        setSystemPrefersDark(event.matches);
      mediaQuery.addEventListener('change', onChange);
    } catch {
      return;
    }

    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const isDarkMode =
    themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return { themeMode, isDarkMode, setThemeMode };
}

/**
 * Inline script that applies the saved (or OS) theme before first paint,
 * eliminating the flash of the wrong theme. It resolves `dark` exactly like
 * `useThemePreference` does, from the same storage key and default.
 *
 * Paste the returned string into a `<script>` at the top of `<head>` in
 * `index.html` (or inject it from an HTML template/SSR layer).
 */
function themeBootstrapScript(
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
): string {
  return [
    '(function () {',
    '  try {',
    `    var mode = localStorage.getItem(${JSON.stringify(storageKey)});`,
    `    var prefersDark = window.matchMedia('${DARK_SCHEME_QUERY}').matches;`,
    "    var isDark = mode === 'dark' || (mode !== 'light' && prefersDark);",
    "    document.documentElement.classList.toggle('dark', isDark);",
    '  } catch (e) {}',
    '})();',
  ].join('\n');
}

export type { ThemeMode, UseThemePreferenceOptions, UseThemePreferenceResult };
export {
  DEFAULT_THEME_STORAGE_KEY,
  isThemeMode,
  THEME_MODES,
  themeBootstrapScript,
  useThemePreference,
};
