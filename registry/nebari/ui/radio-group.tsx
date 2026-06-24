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
          'rounded-sm border-2 border-transparent p-0.5 focus-visible:border-ring',
        box: 'rounded-sm border border-border bg-background p-3 hover:border-border-strong hover:bg-muted active:border-border-strong active:bg-muted focus-visible:border-2 focus-visible:border-ring',
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
      className="grid w-full gap-3 rounded-sm aria-invalid:border-2 aria-invalid:border-destructive-foreground aria-invalid:p-3 data-[invalid]:border-2 data-[invalid]:border-destructive-foreground data-[invalid]:p-3"
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
            '[&_[data-slot=radio-group-target]]:stroke-primary [&_[data-slot=radio-group-target]]:fill-primary active:[&_[data-slot=radio-group-target]]:stroke-primary-hover active:[&_[data-slot=radio-group-target]]:fill-primary-hover',
          isInvalid &&
            'text-destructive-foreground active:text-destructive-foreground [&_[data-slot=radio-group-target]]:stroke-destructive-foreground [&_[data-slot=radio-group-description]]:text-destructive-foreground',
          isInvalid &&
            variant === 'box' &&
            'border-destructive-foreground bg-destructive hover:border-destructive-foreground hover:bg-destructive active:border-destructive-foreground active:bg-destructive',
          isInvalid &&
            state.checked &&
            '[&_[data-slot=radio-group-target]]:fill-destructive-foreground active:[&_[data-slot=radio-group-target]]:fill-destructive-foreground',
          state.disabled &&
            'pointer-events-none cursor-not-allowed text-muted-foreground [&_[data-slot=radio-group-target]]:stroke-border [&_[data-slot=radio-group-target]]:fill-muted [&_[data-slot=radio-group-description]]:text-muted-foreground',
          state.disabled &&
            variant === 'box' &&
            'border-transparent bg-background',
          state.disabled &&
            state.checked &&
            '[&_[data-slot=radio-group-target]]:stroke-transparent [&_[data-slot=radio-group-target]]:fill-muted-foreground [&_[data-slot=radio-group-control]]:text-background',
        );
      }}
      data-slot="radio-group-item"
      data-variant={variant ?? 'default'}
    >
      <svg
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 overflow-visible text-primary-foreground"
        data-slot="radio-group-control"
        viewBox="0 0 16 16"
      >
        <circle
          className="fill-transparent stroke-border-strong motion-safe:transition-[fill,stroke] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]"
          cx="8"
          cy="8"
          data-slot="radio-group-target"
          r="7.25"
          strokeWidth="1.5"
        />
        <RadioPrimitive.Indicator
          className={(state) => cn(!state.checked && 'invisible')}
          data-slot="radio-group-indicator"
          keepMounted
          render={<g />}
        >
          <circle cx="8" cy="8" fill="currentColor" r="4" />
        </RadioPrimitive.Indicator>
      </svg>

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
