import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@/ui/button';
import {
  createToastManager,
  Toaster,
  type ToasterProps,
  type ToastType,
} from '@/ui/toast';

/**
 * `auto` leaves `priority` unset on the manager item so `Toaster` derives it
 * from the status type — assertive for `warning` and `error`, polite otherwise.
 * Without this option the knob would be a one-way door out of that default.
 */
const PRIORITY_BY_KEY = {
  auto: undefined,
  low: 'low',
  high: 'high',
} as const;

type ToastStoryArgs = ToasterProps & {
  actionLabel: string;
  description: string;
  limit: number;
  priority: keyof typeof PRIORITY_BY_KEY;
  showAction: boolean;
  showClose: boolean;
  showDescription: boolean;
  showIcon: boolean;
  timeout: number;
  title: string;
  type: ToastType;
};

const meta = {
  title: 'Components/Toast',
  component: Toaster,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A transient notification implemented from the Nebari Figma `Toast` variant set with Base UI. Mount `Toaster` once, then call `toast.add`, `toast.update`, or `toast.promise`. The neutral popover surface keeps its copy readable while the icon communicates default, success, warning, error, info, or loading status. `warning` and `error` are announced assertively; the calmer statuses go through the viewport’s polite live region. Press `F6` to move focus onto the viewport, `Tab` to reach the frontmost toast, then `Escape` to dismiss it.',
      },
    },
  },
  args: {
    actionLabel: 'Undo',
    description: 'Toast description goes here.',
    limit: 5,
    priority: 'auto',
    showAction: false,
    showClose: true,
    showDescription: true,
    showIcon: true,
    timeout: 5000,
    title: 'Toast title',
    type: 'default',
  },
  argTypes: {
    title: {
      description: 'Story-only toggle. Concise heading passed to `toast.add`.',
      control: 'text',
      table: { defaultValue: { summary: 'Toast title' } },
    },
    description: {
      description:
        'Story-only toggle. Supporting copy passed to `toast.add` when `showDescription` is enabled.',
      control: 'text',
      table: { defaultValue: { summary: 'Toast description goes here.' } },
    },
    type: {
      description:
        'Story-only toggle. Status icon treatment passed to `toast.add`; the toast surface remains neutral.',
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info', 'loading'],
      table: { defaultValue: { summary: 'default' } },
    },
    priority: {
      description:
        'Story-only toggle. Announcement priority of the manager item. `auto` lets `Toaster` derive it from the status type — `high` (assertive) for `warning` and `error`, `low` (polite) otherwise — and the explicit values override that.',
      control: 'select',
      options: ['auto', 'low', 'high'],
      table: { defaultValue: { summary: 'auto' } },
    },
    showAction: {
      description:
        'Story-only toggle. Adds the Figma action button through the manager item’s `actionProps`. Actionable toasts do not auto-dismiss and always retain the close control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    actionLabel: {
      description:
        'Story-only toggle. Label for the optional action button in the playground toast.',
      control: 'text',
      table: { defaultValue: { summary: 'Undo' } },
    },
    showClose: {
      description:
        'Story-only toggle. Maps to `data.dismissible`; disabling it hides the close control unless the toast has an action, which always retains a separate way to dismiss it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showDescription: {
      description:
        'Story-only toggle. Omits the description to demonstrate Figma’s title-only layout.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showIcon: {
      description:
        'Story-only toggle. Maps to `data.showIcon`; disabling it removes the leading status icon.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    timeout: {
      description:
        'Default auto-dismiss delay in milliseconds. Set to `0` to keep toasts open. Base UI keeps loading toasts open regardless; actionable toasts stay open unless their manager item supplies an explicit timeout.',
      control: { type: 'number', min: 0, step: 500 },
      table: { defaultValue: { summary: '5000' } },
    },
    limit: {
      description:
        'Maximum visible toast count. Nebari defaults to the Figma-specified stack cap of five.',
      control: { type: 'number', min: 1, max: 10, step: 1 },
      table: { defaultValue: { summary: '5' } },
    },
    toastManager: {
      description:
        'Optional isolated manager. Omit it to use the exported global `toast` manager.',
      control: false,
    },
    children: {
      description:
        'Application content rendered inside the toast provider, so anything below `Toaster` can call `useToastManager`.',
      control: false,
    },
    portalProps: { table: { disable: true } },
    viewportProps: { table: { disable: true } },
  },
} satisfies Meta<ToastStoryArgs>;

