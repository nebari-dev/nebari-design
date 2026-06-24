import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

const variantColumns = [
  { checked: true, label: 'Default / Checked', variant: 'default' },
  { checked: false, label: 'Default / Unchecked', variant: 'default' },
  { checked: true, label: 'Box / Checked', variant: 'box' },
  { checked: false, label: 'Box / Unchecked', variant: 'box' },
] as const;

const interactionStates = [
  'Hover',
  'Focus',
  'Pressed',
  'Disabled',
  'Invalid',
] as const;

type InteractionState = (typeof interactionStates)[number];
type RadioVariant = (typeof variantColumns)[number]['variant'];
type RadioPreviewProps = ComponentProps<typeof RadioGroupItem> & {
  checked: boolean;
};

function getPreviewClassName(
  state: InteractionState,
  variant: RadioVariant,
  checked: boolean,
) {
  return cn(
    state === 'Hover' && '[&_[data-slot=radio-group-label]]:underline',
    state === 'Hover' &&
      variant === 'box' &&
      '[&_[data-slot=radio-group-item]]:border-border-strong [&_[data-slot=radio-group-item]]:bg-muted [&_[data-slot=radio-group-description]]:text-muted-foreground-strong',
    state === 'Focus' &&
      variant === 'default' &&
      '[&_[data-slot=radio-group-item]]:ring-2 [&_[data-slot=radio-group-item]]:ring-ring [&_[data-slot=radio-group-item]]:ring-offset-2 [&_[data-slot=radio-group-item]]:ring-offset-background',
    state === 'Focus' &&
      variant === 'box' &&
      '[&_[data-slot=radio-group-item]]:border-transparent [&_[data-slot=radio-group-item]]:ring-2 [&_[data-slot=radio-group-item]]:ring-inset [&_[data-slot=radio-group-item]]:ring-ring',
    state === 'Pressed' &&
      '[&_[data-slot=radio-group-item]]:text-muted-foreground-strong motion-safe:[&_[data-slot=radio-group-item]]:scale-[0.97] [&_[data-slot=radio-group-description]]:text-muted-foreground-strong',
    state === 'Pressed' &&
      variant === 'box' &&
      '[&_[data-slot=radio-group-item]]:border-border-strong [&_[data-slot=radio-group-item]]:bg-muted',
    state === 'Pressed' &&
      checked &&
      '[&_[data-slot=radio-group-control]]:border-primary-hover [&_[data-slot=radio-group-control]]:bg-primary-hover',
  );
}

function RadioPreview({ checked, value, ...props }: RadioPreviewProps) {
  return (
    <RadioGroup
      aria-label={
        checked ? 'Selected radio preview' : 'Unselected radio preview'
      }
      defaultValue={checked ? value : undefined}
    >
      <RadioGroupItem {...props} value={value} />
    </RadioGroup>
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
          'Radio Group implemented from the Nebari Figma spec. `RadioGroup` manages mutually-exclusive selection; each `RadioGroupItem` supports `default` and `box` layouts plus native hover, focus, pressed, disabled, and invalid feedback.',
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
  render: (args) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Checked</p>
        <RadioPreview {...args} checked value="default-selected" />
      </div>
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Unchecked</p>
        <RadioPreview {...args} checked={false} value="default-unselected" />
      </div>
    </div>
  ),
};

export const Box: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Checked</p>
        <RadioPreview {...args} checked value="box-selected" variant="box" />
      </div>
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Unchecked</p>
        <RadioPreview
          {...args}
          checked={false}
          value="box-unselected"
          variant="box"
        />
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="max-w-[calc(100vw-3rem)] overflow-x-auto p-2">
      <div className="grid grid-cols-[auto_repeat(4,minmax(13.5rem,1fr))] items-start gap-x-6 gap-y-8">
        <span aria-hidden="true" />
        {variantColumns.map((column) => (
          <p
            className="text-center font-medium text-muted-foreground text-xs"
            key={column.label}
          >
            {column.label}
          </p>
        ))}

        {interactionStates.map((state) => (
          <div className="contents" key={state}>
            <p className="self-center font-medium text-muted-foreground text-xs">
              {state}
            </p>
            {variantColumns.map((column) => {
              const value = `${state}-${column.label}`;

              return (
                <div
                  className={cn(
                    column.variant === 'default' &&
                      'border border-transparent p-3',
                    getPreviewClassName(
                      state,
                      column.variant,
                      column.checked,
                    ),
                  )}
                  key={column.label}
                >
                  <RadioPreview
                    {...args}
                    aria-invalid={state === 'Invalid' || undefined}
                    checked={column.checked}
                    disabled={state === 'Disabled'}
                    value={value}
                    variant={column.variant}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const controls = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="radio-group-control"]',
      ),
    );

    await expect(controls).toHaveLength(
      interactionStates.length * variantColumns.length,
    );

    for (let row = 0; row < interactionStates.length; row += 1) {
      const rowControls = controls.slice(
        row * variantColumns.length,
        (row + 1) * variantColumns.length,
      );
      const firstControlTop = rowControls[0].getBoundingClientRect().top;

      for (const control of rowControls.slice(1)) {
        await expect(control.getBoundingClientRect().top).toBeCloseTo(
          firstControlTop,
          0,
        );
      }
    }
  },
};
