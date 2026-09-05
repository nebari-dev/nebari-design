import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fragment } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
import { Field, FieldLabel } from '@/components/ui/field';

interface Framework {
  label: string;
  value: string;
  disabled?: boolean;
}

const frameworks = [
  { label: 'Next.js', value: 'next' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
  { label: 'Ember.js', value: 'ember', disabled: true },
] satisfies Framework[];

const [nextjs, remix] = frameworks;

interface TestComboboxProps {
  clearable?: boolean;
  defaultValue?: Framework | null;
  disabled?: boolean;
  filter?: (item: Framework, query: string) => boolean;
  invalid?: boolean;
  onValueChange?: (value: Framework | null) => void;
}

function TestCombobox({
  clearable,
  defaultValue,
  disabled,
  filter,
  invalid,
  onValueChange,
}: TestComboboxProps) {
  return (
    <Field invalid={invalid}>
      <FieldLabel>Framework</FieldLabel>
      <Combobox
        defaultValue={defaultValue}
        disabled={disabled}
        filter={filter}
        items={frameworks}
        onValueChange={onValueChange}
      >
        <ComboboxInput clearable={clearable} placeholder="Select framework…" />
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            {(item: Framework) => (
              <ComboboxItem
                disabled={item.disabled}
                key={item.value}
                value={item}
              >
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

interface TestMultiComboboxProps {
  clearable?: boolean;
  defaultValue?: Framework[];
  onValueChange?: (value: Framework[]) => void;
}

function TestMultiCombobox({
  clearable,
  defaultValue = [],
  onValueChange,
}: TestMultiComboboxProps) {
  return (
    <Field>
      <FieldLabel>Frameworks</FieldLabel>
      <Combobox
        defaultValue={defaultValue}
        items={frameworks}
        multiple
        onValueChange={onValueChange}
      >
        <ComboboxChips clearable={clearable}>
          <ComboboxValue>
            {(value: Framework[]) => (
              <>
                {value.map((item) => (
                  <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                ))}
                <ComboboxInput
                  placeholder={value.length > 0 ? undefined : 'Select…'}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            {(item: Framework) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

function getField() {
  return screen
    .getByRole('combobox', { name: /Framework/ })
    .closest('[data-slot="combobox-field"]');
}

describe('Combobox', () => {
  it('renders the field box with stable data hooks and design sizing', () => {
    render(<TestCombobox />);

    const input = screen.getByRole('combobox', { name: 'Framework' });
    expect(input).toHaveAttribute('data-slot', 'combobox-input');
    expect(input).toHaveAttribute('placeholder', 'Select framework…');

    const field = getField();
    expect(field).toHaveAttribute('data-slot', 'combobox-field');
    expect(field).toHaveClass(
      'min-h-8',
      'rounded-md',
      'border-input',
      'bg-background',
      'px-3',
      'text-sm',
      'hover:border-border-strong',
      'has-focus-visible:ring-2',
      'data-popup-open:ring-2',
      'has-aria-invalid:ring-2',
    );
    expect(field?.className).not.toContain('duration-[');

    // Base UI labels the trigger from the Field label; the `aria-label`
    // fallback only applies outside a Field.
    const trigger = screen.getByRole('button', { name: 'Framework' });
    expect(trigger).toHaveAttribute('data-slot', 'combobox-trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('tabindex', '-1');
    expect(trigger).toHaveAttribute('data-placeholder');
    expect(
      trigger.querySelector('[data-slot="combobox-icon"] svg'),
    ).toBeInTheDocument();
  });

  it('falls back to a generic trigger label outside a Field', () => {
    render(
      <Combobox items={frameworks}>
        <ComboboxInput aria-label="Framework" />
      </Combobox>,
    );

    expect(
      screen.getByRole('button', { name: 'Open options' }),
    ).toHaveAttribute('data-slot', 'combobox-trigger');
  });

  it('filters the list as the user types', async () => {
    const user = userEvent.setup();
    render(<TestCombobox />);

    const input = screen.getByRole('combobox', { name: 'Framework' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.type(input, 're');

    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAttribute('data-slot', 'combobox-list');
    expect(listbox.closest('[data-slot="combobox-content"]')).toHaveClass(
      'rounded-lg',
      'bg-popover',
      'p-1',
      'shadow-md',
      'data-[starting-style]:opacity-0',
      'motion-safe:duration-(--duration-base)',
    );
    expect(screen.getByRole('option', { name: 'Remix' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Next.js' }),
    ).not.toBeInTheDocument();
  });

  it('lets the consumer override the filter', async () => {
    const user = userEvent.setup();
    render(<TestCombobox filter={() => true} />);

    await user.type(screen.getByRole('combobox', { name: 'Framework' }), 'zz');

    await screen.findByRole('listbox');
    expect(screen.getAllByRole('option')).toHaveLength(frameworks.length);
  });

  it('selects an item, fills the input, and closes the popup', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestCombobox onValueChange={onValueChange} />);

    const input = screen.getByRole('combobox', { name: 'Framework' });
    await user.click(input);
    await screen.findByRole('listbox');
    expect(getField()).toHaveAttribute('data-popup-open');

    const option = screen.getByRole('option', { name: 'Remix' });
    expect(option).toHaveAttribute('data-slot', 'combobox-item');
    expect(option).toHaveClass(
      'py-1',
      'not-data-[disabled]:data-[highlighted]:bg-muted',
    );

    await user.click(option);
    expect(onValueChange).toHaveBeenCalledWith(remix, expect.anything());
    expect(input).toHaveValue('Remix');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks the selected item with a trailing check', async () => {
    const user = userEvent.setup();
    render(<TestCombobox defaultValue={nextjs} />);

    await user.click(screen.getByRole('combobox', { name: 'Framework' }));
    const option = await screen.findByRole('option', { name: 'Next.js' });

    expect(option).toHaveAttribute('aria-selected', 'true');
    expect(
      option.querySelector('[data-slot="combobox-item-indicator"] svg'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('option', { name: 'Remix' })
        .querySelector('[data-slot="combobox-item-indicator"]'),
    ).not.toBeInTheDocument();
  });

  it('does not select disabled items', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestCombobox onValueChange={onValueChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Framework' }));
    const disabledOption = await screen.findByRole('option', {
      name: 'Ember.js',
    });
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    // Highlight is gated behind `not-data-[disabled]` so a disabled row never
    // gets hover treatment from the pointer or from keyboard navigation.
    expect(disabledOption).toHaveClass(
      'not-data-[disabled]:data-[highlighted]:bg-muted',
    );
    expect(disabledOption.className).not.toContain(
      ' data-[highlighted]:bg-muted',
    );

    await user.click(disabledOption);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows the empty state when filtering yields nothing', async () => {
    const user = userEvent.setup();
    render(<TestCombobox />);

    await user.type(
      screen.getByRole('combobox', { name: 'Framework' }),
      'qwerty',
    );

    const status = await screen.findByRole('status');
    expect(status).toHaveAttribute('data-slot', 'combobox-empty');
    expect(status).toHaveTextContent('No results found.');
    expect(status).toHaveClass('text-center', 'py-5', 'empty:p-0');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('omits the clear control until there is a value, then swaps it for the chevron', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestCombobox clearable onValueChange={onValueChange} />);

    const input = screen.getByRole('combobox', { name: 'Framework' });
    const trigger = screen.getByRole('button', { name: 'Framework' });
    expect(
      screen.queryByRole('button', { name: 'Clear selection' }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveClass('not-data-placeholder:hidden');
    expect(trigger).toHaveAttribute('data-placeholder');

    await user.click(input);
    await user.click(await screen.findByRole('option', { name: 'Remix' }));
    expect(input).toHaveValue('Remix');

    const clear = screen.getByRole('button', { name: 'Clear selection' });
    expect(clear).toHaveAttribute('data-slot', 'combobox-clear');
    expect(trigger).not.toHaveAttribute('data-placeholder');

    await user.click(clear);
    expect(onValueChange).toHaveBeenLastCalledWith(null, expect.anything());
    expect(input).toHaveValue('');
    expect(trigger).toHaveAttribute('data-placeholder');
    expect(
      screen.queryByRole('button', { name: 'Clear selection' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the chevron when not clearable, even with a value', () => {
    render(<TestCombobox defaultValue={nextjs} />);

    const trigger = screen.getByRole('button', { name: 'Framework' });
    expect(trigger).not.toHaveClass('not-data-placeholder:hidden');
    expect(
      screen.queryByRole('button', { name: 'Clear selection' }),
    ).not.toBeInTheDocument();
  });

  it('is not operable when disabled', async () => {
    const user = userEvent.setup();
    render(<TestCombobox disabled />);

    const input = screen.getByRole('combobox', { name: 'Framework' });
    expect(input).toBeDisabled();
    expect(getField()).toHaveAttribute('data-disabled');
    expect(getField()).toHaveClass('data-disabled:bg-muted');

    await user.click(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('reflects an invalid Field on the input', () => {
    render(<TestCombobox invalid />);

    const input = screen.getByRole('combobox', { name: 'Framework' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(getField()).toHaveClass(
      'has-aria-invalid:border-destructive-foreground',
    );
  });

  it('renders grouped options with labels and separators', async () => {
    const user = userEvent.setup();
    const groups = [
      { value: 'Frameworks', items: [nextjs, remix] },
      { value: 'Static', items: [frameworks[2]] },
    ];
    render(
      <Combobox items={groups}>
        <ComboboxInput aria-label="Framework" />
        <ComboboxContent>
          <ComboboxList>
            {(group: (typeof groups)[number], index: number) => (
              <Fragment key={group.value}>
                {index > 0 && <ComboboxSeparator />}
                <ComboboxGroup items={group.items}>
                  <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                  <ComboboxCollection>
                    {(item: Framework) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              </Fragment>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    await user.click(screen.getByRole('combobox', { name: 'Framework' }));
    await screen.findByRole('listbox');

    const label = screen.getByText('Frameworks');
    expect(label).toHaveAttribute('data-slot', 'combobox-group-label');
    expect(label).toHaveClass('uppercase', 'text-xs', 'tracking-[0.8px]');
    expect(screen.getByRole('group', { name: 'Static' })).toHaveAttribute(
      'data-slot',
      'combobox-group',
    );
    const separators = document.querySelectorAll(
      '[data-slot="combobox-separator"]',
    );
    expect(separators).toHaveLength(1);
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
    expect(separators[0]).not.toHaveAttribute('role');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  describe('multiple', () => {
    it('renders selected values as removable chips before the input', () => {
      render(<TestMultiCombobox defaultValue={[nextjs, remix]} />);

      const field = getField();
      expect(field).toHaveClass('flex-wrap');
      const chips = field?.querySelector('[data-slot="combobox-chips"]');
      expect(chips).toHaveAttribute('role', 'toolbar');

      const chip = screen.getByText('Next.js').closest('[data-slot]');
      expect(chip).toHaveAttribute('data-slot', 'combobox-chip');
      expect(chip).toHaveClass('rounded-full', 'border-border-strong');
      expect(
        screen.getByRole('button', { name: 'Remove Next.js' }),
      ).toHaveAttribute('data-slot', 'combobox-chip-remove');

      // The input follows the chips inside the same field box.
      const input = screen.getByRole('combobox', { name: 'Frameworks' });
      expect(chips).toContainElement(input);
      expect(input).not.toHaveAttribute('placeholder');
      expect(chip?.compareDocumentPosition(input)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it('removes a chip via its remove control', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <TestMultiCombobox
          defaultValue={[nextjs, remix]}
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Remove Next.js' }));

      expect(onValueChange).toHaveBeenCalledWith([remix], expect.anything());
      expect(screen.queryByText('Next.js')).not.toBeInTheDocument();
      expect(screen.getByText('Remix')).toBeInTheDocument();
    });

    it('adds chips from the list and clears them all at once', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<TestMultiCombobox clearable onValueChange={onValueChange} />);

      const input = screen.getByRole('combobox', { name: 'Frameworks' });
      expect(input).toHaveAttribute('placeholder', 'Select…');
      expect(
        screen.queryByRole('button', { name: 'Clear selection' }),
      ).not.toBeInTheDocument();

      await user.click(input);
      await user.click(await screen.findByRole('option', { name: 'Astro' }));
      expect(onValueChange).toHaveBeenLastCalledWith(
        [frameworks[2]],
        expect.anything(),
      );
      expect(
        screen.getByRole('button', { name: 'Remove Astro' }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(onValueChange).toHaveBeenLastCalledWith([], expect.anything());
      expect(
        screen.queryByRole('button', { name: 'Remove Astro' }),
      ).not.toBeInTheDocument();
    });
  });

  // CSS positioning and transitions have no layout engine in jsdom; the
  // stories' play functions verify the open popup in Playwright/Chromium.
});
