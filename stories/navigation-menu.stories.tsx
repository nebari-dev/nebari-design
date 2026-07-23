import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  CreditCard,
  Home,
  Info,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import type { HTMLAttributes } from 'react';
import {
  MenuBar,
  MenuBarActions,
  MenuBarNav,
  NavButton,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuLinkStyle,
} from '@/ui/navigation-menu';

const meta = {
  title: 'Components/Navigation Menu',
  component: NavButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Application navigation primitives: `NavButton` for individual nav items and Base UI navigation-menu parts for dropdown navigation.',
      },
    },
  },
} satisfies Meta<typeof NavButton>;

export default meta;

type Story = StoryObj<typeof meta>;
type CompleteNavbarArgs = {
  activeItem: 'Dashboard' | 'Projects' | 'Reports';
  showAccount: boolean;
  showNotifications: boolean;
  showSettings: boolean;
};
type CompleteNavbarStory = StoryObj<CompleteNavbarArgs>;

function renderNavLink(href: string) {
  return (props: HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {props.children}
    </a>
  );
}

function AvatarIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-7 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-xs"
    >
      AL
    </span>
  );
}

function SettingsMenu() {
  return (
    <NavigationMenu aria-label="Settings navigation">
      <NavigationMenuList>
        <NavigationMenuItem value="settings">
          <NavigationMenuTrigger>
            <Settings />
            Settings
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-56">
            <div className="grid gap-1">
              <button type="button" className={navigationMenuLinkStyle()}>
                <Sun />
                Light mode
              </button>
              <button type="button" className={navigationMenuLinkStyle()}>
                <Moon />
                Dark mode
              </button>
              <NavigationMenuLink href="/about">
                <Info />
                About
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function AccountMenu() {
  return (
    <NavigationMenu aria-label="Account navigation">
      <NavigationMenuList>
        <NavigationMenuItem value="account">
          <NavigationMenuTrigger>
            <AvatarIcon />
            Account
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-56">
            <div className="grid gap-1">
              <NavigationMenuLink href="/account/profile">
                <User />
                Profile
              </NavigationMenuLink>
              <NavigationMenuLink href="/account/billing">
                <CreditCard />
                Billing
              </NavigationMenuLink>
              <NavigationMenuLink href="/logout">
                <LogOut />
                Sign out
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const NavItem: Story = {
  name: 'Nav item',
  parameters: {
    docs: {
      description: {
        story:
          'A single `NavButton` with an icon and label. Use `render` to compose it as a router link.',
      },
    },
  },
  render: () => (
    <NavButton icon={<Home />} render={renderNavLink('/dashboard')}>
      Dashboard
    </NavButton>
  ),
};

export const SettingsDropdown: Story = {
  name: 'Settings dropdown',
  parameters: {
    docs: {
      description: {
        story:
          'A settings trigger with dropdown links. Click the trigger in Storybook to open the menu.',
      },
    },
  },
  render: () => <SettingsMenu />,
};

export const NavItemVariants: Story = {
  name: 'Nav item variants',
  parameters: {
    docs: {
      description: {
        story:
          '`NavButton` supports default, active, and disabled states. Use `NavigationMenuTrigger` for items that open dropdown menus.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <NavButton icon={<Home />} render={renderNavLink('/default')}>
        Default
      </NavButton>
      <NavButton active icon={<Home />} render={renderNavLink('/active')}>
        Active
      </NavButton>
      <NavButton disabled icon={<Home />} render={renderNavLink('/disabled')}>
        Disabled
      </NavButton>
      <NavigationMenu aria-label="More navigation">
        <NavigationMenuList>
          <NavigationMenuItem value="more">
            <NavigationMenuTrigger>
              <Settings />
              With dropdown
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-48">
              <div className="grid gap-1">
                <NavigationMenuLink href="/preferences">
                  Preferences
                </NavigationMenuLink>
                <NavigationMenuLink href="/keyboard-shortcuts">
                  Keyboard shortcuts
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  ),
};

export const AvatarDropdown: Story = {
  name: 'Avatar area with dropdown',
  parameters: {
    docs: {
      description: {
        story:
          'An account/avatar trigger with dropdown actions. Click the trigger in Storybook to open the menu.',
      },
    },
  },
  render: () => <AccountMenu />,
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
    docs: {
      description: {
        story:
          'A complete application navbar with Storybook controls for active item and optional action areas.',
      },
    },
  },
  render: ({ activeItem, showAccount, showNotifications, showSettings }) => (
    <div className="bg-background p-6 text-foreground">
      <MenuBar>
        <MenuBarNav aria-label="Primary navigation">
          <NavButton
            active={activeItem === 'Dashboard'}
            icon={<Home />}
            render={renderNavLink('/dashboard')}
          >
            Dashboard
          </NavButton>
          <NavigationMenu aria-label="Projects navigation">
            <NavigationMenuList>
              <NavigationMenuItem value="projects">
                <NavigationMenuTrigger
                  data-active={activeItem === 'Projects' ? 'true' : undefined}
                >
                  Projects
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-56">
                  <div className="grid gap-1">
                    <NavigationMenuLink href="/projects/active">
                      Active projects
                    </NavigationMenuLink>
                    <NavigationMenuLink href="/projects/archived">
                      Archived projects
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <NavButton
            active={activeItem === 'Reports'}
            render={renderNavLink('/reports')}
          >
            Reports
          </NavButton>
        </MenuBarNav>
        <MenuBarActions>
          {showSettings ? <SettingsMenu /> : null}
          {showNotifications ? (
            <NavButton
              aria-label="Notifications"
              className="w-10 px-0"
              icon={<Bell />}
              render={renderNavLink('/notifications')}
            />
          ) : null}
          {showAccount ? <AccountMenu /> : null}
        </MenuBarActions>
      </MenuBar>
    </div>
  ),
};
