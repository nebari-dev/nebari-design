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
  args: {
    active: false,
    children: 'Dashboard',
    disabled: false,
    href: '/dashboard',
  },
  argTypes: {
    children: {
      description: 'The link label.',
      control: 'text',
    },
    href: {
      description:
        'Destination for the default anchor. Clicks are suppressed while the link is `active` or `disabled`.',
      control: 'text',
    },
    active: {
      description:
        'Marks the link as the current page or section, adding the primary underline indicator.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description:
        'Removes the link from interaction and applies the muted disabled style.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    icon: {
      description:
        'Optional icon rendered before the label, or as the only visible content for an icon-only link.',
      control: false,
    },
    className: { table: { disable: true } },
    render: {
      description:
        'Base UI render-prop composition. Swap the default anchor for a router link while preserving navigation styling and slot attributes.',
      control: false,
      table: { defaultValue: { summary: '<a href="/" />' } },
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

export const Default: Story = {
  name: 'Default',
  render: (args) => <NavLink icon={<Home />} {...args} />,
};

export const SettingsDropdown: Story = {
  name: 'Settings dropdown',
  parameters: { controls: { include: [] } },
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
  parameters: { controls: { include: [] } },
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
      description:
        'Story-only toggle. Which primary nav item is marked `active`.',
      control: 'select',
      options: ['Dashboard', 'Projects', 'Reports'],
      table: { defaultValue: { summary: 'Dashboard' } },
    },
    showSettings: {
      description: 'Story-only toggle for the settings dropdown.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showNotifications: {
      description: 'Story-only toggle for the notifications dropdown.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showAccount: {
      description: 'Story-only toggle for the account dropdown.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    controls: {
      include: [
        'activeItem',
        'showSettings',
        'showNotifications',
        'showAccount',
      ],
    },
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
