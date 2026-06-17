import { Switch as SwitchPrimitive } from '@base-ui-components/react/switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root>;

/**
 * Switch implemented from the Nebari Figma spec on top of Base UI's `Switch`.
 * Toggles a single setting on or off with immediate effect — reach for this
 * instead of `Checkbox` when the change applies instantly rather than on form
 * submit. Controlled via `checked` / `onCheckedChange`, or uncontrolled via
 * `defaultChecked`.
 *
 * Base UI threads `data-checked` / `data-unchecked` / `data-disabled` onto both
 * the root track and the thumb, which drive every visual state below.
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[checked]:bg-primary data-[checked]:hover:bg-primary-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[unchecked]:bg-muted-foreground/40 data-[unchecked]:hover:bg-muted-foreground/70',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform data-[checked]:translate-x-3.5 data-[unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export type { SwitchProps };
export { Switch };
