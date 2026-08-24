import { Menu } from '@base-ui/react/menu';
import { useRender } from '@base-ui/react/use-render';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type BreadcrumbProps = ComponentProps<'nav'>;
type BreadcrumbListProps = ComponentProps<'ol'>;
type BreadcrumbItemProps = ComponentProps<'li'>;
type BreadcrumbLinkProps = useRender.ComponentProps<'a'>;
type BreadcrumbPageProps = ComponentProps<'span'>;
type BreadcrumbSeparatorProps = Omit<ComponentProps<'li'>, 'children'>;
type BreadcrumbEllipsisProps = Omit<Menu.Trigger.Props, 'children'>;
type BreadcrumbDropdownProps = Menu.Root.Props;
type BreadcrumbDropdownTriggerProps = Menu.Trigger.Props;
type BreadcrumbDropdownContentProps = Menu.Popup.Props &
  Pick<Menu.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>;
type BreadcrumbDropdownItemProps = Menu.Item.Props;

/**
 * Breadcrumb is the navigation landmark for a hierarchy trail. It sets the
 * accessible `breadcrumb` label expected by assistive technology and leaves the
 * visible structure to the composed list, item, link, page, and separator parts.
 */
function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn('min-w-0', className)}
      {...props}
    />
  );
}

/**
 * Ordered list wrapper for breadcrumb items and separators. The list stays on
 * one line by default so consumers can explicitly collapse omitted segments
 * into a {@link BreadcrumbDropdown}. Pass `flex-wrap whitespace-normal` through
 * `className` only when wrapping is the intended overflow behavior.
 */
function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex min-w-0 flex-nowrap items-center gap-1.5 whitespace-nowrap text-muted-foreground text-sm leading-5 sm:gap-2.5',
        className,
      )}
      {...props}
    />
  );
}

/**
 * List item wrapper for a single link, current page, or collapsed breadcrumb
 * affordance.
 */
function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

/**
 * Navigable breadcrumb segment. Base UI's `render` prop lets consumers render a
 * router-specific link component while keeping Nebari styling and `data-slot`
 * hooks (`<BreadcrumbLink render={<a href="/docs" />}>Docs</BreadcrumbLink>`).
 */
function BreadcrumbLink({
  className,
  ref,
  render,
  ...props
}: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      'data-slot': 'breadcrumb-link',
      className: cn(
        'rounded-[4px] outline-none underline-offset-4 hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[color,box-shadow] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard)',
        className,
      ),
      ...props,
    },
  });
}

/**
 * Current, non-navigable breadcrumb segment. It advertises `aria-current="page"`
 * and `aria-disabled` so screen readers distinguish it from prior links.
 */
function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      aria-current="page"
      aria-disabled="true"
      data-slot="breadcrumb-page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  );
}

/** Visual chevron separator between breadcrumb segments. */
function BreadcrumbSeparator({
  className,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <li
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      role="presentation"
      className={cn(
        'flex items-center text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    >
      <ChevronRightIcon aria-hidden="true" />
    </li>
  );
}

/**
 * Menu trigger for omitted middle segments in a collapsed breadcrumb trail.
 * Compose it inside {@link BreadcrumbDropdown} with a matching
 * {@link BreadcrumbDropdownContent} menu of hidden ancestor links.
 */
function BreadcrumbEllipsis({
  'aria-label': ariaLabel = 'Show more breadcrumbs',
  className,
  type = 'button',
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <Menu.Trigger
      aria-label={ariaLabel}
      data-slot="breadcrumb-ellipsis"
      type={type}
      className={cn(
        'flex size-5 items-center justify-center rounded-[4px] text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[color,box-shadow] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden="true" />
      <span className="sr-only">More breadcrumbs</span>
    </Menu.Trigger>
  );
}

/**
 * Dropdown breadcrumb root. Use it when available width cannot fit the whole
 * trail: the current route stays visible as the trigger, while earlier
 * breadcrumb links move into the menu.
 */
function BreadcrumbDropdown({
  modal = false,
  ...props
}: BreadcrumbDropdownProps) {
  return <Menu.Root modal={modal} {...props} />;
}

/**
 * Current-route menu trigger for a dropdown breadcrumb. It renders as a button,
 * marks itself as the current page, and appends the design caret.
 */
function BreadcrumbDropdownTrigger({
  'aria-current': ariaCurrent = 'page',
  className,
  children,
  type = 'button',
  ...props
}: BreadcrumbDropdownTriggerProps) {
  return (
    <Menu.Trigger
      aria-current={ariaCurrent}
      data-slot="breadcrumb-dropdown-trigger"
      type={type}
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] font-normal text-foreground outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[popup-open]:text-foreground motion-safe:transition-[color,box-shadow] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) [&_svg]:size-3.5 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon aria-hidden="true" />
    </Menu.Trigger>
  );
}

/**
 * Dropdown surface for previous breadcrumb segments. The popup is portaled and
 * positioned against {@link BreadcrumbDropdownTrigger}.
 */
function BreadcrumbDropdownContent({
  align = 'end',
  alignOffset = 0,
  className,
  side = 'bottom',
  sideOffset = 6,
  ...props
}: BreadcrumbDropdownContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <Menu.Popup
          data-slot="breadcrumb-dropdown-content"
          className={cn(
            'min-w-44 rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-base) motion-safe:ease-(--ease-emphasized)',
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

/**
 * Menu item for a previous breadcrumb segment. Render it as a link with
 * `render={<a href="/path" />}` so selecting the item navigates to that
 * ancestor route.
 */
function BreadcrumbDropdownItem({
  className,
  ...props
}: BreadcrumbDropdownItemProps) {
  return (
    <Menu.Item
      data-slot="breadcrumb-dropdown-item"
      className={cn(
        'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export type {
  BreadcrumbDropdownContentProps,
  BreadcrumbDropdownItemProps,
  BreadcrumbDropdownProps,
  BreadcrumbDropdownTriggerProps,
  BreadcrumbEllipsisProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbProps,
  BreadcrumbSeparatorProps,
};
export {
  Breadcrumb,
  BreadcrumbDropdown,
  BreadcrumbDropdownContent,
  BreadcrumbDropdownItem,
  BreadcrumbDropdownTrigger,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
