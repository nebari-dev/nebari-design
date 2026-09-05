import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, datePickerVariants } from '@/components/ui/date-picker';

const july2026 = new Date(2026, 6, 1);
const july6 = new Date(2026, 6, 6);
const july10 = new Date(2026, 6, 10);
const july15 = new Date(2026, 6, 15);
const january31 = new Date(2026, 0, 31);
const february28 = new Date(2026, 1, 28);
const leapDay = new Date(2024, 1, 29);
const february28NextYear = new Date(2025, 1, 28);

describe('DatePicker', () => {
  it('renders the single-date trigger with stable data hooks', () => {
    render(<DatePicker defaultMonth={july2026} label="Date" today={july6} />);

    const trigger = screen.getByRole('button', { name: 'Date: Pick a date' });
    expect(screen.getByText('Date')).toHaveAttribute(
      'data-slot',
      'field-label',
    );
    expect(trigger).toHaveAttribute('data-slot', 'date-picker-trigger');
    expect(trigger).toHaveAttribute('data-variant', 'single');
    expect(trigger).toHaveAttribute('data-size', 'default');
  });

  it('opens the popover, selects a single date, and closes', async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        label="Date"
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
        today={july6}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Date: Pick a date' });
    await user.click(trigger);

    expect(
      await screen.findByRole('dialog', { name: 'Date: Pick a date' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Monday, July 6, 2026' }),
      ).toHaveFocus();
    });

    await user.click(
      screen.getByRole('button', { name: 'Friday, July 10, 2026' }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Date: Pick a date' }),
      ).not.toBeInTheDocument();
    });
    expect(trigger).toHaveTextContent('July 10, 2026');
    expect(onValueChange).toHaveBeenCalledWith(july10);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('selects a date range and formats the trigger value', async () => {
    const onRangeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        label="Trip"
        onRangeChange={onRangeChange}
        today={july6}
        type="range"
      />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Trip: Pick a date range',
    });
    await user.click(trigger);
    await user.click(
      screen.getByRole('button', { name: 'Monday, July 6, 2026' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Wednesday, July 15, 2026' }),
    );

    expect(onRangeChange).toHaveBeenLastCalledWith({
      from: july6,
      to: july15,
    });
    expect(trigger).toHaveTextContent('Jul 6 - Jul 15, 2026');
  });

  it('names the trigger and dialog when the label is not plain text', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        label={<span>Travel date</span>}
        today={july6}
      />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Travel date Pick a date',
    });
    await user.click(trigger);

    expect(
      await screen.findByRole('dialog', {
        name: 'Travel date Pick a date',
      }),
    ).toBeInTheDocument();
  });

  it('keeps the range popover open while extending and confirms with Enter', async () => {
    const onRangeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        label="Trip"
        onRangeChange={onRangeChange}
        today={july6}
        type="range"
      />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Trip: Pick a date range',
    });
    await user.click(trigger);
    await user.click(
      screen.getByRole('button', { name: 'Monday, July 6, 2026' }),
    );

    await user.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowDown}{/Shift}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      from: july6,
      to: july15,
    });
    expect(trigger).toHaveTextContent('Jul 6 - Jul 15, 2026');
    expect(
      screen.getByRole('button', { name: 'Wednesday, July 15, 2026' }),
    ).toHaveFocus();

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(onRangeChange).toHaveBeenLastCalledWith({
      from: july6,
      to: july15,
    });
    expect(trigger).toHaveTextContent('Jul 6 - Jul 15, 2026');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        disabled
        label="Date"
        today={july6}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Date: Pick a date' });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders and selects date-time slots beside the calendar', async () => {
    const onTimeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        defaultTime="2:00 PM"
        defaultValue={july10}
        label="Meeting"
        onTimeChange={onTimeChange}
        today={july6}
        type="date-time"
      />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Meeting: Jul 10, 2026, 2:00 PM',
    });
    await user.click(trigger);

    const timeList = await screen.findByRole('listbox', { name: 'Time' });
    expect(timeList).toHaveAttribute('data-slot', 'date-picker-time-list');

    await user.click(screen.getByRole('option', { name: '2:30 PM' }));
    expect(onTimeChange).toHaveBeenCalledWith('2:30 PM');
    expect(trigger).toHaveTextContent('Jul 10, 2026, 2:30 PM');
  });

  it('supports typed segmented date entry', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        label="Segmented"
        onValueChange={onValueChange}
        today={july6}
        type="segmented"
      />,
    );

    const input = screen.getByRole('textbox', {
      name: 'Segmented',
    });
    const trigger = document.querySelector('[data-slot="date-picker-trigger"]');

    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAccessibleDescription('Editing month segment.');
    expect(trigger?.querySelector('svg')).toBeNull();

    await user.click(input);
    await user.keyboard('07102026');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveValue('07/10/2026');
    expect(input).toHaveAccessibleName('Segmented');
    expect(input).toHaveAccessibleDescription('Editing year segment.');
    expect(onValueChange).toHaveBeenLastCalledWith(july10);
    expect(document.querySelector('[data-segment="year"]')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('marks invalid segmented date entry without changing the date', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        defaultValue={july10}
        label="Segmented"
        onValueChange={onValueChange}
        today={july6}
        type="segmented"
      />,
    );

    const input = screen.getByRole('textbox', {
      name: 'Segmented',
    });
    await user.click(input);
    await user.keyboard('99992026');

    expect(input).toHaveValue('99/99/2026');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Editing year segment. Enter a valid date.',
    );
    expect(screen.getByText('Enter a valid date.')).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="date-picker-trigger"]'),
    ).toHaveAttribute('data-invalid', 'true');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clamps segmented month and year adjustments to valid dates', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const view = render(
      <DatePicker
        defaultMonth={july2026}
        defaultValue={january31}
        label="Segmented"
        onValueChange={onValueChange}
        today={july6}
        type="segmented"
      />,
    );

    let input = screen.getByRole('textbox', {
      name: 'Segmented',
    });
    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(input).toHaveValue('02/28/2026');
    expect(onValueChange).toHaveBeenLastCalledWith(february28);

    view.unmount();
    onValueChange.mockClear();

    render(
      <DatePicker
        defaultMonth={july2026}
        defaultValue={leapDay}
        label="Segmented"
        onValueChange={onValueChange}
        today={july6}
        type="segmented"
      />,
    );

    input = screen.getByRole('textbox', {
      name: 'Segmented',
    });
    await user.click(input);
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowUp}');

    expect(input).toHaveValue('02/28/2025');
    expect(onValueChange).toHaveBeenLastCalledWith(february28NextYear);
  });

  it('keeps disabled calendar days from changing the value', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultMonth={july2026}
        disabledDate={(date) => date.getDate() === 10}
        label="Date"
        onValueChange={onValueChange}
        today={july6}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Date: Pick a date' }));
    const disabledDay = await screen.findByRole('button', {
      name: 'Friday, July 10, 2026',
    });

    expect(disabledDay).toBeDisabled();
    await user.click(disabledDay);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('exposes datePickerVariants for external composition', () => {
    expect(datePickerVariants({ type: 'range' })).toContain('w-72');
  });
});
