import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@/ui/checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';

type CheckboxVariant = NonNullable<ComponentProps<typeof Checkbox>['variant']>;

const variantRows = [
  { label: 'Default', variant: 'default' },
  { label: 'Box', variant: 'box' },
] as const;

function InteractiveIndeterminateCheckbox({
  variant,
}: {
  variant: CheckboxVariant;
}) {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);

  return (
    <Checkbox
      checked={checked}
      description="Click to resolve the mixed state."
      indeterminate={indeterminate}
      onCheckedChange={(nextChecked) => {
        setIndeterminate(false);
        setChecked(nextChecked);
      }}
      variant={variant}
    >
      Partial selection
    </Checkbox>
  );
}

function InvalidCheckboxExample({ variant }: { variant: CheckboxVariant }) {
  const [checked, setChecked] = useState(false);
  const isInvalid = !checked;

  return (
    <Field className="w-80" invalid={isInvalid}>
      <Checkbox
        aria-describedby={isInvalid ? 'terms-error' : undefined}
        checked={checked}
        onCheckedChange={(nextChecked) => {
          setChecked(nextChecked);
        }}
        required
        variant={variant}
      >
        I agree to the terms and conditions
      </Checkbox>
      <FieldError id="terms-error" match={isInvalid}>
        Select this checkbox to continue.
      </FieldError>
    </Field>
  );
}

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Checkbox implemented from the Nebari Figma spec on top of Base UI. `Checkbox` represents a single boolean field with `default` (inline) and `box` (card) layouts. Use `CheckboxGroup` with `orientation="horizontal"` or `orientation="vertical"` to lay out related checkbox fields. Compose with `Field` to add a standalone field label, description, and validation message.',
      },
    },
  },
  args: {
    children: 'Enable automatic updates',
    defaultChecked: true,
    disabled: false,
    indeterminate: false,
    required: false,
    variant: 'default',
  },
  argTypes: {
    variant: {
      description:
        'Field layout. `default` is an inline checkbox; `box` turns the label and description into a bordered, fully clickable card.',
      control: 'select',
      options: ['default', 'box'],
      table: { defaultValue: { summary: 'default' } },
    },
    children: {
      description: 'The visible and accessible checkbox label.',
      control: 'text',
    },
    description: {
      description:
        "Supplementary text beneath the label, exposed as the checkbox's accessible description.",
      control: 'text',
    },
    defaultChecked: {
      description: 'Initial state when the checkbox is uncontrolled.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    checked: {
      description:
        'Controlled state. Pair it with `onCheckedChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    indeterminate: {
      description:
        'Renders the mixed state (a dash instead of a check) for a partially-selected group of children. Clicking resolves it to checked or unchecked.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description:
        'Mutes the label and fills the control with `muted`; a checked or indeterminate box keeps a `muted-foreground` fill with a `background`-colored mark. Blocks pointer and keyboard interaction.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      description:
        'Marks the checkbox as required for Base UI `Field` validation — it must be checked to pass.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    onCheckedChange: {
      description: 'Called with the next checked state on every toggle.',
      action: 'checked changed',
      control: false,
    },
    render: {
      description:
        'Base UI render-prop composition. Swap the rendered element while preserving checkbox behavior, styling, and slot attributes.',
      control: false,
    },
  },
  decorators: [
    // `defaultChecked` is mount-only, so the key forces a remount when it changes.
    (Story, { args }) => <Story key={String(args.defaultChecked)} />,
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default checkbox layout. Use it when the label and optional description
 * are enough context for a single boolean choice.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Checkbox {...args} />
    </div>
  ),
};

/**
 * Pass `description` to add supplementary text beneath the checkbox label. It
 * is wired to the checkbox as its accessible description.
 */
export const WithDescription: Story = {
  name: 'With description',
  args: { description: 'Run updates when a newer image is available.' },
  parameters: {
    controls: { include: [] },
  },
  render: (args) => (
    <div className="w-72">
      <Checkbox {...args} />
    </div>
  ),
};

/**
 * Use `CheckboxGroup` with `orientation="horizontal"` to arrange related
 * checkbox fields in a wrapping row.
 */
export const Horizontal: Story = {
  parameters: { controls: { include: [] } },
  render: ({ disabled, variant }) => (
    <CheckboxGroup aria-label="Workspace features" orientation="horizontal">
      <Checkbox
        defaultChecked
        disabled={disabled}
        value="notebooks"
        variant={variant}
      >
        Notebooks
      </Checkbox>
      <Checkbox disabled={disabled} value="dashboards" variant={variant}>
        Dashboards
      </Checkbox>
      <Checkbox disabled={disabled} value="jobs" variant={variant}>
        Jobs
      </Checkbox>
    </CheckboxGroup>
  ),
};

/**
 * The `box` variant turns the checkbox into a bordered, fully clickable card.
 * Reach for it when the choice needs more visual weight or descriptive copy.
 */
export const Box: Story = {
  args: {
    description: 'Allow collaborators to duplicate this environment.',
    variant: 'box',
  },
  parameters: {
    controls: { include: [] },
  },
  render: (args) => (
    <div className="w-80">
      <Checkbox {...args}>Allow environment cloning</Checkbox>
    </div>
  ),
};

/**
 * Disabled checkboxes can still communicate their current value, but they do
 * not accept interaction.
 */
export const Disabled: Story = {
  args: { disabled: true },
  parameters: { controls: { include: [] } },
  render: ({ disabled }) => (
    <div className="flex w-80 flex-col gap-4">
      <Checkbox disabled={disabled}>Enable usage reporting</Checkbox>
      <Checkbox defaultChecked disabled={disabled} variant="box">
        Required by your organization
      </Checkbox>
    </div>
  ),
};

/**
 * Compose with `Field` when the checkbox needs a standalone field label or
 * description separate from the checkbox's own inline label.
 */
export const WithField: Story = {
  parameters: { controls: { include: [] } },
  render: ({ disabled, variant }) => (
    <Field className="w-80">
      <FieldLabel id="notifications-label">Notifications</FieldLabel>
      <FieldDescription id="notifications-desc">
        Configure how Nebari should contact you.
      </FieldDescription>
      <Checkbox
        aria-describedby="notifications-desc"
        aria-labelledby="notifications-label"
        disabled={disabled}
        variant={variant}
      >
        Email me product updates
      </Checkbox>
    </Field>
  ),
};

/**
 * Error state belongs to the required checkbox field: the checkbox is invalid
 * while it is unchecked, and the visible error message provides the non-color
 * cue. The error clears as soon as the user checks the box.
 */
export const Invalid: Story = {
  parameters: { controls: { include: [] } },
  render: ({ variant }) => (
    <InvalidCheckboxExample variant={variant ?? 'default'} />
  ),
};

/**
 * Indeterminate represents a mixed child-selection state. Clicking the checkbox
 * resolves it to a normal checked or unchecked state.
 */
export const Indeterminate: Story = {
  parameters: { controls: { include: [] } },
  render: (_args) => (
    <div className="grid w-[38rem] grid-cols-2 items-start gap-6">
      {variantRows.map((row) => (
        <div className="space-y-3" key={row.label}>
          <p className="text-center font-medium text-muted-foreground text-xs">
            {row.label}
          </p>
          <InteractiveIndeterminateCheckbox variant={row.variant} />
        </div>
      ))}
    </div>
  ),
};
