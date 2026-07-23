// biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: Calendar uses the WAI-ARIA date-picker grid pattern.
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  addDays,
  addMonths,
  compareDays,
  formatDate,
  formatDateKey,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from '@/lib/date';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const calendarVariants = cva(
  'flex w-fit flex-col items-center gap-2 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md',
  {
    variants: {
      mode: {
        single: '',
        range: '',
      },
      size: {
        default: '',
      },
    },
    defaultVariants: {
      mode: 'single',
      size: 'default',
    },
  },
);

const dayVariants = cva(
  'inline-flex size-9 items-center justify-center rounded-md border border-transparent text-sm outline-none motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      state: {
        default: 'bg-transparent text-foreground',
        hover: 'bg-muted text-foreground',
        selected:
          'border-primary bg-primary text-primary-foreground hover:bg-primary',
        today: 'border-primary bg-background text-foreground',
        outside: 'text-muted-foreground',
        disabled: 'text-muted-foreground hover:bg-transparent',
        'range-start':
          'rounded-r-none border-primary bg-primary text-primary-foreground hover:bg-primary',
        'range-middle': 'rounded-none bg-muted text-foreground hover:bg-muted',
        'range-end':
          'rounded-l-none border-primary bg-primary text-primary-foreground hover:bg-primary',
      },
      size: {
        default: 'size-9',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'default',
    },
  },
);

type CalendarDateRange = {
  from?: Date;
  to?: Date;
};

type CalendarRangeSelectDetails = {
  reason: 'day-select' | 'keyboard-extend';
};

type CalendarDayState = NonNullable<VariantProps<typeof dayVariants>['state']>;

type CalendarDayProps = useRender.ComponentProps<'button'> &
  VariantProps<typeof dayVariants>;

type CalendarProps = Omit<useRender.ComponentProps<'div'>, 'onSelect'> &
  VariantProps<typeof calendarVariants> & {
    autoFocusDay?: boolean;
    month?: Date;
    defaultMonth?: Date;
    selected?: Date;
    defaultSelected?: Date;
    range?: CalendarDateRange;
    defaultRange?: CalendarDateRange;
    today?: Date;
    disabledDate?: (date: Date) => boolean;
    onMonthChange?: (month: Date) => void;
    onSelect?: (date: Date) => void;
    onRangeSelect?: (
      range: CalendarDateRange,
      details?: CalendarRangeSelectDetails,
    ) => void;
  };

interface CalendarCell {
  date: Date;
  outside: boolean;
}

function getCalendarCells(month: Date): CalendarCell[] {
  const firstOfMonth = startOfMonth(month);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      date,
      outside: !isSameMonth(date, firstOfMonth),
    };
  });
}

function sortRange(range: CalendarDateRange) {
  if (!range.from || !range.to) {
    return range;
  }

  return compareDays(range.from, range.to) <= 0
    ? range
    : { from: range.to, to: range.from };
}

function isInRange(date: Date, range: CalendarDateRange) {
  const sorted = sortRange(range);

  if (!sorted.from || !sorted.to) {
    return false;
  }

  return compareDays(date, sorted.from) > 0 && compareDays(date, sorted.to) < 0;
}

function getNextRange(range: CalendarDateRange, date: Date) {
  const day = startOfDay(date);

  if (!range.from || range.to) {
    return { from: day, to: undefined };
  }

  if (compareDays(day, range.from) < 0) {
    return { from: day, to: range.from };
  }

  if (isSameDay(day, range.from)) {
    return { from: day, to: undefined };
  }

  return { from: range.from, to: day };
}

function getDayState({
  date,
  disabled,
  mode,
  outside,
  range,
  selected,
  today,
}: {
  date: Date;
  disabled: boolean;
  mode: CalendarProps['mode'];
  outside: boolean;
  range: CalendarDateRange;
  selected: Date | undefined;
  today: Date;
}): CalendarDayState {
  if (disabled) {
    return 'disabled';
  }

  if (mode === 'range' && range.from) {
    const sorted = sortRange(range);

    if (isSameDay(date, sorted.from)) {
      return 'range-start';
    }

    if (isSameDay(date, sorted.to)) {
      return 'range-end';
    }

    if (isInRange(date, sorted)) {
      return 'range-middle';
    }
  }

  if (isSameDay(date, selected)) {
    return 'selected';
  }

  if (isSameDay(date, today)) {
    return 'today';
  }

  if (outside) {
    return 'outside';
  }

  return 'default';
}

function isSelectedState(state: CalendarDayState) {
  return (
    state === 'selected' ||
    state === 'range-start' ||
    state === 'range-middle' ||
    state === 'range-end'
  );
}

