import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

/**
 * Reads a CSS custom property's authored value off the document root and keeps
 * it in sync with the active theme. Used for both the semantic tokens (which
 * resolve to a light or dark value) and the primitives (which are
 * theme-independent but still read live so the story mirrors `globals.css`
 * rather than restating its values). A `MutationObserver` re-reads whenever the
 * theme toggle flips the `.dark` class on `<html>`.
 */
function useTokenValue(token: string) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const read = () => {
      setValue(
        getComputedStyle(document.documentElement)
          .getPropertyValue(token)
          .trim(),
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [token]);
  return value;
}

/** A single semantic-token swatch: a color block over its name and oklch value. */
function TokenSwatch({ token, label }: { token: string; label: string }) {
  const oklch = useTokenValue(token);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="h-16 w-full border-border border-b"
        style={{ backgroundColor: `var(${token})` }}
      />
      <div className="space-y-0.5 p-3">
        <div className="font-medium text-card-foreground text-sm">{label}</div>
        <div className="font-mono text-card-foreground/70 text-xs">{token}</div>
        <div className="break-all font-mono text-card-foreground/70 text-xs">
          {oklch || '—'}
        </div>
      </div>
    </div>
  );
}

function TokenGroup({
  title,
  tokens,
}: {
  title: string;
  tokens: [token: string, label: string][];
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tokens.map(([token, label]) => (
          <TokenSwatch key={token} token={token} label={label} />
        ))}
      </div>
    </section>
  );
}

const SEMANTIC_GROUPS: { title: string; tokens: [string, string][] }[] = [
  {
    title: 'Primary, secondary & accent',
    tokens: [
      ['--primary', 'Primary'],
      ['--primary-foreground', 'Primary foreground'],
      ['--primary-hover', 'Primary hover'],
      ['--secondary', 'Secondary'],
      ['--secondary-foreground', 'Secondary foreground'],
      ['--accent', 'Accent'],
      ['--accent-foreground', 'Accent foreground'],
      ['--muted', 'Muted'],
      ['--muted-foreground', 'Muted foreground'],
      ['--muted-foreground-strong', 'Muted foreground strong'],
    ],
  },
  {
    title: 'Feedback',
    tokens: [
      ['--destructive', 'Destructive'],
      ['--destructive-foreground', 'Destructive foreground'],
      ['--warning', 'Warning'],
      ['--warning-foreground', 'Warning foreground'],
      ['--success', 'Success'],
      ['--success-foreground', 'Success foreground'],
    ],
  },
  {
    title: 'Surfaces',
    tokens: [
      ['--background', 'Background'],
      ['--foreground', 'Foreground'],
      ['--card', 'Card'],
      ['--card-foreground', 'Card foreground'],
      ['--popover', 'Popover'],
      ['--popover-foreground', 'Popover foreground'],
    ],
  },
  {
    title: 'Borders & rings',
    tokens: [
      ['--border', 'Border'],
      ['--input', 'Input'],
      ['--border-strong', 'Border strong'],
      ['--ring', 'Ring'],
    ],
  },
  {
    title: 'Charts',
    tokens: [
      ['--chart-1', 'Chart 1'],
      ['--chart-2', 'Chart 2'],
      ['--chart-3', 'Chart 3'],
      ['--chart-4', 'Chart 4'],
      ['--chart-5', 'Chart 5'],
    ],
  },
  {
    title: 'Sidebar',
    tokens: [
      ['--sidebar', 'Sidebar'],
      ['--sidebar-foreground', 'Sidebar foreground'],
      ['--sidebar-primary', 'Sidebar primary'],
      ['--sidebar-primary-foreground', 'Sidebar primary foreground'],
      ['--sidebar-accent', 'Sidebar accent'],
      ['--sidebar-accent-foreground', 'Sidebar accent foreground'],
      ['--sidebar-border', 'Sidebar border'],
      ['--sidebar-ring', 'Sidebar ring'],
    ],
  },
];

/**
 * The primitive ramps, mirrored 1:1 from the Figma variables library and
 * authored in `registry/nebari/globals.css`. Each entry is the CSS variable
 * prefix; the recorded source hex is shown alongside the live oklch value for
 * auditability against the design file. The semantic tokens above are derived
 * from these — components never reference primitives directly.
 */
