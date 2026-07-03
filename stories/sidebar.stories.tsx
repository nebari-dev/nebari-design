import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Brain,
  Coins,
  Newspaper,
  PaintRoller,
  Ship,
  Terminal,
  TrainFrontTunnel,
  UserRound,
} from 'lucide-react';
import {
  Sidebar,
  SidebarCollapseIcon,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderBrand,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/ui/sidebar';

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Nebari app-shell sidebar composed from menu button, group label, submenu, and account-row patterns from the Figma Sidebar demo.',
      },
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

function SidebarExample({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}) {
  function SidebarLayout() {
    return (
      <Sidebar>
        <SidebarHeader>
          <SidebarHeaderBrand
            description="Enterprise"
            icon={<Ship className="size-4" />}
            title="Menu Item"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Group title</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active>
                  <Terminal className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Playground
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Brain className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Models
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Newspaper className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Documentation
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <PaintRoller className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Design
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <PaintRoller className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Design
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <TrainFrontTunnel className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Travel
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Coins className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Sales
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <UserRound className="size-4 shrink-0" />
                  <span
                    className="min-w-0 flex-1"
                    data-slot="sidebar-menu-label"
                  >
                    Engineering
                  </span>
                  <SidebarCollapseIcon
                    className="shrink-0"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="account" variant="default">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Ship className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-sm leading-5 font-medium"
                    data-slot="sidebar-menu-label"
                  >
                    Username
                  </span>
                  <span
                    className="block truncate text-xs leading-4 text-muted-foreground-strong"
                    data-slot="sidebar-menu-description"
                  >
                    username@email.com
                  </span>
                </span>
                <SidebarCollapseIcon data-slot="sidebar-menu-trailing" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <div className="h-[780px] w-full bg-background p-4">
      <SidebarProvider defaultCollapsed={defaultCollapsed}>
        <SidebarLayout />
      </SidebarProvider>
    </div>
  );
}

export const Expanded: Story = {
  render: () => <SidebarExample />,
};

export const CollapsedIconOnly: Story = {
  render: () => <SidebarExample defaultCollapsed />,
};

export const GroupedItems: Story = {
  render: () => <SidebarExample />,
};
