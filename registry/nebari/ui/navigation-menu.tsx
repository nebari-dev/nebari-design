import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui-components/react/navigation-menu';
import { useRender } from '@base-ui-components/react/use-render';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type NavigationMenuProps = NavigationMenuPrimitive.Root.Props &
  Pick<
    NavigationMenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >;

type NavigationMenuContentProps = NavigationMenuPrimitive.Content.Props;
type NavigationMenuPositionerProps = NavigationMenuPrimitive.Positioner.Props;
type NavigationMenuTriggerProps = NavigationMenuPrimitive.Trigger.Props;
type NavigationMenuLinkProps = NavigationMenuPrimitive.Link.Props;
type NavButtonProps = useRender.ComponentProps<'button'> & {
  /** Marks the item as the current page or section. */
  active?: boolean;
  /** Optional icon rendered before the label or as the only visible content. */
  icon?: ReactNode;
  /** Optional trailing chevron for expandable menu items. */
  chevron?: boolean;
  /** Removes the item from interaction and applies the muted disabled style. */
  disabled?: boolean;
};
type MenuBarProps = ComponentProps<'header'>;
type MenuBarBrandProps = ComponentProps<'a'>;
type MenuBarNavProps = ComponentProps<'nav'>;
type MenuBarActionsProps = ComponentProps<'div'>;

/**
 * Shared styles for application-level navigation buttons in a menu bar.
 */
const navButtonVariants = cva(
  'relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 font-medium text-foreground text-sm underline-offset-4 outline-none hover:bg-muted hover:underline focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:after:absolute data-[active=true]:after:right-2 data-[active=true]:after:bottom-0 data-[active=true]:after:left-2 data-[active=true]:after:h-0.5 data-[active=true]:after:bg-primary data-[active=true]:after:content-[""] data-[disabled=true]:pointer-events-none data-[disabled=true]:bg-muted/50 data-[disabled=true]:text-muted-foreground data-[disabled=true]:opacity-60 data-[disabled=true]:no-underline motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] motion-safe:active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
);

/**
 * Individual navigation action used inside a {@link MenuBar}. It supports a
 * leading icon, icon-only actions with an `aria-label`, active underline,
 * optional trailing chevron, disabled state, and Base UI's `render` prop for
 * router links. Active items represent the current page, prevent redundant
 * activation, and are removed from sequential keyboard navigation by default.
 */
function NavButton({
  active = false,
  children,
  chevron = false,
  className,
  disabled = false,
  icon,
  onClick,
  ref,
  render = <button type="button" />,
  tabIndex,
  ...props
}: NavButtonProps) {
  function handleClick(event: MouseEvent<HTMLElement>) {
    if (disabled || active) {
      event.preventDefault();
      return;
    }

    onClick?.(event as MouseEvent<HTMLButtonElement>);
  }

  return useRender({
    render,
    ref,
    props: {
      ...props,
      'aria-current': active ? 'page' : undefined,
      'aria-disabled': disabled || undefined,
      children: (
        <>
          {icon}
          {children !== undefined && children !== null ? (
            <span>{children}</span>
          ) : null}
          {chevron ? (
            <ChevronDownIcon aria-hidden="true" className="size-4" />
          ) : null}
        </>
      ),
      className: cn(navButtonVariants(), className),
      'data-active': active ? 'true' : undefined,
      'data-disabled': disabled ? 'true' : undefined,
      'data-slot': 'nav-button',
      disabled: disabled || undefined,
      onClick: handleClick,
      tabIndex: disabled || active ? -1 : tabIndex,
    },
  });
}

/**
 * Full-width application navigation bar with brand, center navigation, and
 * right-side action slots. Compose with {@link MenuBarBrand},
 * {@link MenuBarNav}, {@link MenuBarActions}, and {@link NavButton}.
 */
