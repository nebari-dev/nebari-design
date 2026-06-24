import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

type InteractionState =
  | 'Default'
  | 'Hover'
  | 'Focus'
  | 'Pressed'
  | 'Disabled'
  | 'Invalid';

type RadioVariant = NonNullable<
  ComponentProps<typeof RadioGroupItem>['variant']
>;

const checkedColumns = [
  { checked: true, label: 'Checked' },
  { checked: false, label: 'Unchecked' },
] as const;

const variantRows = [
  { label: 'Default', variant: 'default' },
  { label: 'Box', variant: 'box' },
] as const;

function getPreviewClassName(state: InteractionState, variant: RadioVariant) {
  return cn(
    state === 'Hover' && '[&_[data-slot=radio-group-label]]:underline',
    state === 'Hover' &&
      variant === 'box' &&
      '[&_[data-slot=radio-group-item]]:border-border-strong [&_[data-slot=radio-group-item]]:bg-muted [&_[data-slot=radio-group-description]]:text-muted-foreground-strong',
    state === 'Focus' &&
      variant === 'default' &&
      '[&_[data-slot=radio-group-item]]:border-ring',
    state === 'Focus' &&
      variant === 'box' &&
      '[&_[data-slot=radio-group-item]]:border-2 [&_[data-slot=radio-group-item]]:border-ring',
    state === 'Pressed' &&
      '[&_[data-slot=radio-group-item]]:text-muted-foreground-strong motion-safe:[&_[data-slot=radio-group-item]]:scale-[0.97] [&_[data-slot=radio-group-description]]:text-muted-foreground-strong',
    state === 'Pressed' &&
      variant === 'box' &&
      '[&_[data-slot=radio-group-item]]:border-border-strong [&_[data-slot=radio-group-item]]:bg-muted',
    state === 'Pressed' &&
      '[&_[data-slot=radio-group-item][data-checked]_[data-slot=radio-group-target]]:stroke-primary-hover [&_[data-slot=radio-group-item][data-checked]_[data-slot=radio-group-target]]:fill-primary-hover',
  );
}

function RadioStateSection({
  args,
  state,
}: {
  args: ComponentProps<typeof RadioGroupItem>;
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

        {variantRows.map((row) => {
          const checkedValue = `${state}-${row.variant}-checked`;

          return (
            <div className="contents" key={row.label}>
              <p className="self-center font-medium text-muted-foreground text-xs">
                {row.label}
              </p>
              <div className="col-span-2 [&_[data-slot=radio-group]]:grid-cols-2 [&_[data-slot=radio-group]]:gap-x-6">
                <RadioGroup
                  aria-invalid={state === 'Invalid' || undefined}
                  aria-label={`${state} ${row.label} radio options`}
                  defaultValue={checkedValue}
                >
                  {checkedColumns.map((column) => {
                    const value = `${state}-${row.variant}-${column.checked ? 'checked' : 'unchecked'}`;

                    return (
                      <div
                        className={cn(
                          row.variant === 'default' &&
                            'border border-transparent p-3',
                          getPreviewClassName(state, row.variant),
                        )}
                        key={column.label}
                      >
                        <RadioGroupItem
                          {...args}
                          disabled={state === 'Disabled'}
                          value={value}
                          variant={row.variant}
                        />
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Radio Group',
  component: RadioGroupItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Radio Group implemented from the Nebari Figma spec. `RadioGroup` manages mutually exclusive selection and group-level validation; each `RadioGroupItem` supports `default` and `box` layouts plus native hover, focus, pressed, and disabled feedback.',
      },
    },
  },
  args: {
    children: 'Radio Text',
    description: 'This is a radio description.',
    value: 'option',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'box'],
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: { control: 'boolean' },
    description: { control: 'text' },
    value: { control: false },
  },
} satisfies Meta<typeof RadioGroupItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <RadioStateSection args={args} state="Default" />,
};

export const Hover: Story = {
  render: (args) => <RadioStateSection args={args} state="Hover" />,
};

export const Focus: Story = {
  render: (args) => <RadioStateSection args={args} state="Focus" />,
};

export const Pressed: Story = {
  render: (args) => <RadioStateSection args={args} state="Pressed" />,
};

export const Disabled: Story = {
  render: (args) => <RadioStateSection args={args} state="Disabled" />,
};

export const Invalid: Story = {
  render: (args) => <RadioStateSection args={args} state="Invalid" />,
};
