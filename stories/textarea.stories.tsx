import { Field as FieldPrimitive } from '@base-ui/react/field';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
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

/** Disabled is dimmed, non-interactive, and cannot be resized. */
export const Disabled: Story = { args: { disabled: true } };

/**
 * The error state pairs the 2px `destructive` outline with a trailing
 * `triangle-alert` icon and a `FieldError` message, so it's conveyed by more
 * than color alone (WCAG 1.4.1).
 */
export const WithError: Story = {
  render: () => (
    <Field>
      <FieldLabel>Description</FieldLabel>
      <FieldPrimitive.Control render={<Textarea aria-invalid />} />
      <FieldError match>This field is required.</FieldError>
    </Field>
  ),
};

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
