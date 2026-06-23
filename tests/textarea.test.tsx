import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from '@/ui/textarea';

// CSS transitions are not testable in jsdom; animated/hover/focus visuals are
// verified in Storybook.

describe('Textarea', () => {
  it('renders a textbox with the base classes and data-slot', () => {
    render(<Textarea placeholder="Placeholder text" />);
    const textarea = screen.getByPlaceholderText('Placeholder text');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
    expect(textarea).toHaveClass('border-input', 'min-h-16', 'rounded-md');
  });

  it('accepts typed input', async () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'multi\nline');
    expect(textarea).toHaveValue('multi\nline');
  });

  it('reflects the disabled state', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('merges a caller className over the defaults', () => {
    render(<Textarea className="min-h-32" />);
    expect(screen.getByRole('textbox')).toHaveClass('min-h-32');
  });
});
