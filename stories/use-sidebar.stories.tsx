import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, Settings } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '@/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarProvider,
  type SidebarState,
  useSidebar,
} from '@/ui/sidebar';

interface UseSidebarDemoProps {
  /** Documentation-only row for the `useSidebar` return value. */
  collapsed?: boolean;
  /** Documentation-only row for the `useSidebar` return value. */
  state?: SidebarState;
  /** Documentation-only row for the `useSidebar` return value. */
  setCollapsed?: (next: boolean | ((previous: boolean) => boolean)) => void;
  /** Documentation-only row for the `useSidebar` return value. */
  toggle?: () => void;
}

function ExternalSidebarControls() {
  const { collapsed, setCollapsed, state, toggle } = useSidebar();

  return (
    <section
      className="flex min-w-64 flex-col gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground"
      aria-labelledby="external-sidebar-controls"
    >
      <div>
        <h2 id="external-sidebar-controls" className="font-semibold">
          External controls
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          These buttons use the hook directly, without a SidebarTrigger.
        </p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">state</dt>
        <dd>
          <code data-testid="sidebar-state">{state}</code>
        </dd>
        <dt className="text-muted-foreground">collapsed</dt>
        <dd>
          <code data-testid="sidebar-collapsed">{String(collapsed)}</code>
        </dd>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setCollapsed(false)}>
          Expand
        </Button>
        <Button size="sm" variant="outline" onClick={() => setCollapsed(true)}>
          Collapse
        </Button>
        <Button size="sm" onClick={toggle}>
          Toggle
        </Button>
      </div>
    </section>
  );
}

function SidebarNavigation() {
  return (
    <Sidebar aria-label="Hook demo navigation">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active tooltip="Home">
                <Home className="size-4 shrink-0" />
                <SidebarMenuLabel>Home</SidebarMenuLabel>
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
    </Sidebar>
  );
}

function UseSidebarDemo(_props: UseSidebarDemoProps) {
  return (
    <SidebarProvider>
      <div className="flex h-80 items-start gap-4 rounded-xl bg-background p-4">
        <SidebarNavigation />
        <ExternalSidebarControls />
      </div>
    </SidebarProvider>
  );
}

const meta = {
  title: 'Hooks/useSidebar',
  component: UseSidebarDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`useSidebar` reads and drives the nearest `SidebarProvider`. It returns the ' +
          'semantic `state`, the equivalent `collapsed` boolean, `setCollapsed` for an ' +
          'explicit value or updater function, and `toggle` for switching states. This ' +
          'makes controls elsewhere in an app shell possible without rendering ' +
          '`SidebarTrigger`. The external panel below reads the live values and drives ' +
          'the sidebar through the real hook. Unlike `useTheme`, `useSidebar` does not ' +
          'throw outside its provider: the context carries an inert default, so a call ' +
          'above `SidebarProvider` reports `expanded` forever and its setters no-op. ' +
          'Keep every caller inside the provider.',
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Semantic state returned by `useSidebar`: `'expanded'` or `'collapsed'`.",
      control: false,
      table: {
        category: 'useSidebar return',
        type: { summary: "'expanded' | 'collapsed'" },
      },
    },
    collapsed: {
      description:
        "Boolean collapsed state returned by `useSidebar`; equivalent to `state === 'collapsed'`.",
      control: false,
      table: {
        category: 'useSidebar return',
        type: { summary: 'boolean' },
      },
    },
    setCollapsed: {
      description:
        'Setter returned by `useSidebar`; accepts a boolean or an updater function.',
      control: false,
      table: {
        category: 'useSidebar return',
        type: {
          summary: '(next: boolean | ((previous: boolean) => boolean)) => void',
        },
      },
    },
    toggle: {
      description:
        'Callback returned by `useSidebar`; switches between expanded and collapsed.',
      control: false,
      table: {
        category: 'useSidebar return',
        type: { summary: '() => void' },
      },
    },
  },
} satisfies Meta<typeof UseSidebarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getByRole('navigation', {
      name: 'Hook demo navigation',
    });

    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
    await expect(canvas.getByTestId('sidebar-state')).toHaveTextContent(
      'expanded',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Collapse' }));
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(canvas.getByTestId('sidebar-collapsed')).toHaveTextContent(
      'true',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Expand' }));
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
    await expect(canvas.getByTestId('sidebar-collapsed')).toHaveTextContent(
      'false',
    );
  },
};
