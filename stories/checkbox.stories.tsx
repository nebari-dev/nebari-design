import type { Meta, StoryObj } from '@storybook/react-vite';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/ui/checkbox';

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
type CheckboxVariant = (typeof variantColumns)[number]['variant'];

function getPreviewClassName(
  state: InteractionState,
  variant: CheckboxVariant,
  checked: boolean,
) {
  return cn(
    state === 'Hover' && '[&_[data-slot=checkbox-label]]:underline',
    state === 'Hover' &&
      variant === 'box' &&
      'border-border-strong bg-muted [&_[data-slot=checkbox-description]]:text-muted-foreground-strong',
    state === 'Focus' &&
      variant === 'default' &&
      'ring-2 ring-ring ring-offset-2 ring-offset-background',
    state === 'Focus' &&
      variant === 'box' &&
      'border-transparent ring-2 ring-inset ring-ring',
    state === 'Pressed' &&
      'text-muted-foreground-strong motion-safe:scale-[0.97] [&_[data-slot=checkbox-description]]:text-muted-foreground-strong',
    state === 'Pressed' && variant === 'box' && 'border-border-strong bg-muted',
    state === 'Pressed' &&
      checked &&
      '[&_[data-slot=checkbox-control]]:border-primary-hover [&_[data-slot=checkbox-control]]:bg-primary-hover',
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
          'Checkbox implemented from the Nebari Figma spec. `default` and `box` select the layout; Base UI supplies checked, unchecked, disabled, and validation state while native CSS supplies hover, focus, and pressed feedback.',
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
    description: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Checked</p>
        <Checkbox {...args} defaultChecked variant="default" />
      </div>
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Unchecked</p>
        <Checkbox {...args} defaultChecked={false} variant="default" />
      </div>
    </div>
  ),
};

export const Box: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Checked</p>
        <Checkbox {...args} defaultChecked variant="box" />
      </div>
      <div className="space-y-3">
        <p className="font-medium text-muted-foreground text-xs">Unchecked</p>
        <Checkbox {...args} defaultChecked={false} variant="box" />
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
            {variantColumns.map((column) => (
              <Checkbox
                {...args}
                aria-invalid={state === 'Invalid' || undefined}
                className={cn(
                  args.className,
                  getPreviewClassName(state, column.variant, column.checked),
                )}
                defaultChecked={column.checked}
                disabled={state === 'Disabled'}
                key={column.label}
                variant={column.variant}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
};
