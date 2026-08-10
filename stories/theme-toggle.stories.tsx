import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  THEME_MODES,
  type ThemeMode,
  useThemePreference,
} from '@/hooks/use-theme-preference';
import { Button } from '@/ui/button';

const MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * Demonstration of `useThemePreference` driving a light/dark/system control.
 * A dedicated storage key keeps the demo's persisted preference separate from
 * anything else on the Storybook origin.
 */
function ThemeToggleDemo() {
  const { themeMode, isDarkMode, setThemeMode } = useThemePreference({
    storageKey: 'nebari-storybook:themeMode',
  });

  return (
    <div className="flex flex-col items-start gap-4">
      <fieldset className="flex gap-2">
        <legend className="sr-only">Theme</legend>
        {THEME_MODES.map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={themeMode === mode ? 'default' : 'outline'}
            aria-pressed={themeMode === mode}
            onClick={() => setThemeMode(mode)}
          >
            {MODE_LABELS[mode]}
          </Button>
        ))}
      </fieldset>
      <p className="text-sm text-muted-foreground">
        Preference: <code>{themeMode}</code> — resolved:{' '}
        <code>{isDarkMode ? 'dark' : 'light'}</code>
      </p>
    </div>
  );
}

const meta = {
  title: 'Hooks/useThemePreference',
  component: ThemeToggleDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Theme/dark-mode state for consumer apps: `useThemePreference` persists a ' +
          '`light` / `dark` / `system` preference under a configurable `storageKey`, follows ' +
          'the OS while in `system` mode, and toggles the `.dark` class on `<html>` so every ' +
          'token-styled component re-themes automatically. Install with ' +
          '`npx shadcn add @nebari/use-theme-preference`, which also ships `ThemeProvider` / ' +
          '`useTheme` for sharing one instance app-wide and `themeBootstrapScript()` for ' +
          'pre-paint flash prevention. The buttons below drive the real hook — selecting ' +
          '**Dark** re-themes this preview exactly as it would an app (the toolbar theme ' +
          'switcher writes to the same `<html>` class, so the last control used wins).',
      },
    },
  },
} satisfies Meta<typeof ThemeToggleDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
