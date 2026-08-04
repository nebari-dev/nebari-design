import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldLabel } from '@/ui/field';
import { Switch } from '@/ui/switch';

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: { layout: 'centered' },
  args: { disabled: false, invalid: false },
  argTypes: {
    name: {
      description:
        'Form field name. Base UI uses it for form submission and to key validation state.',
      control: 'text',
    },
    disabled: {
      description:
        'Disables the whole field. `FieldLabel` picks up `data-disabled` and dims alongside the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      description:
        'Forces the field into its invalid state, which controls-inside-the-field read via `data-invalid` and which reveals a matching `FieldError`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
    children: {
      description:
        'Composed content — a `FieldLabel`, the control itself, and a `FieldDescription` or `FieldError`. Base UI wires the label, description, and control together through field context.',
      control: false,
    },
    render: {
      description:
        'Base UI render-prop composition. Swap the field container element while preserving field context, styling, and slot attributes.',
      control: false,
    },
    validate: { table: { disable: true } },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vertical stack — the default layout for a labeled control. */
export const Default: Story = {
  render: (args) => (
    <Field {...args} className="w-64">
      <FieldLabel>Enable copy</FieldLabel>
      <Switch defaultChecked />
      <FieldDescription>Allow users to copy this environment</FieldDescription>
    </Field>
  ),
};

/** Inline layout — label and description on the left, control on the right. */
export const Inline: Story = {
  parameters: { controls: { include: ['disabled', 'invalid'] } },
  render: (args) => (
    <Field
      {...args}
      className="w-64 flex-row items-start justify-between gap-4"
    >
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
