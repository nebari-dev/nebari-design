import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Home, Settings, User } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { DropdownMenuItem } from '@/ui/dropdown-menu';
import {
  MenuBar,
  MenuBarActions,
  MenuBarNav,
  NavDropdownMenu,
  NavLink,
} from '@/ui/navigation-menu';

const meta = {
  title: 'Components/Navigation Menu',
  component: NavLink,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Application navigation primitives: anchor-first `NavLink` items and `NavDropdownMenu` for menus composed from the shared dropdown-menu.',
      },
    },
  },
} satisfies Meta<typeof NavLink>;

export default meta;

type Story = StoryObj<typeof meta>;
type CompleteNavbarArgs = {
  activeItem: 'Dashboard' | 'Projects' | 'Reports';
  showAccount: boolean;
  showNotifications: boolean;
  showSettings: boolean;
};
type CompleteNavbarStory = StoryObj<CompleteNavbarArgs>;

function SettingsMenu() {
  return (
    <NavDropdownMenu icon={<Settings />} trigger="Settings">
      <DropdownMenuItem onClick={() => undefined}>Light mode</DropdownMenuItem>
      <DropdownMenuItem onClick={() => undefined}>Dark mode</DropdownMenuItem>
      <DropdownMenuItem render={<a href="/about" />}>About</DropdownMenuItem>
    </NavDropdownMenu>
  );
}

function NotificationsMenu() {
  return (
    <NavDropdownMenu
      contentProps={{ align: 'end' }}
      icon={<Bell />}
      trigger={null}
      triggerClassName="w-10 px-0"
      triggerProps={{
        'aria-label': 'Notifications',
        showExpandIcon: false,
      }}
    >
      <DropdownMenuItem render={<a href="/notifications/build" />}>
        Build completed
      </DropdownMenuItem>
      <DropdownMenuItem render={<a href="/notifications/invite" />}>
        New workspace invitation
      </DropdownMenuItem>
    </NavDropdownMenu>
  );
}

export const NavItem: Story = {
  name: 'Nav item',
  render: () => (
    <NavLink href="/dashboard" icon={<Home />}>
      Dashboard
    </NavLink>
  ),
};

export const SettingsDropdown: Story = {
  name: 'Settings dropdown',
  render: () => <SettingsMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Settings/ }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      page.getByRole('menuitem', { name: 'Light mode' }),
    ).toHaveAttribute('data-highlighted', '');

    await userEvent.keyboard('{ArrowDown}');
    await expect(
      page.getByRole('menuitem', { name: 'Dark mode' }),
    ).toHaveAttribute('data-highlighted', '');
  },
};

export const NavItemVariants: Story = {
  name: 'Nav item variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <NavLink href="/default" icon={<Home />}>
        Default
      </NavLink>
      <NavLink active href="/active" icon={<Home />}>
        Active
      </NavLink>
      <NavLink disabled href="/disabled" icon={<Home />}>
        Disabled
      </NavLink>
      <NavDropdownMenu icon={<Settings />} trigger="With dropdown">
        <DropdownMenuItem render={<a href="/preferences" />}>
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href="/keyboard-shortcuts" />}>
          Keyboard shortcuts
        </DropdownMenuItem>
      </NavDropdownMenu>
    </div>
  ),
};

export const CompleteNavbar: CompleteNavbarStory = {
  name: 'Complete navbar',
  args: {
    activeItem: 'Dashboard',
    showAccount: true,
    showNotifications: true,
    showSettings: true,
  },
  argTypes: {
    activeItem: {
      control: 'select',
      options: ['Dashboard', 'Projects', 'Reports'],
    },
    showAccount: { control: 'boolean' },
    showNotifications: { control: 'boolean' },
    showSettings: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: ({ activeItem, showAccount, showNotifications, showSettings }) => (
    <div className="bg-background p-6 text-foreground">
      <MenuBar>
        <MenuBarNav aria-label="Primary navigation">
          <NavLink
            active={activeItem === 'Dashboard'}
            href="/dashboard"
            icon={<Home />}
          >
            Dashboard
          </NavLink>
          <NavDropdownMenu
            active={activeItem === 'Projects'}
            trigger="Projects"
          >
            <DropdownMenuItem render={<a href="/projects/active" />}>
              Active projects
            </DropdownMenuItem>
            <DropdownMenuItem render={<a href="/projects/archived" />}>
              Archived projects
            </DropdownMenuItem>
          </NavDropdownMenu>
          <NavLink active={activeItem === 'Reports'} href="/reports">
            Reports
          </NavLink>
        </MenuBarNav>
        <MenuBarActions>
          {showSettings ? <SettingsMenu /> : null}
          {showNotifications ? <NotificationsMenu /> : null}
          {showAccount ? (
            <NavDropdownMenu icon={<User />} trigger="Account">
              <DropdownMenuItem render={<a href="/account/profile" />}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => undefined}>
                Sign out
              </DropdownMenuItem>
            </NavDropdownMenu>
          ) : null}
        </MenuBarActions>
      </MenuBar>
    </div>
  ),
};
