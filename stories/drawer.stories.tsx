import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  type DrawerSide,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

// `auto` keeps the per-side default (shown for bottom) reachable from the knob.
const SWIPE_HANDLE_BY_KEY = {
  auto: undefined,
  shown: true,
  hidden: false,
} as const;

type DrawerStoryArgs = {
  showCloseButton: boolean;
  showSwipeHandle: keyof typeof SWIPE_HANDLE_BY_KEY;
  side: DrawerSide;
};

const meta = {
  title: 'Components/Drawer',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An edge-anchored panel for secondary tasks, contextual detail, and short forms. Built on Base UI Drawer and styled with Nebari semantic tokens.',
      },
    },
  },
  args: {
    showCloseButton: true,
    showSwipeHandle: 'auto',
    side: 'right',
  },
  argTypes: {
    side: {
      control: 'select',
      description:
        'Visual edge the drawer opens from. Right and bottom match the Nebari design variants.',
      options: ['right', 'bottom', 'left', 'top'],
      table: { defaultValue: { summary: 'right' } },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Renders the default top-right close button.',
      table: { defaultValue: { summary: 'true' } },
    },
    showSwipeHandle: {
      control: 'select',
      description:
        'Shows the grab handle. `auto` leaves it to the drawer — shown for bottom drawers, hidden for side drawers.',
      options: ['auto', 'shown', 'hidden'],
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'auto' },
      },
    },
  },
} satisfies Meta<DrawerStoryArgs>;

export default meta;

type Story = StoryObj<DrawerStoryArgs>;

const LONG_CONTENT_SECTIONS = [
  [
    'Runtime',
    'Python 3.12 with shared CUDA libraries and team-managed package mirrors.',
  ],
  [
    'Resource profile',
    '4 CPU cores, 16 GiB memory, and access to the shared workspace volume.',
  ],
  [
    'Network access',
    'Outbound package installation is restricted to approved repositories.',
  ],
  [
    'Collaboration',
    'Owners can invite maintainers, reviewers, and temporary project guests.',
  ],
  [
    'Data policy',
    'Workspace exports are logged and retained according to project settings.',
  ],
  ['Backups', 'Snapshots run every 6 hours and are retained for 14 days.'],
  [
    'Idle shutdown',
    'Inactive sessions pause after 4 hours and can be resumed from history.',
  ],
  [
    'Rebuild policy',
    'Base image updates require an owner approval before scheduled rebuilds.',
  ],
  [
    'Audit trail',
    'Configuration changes are attributed to the actor and linked request.',
  ],
  [
    'Secrets',
    'Environment variables are injected at runtime and hidden from logs.',
  ],
  [
    'Storage',
    'Project data is mounted read-write, with archive storage mounted read-only.',
  ],
  [
    'Notifications',
    'Owners receive email updates when policy checks require action.',
  ],
];

function drawerProps({
  showSwipeHandle = 'auto',
  side = 'right',
}: Partial<Pick<DrawerStoryArgs, 'showSwipeHandle' | 'side'>>) {
  const resolved = SWIPE_HANDLE_BY_KEY[showSwipeHandle];

  return {
    side,
    ...(resolved === undefined ? {} : { showSwipeHandle: resolved }),
  };
}

function PlaceholderBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-48 flex-1 items-center justify-center rounded-lg bg-muted p-4 text-center text-muted-foreground-strong text-sm leading-5">
      {children}
    </div>
  );
}

async function expectDrawerOpen(drawer: HTMLElement) {
  await waitFor(
    () =>
      expect(drawer).toHaveStyle({
        opacity: '1',
      }),
    { timeout: 1000 },
  );
  await expect(drawer).toBeVisible();
}

function DrawerExample({
  action = 'Save changes',
  description = 'A short description of what this panel contains.',
  showCloseButton = true,
  showSwipeHandle,
  side = 'right',
  title = 'Panel title',
}: Partial<DrawerStoryArgs> & {
  action?: string;
  description?: string;
  title?: string;
}) {
  return (
    <Drawer {...drawerProps({ showSwipeHandle, side })}>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer
      </DrawerTrigger>
      <DrawerContent showCloseButton={showCloseButton}>
        <DrawerHeader>
          <div className="min-w-0 flex-1">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerBody>
          <PlaceholderBody>Add your content here.</PlaceholderBody>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
          <Button>{action}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export const Default: Story = {
  render: (args) => <DrawerExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Open Drawer' }));

    const drawer = await page.findByRole('dialog', { name: 'Panel title' });
    await expectDrawerOpen(drawer);
    await expect(drawer).toHaveStyle({
      transitionDuration: '0.35s',
      transitionProperty: 'opacity, transform',
    });

    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(drawer).toHaveAttribute('data-ending-style'));
    await expect(drawer).toHaveStyle({ transitionDuration: '0.35s' });
    await waitFor(
      () =>
        expect(
          page.queryByRole('dialog', { name: 'Panel title' }),
        ).not.toBeInTheDocument(),
      { timeout: 1000 },
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Open Drawer' }));
    await expectDrawerOpen(
      await page.findByRole('dialog', { name: 'Panel title' }),
    );
  },
};

export const BottomSheet: Story = {
  name: 'Bottom sheet',
  parameters: { controls: { include: [] } },
  args: {
    side: 'bottom',
  },
  render: (args) => (
    <DrawerExample
      {...args}
      action="Apply"
      description="A bottom sheet with a grab handle for mobile or touch contexts."
      title="Filter results"
    />
  ),
};

export const LongContent: Story = {
  name: 'Long content',
  parameters: { controls: { include: [] } },
  render: ({ showCloseButton, showSwipeHandle, side }) => (
    <Drawer {...drawerProps({ showSwipeHandle, side })}>
      <DrawerTrigger render={<Button variant="outline" />}>
        Review workspace
      </DrawerTrigger>
      <DrawerContent
        className="h-dvh max-h-dvh"
        showCloseButton={showCloseButton}
      >
        <DrawerHeader>
          <div className="min-w-0 flex-1">
            <DrawerTitle>Workspace review</DrawerTitle>
            <DrawerDescription>
              Confirm runtime, access, and policy details
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerBody
          aria-label="Workspace review details"
          className="gap-3"
          tabIndex={0}
        >
          <div className="flex min-h-full flex-col gap-3">
            {LONG_CONTENT_SECTIONS.map(([title, description]) => (
              <section
                className="rounded-md border border-border bg-background p-3"
                key={title}
              >
                <h3 className="font-medium text-foreground text-sm leading-5">
                  {title}
                </h3>
                <p className="mt-1 text-muted-foreground text-sm leading-5">
                  {description}
                </p>
              </section>
            ))}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
          <Button>Approve</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Review workspace' }),
    );

    const drawer = await page.findByRole('dialog', {
      name: 'Workspace review',
    });
    await expectDrawerOpen(drawer);
    await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  },
};

