import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, X } from 'lucide-react';

// The brand families, resolved from the theme tokens (loaded as webfonts in
// `.storybook/preview.ts`): `--font-sans` is Geist, `--font-mono` is IBM Plex
// Mono.
const SANS = 'var(--font-sans)';
const MONO = 'var(--font-mono)';

type TextStyle = {
  token: string;
  specimen: string;
  /** px */
  size: number;
  /** px */
  lineHeight: number;
  weightName: string;
  weight: number;
  /** px */
  tracking: number;
  usage: string;
  mono?: boolean;
  underline?: boolean;
};

const ROLES: { role: string; description: string; styles: TextStyle[] }[] = [
  {
    role: 'Display',
    description:
      'Page- and dashboard-level titles. Use sparingly — typically once per view.',
    styles: [
      {
        token: 'Display/Page Title',
        specimen: 'Build with Nebari',
        size: 30,
        lineHeight: 36,
        weightName: 'Bold',
        weight: 700,
        tracking: 0,
        usage: 'Largest title on a page or dashboard header. One per view.',
      },
      {
        token: 'Display/Section Title',
        specimen: 'Workspaces',
        size: 24,
        lineHeight: 32,
        weightName: 'SemiBold',
        weight: 600,
        tracking: 0,
        usage: 'Major section divider on dense or dashboard layouts.',
      },
      {
        token: 'Display/Subsection Title',
        specimen: 'Recent activity',
        size: 20,
        lineHeight: 28,
        weightName: 'SemiBold',
        weight: 600,
        tracking: 0,
        usage: 'Subsection heading nested under a Section Title.',
      },
    ],
  },
  {
    role: 'Heading',
    description:
      'Semantic content hierarchy (H1–H4). Maps directly to HTML heading levels in code.',
    styles: [
      {
        token: 'Heading/H1',
        specimen: 'Getting started',
        size: 28,
        lineHeight: 36,
        weightName: 'SemiBold',
        weight: 600,
        tracking: -0.2,
        usage: 'Primary content/page heading. One H1 per document.',
      },
      {
        token: 'Heading/H2',
        specimen: 'Installation',
        size: 22,
        lineHeight: 28,
        weightName: 'SemiBold',
        weight: 600,
        tracking: -0.1,
        usage: 'Section heading within content.',
      },
      {
        token: 'Heading/H3',
        specimen: 'Configuration',
        size: 18,
        lineHeight: 24,
        weightName: 'SemiBold',
        weight: 600,
        tracking: 0,
        usage: 'Subsection heading; common card title.',
      },
      {
        token: 'Heading/H4',
        specimen: 'Environment variables',
        size: 16,
        lineHeight: 20,
        weightName: 'SemiBold',
        weight: 600,
        tracking: 0,
        usage: 'Minor heading / dense card or list title.',
      },
    ],
  },
  {
    role: 'Body',
    description:
      'Running text and paragraphs — the default reading sizes for the product.',
    styles: [
      {
        token: 'Body/Default',
        specimen: 'The quick brown fox jumps over the lazy dog.',
        size: 16,
        lineHeight: 24,
        weightName: 'Regular',
        weight: 400,
        tracking: 0,
        usage: 'Default paragraph and long-form reading text.',
      },
      {
        token: 'Body/Default Strong',
        specimen: 'The quick brown fox jumps over the lazy dog.',
        size: 16,
        lineHeight: 24,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Emphasis within body copy; inline lead-in labels.',
      },
      {
        token: 'Body/Small',
        specimen: 'The quick brown fox jumps over the lazy dog.',
        size: 14,
        lineHeight: 20,
        weightName: 'Regular',
        weight: 400,
        tracking: 0,
        usage: 'Secondary body, dense UI, table cells, descriptions.',
      },
      {
        token: 'Body/Small Strong',
        specimen: 'The quick brown fox jumps over the lazy dog.',
        size: 14,
        lineHeight: 20,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Emphasis within small / secondary text.',
      },
      {
        token: 'Body/Muted',
        specimen: 'Updated 3 hours ago',
        size: 12,
        lineHeight: 16,
        weightName: 'Regular',
        weight: 400,
        tracking: 0,
        usage:
          'Captions, helper text, timestamps, metadata. Not for reading copy.',
      },
    ],
  },
  {
    role: 'Label',
    description:
      'Text inside interactive controls and compact UI — never for prose.',
    styles: [
      {
        token: 'Label/LG',
        specimen: 'Email address',
        size: 14,
        lineHeight: 20,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Default form labels, nav items, control labels.',
      },
      {
        token: 'Label/MD',
        specimen: 'Status',
        size: 12,
        lineHeight: 16,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Compact labels, chips, badges, table headers.',
      },
      {
        token: 'Label/SM',
        specimen: 'Beta',
        size: 11,
        lineHeight: 16,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Smallest label; dense badges and tags.',
      },
      {
        token: 'Label/Caps',
        specimen: 'OVERVIEW',
        size: 11,
        lineHeight: 16,
        weightName: 'Medium',
        weight: 500,
        tracking: 0.8,
        usage: 'All-caps overline / eyebrow / section kicker.',
      },
    ],
  },
  {
    role: 'Button',
    description: 'Text inside buttons. Pairs with the Button component.',
    styles: [
      {
        token: 'Button/Regular/Default',
        specimen: 'Get started',
        size: 14,
        lineHeight: 20,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Default button label.',
      },
      {
        token: 'Button/Regular/Underline',
        specimen: 'Learn more',
        size: 14,
        lineHeight: 20,
        weightName: 'Medium',
        weight: 500,
        tracking: 0,
        usage: 'Link-style / underlined button label.',
        underline: true,
      },
    ],
  },
  {
    role: 'Code',
    description: 'Monospaced text set in IBM Plex Mono.',
    styles: [
      {
        token: 'Code/MD',
        specimen: "const theme = 'nebari'",
        size: 14,
        lineHeight: 20,
        weightName: 'Regular',
        weight: 400,
        tracking: 0,
        usage: 'Default inline code and code blocks.',
        mono: true,
      },
      {
        token: 'Code/SM',
        specimen: 'npm i @nebari/ds',
        size: 12,
        lineHeight: 16,
        weightName: 'Regular',
        weight: 400,
        tracking: 0,
        usage: 'Dense code; captions in code contexts.',
        mono: true,
      },
    ],
  },
];

