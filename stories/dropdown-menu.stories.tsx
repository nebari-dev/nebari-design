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
    showExpandIcon: false,
    variant: 'default',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Visible trigger label.',
    },
    showExpandIcon: {
      control: 'boolean',
      description: 'Shows trailing expand icon on trigger.',
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
      description: 'Trigger visual style variant.',
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
  render: () => {
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [wrapLines, setWrapLines] = useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
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
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>File</DropdownMenuTrigger>
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
  render: () => (
    <div className="flex items-center gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger showExpandIcon>Open</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Dropdown Menu Item Text</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger showExpandIcon variant="ghost">
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
