import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button implemented from the Nebari Figma spec. Variants and sizes are driven by `class-variance-authority`; polymorphism is provided by Base UI’s `render` prop, so a `Button` can become a link (or any element) while keeping its styling.',
      },
    },
  },
  args: { children: 'Button' },
  argTypes: {
    variant: {
      description:
        'Visual style of the button. `link` uses the foreground text color and no fill.',
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      description:
        'Height and padding preset. The `icon-*` sizes are square and meant for a single icon child.',
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
      table: { defaultValue: { summary: 'default' } },
    },
    loading: {
      description:
        'Renders a `Spinner`, sets `aria-busy`, and disables the button while an async action is in flight. The spinner replaces the leading icon (or the whole content, for icon-only sizes).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    loadingText: {
      description:
        'Optional label shown beside the spinner while `loading`, replacing the button’s normal content (e.g. `"Saving…"`). Ignored for icon-only sizes.',
      control: 'text',
    },
    disabled: {
      description:
        'Disables the button and collapses it to the muted look shared with the loading state.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      description:
        'Button content — text, and optionally a leading/trailing icon.',
      control: 'text',
    },
    render: {
      description:
        'Base UI render-prop composition. Swap the default `<button type="button">` for another element — e.g. `render={<a href="…" />}` — while keeping the button\'s styling and slot attributes.',
      control: false,
      table: { defaultValue: { summary: '<button type="button" />' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'The default button — `default` variant at the `default` size.',
      },
    },
  },
};

export const Variants: Story = {
  name: 'Variants',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'All six visual styles. `default` is the solid primary fill; `destructive` is a soft tinted style (not solid red); `ghost` and `link` are unfilled.',
      },
    },
  },
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
  name: 'Sizes',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The four text sizes, from `xs` to `lg`. Padding, height, font size, and icon size all scale together.',
      },
    },
  },
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
  name: 'Icon sizes',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Square icon-only buttons. Pass a single icon child and an `aria-label` so the button stays accessible.',
      },
    },
  },
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
  name: 'With icon',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Icons can lead or trail the label. The gap between icon and text is handled by the button.',
      },
    },
  },
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
  name: 'Loading',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'While `loading`, a spinner replaces the leading icon and `loadingText` replaces the label. Icon-only buttons collapse to just the spinner.',
      },
    },
  },
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
  name: 'Disabled',
  parameters: {
    controls: { include: ['disabled'] },
    docs: {
      description: {
        story:
          'The disabled state collapses to a muted look and blocks pointer events. Loading shares this same muted treatment.',
      },
    },
  },
  args: { disabled: true },
};

export const AsLink: Story = {
  name: 'Render as link',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Via Base UI’s `render` prop the button becomes an `<a>` while keeping all of its styling and slot attributes.',
      },
    },
  },
  render: (args) => (
    <Button {...args} render={<a href="https://nebari.dev" />}>
      Go to nebari.dev
    </Button>
  ),
};
