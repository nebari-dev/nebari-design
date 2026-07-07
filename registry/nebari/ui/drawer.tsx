import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { XIcon } from 'lucide-react';
import type * as React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

type DrawerSwipeDirection = NonNullable<
  DrawerPrimitive.Root.Props['swipeDirection']
>;
type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

type DrawerContextValue = {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props['modal'];
  showSwipeHandle: boolean;
  side: DrawerSide;
  swipeDirection: DrawerSwipeDirection;
};

type DrawerProps = Omit<DrawerPrimitive.Root.Props, 'swipeDirection'> & {
  /**
   * Visual edge the drawer opens from. `right` matches the desktop side-sheet
   * design; `bottom` renders the mobile/touch sheet with a swipe handle.
   */
  side?: DrawerSide;
  /**
   * Lower-level Base UI swipe direction. Prefer `side` for app code unless you
   * need to align with Base UI's direction naming.
   */
  swipeDirection?: DrawerPrimitive.Root.Props['swipeDirection'];
  /**
   * Shows the grab handle. Defaults to true for bottom drawers and false for
   * side drawers.
   */
  showSwipeHandle?: boolean;
};

type DrawerTriggerProps = DrawerPrimitive.Trigger.Props;
type DrawerCloseProps = DrawerPrimitive.Close.Props;
type DrawerPortalProps = DrawerPrimitive.Portal.Props;
type DrawerOverlayProps = DrawerPrimitive.Backdrop.Props;
type DrawerContentProps = DrawerPrimitive.Popup.Props & {
  /** Renders the default top-right close button. */
  showCloseButton?: boolean;
  /** Props forwarded to the Base UI Portal. */
  portalProps?: DrawerPortalProps;
  /** Class name for the full-screen positioning viewport. */
  viewportClassName?: string;
  /** Class name forwarded to the backdrop overlay. */
  overlayClassName?: DrawerOverlayProps['className'];
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

const sideToSwipeDirection = {
  top: 'up',
  right: 'right',
  bottom: 'down',
  left: 'left',
} satisfies Record<DrawerSide, DrawerSwipeDirection>;

function getDrawerSide(swipeDirection: DrawerSwipeDirection): DrawerSide {
  switch (swipeDirection) {
    case 'up':
      return 'top';
    case 'right':
      return 'right';
    case 'left':
      return 'left';
    case 'down':
      return 'bottom';
  }
}

function useDrawerContext(component: string): DrawerContextValue {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error(`<${component}> must be used within a <Drawer>.`);
  }

  return context;
}

/**
 * Drawer groups modal state, trigger, overlay, content, title, and description.
 * Base UI handles focus trapping, Escape dismissal, focus restoration, outside
 * press dismissal, and swipe-to-dismiss behavior.
 */
function Drawer({
  children,
  modal = true,
  showSwipeHandle,
  side = 'right',
  snapPoints,
  swipeDirection,
  ...props
}: DrawerProps) {
  const resolvedSwipeDirection = swipeDirection ?? sideToSwipeDirection[side];
  const resolvedSide = getDrawerSide(resolvedSwipeDirection);
  const resolvedShowSwipeHandle =
    showSwipeHandle ?? resolvedSwipeDirection === 'down';
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const contextValue = useMemo(
    () => ({
      hasSnapPoints,
      modal,
      showSwipeHandle: resolvedShowSwipeHandle,
      side: resolvedSide,
      swipeDirection: resolvedSwipeDirection,
    }),
    [
      hasSnapPoints,
      modal,
      resolvedShowSwipeHandle,
      resolvedSide,
      resolvedSwipeDirection,
    ],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={resolvedSwipeDirection}
        {...props}
      >
        {children ?? <span data-slot="drawer" hidden />}
      </DrawerPrimitive.Root>
    </DrawerContext.Provider>
  );
}

/** Button that opens the drawer. */
function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

