import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { addDays, formatDate, startOfMonth } from '@/lib/date';
import { Calendar, Day } from '@/ui/calendar';

const storyToday = new Date();
const storyMonth = startOfMonth(storyToday);
const storyRangeEnd = addDays(storyToday, 9);

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-month calendar grid with reusable day cells, range states, and keyboard navigation.',
      },
    },
  },
  args: {
    autoFocusDay: false,
    defaultMonth: storyMonth,
    defaultSelected: storyToday,
    mode: 'single',
    today: storyToday,
  },
  argTypes: {
    mode: {
      control: 'select',
      description: 'Selection behavior for the calendar grid.',
      options: ['single', 'range'],
      table: { defaultValue: { summary: 'single' } },
    },
    autoFocusDay: {
      control: 'boolean',
      description:
        'Moves focus to the active day after mount or month navigation.',
      table: { defaultValue: { summary: 'false' } },
    },
    defaultMonth: {
      control: false,
      description:
        'Initial visible month when the calendar manages its own month state.',
    },
    month: {
      control: false,
      description: 'Controlled visible month. Pair it with `onMonthChange`.',
    },
    defaultSelected: {
      control: false,
      description:
        'Initial selected date when the calendar manages its own single-date state.',
    },
    selected: {
      control: false,
      description: 'Controlled selected date. Pair it with `onSelect`.',
    },
    defaultRange: {
      control: false,
      description:
        'Initial selected date range when the calendar manages its own range state.',
    },
    range: {
      control: false,
      description: 'Controlled selected range. Pair it with `onRangeSelect`.',
    },
    today: {
      control: false,
      description: 'Date highlighted as today.',
    },
    disabledDate: {
      control: false,
      description:
        'Predicate that disables matching days and blocks selection.',
    },
    children: {
      control: false,
      description: 'Optional content rendered below the calendar grid.',
    },
    render: {
      control: false,
      description:
        'Base UI render-prop composition. Swap the default `<div>` while preserving the calendar styling and slot attributes.',
      table: { defaultValue: { summary: '<div />' } },
    },
    className: { table: { disable: true } },
    onMonthChange: { table: { disable: true } },
    onRangeSelect: { table: { disable: true } },
    onSelect: { table: { disable: true } },
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid', {
      name: formatDate(storyMonth, 'monthLabel'),
    });
    const selectedDay = canvas.getByRole('button', {
      name: formatDate(storyToday, 'dayLabel'),
    });
    const selectedCell = selectedDay.closest('[role="gridcell"]');

    await expect(grid).toBeVisible();
    await expect(canvas.getAllByRole('gridcell')).toHaveLength(42);
    await expect(selectedCell).toHaveAttribute('aria-selected', 'true');

    await expect(selectedDay).toBeVisible();
  },
};

export const Range: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Range mode highlights the selected start, middle, and end days.',
      },
    },
  },
  args: {
    defaultRange: { from: storyToday, to: storyRangeEnd },
    defaultSelected: undefined,
    mode: 'range',
  },
};

export const DisabledDays: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story: 'Disabled days keep their grid position but cannot be selected.',
      },
    },
  },
  args: {
    disabledDate: (date) => date.getDay() === 0 || date.getDay() === 6,
  },
};

const dayStates = [
  'default',
  'hover',
  'selected',
  'today',
  'outside',
  'disabled',
  'range-start',
  'range-middle',
  'range-end',
] as const;

export const DayStates: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story: 'The reusable `Day` primitive shown across each visual state.',
      },
    },
  },
  render: (_args) => (
    <div className="grid grid-cols-5 gap-3">
      {dayStates.map((state) => (
        <div className="flex flex-col items-center gap-1" key={state}>
          <Day state={state}>{state === 'outside' ? 30 : 15}</Day>
          <span className="text-muted-foreground text-xs">{state}</span>
        </div>
      ))}
    </div>
  ),
};
