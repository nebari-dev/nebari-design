import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CalendarClock,
  Calendar as CalendarIcon,
  CalendarRange,
  TriangleAlert,
} from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from 'react';
import {
  addDays,
  addMonths,
  formatDate,
  formatSegmentDate,
  parseSegmentDate,
  startOfDay,
} from '@/lib/date';
import { cn } from '@/lib/utils';
import {
  Calendar,
  type CalendarDateRange,
  type CalendarRangeSelectDetails,
} from '@/ui/calendar';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';

const datePickerVariants = cva('flex w-72 flex-col gap-1.5', {
  variants: {
    type: {
      single: '',
      range: '',
      'date-time': '',
      segmented: '',
    },
    size: {
      default: '',
    },
  },
  defaultVariants: {
    type: 'single',
    size: 'default',
  },
});

const datePickerTriggerVariants = cva(
  "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background py-2 pr-2 pl-3 text-left text-foreground text-sm shadow-xs outline-none motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] hover:border-border-strong focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring has-[:focus-visible]:border-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring data-[invalid]:border-destructive-foreground data-[invalid]:pr-9 data-[invalid]:ring-2 data-[invalid]:ring-destructive-foreground data-[invalid]:hover:border-destructive-foreground data-[popup-open]:border-ring data-[popup-open]:ring-2 data-[popup-open]:ring-ring data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      type: {
        single: '',
        range: '',
        'date-time': '',
        segmented: '',
      },
      size: {
        default: '',
      },
    },
    defaultVariants: {
      type: 'single',
      size: 'default',
    },
  },
);

