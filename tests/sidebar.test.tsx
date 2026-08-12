import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
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

function SidebarHarness({
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
}: {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
} = {}) {
  return (
    <SidebarProvider
      collapsed={collapsed}
      defaultCollapsed={defaultCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <Sidebar data-testid="sidebar-root" variant="inset">
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active tooltip="Design">
                  <SidebarMenuLabel>Design</SidebarMenuLabel>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton size="sm">Tokens</SidebarMenuButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuDescription>ada@example.com</SidebarMenuDescription>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

describe('Sidebar', () => {
  it('toggles between expanded and collapsed with the trigger', async () => {
    render(<SidebarHarness />);

    const sidebar = screen.getByTestId('sidebar-root');
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' });

    expect(sidebar).toHaveAttribute('data-state', 'expanded');
    expect(sidebar).toHaveAttribute('data-variant', 'inset');

    await userEvent.click(trigger);

    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts collapsed when the provider is given defaultCollapsed', () => {
    render(<SidebarHarness defaultCollapsed />);

    expect(screen.getByTestId('sidebar-root')).toHaveAttribute(
      'data-state',
      'collapsed',
    );
  });

  it('stays controlled and reports changes instead of self-updating', async () => {
    const onCollapsedChange = vi.fn();

    render(<SidebarHarness collapsed onCollapsedChange={onCollapsedChange} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    );

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('sidebar-root')).toHaveAttribute(
      'data-state',
      'collapsed',
    );
  });

  it('reflects variant, size, and active state as data attributes', () => {
    render(
      <SidebarMenuButton active size="account" variant="ghost">
        Account
      </SidebarMenuButton>,
    );

    const button = screen.getByRole('button', { name: 'Account' });

    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'account');
    expect(button).toHaveAttribute('data-active', 'true');
    expect(button).toHaveClass('data-[active=true]:font-semibold');
  });

  it('shows menu button tooltips only while collapsed', async () => {
    const user = userEvent.setup();
    render(<SidebarHarness defaultCollapsed />);

    const button = screen.getByRole('button', { name: 'Design' });
    expect(button).toHaveAttribute('data-slot', 'sidebar-menu-button');

    await user.hover(button);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Design');
  });

  it('falls back to the default variant and size', () => {
    render(<SidebarMenuButton>Plain</SidebarMenuButton>);

    const button = screen.getByRole('button', { name: 'Plain' });

    expect(button).toHaveAttribute('data-variant', 'default');
    expect(button).toHaveAttribute('data-size', 'default');
    expect(button).not.toHaveAttribute('data-active');
  });

  it('composes the menu button with the render prop', () => {
    render(
      <SidebarMenuButton render={<a href="/projects" />}>
        Projects
      </SidebarMenuButton>,
    );

    const link = screen.getByRole('link', { name: 'Projects' });

    expect(link).toHaveAttribute('href', '/projects');
    expect(link).toHaveAttribute('data-slot', 'sidebar-menu-button');
  });

  it('renders as a dropdown menu trigger keeping its own slot and styling', async () => {
    render(
      <DropdownMenu>
        <SidebarMenuButton
          render={
            <DropdownMenuTrigger
              render={<button type="button" />}
              variant="ghost"
            />
          }
          size="account"
        >
          Ada Lovelace
        </SidebarMenuButton>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Ada Lovelace' });

    expect(trigger).toHaveAttribute('data-slot', 'sidebar-menu-button');
    expect(trigger).toHaveAttribute('data-size', 'account');
    expect(trigger).toHaveClass('rounded-lg');

    await userEvent.click(trigger);

    expect(
      await screen.findByRole('menuitem', { name: 'Sign out' }),
    ).toBeInTheDocument();
  });

  it('lets a consumer onClick suppress the trigger toggle', async () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="sidebar-root">
          <SidebarTrigger
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              event.preventDefault()
            }
          />
        </Sidebar>
      </SidebarProvider>,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse sidebar' }),
    );

    expect(screen.getByTestId('sidebar-root')).toHaveAttribute(
      'data-state',
      'expanded',
    );
  });
});
