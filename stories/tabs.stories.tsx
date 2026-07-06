import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart3, Code2, Eye, Settings } from 'lucide-react';
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/ui/tabs';

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
  argTypes: {
    defaultValue: {
      description:
        'Initial active tab value when the component is uncontrolled.',
      control: 'text',
      table: { defaultValue: { summary: '0' } },
    },
    value: {
      description: 'Controlled active tab value.',
      control: 'text',
    },
    onValueChange: {
      description: 'Called when the active tab changes.',
      action: 'value changed',
      control: false,
    },
    orientation: {
      description: 'Tab layout orientation managed by Base UI.',
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;
type TabsVariant = 'pill' | 'underline';

function PanelCard({ children, title }: { children: string; title: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  );
}

function ExampleTabs({
  disabled = false,
  icons = false,
  orientation = 'horizontal',
  variant,
}: {
  disabled?: boolean;
  icons?: boolean;
  orientation?: 'horizontal' | 'vertical';
  variant: TabsVariant;
}) {
  const isVertical = orientation === 'vertical';

  return (
    <Tabs
      className={isVertical ? 'w-[620px]' : 'w-[520px]'}
      defaultValue="overview"
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

export const Pill: Story = {
  name: 'Pill',
  parameters: {
    docs: {
      description: {
        story:
          'The default pill style. Each tab is a bordered card-colored pill; disabled pills keep the same sizing and switch to the muted background.',
      },
    },
  },
  render: () => <ExampleTabs variant="pill" />,
};

export const Underline: Story = {
  name: 'Underline',
  parameters: {
    docs: {
      description: {
        story:
          'Header-style tabs with a primary underline indicator. Use this when tabs sit above page or section content.',
      },
    },
  },
  render: () => <ExampleTabs variant="underline" />,
};

export const Vertical: Story = {
  name: 'Vertical',
  parameters: {
    docs: {
      description: {
        story:
          'Use `orientation="vertical"` when the tab list should sit beside the panels.',
      },
    },
  },
  render: () => <ExampleTabs orientation="vertical" variant="pill" />,
};

export const Disabled: Story = {
  name: 'Disabled',
  parameters: {
    docs: {
      description: {
        story:
          'Disabled tabs remain visible in the list but cannot be focused or selected.',
      },
    },
  },
  render: () => <ExampleTabs disabled variant="pill" />,
};

export const Icons: Story = {
  name: 'Icons',
  parameters: {
    docs: {
      description: {
        story:
          'Tabs can include leading icons. Keep labels visible so the tabs remain easy to scan.',
      },
    },
  },
  render: () => <ExampleTabs icons variant="pill" />,
};