function MenuBar({ className, ...props }: MenuBarProps) {
  return (
    <header
      data-slot="menu-bar"
      className={cn(
        'flex h-12 w-full items-center gap-3 border-border border-b bg-card px-3 text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Brand slot for the left side of a {@link MenuBar}.
 */
function MenuBarBrand({ className, ...props }: MenuBarBrandProps) {
  return (
    <a
      data-slot="menu-bar-brand"
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-md font-bold text-2xl text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Center navigation slot for a {@link MenuBar}. It lays out `NavButton` items
 * horizontally and lets the right action area align to the far edge.
 */
function MenuBarNav({ className, ...props }: MenuBarNavProps) {
  return (
    <nav
      data-slot="menu-bar-nav"
      className={cn('flex min-w-0 flex-1 items-center gap-1', className)}
      {...props}
    />
  );
}

/**
 * Right-side action slot for notifications, settings, and account controls.
 */
function MenuBarActions({ className, ...props }: MenuBarActionsProps) {
  return (
    <div
      data-slot="menu-bar-actions"
      className={cn('ml-auto flex shrink-0 items-center gap-1.5', className)}
      {...props}
    />
  );
}

/**
 * Shared trigger styles for top-level menu buttons. Triggers reuse the
 * NavButton foundation and add only popup-state behavior; the component appends
 * the dropdown icon.
 */
const navigationMenuTriggerStyle = cva(
  `${navButtonVariants()} group/navigation-menu-trigger w-max data-[popup-open]:bg-muted data-[pressed]:bg-muted disabled:pointer-events-none disabled:opacity-50`,
);

/**
 * Shared link styles for direct navigation links and popup menu links.
 */
const navigationMenuLinkStyle = cva(
  "flex items-start gap-2 rounded-md p-2 text-left text-foreground text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:bg-accent data-active:text-accent-foreground data-[active]:bg-accent data-[active]:text-accent-foreground motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] motion-safe:active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
);

/**
 * Root navigation landmark. It owns Base UI's open state, keyboard navigation,
 * hover/click delays, and the portaled popup positioner.
 */
function NavigationMenu({
  align = 'start',
  alignOffset = 0,
  children,
  className,
  side = 'bottom',
  sideOffset = 8,
  ...props
}: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      />
    </NavigationMenuPrimitive.Root>
  );
}

/**
 * Horizontal or vertical list of navigation menu items.
 */
function NavigationMenuList({
  className,
  render,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        'group flex flex-1 list-none items-center justify-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      render={
        render ??
        ((listProps) => {
          const { 'aria-orientation': _ariaOrientation, ...rest } = listProps;

          return <ul {...rest} />;
        })
      }
      {...props}
    />
  );
}

/**
 * Individual top-level navigation item. Give items explicit `value` props when
 * controlling the menu from application state.
 */
function NavigationMenuItem({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  );
}

/**
 * Button that opens an item's popup content. The chevron is driven by Base UI's
 * `data-popup-open` state and rotates only when motion is allowed.
 */
function NavigationMenuTrigger({
  children,
  className,
  ...props
}: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon
        render={
          <ChevronDownIcon
            aria-hidden="true"
            className="relative top-px size-4 text-muted-foreground motion-safe:transition-transform motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] group-data-[popup-open]/navigation-menu-trigger:rotate-180"
          />
        }
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

/**
 * Popup content for a menu item. Base UI moves active content into the shared
 * viewport; Nebari applies tokenized enter/exit transitions to opacity and
 * transform only.
 */
function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'h-full w-auto p-2 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[activation-direction=left]:data-[starting-style]:-translate-x-2 data-[activation-direction=right]:data-[starting-style]:translate-x-2 data-[activation-direction=left]:data-[ending-style]:translate-x-2 data-[activation-direction=right]:data-[ending-style]:-translate-x-2 motion-safe:transition-[opacity,transform] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-emphasized]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Portaled popup shell positioned against the active trigger. It is rendered by
 * `NavigationMenu` automatically so consumers usually do not need to use this
 * part directly.
 */
function NavigationMenuPositioner({
  align = 'start',
  alignOffset = 0,
  className,
  side = 'bottom',
  sideOffset = 8,
  ...props
}: NavigationMenuPositionerProps) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        data-slot="navigation-menu-positioner"
        className={cn(
          'isolate z-50 max-w-(--available-width) data-[instant]:transition-none',
          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-popup"
          className={cn(
            'relative h-(--popup-height) w-(--popup-width) min-w-56 origin-(--transform-origin) overflow-hidden rounded-md border border-border bg-popover text-popover-foreground opacity-100 shadow-lg ring-1 ring-foreground/10 data-[starting-style]:translate-y-1 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-emphasized]',
          )}
        >
          <NavigationMenuPrimitive.Viewport
            data-slot="navigation-menu-viewport"
            className="relative size-full overflow-hidden"
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

/**
 * Navigation link. Use `active` for the current page and `render` for framework
 * router links that need to preserve Base UI's accessibility props.
 */
function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(navigationMenuLinkStyle(), className)}
      {...props}
    />
  );
}

/**
 * Popup arrow that visually connects the floating menu to its active trigger.
 */
function NavigationMenuIndicator({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Arrow>) {
  return (
    <NavigationMenuPrimitive.Arrow
      data-slot="navigation-menu-indicator"
      className={cn(
        'z-10 flex size-3 rotate-45 rounded-tl-sm border-border border-t border-l bg-popover shadow-sm data-[side=bottom]:-top-1.5 data-[side=top]:-bottom-1.5 data-[side=left]:-right-1.5 data-[side=right]:-left-1.5',
        className,
      )}
      {...props}
    />
  );
}

export type {
  MenuBarActionsProps,
  MenuBarBrandProps,
  MenuBarNavProps,
  MenuBarProps,
  NavButtonProps,
  NavigationMenuContentProps,
  NavigationMenuLinkProps,
  NavigationMenuPositionerProps,
  NavigationMenuProps,
  NavigationMenuTriggerProps,
};
export {
  MenuBar,
  MenuBarActions,
  MenuBarBrand,
  MenuBarNav,
  NavButton,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  navButtonVariants,
  navigationMenuLinkStyle,
  navigationMenuTriggerStyle,
};
