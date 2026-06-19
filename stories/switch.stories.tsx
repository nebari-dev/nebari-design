import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldLabel } from '@/ui/field';
import { Switch } from '@/ui/switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: { 'aria-label': 'Enable setting', defaultChecked: true },
};

export const Off: Story = {
  args: { 'aria-label': 'Enable setting', defaultChecked: false },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'Enable setting',
    defaultChecked: true,
    disabled: true,
  },
};

export const DisabledOff: Story = {
  args: {
    'aria-label': 'Enable setting',
    defaultChecked: false,
    disabled: true,
  },
};

/**
 * Compose the switch with a label and optional description. `Field` is the
 * idiomatic Base UI pattern: it auto-associates `FieldLabel` as the switch's
 * accessible name and links `FieldDescription` via `aria-describedby`, so no
 * manual `id` / `aria-labelledby` wiring is needed.
 */
export const WithLabel: Story = {
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

/**
 * The "Box" style from the spec — the entire bordered card is the label, so
 * clicking anywhere toggles the switch.
 */
export const Box: Story = {
  render: () => (
    <Field>
      <FieldLabel className="flex w-64 cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-background p-4 hover:bg-muted">
        Deep Research
        <Switch defaultChecked />
      </FieldLabel>
    </Field>
  ),
};
