import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, Fragment, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
} from '@/components/ui/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

interface Framework {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FrameworkGroup {
  value: string;
  items: Framework[];
}

const frameworks = [
  { label: 'Next.js', value: 'next' },
  { label: 'SvelteKit', value: 'sveltekit' },
  { label: 'Nuxt.js', value: 'nuxt' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
  { label: 'Ember.js', value: 'ember', disabled: true },
] satisfies Framework[];

const libraries = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Preact', value: 'preact' },
] satisfies Framework[];

const groupedFrameworks = [
  { value: 'Frameworks', items: libraries.slice(0, 3) },
  { value: 'Meta-frameworks', items: frameworks.slice(0, 3) },
] satisfies FrameworkGroup[];

const [nextjs, sveltekit] = frameworks;

type ComboboxContentProps = ComponentProps<typeof ComboboxContent>;

interface ComboboxStoryArgs
  extends Pick<ComboboxContentProps, 'align' | 'side' | 'sideOffset'> {
  clearable: boolean;
  disabled: boolean;
  invalid: boolean;
  multiple: boolean;
  placeholder: string;
  // Docs-only rows (no knob) and hidden plumbing — never read by the render.
  items?: unknown;
  filter?: unknown;
  render?: ComponentProps<typeof ComboboxInput>['render'];
  className?: string;
  fieldClassName?: string;
  onValueChange?: unknown;
}

interface ComboboxPreviewProps {
  args: ComboboxStoryArgs;
  label: string;
  helperText?: ReactNode;
  items?: readonly Framework[] | readonly FrameworkGroup[];
  defaultValue?: Framework | Framework[] | null;
  defaultInputValue?: string;
  defaultOpen?: boolean;
  /** Custom `ComboboxList` content; defaults to one item per entry in `items`. */
  children?: ComponentProps<typeof ComboboxList>['children'];
}

function renderFramework(item: Framework) {
  return (
    <ComboboxItem disabled={item.disabled} key={item.value} value={item}>
      {item.label}
    </ComboboxItem>
  );
}

/**
 * Splits the flat story args across the parts they belong to — positioning
 * knobs onto `ComboboxContent`, `clearable` onto the field, `multiple` and
 * `disabled` onto the root — and wraps everything in a `Field`.
 */
function ComboboxPreview({
  args: {
    align,
    clearable,
    disabled,
    invalid,
    multiple,
    placeholder,
    side,
    sideOffset,
  },
  label,
  helperText = 'Type to filter the list.',
  items = frameworks,
  defaultValue,
  defaultInputValue,
  defaultOpen,
  children = renderFramework,
}: ComboboxPreviewProps) {
  return (
    <Field className="w-72" disabled={disabled} invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Combobox
        defaultInputValue={defaultInputValue}
        defaultOpen={defaultOpen}
        defaultValue={defaultValue}
        disabled={disabled}
        items={items}
        multiple={multiple}
      >
        {multiple ? (
          <ComboboxChips clearable={clearable}>
            <ComboboxValue>
              {(value: Framework[]) => (
                <>
                  {value.map((item) => (
                    <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                  ))}
                  <ComboboxInput
                    aria-invalid={invalid || undefined}
                    placeholder={value.length > 0 ? undefined : placeholder}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
        ) : (
          <ComboboxInput
            aria-invalid={invalid || undefined}
            clearable={clearable}
            placeholder={placeholder}
          />
        )}
        <ComboboxContent align={align} side={side} sideOffset={sideOffset}>
          <ComboboxEmpty />
          <ComboboxList>{children}</ComboboxList>
        </ComboboxContent>
      </Combobox>
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
  title: 'Components/Combobox',
  component: ComboboxInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An autocomplete input paired with a filterable list of suggestions. Supports single and multi-select (chips), grouped options, an empty state, and an optional clear affordance that replaces the trailing chevron. Built on Base UI’s Combobox.',
      },
    },
  },
  // `multiple` changes the value shape, so re-mount when it flips.
  decorators: [(Story, { args }) => <Story key={String(args.multiple)} />],
  args: {
    align: 'center',
    clearable: false,
    disabled: false,
    invalid: false,
    multiple: false,
    placeholder: 'Select framework…',
    side: 'bottom',
    sideOffset: 4,
  },
  argTypes: {
    multiple: {
      description:
        'Set on `Combobox` — allows several values, rendered as removable chips inside a `ComboboxChips` field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    clearable: {
      description:
        'Shows an `×` that resets the selection once the field has a value. It replaces the trailing chevron rather than sitting beside it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      description: 'Hint shown in the input while nothing is selected.',
      control: 'text',
    },
    disabled: {
      description:
        'Set on `Combobox` — muted fill, no pointer or keyboard interaction, and the popup can no longer be opened.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      description:
        'Story-only toggle. Marks the surrounding `Field` invalid and sets `aria-invalid` on the input, swapping the border and ring to `destructive` and the description for a `FieldError`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    side: {
      description:
        'Set on `ComboboxContent` — which side of the field the popup is positioned against.',
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      table: { defaultValue: { summary: 'bottom' } },
    },
    align: {
      description:
        'Set on `ComboboxContent` — how the popup aligns along the field on the chosen side.',
      control: 'select',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: 'center' } },
    },
    sideOffset: {
      description:
        'Set on `ComboboxContent` — gap in pixels between the field and the popup.',
      control: { type: 'number', min: 0, max: 24, step: 1 },
      table: { defaultValue: { summary: '4' } },
    },
    items: {
      description:
        'Set on `Combobox` — the options to filter. Flat `{ label, value }` objects, or `{ value, items }` groups rendered with `ComboboxGroup` + `ComboboxCollection`.',
      control: false,
    },
    filter: {
      description:
        'Set on `Combobox` — overrides the built-in collator-based typeahead match. Build one with `useComboboxFilter`.',
      control: false,
    },
    render: {
      description:
        'Base UI render-prop composition. Swap the input element while preserving combobox behavior, styling, and slot attributes.',
      control: false,
    },
    className: { table: { disable: true } },
    fieldClassName: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
} satisfies Meta<ComboboxStoryArgs>;

