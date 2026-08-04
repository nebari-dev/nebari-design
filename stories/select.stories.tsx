import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

const frameworks = [
  { label: 'Next.js', value: 'next' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
  { label: 'Vue', value: 'vue' },
] satisfies SelectOption[];

const regions = [
  { label: 'US Central', value: 'us-central' },
  { label: 'US East', value: 'us-east' },
  { label: 'Europe West', value: 'eu-west' },
  { label: 'Asia Pacific', value: 'ap-south' },
] satisfies SelectOption[];

const timezones = [
  { label: 'Pacific Time', value: 'america-los-angeles' },
  { label: 'Mountain Time', value: 'america-denver' },
  { label: 'Central Time', value: 'america-chicago' },
  { label: 'Eastern Time', value: 'america-new-york' },
  { label: 'Atlantic Time', value: 'america-halifax' },
  { label: 'Greenwich Mean Time', value: 'europe-london' },
  { label: 'Central European Time', value: 'europe-paris' },
  { label: 'Eastern European Time', value: 'europe-athens' },
  { label: 'India Standard Time', value: 'asia-kolkata' },
  { label: 'Japan Standard Time', value: 'asia-tokyo' },
  { label: 'Australian Eastern Time', value: 'australia-sydney' },
  { label: 'New Zealand Time', value: 'pacific-auckland' },
] satisfies SelectOption[];

type SelectTriggerProps = ComponentProps<typeof SelectTrigger>;
type SelectContentProps = ComponentProps<typeof SelectContent>;

type SelectStoryArgs = SelectTriggerProps &
  Pick<
    SelectContentProps,
    'align' | 'alignItemWithTrigger' | 'side' | 'sideOffset'
  > & {
    invalid?: boolean;
  };

interface SelectPreviewProps {
  args: SelectStoryArgs;
  label: string;
  placeholder: string;
  options?: readonly SelectOption[];
  children?: ReactNode;
  helperText?: ReactNode;
  contentClassName?: string;
}

function findOptionLabel(
  options: readonly SelectOption[],
  value: unknown,
  placeholder: string,
) {
  return options.find((option) => option.value === value)?.label ?? placeholder;
}

/**
 * Splits the flat story args across the two components they belong to — the
 * positioning knobs onto `SelectContent`, everything else onto `SelectTrigger`.
 */
function SelectPreview({
  args: { align, alignItemWithTrigger, invalid, side, sideOffset, ...trigger },
  label,
  placeholder,
  options = frameworks,
  children,
  helperText = 'Select one option.',
  contentClassName,
}: SelectPreviewProps) {
  return (
    <Field className="w-64" disabled={trigger.disabled} invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select items={options} modal={false}>
        <SelectTrigger
          {...trigger}
          aria-invalid={invalid || trigger['aria-invalid']}
        >
          <SelectValue>
            {(value) => findOptionLabel(options, value, placeholder)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align={align}
          alignItemWithTrigger={alignItemWithTrigger}
          className={contentClassName}
          side={side}
          sideOffset={sideOffset}
        >
          {children ??
            options.map((option) => (
              <SelectItem
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {invalid ? (
        <FieldError className="text-xs leading-4" match>
          {helperText}
        </FieldError>
      ) : (
        <FieldDescription className="text-xs leading-4">
          {helperText}
        </FieldDescription>
      )}
    </Field>
  );
}

const meta = {
  title: 'Components/Select',
  component: SelectTrigger,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a list of options for the user to pick from, triggered by a button.',
      },
    },
  },
  args: {
    align: 'center',
    alignItemWithTrigger: false,
    disabled: false,
    invalid: false,
    side: 'bottom',
    sideOffset: 0,
  },
  argTypes: {
    disabled: {
      description:
        'Disables the trigger — muted fill, no pointer or keyboard interaction, and the popup can no longer be opened.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      description:
        'Story-only toggle. Marks the surrounding `Field` invalid and sets `aria-invalid` on the trigger, swapping the border and ring to `destructive` and the description for a `FieldError`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    side: {
      description:
        'Set on `SelectContent` — which side of the trigger the popup is positioned against.',
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      table: { defaultValue: { summary: 'bottom' } },
    },
    align: {
      description:
        'Set on `SelectContent` — how the popup aligns along the trigger on the chosen side.',
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: 'center' } },
    },
    sideOffset: {
      description:
        'Set on `SelectContent` — gap in pixels between the trigger and the popup.',
      control: { type: 'number', min: 0, max: 24, step: 1 },
      table: { defaultValue: { summary: '0' } },
    },
    alignItemWithTrigger: {
      description:
        'Set on `SelectContent`. When enabled the popup overlays the trigger so the selected item sits on top of it, instead of opening below.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      description:
        'Trigger content — a `SelectValue`, whose render prop receives the selected value so it can resolve the matching option label.',
      control: false,
    },
    className: { table: { disable: true } },
    render: {
      description:
        'Base UI render-prop composition. Swap the trigger element while preserving select behavior, styling, and slot attributes.',
      control: false,
    },
  },
} satisfies Meta<SelectStoryArgs>;

