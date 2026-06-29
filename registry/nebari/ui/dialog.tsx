import { Dialog as DialogPrimitive } from '@base-ui-components/react/dialog';
import { XIcon } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

type DialogProps = DialogPrimitive.Root.Props;

function Dialog({ children, ...props }: DialogProps) {
  return (
    <DialogPrimitive.Root {...props}>
      {children ?? <span data-slot="dialog" hidden />}
    </DialogPrimitive.Root>
  );
}

type DialogTriggerProps = DialogPrimitive.Trigger.Props;
type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>;
type DialogOverlayProps = DialogPrimitive.Backdrop.Props;
type DialogContentProps = DialogPrimitive.Popup.Props & {
  /** Renders the default top-right close button. */
  showCloseButton?: boolean;
  /** Props forwarded to the Base UI Portal. */
  portalProps?: DialogPortalProps;
  /** Class name for the full-screen positioning viewport. */
  viewportClassName?: string;
  /** Class name for the backdrop overlay. */
  overlayClassName?: string;
};

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={(state) =>
        cn(
          'fixed inset-0 z-50 bg-foreground/30 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-safe:transition-opacity motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-standard]',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  portalProps,
  viewportClassName,
  overlayClassName,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal {...portalProps}>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Viewport
        data-slot="dialog-viewport"
        className={cn(
          'fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto p-4',
          viewportClassName,
        )}
      >
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={(state) =>
            cn(
              'relative grid max-h-[min(calc(100vh-2rem),42rem)] w-full max-w-lg gap-4 overflow-hidden rounded-md border border-border bg-popover p-6 text-popover-foreground shadow-lg outline-none data-[starting-style]:translate-y-2 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-2 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-emphasized]',
              typeof className === 'function' ? className(state) : className,
            )
          }
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogClose
              render={
                <Button
                  className="absolute top-4 right-4"
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('grid gap-1.5 text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={(state) =>
        cn(
          'font-semibold text-foreground text-lg',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={(state) =>
        cn(
          'text-muted-foreground text-sm',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export type {
  DialogContentProps,
  DialogOverlayProps,
  DialogPortalProps,
  DialogProps,
  DialogTriggerProps,
};
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
