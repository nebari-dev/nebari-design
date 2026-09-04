import type { UseToastManagerReturnValue } from '@base-ui/react/toast';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  createToastManager,
  Toast,
  ToastAction,
  ToastContent,
  type ToastData,
  Toaster,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  useToastManager,
} from '@/ui/toast';

/**
 * These tests assert the component's public contract only — ARIA roles and
 * accessible names first, and the stable `data-slot` / `data-variant` hooks
 * where a part has no role of its own. Nothing here reads a Tailwind class, so
 * restyling the toast cannot break the suite.
 */

/** Default accessible name of the built-in dismiss control. */
const CLOSE_LABEL = 'Dismiss';

/**
 * Mounts a `Toaster` on an isolated manager so no test shares toast state.
 * Defaults to `timeout: 0` so a toast stays put unless a test opts into timers.
 */
function renderToaster(timeout = 0) {
  const manager = createToastManager<ToastData>();
  render(<Toaster timeout={timeout} toastManager={manager} />);
  return manager;
}

/**
 * Mounts a hand-composed renderer for the composition cases `Toaster`'s
 * built-in list doesn't expose: a caller-supplied `className` on the root and
 * a `render`-prop swap on the action.
 */
function renderComposed(options: {
  rootClassName?: string;
  actionRender?: ReactElement;
  /** Pass `false` when `actionRender` is not a native `<button>`. */
  actionNativeButton?: boolean;
}) {
  const manager = createToastManager<ToastData>();

  function ComposedList() {
    const { toasts } = useToastManager<ToastData>();

    return toasts.map((toastItem) => (
      <Toast
        key={toastItem.id}
        toast={toastItem}
        className={options.rootClassName}
      >
        <ToastContent>
          <ToastTitle />
          <ToastAction
            nativeButton={options.actionNativeButton}
            render={options.actionRender}
          />
        </ToastContent>
      </Toast>
    ));
  }

  render(
    <ToastProvider timeout={0} toastManager={manager}>
      <ComposedList />
    </ToastProvider>,
  );

  return manager;
}

/**
 * Mounts a `Toaster` and hands back a getter for the manager the
 * `useToastManager` hook returns, so the hook's own wrapper — not just the
 * standalone manager's — is exercised.
 */
function renderWithHookManager() {
  let hookManager: UseToastManagerReturnValue<ToastData> | undefined;

  function CaptureManager() {
    hookManager = useToastManager<ToastData>();
    return null;
  }

  render(
    <Toaster timeout={0} toastManager={createToastManager<ToastData>()}>
      <CaptureManager />
    </Toaster>,
  );

  return () => {
    if (!hookManager) {
      throw new Error('useToastManager did not yield a manager');
    }

    return hookManager;
  };
}

/**
 * The toast root that owns a given title. Looked up through the `data-slot`
 * hooks rather than the heading role, because Base UI holds a high-priority
 * (`warning` / `error`) root out of the accessibility tree until the viewport
 * is focused — it announces those through a hidden `role="alert"` mirror
 * instead. `announces a polite toast as a heading` covers the role path.
 */
function getToastByTitle(title: string): HTMLElement {
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>('[data-slot="toast"]'),
  );
  const root = roots.find(
    (candidate) =>
      candidate.querySelector('[data-slot="toast-title"]')?.textContent ===
      title,
  );

  if (!root) {
    throw new Error(`No toast root wraps the title "${title}"`);
  }

  return root;
}

/** The status icon of a toast, or `null` when the icon is suppressed. */
function queryToastIcon(scope: HTMLElement | Document = document) {
  return scope.querySelector<HTMLElement>('[data-slot="toast-icon"]');
}

/**
 * The dismiss control of a toast, or `null` when it is suppressed. Base UI
 * keeps this button `aria-hidden` while the stack is collapsed and only exposes
 * it once the viewport is hovered or focused, so a role query can't reach it in
 * the resting state — the `data-slot` hook can.
 */
function queryToastClose(scope: HTMLElement | Document = document) {
  return scope.querySelector<HTMLElement>('[data-slot="toast-close"]');
}

