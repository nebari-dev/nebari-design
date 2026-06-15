import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Button' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: [
        'xs',
        'sm',
        'default',
        'lg',
        'icon-xs',
        'icon-sm',
        'icon',
        'icon-lg',
      ],
    },
    loading: { control: 'boolean' },
    loadingText: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const IconSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} aria-label="Add" size="icon-xs">
        <Plus />
      </Button>
      <Button {...args} aria-label="Add" size="icon-sm">
        <Plus />
      </Button>
      <Button {...args} aria-label="Add" size="icon">
        <Plus />
      </Button>
      <Button {...args} aria-label="Add" size="icon-lg">
        <Plus />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Plus />
        New project
      </Button>
      <Button {...args} variant="outline">
        Continue
        <ArrowRight />
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 />
        Delete
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} loading loadingText="Saving…">
        Save
      </Button>
      <Button {...args} loading loadingText="Creating…">
        <Plus />
        New project
      </Button>
      <Button {...args} loading loadingText="Saving…">
        <Plus />
        Save
      </Button>
      <Button
        {...args}
        aria-label="Add"
        loading
        size="icon"
        loadingText="Adding…"
      >
        <Plus />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AsLink: Story = {
  name: 'Render as link',
  render: (args) => (
    // biome-ignore lint/a11y/useAnchorContent: Button injects children into the rendered anchor.
    <Button {...args} render={<a href="https://nebari.dev" />}>
      Go to nebari.dev
    </Button>
  ),
};