const PRIMITIVE_RAMPS: {
  name: string;
  prefix: string;
  steps: [step: string, hex: string][];
}[] = [
  {
    name: 'Primary Magenta',
    prefix: 'primary-magenta',
    steps: [
      ['50', '#fbf6fe'],
      ['100', '#f6e9ff'],
      ['200', '#e7c4ff'],
      ['300', '#d69afd'],
      ['400', '#c575f4'],
      ['500', '#b053e2'],
      ['600', '#9547c0'],
      ['700', '#77399a'],
      ['800', '#5d2f77'],
      ['900', '#442655'],
      ['950', '#341744'],
    ],
  },
  {
    name: 'Accent Teal',
    prefix: 'accent-teal',
    steps: [
      ['50', '#edfcfa'],
      ['100', '#d1f8f3'],
      ['200', '#a1e3dc'],
      ['300', '#6ecac1'],
      ['400', '#45b2a9'],
      ['500', '#319890'],
      ['600', '#2c817a'],
      ['700', '#236762'],
      ['800', '#1f514d'],
      ['900', '#1b3c39'],
      ['950', '#0a2d2a'],
    ],
  },
  {
    name: 'Highlight Yellow',
    prefix: 'highlight-yellow',
    steps: [
      ['50', '#fef8eb'],
      ['100', '#fcedcc'],
      ['200', '#eed190'],
      ['300', '#dbb14e'],
      ['400', '#c59709'],
      ['500', '#a78001'],
      ['600', '#8e6c03'],
      ['700', '#725600'],
      ['800', '#594510'],
      ['900', '#413313'],
      ['950', '#312403'],
    ],
  },
  {
    name: 'Neutral',
    prefix: 'neutral',
    steps: [
      ['50', '#f8f8f9'],
      ['100', '#eceff1'],
      ['200', '#cfd5db'],
      ['300', '#b0b8c2'],
      ['400', '#93a0ae'],
      ['500', '#78889a'],
      ['600', '#617388'],
      ['700', '#4e5c6d'],
      ['800', '#3d4956'],
      ['900', '#2e3640'],
      ['950', '#1f2731'],
    ],
  },
  {
    name: 'Zinc',
    prefix: 'zinc',
    steps: [
      ['50', '#f8f8f8'],
      ['100', '#eeeeef'],
      ['200', '#d4d4d7'],
      ['300', '#b7b7bb'],
      ['400', '#9d9da6'],
      ['500', '#85858e'],
      ['600', '#70707a'],
      ['700', '#5a5a61'],
      ['800', '#47474b'],
      ['900', '#353538'],
      ['950', '#262628'],
    ],
  },
  {
    name: 'Blue',
    prefix: 'blue',
    steps: [
      ['50', '#f6f8fe'],
      ['100', '#e7efff'],
      ['200', '#c2d5fb'],
      ['300', '#99b7f5'],
      ['400', '#719bf7'],
      ['500', '#4b7ef6'],
      ['600', '#2e63ed'],
      ['700', '#1848d2'],
      ['800', '#1339a7'],
      ['900', '#0f2c7b'],
      ['950', '#102350'],
    ],
  },
  {
    name: 'Green',
    prefix: 'green',
    steps: [
      ['50', '#f0fcf2'],
      ['100', '#dbf7df'],
      ['200', '#afe4b8'],
      ['300', '#72d087'],
      ['400', '#28bc5c'],
      ['500', '#00a148'],
      ['600', '#03893c'],
      ['700', '#006e2e'],
      ['800', '#055725'],
      ['900', '#03411a'],
      ['950', '#0a2f15'],
    ],
  },
  {
    name: 'Red',
    prefix: 'red',
    steps: [
      ['50', '#fef6f5'],
      ['100', '#ffe9e5'],
      ['200', '#f9c6bf'],
      ['300', '#f29e93'],
      ['400', '#f46f63'],
      ['500', '#e93f38'],
      ['600', '#d2161c'],
      ['700', '#ac030f'],
      ['800', '#8a030b'],
      ['900', '#6a0206'],
      ['950', '#490e0c'],
    ],
  },
  {
    name: 'Yellow',
    prefix: 'yellow',
    steps: [
      ['50', '#fdf8eb'],
      ['100', '#ffeeba'],
      ['200', '#f2d26e'],
      ['300', '#dcb314'],
      ['400', '#be9a09'],
      ['500', '#a28301'],
      ['600', '#896e03'],
      ['700', '#6e5800'],
      ['800', '#584600'],
      ['900', '#423400'],
      ['950', '#302501'],
    ],
  },
];

