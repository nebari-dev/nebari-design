import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/ui/checkbox';

type InteractionState =
  | 'Default'
  | 'Hover'
  | 'Focus'
  | 'Pressed'
  | 'Disabled'
  | 'Invalid';

type CheckboxVariant = NonNullable<ComponentProps<typeof Checkbox>['variant']>;

const checkedColumns = [
  { checked: true, label: 'Checked' },
  { checked: false, label: 'Unchecked' },
] as const;

const variantRows = [
  { label: 'Default', variant: 'default' },
  { label: 'Box', variant: 'box' },
] as const;

function getPreviewClassName(
  state: InteractionState,
  variant: CheckboxVariant,
  marked: boolean,
) {
  return cn(
    state === 'Hover' && '[&_[data-slot=checkbox-label]]:underline',
    state === 'Hover' &&
      variant === 'box' &&
      '[&_[data-slot=checkbox]]:border-border-strong [&_[data-slot=checkbox]]:bg-muted [&_[data-slot=checkbox-description]]:text-muted-foreground-strong',
    state === 'Focus' &&
      variant === 'default' &&
      '[&_[data-slot=checkbox]]:ring-2 [&_[data-slot=checkbox]]:ring-ring [&_[data-slot=checkbox]]:ring-offset-2 [&_[data-slot=checkbox]]:ring-offset-background',
    state === 'Focus' &&
      variant === 'box' &&
      '[&_[data-slot=checkbox]]:border-transparent [&_[data-slot=checkbox]]:ring-2 [&_[data-slot=checkbox]]:ring-inset [&_[data-slot=checkbox]]:ring-ring',
    state === 'Pressed' &&
      '[&_[data-slot=checkbox]]:text-muted-foreground-strong motion-safe:[&_[data-slot=checkbox]]:scale-[0.97] [&_[data-slot=checkbox-description]]:text-muted-foreground-strong',
    state === 'Pressed' &&
      variant === 'box' &&
      '[&_[data-slot=checkbox]]:border-border-strong [&_[data-slot=checkbox]]:bg-muted',
    state === 'Pressed' &&
      marked &&
      '[&_[data-slot=checkbox-control]]:border-primary-hover [&_[data-slot=checkbox-control]]:bg-primary-hover',
  );
}

function CheckboxStateSection({
  args,
  state,
}: {
  args: ComponentProps<typeof Checkbox>;
  state: InteractionState;
}) {
  return (
    <div className="max-w-[calc(100vw-3rem)] overflow-x-auto p-2">
      <div className="grid grid-cols-[auto_repeat(2,minmax(13.5rem,1fr))] items-start gap-x-6 gap-y-8">
        <span aria-hidden="true" />
        {checkedColumns.map((column) => (
          <p
            className="text-center font-medium text-muted-foreground text-xs"
            key={column.label}
          >
            {column.label}
          </p>
        ))}

        {variantRows.map((row) => (
          <div className="contents" key={row.label}>
            <p className="self-center font-medium text-muted-foreground text-xs">
              {row.label}
            </p>
            {checkedColumns.map((column) => (
              <div
                className={cn(
                  row.variant === 'default' && 'border border-transparent p-3',
                  getPreviewClassName(state, row.variant, column.checked),
                )}
                key={column.label}
              >
                <Checkbox
                  {...args}
                  aria-invalid={state === 'Invalid' || undefined}
                  defaultChecked={column.checked}
                  disabled={state === 'Disabled'}
                  indeterminate={false}
                  variant={row.variant}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IndeterminateSection({
  args,
}: {
  args: ComponentProps<typeof Checkbox>;
}) {
  return (
    <div className="grid grid-cols-2 items-start gap-6 p-2">
      {variantRows.map((row) => (
        <div className="space-y-3" key={row.label}>
          <p className="text-center font-medium text-muted-foreground text-xs">
            {row.label}
          </p>
          <div
            className={cn(
              row.variant === 'default' && 'border border-transparent p-3',
            )}
          >
            <InteractiveIndeterminateCheckbox
              args={args}
              variant={row.variant}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InteractiveIndeterminateCheckbox({
  args,
  variant,
}: {
  args: ComponentProps<typeof Checkbox>;
  variant: CheckboxVariant;
}) {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const { onCheckedChange, ...checkboxProps } = args;

  return (
    <Checkbox
      {...checkboxProps}
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(nextChecked, eventDetails) => {
        setIndeterminate(false);
        setChecked(nextChecked);
        onCheckedChange?.(nextChecked, eventDetails);
      }}
      variant={variant}
    />
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
          'Checkbox implemented from the Nebari Figma spec. `default` and `box` select the layout; Base UI supplies checked, unchecked, indeterminate, disabled, and validation state while native CSS supplies hover, focus, and pressed feedback.',
      },
    },
  },
  args: {
    children: 'Checkbox Text',
    description: 'This is a checkbox description.',
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

export const Default: Story = {
  render: (args) => <CheckboxStateSection args={args} state="Default" />,
};

export const Hover: Story = {
  render: (args) => <CheckboxStateSection args={args} state="Hover" />,
};

export const Focus: Story = {
  render: (args) => <CheckboxStateSection args={args} state="Focus" />,
};

export const Pressed: Story = {
  render: (args) => <CheckboxStateSection args={args} state="Pressed" />,
};

export const Disabled: Story = {
  render: (args) => <CheckboxStateSection args={args} state="Disabled" />,
};

export const Invalid: Story = {
  render: (args) => <CheckboxStateSection args={args} state="Invalid" />,
};

export const Indeterminate: Story = {
  render: (args) => <IndeterminateSection args={args} />,
};