const WEIGHTS: [name: string, weight: number][] = [
  ['Regular', 400],
  ['Medium', 500],
  ['SemiBold', 600],
  ['Bold', 700],
];

const SCALE_PRINCIPLES = [
  'Base body size is 16px (1rem). The scale uses 11 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 30.',
  'Line-height is set in pixels per style — body ≈ 1.5, headings ≈ 1.2–1.3 — for stable vertical rhythm.',
  'Letter-spacing tightens on large headings (H1 −0.2px, H2 −0.1px) and opens on overlines (Label/Caps +0.8px).',
  'Six roles map to intent: Display, Heading, Body, Label, Button, Code — pick by role first, size second.',
];

const DO = [
  'Pick by role first (Heading vs Body vs Label), then by size.',
  'Use Heading H1–H4 for content hierarchy; Display for page or dashboard titles.',
  'Use Label styles for controls, nav, chips, and table headers — not Body.',
  'Use Code styles (IBM Plex Mono) for code, tokens, identifiers, and keyboard keys.',
  'Step down exactly one level when nesting headings.',
  'Apply the named text style so future changes propagate everywhere.',
];

const DONT = [
  'Don’t fake a heading with manual size or weight — apply the token.',
  'Don’t mix Display and Heading arbitrarily in the same hierarchy.',
  'Don’t use Body/Muted (12px) for long-form reading content.',
  'Don’t type all-caps by hand — use Label/Caps with its built-in tracking.',
  'Don’t override line-height or letter-spacing on individual text nodes.',
  'Don’t skip heading levels (e.g. H1 → H3) in the underlying markup.',
];

