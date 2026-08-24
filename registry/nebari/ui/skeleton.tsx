import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'block shrink-0 bg-muted motion-safe:animate-skeleton-pulse',
  {
    variants: {
      shape: {
        line: 'h-3.5 w-full rounded-sm',
        circle: 'size-10 rounded-full',
        block: 'h-[120px] w-full rounded-md',
      },
    },
    defaultVariants: {
      shape: 'line',
    },
  },
);

type SkeletonProps = Omit<React.ComponentProps<'div'>, 'aria-hidden' | 'role'> &
  VariantProps<typeof skeletonVariants>;

/**
 * Decorative placeholder primitive for loading states. Compose `line`,
 * `circle`, and `block` shapes to mirror the layout that will replace them.
 */
function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      data-slot="skeleton"
      data-variant={shape ?? 'line'}
      className={cn(skeletonVariants({ shape }), className)}
    />
  );
}

export type { SkeletonProps };
export { Skeleton, skeletonVariants };
