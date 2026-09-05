import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '@/components/ui/skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Decorative placeholder primitives shown while content loads. Compose line, circle, and block shapes to mirror the real layout.',
      },
    },
  },
  args: {
    className: 'w-64',
    shape: 'line',
  },
  argTypes: {
    shape: {
      control: 'select',
      description: 'Placeholder shape primitive.',
      options: ['line', 'circle', 'block'],
      table: { defaultValue: { summary: 'line' } },
    },
    className: {
      control: 'text',
      description: 'Override dimensions or layout at the call site.',
      table: { defaultValue: { summary: undefined } },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

const storyFrameClassName = 'w-[min(calc(100vw-3rem),856px)]';
const exampleLabelClassName = 'font-medium text-foreground text-sm';

export const Default: Story = {};

export const Shapes: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The three shape primitives. Use `className` to size each placeholder to the layout it represents.',
      },
    },
  },
  render: (_args) => (
    <div className={`${storyFrameClassName} grid gap-10 bg-card p-6`}>
      <h2 className="font-semibold text-2xl tracking-normal">Component</h2>
      <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end sm:gap-14">
        <div className="grid gap-5">
          <span className={exampleLabelClassName}>Line</span>
          <Skeleton className="w-full max-w-72" />
        </div>
        <div className="grid gap-5 sm:justify-items-center">
          <span className={exampleLabelClassName}>Circle</span>
          <Skeleton shape="circle" />
        </div>
        <div className="grid gap-5">
          <span className={exampleLabelClassName}>Block</span>
          <Skeleton className="w-full max-w-80" shape="block" />
        </div>
      </div>
    </div>
  ),
};

export const AnimationPrototype: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'A motion-focused prototype showing repeated placeholders in each shape.',
      },
    },
  },
  render: (_args) => (
    <div className={`${storyFrameClassName} grid gap-8 bg-card p-6`}>
      <h2 className="font-semibold text-2xl tracking-normal">
        Animation Prototype
      </h2>
      <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-x-16">
        <div className="grid content-start gap-10">
          <Skeleton className="w-full max-w-72" />
          <Skeleton className="w-full max-w-72" />
        </div>
        <div className="grid content-start gap-10 sm:justify-items-center">
          <Skeleton shape="circle" />
          <Skeleton className="opacity-50" shape="circle" />
        </div>
        <div className="grid content-start gap-10">
          <Skeleton className="w-full max-w-80" shape="block" />
          <Skeleton className="w-full max-w-80" shape="block" />
        </div>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Common loading compositions for cards, list rows, and text blocks.',
      },
    },
  },
  render: (_args) => (
    <div className={`${storyFrameClassName} grid gap-6 bg-card p-6`}>
      <div className="grid gap-5">
        <h2 className="font-semibold text-2xl tracking-normal">Examples</h2>
        <p className="text-muted-foreground text-sm">
          Select frame and press Present to see the animations.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] items-start gap-6">
        <div className="grid gap-3">
          <span className={exampleLabelClassName}>Card</span>
          <div
            aria-busy="true"
            aria-label="Loading card"
            className="grid gap-4 rounded-md border border-border bg-card p-4"
            role="status"
          >
            <Skeleton className="h-40" shape="block" />
            <Skeleton className="w-48" />
            <Skeleton className="w-28" />
          </div>
        </div>
        <div className="grid gap-3">
          <span className={exampleLabelClassName}>List row</span>
          <div
            aria-busy="true"
            aria-label="Loading list row"
            className="flex items-center gap-4 rounded-md border border-border bg-card p-4"
            role="status"
          >
            <Skeleton shape="circle" />
            <div className="grid min-w-0 flex-1 gap-3">
              <Skeleton />
              <Skeleton className="w-32" />
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <span className={exampleLabelClassName}>Paragraph</span>
          <div
            aria-busy="true"
            aria-label="Loading paragraph"
            className="grid gap-3 rounded-md border border-border bg-card p-4"
            role="status"
          >
            <Skeleton />
            <Skeleton />
            <Skeleton className="w-48" />
          </div>
        </div>
      </div>
    </div>
  ),
};
