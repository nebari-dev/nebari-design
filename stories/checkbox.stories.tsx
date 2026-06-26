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

function InvalidCheckboxExample() {
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
    children: 'Checkbox Text',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'box'],
      table: { defaultValue: { summary: 'default' } },
    },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default checkbox layout. Use it when the label and optional description
 * are enough context for a single boolean choice.
 */
export const Default: Story = {
  render: () => (
    <div className="w-72">
      <Checkbox defaultChecked>Enable automatic updates</Checkbox>
    </div>
  ),
};

/**
 * Pass `description` to add supplementary text beneath the checkbox label. It
 * is wired to the checkbox as its accessible description.
 */
export const WithDescription: Story = {
  name: 'With description',
  render: () => (
    <div className="w-72">
      <Checkbox description="Run updates when a newer image is available.">
        Enable automatic updates
      </Checkbox>
    </div>
  ),
};

/**
 * Use `CheckboxGroup` with `orientation="horizontal"` to arrange related
 * checkbox fields in a wrapping row.
 */
export const Horizontal: Story = {
  render: () => (
    <CheckboxGroup aria-label="Workspace features" orientation="horizontal">
      <Checkbox defaultChecked value="notebooks">
        Notebooks
      </Checkbox>
      <Checkbox value="dashboards">Dashboards</Checkbox>
      <Checkbox value="jobs">Jobs</Checkbox>
    </CheckboxGroup>
  ),
};

/**
 * The `box` variant turns the checkbox into a bordered, fully clickable card.
 * Reach for it when the choice needs more visual weight or descriptive copy.
 */
export const Box: Story = {
  render: () => (
    <div className="w-80">
      <Checkbox
        description="Allow collaborators to duplicate this environment."
        variant="box"
      >
        Allow environment cloning
      </Checkbox>
    </div>
  ),
};

/**
 * Disabled checkboxes can still communicate their current value, but they do
 * not accept interaction.
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Checkbox disabled>Enable usage reporting</Checkbox>
      <Checkbox defaultChecked disabled variant="box">
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
  name: 'With Field',
  render: () => (
    <Field className="w-80">
      <FieldLabel id="notifications-label">Notifications</FieldLabel>
      <FieldDescription id="notifications-desc">
        Configure how Nebari should contact you.
      </FieldDescription>
      <Checkbox
        aria-describedby="notifications-desc"
        aria-labelledby="notifications-label"
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
  render: () => <InvalidCheckboxExample />,
};

/**
 * Indeterminate represents a mixed child-selection state. Clicking the checkbox
 * resolves it to a normal checked or unchecked state.
 */
export const Indeterminate: Story = {
  render: () => (
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
