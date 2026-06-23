import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = ComponentProps<'textarea'>;

/**
 * Textarea is the multi-line text-entry primitive — a styled native
 * `<textarea>` that mirrors `Input`'s border, focus ring, disabled, and invalid
 * states from the Nebari Figma spec. To associate it inside a `Field`, render it
 * as the control: `<Field.Control render={<Textarea />} />`; standalone, pair it
 * with `Label` via `htmlFor` / `id`.
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-1.5 text-foreground text-sm outline-none placeholder:text-muted-foreground motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] hover:border-border-strong focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive-foreground aria-invalid:focus-visible:ring-destructive-foreground data-[invalid]:border-destructive-foreground',
        className,
      )}
      {...props}
    />
  );
}

export type { TextareaProps };
export { Textarea };
