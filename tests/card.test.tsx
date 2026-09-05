import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
} from '@/components/ui/card';

describe('Card', () => {
  it('renders the composed card structure with stable data hooks', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Workspace usage</CardTitle>
          <CardDescription>Compute usage for this week.</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    const card = screen
      .getByText('Workspace usage')
      .closest('[data-slot=card]');

    expect(card).toHaveAttribute('data-size', 'default');
    expect(card).toHaveClass(
      'rounded-md',
      'min-w-0',
      'border-border',
      'bg-card',
      'text-card-foreground',
    );
    expect(screen.getByText('Workspace usage')).toHaveAttribute(
      'data-slot',
      'card-title',
    );
    expect(screen.getByText('Compute usage for this week.')).toHaveAttribute(
      'data-slot',
      'card-description',
    );
    expect(screen.getByText('Action')).toHaveAttribute(
      'data-slot',
      'card-action',
    );
    expect(screen.getByText('Content')).toHaveAttribute(
      'data-slot',
      'card-content',
    );
    expect(screen.getByText('Footer')).toHaveAttribute(
      'data-slot',
      'card-footer',
    );
  });

  it('supports the small size variant', () => {
    render(<Card size="sm">Small card</Card>);

    const card = screen.getByText('Small card');

    expect(card).toHaveAttribute('data-slot', 'card');
    expect(card).toHaveAttribute('data-size', 'sm');
    expect(cardVariants({ size: 'sm' })).toContain(
      '[--card-spacing:--spacing(4)]',
    );
  });

  it('merges className on the root and parts', () => {
    render(
      <Card className="max-w-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-foreground">Title</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">Body</CardContent>
        <CardFooter className="justify-end">Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Title').closest('[data-slot=card]')).toHaveClass(
      'max-w-sm',
    );
    expect(screen.getByText('Title').parentElement).toHaveClass('border-b');
    expect(screen.getByText('Title')).toHaveClass('text-foreground');
    expect(screen.getByText('Body')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Footer')).toHaveClass('justify-end');
  });
});
