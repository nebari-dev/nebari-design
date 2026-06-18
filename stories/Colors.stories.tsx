import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';

/** Round to `d` decimals, dropping trailing zeros. */
function round(n: number, d: number) {
  return String(Math.round(n * 10 ** d) / 10 ** d);
}

/** Format OKLab lightness/chroma/hue as an `oklch(…)` string. */
function formatOklch(L: number, C: number, H: number) {
  // Achromatic colors have no meaningful hue; match the authored `oklch(x 0 0)`.
  if (C < 0.0005) return `oklch(${round(L, 4)} 0 0)`;
  return `oklch(${round(L, 4)} ${round(C, 4)} ${round(H, 2)})`;
}

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Convert sRGB (each channel 0–1) to an `oklch(…)` string. */
function rgbToOklch(r: number, g: number, b: number) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return formatOklch(L, C, H);
}

/** Convert a `#rrggbb` hex string to an `oklch(…)` string. */
function hexToOklch(hex: string) {
  const h = hex.replace('#', '');
  return rgbToOklch(
    Number.parseInt(h.slice(0, 2), 16) / 255,
    Number.parseInt(h.slice(2, 4), 16) / 255,
    Number.parseInt(h.slice(4, 6), 16) / 255,
  );
}

/**
 * Reads a semantic token's authored `oklch(…)` value off the document root and
 * keeps it in sync with the active theme. The swatch fill updates on its own (it
 * references `var(--token)` directly); a `MutationObserver` re-reads the value
 * whenever the theme toggle flips the `.dark` class on `<html>`.
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
      ['--info', 'Info'],
      ['--info-foreground', 'Info foreground'],
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
 * The Nebari brand palette as authored in Figma. Each anchor color is expanded
 * into a 10-step scale; the `globals.css` semantic tokens are derived from
 * these. Values are the brand reference, so they are listed as hex literals.
 */
const BRAND_SCALES: { name: string; shades: [step: string, hex: string][] }[] =
  [
    {
      name: 'Primary Magenta',
      shades: [
        ['50', '#F5EFFE'],
        ['100', '#E8D7FB'],
        ['200', '#D4B6F5'],
        ['300', '#B787EB'],
        ['400', '#A65BD9'],
        ['500', '#9B3DCC'],
        ['600', '#8232AA'],
        ['700', '#682888'],
        ['800', '#4A1C63'],
        ['900', '#2F123F'],
      ],
    },
    {
      name: 'Accent Teal',
      shades: [
        ['50', '#E9F9F8'],
        ['100', '#C9F0ED'],
        ['200', '#9CDED9'],
        ['300', '#6CC8C0'],
        ['400', '#48B5AC'],
        ['500', '#359C95'],
        ['600', '#2C817C'],
        ['700', '#246864'],
        ['800', '#1A4D4A'],
        ['900', '#103231'],
      ],
    },
    {
      name: 'Highlight Yellow',
      shades: [
        ['50', '#FFF9EC'],
        ['100', '#FFF1CF'],
        ['200', '#FFE3A1'],
        ['300', '#FDD572'],
        ['400', '#F1C24D'],
        ['500', '#EAB54E'],
        ['600', '#C89841'],
        ['700', '#9C7633'],
        ['800', '#705526'],
        ['900', '#493819'],
      ],
    },
    {
      name: 'Neutral',
      shades: [
        ['50', '#F9FAFB'],
        ['100', '#ECEEF1'],
        ['200', '#D0D5DC'],
        ['300', '#B5BEC8'],
        ['400', '#9AA6B5'],
        ['500', '#7B8A9D'],
        ['600', '#617388'],
        ['700', '#516071'],
        ['800', '#3F4A58'],
        ['900', '#2D353F'],
      ],
    },
  ];

const FOUNDATION: [name: string, hex: string][] = [
  ['Black', '#14181E'],
  ['White', '#FFFFFF'],
];

/** A fixed-color swatch (brand palette / foundation): label and oklch value. */
function HexSwatch({ label, hex }: { label: string; hex: string }) {
  const oklch = useMemo(() => hexToOklch(hex), [hex]);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-16 w-full" style={{ backgroundColor: hex }} />
      <div className="space-y-0.5 p-2">
        <div className="font-medium text-card-foreground text-xs">{label}</div>
        <div className="break-all font-mono text-card-foreground/70 text-[11px]">
          {oklch}
        </div>
      </div>
    </div>
  );
}

function ScaleRow({
  name,
  shades,
}: {
  name: string;
  shades: [string, string][];
}) {
  return (
    <section className="space-y-2">
      <h3 className="font-semibold text-foreground text-lg">{name}</h3>
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
        {shades.map(([step, hex]) => (
          <HexSwatch key={step} label={step} hex={hex} />
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
          'The Nebari color system. **Semantic tokens** are the variables every',
          'component consumes — they are read live from `registry/nebari/globals.css`',
          'and resolve to their light or dark value based on the **Theme** toolbar',
          'toggle. The **brand palette** below is the underlying Figma scale the',
          'tokens are derived from.',
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

export const BrandPalette: Story = {
  name: 'Brand palette',
  parameters: {
    docs: {
      description: {
        story:
          'The brand anchor colors expanded into 10-step scales, plus the foundation black and white. These are the source values the semantic tokens are tuned from.',
      },
    },
  },
  render: () => (
    <div className="space-y-10 bg-background p-8 text-foreground">
      {BRAND_SCALES.map((scale) => (
        <ScaleRow key={scale.name} name={scale.name} shades={scale.shades} />
      ))}
      <section className="space-y-2">
        <h3 className="font-semibold text-foreground text-lg">Foundation</h3>
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          {FOUNDATION.map(([name, hex]) => (
            <HexSwatch key={name} label={name} hex={hex} />
          ))}
        </div>
      </section>
    </div>
  ),
};
