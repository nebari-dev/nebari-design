import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalLink } from 'lucide-react';
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

export const WithIcon: Story = {
  name: 'With icon',
  parameters: {
    docs: {
      description: {
        story:
          'An icon can lead or trail the label; the gap is handled by the badge.',
      },
    },
  },
  render: (args) => (
    <Badge {...args} variant="secondary">
      Link
      <ExternalLink />
    </Badge>
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
