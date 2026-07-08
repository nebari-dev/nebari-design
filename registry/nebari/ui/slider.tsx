import { Slider as SliderPrimitive } from '@base-ui-components/react/slider';
import { cn } from '@/lib/utils';

type SliderRootProps = SliderPrimitive.Root.Props;

type SliderProps = Omit<SliderRootProps, 'children'> & {
  /** Provides an accessible name for each thumb's nested range input. */
  getThumbAriaLabel?: SliderPrimitive.Thumb.Props['getAriaLabel'];
  /** Provides an accessible text value for each thumb's nested range input. */
  getThumbAriaValueText?: SliderPrimitive.Thumb.Props['getAriaValueText'];
  /** Shows the current value in a visual bubble while the thumb is active. */
  showValueTooltip?: boolean;
};

function getThumbCount(
  value: SliderRootProps['value'],
  defaultValue: SliderRootProps['defaultValue'],
) {
  if (Array.isArray(value)) {
    return Math.max(value.length, 1);
  }

  if (typeof value === 'number') {
    return 1;
  }

  if (Array.isArray(defaultValue)) {
    return Math.max(defaultValue.length, 1);
  }

  return 1;
}

function getDefaultThumbAriaLabel(index: number, thumbCount: number) {
  if (thumbCount === 1) {
    return 'Value';
  }

  if (index === 0) {
    return 'Minimum value';
  }

  if (index === thumbCount - 1) {
    return 'Maximum value';
  }

  return `Value ${index + 1}`;
}

/**
 * Slider is the Nebari bounded numeric input built on top of Base UI.
 *
 * Use it for bounded numeric input where dragging, clicking the track, or
 * keyboard arrows should adjust the value. It supports both single-value and
 * range sliders by passing a number or number array to `value` / `defaultValue`.
 * Base UI supplies the hidden range inputs, keyboard behavior, form state, and
 * Field integration; Nebari owns the track, indicator, thumb, and focus styles.
 */
function Slider({
  className,
  defaultValue,
  getThumbAriaLabel,
  getThumbAriaValueText,
  max = 100,
  min = 0,
  showValueTooltip = true,
  thumbAlignment = 'edge',
  value,
  ...props
}: SliderProps) {
  const thumbCount = getThumbCount(value, defaultValue);
  const thumbs = Array.from({ length: thumbCount }, (_, thumbIndex) => ({
    index: thumbIndex,
    key: `slider-thumb-${thumbIndex}`,
  }));

  return (
    <SliderPrimitive.Root
      className={(state) =>
        cn(
          'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-44 data-[orientation=vertical]:w-8',
          typeof className === 'function' ? className(state) : className,
        )
      }
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      thumbAlignment={thumbAlignment}
      value={value}
      {...props}
    >
      <SliderPrimitive.Control
        className="relative flex touch-none items-center select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:py-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-8 data-[orientation=vertical]:flex-col data-[orientation=vertical]:justify-center data-[orientation=vertical]:px-2"
        data-slot="slider-control"
      >
        <SliderPrimitive.Track
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-[invalid]:bg-destructive data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="bg-primary select-none data-[disabled]:bg-muted-foreground data-[invalid]:bg-destructive-foreground data-[orientation=horizontal]:top-0 data-[orientation=horizontal]:h-full data-[orientation=vertical]:left-0 data-[orientation=vertical]:w-full"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {thumbs.map((thumb) => (
          <SliderPrimitive.Thumb
            className={(state) =>
              cn(
                "relative block size-4 shrink-0 cursor-pointer rounded-full border border-primary bg-background shadow-sm outline-none select-none before:absolute before:top-1/2 before:left-1/2 before:size-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:border-primary-hover has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background data-[disabled]:cursor-not-allowed data-[disabled]:border-border data-[disabled]:bg-muted data-[disabled]:shadow-none data-[dragging]:cursor-grabbing data-[dragging]:border-primary-hover data-[invalid]:border-destructive-foreground data-[invalid]:has-[:focus-visible]:ring-destructive-foreground motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]",
                state.activeThumbIndex === thumb.index &&
                  '[&_[data-slot=slider-value-tooltip]]:visible [&_[data-slot=slider-value-tooltip]]:opacity-100',
              )
            }
            data-slot="slider-thumb"
            getAriaLabel={
              getThumbAriaLabel ??
              ((thumbIndex) => getDefaultThumbAriaLabel(thumbIndex, thumbCount))
            }
            getAriaValueText={getThumbAriaValueText}
            index={thumb.index}
            key={thumb.key}
          >
            {showValueTooltip && (
              <SliderPrimitive.Value
                aria-hidden="true"
                className="invisible pointer-events-none absolute z-10 min-w-8 rounded-sm bg-foreground px-2 py-1 text-background text-center text-xs opacity-0 shadow-md ring-1 ring-foreground/10 data-[orientation=horizontal]:bottom-full data-[orientation=horizontal]:left-1/2 data-[orientation=horizontal]:mb-2 data-[orientation=horizontal]:-translate-x-1/2 data-[orientation=vertical]:right-full data-[orientation=vertical]:top-1/2 data-[orientation=vertical]:mr-2 data-[orientation=vertical]:-translate-y-1/2 motion-safe:transition-opacity motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]"
                data-slot="slider-value-tooltip"
              >
                {(formattedValues) => formattedValues[thumb.index]}
              </SliderPrimitive.Value>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export type { SliderProps };
export { Slider };
