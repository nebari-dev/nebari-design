import {
  type ToastManager,
  type ToastManagerPromiseOptions,
  Toast as ToastPrimitive,
  type UseToastManagerReturnValue,
} from '@base-ui/react/toast';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Bell,
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
} from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

/** Semantic color treatment for each toast status icon. */
const toastIconVariants = cva(
  'flex shrink-0 items-start overflow-hidden pt-px [&_svg]:pointer-events-none [&_svg]:size-[18px]',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        success: 'text-success-foreground',
        warning: 'text-warning-foreground',
        error: 'text-destructive-foreground',
        info: 'text-info-foreground',
        loading: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** Status treatments supported by Nebari's built-in toast renderer. */
type ToastType = NonNullable<VariantProps<typeof toastIconVariants>['variant']>;

/** Optional behavior flags stored on a toast manager item. */
interface ToastData {
  /** Hides the leading status icon when set to `false`. */
  showIcon?: boolean;
  /**
   * Hides the close button when set to `false`. Ignored on a toast carrying an
   * `actionProps` action, which always keeps a way to dismiss it.
   */
  dismissible?: boolean;
}

/** Props for an individual Base UI toast root. */
type ToastProps = Omit<ToastPrimitive.Root.Props, 'toast'> & {
  /** Toast manager item rendered by the root. */
  toast?: ToastPrimitive.Root.ToastObject<ToastData>;
};

/** Props for the complete toast renderer installed at the application root. */
interface ToasterProps extends ToastPrimitive.Provider.Props {
  /** Props forwarded to the portal that contains the toast viewport. */
  portalProps?: Omit<ToastPrimitive.Portal.Props, 'children'>;
  /** Props forwarded to the fixed bottom-right toast viewport. */
  viewportProps?: Omit<ToastPrimitive.Viewport.Props, 'children'>;
}

/**
 * Status types announced assertively. Base UI mirrors a `priority: 'high'` item
 * into a visually hidden `role="alert"` node, which interrupts the screen
 * reader; every other type is announced through the viewport's polite
 * `aria-live` region so it doesn't cut off whatever the user is doing. The split
 * mirrors the `role` mapping the `Alert` component applies to its own variants.
 */
const assertiveToastTypes = new Set<ToastType>(['warning', 'error']);

/** The subset of a manager item Nebari derives accessibility defaults from. */
interface ToastA11yOptions {
  actionProps?: unknown;
  priority?: 'low' | 'high';
  timeout?: number;
  type?: string;
}

/**
 * Applies Nebari's accessibility defaults to a manager item, leaving anything
 * the caller set explicitly untouched:
 *
 * - `priority` follows the status type, so `warning` and `error` interrupt.
 *   Only assigned when the caller named a `type` — a partial `update` that says
 *   nothing about the type must not reassign the item's priority.
 * - a toast carrying an action never auto-dismisses, so the action can't
 *   disappear before it is used (WCAG 2.2.1). {@link ToastList} pairs this with
 *   a close control that can't be switched off, so such a toast is dismissible
 *   rather than permanent.
 *
 * Keys are only added when they have a value: Base UI merges an update over the
 * existing item shallowly, so emitting `undefined` would erase what's there.
 */
function withToastA11yDefaults<T extends ToastA11yOptions>(options: T): T {
  const patch: ToastA11yOptions = {};

  if (options.priority === undefined && options.type !== undefined) {
    patch.priority = assertiveToastTypes.has(getToastType(options.type))
      ? 'high'
      : 'low';
  }

  if (options.timeout === undefined && options.actionProps != null) {
    patch.timeout = 0;
  }

  return Object.keys(patch).length > 0 ? { ...options, ...patch } : options;
}

/** Applies {@link withToastA11yDefaults} to one state of a promise toast. */
function withPromiseStateA11yDefaults<State>(state: State): State {
  // Base UI resolves the string form to a description-only toast, which carries
  // neither a type nor an action, so there is nothing to default.
  if (typeof state === 'string') {
    return state;
  }

  if (typeof state === 'function') {
    return ((result: unknown) =>
      withPromiseStateA11yDefaults(
        (state as (value: unknown) => unknown)(result),
      )) as State;
  }

  return withToastA11yDefaults(state as ToastA11yOptions) as State;
}

/** Applies {@link withToastA11yDefaults} to all three states of `promise`. */
function withPromiseA11yDefaults<Value, Data extends object>(
  options: ToastManagerPromiseOptions<Value, Data>,
): ToastManagerPromiseOptions<Value, Data> {
  return {
    loading: withPromiseStateA11yDefaults(options.loading),
    success: withPromiseStateA11yDefaults(options.success),
    error: withPromiseStateA11yDefaults(options.error),
  };
}

/**
 * Creates an isolated toast manager for a scoped renderer or a test. Wraps
 * Base UI's factory so `add`, `update`, and `promise` all apply
 * {@link withToastA11yDefaults}.
 */
function createToastManager<
  Data extends ToastData = ToastData,
>(): ToastManager<Data> {
  const manager = ToastPrimitive.createToastManager<Data>();

  return {
    ...manager,
    add: (options) => manager.add(withToastA11yDefaults(options)),
    update: (id, updates) => manager.update(id, withToastA11yDefaults(updates)),
    promise: (promiseValue, options) =>
      manager.promise(promiseValue, withPromiseA11yDefaults(options)),
  };
}

/**
 * Reads the nearest provider's toasts and its imperative methods, which apply
 * the same accessibility defaults as {@link createToastManager}. Use this in a
 * custom renderer, or to raise a toast from a component below {@link Toaster}.
 */
function useToastManager<
  Data extends ToastData = ToastData,
>(): UseToastManagerReturnValue<Data> {
  const manager = ToastPrimitive.useToastManager<Data>();

  return useMemo(
    () => ({
      ...manager,
      add: (options) => manager.add(withToastA11yDefaults(options)),
      update: (id, updates) =>
        manager.update(id, withToastA11yDefaults(updates)),
      promise: (promiseValue, options) =>
        manager.promise(promiseValue, withPromiseA11yDefaults(options)),
    }),
    [manager],
  );
}

/** Global manager used by the default {@link Toaster}. */
const toast = createToastManager<ToastData>();

/**
 * Class list for a toast root. Base UI publishes the geometry of the stack as
 * CSS custom properties on each root — `--toast-index` (0 is frontmost),
 * `--toast-height`, `--toast-offset-y`, and `--toast-swipe-movement-{x,y}` —
 * and this list turns them into the Figma stack:
 *
 * - `--gap` / `--peek` are the expanded spacing and the collapsed sliver of
 *   each toast behind the frontmost one.
 * - `--scale` shrinks each toast a further 10% per step back, and `--shrink`
 *   is the height that shrinking gives back, so collapsed toasts stay pinned
 *   to the frontmost one's bottom edge.
 * - `--offset-y` is the expanded translation: the viewport offset plus one
 *   `--gap` per step back, adjusted by any in-flight swipe.
 *
 * Collapsed (default) uses `--peek`/`--scale`; `data-expanded` (viewport
 * hovered or focused) switches to full height and `--offset-y`. The `after`
 * pseudo-element bridges the `--gap` so pointer travel between stacked toasts
 * doesn't collapse the stack. The `data-ending-style` rules send an exiting
 * toast off the edge it was swiped toward, falling back to downward when it
 * was dismissed without a swipe.
 */
const toastRootClassName = cn(
  'group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] h-(--height) w-full origin-bottom rounded-md border border-border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
  '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--toast-height))))_scale(var(--scale))]',
  "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
  'data-limited:opacity-0 data-starting-style:translate-y-[150%]',
  '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:translate-y-[150%]',
  'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
  'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
  'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
  'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
  'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
  'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
  'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
  'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
  'data-swiping:motion-safe:duration-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-slow) motion-safe:ease-(--ease-emphasized)',
);

/** Normalizes arbitrary Base UI toast types to a supported visual treatment. */
function getToastType(type: string | undefined): ToastType {
  switch (type) {
    case 'success':
    case 'warning':
    case 'error':
    case 'info':
    case 'loading':
      return type;
    default:
      return 'default';
  }
}

/** Provides toast state and timing to descendant toast primitives. */
function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

/** Portals the toast viewport to the document body. */
function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

/**
 * Fixed bottom-right region that contains the toast stack. It is responsive on
 * small screens and matches Figma's 400 px desktop width.
 */
function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-[400px] outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Root for one managed toast. Base UI supplies stacking, focus pause, and swipe
 * dismissal; Nebari supplies the neutral Figma surface and tokenized motion.
 * A root is normally rendered for you by {@link Toaster}; render it directly
 * only when composing a custom renderer around {@link useToastManager}.
 * Without a `toast` item there is nothing to render, so — like `Dialog` and
 * `Tooltip` — it falls back to a hidden placeholder rather than an empty
 * surface, which also keeps the registry's SSR probe safe.
 */
function Toast({ className, toast: toastItem, ...props }: ToastProps) {
  const variant = getToastType(toastItem?.type);

  if (!toastItem) {
    return <div data-slot="toast" data-variant={variant} hidden />;
  }

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      // A `loading` toast is reporting work still in flight, so the surface is
      // marked busy until the manager updates it to a settled type.
      aria-busy={variant === 'loading' || undefined}
      className={cn(toastRootClassName, className)}
      toast={toastItem}
      {...props}
    />
  );
}

