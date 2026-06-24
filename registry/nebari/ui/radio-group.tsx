import { Radio as RadioPrimitive } from '@base-ui-components/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui-components/react/radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

const radioGroupItemVariants = cva(
  'group/radio-group-item inline-flex cursor-pointer select-none items-start gap-2 text-left text-foreground outline-none motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] motion-safe:active:scale-[0.97] active:text-muted-foreground-strong',
  {
    variants: {
      variant: {
        default:
          'rounded-[2px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        box: 'rounded-sm border border-border bg-background p-3 hover:border-border-strong hover:bg-muted active:border-border-strong active:bg-muted focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, 'className'>;

type RadioGroupItemProps = Omit<
  RadioPrimitive.Root.Props,
  'children' | 'className'
> &
  VariantProps<typeof radioGroupItemVariants> & {
    /** The visible and accessible radio label. */
    children?: ReactNode;
    /** Supplementary text exposed as the radio's accessible description. */
    description?: ReactNode;
  };

/** Provides mutually-exclusive selection state to a set of radio items. */
function RadioGroup(props: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      {...props}
      className="grid w-full gap-3"
      data-slot="radio-group"
    />
  );
}

/**
 * Labeled radio item implemented from the Nebari Figma spec on top of Base UI.
 *
 * `variant="default"` renders an inline option, while `variant="box"` turns
 * the same content into a bordered, clickable card. Selected, unselected,
 * disabled, and validation state come from Base UI; hover, focus, and pressed
 * visuals use their native CSS interaction states.
 */
function RadioGroupItem({
  variant,
  children,
  description,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: RadioGroupItemProps) {
  const generatedId = useId();
  const labelId = children == null ? undefined : `${generatedId}-label`;
  const descriptionId =
    description == null ? undefined : `${generatedId}-description`;
  const describedBy = [ariaDescribedBy, descriptionId]
    .filter(Boolean)
    .join(' ');
  const isAriaInvalid = ariaInvalid === true || ariaInvalid === 'true';

  return (
    <RadioPrimitive.Root
      {...props}
      aria-describedby={describedBy || undefined}
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledBy ?? (ariaLabel === undefined ? labelId : undefined)
      }
      className={(state) => {
        const isInvalid = state.valid === false || isAriaInvalid;

        return cn(
          radioGroupItemVariants({ variant }),
          state.checked &&
            '[&_[data-slot=radio-group-control]]:border-primary [&_[data-slot=radio-group-control]]:bg-primary active:[&_[data-slot=radio-group-control]]:border-primary-hover active:[&_[data-slot=radio-group-control]]:bg-primary-hover',
          isInvalid &&
            'text-destructive-foreground active:text-destructive-foreground [&_[data-slot=radio-group-control]]:border-destructive-foreground [&_[data-slot=radio-group-description]]:text-destructive-foreground',
          isInvalid &&
            variant === 'box' &&
            'border-destructive-foreground bg-destructive hover:border-destructive-foreground hover:bg-destructive active:border-destructive-foreground active:bg-destructive',
          isInvalid &&
            state.checked &&
            '[&_[data-slot=radio-group-control]]:bg-destructive-foreground active:[&_[data-slot=radio-group-control]]:bg-destructive-foreground',
          state.disabled &&
            'pointer-events-none cursor-not-allowed text-muted-foreground [&_[data-slot=radio-group-control]]:border-border [&_[data-slot=radio-group-control]]:bg-muted [&_[data-slot=radio-group-description]]:text-muted-foreground',
          state.disabled &&
            variant === 'box' &&
            'border-transparent bg-background',
          state.disabled &&
            state.checked &&
            '[&_[data-slot=radio-group-control]]:border-transparent [&_[data-slot=radio-group-control]]:bg-muted-foreground [&_[data-slot=radio-group-control]]:text-background',
        );
      }}
      data-slot="radio-group-item"
      data-variant={variant ?? 'default'}
    >
      <span
        className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-border-strong bg-transparent text-primary-foreground motion-safe:transition-[color,background-color,border-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]"
        data-slot="radio-group-control"
      >
        <RadioPrimitive.Indicator
          className="grid size-full place-content-center text-current"
          data-slot="radio-group-indicator"
        >
          <span className="size-2 rounded-full bg-current" />
        </RadioPrimitive.Indicator>
      </span>

      {(children != null || description != null) && (
        <span
          className="flex flex-col items-start gap-0.5 overflow-hidden text-sm leading-5"
          data-slot="radio-group-text"
        >
          {children != null && (
            <span
              className="font-medium group-hover/radio-group-item:underline group-active/radio-group-item:no-underline"
              data-slot="radio-group-label"
              id={labelId}
            >
              {children}
            </span>
          )}
          {description != null && (
            <span
              className="font-normal text-muted-foreground group-active/radio-group-item:text-muted-foreground-strong"
              data-slot="radio-group-description"
              id={descriptionId}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </RadioPrimitive.Root>
  );
}

export type { RadioGroupItemProps, RadioGroupProps };
export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
