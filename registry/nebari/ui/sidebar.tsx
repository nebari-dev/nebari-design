import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import {
  type ComponentProps,
  cloneElement,
  createContext,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

type SidebarState = 'expanded' | 'collapsed';
type DataAttributes = { [key: `data-${string}`]: string | boolean | undefined };
type RenderElement = ReactElement<Record<string, unknown>>;

type SidebarStateProps = {
  collapsed?: boolean;
  state?: SidebarState;
};

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean | ((previous: boolean) => boolean)) => void;
  state: SidebarState;
  toggle: () => void;
};

const DEFAULT_SIDEBAR_CONTEXT: SidebarContextValue = {
  collapsed: false,
  setCollapsed: () => {},
  state: 'expanded',
  toggle: () => {},
};

const SidebarContext = createContext<SidebarContextValue>(
  DEFAULT_SIDEBAR_CONTEXT,
);

type SidebarProviderProps = {
  children: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

function SidebarProvider({
  children,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
}: SidebarProviderProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);

  const collapsed = collapsedProp ?? uncontrolledCollapsed;

  const setCollapsed = useCallback(
    (next: boolean | ((previous: boolean) => boolean)) => {
      const nextCollapsed = typeof next === 'function' ? next(collapsed) : next;

      if (collapsedProp === undefined) {
        setUncontrolledCollapsed(nextCollapsed);
      }

      onCollapsedChange?.(nextCollapsed);
    },
    [collapsed, collapsedProp, onCollapsedChange],
  );

  const toggle = useCallback(() => {
    setCollapsed((previous) => !previous);
  }, [setCollapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      state: collapsed ? 'collapsed' : 'expanded',
      toggle,
    }),
    [collapsed, setCollapsed, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

function useSidebar() {
  return useContext(SidebarContext);
}

function resolveSidebarState(
  { collapsed, state }: SidebarStateProps,
  contextState: SidebarState,
): SidebarState {
  if (state !== undefined) {
    return state;
  }
  if (collapsed !== undefined) {
    return collapsed ? 'collapsed' : 'expanded';
  }
  return contextState;
}

const sidebarVariants = cva(
  'flex h-full shrink-0 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-[var(--ease-standard)]',
  {
    variants: {
      variant: {
        default: '',
        inset: 'shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type SidebarProps = ComponentProps<'aside'> &
  VariantProps<typeof sidebarVariants> &
  SidebarStateProps;

function Sidebar({
  className,
  collapsed,
  state,
  variant,
  ...props
}: SidebarProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);

  return (
    <aside
      className={cn(
        sidebarVariants({ variant }),
        resolvedState === 'collapsed' ? 'w-[72px]' : 'w-64',
        className,
      )}
      data-slot="sidebar"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarTriggerProps = ComponentProps<'button'> & {
  onToggle?: () => void;
  render?: RenderElement;
} & SidebarStateProps;

function SidebarTrigger({
  collapsed,
  className,
  onClick,
  onKeyDown,
  onToggle,
  render,
  state,
  ...props
}: SidebarTriggerProps) {
  const { state: contextState, toggle } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  const handleToggle = onToggle ?? toggle;

  const triggerProps: ComponentProps<'button'> & DataAttributes = {
    'aria-label':
      resolvedState === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar',
    'aria-expanded': resolvedState === 'expanded',
    className: cn(
      'inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
      className,
    ),
    'data-slot': 'sidebar-trigger',
    'data-state': resolvedState,
    onClick: (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        handleToggle();
      }
    },
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    },
    type: 'button',
    ...props,
  };

  if (render && isValidElement<Record<string, unknown>>(render)) {
    const renderProps = render.props as {
      className?: string;
      onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
      onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    };

    return cloneElement(render, {
      ...triggerProps,
      ...renderProps,
      className: cn(triggerProps.className, renderProps.className),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        renderProps.onClick?.(event);
        triggerProps.onClick?.(event);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        renderProps.onKeyDown?.(event);
        triggerProps.onKeyDown?.(event);
      },
    });
  }

  return (
    <button {...triggerProps}>
      <SidebarCollapseIcon
        direction="horizontal"
        expanded={resolvedState === 'expanded'}
      />
    </button>
  );
}

type SidebarSectionProps = ComponentProps<'div'> & SidebarStateProps;

function SidebarHeader({
  className,
  collapsed,
  state,
  ...props
}: SidebarSectionProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <div
      className={cn('flex w-full items-center gap-2 p-2', className)}
      data-slot="sidebar-header"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarHeaderBrandProps = SidebarSectionProps & {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  triggerClassName?: string;
};

function SidebarHeaderBrand({
  className,
  collapsed,
  description,
  icon,
  state,
  title,
  triggerClassName,
  ...props
}: SidebarHeaderBrandProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);

  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-2',
        className,
      )}
      data-slot="sidebar-header-brand"
      data-state={resolvedState}
      {...props}
    >
      {icon && (
        <span
          className="inline-flex size-8 min-w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          data-slot="sidebar-header-brand-icon"
        >
          {icon}
        </span>
      )}
      {(title || description) && (
        <span
          className="min-w-0 flex-1 data-[state=collapsed]:sr-only"
          data-slot="sidebar-header-brand-text"
          data-state={resolvedState}
        >
          {title && (
            <span
              className="block truncate text-sm leading-5 font-medium"
              data-slot="sidebar-menu-label"
            >
              {title}
            </span>
          )}
          {description && (
            <span
              className="block truncate text-xs leading-4 text-muted-foreground"
              data-slot="sidebar-menu-description"
            >
              {description}
            </span>
          )}
        </span>
      )}
      <SidebarTrigger className={cn('text-foreground', triggerClassName)} />
    </div>
  );
}

function SidebarContent({
  className,
  collapsed,
  state,
  ...props
}: SidebarSectionProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-y-auto p-2',
        className,
      )}
      data-slot="sidebar-content"
      data-state={resolvedState}
      {...props}
    />
  );
}

