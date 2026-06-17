import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'storybook/preview-api';
import '../registry/nebari/globals.css';

const preview: Preview = {
  // Enables an autodocs page (with the "Show code" source snippet) for every
  // component, generated from its stories.
  tags: ['autodocs'],
  // Toolbar switcher for previewing components in light or dark themes. The
  // dark token set lives in `registry/nebari/globals.css` under `.dark`, and
  // the `dark` Tailwind variant targets `.dark *`, so the class is applied to
  // the preview's root element for every story (canvas and autodocs alike).
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'light';
      useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        // Match the preview chrome to the active theme's `--background` token.
        document.body.style.backgroundColor = 'var(--background)';
      }, [theme]);
      return Story();
    },
  ],
  parameters: {
    // Sidebar order: the Introduction landing page first, then the Style
    // Guide, then Components; anything else falls to the end alphabetically.
    options: {
      storySort: {
        order: ['Introduction', 'Style Guide', 'Components'],
      },
    },
    // Run axe in the Vitest addon's browser tests and fail the run on any
    // violation (the interactive a11y panel still reports them in the UI).
    a11y: { test: 'error' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
