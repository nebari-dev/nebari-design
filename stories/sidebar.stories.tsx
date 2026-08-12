import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Brain,
  ChevronRight,
  ChevronsUpDown,
  Coins,
  LifeBuoy,
  LogOut,
  Newspaper,
  PaintRoller,
  Settings,
  Ship,
  Terminal,
  TrainFrontTunnel,
  UserRound,
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuDescription,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/ui/sidebar';

type SidebarMenuButtonVariant = NonNullable<
  ComponentProps<typeof SidebarMenuButton>['variant']
>;
type SidebarMenuButtonSize = NonNullable<
  ComponentProps<typeof SidebarMenuButton>['size']
>;

type SidebarStoryArgs = Pick<
  ComponentProps<typeof SidebarProvider>,
  'collapsed' | 'defaultCollapsed' | 'onCollapsedChange'
> &
  Pick<
    ComponentProps<typeof SidebarMenuButton>,
    'className' | 'render' | 'tooltip'
  > & {
    active: boolean;
    disabled: boolean;
    size: SidebarMenuButtonSize;
    variant: SidebarMenuButtonVariant;
  };

const meta = {
  title: 'Components/Sidebar',
  component: SidebarMenuButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "App-shell sidebar. The shell parts are plain layout; the composition point is `SidebarMenuButton`, which renders a `<button>` by default and accepts Base UI's `render` prop so the same row can become an anchor or the trigger of a dropdown menu, select, or tooltip.",
      },
    },
  },
  args: {
    active: false,
    defaultCollapsed: false,
    disabled: false,
    size: 'default',
    variant: 'default',
  },
  argTypes: {
    variant: {
      description:
        'Menu button emphasis. `default` uses the neutral muted surface for hover and active rows; `ghost` uses the sidebar accent tokens.',
      control: 'select',
      options: ['default', 'ghost'],
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      description:
        'Menu button height. `account` is the two-line row used for the footer profile entry.',
      control: 'select',
      options: ['default', 'sm', 'lg', 'account'],
      table: { defaultValue: { summary: 'default' } },
    },
    active: {
      description:
        'Marks a menu button as the current page or section, emitting `data-active="true"`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description:
        'Disables the menu buttons. Applies to the default `<button>` element; an anchor-rendered row should use `aria-disabled` instead.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    defaultCollapsed: {
      description:
        'Initial collapsed state of `SidebarProvider` when uncontrolled. Collapsing narrows the rail to icons and hides labels, descriptions, group labels, and submenus.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    collapsed: {
      description:
        'Controlled collapsed state of `SidebarProvider`. Pair it with `onCollapsedChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    render: {
      description:
        "Base UI render-prop composition on `SidebarMenuButton`. Swap the default button for an anchor or another component's trigger while keeping the sidebar styling and `data-slot` hooks.",
      control: false,
      table: { defaultValue: { summary: '<button type="button" />' } },
    },
    tooltip: {
      description:
        'Content shown beside the menu item on hover or keyboard focus while the sidebar is collapsed.',
      control: false,
    },
    className: { table: { disable: true } },
    onCollapsedChange: {
      description: 'Called when the collapsed state changes.',
      action: 'collapsed changed',
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story, { args }) => <Story key={String(args.defaultCollapsed)} />,
  ],
} satisfies Meta<SidebarStoryArgs>;

export default meta;

type Story = StoryObj<SidebarStoryArgs>;

const NAV_ITEMS = [
  { icon: Terminal, label: 'Playground' },
  { icon: Brain, label: 'Models' },
  { icon: Newspaper, label: 'Documentation' },
  { icon: PaintRoller, label: 'Design' },
] as const;

const PROJECT_ITEMS = [
  { icon: TrainFrontTunnel, label: 'Travel' },
  { icon: Coins, label: 'Sales' },
  { icon: UserRound, label: 'Engineering' },
] as const;

function SidebarFrame({
  children,
  defaultCollapsed = false,
  label = 'Sidebar',
}: {
  children: ReactNode;
  defaultCollapsed?: boolean;
  label?: string;
}) {
  return (
    <div className="h-[720px] w-full bg-card p-4">
      <SidebarProvider defaultCollapsed={defaultCollapsed}>
        <div className="flex h-full gap-2">
          <Sidebar aria-label={label}>{children}</Sidebar>
          <SidebarTrigger className="mt-2 self-start" />
        </div>
      </SidebarProvider>
    </div>
  );
}

