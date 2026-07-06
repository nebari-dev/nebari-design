import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';

function TestDialog({
  onOpenChange,
  showCloseButton,
}: {
  onOpenChange?: React.ComponentProps<typeof Dialog>['onOpenChange'];
  showCloseButton?: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Send an invitation to join this Nebari workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('opens with stable data hooks and accessible title/description', async () => {
    const user = userEvent.setup();
    render(<TestDialog />);

    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');

    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Invite user' });
    expect(dialog).toHaveAttribute('data-slot', 'dialog-content');
    expect(dialog).toHaveAccessibleDescription(
      'Send an invitation to join this Nebari workspace.',
    );
    expect(screen.getByText('Invite user')).toHaveAttribute(
      'data-slot',
      'dialog-title',
    );
    expect(screen.getByText(/Send an invitation/)).toHaveAttribute(
      'data-slot',
      'dialog-description',
    );
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass(
      'bg-scrim',
      'motion-safe:transition-[opacity]',
    );
    expect(document.querySelector('[data-slot="dialog-viewport"]')).toHaveClass(
      'fixed',
      'p-4',
    );
    expect(dialog).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
    );
  });

  it('closes from the default close button and reports state changes', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<TestDialog onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    const dialog = await screen.findByRole('dialog', { name: 'Invite user' });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('can hide the default close button and close with a custom action', async () => {
    const user = userEvent.setup();
    render(<TestDialog showCloseButton={false} />);

    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    expect(
      await screen.findByRole('dialog', { name: 'Invite user' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Invite user' }),
      ).not.toBeInTheDocument();
    });
  });

  it('exposes header, footer, and close composition hooks', async () => {
    const user = userEvent.setup();
    render(<TestDialog />);

    await user.click(screen.getByRole('button', { name: 'Open dialog' }));

    expect(document.querySelector('[data-slot="dialog-header"]')).toHaveClass(
      'grid',
      'gap-1.5',
    );
    expect(document.querySelector('[data-slot="dialog-footer"]')).toHaveClass(
      'flex',
      'sm:justify-end',
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'data-slot',
      'dialog-close',
    );
  });

  it('traps keyboard focus and restores focus after Escape', async () => {
    const user = userEvent.setup();
    render(<TestDialog />);

    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    await user.keyboard('{Enter}');

    const dialog = await screen.findByRole('dialog', { name: 'Invite user' });

    await user.tab();
    expect(screen.getByRole('button', { name: 'Send invite' })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Invite user' }),
      ).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});
