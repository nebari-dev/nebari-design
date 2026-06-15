import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner, spinnerVariants } from '@/ui/spinner';

describe('Spinner', () => {
  it('renders with the status role and default slot/size attributes', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('data-slot', 'spinner');
    expect(spinner).toHaveAttribute('data-size', 'default');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('defaults to the "Loading" accessible label', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
  });

  it('accepts a custom accessible label', () => {
    render(<Spinner label="Fetching data…" />);

    expect(screen.getByRole('status')).toHaveAccessibleName('Fetching data…');
  });

  it('applies the size class for explicit sizes', () => {
    render(<Spinner size="lg" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('data-size', 'lg');
    expect(spinner).toHaveClass('size-6');
  });

  it('adds no size class for the default size so it can inherit from a parent', () => {
    // Button relies on this: its `[&_svg:not([class*='size-'])]:size-*` rule
    // only sizes the spinner when the spinner has no `size-*` class of its own.
    render(<Spinner />);

    expect(screen.getByRole('status').getAttribute('class')).not.toMatch(
      /size-/,
    );
  });

  it('merges a custom className with the variant classes', () => {
    render(<Spinner className="text-primary" size="sm" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin', 'size-4', 'text-primary');
  });

  it('forwards arbitrary props to the underlying svg', () => {
    render(<Spinner data-testid="loader" />);

    expect(screen.getByTestId('loader')).toBe(screen.getByRole('status'));
  });

  it('exposes spinnerVariants for external composition', () => {
    expect(spinnerVariants({ size: 'xs' })).toContain('size-3.5');
    expect(spinnerVariants({ size: 'xl' })).toContain('size-8');
    expect(spinnerVariants()).toContain('animate-spin');
  });
});
