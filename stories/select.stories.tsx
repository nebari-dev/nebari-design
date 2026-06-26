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

interface SelectPreviewProps {
  label: string;
  placeholder: string;
  options?: readonly SelectOption[];
  defaultValue?: string;
  children?: ReactNode;
  helperText?: ReactNode;
  invalid?: boolean;
  contentClassName?: string;
  triggerProps?: Omit<SelectTriggerProps, 'children'>;
}

function findOptionLabel(
  options: readonly SelectOption[],
  value: unknown,
  placeholder: string,
) {
  return options.find((option) => option.value === value)?.label ?? placeholder;
}

function SelectPreview({
  label,
  placeholder,
  options = frameworks,
  defaultValue,
  children,
  helperText = 'Select one option.',
  invalid = false,
  contentClassName,
  triggerProps,
}: SelectPreviewProps) {
  return (
    <Field className="w-64" disabled={triggerProps?.disabled} invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select defaultValue={defaultValue} items={options} modal={false}>
        <SelectTrigger
          {...triggerProps}
          aria-invalid={invalid || triggerProps?.['aria-invalid']}
        >
          <SelectValue>
            {(value) => findOptionLabel(options, value, placeholder)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={contentClassName}>
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
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SelectTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SelectPreview
      label="Framework"
      placeholder="Select a framework"
      triggerProps={args}
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
    await expect(listbox).toBeVisible();
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
  render: () => (
    <SelectPreview
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
  render: () => (
    <SelectPreview
      contentClassName="max-h-56"
      label="Timezone"
      options={timezones}
      placeholder="Select a timezone"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <SelectPreview
      helperText="This select is unavailable."
      label="Framework"
      placeholder="Select a framework"
      triggerProps={{ disabled: true }}
    />
  ),
};

export const Invalid: Story = {
  render: () => (
    <SelectPreview
      helperText="Please select a framework."
      invalid
      label="Framework"
      placeholder="Select a framework"
    />
  ),
};