/** The dismiss control of a toast, failing the test when there isn't one. */
function getToastClose(scope: HTMLElement | Document = document): HTMLElement {
  const close = queryToastClose(scope);

  if (!close) {
    throw new Error('The toast rendered no dismiss control');
  }

  return close;
}

/** The action control of a toast, or `null` when the item carries no action. */
function queryToastAction(scope: HTMLElement | Document = document) {
  return scope.querySelector<HTMLElement>('[data-slot="toast-action"]');
}

describe('Toast', () => {
  it('renders a title, a description, a status icon, and a dismiss control', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({
        title: 'Toast title',
        description: 'Toast description goes here.',
      });
    });

    const root = getToastByTitle('Toast title');
    expect(root).toHaveAttribute('data-variant', 'default');
    expect(
      within(root).getByText('Toast description goes here.'),
    ).toBeVisible();
    expect(queryToastIcon(root)).toHaveAttribute('data-variant', 'default');
    expect(getToastClose(root)).toHaveAttribute('aria-label', CLOSE_LABEL);
  });

  it.each(['success', 'warning', 'error', 'info', 'loading'] as const)(
    'reflects the %s status as a data attribute on the icon',
    (type) => {
      const { unmount } = render(<ToastIcon type={type} />);
      expect(queryToastIcon()).toHaveAttribute('data-variant', type);
      unmount();
    },
  );

  it('falls back to the default status for an unknown manager type', () => {
    render(<ToastIcon type="custom" />);
    expect(queryToastIcon()).toHaveAttribute('data-variant', 'default');
  });

  it('hides the icon and the dismiss control through toast data', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({
        title: 'Building environment',
        description: 'This usually takes a minute.',
        type: 'loading',
        data: { dismissible: false, showIcon: false },
      });
    });

    const root = getToastByTitle('Building environment');
    expect(queryToastIcon(root)).toBeNull();
    expect(queryToastClose(root)).toBeNull();
  });

  it('keeps the dismiss control on a toast that carries an action', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({
        title: 'Message archived',
        actionProps: { children: 'Undo' },
        data: { dismissible: false },
      });
    });

    // The action must not be the only way out, so `dismissible: false` loses.
    expect(queryToastClose(getToastByTitle('Message archived'))).not.toBeNull();
  });

  it('omits the action when the manager item carries none', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    // Base UI renders nothing for an action with no `actionProps`.
    expect(queryToastAction(getToastByTitle('Copied to clipboard'))).toBeNull();
  });

  it('runs an action supplied through actionProps', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const manager = renderToaster();

    act(() => {
      manager.add({
        title: 'Deployment complete',
        actionProps: { children: 'View', onClick },
      });
    });

    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('notifies the manager when the dismiss control is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Copied to clipboard', onClose });
    });

    await user.click(getToastClose(getToastByTitle('Copied to clipboard')));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('limits the visible stack to five items by default', () => {
    const manager = renderToaster();

    act(() => {
      for (let index = 1; index <= 6; index += 1) {
        manager.add({ title: `Toast ${index}` });
      }
    });

    expect(getToastByTitle('Toast 1')).toHaveAttribute('data-limited');
    expect(getToastByTitle('Toast 6')).not.toHaveAttribute('data-limited');
  });

  it('renders a hidden placeholder when no toast item is supplied', () => {
    render(<Toast />);

    const root = document.querySelector<HTMLElement>('[data-slot="toast"]');
    expect(root).toHaveAttribute('data-variant', 'default');
    expect(root).not.toBeVisible();
  });

  // CSS transitions are not testable in jsdom; enter, exit, stack, and swipe
  // motion are verified in Storybook.

  it('preserves data-slot when ToastAction composes into a link', () => {
    const manager = renderComposed({
      // Base UI treats an action as a button and applies `role="button"` to
      // any non-native element, so a link needs all three: `nativeButton`
      // false to stop the native-semantics warning, the anchor, and an
      // explicit role to win the link semantics back.
      actionNativeButton: false,
      // biome-ignore lint/a11y/useAnchorContent: ToastAction injects the label
      // biome-ignore lint/a11y/noRedundantRoles: Base UI overrides it above
      actionRender: <a href="/deployments" role="link" />,
    });

    act(() => {
      manager.add({
        title: 'Deployment complete',
        actionProps: { children: 'View' },
      });
    });

    const link = screen.getByRole('link', { name: 'View' });
    expect(link).toHaveAttribute('href', '/deployments');
    expect(link).toHaveAttribute('data-slot', 'toast-action');
  });

  it('merges a caller className onto the toast root', () => {
    const manager = renderComposed({ rootClassName: 'custom-toast-class' });

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    expect(getToastByTitle('Copied to clipboard')).toHaveClass(
      'custom-toast-class',
    );
  });

  it('announces a polite toast as a heading in the live region', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(
      within(region).getByRole('heading', { name: 'Copied to clipboard' }),
    ).toBeVisible();
  });

  // An object table, so the reported name names the role under test. The
  // positional form printed the second column — the type — where it said role.
  it.each([
    { label: 'default', type: undefined, role: 'dialog' },
    { label: 'success', type: 'success', role: 'dialog' },
    { label: 'info', type: 'info', role: 'dialog' },
    { label: 'loading', type: 'loading', role: 'dialog' },
    { label: 'warning', type: 'warning', role: 'alertdialog' },
    { label: 'error', type: 'error', role: 'alertdialog' },
  ] as const)(
    'gives a $label toast the $role role',
    ({ label, type, role }) => {
      const manager = renderToaster();

      act(() => {
        manager.add({ title: `${label} toast`, type });
      });

      expect(getToastByTitle(`${label} toast`)).toHaveAttribute('role', role);
    },
  );

  it.each(['warning', 'error'] as const)(
    'mirrors a %s toast into an assertive live region',
    (type) => {
      const manager = renderToaster();

      act(() => {
        manager.add({ title: 'Storage almost full', type });
      });

      const alert = document.querySelector<HTMLElement>('[role="alert"]');
      expect(alert).toHaveTextContent('Storage almost full');
    },
  );

  it('leaves an explicit priority alone', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Quiet failure', type: 'error', priority: 'low' });
    });

    expect(getToastByTitle('Quiet failure')).toHaveAttribute('role', 'dialog');
  });

  it('raises a toast to assertive when an update names a louder type', () => {
    const manager = renderToaster();
    let id = '';

    act(() => {
      id = manager.add({ title: 'Building', type: 'loading' });
    });
    expect(getToastByTitle('Building')).toHaveAttribute('role', 'dialog');

    act(() => {
      manager.update(id, { title: 'Build failed', type: 'error' });
    });
    expect(getToastByTitle('Build failed')).toHaveAttribute(
      'role',
      'alertdialog',
    );
  });

  it('marks a loading toast as busy', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Building', type: 'loading' });
      manager.add({ title: 'Built', type: 'success' });
    });

    expect(getToastByTitle('Building')).toHaveAttribute('aria-busy', 'true');
    expect(getToastByTitle('Built')).not.toHaveAttribute('aria-busy');
  });

  it('keeps the toast surface out of the tab order', async () => {
    const user = userEvent.setup();
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
      manager.add({
        title: 'Deployment complete',
        actionProps: { children: 'View' },
      });
    });

    // Neither a passive nor an actionable surface is a stop: activating one
    // does nothing, and on the actionable one it would sit ahead of the action.
    const actionable = getToastByTitle('Deployment complete');
    expect(getToastByTitle('Copied to clipboard')).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(actionable).toHaveAttribute('tabindex', '-1');

    // Tabbing in from the page skips it and lands on the newest toast's action.
    await user.tab();
    expect(queryToastAction(actionable)).toHaveFocus();

    // `-1` only removes the surface from the sequential order. Base UI's
    // viewport focus guard still reaches it with a programmatic `focus()` on
    // the `F6` route, which the `Interactive` story exercises in a browser.
    act(() => {
      actionable.focus();
    });
    expect(actionable).toHaveFocus();
  });

  it('leaves the toast surface in the accessibility tree', () => {
    const manager = renderToaster();

    act(() => {
      manager.add({
        title: 'Copied to clipboard',
        description: 'Paste it wherever you need it.',
      });
    });

    // Dropping the surface from the tab order must not drop it from the
    // accessibility tree: a screen reader still reaches it by virtual cursor.
    const root = screen.getByRole('dialog', { name: 'Copied to clipboard' });
    expect(root).toHaveAttribute('tabindex', '-1');
    expect(root).toHaveAccessibleDescription('Paste it wherever you need it.');
  });

  it('lets a caller opt the surface back into the tab order', () => {
    const manager = createToastManager<ToastData>();

    function ComposedList() {
      const { toasts } = useToastManager<ToastData>();

      return toasts.map((toastItem) => (
        <Toast key={toastItem.id} toast={toastItem} tabIndex={0}>
          <ToastContent>
            <ToastTitle />
          </ToastContent>
        </Toast>
      ));
    }

    render(
      <ToastProvider timeout={0} toastManager={manager}>
        <ComposedList />
      </ToastProvider>,
    );

    act(() => {
      manager.add({ title: 'Open deployment' });
    });

    expect(getToastByTitle('Open deployment')).toHaveAttribute('tabindex', '0');
  });

  it('puts the action before the dismiss control in tab order', async () => {
    const user = userEvent.setup();
    const manager = renderToaster();

    act(() => {
      manager.add({
        title: 'Deployment complete',
        actionProps: { children: 'View' },
      });
    });

    const root = getToastByTitle('Deployment complete');
    act(() => {
      root.focus();
    });

    await user.tab();
    expect(queryToastAction(root)).toHaveFocus();
    await user.tab();
    expect(queryToastClose(root)).toHaveFocus();
  });

  it('moves focus into the viewport on F6', async () => {
    const user = userEvent.setup();
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    await user.keyboard('{F6}');
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveFocus();
  });

  it('dismisses the focused toast on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const manager = renderToaster();

    act(() => {
      manager.add({ title: 'Copied to clipboard', onClose });
    });

    // Escape is handled on the toast root, not the viewport, and the root is
    // not a focus stop — so the reachable path is the dismiss control, which
    // the event bubbles up from. The full F6 → Tab → Escape journey needs Base
    // UI's focus guards and is covered by the `Interactive` story in a browser.
    act(() => {
      getToastClose(getToastByTitle('Copied to clipboard')).focus();
    });
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('never auto-dismisses a loading toast', () => {
    vi.useFakeTimers();

    try {
      const manager = renderToaster(1000);

      act(() => {
        manager.add({ title: 'Building', type: 'loading' });
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(getToastByTitle('Building')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('never auto-dismisses a toast that carries an action', () => {
    vi.useFakeTimers();

    try {
      const manager = renderToaster(1000);

      act(() => {
        manager.add({ title: 'Plain', type: 'success' });
        manager.add({
          title: 'Actionable',
          actionProps: { children: 'Undo' },
        });
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(
        screen.queryByRole('heading', { name: 'Plain' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Actionable' })).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });

  it('overrides an explicit timeout on a toast that carries an action', () => {
    vi.useFakeTimers();

    try {
      const manager = renderToaster(0);

      // Persistence is a rule, not a default: a toast is either a notification
      // that may time out or a prompt to act that waits, and a caller asking
      // for both does not get a vanishing action.
      act(() => {
        manager.add({
          title: 'Actionable',
          timeout: 1000,
          actionProps: { children: 'Undo' },
        });
      });

      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(getToastByTitle('Actionable')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('overrides an explicit timeout when an update adds an action', () => {
    vi.useFakeTimers();

    try {
      const manager = renderToaster(0);
      let id = '';

      act(() => {
        id = manager.add({ title: 'Message archived', timeout: 1000 });
      });

      act(() => {
        manager.update(id, {
          timeout: 1000,
          actionProps: { children: 'Undo' },
        });
      });

      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(getToastByTitle('Message archived')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('still auto-dismisses a notification toast that carries no action', () => {
    vi.useFakeTimers();

    try {
      const manager = renderToaster(0);

      act(() => {
        manager.add({ title: 'Copied to clipboard', timeout: 1000 });
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(
        screen.queryByRole('heading', { name: 'Copied to clipboard' }),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses the auto-dismiss timer while the viewport is hovered', async () => {
    const user = userEvent.setup();
    const manager = renderToaster(1000);

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    const viewport = screen.getByRole('region', { name: 'Notifications' });
    await user.hover(viewport);
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });
    expect(
      screen.getByRole('heading', { name: 'Copied to clipboard' }),
    ).toBeVisible();

    await user.unhover(viewport);
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Copied to clipboard' }),
      ).not.toBeInTheDocument();
    });
  });

  it('pauses the auto-dismiss timer while the viewport holds focus', async () => {
    const user = userEvent.setup();
    const manager = renderToaster(1000);

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    // `F6` is the documented route onto the viewport, and it pauses the timers
    // as it lands. Focus has to hold them for as long as hover does: a keyboard
    // user reading a toast gets the same grace as a pointer user resting on it.
    await user.keyboard('{F6}');
    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });
    expect(
      screen.getByRole('heading', { name: 'Copied to clipboard' }),
    ).toBeVisible();

    // Shift+Tab is the deliberate way back out, and resumes them.
    await user.tab({ shift: true });
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Copied to clipboard' }),
      ).not.toBeInTheDocument();
    });
  });

  it('pauses the auto-dismiss timer on a touch pointer-down', async () => {
    const manager = renderToaster(500);

    act(() => {
      manager.add({ title: 'Copied to clipboard' });
    });

    // A touch tap has no hover to rest in, so Base UI holds the timers from
    // pointer-down until a later touch lands outside the viewport. Modelled
    // with `fireEvent` because jsdom emits no compatibility mouse events of its
    // own for a touch pointer, and `pointerType` is what selects this branch.
    const viewport = screen.getByRole('region', { name: 'Notifications' });
    fireEvent.pointerDown(viewport, { pointerType: 'touch' });
    fireEvent.mouseEnter(viewport);
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });
    expect(
      screen.getByRole('heading', { name: 'Copied to clipboard' }),
    ).toBeVisible();

    // A touch outside the viewport is explicit "done here", and resumes them.
    // A mouse pointer-down there would not: the toast may simply be sitting
    // over the page, and a click elsewhere is not a dismissal.
    fireEvent.pointerDown(document.body, { pointerType: 'touch' });
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Copied to clipboard' }),
      ).not.toBeInTheDocument();
    });
  });

  it('updates a promise toast from loading to success', async () => {
    const manager = renderToaster();
    let resolvePromise: (value: string) => void = () => {};
    const request = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    act(() => {
      void manager.promise(request, {
        loading: { title: 'Building', type: 'loading' },
        success: (name) => ({ title: `${name} is live`, type: 'success' }),
        error: { title: 'Failed', type: 'error' },
      });
    });

    expect(getToastByTitle('Building')).toHaveAttribute(
      'data-variant',
      'loading',
    );

    await act(async () => {
      resolvePromise('nebari-prod');
      await request;
    });

    await waitFor(() => {
      expect(getToastByTitle('nebari-prod is live')).toHaveAttribute(
        'data-variant',
        'success',
      );
    });
  });

  it('passes the string form of a promise state through untouched', async () => {
    const getManager = renderWithHookManager();
    const request = Promise.resolve('done');

    act(() => {
      // Base UI resolves a string state to a description-only toast, so these
      // read out of the description rather than a title.
      void getManager().promise(request, {
        loading: 'Working…',
        success: 'Finished',
        error: 'Failed',
      });
    });
    expect(screen.getByText('Working…')).toBeVisible();

    await act(async () => {
      await request;
    });
    await waitFor(() => expect(screen.getByText('Finished')).toBeVisible());
  });

  it('applies the same defaults through the useToastManager hook', () => {
    const getManager = renderWithHookManager();
    let id = '';

    act(() => {
      id = getManager().add({ title: 'Deploy failed', type: 'error' });
    });
    expect(getToastByTitle('Deploy failed')).toHaveAttribute(
      'role',
      'alertdialog',
    );

    act(() => {
      getManager().update(id, { title: 'Deploy recovered', type: 'success' });
    });
    expect(getToastByTitle('Deploy recovered')).toHaveAttribute(
      'role',
      'dialog',
    );
  });
});
