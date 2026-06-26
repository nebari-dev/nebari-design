import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field, FieldLabel } from '@/ui/field';
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

const frameworks = [
  { label: 'Next.js', value: 'next' },
  { label: 'Remix', value: 'remix' },
];

interface TestSelectProps {
  defaultValue?: string;
  onValueChange?: ComponentProps<typeof Select>['onValueChange'];
}

function TestSelect({ defaultValue, onValueChange }: TestSelectProps) {
  return (
    <Field>
      <FieldLabel>Framework</FieldLabel>
      <Select
        defaultValue={defaultValue}
        items={frameworks}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue>
            {(value) =>
              frameworks.find((option) => option.value === value)?.label ??
              'Select a framework'
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Frameworks</SelectLabel>
            {frameworks.map((framework) => (
              <SelectItem key={framework.value} value={framework.value}>
                {framework.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectItem disabled value="gatsby">
            Gatsby
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}

describe('Select', () => {
  it('renders its selected value and stable data hooks', () => {
    render(<TestSelect defaultValue="next" />);

    const trigger = screen.getByRole('combobox', { name: 'Framework' });
    expect(screen.getByText('Framework')).toHaveAttribute(
      'data-slot',
      'field-label',
    );
    expect(trigger).toHaveTextContent('Next.js');
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
  });

  it('uses stable trigger sizing and ring-based interaction states', () => {
    render(<TestSelect />);

    const trigger = screen.getByRole('combobox', { name: 'Framework' });
    expect(trigger).toHaveClass(
      'w-full',
      'border',
      'focus-visible:ring-2',
      'data-[pressed]:ring-2',
      'data-[popup-open]:ring-2',
      'aria-invalid:ring-2',
    );
    expect(trigger.className).not.toContain('border-2');
    expect(trigger.className).not.toContain('motion-safe:');
    expect(trigger.className).not.toContain('active:scale');
  });

  it('opens below the trigger mode and selects an item', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestSelect onValueChange={onValueChange} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Framework' }));

    const listbox = await screen.findByRole('listbox');
    const popup = listbox.closest('[data-slot="select-content"]');
    expect(popup).toHaveAttribute('data-align-trigger', 'false');
    expect(listbox).toHaveClass('p-1');
    expect(screen.getByText('Frameworks')).toHaveAttribute(
      'data-slot',
      'select-label',
    );
    expect(screen.getByText('Frameworks')).toHaveClass('uppercase');

    await user.click(screen.getByRole('option', { name: 'Remix' }));
    expect(onValueChange).toHaveBeenCalledWith('remix', expect.anything());
  });

  it('does not select disabled items', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestSelect onValueChange={onValueChange} />);

    const trigger = screen.getByRole('combobox', { name: 'Framework' });
    await user.click(trigger);

    const disabledOption = await screen.findByRole('option', {
      name: 'Gatsby',
    });
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    expect(disabledOption).toHaveClass('data-[disabled]:cursor-not-allowed');
    expect(disabledOption.className).not.toContain(
      'data-[disabled]:pointer-events-none',
    );
    expect(disabledOption.className).not.toContain(
      'data-disabled:pointer-events-none',
    );

    await user.click(disabledOption);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent('Select a framework');
  });

  // CSS positioning has no layout engine in jsdom; the Default story's play
  // test verifies the popup's bounding box in Playwright/Chromium.
});
