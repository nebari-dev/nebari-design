import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, Day, dayVariants } from '@/components/ui/calendar';

const july2026 = new Date(2026, 6, 1);
const july3 = new Date(2026, 6, 3);
const july6 = new Date(2026, 6, 6);
const july9 = new Date(2026, 6, 9);
const july10 = new Date(2026, 6, 10);
const july11 = new Date(2026, 6, 11);
const july17 = new Date(2026, 6, 17);

describe('Calendar', () => {
  it('renders a labelled 6 by 7 grid with stable hooks', () => {
    render(
      <Calendar defaultMonth={july2026} selected={july10} today={july6} />,
    );

    expect(screen.getByRole('grid', { name: 'July 2026' })).toHaveAttribute(
      'data-slot',
      'calendar-grid',
    );
    expect(screen.getByText('July 2026')).toHaveAttribute(
      'aria-live',
      'polite',
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);

    const selectedCell = screen.getByRole('gridcell', { name: '10' });
    expect(selectedCell).toHaveAttribute('aria-selected', 'true');
    expect(selectedCell).toHaveAttribute('data-variant', 'selected');
    expect(
      screen.getByRole('button', { name: 'Friday, July 10, 2026' }),
    ).toHaveAttribute('data-variant', 'selected');

    expect(
      screen.getByRole('button', { name: 'Monday, July 6, 2026' }),
    ).toHaveAttribute('aria-current', 'date');
  });

  it('selects a single day and reports the selected date', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar defaultMonth={july2026} onSelect={onSelect} today={july6} />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Friday, July 10, 2026' }),
    );

    expect(onSelect).toHaveBeenCalledWith(july10);
    expect(
      screen.getByRole('button', { name: 'Friday, July 10, 2026' }),
    ).toHaveAttribute('data-variant', 'selected');
  });

  it('selects range start, middle, and end states', async () => {
    const onRangeSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        defaultMonth={july2026}
        mode="range"
        onRangeSelect={onRangeSelect}
        today={july6}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Monday, July 6, 2026' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Friday, July 10, 2026' }),
    );

    expect(onRangeSelect).toHaveBeenLastCalledWith(
      {
        from: july6,
        to: july10,
      },
      { reason: 'day-select' },
    );
    expect(
      screen.getByRole('button', { name: 'Monday, July 6, 2026' }),
    ).toHaveAttribute('data-variant', 'range-start');
    expect(
      screen.getByRole('button', { name: 'Tuesday, July 7, 2026' }),
    ).toHaveAttribute('data-variant', 'range-middle');
    expect(
      screen.getByRole('button', { name: 'Friday, July 10, 2026' }),
    ).toHaveAttribute('data-variant', 'range-end');
  });

  it('does not select disabled days', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        defaultMonth={july2026}
        disabledDate={(date) => date.getDate() === 10}
        onSelect={onSelect}
        today={july6}
      />,
    );

    const disabledDay = screen.getByRole('button', {
      name: 'Friday, July 10, 2026',
    });
    expect(disabledDay).toBeDisabled();
    expect(disabledDay).toHaveAttribute('data-variant', 'disabled');

    await user.click(disabledDay);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('moves day focus with arrow keys and PageDown changes the month', async () => {
    const user = userEvent.setup();
    render(
      <Calendar defaultMonth={july2026} selected={july10} today={july6} />,
    );

    const selectedDay = screen.getByRole('button', {
      name: 'Friday, July 10, 2026',
    });
    selectedDay.focus();

    await user.keyboard('{ArrowRight}');
    expect(
      screen.getByRole('button', { name: 'Saturday, July 11, 2026' }),
    ).toHaveFocus();

    await user.keyboard('{PageDown}');
    expect(screen.getByText('August 2026')).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });

  it('skips disabled days when moving focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        defaultMonth={july2026}
        disabledDate={(date) => date.getDate() === 11}
        selected={july10}
        today={july6}
      />,
    );

    screen.getByRole('button', { name: 'Friday, July 10, 2026' }).focus();

    await user.keyboard('{ArrowRight}');

    expect(
      screen.getByRole('button', { name: 'Saturday, July 11, 2026' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Sunday, July 12, 2026' }),
    ).toHaveFocus();
  });

  it('extends ranges with Shift and arrow keys', async () => {
    const onRangeSelect = vi.fn();
    const user = userEvent.setup();
    let view = render(
      <Calendar
        defaultMonth={july2026}
        defaultRange={{ from: july10 }}
        mode="range"
        onRangeSelect={onRangeSelect}
        today={july6}
      />,
    );

    screen.getByRole('button', { name: 'Friday, July 10, 2026' }).focus();

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

    expect(onRangeSelect).toHaveBeenLastCalledWith(
      {
        from: july10,
        to: july11,
      },
      { reason: 'keyboard-extend' },
    );
    expect(
      screen.getByRole('button', { name: 'Saturday, July 11, 2026' }),
    ).toHaveFocus();
    expect(
      screen.getByRole('button', { name: 'Saturday, July 11, 2026' }),
    ).toHaveAttribute('data-variant', 'range-end');

    await user.keyboard('{Enter}');

    expect(onRangeSelect).toHaveBeenLastCalledWith(
      {
        from: july10,
        to: july11,
      },
      { reason: 'day-select' },
    );

    view.unmount();
    onRangeSelect.mockClear();

    view = render(
      <Calendar
        defaultMonth={july2026}
        defaultRange={{ from: july10 }}
        mode="range"
        onRangeSelect={onRangeSelect}
        today={july6}
      />,
    );

    screen.getByRole('button', { name: 'Friday, July 10, 2026' }).focus();

    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');

    expect(onRangeSelect).toHaveBeenLastCalledWith(
      {
        from: july9,
        to: july10,
      },
      { reason: 'keyboard-extend' },
    );
    expect(
      screen.getByRole('button', { name: 'Thursday, July 9, 2026' }),
    ).toHaveFocus();
    expect(
      screen.getByRole('button', { name: 'Thursday, July 9, 2026' }),
    ).toHaveAttribute('data-variant', 'range-start');

    view.unmount();
    onRangeSelect.mockClear();

    view = render(
      <Calendar
        defaultMonth={july2026}
        defaultRange={{ from: july10 }}
        mode="range"
        onRangeSelect={onRangeSelect}
        today={july6}
      />,
    );

    screen.getByRole('button', { name: 'Friday, July 10, 2026' }).focus();

    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');

    expect(onRangeSelect).toHaveBeenLastCalledWith(
      {
        from: july10,
        to: july17,
      },
      { reason: 'keyboard-extend' },
    );
    expect(
      screen.getByRole('button', { name: 'Friday, July 17, 2026' }),
    ).toHaveFocus();
    expect(
      screen.getByRole('button', { name: 'Friday, July 17, 2026' }),
    ).toHaveAttribute('data-variant', 'range-end');

    view.unmount();
    onRangeSelect.mockClear();

    render(
      <Calendar
        defaultMonth={july2026}
        defaultRange={{ from: july10 }}
        mode="range"
        onRangeSelect={onRangeSelect}
        today={july6}
      />,
    );

    screen.getByRole('button', { name: 'Friday, July 10, 2026' }).focus();

    await user.keyboard('{Shift>}{ArrowUp}{/Shift}');

    expect(onRangeSelect).toHaveBeenLastCalledWith(
      {
        from: july3,
        to: july10,
      },
      { reason: 'keyboard-extend' },
    );
    expect(
      screen.getByRole('button', { name: 'Friday, July 3, 2026' }),
    ).toHaveFocus();
    expect(
      screen.getByRole('button', { name: 'Friday, July 3, 2026' }),
    ).toHaveAttribute('data-variant', 'range-start');
  });

  it('exposes day variants for reusable day cells', () => {
    render(<Day state="range-end">15</Day>);

    expect(screen.getByRole('button', { name: '15' })).toHaveAttribute(
      'data-variant',
      'range-end',
    );
    expect(dayVariants({ state: 'today' })).toContain('border-primary');
    expect(dayVariants({ state: 'disabled' })).not.toContain('opacity-50');
  });
});