const A11Y: { title: string; wcag?: string; body: string }[] = [
  {
    title: 'Minimum reading size',
    wcag: '1.4.4',
    body: 'Body/Small (14px) is the floor for sustained reading. Body/Muted (12px) and Label styles (11–12px) are reserved for short, secondary text only.',
  },
  {
    title: 'Color contrast',
    wcag: '1.4.3',
    body: 'Text must meet 4.5:1 (normal) or 3:1 for large text (≥24px, or ≥18.7px bold). The small Label and Code sizes always require 4.5:1.',
  },
  {
    title: 'Line-height',
    wcag: '1.4.12',
    body: 'Body is set at 1.5× (24/16). Maintain at least 1.5× line spacing for paragraphs so users can override spacing without clipping.',
  },
  {
    title: 'Line length',
    body: 'Keep Body measure to roughly 45–75 characters per line for comfortable, fatigue-free reading.',
  },
  {
    title: 'Don’t rely on style alone',
    wcag: '1.3.1',
    body: 'Pair visual hierarchy with real semantic structure — headings, lists, and landmarks — not weight or size by themselves.',
  },
  {
    title: 'Heading order',
    wcag: '2.4.6',
    body: 'Preserve sequential heading levels (H1 → H4) in markup. Display styles are visual only and never replace semantic headings.',
  },
  {
    title: 'Zoom & reflow',
    wcag: '1.4.10',
    body: 'Implement sizes in rem so text scales to 200% without loss of content or horizontal scrolling.',
  },
  {
    title: 'All-caps text',
    wcag: '1.4.8',
    body: 'Use Label/Caps (with its +0.8px tracking) for uppercase. Never transform Body to caps — it hurts legibility and screen-reader pronunciation.',
  },
];

function formatTracking(tracking: number) {
  if (tracking === 0) return '0';
  return `${tracking > 0 ? '+' : '−'}${Math.abs(tracking)}px`;
}

function Specimen({ style }: { style: TextStyle }) {
  return (
    <span
      className="text-foreground"
      style={{
        fontFamily: style.mono ? MONO : SANS,
        fontSize: `${style.size}px`,
        lineHeight: `${style.lineHeight}px`,
        fontWeight: style.weight,
        letterSpacing: `${style.tracking}px`,
        textDecorationLine: style.underline ? 'underline' : undefined,
      }}
    >
      {style.specimen}
    </span>
  );
}

const ROW_COLS =
  'lg:grid-cols-[minmax(0,1fr)_180px_140px_minmax(0,260px)] lg:items-baseline';

function ColumnHeader() {
  const cell = 'font-mono text-foreground/70 text-[11px] uppercase';
  return (
    <div
      className={`hidden gap-6 border-border border-b pb-2 lg:grid ${ROW_COLS}`}
    >
      <span className={cell}>Specimen</span>
      <span className={cell}>Style / token</span>
      <span className={cell}>Size / LH</span>
      <span className={cell}>Role &amp; usage</span>
    </div>
  );
}

function StyleRow({ style }: { style: TextStyle }) {
  return (
    <div
      className={`grid grid-cols-1 gap-2 border-border border-b py-4 last:border-b-0 lg:gap-6 ${ROW_COLS}`}
    >
      <div className="min-w-0 break-words">
        <Specimen style={style} />
      </div>
      <div className="font-mono text-foreground/70 text-xs">{style.token}</div>
      <div className="space-y-0.5 font-mono text-foreground/70 text-xs">
        <div>
          {style.size} / {style.lineHeight} px
        </div>
        <div>
          {style.weightName} {style.weight}
        </div>
        <div>tracking {formatTracking(style.tracking)}</div>
      </div>
      <div className="text-foreground/70 text-xs">{style.usage}</div>
    </div>
  );
}