function SidebarFooter({
  className,
  collapsed,
  state,
  ...props
}: SidebarSectionProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <div
      className={cn('mt-auto w-full bg-muted p-2', className)}
      data-slot="sidebar-footer"
      data-state={resolvedState}
      {...props}
    />
  );
}

function SidebarGroup({
  className,
  collapsed,
  state,
  ...props
}: SidebarSectionProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <div
      className={cn('flex w-full flex-col', className)}
      data-slot="sidebar-group"
      data-state={resolvedState}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  collapsed,
  state,
  ...props
}: SidebarSectionProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <div
      className={cn(
        'flex h-6 items-center rounded-sm px-2 py-1 text-[11px] font-medium tracking-[0.3px] text-muted-foreground-strong uppercase',
        resolvedState === 'collapsed' && 'sr-only',
        className,
      )}
      data-slot="sidebar-group-label"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarMenuProps = ComponentProps<'ul'> & SidebarStateProps;

function SidebarMenu({
  className,
  collapsed,
  state,
  ...props
}: SidebarMenuProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <ul
      className={cn('m-0 flex list-none flex-col gap-0.5 p-0', className)}
      data-slot="sidebar-menu"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarMenuItemProps = ComponentProps<'li'> &
  SidebarStateProps & {
    active?: boolean;
  };

function SidebarMenuItem({
  active = false,
  className,
  collapsed,
  state,
  ...props
}: SidebarMenuItemProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <li
      className={cn('m-0 p-0', className)}
      data-active={active || undefined}
      data-slot="sidebar-menu-item"
      data-state={resolvedState}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  'group/sidebar-menu-button inline-flex w-full items-center gap-2 rounded-lg px-2 text-left text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar data-[state=collapsed]:w-8 data-[state=collapsed]:justify-center data-[state=collapsed]:gap-0 data-[state=collapsed]:px-0 data-[state=collapsed]:[&_[data-slot=sidebar-menu-label]]:sr-only data-[state=collapsed]:[&_[data-slot=sidebar-menu-description]]:hidden data-[state=collapsed]:[&_[data-slot=sidebar-menu-trailing]]:hidden',
  {
    variants: {
      variant: {
        default:
          'hover:bg-muted data-[active=true]:bg-muted data-[active=true]:text-foreground',
        ghost:
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
      },
      size: {
        default: 'h-8 py-1',
        sm: 'h-7 py-1 text-sm',
        lg: 'h-9 py-1.5',
        account: 'h-[53px] py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type SidebarMenuButtonProps = ComponentProps<'button'> &
  VariantProps<typeof sidebarMenuButtonVariants> &
  SidebarStateProps & {
    active?: boolean;
    render?: RenderElement;
  };

function SidebarMenuButton({
  active = false,
  className,
  collapsed,
  onClick,
  onKeyDown,
  render,
  size,
  state,
  variant,
  ...props
}: SidebarMenuButtonProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);

  const buttonProps: ComponentProps<'button'> & DataAttributes = {
    className: cn(sidebarMenuButtonVariants({ size, variant }), className),
    'data-active': active || undefined,
    'data-size': size ?? 'default',
    'data-slot': 'sidebar-menu-button',
    'data-state': resolvedState,
    'data-variant': variant ?? 'default',
    onClick,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    },
    type: 'button',
    ...props,
  };

  if (render && isValidElement<Record<string, unknown>>(render)) {
    const renderProps = render.props as {
      className?: string;
      onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
      onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    };

    return cloneElement(render, {
      ...buttonProps,
      ...renderProps,
      className: cn(buttonProps.className, renderProps.className),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        renderProps.onClick?.(event);
        onClick?.(event);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        renderProps.onKeyDown?.(event);
        buttonProps.onKeyDown?.(event);
      },
    });
  }

  return <button {...buttonProps} />;
}

type SidebarMenuSubProps = ComponentProps<'ul'> & SidebarStateProps;

function SidebarMenuSub({
  className,
  collapsed,
  state,
  ...props
}: SidebarMenuSubProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <ul
      className={cn(
        'm-0 my-0.5 ml-4 flex list-none flex-col gap-0 border-l border-sidebar-border pl-4 data-[state=collapsed]:hidden',
        className,
      )}
      data-slot="sidebar-menu-sub"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarMenuSubItemProps = ComponentProps<'li'> & SidebarStateProps;

function SidebarMenuSubItem({
  className,
  collapsed,
  state,
  ...props
}: SidebarMenuSubItemProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <li
      className={cn('m-0 p-0', className)}
      data-slot="sidebar-menu-sub-item"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarMenuSubButtonProps = ComponentProps<'button'> & SidebarStateProps;

function SidebarMenuSubButton({
  className,
  collapsed,
  state,
  ...props
}: SidebarMenuSubButtonProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <button
      className={cn(
        'flex h-7 w-full items-center rounded-lg px-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
        className,
      )}
      data-slot="sidebar-menu-sub-button"
      data-state={resolvedState}
      type="button"
      {...props}
    />
  );
}

type SidebarSeparatorProps = ComponentProps<'hr'> & SidebarStateProps;

function SidebarSeparator({
  className,
  collapsed,
  state,
  ...props
}: SidebarSeparatorProps) {
  const { state: contextState } = useSidebar();
  const resolvedState = resolveSidebarState({ collapsed, state }, contextState);
  return (
    <hr
      className={cn('my-2 border-t border-sidebar-border', className)}
      data-slot="sidebar-separator"
      data-state={resolvedState}
      {...props}
    />
  );
}

type SidebarCollapseIconProps = ComponentProps<'span'> & {
  direction?: 'horizontal' | 'up-down';
  expanded?: boolean;
};

function SidebarCollapseIcon({
  className,
  direction = 'horizontal',
  expanded = false,
  ...props
}: SidebarCollapseIconProps) {
  return (
    <span
      className={cn(
        'inline-flex size-4 items-center justify-center text-muted-foreground',
        className,
      )}
      data-slot="sidebar-collapse-icon"
      data-direction={direction}
      {...props}
    >
      {direction === 'horizontal' ? (
        expanded ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )
      ) : (
        <ChevronsUpDown className="size-4" />
      )}
    </span>
  );
}

export type {
  SidebarMenuButtonProps,
  SidebarMenuItemProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarState,
  SidebarTriggerProps,
};
export {
  Sidebar,
  SidebarCollapseIcon,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderBrand,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  sidebarVariants,
  useSidebar,
};
