import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ThemeProvider, useTheme } from '@/hooks/theme-provider';
import { THEME_MODES, type ThemeMode } from '@/hooks/use-theme-preference';
import {
  THEME_MODE_LABELS,
  useReturnThemeToToolbar,
} from './theme-story-helpers';

/** Isolates the provider demo from app and sibling-story preferences. */
const STORYBOOK_STORAGE_KEY = 'nebari-storybook:useTheme';

interface ThemeProviderDemoProps {
  storageKey?: string;
  /** Documentation-only row for `ThemeProviderProps`. */
  children?: ReactNode;
  /** Documentation-only row for the `useTheme` return value. */
  themeMode?: ThemeMode;
  /** Documentation-only row for the `useTheme` return value. */
  isDarkMode?: boolean;
  /** Documentation-only row for the `useTheme` return value. */
  setThemeMode?: (mode: ThemeMode) => void;
  /** The Storybook toolbar's `theme` global. */
  toolbarMode?: 'light' | 'dark';
}

function ThemeToolbarSync({ toolbarMode }: { toolbarMode: 'light' | 'dark' }) {
  const { setThemeMode } = useTheme();

  useEffect(() => {
    setThemeMode(toolbarMode);
  }, [setThemeMode, toolbarMode]);

  useReturnThemeToToolbar(toolbarMode === 'dark');

  return null;
}

function ThemeControls() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">Shared theme</legend>
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
  );
}

function ThemeStatus() {
  const { themeMode, isDarkMode } = useTheme();

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-border bg-muted p-4 text-sm">
      <dt className="text-muted-foreground-strong">themeMode</dt>
      <dd>
        <code data-testid="theme-mode">{themeMode}</code>
      </dd>
      <dt className="text-muted-foreground-strong">isDarkMode</dt>
      <dd>
        <code data-testid="dark-mode">{String(isDarkMode)}</code>
      </dd>
    </dl>
  );
}

function ThemeProviderDemo({
  storageKey,
  toolbarMode = 'light',
}: ThemeProviderDemoProps) {
  return (
    <ThemeProvider storageKey={storageKey}>
      <ThemeToolbarSync toolbarMode={toolbarMode} />
      <div className="flex w-80 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div>
          <h2 className="font-semibold text-lg">Shared app theme</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            One descendant sets the preference; another reads the shared state.
          </p>
        </div>
        <ThemeControls />
        <ThemeStatus />
      </div>
    </ThemeProvider>
  );
}

function ThemeProviderMisuseDemo({
  storageKey,
  toolbarMode = 'light',
}: ThemeProviderDemoProps) {
  const [withProvider, setWithProvider] = useState(false);

  return (
    <div className="flex w-80 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div>
        <h2 className="font-semibold text-lg">Missing provider</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          The preview explains the failure safely, then mounts the status panel
          beneath a <code>ThemeProvider</code> when requested.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setWithProvider((previous) => !previous)}
      >
        {withProvider ? 'Remove ThemeProvider' : 'Add ThemeProvider'}
      </Button>
      {withProvider ? (
        <ThemeProvider storageKey={storageKey}>
          <ThemeToolbarSync toolbarMode={toolbarMode} />
          <ThemeStatus />
        </ThemeProvider>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>Render would fail</AlertTitle>
          <AlertDescription data-testid="provider-error">
            useTheme must be used within a &lt;ThemeProvider&gt;.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

const meta = {
  title: 'Hooks/useTheme',
  component: ThemeProviderDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`ThemeProvider` mounts one `useThemePreference` instance at the app root, and ' +
          '`useTheme` lets any descendant read or update that shared preference. Prefer ' +
          'this provider pattern over mounting `useThemePreference` in several places: it ' +
          'keeps a single owner for the `<html>` `.dark` class and a single shared state ' +
          'for the application. The controls and status panel below are separate descendants ' +
          'using the same provider. `useTheme` must be called below `ThemeProvider`; calling ' +
          'it outside the provider throws `useTheme must be used within a <ThemeProvider>.` — ' +
          'see the **Outside Provider** story. The demos use an isolated `storageKey`, follow ' +
          'the Storybook toolbar when opened, and restore the toolbar theme when unmounted.',
      },
    },
  },
  args: {
    storageKey: STORYBOOK_STORAGE_KEY,
  },
  argTypes: {
    storageKey: {
      description:
        '`ThemeProvider` prop passed to `useThemePreference`; selects the `localStorage` key used to persist the preference.',
      control: false,
      table: {
        category: 'ThemeProvider props',
        defaultValue: { summary: 'nebari:themeMode' },
        type: { summary: 'string' },
      },
    },
    children: {
      description:
        '`ThemeProvider` prop: the subtree allowed to call `useTheme`. Mount the provider once at the app root so every descendant shares one preference instance.',
      control: false,
      table: {
        category: 'ThemeProvider props',
        type: { summary: 'ReactNode' },
      },
    },
    themeMode: {
      description:
        "Current persisted preference returned by `useTheme`: `'light'`, `'dark'`, or `'system'`.",
      control: false,
      table: {
        category: 'useTheme return',
        type: { summary: "'light' | 'dark' | 'system'" },
      },
    },
    isDarkMode: {
      description:
        'Resolved appearance returned by `useTheme`; in system mode it follows the operating-system preference.',
      control: false,
      table: {
        category: 'useTheme return',
        type: { summary: 'boolean' },
      },
    },
    setThemeMode: {
      description:
        'Setter returned by `useTheme`; updates the shared preference and persists it.',
      control: false,
      table: {
        category: 'useTheme return',
        type: { summary: '(mode: ThemeMode) => void' },
      },
    },
    toolbarMode: { table: { disable: true }, control: false },
  },
} satisfies Meta<typeof ThemeProviderDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args, { globals }) => (
    <ThemeProviderDemo
      {...args}
      toolbarMode={globals.theme === 'dark' ? 'dark' : 'light'}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Dark' }));
    await expect(canvas.getByTestId('theme-mode')).toHaveTextContent('dark');
    await expect(canvas.getByTestId('dark-mode')).toHaveTextContent('true');

    await userEvent.click(canvas.getByRole('button', { name: 'Light' }));
    await expect(canvas.getByTestId('theme-mode')).toHaveTextContent('light');
    await expect(canvas.getByTestId('dark-mode')).toHaveTextContent('false');
  },
};

export const OutsideProvider: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`useTheme` reads a context that has no default value, so calling it above ' +
          '`ThemeProvider` throws rather than silently returning a stale or empty theme. ' +
          'The preview shows that exact error as copy instead of deliberately throwing and ' +
          'crashing the story. Add the provider to render the shared state safely.',
      },
    },
  },
  render: (args, { globals }) => (
    <ThemeProviderMisuseDemo
      {...args}
      toolbarMode={globals.theme === 'dark' ? 'dark' : 'light'}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('provider-error')).toHaveTextContent(
      'useTheme must be used within a <ThemeProvider>.',
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Add ThemeProvider' }),
    );
    await expect(canvas.getByTestId('theme-mode')).toBeInTheDocument();
    await expect(
      canvas.queryByTestId('provider-error'),
    ).not.toBeInTheDocument();
  },
};
