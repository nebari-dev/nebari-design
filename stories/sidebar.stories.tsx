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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
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
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    return (
      <Sidebar>
        {collapsed ? (
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton variant="ghost">
                  <SidebarTrigger className="text-foreground" />
                  <span data-slot="sidebar-menu-label">Expand sidebar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        ) : (
          <SidebarHeader>
            <SidebarMenuButton size="account" variant="default">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Ship className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-sm leading-5 font-medium"
                  data-slot="sidebar-menu-label"
                >
                  Menu Item
                </span>
                <span
                  className="block truncate text-xs leading-4 text-muted-foreground"
                  data-slot="sidebar-menu-description"
                >
                  Enterprise
                </span>
              </span>
              <SidebarTrigger className="text-foreground" />
            </SidebarMenuButton>
          </SidebarHeader>
        )}
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
                  <span
                    className="shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  >
                    &gt;
                  </span>
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
