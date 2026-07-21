import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton, skeletonVariants } from '@/ui/skeleton';

describe('Skeleton', () => {
  it('renders a decorative line by default', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'line');
    expect(skeleton).toHaveClass('h-3.5', 'w-full', 'rounded-sm', 'bg-muted');
  });

  it('renders the circle shape', () => {
    render(<Skeleton data-testid="skeleton" shape="circle" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'circle');
    expect(skeleton).toHaveClass('size-10', 'rounded-full');
  });

  it('renders the block shape', () => {
    render(<Skeleton data-testid="skeleton" shape="block" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-variant', 'block');
    expect(skeleton).toHaveClass('h-[120px]', 'w-full', 'rounded-md');
  });

  it('gates the pulse animation behind the motion-safe variant', () => {
    render(<Skeleton data-testid="skeleton" />);

    const className =
      screen.getByTestId('skeleton').getAttribute('class') ?? '';
    expect(className).toContain('motion-safe:animate-skeleton-pulse');
    expect(className).not.toMatch(/(^|\s)animate-skeleton-pulse(\s|$)/);
  });

  it('lets className override default dimensions', () => {
    render(
      <Skeleton
        className="h-48 w-72 rounded-lg"
        data-testid="skeleton"
        shape="block"
      />,
    );

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-48', 'w-72', 'rounded-lg');
    expect(skeleton).not.toHaveClass('h-[120px]', 'w-full', 'rounded-md');
  });

  it('forwards arbitrary props while preserving decorative semantics', () => {
    render(<Skeleton data-testid="skeleton" id="loading-avatar" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'loading-avatar');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes skeletonVariants for external composition', () => {
    expect(skeletonVariants()).toContain('motion-safe:animate-skeleton-pulse');
    expect(skeletonVariants({ shape: 'line' })).toContain('h-3.5');
    expect(skeletonVariants({ shape: 'circle' })).toContain('size-10');
    expect(skeletonVariants({ shape: 'block' })).toContain('h-[120px]');
  });
});
