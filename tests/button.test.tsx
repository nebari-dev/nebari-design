import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, buttonVariants } from '@/ui/button';

describe('Button', () => {
  it('renders a button with default variant/size data attributes', () => {
    render(<Button>Click</Button>);

    const button = screen.getByRole('button', { name: 'Click' });
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveAttribute('data-size', 'default');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies variant and size classes', () => {
    render(
      <Button size="lg" variant="destructive">
        Delete
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveAttribute('data-variant', 'destructive');
    expect(button).toHaveAttribute('data-size', 'lg');
    // Destructive uses the explicit Figma feedback pair: soft red fill
    // (background/destructive) + strong red text (foreground/destructive), not an opacity tint.
    expect(button).toHaveClass(
      'bg-destructive',
      'text-destructive-foreground',
      'h-9',
    );
  });

  it('uses the foreground text color for the link variant (not primary)', () => {
    render(<Button variant="link">Docs</Button>);

    const button = screen.getByRole('button', { name: 'Docs' });
    expect(button).toHaveClass('text-foreground');
    expect(button).not.toHaveClass('text-primary');
  });

  it('collapses to a muted look and sets data-disabled when disabled', () => {
    render(<Button disabled>Off</Button>);

    const button = screen.getByRole('button', { name: 'Off' });
    expect(button).toHaveAttribute('data-disabled', 'true');
    expect(button).toHaveClass(
      'data-[disabled]:bg-muted',
      'data-[disabled]:text-muted-foreground',
    );
  });

  it('composes as a different element via the render prop', () => {
    // biome-ignore lint/a11y/useAnchorContent: Button injects children into the rendered anchor.
    render(<Button render={<a href="/home" />}>Home</Button>);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/home');
    // Styling and slot attributes carry over to the rendered element.
    expect(link).toHaveClass('bg-primary');
    expect(link).toHaveAttribute('data-slot', 'button');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a spinner, disables, and sets aria-busy while loading', () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole('button', { name: /Saving/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('replaces the icon with the spinner on an icon-only button when loading', () => {
    render(
      <Button aria-label="Refresh" loading size="icon">
        <span data-testid="icon-child">+</span>
      </Button>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-child')).not.toBeInTheDocument();
  });

  it('replaces the leading icon with the spinner but keeps the label when loading', () => {
    render(
      <Button loading>
        <span data-testid="leading-icon">+</span>
        Saving
      </Button>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('leading-icon')).not.toBeInTheDocument();
    expect(screen.getByText('Saving')).toBeInTheDocument();
  });

  it('keeps a trailing icon when loading (only the leading icon is replaced)', () => {
    render(
      <Button loading>
        Continue
        <span data-testid="trailing-icon">→</span>
      </Button>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
  });

  it('swaps the content for loadingText while loading', () => {
    render(
      <Button loading loadingText="Saving…">
        <span data-testid="leading-icon">+</span>
        Save
      </Button>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Saving…')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByTestId('leading-icon')).not.toBeInTheDocument();
  });

  it('does not render a spinner when not loading', () => {
    render(<Button>Idle</Button>);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('uses the Figma focus ring (2px solid ring with a 2px offset)', () => {
    render(<Button>Focus</Button>);

    const button = screen.getByRole('button', { name: 'Focus' });
    expect(button).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
    );
  });

  it('underlines the label on hover (Figma hover spec, all variants)', () => {
    render(<Button>Hover</Button>);

    expect(screen.getByRole('button', { name: 'Hover' })).toHaveClass(
      'hover:underline',
    );
  });

  it('darkens the fill on the pressed (active) state per Figma', () => {
    render(<Button>Press</Button>);

    expect(screen.getByRole('button', { name: 'Press' })).toHaveClass(
      'active:bg-primary-hover',
    );
  });

  it('exposes buttonVariants for external composition', () => {
    const classes = buttonVariants({ variant: 'outline', size: 'sm' });
    expect(classes).toContain('border');
    expect(classes).toContain('h-7');
  });
});
