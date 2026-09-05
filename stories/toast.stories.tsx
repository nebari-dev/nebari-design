import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@/components/ui/button';
import {
  Toaster,
  type ToasterProps,
  type ToastType,
  toast,
} from '@/components/ui/toast';

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
          'A transient notification implemented from the Nebari Figma `Toast` variant set with Base UI. Mount `Toaster` once, then call `toast.add`, `toast.update`, or `toast.promise`. The neutral popover surface keeps its copy readable while the icon communicates default, success, warning, error, info, or loading status. `warning` and `error` are announced assertively; the calmer statuses go through the viewport’s polite live region. The toast surface is kept out of the sequential tab order, so only its action and dismiss controls are stops for someone tabbing the page. Press `F6` to move focus onto the viewport, `Tab` to enter the frontmost toast, then `Escape` to dismiss it. Every story on this page feeds the one exported `toast` manager and the single `Toaster` mounted alongside them, so their toasts share one stack in the bottom-right corner — the same way an application mounts `Toaster` once at its root.',
      },
    },
  },
  decorators: [
    (Story, { args }) => (
      <>
        <Story />
        <StoryToaster limit={args.limit} timeout={args.timeout} />
      </>
    ),
  ],
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
        'Story-only toggle. Adds the Figma action button through the manager item’s `actionProps`. A toast carrying an action never auto-dismisses — whatever `timeout` says — and always retains the close control.',
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
        'Default auto-dismiss delay in milliseconds. Set to `0` to keep toasts open. Two kinds of toast ignore it and stay open regardless: a `loading` toast, and any toast carrying an action — so turning `showAction` on makes this knob a no-op.',
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

/**
 * Elects exactly one host for the page's single `Toaster`.
 *
 * Storybook draws every story on a Docs page into one document, so a decorator
 * that rendered a `Toaster` per story would stand up one stack per story in the
 * same corner — overlapping piles, each expanding on its own hover, which is
 * the behaviour reported on this component. Applications avoid it by mounting
 * `Toaster` once at the root and raising toasts from anywhere through the
 * exported manager; shadcn's docs do the same. The stories now do too: the
 * first to mount owns the only `Toaster`, every demo feeds the global `toast`
 * manager, and they all land in one stack at the bottom-right of the page.
 */
const toasterHosts = new Set<(isHost: boolean) => void>();

function useIsToasterHost() {
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const claim = (value: boolean) => setIsHost(value);
    toasterHosts.add(claim);
    // First one in takes the role; when it leaves, the next in line is
    // promoted, so a Docs page never ends up with no viewport at all.
    claim(toasterHosts.size === 1);

    return () => {
      toasterHosts.delete(claim);
      const next = toasterHosts.values().next();
      if (!next.done) {
        next.value(true);
      }
    };
  }, []);

  return isHost;
}

/** The one `Toaster` on the page, rendered by the meta decorator below. */
function StoryToaster({
  limit,
  timeout,
}: Pick<ToasterProps, 'limit' | 'timeout'>) {
  return useIsToasterHost() ? (
    <Toaster limit={limit} timeout={timeout} />
  ) : null;
}

