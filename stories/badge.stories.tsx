import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Check, Circle, TrendingUp } from 'lucide-react';
import { Badge } from '@/ui/badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Badge implemented from the Nebari Figma spec — a small chip for statuses, counts, and tags. Variants are driven by `class-variance-authority`; polymorphism is provided by Base UI’s `render` prop, so a `Badge` can become a link (or any element) while keeping its styling.',
      },
    },
  },
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      description: 'Visual style of the badge.',
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost'],
      table: { defaultValue: { summary: 'default' } },
    },
    children: {
      description:
        'Badge content — text, and optionally a leading/trailing icon.',
      control: 'text',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: 'The default badge — solid primary fill.',
      },
    },
  },
};

export const Variants: Story = {
  name: 'Variants',
  parameters: {
    docs: {
      description: {
        story:
          'All five visual styles. `destructive` is a soft tinted style (not solid red); `outline` is unfilled with a border; `ghost` is unfilled with no border.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="default">
        Default
      </Badge>
      <Badge {...args} variant="secondary">
        Secondary
      </Badge>
      <Badge {...args} variant="destructive">
        Destructive
      </Badge>
      <Badge {...args} variant="outline">
        Outline
      </Badge>
      <Badge {...args} variant="ghost">
        Ghost
      </Badge>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  name: 'With leading icon',
  parameters: {
    docs: {
      description: {
        story:
          'A leading icon is a common status pattern (`● Active`). The icon is a plain child — the badge handles the gap — and the badge stays a static label, with no link/button interaction cues.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="outline">
        <Circle className="fill-current" />
        Active
      </Badge>
      <Badge {...args} variant="secondary">
        <Circle className="fill-current" />
        Pending
      </Badge>
      <Badge {...args} variant="destructive">
        <Circle className="fill-current" />
        Error
      </Badge>
    </div>
  ),
};

export const WithTrailingIcon: Story = {
  name: 'With trailing icon',
  parameters: {
    docs: {
      description: {
        story:
          'A trailing icon should be decorative — it stays a static label, with no link/button interaction cues. Avoid icons that imply navigation (e.g. an external-link arrow); use the `render` prop to make an interactive, link badge instead.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="outline">
        Verified
        <Check />
      </Badge>
      <Badge {...args} variant="default">
        Trending
        <TrendingUp />
      </Badge>
      <Badge {...args} variant="destructive">
        Alert
        <Bell />
      </Badge>
    </div>
  ),
};

export const AsLink: Story = {
  name: 'Render as link',
  parameters: {
    docs: {
      description: {
        story:
          'Via Base UI’s `render` prop the badge becomes an `<a>` while keeping all of its styling and slot attributes.',
      },
    },
  },
  render: (args) => (
    // biome-ignore lint/a11y/useAnchorContent: Badge injects children into the rendered anchor.
    <Badge {...args} render={<a href="https://nebari.dev" />}>
      nebari.dev
    </Badge>
  ),
};
