import { Field as FieldPrimitive } from '@base-ui/react/field';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import { Textarea } from '@/ui/textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  args: {
    'aria-invalid': false,
    disabled: false,
    placeholder: 'Placeholder text',
    readOnly: false,
    required: false,
    rows: 2,
  },
  argTypes: {
    placeholder: {
      description: 'Hint text shown while the textarea is empty.',
      control: 'text',
    },
    defaultValue: {
      description: 'Initial value when the textarea is uncontrolled.',
      control: 'text',
    },
    value: {
      description:
        'Controlled value. Pair it with `onChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    rows: {
      description:
        'Visible line count. The control also has a `min-h-16` floor, so small values are clamped by the minimum height.',
      control: { type: 'number', min: 1, max: 12, step: 1 },
    },
    disabled: {
      description:
        'Dims the textarea to `bg-muted`, blocks pointer events, and disables resizing.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      description:
        'Marks the textarea as required for native and Base UI `Field` validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      description:
        'Keeps the value focusable and selectable but not editable — still resizeable, unlike `disabled`.',
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
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'A short description of this environment.' },
  parameters: { controls: { include: ['defaultValue', 'rows'] } },
};

/** Disabled is dimmed, non-interactive, and cannot be resized. */
export const Disabled: Story = {
  args: { disabled: true },
  parameters: { controls: { include: ['disabled', 'defaultValue'] } },
};

/**
 * The error state pairs the 2px `destructive` outline with a trailing
 * `triangle-alert` icon and a `FieldError` message, so it's conveyed by more
 * than color alone (WCAG 1.4.1).
 */
export const WithError: Story = {
  args: { 'aria-invalid': true },
  parameters: { controls: { include: ['aria-invalid', 'rows'] } },
  render: (args) => (
    <Field>
      <FieldLabel>Description</FieldLabel>
      <FieldPrimitive.Control render={<Textarea {...args} />} />
      <FieldError match>This field is required.</FieldError>
    </Field>
  ),
};

/** Composed in a `Field` — rendered as the control so it auto-associates. */
export const WithField: Story = {
  args: { placeholder: 'Describe this environment…' },
  parameters: {
    controls: { include: ['placeholder', 'rows', 'disabled', 'required'] },
  },
  render: (args) => (
    <Field>
      <FieldLabel>Description</FieldLabel>
      <FieldPrimitive.Control render={<Textarea {...args} />} />
      <FieldDescription>Markdown is supported.</FieldDescription>
    </Field>
  ),
};