const FOUNDATION: [token: string, label: string, hex: string][] = [
  ['--black', 'Black', '#000000'],
  ['--white', 'White', '#ffffff'],
  ['--foundation-black', 'Foundation black', '#14181e'],
  ['--foundation-white', 'Foundation white', '#ffffff'],
];

/**
 * A primitive swatch: reads the live oklch from the CSS variable and prints both
 * the step and the recorded source hex.
 */
function PrimitiveSwatch({
  token,
  label,
  hex,
}: {
  token: string;
  label: string;
  hex: string;
}) {
  const oklch = useTokenValue(token);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="h-16 w-full border-border border-b"
        style={{ backgroundColor: `var(${token})` }}
      />
      <div className="space-y-0.5 p-2">
        <div className="font-medium text-card-foreground text-xs">{label}</div>
        <div className="font-mono text-card-foreground/70 text-[11px]">
          {hex}
        </div>
        <div className="break-all font-mono text-card-foreground/70 text-[11px]">
          {oklch || '—'}
        </div>
      </div>
    </div>
  );
}

function RampRow({
  name,
  prefix,
  steps,
}: {
  name: string;
  prefix: string;
  steps: [string, string][];
}) {
  return (
    <section className="space-y-2">
      <h3 className="font-semibold text-foreground text-lg">{name}</h3>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
        {steps.map(([step, hex]) => (
          <PrimitiveSwatch
            key={step}
            token={`--${prefix}-${step}`}
            label={step}
            hex={hex}
          />
        ))}
      </div>
    </section>
  );
}

const meta = {
  title: 'Style Guide/Colors',
  // Opt out of the globally-enabled autodocs page; these are visual reference
  // stories, browsed directly rather than through a generated Docs entry.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'The Nebari color system, mirrored 1:1 from the Figma variables library.',
          '**Semantic tokens** are the variables every component consumes — they are',
          'read live from `registry/nebari/globals.css` and resolve to their light or',
          'dark value based on the **Theme** toolbar toggle. The **primitives** below',
          'are the raw ramps the semantic tokens reference; the recorded source hex is',
          'shown alongside each for auditability against the design file.',
        ].join(' '),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SemanticTokens: Story = {
  name: 'Semantic tokens',
  parameters: {
    docs: {
      description: {
        story:
          'Every semantic token in `globals.css`, grouped by role. The swatch fill and the printed value both track the active theme — flip the **Theme** toolbar control to compare light and dark.',
      },
    },
  },
  render: () => (
    <div className="space-y-10 bg-background p-8 text-foreground">
      {SEMANTIC_GROUPS.map((group) => (
        <TokenGroup
          key={group.title}
          title={group.title}
          tokens={group.tokens}
        />
      ))}
    </div>
  ),
};

export const Primitives: Story = {
  name: 'Primitives',
  parameters: {
    docs: {
      description: {
        story:
          'The raw oklch ramps mirrored from the Figma variables library, with the source hex recorded beside each. These are theme-independent — the semantic tokens above reference them and switch per light/dark.',
      },
    },
  },
  render: () => (
    <div className="space-y-10 bg-background p-8 text-foreground">
      {PRIMITIVE_RAMPS.map((ramp) => (
        <RampRow
          key={ramp.prefix}
          name={ramp.name}
          prefix={ramp.prefix}
          steps={ramp.steps}
        />
      ))}
      <section className="space-y-2">
        <h3 className="font-semibold text-foreground text-lg">Foundation</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-2xl">
          {FOUNDATION.map(([token, label, hex]) => (
            <PrimitiveSwatch
              key={token}
              token={token}
              label={label}
              hex={hex}
            />
          ))}
        </div>
      </section>
    </div>
  ),
};
