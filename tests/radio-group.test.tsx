import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  RadioGroup,
  RadioGroupItem,
  radioGroupItemVariants,
} from '@/ui/radio-group';

describe('RadioGroup', () => {
  it('renders an unselected item with stable data hooks', () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem description="Starter plan" value="starter">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    const radio = screen.getByRole('radio', { name: 'Starter' });
    expect(group).toHaveAttribute('data-slot', 'radio-group');
    expect(group).toHaveClass('grid', 'gap-3');
    expect(radio).toHaveAttribute('data-slot', 'radio-group-item');
    expect(radio).toHaveAttribute('data-variant', 'default');
    expect(radio).toHaveAttribute('data-unchecked');
    expect(
      radio.querySelector('[data-slot="radio-group-control"]'),
    ).toBeInTheDocument();
  });

  it('associates the visible description with its radio item', () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem description="Starter plan" value="starter">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    expect(
      screen.getByRole('radio', { name: 'Starter' }),
    ).toHaveAccessibleDescription('Starter plan');
  });

  it('renders the selected item and indicator', () => {
    render(
      <RadioGroup aria-label="Plan" defaultValue="starter">
        <RadioGroupItem value="starter">Starter</RadioGroupItem>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'Starter' });
    expect(radio).toHaveAttribute('data-checked');
    expect(
      radio.querySelector('[data-slot="radio-group-indicator"]'),
    ).toBeInTheDocument();
    expect(radio).toHaveClass('[&_[data-slot=radio-group-control]]:bg-primary');
  });

  it('selects one item and reports group value changes', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        aria-label="Plan"
        defaultValue="starter"
        onValueChange={onValueChange}
      >
        <RadioGroupItem value="starter">Starter</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
      </RadioGroup>,
    );

    const starter = screen.getByRole('radio', { name: 'Starter' });
    const pro = screen.getByRole('radio', { name: 'Pro' });
    await userEvent.click(pro);

    expect(onValueChange).toHaveBeenCalledWith('pro', expect.anything());
    expect(starter).toHaveAttribute('data-unchecked');
    expect(pro).toHaveAttribute('data-checked');
  });

  it('applies the boxed item variant', () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="starter" variant="box">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'Starter' });
    expect(radio).toHaveAttribute('data-variant', 'box');
    expect(radio).toHaveClass('border', 'bg-background', 'p-3');
  });

  it('does not select a disabled item', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Plan" onValueChange={onValueChange}>
        <RadioGroupItem disabled value="starter" variant="box">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'Starter' });
    expect(radio).toHaveAttribute('data-disabled');
    expect(radio).toHaveClass(
      'cursor-not-allowed',
      'border-transparent',
      '[&_[data-slot=radio-group-control]]:bg-muted',
    );
    await userEvent.click(radio);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('uses the selected disabled treatment', () => {
    render(
      <RadioGroup aria-label="Plan" defaultValue="starter">
        <RadioGroupItem disabled value="starter">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Starter' })).toHaveClass(
      '[&_[data-slot=radio-group-control]]:bg-muted-foreground',
      '[&_[data-slot=radio-group-control]]:text-background',
    );
  });

  it('applies invalid styling to default and boxed items', () => {
    const { rerender } = render(
      <RadioGroup aria-label="Plan" defaultValue="starter">
        <RadioGroupItem aria-invalid="true" value="starter">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    let radio = screen.getByRole('radio', { name: 'Starter' });
    expect(radio).toHaveClass(
      'text-destructive-foreground',
      '[&_[data-slot=radio-group-control]]:bg-destructive-foreground',
    );
    expect(radio).not.toHaveClass('bg-destructive');

    rerender(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem aria-invalid="true" value="starter" variant="box">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );
    radio = screen.getByRole('radio', { name: 'Starter' });
    expect(radio).toHaveClass(
      'border-destructive-foreground',
      'bg-destructive',
    );
  });

  it('preserves data hooks with Base UI render composition', () => {
    render(
      <RadioGroup
        aria-label="Plan"
        render={<section data-testid="custom-group" />}
      >
        <RadioGroupItem nativeButton={false} render={<div />} value="starter">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    expect(screen.getByTestId('custom-group')).toHaveAttribute(
      'data-slot',
      'radio-group',
    );
    const radio = screen.getByRole('radio', { name: 'Starter' });
    expect(radio.tagName).toBe('DIV');
    expect(radio).toHaveAttribute('data-slot', 'radio-group-item');
  });

  it('supports an aria-label without visible item text', () => {
    render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem aria-label="Starter" value="starter" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Starter' })).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="radio-group-text"]'),
    ).not.toBeInTheDocument();
  });

  it('exposes interaction classes and radioGroupItemVariants', () => {
    const defaultClasses = radioGroupItemVariants({ variant: 'default' });
    const boxClasses = radioGroupItemVariants({ variant: 'box' });

    expect(defaultClasses).toContain('focus-visible:ring-offset-2');
    expect(defaultClasses).toContain('rounded-[2px]');
    expect(defaultClasses).toContain('active:text-muted-foreground-strong');
    expect(boxClasses).toContain('hover:bg-muted');
    expect(boxClasses).toContain('focus-visible:ring-inset');
    expect(boxClasses).toContain('rounded-sm');
  });
});
