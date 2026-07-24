import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

interface TestDropdownMenuProps {
  onFirstSelect?: () => void;
  onSecondSelect?: () => void;
}

function TestDropdownMenu({
  onFirstSelect = vi.fn(),
  onSecondSelect = vi.fn(),
}: TestDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Label text</DropdownMenuGroupLabel>
            <DropdownMenuItem onClick={onFirstSelect}>
              Item one
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSecondSelect}>
              Item two
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('opens via the trigger and reflects open state', async () => {
    const user = userEvent.setup();
    render(<TestDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-popup-open', '');
  });

  it('selects an item and closes the menu', async () => {
    const onFirstSelect = vi.fn();
    const onSecondSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <TestDropdownMenu
        onFirstSelect={onFirstSelect}
        onSecondSelect={onSecondSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Item two' }));

    expect(onSecondSelect).toHaveBeenCalledOnce();
    expect(onFirstSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('supports arrow-key navigation', async () => {
    const user = userEvent.setup();
    render(<TestDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('menu');

    await user.keyboard('{ArrowDown}');
    const firstItem = screen.getByRole('menuitem', { name: 'Item one' });
    expect(firstItem).toHaveAttribute('data-highlighted', '');

    await user.keyboard('{ArrowDown}');
    const secondItem = screen.getByRole('menuitem', { name: 'Item two' });
    expect(secondItem).toHaveAttribute('data-highlighted', '');
  });

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<TestDropdownMenu />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the menu', async () => {
    const user = userEvent.setup();
    render(<TestDropdownMenu />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('exposes stable data hooks on content and item variants', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem variant="destructive">
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    const menu = await screen.findByRole('menu');
    const item = screen.getByRole('menuitem', { name: 'Delete project' });

    expect(menu).toHaveAttribute('data-slot', 'dropdown-menu-content');
    expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item');
    expect(item).toHaveAttribute('data-variant', 'destructive');
    expect(item).toHaveClass('text-destructive-foreground');
  });

  it('supports a ghost trigger with an optional expand icon', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger showExpandIcon variant="ghost">
          Actions
        </DropdownMenuTrigger>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    const icon = trigger.querySelector(
      '[data-slot="dropdown-menu-trigger-icon"]',
    );

    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    expect(trigger).toHaveClass('hover:bg-accent');
    expect(icon).toBeInTheDocument();
  });
});