function ToastPlayground(args: ToastStoryArgs) {
  function showToast() {
    let id = '';
    id = toast.add({
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
            onClick: () => toast.close(id),
          }
        : undefined,
    });
  }

  return <Button onClick={showToast}>Show toast</Button>;
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
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {TYPE_OPTIONS.map((type) => (
        <Button
          key={type}
          variant="outline"
          onClick={() =>
            toast.add({
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
  function showToast() {
    let id = '';
    id = toast.add({
      title: 'Deployment complete',
      description: 'nebari-prod is live.',
      type: 'success',
      actionProps: {
        children: 'View',
        onClick: () => toast.close(id),
      },
    });
  }

  return (
    <>
      {/* No `timeout` override: the toast carries an action, so
          `withToastA11yDefaults` already makes it persistent. */}
      <Button onClick={showToast}>Deploy</Button>
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
          'Pass button props through `actionProps`. This success toast uses the Figma “Deployment complete” example and closes when View is selected. A toast carrying an action never auto-dismisses and always keeps its close control, so the action can’t vanish before it is used. Persistence is a rule rather than a default here: an explicit `timeout` on the manager item does not override it.',
      },
    },
  },
  render: (_args) => <ActionDemo />,
};

function PromiseDemo() {
  function createEnvironment() {
    const request = new Promise<string>((resolve) => {
      window.setTimeout(() => resolve('nebari-prod'), 1000);
    });

    void toast.promise(request, {
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

  return <Button onClick={createEnvironment}>Create environment</Button>;
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
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
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
          toast.add({
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
  function addStack() {
    toast.add({
      title: 'Deployment complete',
      description: 'nebari-prod is live.',
      type: 'success',
      actionProps: { children: 'View' },
    });
    toast.add({
      title: 'Storage almost full',
      description: '92% of your quota is in use.',
      type: 'warning',
    });
    toast.add({
      title: 'New version available',
      description: 'Nebari 2026.8 is ready to install.',
      type: 'info',
    });
  }

  return <Button onClick={addStack}>Show stack</Button>;
}

/** Bottom-right placement and newest-first stack behavior. */
export const Placement: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Toasts appear in a bottom-right stack with the newest item in front. Hover or focus the viewport to expand the pile; Nebari caps the visible stack at five by default. The stack drains after a few idle seconds and holds for as long as you rest on it — except the actionable toast, which stays until it is used or dismissed.',
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
          '`F6` moves focus into the viewport and pauses the auto-dismiss timers, `Tab` from there enters the frontmost toast and then its controls, and `Escape` dismisses the toast holding focus — the keyboard equivalent of swiping it away. The surface is out of the sequential tab order, so it is never a stop ahead of the action while tabbing the page; `F6` is the way in. `Shift+Tab` off the viewport hands focus back to where it came from and resumes the timers.',
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

    // Taking the surface out of the sequential tab order does not close this
    // route into it: Base UI's focus guard focuses the frontmost root itself,
    // which `tabindex="-1"` still allows.
    const frontmost = await page.findByRole('dialog', {
      name: 'New version available',
    });
    await userEvent.keyboard('{Tab}');
    await waitFor(() => expect(frontmost).toHaveFocus());
    await expect(frontmost).toHaveAttribute('tabindex', '-1');

    // The toast's own controls follow it in DOM order. Base UI only exposes the
    // dismiss control to assistive tech once the stack is expanded or the
    // control holds focus — both true by this point.
    const dismiss = within(frontmost).getByRole('button', { name: 'Dismiss' });
    await userEvent.keyboard('{Tab}');
    await waitFor(() => expect(dismiss).toHaveFocus());
    await expect(dismiss).toBeVisible();

    // Escape is handled on the root, so it reaches the toast from the control.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(frontmost).not.toBeInTheDocument());

    // Dismissing the focused toast hands focus back and restarts the timers, so
    // the survivors below are now on a five-second clock and the a11y addon
    // does not scan until `play` returns. Hold them the way a reader would —
    // hovering pauses the timers — rather than racing it. The viewport is
    // `pointer-events-none` so the page stays clickable around the stack; the
    // toasts themselves are what take the pointer.
    await userEvent.hover(
      await page.findByRole('dialog', { name: 'Deployment complete' }),
    );
    await waitFor(() => expect(viewport).toHaveAttribute('data-expanded'));

    // Both survivors are still up, so axe has a rendered stack to scan — and
    // one of them is the `warning`, which Base UI gives `role="alertdialog"`
    // and holds out of the accessibility tree while unfocused, so it is found
    // by its text rather than its role. Named rather than counted: every story
    // on this page shares the one global manager, so anything raised elsewhere
    // first would be in this stack too and a total would be wrong.
    await waitFor(() => {
      expect(page.getByText('Deployment complete')).toBeInTheDocument();
      expect(page.getByText('Storage almost full')).toBeInTheDocument();
    });
  },
};
