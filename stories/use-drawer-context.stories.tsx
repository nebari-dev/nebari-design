import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import { Button } from '@/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  type DrawerContextValue,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  type DrawerSide,
  DrawerTitle,
  DrawerTrigger,
  useDrawerContext,
} from '@/ui/drawer';

const SIDES: DrawerSide[] = ['right', 'bottom', 'left', 'top'];

const SIDE_LABELS: Record<DrawerSide, string> = {
  top: 'Top',
  right: 'Right',
  bottom: 'Bottom',
  left: 'Left',
};

// `auto` keeps the per-side default reachable, which is the derivation the
// readout is here to expose: `bottom` resolves to `true`, every other side to
// `false`.
const SWIPE_HANDLE_BY_KEY = {
  auto: undefined,
  shown: true,
  hidden: false,
} as const;

type SwipeHandleKey = keyof typeof SWIPE_HANDLE_BY_KEY;

const SWIPE_HANDLE_LABELS: Record<SwipeHandleKey, string> = {
  auto: 'Handle: auto',
  shown: 'Handle: shown',
  hidden: 'Handle: hidden',
};

interface UseDrawerContextDemoProps {
  /** Documentation-only row for the `useDrawerContext` parameter. */
  component?: string;
  /** Documentation-only row for the `useDrawerContext` return value. */
  side?: DrawerSide;
  /** Documentation-only row for the `useDrawerContext` return value. */
  swipeDirection?: DrawerContextValue['swipeDirection'];
  /** Documentation-only row for the `useDrawerContext` return value. */
  showSwipeHandle?: boolean;
  /** Documentation-only row for the `useDrawerContext` return value. */
  modal?: DrawerContextValue['modal'];
  /** Documentation-only row for the `useDrawerContext` return value. */
  hasSnapPoints?: boolean;
}

/**
 * A custom part that exists only in this story. It reads the settled drawer
 * configuration from context, so it renders identically inside the portaled
 * content and beside the trigger.
 */
