// biome-ignore-all lint/a11y/noNoninteractiveTabindex: dialog scroll containers need keyboard access.
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
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

// Storybook args serialize as strings, so `boolean | 'trap-focus'` is keyed by string.
const MODAL_BY_KEY = {
  true: true,
  false: false,
  'trap-focus': 'trap-focus',
} as const;

type DialogStoryArgs = ComponentProps<typeof DialogContent> &
  Pick<
    ComponentProps<typeof Dialog>,
    'defaultOpen' | 'disablePointerDismissal' | 'open'
  > & {
    modal: keyof typeof MODAL_BY_KEY;
  };

/**
 * Applies the knobs that live on `Dialog` (the root) rather than on
 * `DialogContent`, so every story keeps them live off a plain `{...args}`.
 */
function DialogRoot({
  children,
  defaultOpen,
  disablePointerDismissal,
  modal,
  open,
}: DialogStoryArgs & { children: ReactNode }) {
  return (
    <Dialog
      defaultOpen={defaultOpen}
      disablePointerDismissal={disablePointerDismissal}
      modal={MODAL_BY_KEY[modal]}
      open={open}
    >
      {children}
    </Dialog>
  );
}

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
  args: {
    defaultOpen: false,
    disablePointerDismissal: false,
    modal: 'true',
    showCloseButton: true,
  },
  argTypes: {
    showCloseButton: {
      description:
        'Renders the default top-right close icon button inside the content surface.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    defaultOpen: {
      description:
        'Set on `Dialog` (the root), not on `DialogContent` — opens the dialog on mount for an uncontrolled dialog.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      description:
        'Controlled open state, set on `Dialog`. Pair it with `onOpenChange`; left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    modal: {
      description:
        'Set on `Dialog`. `true` traps focus and locks page scroll. `false` and `trap-focus` differ only in keyboard focus containment — `DialogContent` always renders a full-screen backdrop, so the page behind is never pointer-interactive regardless. Outside-press dismissal is governed by `disablePointerDismissal`.',
      control: 'select',
      options: ['true', 'false', 'trap-focus'],
      table: {
        type: { summary: "boolean | 'trap-focus'" },
        defaultValue: { summary: 'true' },
      },
    },
    disablePointerDismissal: {
      description:
        'Set on `Dialog`. Prevents the dialog from closing on an outside press — Escape and explicit closes still work.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
    children: {
      description:
        'Composed content — `DialogHeader` (with `DialogTitle` and `DialogDescription`), the body, and `DialogFooter` with `DialogClose` actions.',
      control: false,
    },
    render: {
      description:
        'Base UI render-prop composition. Swap the dialog content element while preserving its behavior, styling, and slot attributes.',
      control: false,
    },
    portalProps: { table: { disable: true } },
    viewportClassName: { table: { disable: true } },
    overlayClassName: { table: { disable: true } },
  },
  decorators: [
    // `defaultOpen` is mount-only, so the key forces a remount when it changes.
    (Story, { args }) => <Story key={String(args.defaultOpen)} />,
  ],
} satisfies Meta<DialogStoryArgs>;

export default meta;

type Story = StoryObj<DialogStoryArgs>;

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

function ShareWorkspaceDialog(args: DialogStoryArgs) {
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
    <DialogRoot {...args}>
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
    </DialogRoot>
  );
}

export const Default: Story = {
  render: (args) => (
    <DialogRoot {...args}>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
      <DialogContent showCloseButton={args.showCloseButton}>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            environment and remove its data from the workspace.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </DialogRoot>
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
  parameters: { controls: { include: [] } },
  render: (args) => (
    <DialogRoot {...args}>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
      <DialogContent showCloseButton={args.showCloseButton}>
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
    </DialogRoot>
  ),
};

export const DeleteConfirmation: Story = {
  parameters: { controls: { include: [] } },
  render: (args) => (
    <DialogRoot {...args}>
      <DialogTrigger render={<Button variant="destructive" />}>
        Delete Environment
      </DialogTrigger>
      <DialogContent showCloseButton={args.showCloseButton}>
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
    </DialogRoot>
  ),
};

export const CustomCloseButton: Story = {
  parameters: {
    controls: {
      include: [],
    },
  },
  render: (args) => <ShareWorkspaceDialog {...args} />,
};

export const StickyFooter: Story = {
  parameters: { controls: { include: [] } },
  render: (args) => (
    <DialogRoot {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        Sticky Footer
      </DialogTrigger>
      <DialogContent
        className="grid h-[min(calc(100vh-2rem),28rem)] grid-rows-[auto,minmax(0,1fr),auto] gap-0 p-0"
        showCloseButton={args.showCloseButton}
      >
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
    </DialogRoot>
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
  parameters: { controls: { include: [] } },
  render: (args) => (
    <DialogRoot {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        Scrollable Content
      </DialogTrigger>
      <DialogContent
        className="grid h-[min(calc(100vh-2rem),32rem)] grid-rows-[auto,minmax(0,1fr)]"
        showCloseButton={args.showCloseButton}
      >
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
    </DialogRoot>
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
