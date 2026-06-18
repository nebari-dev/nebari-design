import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge, badgeVariants } from '@/ui/badge';

describe('Badge', () => {
  it('renders its children with default variant data attributes', () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText('New');
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge).toHaveAttribute('data-variant', 'default');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('applies the secondary variant classes', () => {
    render(<Badge variant="secondary">Beta</Badge>);

    const badge = screen.getByText('Beta');
    expect(badge).toHaveAttribute('data-variant', 'secondary');
    expect(badge).toHaveClass('bg-muted', 'text-muted-foreground');
  });

  it('applies the destructive variant classes (soft fill + strong text)', () => {
    render(<Badge variant="destructive">Error</Badge>);

    const badge = screen.getByText('Error');
    expect(badge).toHaveAttribute('data-variant', 'destructive');
    // Destructive uses the explicit Figma feedback pair, not an opacity tint.
    expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground');
  });

  it('applies the outline variant classes (bordered, unfilled)', () => {
    render(<Badge variant="outline">Draft</Badge>);

    const badge = screen.getByText('Draft');
    expect(badge).toHaveAttribute('data-variant', 'outline');
    expect(badge).toHaveClass('border-border-strong', 'text-foreground');
  });

  it('applies the ghost variant classes (no fill, no border)', () => {
    render(<Badge variant="ghost">Tag</Badge>);

    const badge = screen.getByText('Tag');
    expect(badge).toHaveAttribute('data-variant', 'ghost');
    expect(badge).toHaveClass('text-foreground');
    expect(badge).not.toHaveClass('border-border-strong');
  });

  it('composes as a different element via the render prop', () => {
    // biome-ignore lint/a11y/useAnchorContent: Badge injects children into the rendered anchor.
    render(<Badge render={<a href="/tags/new" />}>New</Badge>);

    const link = screen.getByRole('link', { name: 'New' });
    expect(link).toHaveAttribute('href', '/tags/new');
    // Styling and slot attributes carry over to the rendered element.
    expect(link).toHaveClass('bg-primary');
    expect(link).toHaveAttribute('data-slot', 'badge');
  });

  it('exposes badgeVariants for external composition', () => {
    const classes = badgeVariants({ variant: 'outline' });
    expect(classes).toContain('border-border-strong');
    expect(classes).toContain('rounded-full');
  });

  it('scopes interaction cues to link/button badges', () => {
    const classes = badgeVariants({ variant: 'default' });
    // Hover/active cues only apply when the badge renders as a link or button.
    expect(classes).toContain('[a&]:hover:underline');
    expect(classes).toContain('[a&]:hover:bg-primary-hover');
    expect(classes).toContain('[button&]:hover:bg-primary-hover');
    // A static badge gets no unscoped hover/active interaction styling.
    expect(classes).not.toMatch(/(?<!\]:)hover:/);
    expect(classes).not.toMatch(/(?<!\]:)active:/);
  });
});
