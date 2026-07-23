import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Calendar, Day } from '@/ui/calendar';

const july2026 = new Date(2026, 6, 1);
const july6 = new Date(2026, 6, 6);
const july10 = new Date(2026, 6, 10);
const july15 = new Date(2026, 6, 15);

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
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultMonth: july2026,
    selected: july10,
    today: july6,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid', { name: 'July 2026' });

    await expect(grid).toBeVisible();
    await expect(canvas.getAllByRole('gridcell')).toHaveLength(42);
    await expect(canvas.getByRole('gridcell', { name: '10' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.keyboard('{ArrowRight}');
  },
};

export const Range: Story = {
  args: {
    defaultMonth: july2026,
    defaultRange: { from: july6, to: july15 },
    mode: 'range',
    today: july6,
  },
};

export const DisabledDays: Story = {
  args: {
    defaultMonth: july2026,
    disabledDate: (date) => date.getDay() === 0 || date.getDay() === 6,
    today: july6,
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
  render: () => (
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
