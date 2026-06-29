import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Checkbox,
  CheckboxGroup,
  checkboxGroupVariants,
  checkboxVariants,
} from '@/ui/checkbox';

describe('Checkbox', () => {
  it('renders a vertical checkbox group by default', () => {
    render(
      <CheckboxGroup aria-label="Workspace features">
        <Checkbox value="notebooks">Notebooks</Checkbox>
      </CheckboxGroup>,
    );

    const group = screen.getByRole('group', {
      name: 'Workspace features',
    });
    expect(group).toHaveAttribute('data-slot', 'checkbox-group');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveClass('grid', 'gap-3');
  });

  it('lays out a checkbox group horizontally when requested', () => {
    render(
      <CheckboxGroup aria-label="Workspace features" orientation="horizontal">
        <Checkbox value="notebooks">Notebooks</Checkbox>
        <Checkbox value="dashboards">Dashboards</Checkbox>
      </CheckboxGroup>,
    );

    const group = screen.getByRole('group', {
      name: 'Workspace features',
    });
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group).toHaveClass('flex', 'flex-wrap', 'gap-x-5', 'gap-y-3');
    expect(group).not.toHaveClass('grid');
  });

  it('renders the default, unchecked variant with stable data hooks', () => {
    render(<Checkbox description="A description">Checkbox Text</Checkbox>);

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    expect(checkbox).toHaveAttribute('data-variant', 'default');
    expect(checkbox).toHaveAttribute('data-unchecked');
    expect(
      checkbox.querySelector('[data-slot="checkbox-control"]'),
    ).toBeInTheDocument();
  });

  it('associates the visible description with the checkbox', () => {
    render(
      <Checkbox description="This is a checkbox description.">
        Checkbox Text
      </Checkbox>,
    );

    expect(
      screen.getByRole('checkbox', { name: 'Checkbox Text' }),
    ).toHaveAccessibleDescription('This is a checkbox description.');
  });

  it('renders checked state and its indicator', () => {
    render(<Checkbox defaultChecked>Checkbox Text</Checkbox>);

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox).toHaveAttribute('data-checked');
    expect(
      checkbox.querySelector('[data-slot="checkbox-indicator"]'),
    ).toBeInTheDocument();
    expect(checkbox).toHaveClass('[&_[data-slot=checkbox-control]]:bg-primary');
  });

  it('renders an indeterminate state with a stable minus indicator', () => {
    render(<Checkbox indeterminate>Checkbox Text</Checkbox>);

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    const checkedIndicator = checkbox.querySelector(
      '[data-slot="checkbox-indicator"]',
    );
    const indeterminateIndicator = checkbox.querySelector(
      '[data-slot="checkbox-indeterminate-indicator"]',
    );

    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox).toHaveClass('[&_[data-slot=checkbox-control]]:bg-primary');
    expect(checkedIndicator).toHaveClass('invisible');
    expect(indeterminateIndicator).not.toHaveClass('invisible');
  });

  it('toggles and reports checked state changes', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox onCheckedChange={onCheckedChange}>Checkbox Text</Checkbox>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    await userEvent.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(checkbox).toHaveAttribute('data-checked');
  });

  it('applies the boxed variant', () => {
    render(<Checkbox variant="box">Checkbox Text</Checkbox>);

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox).toHaveAttribute('data-variant', 'box');
    expect(checkbox).toHaveClass('border', 'bg-background', 'p-3');
  });

  it('does not toggle and uses the disabled treatment when disabled', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        defaultChecked
        disabled
        onCheckedChange={onCheckedChange}
        variant="box"
      >
        Checkbox Text
      </Checkbox>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox).toHaveAttribute('data-disabled');
    expect(checkbox).toHaveClass(
      'cursor-not-allowed',
      'border-transparent',
      '[&_[data-slot=checkbox-control]]:bg-muted-foreground',
    );
    await userEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('applies invalid styling to both variants', () => {
    const { rerender } = render(
      <Checkbox aria-invalid="true" defaultChecked>
        Checkbox Text
      </Checkbox>,
    );

    let checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox).toHaveClass(
      'text-destructive-foreground',
      '[&_[data-slot=checkbox-control]]:bg-destructive-foreground',
    );
    expect(checkbox).not.toHaveClass('bg-destructive');

    rerender(
      <Checkbox aria-invalid="true" variant="box">
        Checkbox Text
      </Checkbox>,
    );
    checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox).toHaveClass(
      'border-destructive-foreground',
      'bg-destructive',
    );
  });

  it('preserves styling and data hooks with Base UI render composition', () => {
    render(
      <Checkbox nativeButton={false} render={<div />}>
        Checkbox Text
      </Checkbox>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Checkbox Text' });
    expect(checkbox.tagName).toBe('DIV');
    expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
    expect(checkbox).toHaveAttribute('data-variant', 'default');
  });

  it('supports an aria-label without visible text', () => {
    render(<Checkbox aria-label="Accept terms" />);

    expect(
      screen.getByRole('checkbox', { name: 'Accept terms' }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="checkbox-text"]'),
    ).not.toBeInTheDocument();
  });

  it('exposes interaction classes and checkboxVariants', () => {
    const groupClasses = checkboxGroupVariants({ orientation: 'horizontal' });
    const defaultClasses = checkboxVariants({ variant: 'default' });
    const boxClasses = checkboxVariants({ variant: 'box' });

    expect(groupClasses).toContain('flex');
    expect(groupClasses).toContain('gap-x-5');
    expect(defaultClasses).not.toContain('motion-safe:');
    expect(defaultClasses).toContain('focus-visible:ring-offset-2');
    expect(defaultClasses).toContain('rounded-[2px]');
    expect(defaultClasses).toContain('active:text-muted-foreground-strong');
    expect(boxClasses).toContain('hover:bg-muted');
    expect(boxClasses).toContain('focus-visible:ring-inset');
    expect(boxClasses).toContain('rounded-sm');
  });
});
