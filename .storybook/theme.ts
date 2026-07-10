type ThemeChannel = {
  on: (
    event: string,
    listener: (payload: { globals: Record<string, unknown> }) => void,
  ) => void;
};

export const GLOBALS_UPDATED = 'globalsUpdated';

export function syncPreviewTheme(channel: ThemeChannel, target = document) {
  const setTheme = (theme: unknown) => {
    target.documentElement.classList.toggle('dark', theme === 'dark');
    target.body.style.backgroundColor = 'var(--background)';
  };

  setTheme('light');
  channel.on(GLOBALS_UPDATED, ({ globals }) => {
    setTheme(globals.theme);
  });
}