function BrandHeader({ subtitle = 'Enterprise' }: { subtitle?: string }) {
  return (
    <SidebarHeader>
      <SidebarMenu className="w-full">
        <SidebarMenuItem>
          <SidebarMenuButton size="account" tooltip="Nebari">
            <span className="inline-flex size-8 min-w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Ship className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <SidebarMenuLabel className="block text-sm leading-5 font-medium">
                Nebari
              </SidebarMenuLabel>
              <SidebarMenuDescription>{subtitle}</SidebarMenuDescription>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export const Default: Story = {
  render: ({ active, disabled, size, variant }) => (
    <SidebarFrame label="Playground sidebar">
      <BrandHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item, index) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  active={index === 0 ? active : false}
                  disabled={disabled}
                  size={size}
                  tooltip={item.label}
                  variant={variant}
                >
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    data-slot="sidebar-menu-trailing"
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            {PROJECT_ITEMS.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  disabled={disabled}
                  size={size}
                  tooltip={item.label}
                  variant={variant}
                >
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled={disabled}
              size="account"
              tooltip="Ada Lovelace"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <SidebarMenuLabel className="block text-sm leading-5 font-medium">
                  Ada Lovelace
                </SidebarMenuLabel>
                <SidebarMenuDescription>ada@example.com</SidebarMenuDescription>
              </span>
              <ChevronsUpDown
                className="size-4 shrink-0 text-muted-foreground"
                data-slot="sidebar-menu-trailing"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarFrame>
  ),
};

export const AsLinks: Story = {
  name: 'As links',
  parameters: { controls: { include: [] } },
  render: (_args) => (
    <SidebarFrame label="Link sidebar">
      <BrandHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item, index) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  active={index === 0}
                  render={
                    <a
                      aria-current={index === 0 ? 'page' : undefined}
                      href={`/${item.label.toLowerCase()}`}
                    />
                  }
                  tooltip={item.label}
                >
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarFrame>
  ),
};

export const WithDropdownMenu: Story = {
  name: 'With dropdown menu',
  parameters: { controls: { include: [] } },
  render: (_args) => (
    <SidebarFrame label="Workspace sidebar">
      <SidebarHeader>
        <SidebarMenu className="min-w-0 flex-1">
          <DropdownMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <DropdownMenuTrigger
                    render={<button type="button" />}
                    variant="ghost"
                  />
                }
                size="account"
                tooltip="Nebari"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Ship className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <SidebarMenuLabel className="block text-sm leading-5 font-medium">
                    Nebari
                  </SidebarMenuLabel>
                  <SidebarMenuDescription>Enterprise</SidebarMenuDescription>
                </span>
                <ChevronsUpDown
                  className="size-4 shrink-0 text-muted-foreground"
                  data-slot="sidebar-menu-trailing"
                />
              </SidebarMenuButton>
              <DropdownMenuPortal>
                <DropdownMenuContent align="start" side="bottom">
                  <DropdownMenuItem render={<a href="/workspaces/research" />}>
                    <Brain className="size-4" />
                    Research
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<a href="/workspaces/platform" />}>
                    <Terminal className="size-4" />
                    Platform
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<a href="/settings" />}>
                    <Settings className="size-4" />
                    Workspace settings
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </SidebarMenuItem>
          </DropdownMenu>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item, index) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton active={index === 0} tooltip={item.label}>
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    const trigger = canvas.getByRole('button', { name: /Nebari/ });
    await expect(trigger).toHaveAttribute('data-size', 'account');

    await userEvent.click(trigger);
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      page.getByRole('menuitem', { name: /Research/ }),
    ).toHaveAttribute('data-highlighted', '');
  },
};

export const GroupedItems: Story = {
  name: 'Grouped items',
  parameters: { controls: { include: [] } },
  render: (_args) => (
    <SidebarFrame label="Grouped sidebar">
      <BrandHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item, index) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton active={index === 0} tooltip={item.label}>
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            {PROJECT_ITEMS.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label}>
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Help center">
                <LifeBuoy className="size-4 shrink-0" />
                <SidebarMenuLabel>Help center</SidebarMenuLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings className="size-4 shrink-0" />
                <SidebarMenuLabel>Settings</SidebarMenuLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarFrame>
  ),
};

export const CollapsedIconOnly: Story = {
  name: 'Collapsed icon only',
  parameters: { controls: { include: [] } },
  render: (_args) => (
    <SidebarFrame defaultCollapsed label="Collapsed sidebar">
      <BrandHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item, index) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton active={index === 0} tooltip={item.label}>
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const sidebar = canvas.getByRole('complementary', {
      name: 'Collapsed sidebar',
    });
    const sidebarCenter = sidebar.getBoundingClientRect().x + 32;
    const models = canvas.getByRole('button', { name: 'Models' });

    await expect(getComputedStyle(sidebar).transitionDuration).toBe('0.35s');
    await expect(models.getBoundingClientRect().width).toBe(32);
    await expect(getComputedStyle(models).paddingInline).toBe('8px');
    await expect(models).toHaveClass('hover:bg-muted');

    for (const icon of sidebar.querySelectorAll(
      '[data-slot="sidebar-menu-button"] > svg',
    )) {
      const bounds = icon.getBoundingClientRect();
      await expect(bounds.x + bounds.width / 2).toBeCloseTo(sidebarCenter);
    }

    await userEvent.hover(models);
    await expect(page.getByRole('tooltip')).toHaveTextContent('Models');
  },
};

export const NestedNavigation: Story = {
  name: 'Nested navigation',
  parameters: { controls: { include: [] } },
  render: (_args) => (
    <SidebarFrame label="Nested sidebar">
      <BrandHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active tooltip="Design">
                <PaintRoller className="size-4 shrink-0" />
                <SidebarMenuLabel>Design</SidebarMenuLabel>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {['Tokens', 'Components', 'Icons'].map((label) => (
                  <SidebarMenuSubItem key={label}>
                    <SidebarMenuButton
                      render={<a href={`/design/${label.toLowerCase()}`} />}
                      size="sm"
                      tooltip={label}
                    >
                      <SidebarMenuLabel>{label}</SidebarMenuLabel>
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarMenuItem>
            {PROJECT_ITEMS.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label}>
                  <item.icon className="size-4 shrink-0" />
                  <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarFrame>
  ),
};