/** Lays out a toast's icon, copy, action, and close control. */
function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'flex h-full items-center gap-3 overflow-hidden p-3 opacity-100 has-data-[slot=toast-description]:items-start data-behind:opacity-0 data-expanded:opacity-100 motion-safe:transition-opacity motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard)',
        className,
      )}
      {...props}
    />
  );
}

/** Renders the toast's concise heading. */
function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-sm leading-5 font-medium', className)}
      {...props}
    />
  );
}

/** Renders supporting text below the toast title. */
function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-muted-foreground text-sm leading-5', className)}
      {...props}
    />
  );
}

/**
 * Optional short action rendered from a manager item's `actionProps`. Defaults
 * to Nebari's 28 px outline button from the Figma design.
 */
function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn('shrink-0 shadow-none', className)}
      {...props}
    />
  );
}

/**
 * Dismisses its containing toast and defaults to the Figma close icon button.
 * Base UI keeps the control out of the accessibility tree while the stack is
 * collapsed and exposes it once the viewport is hovered or focused, so its
 * label is only ever announced in the context of a focused toast.
 */
function ToastClose({
  className,
  children,
  'aria-label': ariaLabel = 'Dismiss',
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label={ariaLabel}
      render={render}
      className={cn(
        "relative shrink-0 text-foreground after:absolute after:-inset-2 after:content-['']",
        className,
      )}
      {...props}
    >
      {children ?? <X aria-hidden="true" className="size-4" />}
    </ToastPrimitive.Close>
  );
}

