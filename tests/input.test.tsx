import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

// CSS transitions are not testable in jsdom; animated/hover/focus visuals are
// verified in Storybook.

describe('Input', () => {
  it('renders a textbox with the base classes and data-slot', () => {
    render(<Input placeholder="Placeholder text" />);
    const input = screen.getByPlaceholderText('Placeholder text');
    expect(input).toHaveAttribute('data-slot', 'input');
    expect(input).toHaveClass('border-input', 'bg-background', 'rounded-md');
  });

  it('accepts typed input', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('reflects the disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('merges a caller className over the defaults', () => {
    render(<Input className="w-10" />);
    expect(screen.getByRole('textbox')).toHaveClass('w-10');
  });

  it('takes its accessible name from a FieldLabel', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input />
      </Field>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('pairs with a label via htmlFor / id', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
