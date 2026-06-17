import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent px-1.5 py-0.5 font-medium text-xs leading-4 underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border-border-strong bg-background text-foreground',
        ghost: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps
  extends useRender.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge implemented from the Nebari Figma spec — a small status/label chip.
 * Variants are driven by `class-variance-authority`; polymorphism is provided
 * by Base UI's `render` prop, so a `Badge` can become a link (or any element)
 * while keeping its styling (`<Badge render={<a href="…" />}>`).
 */
function Badge({
  className,
  variant,
  ref,
  render = <span />,
  ...props
}: BadgeProps) {
  return useRender({
    render,
    ref,
    props: {
      className: cn(badgeVariants({ variant }), className),
      'data-slot': 'badge',
      'data-variant': variant ?? 'default',
      ...props,
    },
  });
}

export type { BadgeProps };
export { Badge, badgeVariants };
