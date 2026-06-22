import { Field as FieldPrimitive } from '@base-ui-components/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Field groups a form control with its label, description, and validation
 * message, wiring the accessible-name and `aria-describedby` associations
 * automatically. Compose it with controls like `Switch` or `Checkbox`: Base UI
 * threads the ids through context, so a `role="switch"` element gets named by
 * `FieldLabel` without any manual `htmlFor` / `id` juggling. Defaults to a
 * vertical stack — override `className` (e.g. `flex-row`) for inline layouts.
 */
function Field({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Root>) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  );
}

/** The accessible label for the field's control. Renders a `<label>`. */
function FieldLabel({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Label>) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        'font-medium text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

/** Supplementary description, linked to the control via `aria-describedby`. */
function FieldDescription({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/** Validation message shown when the control fails its constraints. */
function FieldError({
  className,
  ...props
}: ComponentProps<typeof FieldPrimitive.Error>) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn('text-destructive-foreground text-sm', className)}
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldError, FieldLabel };