/** Props accepted by {@link ToastIcon}. */
interface ToastIconProps {
  /** Additional classes merged after the icon variant classes. */
  className?: string;
  /**
   * Visual status represented by the icon. Any value outside {@link ToastType}
   * — including the `undefined` a manager item carries when no type was set —
   * falls back to the neutral `default` treatment.
   */
  type?: string;
}

/** Selects the status icon and semantic color associated with a toast type. */
function ToastIcon({ className, type }: ToastIconProps) {
  const variant = getToastType(type);
  let icon: ReactNode;

  switch (variant) {
    case 'success':
      icon = <CircleCheck aria-hidden="true" />;
      break;
    case 'warning':
      icon = <TriangleAlert aria-hidden="true" />;
      break;
    case 'error':
      icon = <CircleX aria-hidden="true" />;
      break;
    case 'info':
      icon = <Info aria-hidden="true" />;
      break;
    case 'loading':
      icon = (
        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
      );
      break;
    default:
      icon = <Bell aria-hidden="true" />;
  }

  return (
    <span
      data-slot="toast-icon"
      data-variant={variant}
      className={cn(toastIconVariants({ variant }), className)}
    >
      {icon}
    </span>
  );
}

/** Renders every active item from the nearest toast manager. */
function ToastList() {
  // Reads through Nebari's wrapper rather than Base UI's hook so there is one
  // way into the manager from this file, and adding an imperative call here
  // later can't quietly skip {@link withToastA11yDefaults}.
  const { toasts } = useToastManager<ToastData>();

  return toasts.map((toastItem) => {
    const showIcon = toastItem.data?.showIcon !== false;
    // An action must never be the only way out of a toast: one that carries an
    // action keeps its close control even if `data.dismissible` says otherwise,
    // which pairs with the timer `withToastA11yDefaults` clears for it.
    const dismissible =
      toastItem.actionProps != null || toastItem.data?.dismissible !== false;

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent>
          {showIcon && <ToastIcon type={toastItem.type} />}
          <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden break-words">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          {dismissible && <ToastClose />}
        </ToastContent>
      </Toast>
    );
  });
}

/**
 * Complete Nebari toast renderer. Mount once near the application root, then
 * call `add`, `update`, or `promise` on the global {@link toast} manager (or on
 * a scoped one passed as `toastManager`) from application code. The visible
 * stack is capped at five items by default to match Figma.
 *
 * Accessibility, all supplied by Base UI unless noted:
 *
 * - **Announcements.** The viewport is a polite `aria-live` region labelled
 *   "Notifications". `warning` and `error` toasts are raised to
 *   `priority: 'high'` by {@link withToastA11yDefaults} and additionally
 *   mirrored into a visually hidden `role="alert"`, so they interrupt.
 * - **Keyboard.** `F6` from anywhere moves focus onto the viewport and pauses
 *   the timers. `Tab` from there lands on the frontmost toast, then on its
 *   action and close control in DOM order. `Escape` is handled per toast, so it
 *   dismisses the focused one — the keyboard equivalent of swipe-to-dismiss —
 *   and does nothing while focus is still on the viewport itself. `Shift+Tab`
 *   off the viewport restores focus to where it was and resumes the timers.
 * - **Timers.** Auto-dismiss pauses while the viewport is hovered, holds a
 *   focus-visible element, or the window is blurred, and on touch pointer-down;
 *   it resumes on leave or blur. A `loading` toast never auto-dismisses, and
 *   neither does one carrying an action.
 */
function Toaster({
  children,
  limit = 5,
  portalProps,
  toastManager = toast,
  viewportProps,
  ...props
}: ToasterProps) {
  return (
    <ToastProvider limit={limit} toastManager={toastManager} {...props}>
      {children}
      <ToastPortal {...portalProps}>
        <ToastViewport {...viewportProps}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export type { ToastData, ToasterProps, ToastIconProps, ToastProps, ToastType };
export {
  createToastManager,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastIcon,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  toastIconVariants,
  useToastManager,
};