export default meta;

type Story = StoryObj<ComboboxStoryArgs>;

export const Default: Story = {
  render: (args) => <ComboboxPreview args={args} label="Framework" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await expect(input).toHaveAttribute('data-slot', 'combobox-input');
    await expect(input.closest('[data-slot="combobox-field"]')).toHaveClass(
      'min-h-8',
    );
    await expect(page.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.click(input);

    const listbox = await page.findByRole('listbox');
    await waitFor(() => {
      expect(listbox).toBeVisible();
    });

    await userEvent.click(page.getByRole('option', { name: 'Remix' }));
    await expect(input).toHaveValue('Remix');
    // Wait out the exit transition: Base UI's focus guards stay in the DOM
    // while the popup unmounts, and the a11y run would flag them.
    await waitFor(() => {
      expect(page.queryByRole('listbox')).not.toBeInTheDocument();
    });
  },
};

export const SingleOpen: Story = {
  name: 'Single select — open',
  parameters: { controls: { include: [] } },
  render: (args) => (
    <ComboboxPreview args={args} defaultOpen label="Framework" />
  ),
};

export const MultiSelectOpen: Story = {
  name: 'Multi-select — open',
  args: { multiple: true, placeholder: 'Select frameworks…' },
  parameters: { controls: { include: [] } },
  render: (args) => (
    <ComboboxPreview
      args={args}
      defaultOpen
      defaultValue={[nextjs, sveltekit]}
      label="Frameworks"
    />
  ),
};

export const Grouped: Story = {
  name: 'Grouped options',
  parameters: { controls: { include: [] } },
  render: (args) => (
    <ComboboxPreview
      args={args}
      defaultOpen
      defaultValue={libraries[2]}
      items={groupedFrameworks}
      label="Framework"
    >
      {(group: FrameworkGroup, index: number) => (
        <Fragment key={group.value}>
          {index > 0 && <ComboboxSeparator />}
          <ComboboxGroup items={group.items}>
            <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
            <ComboboxCollection>{renderFramework}</ComboboxCollection>
          </ComboboxGroup>
        </Fragment>
      )}
    </ComboboxPreview>
  ),
};

export const NoResults: Story = {
  name: 'No results',
  parameters: { controls: { include: [] } },
  render: (args) => (
    <ComboboxPreview
      args={args}
      defaultInputValue="qwerty"
      defaultOpen
      label="Framework"
    />
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('status')).toHaveTextContent(
      'No results found.',
    );
    await expect(page.queryByRole('option')).not.toBeInTheDocument();
  },
};

export const Clearable: Story = {
  name: 'Clear affordance',
  args: { clearable: true },
  parameters: { controls: { include: [] } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ComboboxPreview
        args={{ ...args, multiple: false }}
        defaultValue={nextjs}
        helperText="The × replaces the chevron while a value is set."
        label="Framework"
      />
      <ComboboxPreview
        args={{ ...args, multiple: true, placeholder: 'Select frameworks…' }}
        defaultValue={[nextjs, sveltekit]}
        helperText="Clearing removes every chip at once."
        label="Frameworks"
      />
    </div>
  ),
};

export const Invalid: Story = {
  args: { invalid: true },
  parameters: { controls: { include: [] } },
  render: (args) => (
    <ComboboxPreview
      args={args}
      helperText="Select a framework to continue."
      label="Framework"
    />
  ),
};

export const Typeahead: Story = {
  name: 'Typeahead filtering',
  parameters: { controls: { include: [] } },
  render: (args) => (
    <ComboboxPreview
      args={args}
      defaultInputValue="re"
      defaultOpen
      items={[...libraries, ...frameworks]}
      label="Framework"
    />
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await page.findByRole('listbox');
    await expect(page.getByRole('option', { name: 'React' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Remix' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Preact' })).toBeVisible();
    await expect(
      page.queryByRole('option', { name: 'Next.js' }),
    ).not.toBeInTheDocument();
  },
};
