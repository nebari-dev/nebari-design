import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { HTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  MenuBar,
  MenuBarActions,
  MenuBarBrand,
  MenuBarNav,
  NavButton,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navButtonVariants,
  navigationMenuLinkStyle,
  navigationMenuTriggerStyle,
} from '@/ui/navigation-menu';

function renderNavLink(href: string) {
  return (props: HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {props.children}
    </a>
  );
}

function TestNavigationMenu() {
  return (
    <NavigationMenu aria-label="Main" delay={0}>
      <NavigationMenuList>
        <NavigationMenuItem value="platform">
          <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/workspaces">
              Workspaces
            </NavigationMenuLink>
            <NavigationMenuLink href="/environments">
              Environments
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink active href="/docs">
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe('NavigationMenu', () => {
  it('renders a full menu bar with brand, nav, actions, and active nav button', () => {
    render(
      <MenuBar>
        <MenuBarBrand href="/">App</MenuBarBrand>
        <MenuBarNav aria-label="Primary">
          <NavButton active render={renderNavLink('/home')}>
            Home
          </NavButton>
          <NavButton render={renderNavLink('/docs')}>Docs</NavButton>
        </MenuBarNav>
        <MenuBarActions>
          <NavButton render={renderNavLink('/account')}>Account</NavButton>
        </MenuBarActions>
      </MenuBar>,
    );

    expect(screen.getByRole('banner')).toHaveAttribute('data-slot', 'menu-bar');
    expect(screen.getByRole('link', { name: 'App' })).toHaveAttribute(
      'data-slot',
      'menu-bar-brand',
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveAttribute(
      'data-slot',
      'menu-bar-nav',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-slot',
      'nav-button',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByText('Account').closest('div')).toHaveAttribute(
      'data-slot',
      'menu-bar-actions',
    );
  });

  it('supports disabled nav buttons without firing click handlers', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <NavButton disabled onClick={onClick} render={renderNavLink('/disabled')}>
        Disabled
      </NavButton>,
    );

    const link = screen.getByRole('link', { name: 'Disabled' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');

    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('skips active nav buttons in tab order and prevents redundant activation', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <NavButton active onClick={onClick} render={renderNavLink('/current')}>
        Current
      </NavButton>,
    );

    const link = screen.getByRole('link', { name: 'Current' });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('tabindex', '-1');

    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('composes nav buttons with the render prop', () => {
    render(
      <NavButton render={<button type="button" />} icon={<span />}>
        Menu Item
      </NavButton>,
    );

    const button = screen.getByRole('button', { name: 'Menu Item' });
    expect(button).toHaveAttribute('data-slot', 'nav-button');
  });

  it('supports icon-only nav buttons with an accessible label', () => {
    render(
      <NavButton
        aria-label="Notifications"
        icon={<span aria-hidden="true" />}
        render={renderNavLink('/notifications')}
      />,
    );

    const link = screen.getByRole('link', { name: 'Notifications' });
    expect(link).toHaveAttribute('data-slot', 'nav-button');
    expect(link).not.toHaveTextContent(/\S/);
  });

  it('renders the root, list, items, trigger, and links with stable data hooks', () => {
    render(<TestNavigationMenu />);

    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveAttribute(
      'data-slot',
      'navigation-menu',
    );
    expect(screen.getByRole('list')).toHaveAttribute(
      'data-slot',
      'navigation-menu-list',
    );
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute(
      'data-slot',
      'navigation-menu-item',
    );
    expect(screen.getByRole('button', { name: /Platform/ })).toHaveAttribute(
      'data-slot',
      'navigation-menu-trigger',
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'data-slot',
      'navigation-menu-link',
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'data-active',
    );
  });

  it('opens popup content when a trigger is pressed', async () => {
    const user = userEvent.setup();
    render(<TestNavigationMenu />);

    expect(screen.queryByRole('link', { name: 'Workspaces' })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Platform/ }));

    const link = await screen.findByRole('link', { name: 'Workspaces' });
    expect(link).toHaveAttribute('href', '/workspaces');
    const content = link.closest('[data-slot="navigation-menu-content"]');
    expect(content).toHaveClass('motion-safe:transition-[opacity,transform]');
    expect(content?.className).not.toContain('focus:ring-0');
    expect(link.closest('[data-slot="navigation-menu-popup"]')).toHaveAttribute(
      'data-slot',
      'navigation-menu-popup',
    );
  });

  it('composes links with the render prop', async () => {
    render(
      <NavigationMenu aria-label="Main" delay={0}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink render={<a data-router-link="" href="/docs" />}>
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-router-link', '');
    expect(link).toHaveAttribute('data-slot', 'navigation-menu-link');
  });

  it('exposes style helpers for external composition', () => {
    const navButtonClasses = navButtonVariants();
    const triggerClasses = navigationMenuTriggerStyle();

    expect(navButtonClasses).toContain('h-10');
    expect(navButtonClasses).toContain('rounded-md');
    expect(navButtonClasses).toContain('focus-visible:ring-2');
    expect(navButtonClasses).not.toContain('ring-offset');
    expect(navButtonClasses).toContain('data-[active=true]:after:bg-primary');
    expect(navButtonClasses).toContain('data-[disabled=true]:bg-muted/50');
    for (const className of navButtonClasses.split(' ')) {
      expect(triggerClasses).toContain(className);
    }
    expect(triggerClasses).toContain('data-[popup-open]:bg-muted');
    expect(triggerClasses).toContain('motion-safe:duration-[--duration-fast]');
    expect(navigationMenuLinkStyle()).toContain('data-active:bg-accent');
    expect(navigationMenuLinkStyle()).toContain('focus-visible:ring-2');
    expect(navigationMenuLinkStyle()).not.toContain('ring-offset');
    expect(navigationMenuLinkStyle()).toContain(
      'motion-safe:transition-[color,background-color,border-color,opacity,transform]',
    );
  });

  it('renders an anchored popup shell when controlled open', async () => {
    render(
      <NavigationMenu aria-label="Main" value="platform">
        <NavigationMenuList>
          <NavigationMenuItem value="platform">
            <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/workspaces">
                Workspaces
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Workspaces' })).toBeVisible();
    });

    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveClass(
      'group/navigation-menu',
    );
    expect(screen.getByRole('button', { name: /Platform/ })).toHaveAttribute(
      'data-popup-open',
    );
  });

  // CSS transitions and anchored geometry are not fully testable in jsdom;
  // the Storybook examples exercise the animated popup in a browser.
});