const timeOptionVariants = cva(
  'flex h-8 w-full items-center justify-center rounded-sm px-3 text-sm outline-none motion-safe:transition-[color,background-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[selected]:bg-primary data-[selected]:text-primary-foreground',
  {
    variants: {
      size: {
        default: '',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const defaultTimeSlots = [
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
] as const;

const defaultPlaceholders = {
  single: 'Pick a date',
  range: 'Pick a date range',
  'date-time': 'Pick date & time',
  segmented: 'MM / DD / YYYY',
} as const;

type DatePickerType = NonNullable<
  VariantProps<typeof datePickerVariants>['type']
>;

type DateSegment = 'month' | 'day' | 'year';

const segmentLabels: Record<DateSegment, string> = {
  month: 'Month',
  day: 'Day',
  year: 'Year',
};

type DatePickerProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> &
  VariantProps<typeof datePickerVariants> & {
    label?: ReactNode;
    description?: ReactNode;
    placeholder?: string;
    disabled?: boolean;
    value?: Date;
    defaultValue?: Date;
    range?: CalendarDateRange;
    defaultRange?: CalendarDateRange;
    time?: string;
    defaultTime?: string;
    timeSlots?: readonly string[];
    month?: Date;
    defaultMonth?: Date;
    today?: Date;
    defaultOpen?: boolean;
    disabledDate?: (date: Date) => boolean;
    onOpenChange?: (open: boolean) => void;
    onMonthChange?: (month: Date) => void;
    onValueChange?: (date: Date | undefined) => void;
    onRangeChange?: (range: CalendarDateRange) => void;
    onTimeChange?: (time: string) => void;
  };

function formatRange(range: CalendarDateRange | undefined) {
  if (!range?.from) {
    return undefined;
  }

  if (!range.to) {
    return formatDate(range.from, 'short');
  }

  if (range.from.getFullYear() === range.to.getFullYear()) {
    return `${formatDate(range.from, 'monthDay')} - ${formatDate(
      range.to,
      'short',
    )}`;
  }

  return `${formatDate(range.from, 'short')} - ${formatDate(range.to, 'short')}`;
}

function segmentFromLength(length: number): DateSegment {
  if (length < 2) {
    return 'month';
  }

  if (length < 4) {
    return 'day';
  }

  return 'year';
}

function getSegmentValue(value: string, placeholder: string) {
  if (!value) {
    return placeholder;
  }

  return `${value}${placeholder.slice(value.length)}`;
}

function getSegmentInputValue(digits: string) {
  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getSegmentDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 8);
}

function isInvalidSegmentDate(digits: string) {
  return digits.length === 8 && !parseSegmentDate(digits);
}

function getDisplayValue({
  placeholder,
  range,
  selectedDate,
  selectedTime,
  type,
}: {
  placeholder: string;
  range: CalendarDateRange;
  selectedDate: Date | undefined;
  selectedTime: string;
  type: DatePickerType;
}) {
  if (type === 'range') {
    return formatRange(range) ?? placeholder;
  }

  if (!selectedDate) {
    return placeholder;
  }

  if (type === 'date-time') {
    return `${formatDate(selectedDate, 'short')}, ${selectedTime}`;
  }

  return formatDate(selectedDate, 'long');
}

function SegmentedDateValue({
  activeSegment,
  digits,
}: {
  activeSegment: DateSegment;
  digits: string;
}) {
  const month = digits.slice(0, 2);
  const day = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return (
    <span
      aria-hidden="true"
      className="flex min-w-0 items-center gap-1"
      data-slot="date-picker-segments"
    >
      <span
        className="rounded-sm px-1 data-[active]:bg-muted data-[active]:text-foreground"
        data-active={activeSegment === 'month' || undefined}
        data-placeholder={month.length < 2 || undefined}
        data-segment="month"
      >
        {getSegmentValue(month, 'MM')}
      </span>
      <span className="text-muted-foreground">/</span>
      <span
        className="rounded-sm px-1 data-[active]:bg-muted data-[active]:text-foreground"
        data-active={activeSegment === 'day' || undefined}
        data-placeholder={day.length < 2 || undefined}
        data-segment="day"
      >
        {getSegmentValue(day, 'DD')}
      </span>
      <span className="text-muted-foreground">/</span>
      <span
        className="rounded-sm px-1 data-[active]:bg-muted data-[active]:text-foreground"
        data-active={activeSegment === 'year' || undefined}
        data-placeholder={year.length < 4 || undefined}
        data-segment="year"
      >
        {getSegmentValue(year, 'YYYY')}
      </span>
    </span>
  );
}

function DatePicker({
  className,
  defaultMonth,
  defaultOpen = false,
  defaultRange,
  defaultTime = '2:30 PM',
  defaultValue,
  description,
  disabled = false,
  disabledDate,
  label = 'Date',
  month,
  onMonthChange,
  onOpenChange,
  onRangeChange,
  onTimeChange,
  onValueChange,
  placeholder,
  range,
  size,
  time,
  timeSlots = defaultTimeSlots,
  today,
  type,
  value,
  ...props
}: DatePickerProps) {
  const pickerType = type ?? 'single';
  const [open, setOpen] = useState(defaultOpen);
  const [internalDate, setInternalDate] = useState<Date | undefined>(
    () => defaultValue,
  );
  const [internalRange, setInternalRange] = useState<CalendarDateRange>(
    () => defaultRange ?? {},
  );
  const [internalTime, setInternalTime] = useState(defaultTime);
  const selectedDate = value ?? internalDate;
  const selectedRange = range ?? internalRange;
  const selectedTime = time ?? internalTime;
  const [segmentDigits, setSegmentDigits] = useState(() =>
    formatSegmentDate(selectedDate),
  );
  const [activeSegment, setActiveSegment] = useState<DateSegment>('month');
  const labelId = useId();
  const triggerValueId = useId();
  const descriptionId = useId();
  const segmentDescriptionId = useId();
  const segmentErrorId = useId();
  const PickerIcon =
    pickerType === 'date-time'
      ? CalendarClock
      : pickerType === 'range'
        ? CalendarRange
        : CalendarIcon;
  const resolvedPlaceholder = placeholder ?? defaultPlaceholders[pickerType];
  const displayValue = getDisplayValue({
    placeholder: resolvedPlaceholder,
    range: selectedRange,
    selectedDate,
    selectedTime,
    type: pickerType,
  });
  const hasValue =
    pickerType === 'range'
      ? !!selectedRange.from
      : pickerType === 'segmented'
        ? segmentDigits.length > 0
        : !!selectedDate;
  const stringTriggerLabel =
    typeof label === 'string' ? `${label}: ${displayValue}` : undefined;
  const triggerLabelledBy = `${labelId} ${triggerValueId}`;
  const segmentInputValue = getSegmentInputValue(segmentDigits);
  const segmentInvalid =
    pickerType === 'segmented' && isInvalidSegmentDate(segmentDigits);
  const segmentDescribedBy = [
    segmentDescriptionId,
    description ? descriptionId : undefined,
    segmentInvalid ? segmentErrorId : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    setSegmentDigits(formatSegmentDate(selectedDate));
  }, [selectedDate]);

  function setPickerOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function updateDate(nextDate: Date | undefined) {
    if (value === undefined) {
      setInternalDate(nextDate);
    }

    onValueChange?.(nextDate);
  }

  function updateRange(nextRange: CalendarDateRange) {
    if (range === undefined) {
      setInternalRange(nextRange);
    }

    onRangeChange?.(nextRange);
  }

  function updateTime(nextTime: string) {
    if (time === undefined) {
      setInternalTime(nextTime);
    }

    onTimeChange?.(nextTime);
  }

  function handleDateSelect(date: Date) {
    updateDate(date);
    setSegmentDigits(formatSegmentDate(date));

    if (pickerType !== 'date-time') {
      setPickerOpen(false);
    }
  }

  function handleRangeSelect(
    nextRange: CalendarDateRange,
    details?: CalendarRangeSelectDetails,
  ) {
    updateRange(nextRange);

    if (
      nextRange.from &&
      nextRange.to &&
      details?.reason !== 'keyboard-extend'
    ) {
      setPickerOpen(false);
    }
  }

  function handleTimeSelect(nextTime: string) {
    updateTime(nextTime);

    if (selectedDate) {
      setPickerOpen(false);
    }
  }

  function updateSegmentDigits(nextDigits: string) {
    const digits = nextDigits.slice(0, 8);

    setSegmentDigits(digits);
    setActiveSegment(segmentFromLength(digits.length));

    const parsedDate = parseSegmentDate(digits);
    if (parsedDate || digits.length === 0) {
      updateDate(parsedDate);
    }
  }

  function adjustSegment(delta: number) {
    const baseDate = selectedDate ?? startOfDay(today ?? new Date());
    let nextDate: Date;

    if (activeSegment === 'month') {
      nextDate = addMonths(baseDate, delta);
    } else if (activeSegment === 'day') {
      nextDate = addDays(baseDate, delta);
    } else {
      nextDate = addMonths(baseDate, delta * 12);
    }

    updateDate(startOfDay(nextDate));
  }

  function handleSegmentInputChange(event: ChangeEvent<HTMLInputElement>) {
    updateSegmentDigits(getSegmentDigits(event.currentTarget.value));
  }

  function handleSegmentKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (pickerType !== 'segmented') {
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      updateSegmentDigits(
        segmentDigits.length >= 8 ? event.key : `${segmentDigits}${event.key}`,
      );
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      updateSegmentDigits(segmentDigits.slice(0, -1));
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveSegment((current) =>
        current === 'year' ? 'day' : current === 'day' ? 'month' : 'month',
      );
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveSegment((current) =>
        current === 'month' ? 'day' : current === 'day' ? 'year' : 'year',
      );
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      adjustSegment(event.key === 'ArrowUp' ? 1 : -1);
    }
  }

  return (
    <Field
      className={cn(datePickerVariants({ type: pickerType, size }), className)}
      data-size={size ?? 'default'}
      data-slot="date-picker"
      data-variant={pickerType}
      disabled={disabled}
      invalid={segmentInvalid}
      {...props}
    >
      <FieldLabel
        className={disabled ? 'data-[disabled]:opacity-100' : undefined}
        htmlFor={pickerType === 'segmented' ? triggerValueId : undefined}
        id={labelId}
      >
        {label}
      </FieldLabel>
      {pickerType === 'segmented' ? (
        <>
          <div
            className={cn(
              datePickerTriggerVariants({ type: pickerType, size }),
              'relative cursor-text',
              !hasValue && 'text-muted-foreground',
            )}
            data-disabled={disabled || undefined}
            data-filled={hasValue || undefined}
            data-invalid={segmentInvalid || undefined}
            data-size={size ?? 'default'}
            data-slot="date-picker-trigger"
            data-variant={pickerType}
          >
            <SegmentedDateValue
              activeSegment={activeSegment}
              digits={segmentDigits}
            />
            <input
              aria-describedby={segmentDescribedBy}
              aria-invalid={segmentInvalid || undefined}
              aria-labelledby={labelId}
              autoComplete="off"
              className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent px-3 py-2 text-transparent caret-transparent outline-none placeholder:text-transparent disabled:cursor-not-allowed"
              data-invalid={segmentInvalid || undefined}
              data-slot="date-picker-segment-input"
              disabled={disabled}
              id={triggerValueId}
              inputMode="numeric"
              onChange={handleSegmentInputChange}
              onKeyDown={handleSegmentKeyDown}
              pattern="[0-9]*"
              placeholder={resolvedPlaceholder}
              type="text"
              value={segmentInputValue}
            />
            {segmentInvalid && (
              <TriangleAlert
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-destructive-foreground"
              />
            )}
          </div>
          <span className="sr-only" id={segmentDescriptionId}>
            Editing {segmentLabels[activeSegment].toLowerCase()} segment.
          </span>
        </>
      ) : (
        <PopoverPrimitive.Root
          modal={false}
          onOpenChange={(nextOpen) => {
            setPickerOpen(nextOpen);
          }}
          open={open}
        >
          <PopoverPrimitive.Trigger
            aria-label={stringTriggerLabel}
            aria-labelledby={
              stringTriggerLabel === undefined ? triggerLabelledBy : undefined
            }
            className={cn(
              datePickerTriggerVariants({ type: pickerType, size }),
              !hasValue && 'text-muted-foreground',
            )}
            data-filled={hasValue || undefined}
            data-size={size ?? 'default'}
            data-slot="date-picker-trigger"
            data-variant={pickerType}
            disabled={disabled}
            type="button"
          >
            <span className="min-w-0 truncate" id={triggerValueId}>
              {displayValue}
            </span>
            <PickerIcon aria-hidden="true" className="text-muted-foreground" />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
              align="start"
              className="isolate z-50"
              side="bottom"
              sideOffset={8}
            >
              <PopoverPrimitive.Popup
                aria-label={stringTriggerLabel}
                aria-labelledby={
                  stringTriggerLabel === undefined
                    ? triggerLabelledBy
                    : undefined
                }
                className="flex origin-(--transform-origin) items-start gap-2 outline-none data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-emphasized]"
                data-slot="date-picker-content"
                initialFocus={false}
                role="dialog"
              >
                <Calendar
                  autoFocusDay
                  defaultMonth={
                    defaultMonth ?? selectedDate ?? selectedRange.from ?? today
                  }
                  disabledDate={disabledDate}
                  mode={pickerType === 'range' ? 'range' : 'single'}
                  month={month}
                  onMonthChange={onMonthChange}
                  onRangeSelect={handleRangeSelect}
                  onSelect={handleDateSelect}
                  range={pickerType === 'range' ? selectedRange : undefined}
                  selected={pickerType === 'range' ? undefined : selectedDate}
                  today={today}
                />
                {pickerType === 'date-time' && (
                  <div
                    aria-label="Time"
                    className="flex w-28 flex-col gap-0.5 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md"
                    data-slot="date-picker-time-list"
                    role="listbox"
                  >
                    {timeSlots.map((slot) => {
                      const isSelected = slot === selectedTime;

                      return (
                        <button
                          aria-selected={isSelected}
                          className={cn(timeOptionVariants({ size }))}
                          data-selected={isSelected || undefined}
                          data-slot="date-picker-time-option"
                          key={slot}
                          onClick={() => {
                            handleTimeSelect(slot);
                          }}
                          role="option"
                          type="button"
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {pickerType === 'segmented' && (
        <FieldError id={segmentErrorId} match={segmentInvalid}>
          Enter a valid date.
        </FieldError>
      )}
    </Field>
  );
}

export type { DatePickerProps };
export { DatePicker, datePickerTriggerVariants, datePickerVariants };