/** Portal used to render drawer overlay and content outside the page flow. */
function DrawerPortal(props: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

/** Button that closes the drawer. */
function DrawerClose(props: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

/** Full-screen scrim shown behind a modal drawer. */
function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={(state) =>
        cn(
          'fixed inset-0 z-50 min-h-dvh bg-scrim opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] select-none data-[starting-style]:opacity-0 data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-snap-points:[--drawer-overlay-min-opacity:0.5] motion-safe:transition-[opacity] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-standard] data-swiping:motion-safe:duration-0 supports-[-webkit-touch-callout:none]:absolute',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

/** Decorative grab handle for bottom drawers. */
function DrawerSwipeHandle({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      data-slot="drawer-swipe-handle"
      className={cn(
        'relative z-10 flex shrink-0 cursor-grab items-center justify-center bg-card py-2 after:block after:h-1.5 after:w-[100px] after:rounded-full after:bg-border-strong active:cursor-grabbing',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Portaled drawer surface with the default overlay, viewport, swipe handle, and
 * optional top-right close button.
 */
function DrawerContent({
  className,
  children,
  showCloseButton = true,
  portalProps,
  viewportClassName,
  overlayClassName,
  ...props
}: DrawerContentProps) {
  const { hasSnapPoints, modal, showSwipeHandle, side, swipeDirection } =
    useDrawerContext('DrawerContent');
  const swipeAxis =
    swipeDirection === 'down' || swipeDirection === 'up' ? 'y' : 'x';

  return (
    <DrawerPortal {...portalProps}>
      {modal === true && (
        <DrawerOverlay
          className={overlayClassName}
          data-snap-points={hasSnapPoints ? '' : undefined}
        />
      )}
      <DrawerPrimitive.Viewport
        data-modal={modal}
        data-slot="drawer-viewport"
        className={cn(
          'pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto',
          viewportClassName,
        )}
      >
        <DrawerPrimitive.Popup
          data-side={side}
          data-slot="drawer-content"
          data-swipe-axis={swipeAxis}
          data-snap-points={hasSnapPoints ? '' : undefined}
          className={(state) =>
            cn(
              'group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex min-h-0 transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-lg outline-none select-none will-change-transform [--bleed:3rem] [--drawer-content-height:var(--drawer-height,auto)] [--drawer-content-max-height:none] [--drawer-content-width:auto] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05] [interpolate-size:allow-keywords] after:pointer-events-none after:absolute after:bg-card data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:h-dvh data-[swipe-axis=x]:w-(--drawer-content-width) data-[swipe-axis=x]:max-w-[calc(100vw-var(--drawer-inset,0px)*2)] data-[swipe-axis=x]:[--drawer-content-width:min(25rem,100vw)] data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:max-h-(--drawer-content-max-height) data-[swipe-axis=y]:w-full data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-3rem)] data-[swipe-axis=y]:data-snap-points:h-dvh data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:rounded-t-lg data-[swipe-direction=down]:after:top-full data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))] data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:rounded-r-lg data-[swipe-direction=left]:after:right-full data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))] data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:rounded-l-lg data-[swipe-direction=right]:after:left-full data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))] data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:rounded-b-lg data-[swipe-direction=up]:after:bottom-full data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))] data-[starting-style]:transform-(--closed-transform) data-[ending-style]:transform-(--closed-transform) data-[ending-style]:opacity-[0.9999] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95 data-nested-drawer-swiping:motion-safe:duration-0 data-swiping:motion-safe:duration-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[opacity,transform] motion-safe:duration-[--duration-slow] motion-safe:ease-[--ease-emphasized]',
              typeof className === 'function' ? className(state) : className,
            )
          }
          {...props}
        >
          {showSwipeHandle && <DrawerSwipeHandle />}
          <DrawerPrimitive.Content
            data-slot="drawer-content-inner"
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit] bg-card select-text group-data-swiping/drawer-popup:select-none"
          >
            {children}
            {showCloseButton && (
              <DrawerClose
                render={
                  <Button
                    className="absolute top-4 right-4 z-10"
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <XIcon aria-hidden="true" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            )}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

/** Layout wrapper for drawer title and description. */
function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex shrink-0 items-start gap-2 border-border border-b bg-card p-4 pr-12 group-data-[swipe-direction=down]/drawer-popup:pt-2',
        className,
      )}
      {...props}
    />
  );
}

/** Scrollable drawer body section for forms, detail panels, or lists. */
function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-y-auto p-4',
        className,
      )}
      {...props}
    />
  );
}

/** Footer area for drawer actions. */
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-border border-t bg-muted p-4',
        className,
      )}
      {...props}
    />
  );
}

/** Accessible drawer title. */
function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={(state) =>
        cn(
          'font-semibold text-base text-foreground leading-5',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

/** Accessible drawer description. */
function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={(state) =>
        cn(
          'text-muted-foreground text-sm leading-5',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerOverlayProps,
  DrawerPortalProps,
  DrawerProps,
  DrawerSide,
  DrawerTriggerProps,
};
export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerSwipeHandle,
  DrawerTitle,
  DrawerTrigger,
};