function Day({
  children,
  className,
  disabled,
  ref,
  render = <button type="button" />,
  size,
  state,
  ...props
}: CalendarDayProps) {
  const dayState = state ?? 'default';
  const isDisabled = disabled || dayState === 'disabled';

  return useRender({
    render,
    ref,
    props: {
      'aria-disabled': isDisabled || undefined,
      className: cn(dayVariants({ state, size }), className),
      'data-disabled': isDisabled || undefined,
      'data-size': size ?? 'default',
      'data-slot': 'calendar-day',
      'data-variant': dayState,
      disabled: isDisabled,
      children,
      ...props,
    },
  });
}

function Calendar({
  autoFocusDay = false,
  children,
  className,
  defaultMonth,
  defaultRange,
  defaultSelected,
  disabledDate,
  mode,
  month,
  onMonthChange,
  onRangeSelect,
  onSelect,
  range,
  ref,
  render = <div />,
  selected,
  size,
  today,
  ...props
}: CalendarProps) {
  const calendarMode = mode ?? 'single';
  const todayDate = startOfDay(today ?? new Date());
  const initialMonth =
    defaultMonth ??
    selected ??
    defaultSelected ??
    range?.from ??
    defaultRange?.from ??
    todayDate;
  const [internalMonth, setInternalMonth] = useState(() =>
    startOfMonth(initialMonth),
  );
  const [internalSelected, setInternalSelected] = useState<Date | undefined>(
    () => defaultSelected,
  );
  const [internalRange, setInternalRange] = useState<CalendarDateRange>(
    () => defaultRange ?? {},
  );
  const visibleMonth = startOfMonth(month ?? internalMonth);
  const selectedDate = selected ?? internalSelected;
  const selectedRange = range ?? internalRange;
  const labelId = useId();
  const gridRef = useRef<HTMLTableElement>(null);
  const keyboardRangeRef = useRef<CalendarDateRange | undefined>(undefined);
  const rangeAnchorRef = useRef<Date | undefined>(selectedRange.from);
  const shouldFocusDayRef = useRef(autoFocusDay);
  const [focusedDate, setFocusedDate] = useState(
    () =>
      selectedDate ??
      selectedRange.from ??
      (isSameMonth(todayDate, visibleMonth) ? todayDate : visibleMonth),
  );
  const cells = useMemo(() => getCalendarCells(visibleMonth), [visibleMonth]);
  const weeks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, weekIndex) =>
        cells.slice(weekIndex * 7, weekIndex * 7 + 7),
      ),
    [cells],
  );
  const monthLabel = formatDate(visibleMonth, 'monthLabel');

  useEffect(() => {
    if (!shouldFocusDayRef.current) {
      return;
    }

    gridRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-slot="calendar-day"][data-date="${formatDateKey(focusedDate)}"]`,
      )
      ?.focus();
    shouldFocusDayRef.current = false;
  }, [focusedDate]);

  function setCalendarMonth(nextMonth: Date) {
    const next = startOfMonth(nextMonth);

    if (month === undefined) {
      setInternalMonth(next);
    }

    onMonthChange?.(next);
  }

  function selectDate(date: Date) {
    const day = startOfDay(date);

    setFocusedDate(day);

    if (!isSameMonth(day, visibleMonth)) {
      setCalendarMonth(day);
    }

    if (calendarMode === 'range') {
      const nextRange = getNextRange(selectedRange, day);
      keyboardRangeRef.current = undefined;

      rangeAnchorRef.current =
        !selectedRange.from || selectedRange.to ? day : selectedRange.from;

      if (range === undefined) {
        setInternalRange(nextRange);
      }

      onRangeSelect?.(nextRange, { reason: 'day-select' });
      return;
    }

    if (selected === undefined) {
      setInternalSelected(day);
    }

    onSelect?.(day);
  }

  function moveFocus(nextDate: Date) {
    const day = startOfDay(nextDate);

    shouldFocusDayRef.current = true;
    setFocusedDate(day);

    if (!isSameMonth(day, visibleMonth)) {
      setCalendarMonth(day);
    }
  }

  function extendRange(nextDate: Date, anchorDate: Date) {
    const day = startOfDay(nextDate);
    const anchor = startOfDay(anchorDate);

    moveFocus(day);

    if (disabledDate?.(day)) {
      return;
    }

    const nextRange = sortRange({ from: anchor, to: day });
    keyboardRangeRef.current = nextRange;
    rangeAnchorRef.current = anchor;

    if (range === undefined) {
      setInternalRange(nextRange);
    }

    onRangeSelect?.(nextRange, { reason: 'keyboard-extend' });
  }

  function confirmKeyboardRange() {
    const nextRange = keyboardRangeRef.current;

    if (calendarMode !== 'range' || !nextRange?.from || !nextRange.to) {
      return false;
    }

    keyboardRangeRef.current = undefined;

    if (range === undefined) {
      setInternalRange(nextRange);
    }

    onRangeSelect?.(nextRange, { reason: 'day-select' });
    return true;
  }

  function moveOrExtendRange(nextDate: Date, date: Date, extend: boolean) {
    if (extend && calendarMode === 'range') {
      extendRange(
        nextDate,
        rangeAnchorRef.current ?? selectedRange.from ?? date,
      );
      return;
    }

    keyboardRangeRef.current = undefined;
    moveFocus(nextDate);
  }

  function handleDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    date: Date,
  ) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveOrExtendRange(addDays(date, 7), date, event.shiftKey);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveOrExtendRange(addDays(date, -1), date, event.shiftKey);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveOrExtendRange(addDays(date, 1), date, event.shiftKey);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveOrExtendRange(addDays(date, -7), date, event.shiftKey);
        break;
      case 'End':
        event.preventDefault();
        moveFocus(addDays(date, 6 - date.getDay()));
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(addDays(date, -date.getDay()));
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocus(addMonths(date, 1));
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocus(addMonths(date, -1));
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (!disabledDate?.(date)) {
          if (confirmKeyboardRange()) {
            return;
          }

          selectDate(date);
        }
        break;
    }
  }

  return useRender({
    render,
    ref,
    props: {
      className: cn(calendarVariants({ mode: calendarMode, size }), className),
      'data-size': size ?? 'default',
      'data-slot': 'calendar',
      'data-variant': calendarMode,
      children: (
        <>
          <div
            className="flex h-7 w-full items-center justify-center gap-1"
            data-slot="calendar-header"
          >
            <Button
              aria-label="Previous month"
              onClick={() => {
                const previousMonth = addMonths(visibleMonth, -1);
                setCalendarMonth(previousMonth);
                setFocusedDate(previousMonth);
              }}
              size="icon-sm"
              variant="ghost"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <div
              className="flex-1 text-center font-medium text-foreground text-xs"
              data-slot="calendar-caption"
              id={labelId}
            >
              {monthLabel}
            </div>
            <Button
              aria-label="Next month"
              onClick={() => {
                const nextMonth = addMonths(visibleMonth, 1);
                setCalendarMonth(nextMonth);
                setFocusedDate(nextMonth);
              }}
              size="icon-sm"
              variant="ghost"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <table
            aria-labelledby={labelId}
            className="w-[15.75rem] table-fixed border-collapse"
            data-slot="calendar-grid"
            ref={gridRef}
            role="grid"
          >
            <thead>
              <tr>
                {weekdays.map((weekday) => (
                  <th
                    className="h-8 text-center font-medium text-muted-foreground text-xs"
                    key={weekday}
                    scope="col"
                  >
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.map((cell) => formatDateKey(cell.date)).join()}>
                  {week.map((cell) => {
                    const isDisabled = disabledDate?.(cell.date) ?? false;
                    const state = getDayState({
                      date: cell.date,
                      disabled: isDisabled,
                      mode: calendarMode,
                      outside: cell.outside,
                      range: selectedRange,
                      selected: selectedDate,
                      today: todayDate,
                    });
                    const isSelected = isSelectedState(state);

                    return (
                      <td
                        aria-selected={isSelected || undefined}
                        className="p-0"
                        data-date={formatDateKey(cell.date)}
                        data-outside={cell.outside || undefined}
                        data-variant={state}
                        key={formatDateKey(cell.date)}
                        role="gridcell"
                        tabIndex={-1}
                      >
                        <Day
                          aria-current={
                            isSameDay(cell.date, todayDate) ? 'date' : undefined
                          }
                          aria-label={formatDate(cell.date, 'dayLabel')}
                          data-date={formatDateKey(cell.date)}
                          data-outside={cell.outside || undefined}
                          onClick={() => {
                            selectDate(cell.date);
                          }}
                          onKeyDown={(event) => {
                            handleDayKeyDown(event, cell.date);
                          }}
                          state={state}
                          tabIndex={isSameDay(cell.date, focusedDate) ? 0 : -1}
                        >
                          {cell.date.getDate()}
                        </Day>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {children}
        </>
      ),
      ...props,
    },
  });
}

export type {
  CalendarDateRange,
  CalendarDayProps,
  CalendarProps,
  CalendarRangeSelectDetails,
};
export { Calendar, calendarVariants, Day, dayVariants };
