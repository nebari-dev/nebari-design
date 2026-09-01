import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  addDays,
  formatDate,
  formatSegmentDate,
  startOfMonth,
} from '@/lib/date';
import { DatePicker } from '@/ui/date-picker';

const storyToday = new Date();
const storyMonth = startOfMonth(storyToday);
const storyRangeEnd = addDays(storyToday, 9);
const storySegmentDigits = formatSegmentDate(storyToday);

function getSegmentInputValue(digits: string) {
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

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
    defaultMonth: storyMonth,
    defaultTime: '2:30 PM',
    disabled: false,
    label: 'Date',
    today: storyToday,
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
      description: 'Date highlighted as today.',
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
    await waitFor(() => expect(dialog).toBeVisible());

    await userEvent.click(
      page.getByRole('button', { name: formatDate(storyToday, 'dayLabel') }),
    );

    await waitFor(() => {
      expect(
        page.queryByRole('dialog', { name: 'Date: Pick a date' }),
      ).not.toBeInTheDocument();
      expect(
        canvasElement.ownerDocument.querySelector('[data-base-ui-focus-guard]'),
      ).not.toBeInTheDocument();
      expect(trigger).toHaveTextContent(formatDate(storyToday, 'long'));
    });
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
        defaultMonth={storyMonth}
        defaultOpen
        defaultValue={storyToday}
        label="Single date"
        today={storyToday}
      />
      <DatePicker
        defaultMonth={storyMonth}
        defaultOpen
        defaultRange={{ from: storyToday, to: storyRangeEnd }}
        label="Date range"
        today={storyToday}
        type="range"
      />
      <DatePicker
        defaultMonth={storyMonth}
        defaultOpen
        defaultTime="2:30 PM"
        defaultValue={storyToday}
        label="Date and time"
        today={storyToday}
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
    const input = canvas.getByRole('textbox', {
      name: 'Segmented date',
    });

    input.focus();
    await userEvent.keyboard(storySegmentDigits);

    await expect(input).toHaveValue(getSegmentInputValue(storySegmentDigits));
    await expect(input).toHaveAccessibleDescription('Editing year segment.');
  },
};

export const SegmentedInvalid: Story = {
  args: {
    label: 'Segmented date',
    type: 'segmented',
  },
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Invalid segmented entry keeps the typed value visible and marks the field invalid.',
      },
    },
  },
  render: (args) => <DatePicker {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', {
      name: 'Segmented date',
    });

    input.focus();
    await userEvent.keyboard('99992026');

    await expect(input).toHaveValue('99/99/2026');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('Enter a valid date.')).toBeInTheDocument();
    await expect(input).toHaveAccessibleDescription(
      'Editing year segment. Enter a valid date.',
    );
  },
};
