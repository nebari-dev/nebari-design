import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { cn } from '@/lib/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem as SelectItemComponent,
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
  { label: 'Gatsby', value: 'gatsby', disabled: true },
] satisfies SelectOption[];

const regions = [
  { label: 'US Central', value: 'us-central' },
  { label: 'US East', value: 'us-east' },
  { label: 'Europe West', value: 'eu-west' },
] satisfies SelectOption[];

const roles = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Developer', value: 'developer' },
  { label: 'Viewer', value: 'viewer' },
] satisfies SelectOption[];

const exampleOptions = [...frameworks, ...regions, ...roles];

type SelectTriggerProps = ComponentProps<typeof SelectTrigger>;

const selectVariantStates: Array<{
  label: string;
  defaultValue?: string;
  helperText?: string;
  triggerProps?: Omit<SelectTriggerProps, 'children'>;
}> = [
  { label: 'Default' },
  { label: 'Filled', defaultValue: 'next' },
  {
    label: 'Focused',
    triggerProps: {
      className:
        'border-2 border-ring hover:border-ring data-[pressed]:border-ring data-[popup-open]:border-ring',
    },
  },
  {
    label: 'Disabled',
    defaultValue: 'next',
    helperText: 'This select is unavailable.',
    triggerProps: { disabled: true },
  },
  {
    label: 'Error',
    helperText: 'Please select an option.',
    triggerProps: { 'aria-invalid': true },
  },
];

interface SelectPreviewProps {
  label: string;
  placeholder: string;
  options?: readonly SelectOption[];
  defaultValue?: string;
  children?: ReactNode;
  helperText?: ReactNode;
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
  helperText = 'This is helper text.',
  triggerProps,
}: SelectPreviewProps) {
  const isInvalid =
    triggerProps?.['aria-invalid'] === true ||
    triggerProps?.['aria-invalid'] === 'true';

  return (
    <Field
      className="w-64"
      disabled={triggerProps?.disabled}
      invalid={isInvalid}
    >
      <FieldLabel>{label}</FieldLabel>
      <Select defaultValue={defaultValue} items={options} modal={false}>
        <SelectTrigger
          {...triggerProps}
          className={cn('w-full', triggerProps?.className)}
        >
          <SelectValue>
            {(value) => findOptionLabel(options, value, placeholder)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {children ??
            options.map((option) => (
              <SelectItemComponent
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItemComponent>
            ))}
        </SelectContent>
      </Select>
      {isInvalid ? (
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
          'Select compositions matching the Nebari design structure: FieldLabel names the trigger, while SelectLabel names a section within the popup menu.',
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

export const Variants: Story = {
  render: () => (
    <section className="w-64 space-y-6">
      {selectVariantStates.map((state) => (
        <div className="space-y-2" key={state.label}>
          <p className="font-medium text-muted-foreground text-xs">
            {state.label}
          </p>
          <SelectPreview
            defaultValue={state.defaultValue}
            helperText={state.helperText}
            label="Framework"
            placeholder="Select a framework"
            triggerProps={state.triggerProps}
          />
        </div>
      ))}
    </section>
  ),
};

export const SelectMenuLabel: Story = {
  name: 'Select Menu Label',
  render: () => (
    <SelectPreview label="Framework" placeholder="Select a framework">
      <SelectGroup>
        <SelectLabel>Frameworks</SelectLabel>
        {frameworks.map((framework) => (
          <SelectItemComponent key={framework.value} value={framework.value}>
            {framework.label}
          </SelectItemComponent>
        ))}
      </SelectGroup>
    </SelectPreview>
  ),
};

export const Separator: Story = {
  render: () => (
    <SelectPreview
      label="Deployment region"
      options={regions}
      placeholder="Select a region"
    >
      <SelectGroup>
        <SelectLabel>United States</SelectLabel>
        <SelectItemComponent value="us-central">US Central</SelectItemComponent>
        <SelectItemComponent value="us-east">US East</SelectItemComponent>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Europe</SelectLabel>
        <SelectItemComponent value="eu-west">Europe West</SelectItemComponent>
      </SelectGroup>
    </SelectPreview>
  ),
};

export const SelectItem: Story = {
  name: 'Select Item',
  render: () => (
    <SelectPreview
      defaultValue="next"
      label="Framework"
      placeholder="Select a framework"
    >
      <SelectItemComponent value="next">Next.js</SelectItemComponent>
      <SelectItemComponent value="remix">Remix</SelectItemComponent>
      <SelectItemComponent disabled value="gatsby">
        Gatsby
      </SelectItemComponent>
    </SelectPreview>
  ),
};

export const SelectMenu: Story = {
  name: 'Select Menu',
  render: () => (
    <SelectPreview
      defaultValue="developer"
      label="Role"
      options={roles}
      placeholder="Select a role"
    >
      <SelectGroup>
        <SelectLabel>Workspace roles</SelectLabel>
        {roles.map((role) => (
          <SelectItemComponent key={role.value} value={role.value}>
            {role.label}
          </SelectItemComponent>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectItemComponent disabled value="owner">
        Owner
      </SelectItemComponent>
    </SelectPreview>
  ),
};

export const Examples: Story = {
  render: () => (
    <SelectPreview
      defaultValue="next"
      helperText="Choose the framework, deployment region, or workspace role."
      label="Application setting"
      options={exampleOptions}
      placeholder="Select an option"
    >
      <SelectGroup>
        <SelectLabel>Frameworks</SelectLabel>
        {frameworks.map((framework) => (
          <SelectItemComponent
            disabled={framework.disabled}
            key={framework.value}
            value={framework.value}
          >
            {framework.label}
          </SelectItemComponent>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Deployment regions</SelectLabel>
        {regions.map((region) => (
          <SelectItemComponent key={region.value} value={region.value}>
            {region.label}
          </SelectItemComponent>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Workspace roles</SelectLabel>
        {roles.map((role) => (
          <SelectItemComponent key={role.value} value={role.value}>
            {role.label}
          </SelectItemComponent>
        ))}
      </SelectGroup>
    </SelectPreview>
  ),
};
