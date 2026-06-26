import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: { placeholder: 'Placeholder text' },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: 'you@nebari.dev' } };

export const Disabled: Story = { args: { disabled: true } };

/**
 * The error state pairs the 2px `destructive` outline with a trailing
 * `triangle-alert` icon and a `FieldError` message, so it's conveyed by more
 * than color alone (WCAG 1.4.1).
 */
export const WithError: Story = {
  render: () => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input defaultValue="invalid@email" aria-invalid />
      <FieldError match>Enter a valid email address.</FieldError>
    </Field>
  ),
};

/** Composed in a `Field` — label, description, and control auto-associate. */
export const WithField: Story = {
  render: () => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input placeholder="you@nebari.dev" />
      <FieldDescription>We'll never share your email.</FieldDescription>
    </Field>
  ),
};
