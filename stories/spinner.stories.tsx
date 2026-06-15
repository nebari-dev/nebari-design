import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '@/ui/spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
    },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
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
  render: (args) => (
    <div className="flex items-center gap-4">
      <Spinner {...args} className="text-primary" size="lg" />
      <Spinner {...args} className="text-destructive" size="lg" />
      <Spinner {...args} className="text-muted-foreground" size="lg" />
    </div>
  ),
};

export const WithText: Story = {
  name: 'With visible text',
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
