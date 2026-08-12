import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker } from '@/ui/date-picker';

const july2026 = new Date(2026, 6, 1);
const july6 = new Date(2026, 6, 6);
const july10 = new Date(2026, 6, 10);
const july15 = new Date(2026, 6, 15);

const focusClassName =
  '[&_[data-slot=date-picker-trigger]]:border-ring [&_[data-slot=date-picker-trigger]]:ring-2 [&_[data-slot=date-picker-trigger]]:ring-ring';

const meta = {
  title: 'Components/Date Picker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Date field with popover calendar selection for single dates, ranges, date and time, and segmented typed entry.',
      },
    },
  },
  args: {
    defaultMonth: july2026,
    defaultTime: '2:30 PM',
    disabled: false,
    label: 'Date',
    today: july6,
    type: 'single',
  },
  argTypes: {
    type: {
      control: 'select',
      description:
        'Picker mode. `single`, `range`, and `date-time` open a calendar popover; `segmented` supports typed entry directly in the field.',
      options: ['single', 'range', 'date-time', 'segmented'],
      table: { defaultValue: { summary: 'single' } },
    },
    label: {
      control: 'text',
      description:
        'Accessible field label shown above the trigger and included in the trigger name.',
      table: { defaultValue: { summary: 'Date' } },
    },
    disabled: {
      control: 'boolean',
      description:
        'Disables the field trigger, muted visual state, and calendar interaction.',
      table: { defaultValue: { summary: 'false' } },
    },
    defaultTime: {
      control: 'text',
      description:
        'Initial selected time for the `date-time` mode when the picker manages its own time state.',
      table: { defaultValue: { summary: '2:30 PM' } },
    },
    time: {
      control: false,
      description: 'Controlled selected time. Pair it with `onTimeChange`.',
    },
    defaultMonth: {
      control: false,
      description:
        'Initial visible calendar month when the picker manages its own month state.',
    },
    month: {
      control: false,
      description:
        'Controlled visible calendar month. Pair it with `onMonthChange`.',
    },
    defaultValue: {
      control: false,
      description:
        'Initial selected date when the picker manages its own date state.',
    },
    value: {
      control: false,
      description: 'Controlled selected date. Pair it with `onValueChange`.',
    },
    defaultRange: {
      control: false,
      description:
        'Initial selected date range when the picker manages its own range state.',
    },
    range: {
      control: false,
      description: 'Controlled selected range. Pair it with `onRangeChange`.',
    },
    today: {
      control: false,
      description:
        'Date highlighted as today. Seeded in stories so examples stay deterministic.',
    },
    description: {
      control: false,
      description: 'Optional helper text rendered below the field.',
    },
    placeholder: {
      control: false,
      description:
        'Placeholder text. Leave unset to use the mode-specific placeholder.',
    },
    timeSlots: {
      control: false,
      description:
        'Time options shown next to the calendar in `date-time` mode.',
    },
    disabledDate: {
      control: false,
      description:
        'Predicate passed to the calendar to disable matching dates.',
    },
    className: { table: { disable: true } },
    onMonthChange: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    onRangeChange: { table: { disable: true } },
    onTimeChange: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  decorators: [
    // `defaultTime` is mount-only, so the key forces a remount when it changes.
    (Story, { args }) => <Story key={String(args.defaultTime)} />,
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Date: Pick a date' });

    await expect(trigger).toHaveAttribute('data-slot', 'date-picker-trigger');
    await userEvent.click(trigger);

    const dialog = await page.findByRole('dialog', {
      name: 'Date: Pick a date',
    });
    await expect(dialog).toBeVisible();

    await userEvent.click(
      page.getByRole('button', { name: 'Friday, July 10, 2026' }),
    );

    await waitFor(() => {
      expect(trigger).toHaveTextContent('July 10, 2026');
    });
  },
};

export const TypeStateMatrix: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Each picker mode shown across empty, focused, filled, and disabled states.',
      },
    },
  },
  render: (_args) => {
    const rows = [
      {
        label: 'Single',
        type: 'single',
        filled: { defaultValue: july10 },
      },
      {
        label: 'Range',
        type: 'range',
        filled: { defaultRange: { from: july6, to: july15 } },
      },
      {
        label: 'Date and time',
        type: 'date-time',
        filled: { defaultTime: '2:30 PM', defaultValue: july10 },
      },
      {
        label: 'Segmented',
        type: 'segmented',
        filled: { defaultValue: july10 },
      },
    ] as const;

    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-[7rem_repeat(4,18rem)] gap-4 text-muted-foreground text-sm">
          <span />
          <span>Default</span>
          <span>Focus</span>
          <span>Filled</span>
          <span>Disabled</span>
        </div>
        {rows.map((row) => (
          <div
            className="grid grid-cols-[7rem_repeat(4,18rem)] items-start gap-4"
            key={row.type}
          >
            <span className="pt-7 font-medium text-muted-foreground text-sm">
              {row.label}
            </span>
            <DatePicker
              defaultMonth={july2026}
              label="Label"
              today={july6}
              type={row.type}
            />
            <DatePicker
              className={focusClassName}
              defaultMonth={july2026}
              label="Label"
              today={july6}
              type={row.type}
              {...row.filled}
            />
            <DatePicker
              defaultMonth={july2026}
              label="Label"
              today={july6}
              type={row.type}
              {...row.filled}
            />
            <DatePicker
              defaultMonth={july2026}
              disabled
              label="Label"
              today={july6}
              type={row.type}
            />
          </div>
        ))}
      </div>
    );
  },
};

export const Examples: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Open single-date, range, and date-time examples with their popovers visible.',
      },
    },
  },
  render: (_args) => (
    <div className="grid grid-cols-3 items-start gap-12">
      <DatePicker
        defaultMonth={july2026}
        defaultOpen
        defaultValue={july10}
        label="Single date"
        today={july6}
      />
      <DatePicker
        defaultMonth={july2026}
        defaultOpen
        defaultRange={{ from: july6, to: july15 }}
        label="Date range"
        today={july6}
        type="range"
      />
      <DatePicker
        defaultMonth={july2026}
        defaultOpen
        defaultTime="2:30 PM"
        defaultValue={july10}
        label="Date and time"
        today={july6}
        type="date-time"
      />
    </div>
  ),
};

export const SegmentedTyping: Story = {
  args: {
    label: 'Segmented date',
    type: 'segmented',
  },
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Segmented mode accepts numeric keyboard entry without opening a popover.',
      },
    },
  },
  render: (args) => <DatePicker {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /Segmented date.*Month MM active.*Day DD.*Year YYYY/,
    });

    trigger.focus();
    await userEvent.keyboard('07102026');

    await expect(trigger).toHaveTextContent('07/10/2026');
    await expect(trigger).toHaveAccessibleName(
      /Segmented date.*Month 07.*Day 10.*Year 2026 active/,
    );
  },
};
