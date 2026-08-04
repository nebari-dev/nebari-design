import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Field, FieldLabel } from '@/ui/field';
import { Slider } from '@/ui/slider';

function ControlledSlider({
  disabled,
  showValueTooltip,
}: {
  disabled?: boolean;
  showValueTooltip?: boolean;
}) {
  const [value, setValue] = useState<readonly number[]>([30, 70]);

  return (
    <Field className="w-80 gap-3">
      <div className="flex items-center justify-between gap-4">
        <FieldLabel>Temperature</FieldLabel>
        <output className="font-medium text-muted-foreground text-sm">
          {value[0] / 100}, {value[1] / 100}
        </output>
      </div>
      <Slider
        disabled={disabled}
        getThumbAriaLabel={(index) =>
          index === 0 ? 'Minimum temperature' : 'Maximum temperature'
        }
        max={100}
        min={0}
        onValueChange={(nextValue) => {
          setValue(Array.isArray(nextValue) ? nextValue : [nextValue]);
        }}
        showValueTooltip={showValueTooltip}
        step={1}
        value={value}
      />
    </Field>
  );
}

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Slider is a bounded numeric input built on Base UI. It supports single-value and range values, keyboard navigation, Field composition, disabled state, and horizontal or vertical orientation.',
      },
    },
  },
  args: {
    defaultValue: 33,
    disabled: false,
    max: 100,
    min: 0,
    orientation: 'horizontal',
    showValueTooltip: true,
    step: 1,
  },
  argTypes: {
    defaultValue: {
      control: 'number',
      description:
        'Initial value when the slider is uncontrolled. Pass an array for a range or multi-thumb slider.',
      table: { defaultValue: { summary: '0' } },
    },
    min: {
      control: 'number',
      description: 'Lower bound of the range.',
      table: { defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Upper bound of the range.',
      table: { defaultValue: { summary: '100' } },
    },
    step: {
      control: 'number',
      description:
        'Granularity the value must adhere to. Arrow keys move by one step.',
      table: { defaultValue: { summary: '1' } },
    },
    minStepsBetweenValues: {
      description:
        'Minimum number of steps that must separate two thumbs. Only applies to a range or multi-thumb slider, so it is a docs-only row here — the playground is single-thumb. See the `Range` and `Multiple Thumbs` stories.',
      control: false,
      table: { defaultValue: { summary: '0' } },
    },
    orientation: {
      control: 'inline-radio',
      description:
        'Track direction. `vertical` fills from the bottom up and needs a fixed-height wrapper.',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    showValueTooltip: {
      control: 'boolean',
      description:
        'Shows the current value in a tooltip above the thumb while dragging or focused.',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description:
        'Mutes the track and thumb and blocks pointer and keyboard interaction — the value stays readable.',
      table: { defaultValue: { summary: 'false' } },
    },
    getThumbAriaLabel: { table: { disable: true } },
    getThumbAriaValueText: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    onValueCommitted: { table: { disable: true } },
    value: {
      description:
        'Controlled value. Pair it with `onValueChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
  },
  decorators: [
    // `defaultValue` is read once on mount, so key the story on it to remount
    // when the control changes — otherwise the knob would silently do nothing.
    (Story, { args }) => <Story key={String(args.defaultValue)} />,
  ],
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default slider selects a single value from a bounded range. */
export const Default: Story = {
  render: (args) => (
    <div className={args.orientation === 'vertical' ? 'h-52' : 'w-80'}>
      <Slider {...args} getThumbAriaLabel={() => 'Resource limit'} />
    </div>
  ),
};

/** Use an array with two values for a range slider. */
export const Range: Story = {
  // `defaultValue` is the array that makes this a range, so it is fixed in the
  // render rather than exposed as a (single-number) knob.
  parameters: {
    controls: {
      include: ['min', 'max', 'step', 'showValueTooltip', 'disabled'],
    },
  },
  render: ({
    defaultValue: _defaultValue,
    orientation: _orientation,
    ...args
  }) => (
    <div className="w-80">
      <Slider
        {...args}
        defaultValue={[20, 80]}
        getThumbAriaLabel={(index) =>
          index === 0 ? 'Minimum resource window' : 'Maximum resource window'
        }
        minStepsBetweenValues={5}
      />
    </div>
  ),
};

/** Use an array with more values for multiple thumbs. */
export const MultipleThumbs: Story = {
  parameters: {
    controls: {
      include: ['min', 'max', 'step', 'showValueTooltip', 'disabled'],
    },
  },
  render: ({
    defaultValue: _defaultValue,
    orientation: _orientation,
    ...args
  }) => (
    <div className="w-80">
      <Slider
        {...args}
        defaultValue={[20, 50, 80]}
        getThumbAriaLabel={(index) => `Resource checkpoint ${index + 1}`}
        minStepsBetweenValues={5}
      />
    </div>
  ),
};

/** Use `orientation="vertical"` for a vertical slider. */
export const Vertical: Story = {
  args: { defaultValue: 60, orientation: 'vertical' },
  parameters: {
    controls: {
      include: ['orientation', 'defaultValue', 'showValueTooltip', 'disabled'],
    },
  },
  render: (args) => (
    <Field className="items-center gap-3">
      <FieldLabel>Resource limit</FieldLabel>
      <div className={args.orientation === 'vertical' ? 'h-52' : 'w-80'}>
        <Slider {...args} getThumbAriaLabel={() => 'Resource limit'} />
      </div>
    </Field>
  ),
};

/** Control the slider value when another part of the UI depends on it. */
export const Controlled: Story = {
  // The example owns `value`, `min`, `max`, and `step`.
  parameters: { controls: { include: ['showValueTooltip', 'disabled'] } },
  render: ({ disabled, showValueTooltip }) => (
    <ControlledSlider disabled={disabled} showValueTooltip={showValueTooltip} />
  ),
};

/** Disabled sliders communicate the value without accepting interaction. */
export const Disabled: Story = {
  args: { defaultValue: 50, disabled: true },
  parameters: {
    controls: { include: ['disabled', 'defaultValue', 'showValueTooltip'] },
  },
  render: ({ orientation: _orientation, ...args }) => (
    <div className="w-80">
      <Slider {...args} getThumbAriaLabel={() => 'Storage quota'} />
    </div>
  ),
};