export default meta;

type Story = StoryObj<ToastStoryArgs>;

function ToastPlayground(args: ToastStoryArgs) {
  const manager = useMemo(() => createToastManager(), []);

  function showToast() {
    let id = '';
    id = manager.add({
      title: args.title,
      description: args.showDescription ? args.description : undefined,
      type: args.type === 'default' ? undefined : args.type,
      priority: PRIORITY_BY_KEY[args.priority],
      data: {
        dismissible: args.showClose,
        showIcon: args.showIcon,
      },
      actionProps: args.showAction
        ? {
            children: args.actionLabel,
            onClick: () => manager.close(id),
          }
        : undefined,
    });
  }

  return (
    <>
      <Button onClick={showToast}>Show toast</Button>
      <Toaster
        limit={args.limit}
        timeout={args.timeout}
        toastManager={manager}
      />
    </>
  );
}

/** Interactive playground for every Figma toast property. */
export const Default: Story = {
  render: (args) => <ToastPlayground {...args} />,
};

const TYPE_OPTIONS: readonly ToastType[] = [
  'default',
  'success',
  'warning',
  'error',
  'info',
  'loading',
];

function ToastTypesDemo() {
  const manager = useMemo(() => createToastManager(), []);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {TYPE_OPTIONS.map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() =>
              manager.add({
                title: `${type[0].toUpperCase()}${type.slice(1)} toast`,
                description: 'Toast description goes here.',
                type: type === 'default' ? undefined : type,
              })
            }
          >
            {type[0].toUpperCase()}
            {type.slice(1)}
          </Button>
        ))}
      </div>
      <Toaster limit={6} timeout={0} toastManager={manager} />
    </>
  );
}

/** All six Figma status treatments. */
export const Types: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Trigger the default, success, warning, error, info, and loading treatments. Status is carried by the icon and its semantic color; the popover surface stays neutral.',
      },
    },
  },
  render: (_args) => <ToastTypesDemo />,
};

function ActionDemo() {
  const manager = useMemo(() => createToastManager(), []);

  function showToast() {
    let id = '';
    id = manager.add({
      title: 'Deployment complete',
      description: 'nebari-prod is live.',
      type: 'success',
      actionProps: {
        children: 'View',
        onClick: () => manager.close(id),
      },
    });
  }

  return (
    <>
      <Button onClick={showToast}>Deploy</Button>
      <Toaster timeout={0} toastManager={manager} />
    </>
  );
}

/** Figma's success example, with an action the toast waits for. */
export const Action: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Pass button props through `actionProps`. This success toast uses the Figma “Deployment complete” example and closes when View is selected. A toast carrying an action never auto-dismisses and always keeps its close control, so the action can’t vanish before it is used.',
      },
    },
  },
  render: (_args) => <ActionDemo />,
};

function PromiseDemo() {
  const manager = useMemo(() => createToastManager(), []);

  function createEnvironment() {
    const request = new Promise<string>((resolve) => {
      window.setTimeout(() => resolve('nebari-prod'), 1000);
    });

    void manager.promise(request, {
      loading: {
        title: 'Building environment',
        description: 'This usually takes a minute.',
        type: 'loading',
        timeout: 0,
        data: { dismissible: false },
      },
      success: (environment) => ({
        title: 'Deployment complete',
        description: `${environment} is live.`,
        type: 'success',
      }),
      error: {
        title: 'Deployment failed',
        description: 'Please try again.',
        type: 'error',
      },
    });
  }

  return (
    <>
      <Button onClick={createEnvironment}>Create environment</Button>
      <Toaster toastManager={manager} />
    </>
  );
}

