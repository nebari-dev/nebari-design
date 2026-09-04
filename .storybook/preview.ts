import type { Preview } from '@storybook/react-vite';
import { addons } from 'storybook/preview-api';
// Brand webfonts referenced by the `--font-sans` / `--font-mono` tokens.
import '@fontsource-variable/geist';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../registry/nebari/globals.css';
import './preview.css';
import { syncPreviewTheme } from './theme';

syncPreviewTheme(addons.getChannel());

const preview: Preview = {
  // Enables an autodocs page (with the "Show code" source snippet) for every
  // component, generated from its stories.
  tags: ['autodocs'],
  // This custom toolbar remains the single theme control for both Storybook
  // contexts: the preview channel themes the iframe while manager.ts observes
  // the same global to theme the application chrome.
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
  parameters: {
    // Sidebar order: the Introduction landing page first, then the Style
    // Guide, then Components, then Hooks; anything else falls to the end
    // alphabetically.
    options: {
      storySort: {
        order: [
          'Introduction',
          'Style Guide',
          ['Colors', 'Typography', 'Icons'],
          'Components',
          'Hooks',
        ],
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
