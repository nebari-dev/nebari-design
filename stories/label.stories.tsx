import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: { layout: 'centered' },
  args: { children: 'Label' },
  argTypes: {
    children: {
      description: 'Label text describing the associated control.',
      control: 'text',
    },
    htmlFor: {
      description:
        'The `id` of the control this label names. Not needed inside a `Field` — Base UI wires the association through context; use it when pairing a standalone `Label` with an `Input`.',
      control: 'text',
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Paired with an `Input` via `htmlFor` / `id` for standalone use. */
export const WithInput: Story = {
  args: { children: 'Username' },
  // `htmlFor` stays pinned to the input's `id` — that pairing is the story.
  parameters: { controls: { include: ['children'] } },
  render: (args) => (
    <div className="flex w-64 flex-col gap-1.5">
      <Label {...args} htmlFor="username" />
      <Input id="username" placeholder="JaneDoe" />
    </div>
  ),
};
