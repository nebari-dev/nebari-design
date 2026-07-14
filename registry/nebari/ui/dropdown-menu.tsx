import { Menu as MenuPrimitive } from '@base-ui-components/react/menu';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CircleIcon,
} from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const dropdownMenuItemVariants = cva(
  'relative flex w-full cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring motion-safe:transition-[color,background-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]',
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'text-destructive-foreground data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const dropdownMenuTriggerVariants = cva(
  'inline-flex h-8 items-center justify-center rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-[color,background-color] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard]',
  {
    variants: {
      variant: {
        default:
          'bg-muted hover:bg-accent hover:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground',
        text: 'bg-transparent hover:text-accent-foreground data-[popup-open]:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type DropdownMenuTriggerProps = MenuPrimitive.Trigger.Props &
  VariantProps<typeof dropdownMenuTriggerVariants> & {
    showExpandIcon?: boolean;
    expandIcon?: React.ReactNode;
  };

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

type DropdownMenuItemProps = MenuPrimitive.Item.Props &
  VariantProps<typeof dropdownMenuItemVariants>;

type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props &
  VariantProps<typeof dropdownMenuItemVariants>;

type DropdownMenuRadioItemProps = MenuPrimitive.RadioItem.Props &
  VariantProps<typeof dropdownMenuItemVariants>;

interface DropdownMenuSubmenuProps
  extends Omit<MenuPrimitive.SubmenuRoot.Props, 'children'> {
  children?: React.ReactNode;
  label: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  variant?: NonNullable<
    VariantProps<typeof dropdownMenuItemVariants>['variant']
  >;
}

const DropdownMenuPortal = MenuPrimitive.Portal;

function DropdownMenu({
  children,
  ...props
}: Omit<MenuPrimitive.Root.Props, 'children'> & {
  children?: React.ReactNode;
}) {
  return (
    <MenuPrimitive.Root {...props}>
      {children ?? <span data-slot="dropdown-menu" hidden />}
    </MenuPrimitive.Root>
  );
}

function DropdownMenuTrigger({
  className,
  children,
  variant,
  showExpandIcon = false,
  expandIcon,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      data-variant={variant ?? 'default'}
      className={cn(
        dropdownMenuTriggerVariants({ variant }),
        showExpandIcon && 'gap-1.5',
        className,
      )}
      {...props}
    >
      {children}
      {showExpandIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none inline-flex items-center text-muted-foreground"
          data-slot="dropdown-menu-trigger-icon"
        >
          {expandIcon ?? <ChevronsUpDownIcon className="size-4" />}
        </span>
      )}
    </MenuPrimitive.Trigger>
  );
}

function DropdownMenuGroup({ className, ...props }: MenuPrimitive.Group.Props) {
  return (
    <MenuPrimitive.Group
      data-slot="dropdown-menu-group"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      className="isolate z-50"
      side={side}
      sideOffset={sideOffset}
    >
      <MenuPrimitive.Popup
        data-slot="dropdown-menu-content"
        className={cn(
          'z-50 min-w-60 origin-(--transform-origin) rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-emphasized]',
          className,
        )}
        {...props}
      >
        {children}
      </MenuPrimitive.Popup>
    </MenuPrimitive.Positioner>
  );
}

function DropdownMenuItem({
  className,
  children,
  variant,
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant ?? 'default'}
      className={cn(dropdownMenuItemVariants({ variant }), className)}
      {...props}
    >
      {children}
    </MenuPrimitive.Item>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function DropdownMenuGroupLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-group-label"
      className={cn(
        'px-2 py-1.5 text-[11px] leading-4 font-medium tracking-[0.8px] text-muted-foreground uppercase',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuRadioGroup({
  className,
  ...props
}: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  variant,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-variant={variant ?? 'default'}
      className={cn(dropdownMenuItemVariants({ variant }), 'pr-7', className)}
      {...props}
    >
      <span className="flex flex-1 items-center">{children}</span>
      <MenuPrimitive.CheckboxItemIndicator
        className="pointer-events-none absolute right-1.5 inline-flex size-4 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <CheckIcon className="size-4" />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  variant,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-variant={variant ?? 'default'}
      className={cn(dropdownMenuItemVariants({ variant }), 'pr-7', className)}
      {...props}
    >
      <span className="flex flex-1 items-center">{children}</span>
      <MenuPrimitive.RadioItemIndicator
        className="pointer-events-none absolute right-1.5 inline-flex size-4 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <CircleIcon className="size-2.5 fill-current" />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSubmenu({
  children,
  contentClassName,
  label,
  triggerClassName,
  variant = 'default',
  ...props
}: DropdownMenuSubmenuProps) {
  return (
    <MenuPrimitive.SubmenuRoot {...props}>
      <MenuPrimitive.SubmenuTrigger
        data-slot="dropdown-menu-submenu-trigger"
        data-variant={variant}
        className={cn(
          dropdownMenuItemVariants({ variant }),
          'pr-7',
          triggerClassName,
        )}
      >
        <span className="flex flex-1 items-center">{label}</span>
        <ChevronRightIcon className="absolute right-1.5 size-4" />
      </MenuPrimitive.SubmenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          className={contentClassName}
          side="right"
          sideOffset={6}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </MenuPrimitive.SubmenuRoot>
  );
}

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSubmenuProps,
  DropdownMenuTriggerProps,
};
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubmenu,
  DropdownMenuTrigger,
  dropdownMenuItemVariants,
  dropdownMenuTriggerVariants,
};
