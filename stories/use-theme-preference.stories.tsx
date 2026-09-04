import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import {
  THEME_MODES,
  type ThemeMode,
  useThemePreference,
} from '@/hooks/use-theme-preference';
import { Button } from '@/ui/button';
import {
  THEME_MODE_LABELS,
  useReturnThemeToToolbar,
} from './theme-story-helpers';

/** Keeps the demo's persisted writes off any other key on this origin. */
const STORYBOOK_STORAGE_KEY = 'nebari-storybook:themeMode';

interface ThemeToggleDemoProps {
  storageKey?: string;
  /** Documentation-only row for the hook return value. */
  themeMode?: ThemeMode;
  /** Documentation-only row for the hook return value. */
  isDarkMode?: boolean;
  /** Documentation-only row for the hook return value. */
  setThemeMode?: (mode: ThemeMode) => void;
  /** The Storybook toolbar's `theme` global, passed in by the story render. */
  toolbarMode?: 'light' | 'dark';
}

/** Demonstration of `useThemePreference` driving a theme control. */
function ThemeToggleDemo({
  storageKey,
  toolbarMode = 'light',
}: ThemeToggleDemoProps) {
  const { themeMode, isDarkMode, setThemeMode } = useThemePreference({
    storageKey,
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
            {THEME_MODE_LABELS[mode]}
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
  args: {
    storageKey: STORYBOOK_STORAGE_KEY,
  },
  argTypes: {
    storageKey: {
      description:
        '`useThemePreference` option selecting the `localStorage` key used to persist the preference.',
      control: false,
      table: {
        category: 'useThemePreference options',
        defaultValue: { summary: 'nebari:themeMode' },
        type: { summary: 'string' },
      },
    },
    themeMode: {
      description:
        "Current persisted preference: `'light'`, `'dark'`, or `'system'`.",
      control: false,
      table: {
        category: 'useThemePreference return',
        type: { summary: "'light' | 'dark' | 'system'" },
      },
    },
    isDarkMode: {
      description:
        'Resolved appearance; in system mode it follows the operating-system preference.',
      control: false,
      table: {
        category: 'useThemePreference return',
        type: { summary: 'boolean' },
      },
    },
    setThemeMode: {
      description:
        'Updates the current preference and persists it under `storageKey`.',
      control: false,
      table: {
        category: 'useThemePreference return',
        type: { summary: '(mode: ThemeMode) => void' },
      },
    },
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
  render: (args, { globals }) => (
    <ThemeToggleDemo
      {...args}
      toolbarMode={globals.theme === 'dark' ? 'dark' : 'light'}
    />
  ),
  // `system` is deliberately not asserted: it resolves from the host OS, which
  // differs between a developer's browser and headless Chromium.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByText(/^Preference:/);

    const dark = canvas.getByRole('button', { name: 'Dark' });
    await userEvent.click(dark);
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    await expect(status).toHaveTextContent('Preference: dark');
    await expect(status).toHaveTextContent('resolved: dark');

    const light = canvas.getByRole('button', { name: 'Light' });
    await userEvent.click(light);
    await expect(light).toHaveAttribute('aria-pressed', 'true');
    await expect(status).toHaveTextContent('Preference: light');
    await expect(status).toHaveTextContent('resolved: light');
  },
};
