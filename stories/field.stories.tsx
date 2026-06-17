import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldLabel } from '@/ui/field';
import { Switch } from '@/ui/switch';

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vertical stack — the default layout for a labeled control. */
export const Default: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel>Enable copy</FieldLabel>
      <Switch defaultChecked />
      <FieldDescription>Allow users to copy this environment</FieldDescription>
    </Field>
  ),
};

/** Inline layout — label and description on the left, control on the right. */
export const Inline: Story = {
  render: () => (
    <Field className="w-64 flex-row items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <FieldLabel>Enable copy</FieldLabel>
        <FieldDescription>
          Allow users to copy this environment
        </FieldDescription>
      </div>
      <Switch defaultChecked />
    </Field>
  ),
};
