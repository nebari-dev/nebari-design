import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '@/ui/spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Minimal loading spinner — an `animate-spin` wrapper around lucide’s `LoaderCircle`. Exposes `role="status"` so assistive tech announces it, and is used by `Button`’s `loading` state.',
      },
    },
  },
  argTypes: {
    size: {
      description:
        'Diameter preset. `default` adds no `size-*` class so the spinner inherits its size from a parent (e.g. `Button`); the other sizes are for standalone use.',
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
      table: { defaultValue: { summary: 'default' } },
    },
    label: {
      description:
        'Accessible name announced by assistive tech, set as the `aria-label`. Screen-reader only — it does not render visible text.',
      control: 'text',
      table: { defaultValue: { summary: 'Loading' } },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'The default spinner. The `default` size adds no `size-*` class, so it falls back to lucide’s own icon size.',
      },
    },
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  parameters: {
    docs: {
      description: {
        story:
          'The explicit standalone sizes, from `xs` to `xl`. (`default` is shown in the middle and inherits its size rather than setting one.)',
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Spinner {...args} size="xs" />
      <Spinner {...args} size="sm" />
      <Spinner {...args} size="default" />
      <Spinner {...args} size="lg" />
      <Spinner {...args} size="xl" />
    </div>
  ),
};

export const CustomColor: Story = {
  name: 'Custom color',
  parameters: {
    docs: {
      description: {
        story:
          'The spinner uses `currentColor`, so its color follows the surrounding text color — set it via a `text-*` class on `className`.',
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Spinner {...args} className="text-primary" size="lg" />
      <Spinner {...args} className="text-destructive-foreground" size="lg" />
      <Spinner {...args} className="text-muted-foreground" size="lg" />
    </div>
  ),
};

export const WithText: Story = {
  name: 'With visible text',
  parameters: {
    docs: {
      description: {
        story:
          'The spinner is icon-only. For visible loading text, pair it with text at the call site — this is how `Button` renders its `loadingText`.',
      },
    },
  },
  render: (args) => (
    // The spinner is icon-only; pair it with text at the call site (this is how
    // `Button` renders its `loadingText`).
    <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
      <Spinner {...args} size="sm" />
      Fetching data…
    </span>
  ),
};

export const CustomLabel: Story = {
  name: 'Custom accessible label',
  parameters: {
    docs: {
      description: {
        story:
          'The `label` prop sets the `aria-label` (screen-reader only) — nothing changes visually. Inspect the rendered `<svg>` to see `aria-label="Fetching data…"`.',
      },
    },
  },
  args: { size: 'lg', label: 'Fetching data…' },
};
