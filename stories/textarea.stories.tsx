import { Field as FieldPrimitive } from '@base-ui-components/react/field';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldLabel } from '@/ui/field';
import { Textarea } from '@/ui/textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  args: { placeholder: 'Placeholder text' },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'A short description of this environment.' },
};

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = { args: { 'aria-invalid': true } };

/** Composed in a `Field` — rendered as the control so it auto-associates. */
export const WithField: Story = {
  render: () => (
    <Field>
      <FieldLabel>Description</FieldLabel>
      <FieldPrimitive.Control render={<Textarea />} />
      <FieldDescription>Markdown is supported.</FieldDescription>
    </Field>
  ),
};