function DrawerConfigSummary({ testIdPrefix }: { testIdPrefix: string }) {
  const { hasSnapPoints, modal, showSwipeHandle, side, swipeDirection } =
    useDrawerContext('DrawerConfigSummary');

  const rows: [string, string][] = [
    ['side', side],
    ['swipeDirection', swipeDirection],
    ['showSwipeHandle', String(showSwipeHandle)],
    ['modal', String(modal)],
    ['hasSnapPoints', String(hasSnapPoints)],
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-border bg-muted p-4 text-sm">
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <dt className="text-muted-foreground-strong">{label}</dt>
          <dd>
            <code data-testid={`${testIdPrefix}-${label}`}>{value}</code>
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

function UseDrawerContextDemo(_props: UseDrawerContextDemoProps) {
  const [side, setSide] = useState<DrawerSide>('right');
  const [swipeHandle, setSwipeHandle] = useState<SwipeHandleKey>('auto');
  const [modal, setModal] = useState(true);

  // No remount key: Base UI re-derives the popup's geometry when
  // `swipeDirection` changes, so an open drawer follows a live `side` change
  // instead of being torn down. The **Default** play function asserts that.
  return (
    <Drawer
      // A non-modal drawer does not inert the page, so the controls beside it
      // stay live — but an outside press would otherwise dismiss it the moment
      // one is clicked. Keeping it open is the whole point of that mode here.
      disablePointerDismissal={!modal}
      modal={modal}
      showSwipeHandle={SWIPE_HANDLE_BY_KEY[swipeHandle]}
      side={side}
    >
      <div className="flex w-96 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div>
          <h2 className="font-semibold text-lg">Resolved configuration</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            These buttons set props on <code>Drawer</code>. The panel below is a
            custom part reading what the root settled on — no drawer needs to be
            open for it to work.
          </p>
        </div>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Side</legend>
          {SIDES.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={side === option ? 'default' : 'outline'}
              aria-pressed={side === option}
              onClick={() => setSide(option)}
            >
              {SIDE_LABELS[option]}
            </Button>
          ))}
        </fieldset>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Swipe handle and modality</legend>
          {(Object.keys(SWIPE_HANDLE_BY_KEY) as SwipeHandleKey[]).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={swipeHandle === key ? 'default' : 'outline'}
              aria-pressed={swipeHandle === key}
              onClick={() => setSwipeHandle(key)}
            >
              {SWIPE_HANDLE_LABELS[key]}
            </Button>
          ))}
          <Button
            size="sm"
            variant={modal ? 'default' : 'outline'}
            aria-pressed={modal}
            onClick={() => setModal((previous) => !previous)}
          >
            Modal
          </Button>
        </fieldset>
        <DrawerConfigSummary testIdPrefix="beside-trigger" />
        <DrawerTrigger render={<Button variant="outline" />}>
          Open drawer
        </DrawerTrigger>
      </div>
      <DrawerContent>
        <DrawerHeader>
          <div className="min-w-0 flex-1">
            <DrawerTitle>Same context, inside the portal</DrawerTitle>
            <DrawerDescription>
              The portaled content is a separate React tree in the DOM, but it
              stays under the same provider.
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerBody>
          <DrawerConfigSummary testIdPrefix="in-content" />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DrawerContextMisuseDemo(_props: UseDrawerContextDemoProps) {
  const [withRoot, setWithRoot] = useState(false);

  return (
    <div className="flex w-96 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div>
        <h2 className="font-semibold text-lg">Missing root</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          The preview explains the failure safely, then mounts the custom part
          inside a <code>Drawer</code> when requested.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setWithRoot((previous) => !previous)}
      >
        {withRoot ? 'Remove Drawer' : 'Add Drawer'}
      </Button>
      {withRoot ? (
        <Drawer side="bottom">
          <DrawerConfigSummary testIdPrefix="recovered" />
        </Drawer>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>Render would fail</AlertTitle>
          <AlertDescription data-testid="context-error">
            &lt;DrawerConfigSummary&gt; must be used within a &lt;Drawer&gt;.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

const meta = {
  title: 'Hooks/useDrawerContext',
  component: UseDrawerContextDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`useDrawerContext` reads the configuration the nearest `Drawer` settled on. ' +
          "The root normalizes `side` and Base UI's `swipeDirection` into each other and " +
          'derives `showSwipeHandle` from the result, so those resolved values exist ' +
          'nowhere else — a `Drawer` given only `side="bottom"` still reports ' +
          "`swipeDirection: 'down'` and `showSwipeHandle: true`. `DrawerContent` uses the " +
          'hook internally, and it is exported so an app can add its own parts that adapt ' +
          'to the edge a drawer opens from. The demo renders the same custom summary ' +
          'twice — beside the trigger and inside the portaled content — to show that both ' +
          'read one provider, and both follow a live `side` change with no remount. A ' +
          'modal drawer makes the rest of the page inert, so switch **Modal** off to ' +
          "drive the controls while the drawer is open. Pass the calling component's " +
          'name as the single argument; ' +
          'it appears in the error thrown outside a root — `<DrawerConfigSummary> must be ' +
          'used within a <Drawer>.` See the **Outside Root** story.',
      },
    },
  },
  argTypes: {
    component: {
      description:
        "Name of the calling component. Interpolated into the thrown error so a missing `Drawer` reports which part failed; it does not affect what's returned.",
      control: false,
      table: {
        category: 'useDrawerContext parameter',
        type: { summary: 'string' },
      },
    },
    side: {
      description:
        "Visual edge the drawer opens from, resolved from the root's `side` or back-derived from an explicit `swipeDirection`.",
      control: false,
      table: {
        category: 'useDrawerContext return',
        type: { summary: "'top' | 'right' | 'bottom' | 'left'" },
      },
    },
    swipeDirection: {
      description:
        "Base UI's swipe direction for the same edge, resolved from `side` when it isn't passed explicitly.",
      control: false,
      table: {
        category: 'useDrawerContext return',
        type: { summary: "'up' | 'right' | 'down' | 'left'" },
      },
    },
    showSwipeHandle: {
      description:
        'Whether the grab handle renders. Defaults to `true` for a bottom drawer and `false` for every other side unless the root overrides it.',
      control: false,
      table: {
        category: 'useDrawerContext return',
        type: { summary: 'boolean' },
      },
    },
    modal: {
      description:
        "The root's modality. `DrawerContent` reads it to decide whether to render the scrim overlay and to make the viewport interactive.",
      control: false,
      table: {
        category: 'useDrawerContext return',
        type: { summary: "boolean | 'trap-focus'" },
      },
    },
    hasSnapPoints: {
      description:
        'Whether the root received a non-empty `snapPoints` array. The overlay and popup use it to switch to snap-point geometry. This demo passes no snap points, so it stays `false`.',
      control: false,
      table: {
        category: 'useDrawerContext return',
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof UseDrawerContextDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByTestId('beside-trigger-side')).toHaveTextContent(
      'right',
    );
    await expect(
      canvas.getByTestId('beside-trigger-swipeDirection'),
    ).toHaveTextContent('right');
    await expect(
      canvas.getByTestId('beside-trigger-showSwipeHandle'),
    ).toHaveTextContent('false');

    // `side` alone drives both the Base UI direction and the handle default.
    await userEvent.click(canvas.getByRole('button', { name: 'Bottom' }));
    await expect(
      canvas.getByTestId('beside-trigger-swipeDirection'),
    ).toHaveTextContent('down');
    await expect(
      canvas.getByTestId('beside-trigger-showSwipeHandle'),
    ).toHaveTextContent('true');

    // An explicit override wins over that per-side default.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Handle: hidden' }),
    );
    await expect(
      canvas.getByTestId('beside-trigger-showSwipeHandle'),
    ).toHaveTextContent('false');

    // The portaled content reads the same provider.
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const drawer = await page.findByRole('dialog', {
      name: 'Same context, inside the portal',
    });
    await waitFor(() => expect(drawer).toHaveAttribute('data-open'));
    await expect(page.getByTestId('in-content-side')).toHaveTextContent(
      'bottom',
    );
    await expect(
      page.getByTestId('in-content-swipeDirection'),
    ).toHaveTextContent('down');
    await expect(
      page.getByTestId('in-content-showSwipeHandle'),
    ).toHaveTextContent('false');

    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    await waitFor(
      () =>
        expect(
          page.queryByRole('dialog', {
            name: 'Same context, inside the portal',
          }),
        ).not.toBeInTheDocument(),
      { timeout: 1000 },
    );

    // A modal drawer makes the rest of the page inert, so the panel beside the
    // trigger can only be driven while the drawer is open in non-modal mode.
    // That is also the path that proves the context is live: the readout and
    // Base UI's own geometry both follow a `side` change without a remount.
    await userEvent.click(canvas.getByRole('button', { name: 'Modal' }));
    await expect(canvas.getByTestId('beside-trigger-modal')).toHaveTextContent(
      'false',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const nonModal = await page.findByRole('dialog', {
      name: 'Same context, inside the portal',
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Left' }));
    // Still open — the assertions below describe a live drawer, not one caught
    // mid-exit.
    await expect(nonModal).toHaveAttribute('data-open');
    await expect(page.getByTestId('in-content-side')).toHaveTextContent('left');
    await expect(nonModal).toHaveAttribute('data-swipe-direction', 'left');

    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    await waitFor(
      () =>
        expect(
          page.queryByRole('dialog', {
            name: 'Same context, inside the portal',
          }),
        ).not.toBeInTheDocument(),
      { timeout: 1000 },
    );
  },
};

export const OutsideRoot: Story = {
  name: 'Outside root',
  parameters: {
    docs: {
      description: {
        story:
          '`useDrawerContext` reads a context with no default value, so a custom part ' +
          'rendered above `Drawer` throws instead of assuming a side. The name passed to ' +
          'the hook identifies the offending part in the message. The preview shows that ' +
          'exact error as copy rather than deliberately crashing the story; add the root ' +
          'to render the part safely.',
      },
    },
  },
  render: (args) => <DrawerContextMisuseDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('context-error')).toHaveTextContent(
      '<DrawerConfigSummary> must be used within a <Drawer>.',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Add Drawer' }));
    await expect(canvas.getByTestId('recovered-side')).toHaveTextContent(
      'bottom',
    );
    await expect(canvas.queryByTestId('context-error')).not.toBeInTheDocument();
  },
};
