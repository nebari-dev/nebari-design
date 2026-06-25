import type * as React from 'react';
import { cn } from '@/lib/utils';

/** Responsive table frame with Nebari border, radius, and surface styling. */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-md border border-border bg-background"
    >
      <table
        data-slot="table"
        className={cn(
          'w-full border-collapse caption-bottom text-left text-sm',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-muted [&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border data-[state=selected]:bg-muted motion-safe:transition-[color,background-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  onClick,
  onKeyDown,
  tabIndex,
  ...props
}: React.ComponentProps<'th'>) {
  const isInteractive = onClick != null;

  return (
    <th
      {...props}
      data-slot="table-head"
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      className={cn(
        'relative h-10 px-4 text-left align-middle font-medium text-foreground text-xs leading-4 whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        isInteractive &&
          'cursor-pointer underline-offset-4 hover:bg-muted-foreground/10 hover:underline focus:z-10 focus:bg-muted-foreground/10 focus:outline-none focus:after:pointer-events-none focus:after:absolute focus:after:inset-0 focus:after:border-2 focus:after:border-ring focus:after:content-[""] first:focus:after:rounded-tl-[calc(var(--radius-md)-1px)] last:focus:after:rounded-tr-[calc(var(--radius-md)-1px)] motion-safe:transition-[color,background-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]',
        className,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (
          event.defaultPrevented ||
          !isInteractive ||
          (event.key !== 'Enter' && event.key !== ' ')
        ) {
          return;
        }

        event.preventDefault();
        event.currentTarget.click();
      }}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'h-12 px-4 py-3 align-middle text-foreground text-sm leading-5 hover:bg-muted/50 motion-safe:transition-[color,background-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('px-4 py-3 text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
