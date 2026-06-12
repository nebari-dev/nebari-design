import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from '@/ui/spinner';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium underline-offset-4 outline-none transition-all hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-hover',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground',
        link: 'text-primary',
      },
      size: {
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        default: 'h-8 px-3 text-sm',
        lg: 'h-9 px-4 text-sm',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        icon: 'size-8 text-sm',
        'icon-lg': 'size-9 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = useRender.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Renders a {@link Spinner}, sets `aria-busy`, and disables the button
     * while an async action is in flight.
     */
    loading?: boolean;
  };

/**
 * Button implemented from the Nebari Figma spec. Variants and sizes are driven
 * by `class-variance-authority`; polymorphism is provided by Base UI's `render`
 * prop, so a `Button` can become a link or any other element while keeping its
 * styling (`<Button render={<a href="…" />}>`).
 */
function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ref,
  render = <button type="button" />,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return useRender({
    render,
    ref,
    props: {
      className: cn(buttonVariants({ variant, size, className })),
      'data-slot': 'button',
      'data-variant': variant ?? 'default',
      'data-size': size ?? 'default',
      disabled: isDisabled,
      'aria-busy': loading || undefined,
      'aria-disabled': isDisabled || undefined,
      children: (
        <>
          {loading ? <Spinner /> : null}
          {children}
        </>
      ),
      ...props,
    },
  });
}

export type { ButtonProps };
export { Button, buttonVariants };
