import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  alertVariants,
} from '@/ui/alert';

describe('Alert', () => {
  it('renders a polite status region with default slot/variant attributes', () => {
    render(<Alert>Heads up</Alert>);

    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('data-slot', 'alert');
    expect(alert).toHaveAttribute('data-variant', 'default');
    expect(alert).toHaveClass('bg-card', 'text-foreground');
    expect(alert).toHaveTextContent('Heads up');
  });

  it.each([
    ['success', 'status', 'bg-success', 'text-success-foreground'],
    ['warning', 'alert', 'bg-warning', 'text-warning-foreground'],
    ['destructive', 'alert', 'bg-destructive', 'text-destructive-foreground'],
  ] as const)('reflects the %s variant as a data attribute and classes', (variant, role, bg, fg) => {
    render(<Alert variant={variant}>Message</Alert>);

    const alert = screen.getByRole(role);
    expect(alert).toHaveAttribute('data-variant', variant);
    expect(alert).toHaveClass(bg, fg);
  });

  it('uses an assertive alert role for warning/destructive and a polite status role otherwise', () => {
    const { rerender } = render(<Alert variant="success">Polite</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Alert variant="warning">Assertive</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('honors an explicit role override', () => {
    render(
      <Alert variant="success" role="alert">
        Forced assertive
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the title and description sub-parts with their slots', () => {
    render(
      <Alert>
        <AlertTitle>Kernel restarted</AlertTitle>
        <AlertDescription>Outputs have been cleared.</AlertDescription>
      </Alert>,
    );

    const title = screen.getByText('Kernel restarted');
    const description = screen.getByText('Outputs have been cleared.');
    expect(title).toHaveAttribute('data-slot', 'alert-title');
    expect(description).toHaveAttribute('data-slot', 'alert-description');
    // Sub-parts share the content column so they stack beside the icon.
    expect(title).toHaveClass('col-start-2');
    expect(description).toHaveClass('col-start-2');
  });

  it('mutes the description only in the default variant', () => {
    render(<Alert>Body</Alert>);

    expect(screen.getByRole('status')).toHaveClass(
      '*:data-[slot=alert-description]:text-muted-foreground',
    );
  });

  it('merges a caller className over the variant defaults', () => {
    render(<Alert className="mt-4">Spaced</Alert>);

    expect(screen.getByRole('status')).toHaveClass('mt-4', 'bg-card');
  });

  it('renders an action slot and reserves trailing space for it', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertAction>
          <button type="button">Save</button>
        </AlertAction>
      </Alert>,
    );

    const action = screen.getByText('Save').closest('[data-slot=alert-action]');
    expect(action).toBeInTheDocument();
    expect(action).toHaveClass('absolute', 'top-2', 'right-2');
    // The root reserves trailing padding only when an action is present.
    expect(screen.getByRole('status')).toHaveClass(
      'has-data-[slot=alert-action]:pr-18',
    );
  });

  it('drives dismissal through the action button onClick', async () => {
    const onDismiss = vi.fn();
    render(
      <Alert>
        <AlertTitle>Dismiss me</AlertTitle>
        <AlertAction>
          <button type="button" aria-label="Dismiss" onClick={onDismiss}>
            ×
          </button>
        </AlertAction>
      </Alert>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('exposes alertVariants for external composition', () => {
    const classes = alertVariants({ variant: 'warning' });
    expect(classes).toContain('bg-warning');
    expect(classes).toContain('border-warning-foreground');
  });
});
