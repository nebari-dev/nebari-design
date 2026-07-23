import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  CircleCheck,
  Heart,
  icons,
  type LucideIcon,
  Star,
  TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * The complete [lucide-react](https://lucide.dev) catalog, read from the
 * package's `icons` export — every icon that ships with the version pinned in
 * `package.json`. Each entry is keyed by the PascalCase name you import.
 */
const ICONS = Object.entries(icons) as [name: string, Icon: LucideIcon][];

const meta = {
  title: 'Style Guide/Icons',
  // Opt out of the globally-enabled autodocs page; these are visual reference
  // stories, browsed directly rather than through a generated Docs entry.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'Nebari uses [lucide-react](https://lucide.dev) for iconography. Icons are',
          'plain React components — size them with Tailwind (`size-4`, `size-6`) and',
          'color them with `text-*` utilities, since each icon inherits',
          '`currentColor`. Import by PascalCase name:',
          '\n\n```tsx\nimport { Search } from \'lucide-react\';\n\n<Search className="size-4" />\n```',
        ].join(' '),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function Gallery() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICONS.filter(([name]) => name.toLowerCase().includes(q)) : ICONS;
  }, [query]);

  return (
    <div className="space-y-4 bg-background p-8 text-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter icons…"
          aria-label="Filter icons by name"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-card-foreground text-sm outline-none placeholder:text-card-foreground/50 focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
        />
        <span className="font-mono text-foreground/70 text-xs">
          {filtered.length} of {ICONS.length} icons
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map(([name, Icon]) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center"
          >
            <Icon className="size-6 text-card-foreground" aria-hidden="true" />
            <span className="break-all font-mono text-card-foreground/70 text-xs">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AllIcons: Story = {
  name: 'Gallery',
  // The complete catalog is expensive to render and axe-scan on shared CI
  // runners. The default Storybook project excludes this tag; run it locally
  // with `bun run test:icons`.
  tags: ['icons-gallery'],
  parameters: {
    docs: {
      description: {
        story:
          'The full lucide-react catalog. Type in the filter to find an icon by name; the count reflects the current filter.',
      },
    },
  },
  render: () => <Gallery />,
};

export const Sizing: Story = {
  name: 'Sizing & color',
  parameters: {
    docs: {
      description: {
        story:
          'Icons scale with the `size-*` utility and pick up the surrounding text color through `currentColor`.',
      },
    },
  },
  render: () => (
    <div className="space-y-8 bg-background p-8 text-foreground">
      <div className="flex items-end gap-6">
        {(['size-4', 'size-5', 'size-6', 'size-8', 'size-10'] as const).map(
          (size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Bell className={`${size} text-foreground`} aria-hidden="true" />
              <span className="font-mono text-foreground/70 text-xs">
                {size}
              </span>
            </div>
          ),
        )}
      </div>
      <div className="flex items-center gap-6">
        <Heart className="size-6 text-primary" aria-hidden="true" />
        <CircleCheck className="size-6 text-chart-2" aria-hidden="true" />
        <TriangleAlert
          className="size-6 text-destructive-foreground"
          aria-hidden="true"
        />
        <Star className="size-6 text-chart-3" aria-hidden="true" />
      </div>
    </div>
  ),
};
