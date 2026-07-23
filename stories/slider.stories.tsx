import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Field, FieldLabel } from '@/ui/field';
import { Slider } from '@/ui/slider';

function ControlledSlider() {
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
        getThumbAriaLabel={(index) =>
          index === 0 ? 'Minimum temperature' : 'Maximum temperature'
        }
        max={100}
        min={0}
        onValueChange={(nextValue) => {
          setValue(Array.isArray(nextValue) ? nextValue : [nextValue]);
        }}
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
    defaultValue: { control: 'number' },
    disabled: { control: 'boolean' },
    getThumbAriaLabel: { table: { disable: true } },
    getThumbAriaValueText: { table: { disable: true } },
    max: { control: 'number' },
    min: { control: 'number' },
    onValueChange: { table: { disable: true } },
    onValueCommitted: { table: { disable: true } },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    showValueTooltip: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    step: { control: 'number' },
    value: { table: { disable: true } },
  },
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
  render: () => (
    <div className="w-80">
      <Slider
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
  name: 'Multiple Thumbs',
  render: () => (
    <div className="w-80">
      <Slider
        defaultValue={[20, 50, 80]}
        getThumbAriaLabel={(index) => `Resource checkpoint ${index + 1}`}
        minStepsBetweenValues={5}
      />
    </div>
  ),
};

/** Use `orientation="vertical"` for a vertical slider. */
export const Vertical: Story = {
  render: () => (
    <Field className="items-center gap-3">
      <FieldLabel>Resource limit</FieldLabel>
      <div className="h-52">
        <Slider
          defaultValue={60}
          getThumbAriaLabel={() => 'Resource limit'}
          orientation="vertical"
        />
      </div>
    </Field>
  ),
};

/** Control the slider value when another part of the UI depends on it. */
export const Controlled: Story = {
  render: () => <ControlledSlider />,
};

/** Disabled sliders communicate the value without accepting interaction. */
export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Slider
        defaultValue={50}
        disabled
        getThumbAriaLabel={() => 'Storage quota'}
      />
    </div>
  ),
};
