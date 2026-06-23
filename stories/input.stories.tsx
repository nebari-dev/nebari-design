import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
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

export const Invalid: Story = {
  args: { defaultValue: 'invalid@email', 'aria-invalid': true },
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

/**
 * Validates live from local state. The story holds the value in `useState` and
 * derives validity on each keystroke, toggling the `destructive` border
 * (`aria-invalid`) and the message together. Type a valid address to watch the
 * error resolve.
 */
export const WithError: Story = {
  render: function WithErrorStory() {
    const [value, setValue] = useState('not-an-email');
    const isInvalid =
      value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return (
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          placeholder="you@nebari.dev"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={isInvalid || undefined}
        />
        {isInvalid && (
          <FieldError match>Enter a valid email address.</FieldError>
        )}
      </Field>
    );
  },
};
