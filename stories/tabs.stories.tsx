import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart3, Code2, Eye, Settings } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/ui/tabs';

type TabsVariant = NonNullable<ComponentProps<typeof TabsList>['variant']>;

type TabsStoryArgs = Pick<
  ComponentProps<typeof Tabs>,
  'defaultValue' | 'onValueChange' | 'orientation' | 'value'
> & {
  disabled?: boolean;
  icons?: boolean;
  variant: TabsVariant;
};

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tabs switch between related panels. Base UI provides keyboard navigation, `aria-selected`, and panel association; Nebari provides bordered pill and underline visual variants.',
      },
    },
  },
  args: {
    defaultValue: 'overview',
    disabled: false,
    icons: false,
    orientation: 'horizontal',
    variant: 'pill',
  },
  argTypes: {
    variant: {
      description:
        'Visual style, set on `TabsList` and propagated to `TabsTab` and `TabsIndicator` through context. `pill` is a bordered card-colored pill; `underline` and `line` use an underline indicator; `toggle` renders a segmented control.',
      control: 'select',
      options: ['pill', 'underline', 'line', 'toggle'],
      table: { defaultValue: { summary: 'pill' } },
    },
    orientation: {
      description:
        'Tab layout orientation managed by Base UI. `vertical` puts the list beside the panels.',
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    defaultValue: {
      description:
        'Initial active tab value when the component is uncontrolled. This story uses named tab values; Base UI falls back to the tab index.',
      control: 'select',
      options: ['overview', 'analytics', 'settings', 'logs'],
      table: { defaultValue: { summary: '0' } },
    },
    icons: {
      description:
        'Story-only toggle. Renders a leading `lucide-react` icon in each tab.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description:
        'Story-only toggle. Disables the last tab — a disabled `TabsTab` stays visible but cannot be focused or selected.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      description:
        'Controlled active tab value. Pair it with `onValueChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    onValueChange: {
      description: 'Called when the active tab changes.',
      action: 'value changed',
      control: false,
    },
  },
  decorators: [
    // `defaultValue` is mount-only, so the key forces a remount when it changes.
    (Story, { args }) => <Story key={String(args.defaultValue)} />,
  ],
} satisfies Meta<TabsStoryArgs>;

export default meta;

type Story = StoryObj<TabsStoryArgs>;

function PanelCard({ children, title }: { children: string; title: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  );
}

function ExampleTabs({
  defaultValue = 'overview',
  disabled = false,
  icons = false,
  onValueChange,
  orientation = 'horizontal',
  variant,
}: TabsStoryArgs) {
  const isVertical = orientation === 'vertical';

  return (
    <Tabs
      className={isVertical ? 'w-[620px]' : 'w-[520px]'}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      orientation={orientation}
    >
      <TabsList aria-label="Project sections" variant={variant}>
        <TabsTab value="overview">
          {icons ? <Eye /> : null}
          Overview
        </TabsTab>
        <TabsTab value="analytics">
          {icons ? <BarChart3 /> : null}
          Analytics
        </TabsTab>
        <TabsTab value="settings">
          {icons ? <Settings /> : null}
          Settings
        </TabsTab>
        <TabsTab disabled={disabled} value="logs">
          {icons ? <Code2 /> : null}
          Logs
        </TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel
        className={isVertical ? 'min-w-0 flex-1' : undefined}
        value="overview"
      >
        <PanelCard title="Overview">
          View your key metrics and recent project activity.
        </PanelCard>
      </TabsPanel>
      <TabsPanel
        className={isVertical ? 'min-w-0 flex-1' : undefined}
        value="analytics"
      >
        <PanelCard title="Analytics">
          Track usage, adoption, and changes across active projects.
        </PanelCard>
      </TabsPanel>
      <TabsPanel
        className={isVertical ? 'min-w-0 flex-1' : undefined}
        value="settings"
      >
        <PanelCard title="Settings">
          Manage visibility, notifications, and access for this project.
        </PanelCard>
      </TabsPanel>
      <TabsPanel
        className={isVertical ? 'min-w-0 flex-1' : undefined}
        value="logs"
      >
        <PanelCard title="Logs">
          Review detailed events and operational output.
        </PanelCard>
      </TabsPanel>
    </Tabs>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default pill style. Each tab is a bordered card-colored pill; disabled pills keep the same sizing and switch to the muted background. Use the controls to preview every variant, orientation, and the icon and disabled states.',
      },
    },
  },
  render: (args) => <ExampleTabs {...args} />,
};

export const Underline: Story = {
  args: { variant: 'underline' },
  parameters: {
    controls: { include: ['variant', 'icons', 'disabled'] },
    docs: {
      description: {
        story:
          'Header-style tabs with a primary underline indicator. Use this when tabs sit above page or section content.',
      },
    },
  },
  render: (args) => <ExampleTabs {...args} />,
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  parameters: {
    controls: { include: ['orientation', 'variant', 'icons'] },
    docs: {
      description: {
        story:
          'Use `orientation="vertical"` when the tab list should sit beside the panels.',
      },
    },
  },
  render: (args) => <ExampleTabs {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    controls: { include: ['disabled', 'variant'] },
    docs: {
      description: {
        story:
          'Disabled tabs remain visible in the list but cannot be focused or selected.',
      },
    },
  },
  render: (args) => <ExampleTabs {...args} />,
};

export const Icons: Story = {
  args: { icons: true },
  parameters: {
    controls: { include: ['icons', 'variant'] },
    docs: {
      description: {
        story:
          'Tabs can include leading icons. Keep labels visible so the tabs remain easy to scan.',
      },
    },
  },
  render: (args) => <ExampleTabs {...args} />,
};
