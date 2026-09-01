function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();

  next.setDate(Math.min(date.getDate(), lastDay));
  return startOfDay(next);
}

const dateFormatters = {
  dayLabel: new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
  long: new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
  monthDay: new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }),
  monthLabel: new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }),
  short: new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
};

function formatDate(date: Date, format: keyof typeof dateFormatters) {
  return dateFormatters[format].format(date);
}

function compareDays(a: Date, b: Date) {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

function isSameDay(a: Date | undefined, b: Date | undefined) {
  return !!a && !!b && compareDays(a, b) === 0;
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

function formatSegmentDate(date: Date | undefined) {
  if (!date) {
    return '';
  }

  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${month}${day}${date.getFullYear()}`;
}

function parseSegmentDate(digits: string) {
  if (digits.length !== 8) {
    return undefined;
  }

  const month = Number(digits.slice(0, 2));
  const day = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return startOfDay(date);
}

export {
  addDays,
  addMonths,
  compareDays,
  formatDate,
  formatDateKey,
  formatSegmentDate,
  isSameDay,
  isSameMonth,
  parseSegmentDate,
  startOfDay,
  startOfMonth,
};
