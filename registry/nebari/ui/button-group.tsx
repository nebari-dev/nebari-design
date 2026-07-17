import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const buttonGroupVariants = cva(
  'm-0 flex min-w-0 w-fit items-stretch border-0 p-0 *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 [&>input]:flex-1',
  {
    variants: {
      orientation: {
        horizontal:
          'flex-row [&>[data-slot]]:rounded-r-none [&>[data-slot]:not(:first-child)]:rounded-l-none [&>[data-slot]:last-child]:rounded-r-md [&>[data-slot]+[data-slot]]:-ml-px',
        vertical:
          'flex-col [&>[data-slot]]:rounded-b-none [&>[data-slot]:not(:first-child)]:rounded-t-none [&>[data-slot]:last-child]:rounded-b-md [&>[data-slot]+[data-slot]]:-mt-px',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

type ButtonGroupProps = React.ComponentProps<'fieldset'> &
  VariantProps<typeof buttonGroupVariants>;

/**
 * Groups closely related actions into one segmented control with shared seams
 * and unified outer corners. Label each group with `aria-label` or
 * `aria-labelledby`; use ToggleGroup instead for mutually exclusive state.
 */
function ButtonGroup({
  className,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  return (
    <fieldset
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

type ButtonGroupTextProps = useRender.ComponentProps<'div'>;

/**
 * Renders non-interactive supporting text inside a ButtonGroup. Use the
 * `render` prop to substitute another element while preserving group styling.
 */
function ButtonGroupText({
  className,
  ref,
  render = <div />,
  ...props
}: ButtonGroupTextProps) {
  return useRender({
    render,
    ref,
    props: {
      className: cn(
        'flex items-center gap-2 rounded-md border border-input bg-muted px-2.5 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      ),
      'data-slot': 'button-group-text',
      ...props,
    },
  });
}

type ButtonGroupSeparatorProps = React.ComponentProps<'hr'> & {
  orientation?: 'horizontal' | 'vertical';
};

/**
 * Adds a semantic divider between borderless ButtonGroup children. Outline
 * buttons already provide their own shared seam and do not need a separator.
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <hr
      aria-orientation={orientation}
      data-slot="button-group-separator"
      data-orientation={orientation}
      className={cn(
        'relative shrink-0 self-stretch border-0 bg-border',
        orientation === 'vertical' ? 'my-px w-px' : 'mx-px h-px',
        className,
      )}
      {...props}
    />
  );
}

export type {
  ButtonGroupProps,
  ButtonGroupSeparatorProps,
  ButtonGroupTextProps,
};
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
