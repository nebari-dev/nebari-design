import type { Preview } from '@storybook/react-vite';
import '../registry/nebari/globals.css';

const preview: Preview = {
  // Enables an autodocs page (with the "Show code" source snippet) for every
  // component, generated from its stories.
  tags: ['autodocs'],
  parameters: {
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
