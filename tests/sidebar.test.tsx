import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/ui/sidebar';

describe('Sidebar', () => {
  it('toggles between expanded and collapsed states with the trigger', () => {
    render(<SidebarHarness />);

    const sidebar = screen.getByTestId('sidebar-root');
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' });

    expect(sidebar).toHaveAttribute('data-state', 'expanded');
    fireEvent.click(trigger);
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    expect(trigger).toHaveAttribute('aria-label', 'Expand sidebar');
  });

  it('surfaces active menu state through data-active attributes', () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="sidebar-root">
          <SidebarMenu>
            <SidebarMenuItem active>
              <SidebarMenuButton active>Dashboard</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    const item = screen.getByRole('listitem');
    const button = screen.getByRole('button', { name: 'Dashboard' });

    expect(item).toHaveAttribute('data-active', 'true');
    expect(button).toHaveAttribute('data-active', 'true');
  });

  it('supports keyboard activation for trigger and menu buttons', () => {
    const onActivate = vi.fn();

    render(<SidebarHarness onActivate={onActivate} />);

    const sidebar = screen.getByTestId('sidebar-root');
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' });
    const menuButton = screen.getByRole('button', { name: 'Projects' });

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    fireEvent.keyDown(menuButton, { key: ' ' });
    expect(onActivate).toHaveBeenCalledOnce();
  });
});

function SidebarHarness({ onActivate }: { onActivate?: () => void } = {}) {
  return (
    <SidebarProvider>
      <Sidebar data-testid="sidebar-root">
        <SidebarTrigger />
        <SidebarContent />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onActivate}>Projects</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
    </SidebarProvider>
  );
}