const meta = {
  title: 'Style Guide/Typography',
  // Opt out of the globally-enabled autodocs page; these are visual reference
  // stories, browsed directly rather than through a generated Docs entry.
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Foundations: Story = {
  name: 'Foundations',
  render: () => (
    <div className="space-y-10 bg-background p-8 text-foreground">
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            label: 'Sans',
            token: 'Font/Sans',
            family: SANS,
            name: 'Geist',
            description:
              'Interface, content, headings, and labels. A variable family (100–900); Nebari uses Regular 400, Medium 500, SemiBold 600, and Bold 700.',
          },
          {
            label: 'Mono',
            token: 'Font/Mono',
            family: MONO,
            name: 'IBM Plex Mono',
            description:
              'Code blocks, inline code, design tokens, identifiers, and keyboard keys. Monospaced for predictable alignment of code.',
          },
        ].map((font) => (
          <div
            key={font.token}
            className="space-y-3 rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-card-foreground/70 text-xs uppercase">
                {font.label}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-card-foreground/70 text-xs">
                {font.token}
              </span>
            </div>
            <div
              className="text-card-foreground"
              style={{ fontFamily: font.family, fontSize: '44px' }}
            >
              AaBbCc 0123
            </div>
            <div className="font-medium text-card-foreground">{font.name}</div>
            <p className="text-card-foreground/70 text-sm">
              {font.description}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold text-foreground text-lg">Weights</h3>
        <div className="space-y-2">
          {WEIGHTS.map(([name, weight]) => (
            <div
              key={weight}
              className="flex items-baseline justify-between border-border border-b pb-2 last:border-b-0"
            >
              <span
                className="text-foreground"
                style={{
                  fontFamily: SANS,
                  fontSize: '24px',
                  fontWeight: weight,
                }}
              >
                Aa Nebari
              </span>
              <span className="font-mono text-foreground/70 text-sm">
                {name} · {weight}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-foreground text-lg">
          Scale principles
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-foreground/70 text-sm">
          {SCALE_PRINCIPLES.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </section>
    </div>
  ),
};

export const TypeScale: Story = {
  name: 'Type scale',
  render: () => (
    <div className="space-y-12 bg-background p-8 text-foreground">
      {ROLES.map((group) => (
        <section key={group.role} className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-lg">
              {group.role}
            </h3>
            <p className="text-foreground/70 text-sm">{group.description}</p>
          </div>
          <ColumnHeader />
          <div>
            {group.styles.map((style) => (
              <StyleRow key={style.token} style={style} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Usage: Story = {
  name: 'Usage guidelines',
  render: () => (
    <div className="grid gap-6 bg-background p-8 text-foreground lg:grid-cols-2">
      <section className="space-y-3 rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground">Do</h3>
        <ul className="space-y-3">
          {DO.map((item) => (
            <li key={item} className="flex gap-3">
              <Check
                className="mt-0.5 size-4 shrink-0 text-success-foreground"
                aria-hidden="true"
              />
              <span className="text-card-foreground/70 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3 rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-card-foreground">Don’t</h3>
        <ul className="space-y-3">
          {DONT.map((item) => (
            <li key={item} className="flex gap-3">
              <X
                className="mt-0.5 size-4 shrink-0 text-destructive-foreground"
                aria-hidden="true"
              />
              <span className="text-card-foreground/70 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  ),
};

export const Accessibility: Story = {
  name: 'Accessibility',
  render: () => (
    <div className="grid gap-4 bg-background p-8 text-foreground md:grid-cols-2">
      {A11Y.map((item) => (
        <div
          key={item.title}
          className="space-y-2 rounded-lg border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-card-foreground">{item.title}</h3>
            {item.wcag ? (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-card-foreground/70 text-xs">
                {item.wcag}
              </span>
            ) : null}
          </div>
          <p className="text-card-foreground/70 text-sm">{item.body}</p>
        </div>
      ))}
    </div>
  ),
};
