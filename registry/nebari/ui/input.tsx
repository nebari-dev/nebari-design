import { Input as InputPrimitive } from '@base-ui-components/react/input';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type InputProps = ComponentProps<typeof InputPrimitive>;

/**
 * Input is the single-line text-entry primitive, implemented from the Nebari
 * Figma spec on top of Base UI's `Input`. Dropped inside a `Field`, it wires its
 * accessible name and `aria-describedby` to `FieldLabel` / `FieldDescription`
 * automatically — no manual `htmlFor` / `id`. Standalone, pair it with `Label`
 * via `htmlFor` / `id`.
 *
 * States map to the design: `border-input` at rest, `border-border-strong` on
 * hover, a `ring` focus outline, `bg-muted` + dimmed when disabled, and a
 * `destructive` border when the field is invalid (driven by `aria-invalid` /
 * Base UI's `data-invalid`).
 */
function Input({ className, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-foreground text-sm outline-none placeholder:text-muted-foreground motion-safe:transition-[color,background-color,border-color,box-shadow] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] hover:border-border-strong focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive-foreground aria-invalid:focus-visible:ring-destructive-foreground data-[invalid]:border-destructive-foreground',
        className,
      )}
      {...props}
    />
  );
}

export type { InputProps };
export { Input };
