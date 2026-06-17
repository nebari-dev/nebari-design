import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '@/ui/switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const On: Story = { args: { defaultChecked: true } };

export const Off: Story = { args: { defaultChecked: false } };

export const Disabled: Story = {
  args: { defaultChecked: true, disabled: true },
};

export const DisabledOff: Story = {
  args: { defaultChecked: false, disabled: true },
};

/**
 * Compose the switch with a label and optional description. The label's
 * `htmlFor` wires click-to-toggle and the description is linked via
 * `aria-describedby`.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flex w-64 items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label className="font-medium text-sm" htmlFor="enable-copy">
          Enable copy
        </label>
        <p className="text-muted-foreground text-sm" id="enable-copy-desc">
          Allow users to copy this environment
        </p>
      </div>
      <Switch
        aria-describedby="enable-copy-desc"
        defaultChecked
        id="enable-copy"
      />
    </div>
  ),
};

/** The "Box" style from the spec — the label group wrapped in a bordered card. */
export const Box: Story = {
  render: () => (
    <label
      className="flex w-64 cursor-pointer items-start justify-between gap-4 rounded-md border border-border bg-background p-4 hover:bg-muted"
      htmlFor="deep-research"
    >
      <span className="font-medium text-sm">Deep Research</span>
      <Switch defaultChecked id="deep-research" />
    </label>
  ),
};
