import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldLabel } from '@/ui/field';
import { Switch } from '@/ui/switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  args: {
    'aria-label': 'Enable setting',
    defaultChecked: true,
    disabled: false,
    required: false,
  },
  argTypes: {
    defaultChecked: {
      description: 'Initial state when the switch is uncontrolled.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    checked: {
      description:
        'Controlled state. Pair it with `onCheckedChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    disabled: {
      description:
        'Dims the track and thumb to 50% opacity and blocks pointer and keyboard interaction.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      description:
        'Marks the switch as required for Base UI `Field` validation — the switch must be on to pass.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    'aria-label': {
      description:
        'Accessible name for a standalone switch. Not needed inside a `Field` — `FieldLabel` names it instead.',
      control: 'text',
    },
    onCheckedChange: {
      description: 'Called with the next checked state on every toggle.',
      action: 'checked changed',
      control: false,
    },
    className: { table: { disable: true } },
    render: {
      description:
        'Base UI render-prop composition. Swap the rendered element while preserving switch behavior, styling, and slot attributes.',
      control: false,
    },
  },
  decorators: [
    // `defaultChecked` is read once on mount, so key the story on it to remount
    // when the control changes — otherwise the knob would silently do nothing.
    (Story, { args }) => <Story key={String(args.defaultChecked)} />,
  ],
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Off: Story = {
  args: { defaultChecked: false },
  parameters: { controls: { include: ['defaultChecked'] } },
};

export const Disabled: Story = {
  args: { defaultChecked: true, disabled: true },
  parameters: { controls: { include: ['defaultChecked', 'disabled'] } },
};

export const DisabledOff: Story = {
  args: { defaultChecked: false, disabled: true },
  parameters: { controls: { include: ['defaultChecked', 'disabled'] } },
};

/**
 * Compose the switch with a label and optional description. `Field` is the
 * idiomatic Base UI pattern: it auto-associates `FieldLabel` as the switch's
 * accessible name and links `FieldDescription` via `aria-describedby`, so no
 * manual `id` / `aria-labelledby` wiring is needed.
 */
export const WithLabel: Story = {
  parameters: { controls: { include: ['defaultChecked', 'disabled'] } },
  // `Field` supplies the accessible name, so `aria-label` is dropped here.
  render: ({ 'aria-label': _ariaLabel, ...args }) => (
    <Field className="w-64 flex-row items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <FieldLabel>Enable copy</FieldLabel>
        <FieldDescription>
          Allow users to copy this environment
        </FieldDescription>
      </div>
      <Switch {...args} />
    </Field>
  ),
};

/**
 * The "Box" style from the spec — the entire bordered card is the label, so
 * clicking anywhere toggles the switch.
 */
export const Box: Story = {
  parameters: { controls: { include: ['defaultChecked', 'disabled'] } },
  render: ({ 'aria-label': _ariaLabel, ...args }) => (
    <Field>
      <FieldLabel className="flex w-64 cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-background p-4 hover:bg-muted">
        Deep Research
        <Switch {...args} />
      </FieldLabel>
    </Field>
  ),
};
