import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: {
    'aria-invalid': false,
    disabled: false,
    placeholder: 'Placeholder text',
    readOnly: false,
    required: false,
    type: 'text',
  },
  argTypes: {
    placeholder: {
      description: 'Hint text shown while the input is empty.',
      control: 'text',
    },
    defaultValue: {
      description: 'Initial value when the input is uncontrolled.',
      control: 'text',
    },
    value: {
      description:
        'Controlled value. Pair it with `onChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    type: {
      description:
        'Native input type. Drives the on-screen keyboard and browser-level validation.',
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      table: { defaultValue: { summary: 'text' } },
    },
    disabled: {
      description:
        'Dims the input to `bg-muted`, blocks pointer events, and removes it from the tab order.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      description:
        'Marks the input as required for native and Base UI `Field` validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      description: 'Keeps the value focusable and selectable but not editable.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    'aria-invalid': {
      description:
        'Renders the invalid state — a 2px `destructive` outline plus a trailing `triangle-alert` icon.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
  },
  decorators: [
    // `defaultValue` is mount-only, so the key forces a remount when it changes.
    (Story, { args }) => (
      <div className="w-64">
        <Story key={String(args.defaultValue)} />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'you@nebari.dev' },
  parameters: { controls: { include: [] } },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { controls: { include: [] } },
};

/**
 * The error state pairs the 2px `destructive` outline with a trailing
 * `triangle-alert` icon and a `FieldError` message, so it's conveyed by more
 * than color alone (WCAG 1.4.1).
 */
export const WithError: Story = {
  args: { 'aria-invalid': true, defaultValue: 'invalid@email' },
  parameters: { controls: { include: [] } },
  render: (args) => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input {...args} />
      <FieldError match>Enter a valid email address.</FieldError>
    </Field>
  ),
};

/** Composed in a `Field` — label, description, and control auto-associate. */
export const WithField: Story = {
  args: { placeholder: 'you@nebari.dev' },
  parameters: {
    controls: { include: [] },
  },
  render: (args) => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input {...args} />
      <FieldDescription>We'll never share your email.</FieldDescription>
    </Field>
  ),
};
