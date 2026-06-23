import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: { layout: 'centered' },
  args: { children: 'Label' },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Paired with an `Input` via `htmlFor` / `id` for standalone use. */
export const WithInput: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-1.5">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="JaneDoe" />
    </div>
  ),
};
