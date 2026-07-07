import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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
  type DrawerSide,
  DrawerTitle,
  DrawerTrigger,
} from '@/ui/drawer';

type DrawerStoryArgs = Pick<DrawerProps, 'showSwipeHandle'> & {
  showCloseButton: boolean;
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
      control: 'boolean',
      description:
        'Shows the grab handle. Defaults to true for bottom drawers and false for side drawers.',
      table: { defaultValue: { summary: 'auto' } },
    },
  },
} satisfies Meta<DrawerStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

function drawerProps({
  showSwipeHandle,
  side,
}: Pick<DrawerStoryArgs, 'showSwipeHandle' | 'side'>) {
  return {
    side,
    ...(showSwipeHandle === undefined ? {} : { showSwipeHandle }),
  };
}

function PlaceholderBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-48 flex-1 items-center justify-center rounded-lg bg-muted p-4 text-center text-muted-foreground-strong text-sm leading-5">
      {children}
    </div>
  );
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
    await expect(drawer).toBeVisible();
  },
};

export const BottomSheet: Story = {
  name: 'Bottom sheet',
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

export const NestedDrawer: Story = {
  name: 'Multi nested drawer',
  render: () => (
    <Drawer side="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        Environment settings
      </DrawerTrigger>
      <DrawerContent>
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
            <Drawer side="right">
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
                    <Drawer side="right">
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
    await expect(
      await page.findByRole('dialog', { name: 'Environment settings' }),
    ).toBeVisible();

    await userEvent.click(
      page.getByRole('button', { name: 'Advanced settings' }),
    );
    await expect(
      await page.findByRole('dialog', { name: 'Advanced settings' }),
    ).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Rebuild policy' }));
    await expect(
      await page.findByRole('dialog', { name: 'Rebuild policy' }),
    ).toBeVisible();
  },
};