/** Loading-to-success updates through Base UI's promise manager. */
export const PromiseStates: Story = {
  name: 'Promise',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          '`toast.promise` updates one item in place. The initial loading toast is not dismissible and never auto-dismisses, matching the Figma example; the settled state takes over the same slot.',
      },
    },
  },
  render: (_args) => <PromiseDemo />,
};

function FigmaExamplesDemo() {
  const manager = useMemo(() => createToastManager(), []);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            manager.add({
              title: 'Copied to clipboard',
              data: { dismissible: true },
            })
          }
        >
          Title only
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            manager.add({
              title: 'Building environment',
              description: 'This usually takes a minute.',
              type: 'loading',
              data: { dismissible: false },
            })
          }
        >
          Loading
        </Button>
      </div>
      <Toaster timeout={0} toastManager={manager} />
    </>
  );
}

/** Title-only and non-dismissible loading examples from Figma. */
export const FigmaExamples: Story = {
  name: 'Figma examples',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The title-only toast centers its row vertically. The loading example omits the close control and remains visible until updated or closed programmatically.',
      },
    },
  },
  render: (_args) => <FigmaExamplesDemo />,
};

function PlacementDemo() {
  const manager = useMemo(() => createToastManager(), []);

  function addStack() {
    manager.add({
      title: 'Deployment complete',
      description: 'nebari-prod is live.',
      type: 'success',
      actionProps: { children: 'View' },
    });
    manager.add({
      title: 'Storage almost full',
      description: '92% of your quota is in use.',
      type: 'warning',
    });
    manager.add({
      title: 'New version available',
      description: 'Nebari 2026.8 is ready to install.',
      type: 'info',
    });
  }

  return (
    <>
      <Button onClick={addStack}>Show stack</Button>
      <Toaster timeout={0} toastManager={manager} />
    </>
  );
}

/** Bottom-right placement and newest-first stack behavior. */
export const Placement: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Toasts appear in a bottom-right stack with the newest item in front. Hover or focus the viewport to expand the pile; Nebari caps the visible stack at five by default.',
      },
    },
  },
  render: (_args) => <PlacementDemo />,
};

/**
 * Exercises the live keyboard path in a real browser, and is the story that
 * gives the a11y addon a rendered toast to scan: every other story starts with
 * an empty viewport, so axe would otherwise never see one. It deliberately ends
 * with the stack still open — the addon runs after `play`, so a story that
 * dismissed everything would hand axe an empty viewport again.
 */
export const Interactive: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          '`F6` moves focus into the viewport and pauses the auto-dismiss timers, `Tab` from there lands on the frontmost toast, and `Escape` dismisses the focused toast — the keyboard equivalent of swiping it away. `Shift+Tab` off the viewport hands focus back to where it came from and resumes the timers.',
      },
    },
  },
  render: (_args) => <PlacementDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Show stack' }));

    const viewport = await page.findByRole('region', { name: 'Notifications' });
    await expect(viewport).toHaveAttribute('aria-live', 'polite');

    // F6 from anywhere on the page moves focus onto the viewport itself, which
    // expands the stack. Escape is handled per toast, so it does nothing until
    // Tab moves focus onto one of them.
    await userEvent.keyboard('{F6}');
    await waitFor(() => expect(viewport).toHaveFocus());
    await expect(viewport).toHaveAttribute('data-expanded');

    await userEvent.keyboard('{Tab}');
    const focused = await waitFor(() => {
      const toast = page
        .getAllByRole('dialog')
        .find((candidate) => candidate === document.activeElement);
      expect(toast).toBeDefined();
      return toast as HTMLElement;
    });

    // The dismiss control is only exposed to assistive tech once expanded.
    await expect(
      page.getAllByRole('button', { name: 'Dismiss' })[0],
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(focused).not.toBeInTheDocument());

    // Two toasts survive, so axe still has a rendered stack to scan — and one
    // of them is the `warning`, which Base UI gives `role="alertdialog"` and
    // holds out of the accessibility tree while unfocused. Counted through the
    // `data-slot` hook so the assertion covers both priorities.
    await waitFor(() =>
      expect(
        Array.from(
          canvasElement.ownerDocument.querySelectorAll('[data-slot="toast"]'),
        ),
      ).toHaveLength(2),
    );
  },
};
