// biome-ignore-all lint/a11y/noNoninteractiveTabindex: dialog scroll containers need keyboard access.
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

const meta = {
  title: 'Components/Dialog',
  component: DialogContent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modal window overlaid on the page. Built on Base UI Dialog and styled with Nebari semantic tokens.',
      },
    },
  },
} satisfies Meta<typeof DialogContent>;

export default meta;

type Story = StoryObj<typeof meta>;

const workspaceShareUrl = 'https://nebari.example/workspaces/analytics';

const activityItems = Array.from({ length: 24 }, (_, index) => ({
  id: `activity-${index + 1}`,
  label: `Activity item ${index + 1}`,
}));

const packageUpdates = [
  'python 3.12.5',
  'jupyterlab 4.2.4',
  'pytorch 2.5.0',
  'numpy 2.1.1',
  'pandas 2.2.3',
  'matplotlib 3.9.2',
  'scikit-learn 1.5.2',
  'scipy 1.14.1',
  'xarray 2024.9.0',
  'dask 2024.9.1',
  'bokeh 3.6.0',
  'pyarrow 17.0.0',
];

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.readOnly = true;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error('Unable to copy text to clipboard.');
  }
}

function ShareWorkspaceDialog() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );

  async function handleCopy() {
    try {
      await copyToClipboard(workspaceShareUrl);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Share</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Share workspace</DialogTitle>
          <DialogDescription>
            Copy the workspace invitation link and send it to collaborators.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border bg-background p-3 font-mono text-sm">
          {workspaceShareUrl}
        </div>
        <div
          aria-live="polite"
          className="min-h-5 text-muted-foreground text-sm"
          id="share-copy-status"
          role="status"
        >
          {copyState === 'copied' && 'Link copied to clipboard.'}
          {copyState === 'failed' && 'Copy failed. Select the link to copy it.'}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          <Button aria-describedby="share-copy-status" onClick={handleCopy}>
            {copyState === 'copied' ? 'Copied' : 'Copy link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            environment and remove its data from the workspace.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));

    const dialog = await page.findByRole('dialog', {
      name: 'Are you absolutely sure?',
    });
    await expect(dialog).toBeVisible();
  },
};

export const GenericDialog: Story = {
  name: 'Generic Dialog',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>
            Dialog description text provides additional context about the action
            the user is about to take.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <DialogClose render={<Button />}>Confirm</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DeleteConfirmation: Story = {
  name: 'Delete Confirmation',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        Delete Environment
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete environment?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The environment and its associated
            files will be permanently removed from this workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <DialogClose render={<Button variant="destructive" />}>
            Delete
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const CustomCloseButton: Story = {
  name: 'Custom Close Button',
  render: () => <ShareWorkspaceDialog />,
};

export const StickyFooter: Story = {
  name: 'Sticky Footer',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Sticky Footer
      </DialogTrigger>
      <DialogContent className="grid h-[min(calc(100vh-2rem),28rem)] grid-rows-[auto,minmax(0,1fr),auto] gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pr-14 pb-4">
          <DialogTitle>Review environment changes</DialogTitle>
          <DialogDescription>
            Confirm the package updates before rebuilding the image.
          </DialogDescription>
        </DialogHeader>
        <section
          aria-label="Package updates"
          className="min-h-0 overflow-y-auto px-6 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          tabIndex={0}
        >
          {packageUpdates.map((pkg) => (
            <div
              className="flex items-center justify-between border-border border-b py-3 last:border-b-0"
              key={pkg}
            >
              <span>{pkg}</span>
              <span className="text-muted-foreground">Updated</span>
            </div>
          ))}
        </section>
        <DialogFooter className="border-border border-t bg-popover px-6 py-4">
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button>Rebuild image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Sticky Footer' }),
    );

    const updates = await page.findByRole('region', {
      name: 'Package updates',
    });
    await expect(updates.scrollHeight).toBeGreaterThan(updates.clientHeight);

    updates.scrollTop = 80;
    await expect(updates.scrollTop).toBeGreaterThan(0);
  },
};

export const ScrollableContent: Story = {
  name: 'Scrollable Content',
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Scrollable Content
      </DialogTrigger>
      <DialogContent className="grid h-[min(calc(100vh-2rem),32rem)] grid-rows-[auto,minmax(0,1fr)]">
        <DialogHeader>
          <DialogTitle>Workspace activity</DialogTitle>
          <DialogDescription>
            Long dialog content scrolls while the modal remains centered.
          </DialogDescription>
        </DialogHeader>
        <section
          aria-label="Workspace activity log"
          className="min-h-0 overflow-y-auto pr-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          tabIndex={0}
        >
          {activityItems.map((item) => (
            <p key={item.id}>
              {item.label}: a workspace event was recorded for the active Nebari
              deployment and is available in the audit log.
            </p>
          ))}
        </section>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Scrollable Content' }),
    );

    const activityLog = await page.findByRole('region', {
      name: 'Workspace activity log',
    });
    await expect(activityLog.scrollHeight).toBeGreaterThan(
      activityLog.clientHeight,
    );

    activityLog.scrollTop = 80;
    await expect(activityLog.scrollTop).toBeGreaterThan(0);
  },
};
