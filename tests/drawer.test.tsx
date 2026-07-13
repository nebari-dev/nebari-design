import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  DrawerTitle,
  DrawerTrigger,
} from '@/ui/drawer';

function TestDrawer({
  onOpenChange,
  showCloseButton = true,
  showSwipeHandle,
  side = 'right',
}: {
  onOpenChange?: DrawerProps['onOpenChange'];
  showCloseButton?: boolean;
  showSwipeHandle?: DrawerProps['showSwipeHandle'];
  side?: DrawerProps['side'];
}) {
  return (
    <Drawer
      onOpenChange={onOpenChange}
      showSwipeHandle={showSwipeHandle}
      side={side}
    >
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent showCloseButton={showCloseButton}>
        <DrawerHeader>
          <div>
            <DrawerTitle>Workspace details</DrawerTitle>
            <DrawerDescription>team-data-science · Running</DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerBody>Drawer body</DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
          <Button>Save changes</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

describe('Drawer', () => {
  it('opens with stable data hooks and accessible title/description', async () => {
    const user = userEvent.setup();
    render(<TestDrawer />);

    const trigger = screen.getByRole('button', { name: 'Open drawer' });
    expect(trigger).toHaveAttribute('data-slot', 'drawer-trigger');

    await user.click(trigger);

    const drawer = await screen.findByRole('dialog', {
      name: 'Workspace details',
    });
    expect(drawer).toHaveAttribute('data-slot', 'drawer-content');
    expect(drawer).toHaveAttribute('data-side', 'right');
    expect(drawer).toHaveAccessibleDescription('team-data-science · Running');
    expect(drawer).toHaveClass(
      'bg-card',
      'shadow-lg',
      'data-[swipe-direction=right]:rounded-l-lg',
    );
    expect(drawer).not.toHaveClass('focus-visible:ring-2');
    expect(drawer).not.toHaveClass('focus-visible:ring-ring');
    expect(document.querySelector('[data-slot="drawer-overlay"]')).toHaveClass(
      'bg-scrim',
      'motion-safe:transition-[opacity]',
    );
    expect(document.querySelector('[data-slot="drawer-viewport"]')).toHaveClass(
      'fixed',
      'inset-0',
    );
  });

  it('closes from the default close button and reports state changes', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestDrawer onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog', {
      name: 'Workspace details',
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(drawer).not.toBeInTheDocument();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('can hide the default close button and close with a custom action', async () => {
    const user = userEvent.setup();
    render(<TestDrawer showCloseButton={false} />);

    await user.click(screen.getByRole('button', { name: 'Open drawer' }));
    expect(
      await screen.findByRole('dialog', { name: 'Workspace details' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Workspace details' }),
      ).not.toBeInTheDocument();
    });
  });

  it('renders bottom drawers with the swipe handle by default', async () => {
    const user = userEvent.setup();
    render(<TestDrawer side="bottom" />);

    await user.click(screen.getByRole('button', { name: 'Open drawer' }));

    const drawer = await screen.findByRole('dialog', {
      name: 'Workspace details',
    });
    expect(drawer).toHaveAttribute('data-side', 'bottom');
    expect(drawer).toHaveAttribute('data-swipe-axis', 'y');
    expect(drawer).toHaveClass(
      'data-[swipe-direction=down]:rounded-t-lg',
      'data-[swipe-axis=y]:w-full',
    );
    expect(drawer).not.toHaveClass('data-[swipe-axis=y]:max-w-[30rem]');
    expect(
      document.querySelector('[data-slot="drawer-swipe-handle"]'),
    ).toHaveClass('after:w-[100px]', 'after:bg-border-strong');
  });

  it('renders top drawers at the full screen width', async () => {
    const user = userEvent.setup();
    render(<TestDrawer side="top" />);

    await user.click(screen.getByRole('button', { name: 'Open drawer' }));

    const drawer = await screen.findByRole('dialog', {
      name: 'Workspace details',
    });
    expect(drawer).toHaveAttribute('data-side', 'top');
    expect(drawer).toHaveAttribute('data-swipe-axis', 'y');
    expect(drawer).toHaveClass(
      'data-[swipe-direction=up]:rounded-b-lg',
      'data-[swipe-axis=y]:w-full',
    );
    expect(drawer).not.toHaveClass('data-[swipe-axis=y]:max-w-[30rem]');
  });

  it('exposes composition hooks for header, body, footer, and close actions', async () => {
    const user = userEvent.setup();
    render(<TestDrawer showSwipeHandle />);

    await user.click(screen.getByRole('button', { name: 'Open drawer' }));

    expect(document.querySelector('[data-slot="drawer-header"]')).toHaveClass(
      'border-b',
      'p-4',
    );
    expect(document.querySelector('[data-slot="drawer-body"]')).toHaveClass(
      'overflow-y-auto',
      'p-4',
    );
    expect(document.querySelector('[data-slot="drawer-footer"]')).toHaveClass(
      'bg-muted',
      'justify-end',
    );
    expect(document.querySelector('[data-slot="drawer-title"]')).toHaveClass(
      'text-base',
      'font-semibold',
      'leading-5',
      'tracking-normal',
    );
    expect(
      document.querySelector('[data-slot="drawer-description"]'),
    ).toHaveClass('text-sm', 'font-normal', 'leading-5', 'tracking-normal');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'data-slot',
      'drawer-close',
    );
  });

  it('traps keyboard focus and restores focus after Escape', async () => {
    const user = userEvent.setup();
    render(<TestDrawer />);

    const trigger = screen.getByRole('button', { name: 'Open drawer' });
    trigger.focus();
    await user.keyboard('{Enter}');

    const drawer = await screen.findByRole('dialog', {
      name: 'Workspace details',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });
    expect(drawer).toContainElement(document.activeElement as HTMLElement);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(drawer).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Workspace details' }),
      ).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});