export const NestedDrawer: Story = {
  name: 'Multi nested drawer',
  parameters: { controls: { include: [] } },
  render: ({ showCloseButton, showSwipeHandle, side }) => (
    <Drawer {...drawerProps({ showSwipeHandle, side })}>
      <DrawerTrigger render={<Button variant="outline" />}>
        Environment settings
      </DrawerTrigger>
      <DrawerContent showCloseButton={showCloseButton}>
        <DrawerHeader>
          <div className="min-w-0 flex-1">
            <DrawerTitle>Environment settings</DrawerTitle>
            <DrawerDescription>team-data-science</DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerBody>
          <div className="grid gap-3">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="font-medium text-foreground">Profile</div>
              <div className="text-muted-foreground">
                Runtime, owner, and workspace visibility.
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="font-medium text-foreground">Sharing</div>
              <div className="text-muted-foreground">
                Collaborator access and invitation settings.
              </div>
            </div>
            <Drawer {...drawerProps({ showSwipeHandle, side })}>
              <DrawerTrigger render={<Button variant="outline" />}>
                Advanced settings
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <div className="min-w-0 flex-1">
                    <DrawerTitle>Advanced settings</DrawerTitle>
                    <DrawerDescription>
                      Kernel, image, and rebuild controls
                    </DrawerDescription>
                  </div>
                </DrawerHeader>
                <DrawerBody>
                  <div className="grid gap-3">
                    {[
                      ['Base image', 'quay.io/nebari/scipy-notebook:latest'],
                      ['Idle timeout', '4 hours'],
                      ['GPU support', 'Disabled'],
                    ].map(([label, value]) => (
                      <div
                        className="rounded-lg bg-muted p-3 text-sm"
                        key={label}
                      >
                        <div className="text-muted-foreground">{label}</div>
                        <div className="font-medium text-foreground">
                          {value}
                        </div>
                      </div>
                    ))}
                    <Drawer {...drawerProps({ showSwipeHandle, side })}>
                      <DrawerTrigger render={<Button variant="outline" />}>
                        Rebuild policy
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <div className="min-w-0 flex-1">
                            <DrawerTitle>Rebuild policy</DrawerTitle>
                            <DrawerDescription>
                              Schedule and resource limits
                            </DrawerDescription>
                          </div>
                        </DrawerHeader>
                        <DrawerBody>
                          <div className="grid gap-3">
                            {[
                              ['Schedule', 'Weekly on Monday'],
                              ['Max runtime', '90 minutes'],
                              ['Failure action', 'Notify owner'],
                            ].map(([label, value]) => (
                              <div
                                className="rounded-lg bg-muted p-3 text-sm"
                                key={label}
                              >
                                <div className="text-muted-foreground">
                                  {label}
                                </div>
                                <div className="font-medium text-foreground">
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DrawerBody>
                        <DrawerFooter>
                          <DrawerClose render={<Button variant="outline" />}>
                            Back
                          </DrawerClose>
                          <Button>Save policy</Button>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose render={<Button variant="outline" />}>
                    Back
                  </DrawerClose>
                  <Button>Save advanced</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
          <Button>Save settings</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Environment settings' }),
    );
    await expectDrawerOpen(
      await page.findByRole('dialog', { name: 'Environment settings' }),
    );

    await userEvent.click(
      page.getByRole('button', { name: 'Advanced settings' }),
    );
    await expectDrawerOpen(
      await page.findByRole('dialog', { name: 'Advanced settings' }),
    );

    await userEvent.click(page.getByRole('button', { name: 'Rebuild policy' }));
    await expectDrawerOpen(
      await page.findByRole('dialog', { name: 'Rebuild policy' }),
    );
  },
};
