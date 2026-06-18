import type { Meta, StoryObj } from '@storybook/react-vite';

const SPECIMEN = 'Nebari design system';

/** Tailwind's default type scale — the sizes available as `text-*` utilities. */
const TYPE_SCALE: {
  className: string;
  rem: string;
  px: string;
  lineHeight: string;
}[] = [
  { className: 'text-xs', rem: '0.75rem', px: '12px', lineHeight: '1rem' },
  { className: 'text-sm', rem: '0.875rem', px: '14px', lineHeight: '1.25rem' },
  { className: 'text-base', rem: '1rem', px: '16px', lineHeight: '1.5rem' },
  { className: 'text-lg', rem: '1.125rem', px: '18px', lineHeight: '1.75rem' },
  { className: 'text-xl', rem: '1.25rem', px: '20px', lineHeight: '1.75rem' },
  { className: 'text-2xl', rem: '1.5rem', px: '24px', lineHeight: '2rem' },
  { className: 'text-3xl', rem: '1.875rem', px: '30px', lineHeight: '2.25rem' },
  { className: 'text-4xl', rem: '2.25rem', px: '36px', lineHeight: '2.5rem' },
  { className: 'text-5xl', rem: '3rem', px: '48px', lineHeight: '1' },
  { className: 'text-6xl', rem: '3.75rem', px: '60px', lineHeight: '1' },
  { className: 'text-7xl', rem: '4.5rem', px: '72px', lineHeight: '1' },
];

const WEIGHTS: { className: string; label: string; weight: string }[] = [
  { className: 'font-light', label: 'Light', weight: '300' },
  { className: 'font-normal', label: 'Normal', weight: '400' },
  { className: 'font-medium', label: 'Medium', weight: '500' },
  { className: 'font-semibold', label: 'Semibold', weight: '600' },
  { className: 'font-bold', label: 'Bold', weight: '700' },
];

const LINE_HEIGHTS: { className: string; label: string }[] = [
  { className: 'leading-tight', label: 'Tight (1.25)' },
  { className: 'leading-snug', label: 'Snug (1.375)' },
  { className: 'leading-normal', label: 'Normal (1.5)' },
  { className: 'leading-relaxed', label: 'Relaxed (1.625)' },
  { className: 'leading-loose', label: 'Loose (2)' },
];

const PARAGRAPH =
  'Nebari is an open-source data science platform. This sample paragraph shows how body copy sets at the chosen line height across multiple lines of running text.';

const meta = {
  title: 'Style Guide/Typography',
  // Opt out of the globally-enabled autodocs page; these are visual reference
  // stories, browsed directly rather than through a generated Docs entry.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'The Nebari type system. The interface renders with the default sans-serif',
          'stack today; the brand specifies **Atkinson Hyperlegible** for body text',
          'and **Poppins** for display headings. Sizes, weights, and line heights',
          'below come from the Tailwind scale every component shares — use the',
          '`text-*`, `font-*`, and `leading-*` utilities shown alongside each',
          'specimen.',
        ].join(' '),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {
  name: 'Type scale',
  parameters: {
    docs: {
      description: {
        story:
          'Every step in the scale, from caption to display, with its utility class, rem/px size, and default line height.',
      },
    },
  },
  render: () => (
    <div className="space-y-6 bg-background p-8 text-foreground">
      {TYPE_SCALE.map((step) => (
        <div
          key={step.className}
          className="flex flex-col gap-2 border-border border-b pb-6 last:border-b-0 lg:flex-row lg:items-baseline lg:gap-8"
        >
          <div className="w-56 shrink-0 space-y-0.5">
            <div className="font-mono text-foreground text-sm">
              {step.className}
            </div>
            <div className="font-mono text-foreground/70 text-xs">
              {step.px} · {step.rem} · lh {step.lineHeight}
            </div>
          </div>
          <p className={`${step.className} truncate text-foreground`}>
            {SPECIMEN}
          </p>
        </div>
      ))}
    </div>
  ),
};

export const FontWeights: Story = {
  name: 'Font weights',
  parameters: {
    docs: {
      description: {
        story: 'The weight ramp, shown at `text-2xl` with its utility class.',
      },
    },
  },
  render: () => (
    <div className="space-y-6 bg-background p-8 text-foreground">
      {WEIGHTS.map((w) => (
        <div
          key={w.className}
          className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8"
        >
          <div className="w-56 shrink-0 space-y-0.5">
            <div className="font-mono text-foreground text-sm">
              {w.className}
            </div>
            <div className="font-mono text-foreground/70 text-xs">
              {w.label} · {w.weight}
            </div>
          </div>
          <p className={`${w.className} text-2xl text-foreground`}>
            {SPECIMEN}
          </p>
        </div>
      ))}
    </div>
  ),
};

export const LineHeights: Story = {
  name: 'Line heights',
  parameters: {
    docs: {
      description: {
        story:
          'The `leading-*` utilities applied to a paragraph of body copy at `text-base`.',
      },
    },
  },
  render: () => (
    <div className="grid gap-8 bg-background p-8 text-foreground md:grid-cols-2 xl:grid-cols-3">
      {LINE_HEIGHTS.map((lh) => (
        <div key={lh.className} className="space-y-2">
          <div className="space-y-0.5">
            <div className="font-mono text-foreground text-sm">
              {lh.className}
            </div>
            <div className="font-mono text-foreground/70 text-xs">
              {lh.label}
            </div>
          </div>
          <p
            className={`${lh.className} max-w-prose text-base text-foreground`}
          >
            {PARAGRAPH}
          </p>
        </div>
      ))}
    </div>
  ),
};
