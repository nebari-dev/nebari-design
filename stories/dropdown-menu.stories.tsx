import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubmenu,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

const meta = {
  title: 'Components/Dropdown Menu',
  component: DropdownMenuTrigger,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a menu of actions or options triggered by a button. Composed of grouped items, labels, and separators.',
      },
    },
  },
  args: {
    children: 'Open',
    disabled: false,
    showExpandIcon: false,
    variant: 'default',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Visible trigger label.',
    },
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description:
        'Trigger visual style variant. Every variant other than `default` defers to the matching `Button` variant.',
      table: { defaultValue: { summary: 'default' } },
    },
    showExpandIcon: {
      control: 'boolean',
      description:
        'Shows the trailing chevron expand icon on the trigger, and adds the gap for it.',
      table: { defaultValue: { summary: 'false' } },
    },
    expandIcon: {
      control: false,
      description:
        'Replaces the default `chevrons-up-down` icon shown when `showExpandIcon` is set.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the trigger so the menu can no longer be opened.',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
    render: {
      description:
        'Base UI render-prop composition. Swap the trigger element while preserving its behavior, styling, and slot attributes.',
      control: false,
    },
  },
} satisfies Meta<typeof DropdownMenuTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger {...args} />
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Label text</DropdownMenuGroupLabel>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Label text</DropdownMenuGroupLabel>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  // The menu items are the subject; the trigger knobs still apply.
  parameters: {
    controls: { include: ['variant', 'showExpandIcon', 'disabled'] },
  },
  render: ({ children: _children, ...args }) => {
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [wrapLines, setWrapLines] = useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger {...args}>Options</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuGroupLabel>View</DropdownMenuGroupLabel>
              <DropdownMenuCheckboxItem
                checked={showLineNumbers}
                onCheckedChange={setShowLineNumbers}
              >
                Show line numbers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={wrapLines}
                onCheckedChange={setWrapLines}
              >
                Wrap lines
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    );
  },
};

export const WithSubmenu: Story = {
  parameters: {
    controls: { include: ['variant', 'showExpandIcon', 'disabled'] },
  },
  render: ({ children: _children, ...args }) => (
    <DropdownMenu>
      <DropdownMenuTrigger {...args}>File</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuItem>New file</DropdownMenuItem>
          <DropdownMenuItem>Open...</DropdownMenuItem>
          <DropdownMenuSubmenu label="Share">
            <DropdownMenuItem>Email link</DropdownMenuItem>
            <DropdownMenuItem>Copy URL</DropdownMenuItem>
            <DropdownMenuItem>Invite collaborators</DropdownMenuItem>
          </DropdownMenuSubmenu>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  ),
};

export const TriggerVariants: Story = {
  // Each trigger fixes its own `variant` and `showExpandIcon`.
  parameters: { controls: { include: ['disabled'] } },
  render: ({ disabled }) => (
    <div className="flex items-center gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled} showExpandIcon>
          Open
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled} showExpandIcon variant="ghost">
          Open
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  ),
};
