import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import {
  THEME_MODES,
  type ThemeMode,
  useThemePreference,
} from '@/hooks/use-theme-preference';
import { Button } from '@/ui/button';

/** Keeps the demo's persisted writes off any other key on this origin. */
const STORYBOOK_STORAGE_KEY = 'nebari-storybook:themeMode';

const MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * The hook writes `.dark` to `<html>` — that's what this story demonstrates —
 * but `.storybook/preview.tsx` keeps the toolbar `theme` global as the single
 * source of truth for the preview. So hand the class back to the toolbar on the
 * way out, or a demo override would follow the reader into every other story.
 *
 * The value is read through a ref so a toolbar change mid-story doesn't run the
 * cleanup with the stale value.
 */
function useReturnThemeToToolbar(toolbarIsDark: boolean) {
  const toolbarIsDarkRef = useRef(toolbarIsDark);
  toolbarIsDarkRef.current = toolbarIsDark;

  useEffect(
    () => () => {
      document.documentElement.classList.toggle(
        'dark',
        toolbarIsDarkRef.current,
      );
    },
    [],
  );
}

interface ThemeToggleDemoProps {
  /** The Storybook toolbar's `theme` global, passed in by the story render. */
  toolbarMode?: 'light' | 'dark';
}

/**
 * Demonstration of `useThemePreference` driving a light/dark/system control.
 */
function ThemeToggleDemo({ toolbarMode = 'light' }: ThemeToggleDemoProps) {
  const { themeMode, isDarkMode, setThemeMode } = useThemePreference({
    storageKey: STORYBOOK_STORAGE_KEY,
  });

  // Adopt the toolbar on mount and on every toolbar change, so opening this
  // story never flips the preview out from under the switcher. The buttons
  // below then override until the next toolbar change.
  useEffect(() => {
    setThemeMode(toolbarMode);
  }, [toolbarMode, setThemeMode]);

  useReturnThemeToToolbar(toolbarMode === 'dark');

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
  argTypes: {
    // Story plumbing, not part of the hook's API.
    toolbarMode: { table: { disable: true }, control: false },
  },
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
          '**Dark** re-themes this preview exactly as it would an app. Because the toolbar ' +
          'theme switcher owns the same `<html>` class, this demo starts from whatever the ' +
          'toolbar has selected, re-adopts it whenever it changes, and restores it when you ' +
          'leave the story.',
      },
    },
  },
} satisfies Meta<typeof ThemeToggleDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_args, { globals }) => (
    <ThemeToggleDemo
      toolbarMode={globals.theme === 'dark' ? 'dark' : 'light'}
    />
  ),
};
