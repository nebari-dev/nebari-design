type ThemeChannel = {
  on: (
    event: string,
    listener: (payload: { globals: Record<string, unknown> }) => void,
  ) => void;
};

export const GLOBALS_UPDATED = 'globalsUpdated';

export function syncPreviewTheme(channel: ThemeChannel, target = document) {
  let currentTheme: 'light' | 'dark' | undefined;

  const setTheme = (theme: unknown) => {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    if (nextTheme === currentTheme) {
      return;
    }

    currentTheme = nextTheme;
    target.documentElement.classList.toggle('dark', nextTheme === 'dark');
    target.body.style.backgroundColor = 'var(--background)';
  };

  setTheme('light');
  channel.on(GLOBALS_UPDATED, ({ globals }) => {
    setTheme(globals.theme);
  });
}
