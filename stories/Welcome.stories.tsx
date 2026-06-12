import type { Meta, StoryObj } from '@storybook/react-vite';
import { cn } from '@/lib/utils';

/**
 * Placeholder story proving the Storybook pipeline: the `@` alias resolves to
 * `registry/nebari`, Tailwind v4 utilities compile, and the Nebari theme tokens
 * render. Replace with real component stories as components land.
 */
function Welcome({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border bg-card p-8 text-card-foreground',
        className,
      )}
    >
      <h1 className="text-2xl font-semibold text-foreground">Nebari Design</h1>
      <p className="text-muted-foreground">
        shadcn component registry, styled with the Nebari brand.
      </p>
      <div className="flex gap-2">
        <span className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
          Primary
        </span>
        <span className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          Secondary
        </span>
        <span className="rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground">
          Muted
        </span>
      </div>
    </div>
  );
}

const meta = {
  title: 'Welcome',
  component: Welcome,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Welcome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8">
        <Story />
      </div>
    ),
  ],
};
