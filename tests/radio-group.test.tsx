import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field, FieldError, FieldLabel } from '@/ui/field';
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
    expect(
      radio
        .querySelector('[data-slot="radio-group-target"]')
        ?.getAttribute('class'),
    ).not.toContain('motion-safe:');
    expect(
      radio.querySelector('[data-slot="radio-group-indicator"]'),
    ).toHaveClass('invisible');
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
    ).not.toHaveClass('invisible');
    expect(radio).toHaveClass(
      '[&_[data-slot=radio-group-target]]:fill-primary',
    );
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

  it('forwards className to the group and item', () => {
    render(
      <RadioGroup aria-label="Plan" className="gap-5">
        <RadioGroupItem className="p-4" value="starter">
          Starter
        </RadioGroupItem>
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toHaveClass(
      'gap-5',
    );
    expect(screen.getByRole('radio', { name: 'Starter' })).toHaveClass('p-4');
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
      '[&_[data-slot=radio-group-target]]:fill-muted',
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
      '[&_[data-slot=radio-group-target]]:fill-muted-foreground',
      '[&_[data-slot=radio-group-control]]:text-background',
    );
  });

  it('keeps radio items visually neutral when the group is invalid', () => {
    render(
      <Field invalid>
        <FieldLabel id="plan-label">Choose a plan</FieldLabel>
        <RadioGroup
          aria-describedby="plan-error"
          aria-labelledby="plan-label"
          required
        >
          <RadioGroupItem value="starter">Starter</RadioGroupItem>
          <RadioGroupItem value="pro" variant="box">
            Pro
          </RadioGroupItem>
        </RadioGroup>
        <FieldError id="plan-error" match>
          Please select a plan to continue.
        </FieldError>
      </Field>,
    );

    const group = screen.getByRole('radiogroup', { name: 'Choose a plan' });
    const starter = screen.getByRole('radio', { name: 'Starter' });
    const pro = screen.getByRole('radio', { name: 'Pro' });

    expect(group).toHaveAttribute('data-invalid');
    expect(group).toHaveAccessibleDescription(
      'Please select a plan to continue.',
    );
    expect(starter).not.toHaveClass(
      'text-destructive-foreground',
      '[&_[data-slot=radio-group-target]]:stroke-destructive-foreground',
    );
    expect(pro).not.toHaveClass(
      'border-destructive-foreground',
      'bg-destructive',
    );
  });

  it('keeps invalid group state semantic without visual chrome', () => {
    render(
      <RadioGroup aria-invalid="true" aria-label="Plan">
        <RadioGroupItem value="starter">Starter</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).not.toHaveClass(
      'aria-invalid:ring-2',
      'data-[invalid]:ring-2',
      'aria-invalid:p-3',
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

    expect(defaultClasses).not.toContain('motion-safe:');
    expect(defaultClasses).toContain('focus-visible:border-ring');
    expect(defaultClasses).toContain('rounded-sm');
    expect(defaultClasses).toContain('p-0.5');
    expect(defaultClasses).toContain('active:text-muted-foreground-strong');
    expect(boxClasses).toContain('hover:bg-muted');
    expect(boxClasses).toContain('focus-visible:border-2');
    expect(boxClasses).toContain('rounded-sm');
  });
});
