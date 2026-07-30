import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenuItem } from '@/ui/dropdown-menu';
import {
  MenuBar,
  MenuBarActions,
  MenuBarBrand,
  MenuBarNav,
  NavDropdownMenu,
  NavLink,
  navLinkVariants,
} from '@/ui/navigation-menu';

describe('NavigationMenu', () => {
  it('renders a full menu bar with anchor-first navigation links', () => {
    render(
      <MenuBar>
        <MenuBarBrand href="/">App</MenuBarBrand>
        <MenuBarNav aria-label="Primary">
          <NavLink active href="/home">
            Home
          </NavLink>
          <NavLink href="/docs">Docs</NavLink>
        </MenuBarNav>
        <MenuBarActions>
          <NavLink href="/account">Account</NavLink>
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
      'nav-link',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('composes nav links with framework router links', () => {
    render(
      <NavLink render={<a data-router-link="" href="/docs" />}>Docs</NavLink>,
    );

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'data-router-link',
      '',
    );
  });

  it('prevents disabled and current links from activating', async () => {
    const disabledClick = vi.fn();
    const activeClick = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <NavLink disabled href="/disabled" onClick={disabledClick}>
          Disabled
        </NavLink>
        <NavLink active href="/current" onClick={activeClick}>
          Current
        </NavLink>
      </>,
    );

    const disabled = screen.getByRole('link', { name: 'Disabled' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(disabled).toHaveAttribute('tabindex', '-1');

    await user.click(disabled);
    await user.click(screen.getByRole('link', { name: 'Current' }));
    expect(disabledClick).not.toHaveBeenCalled();
    expect(activeClick).not.toHaveBeenCalled();
  });

  it('renders icon-only links with an accessible label', () => {
    render(
      <NavLink
        aria-label="Notifications"
        href="/notifications"
        icon={<span aria-hidden="true" />}
      />,
    );

    const link = screen.getByRole('link', { name: 'Notifications' });
    expect(link).toHaveAttribute('data-slot', 'nav-link');
    expect(link).not.toHaveTextContent(/\S/);
  });

  it('composes dropdown-menu and leaves item behavior to the consumer', async () => {
    const openSettings = vi.fn();
    const user = userEvent.setup();

    render(
      <NavDropdownMenu active trigger="Projects">
        <DropdownMenuItem onClick={openSettings}>Settings</DropdownMenuItem>
        <DropdownMenuItem render={<a href="/profile" />}>
          Profile
        </DropdownMenuItem>
      </NavDropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: /Projects/ });
    expect(trigger).toHaveAttribute('data-slot', 'nav-dropdown-menu-trigger');
    expect(trigger).toHaveAttribute('aria-current', 'page');
    expect(trigger).toHaveTextContent('Projects');

    await user.click(trigger);

    const settings = await screen.findByRole('menuitem', { name: 'Settings' });
    const profile = screen.getByRole('menuitem', { name: 'Profile' });
    expect(profile).toHaveAttribute('href', '/profile');
    expect(
      settings.closest('[data-slot="nav-dropdown-menu-content"]'),
    ).not.toBeNull();

    await user.click(settings);
    expect(openSettings).toHaveBeenCalledOnce();
  });

  it('supports keyboard navigation and returns focus after Escape', async () => {
    const user = userEvent.setup();

    render(
      <NavDropdownMenu trigger="Settings">
        <DropdownMenuItem>Light mode</DropdownMenuItem>
        <DropdownMenuItem>Dark mode</DropdownMenuItem>
        <DropdownMenuItem render={<a href="/about" />}>About</DropdownMenuItem>
      </NavDropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: /Settings/ });
    trigger.focus();
    await user.keyboard('{Enter}');

    const lightMode = await screen.findByRole('menuitem', {
      name: 'Light mode',
    });
    expect(lightMode).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Dark mode' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'About' })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    );

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('menuitem', { name: 'Light mode' })).toBeNull();
  });

  it('supports disabled dropdown triggers and positioning props', () => {
    render(
      <NavDropdownMenu
        contentProps={{ align: 'end', sideOffset: 8 }}
        disabled
        trigger="Disabled menu"
      >
        <DropdownMenuItem>Item</DropdownMenuItem>
      </NavDropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: /Disabled menu/ });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('data-disabled', 'true');
  });

  it('supports an icon-only notifications dropdown trigger', async () => {
    const user = userEvent.setup();

    render(
      <NavDropdownMenu
        icon={<span aria-hidden="true" />}
        trigger={null}
        triggerProps={{
          'aria-label': 'Notifications',
          showExpandIcon: false,
        }}
      >
        <DropdownMenuItem render={<a href="/notifications/build" />}>
          Build completed
        </DropdownMenuItem>
      </NavDropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Notifications' });
    expect(trigger).toHaveAttribute('data-slot', 'nav-dropdown-menu-trigger');

    await user.click(trigger);
    expect(
      await screen.findByRole('menuitem', { name: 'Build completed' }),
    ).toHaveAttribute('href', '/notifications/build');
  });

  it('exposes the shared navbar style helper', () => {
    const classes = navLinkVariants();

    expect(classes).toContain('h-10');
    expect(classes).toContain('focus-visible:ring-2');
    expect(classes).toContain('data-[active=true]:after:bg-primary');
    expect(classes).toContain('motion-safe:duration-[--duration-fast]');
  });
});