export default meta;

type Story = StoryObj<SelectStoryArgs>;

export const Default: Story = {
  render: (args) => (
    <SelectPreview
      args={args}
      label="Framework"
      placeholder="Select a framework"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('combobox', { name: 'Framework' });

    await expect(canvas.getByText('Framework')).toHaveAttribute(
      'data-slot',
      'field-label',
    );
    await expect(trigger).toHaveClass('w-full');
    await expect(page.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.click(trigger);

    const listbox = await page.findByRole('listbox');
    await waitFor(() => {
      expect(listbox).toBeVisible();
    });
    await waitFor(() => {
      expect(listbox.getBoundingClientRect().top).toBeCloseTo(
        trigger.getBoundingClientRect().bottom,
        0,
      );
    });

    await userEvent.click(page.getByRole('option', { name: 'Remix' }));
    await expect(trigger).toHaveTextContent('Remix');
  },
};

export const Groups: Story = {
  // The item composition is the subject; the popup positioning knobs still
  // apply. `disabled` is left out — it would hide what the story shows.
  parameters: {
    controls: {
      include: ['side', 'align', 'sideOffset', 'alignItemWithTrigger'],
    },
  },
  render: (args) => (
    <SelectPreview
      args={args}
      label="Deployment target"
      options={[...frameworks, ...regions]}
      placeholder="Select a target"
    >
      <SelectGroup>
        <SelectLabel>Frameworks</SelectLabel>
        {frameworks.map((framework) => (
          <SelectItem key={framework.value} value={framework.value}>
            {framework.label}
          </SelectItem>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Deployment regions</SelectLabel>
        {regions.map((region) => (
          <SelectItem key={region.value} value={region.value}>
            {region.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectPreview>
  ),
};

export const Scrollable: Story = {
  // `max-h-56` on the popup is what makes it scroll, so only the positioning
  // knobs are live here.
  parameters: {
    controls: {
      include: ['side', 'align', 'sideOffset', 'alignItemWithTrigger'],
    },
  },
  render: (args) => (
    <SelectPreview
      args={args}
      contentClassName="max-h-56"
      label="Timezone"
      options={timezones}
      placeholder="Select a timezone"
    />
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { controls: { include: ['disabled'] } },
  render: (args) => (
    <SelectPreview
      args={args}
      helperText="This select is unavailable."
      label="Framework"
      placeholder="Select a framework"
    />
  ),
};

export const Invalid: Story = {
  args: { invalid: true },
  parameters: { controls: { include: ['invalid'] } },
  render: (args) => (
    <SelectPreview
      args={args}
      helperText="Please select a framework."
      label="Framework"
      placeholder="Select a framework"
    />
  ),
};
