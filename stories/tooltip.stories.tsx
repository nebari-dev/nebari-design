import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleHelpIcon, CopyIcon } from 'lucide-react';
import { Button } from '@/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: TooltipContent,
  args: {
    align: 'center',
    alignOffset: 0,
    children: 'This is a tooltip',
    showArrow: true,
    side: 'top',
    sideOffset: 8,
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Supplemental tooltip text.',
      table: { type: { summary: 'ReactNode' } },
    },
    side: {
      control: 'select',
      description: 'Preferred side of the trigger to render against.',
      options: ['top', 'right', 'bottom', 'left'],
      table: { defaultValue: { summary: 'top' } },
    },
    align: {
      control: 'select',
      description: 'Cross-axis alignment against the trigger.',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: 'center' } },
    },
    sideOffset: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
      description: 'Distance between the trigger and tooltip.',
      table: { defaultValue: { summary: '8' } },
    },
    alignOffset: {
      control: { type: 'number', min: -24, max: 24, step: 1 },
      description: 'Offset applied along the alignment axis.',
      table: { defaultValue: { summary: '0' } },
    },
    showArrow: {
      control: 'boolean',
      description: 'Whether to render the anchored arrow.',
      table: { defaultValue: { summary: 'true' } },
    },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    portalProps: { table: { disable: true } },
    render: {
      description:
        'Base UI render-prop composition. Swap the tooltip content element while preserving positioning, styling, and slot attributes.',
      control: false,
    },
    role: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact, non-interactive surface for supplemental information, shown on hover or keyboard focus.',
      },
    },
  },
} satisfies Meta<typeof TooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

const triggerButtonClassName = 'min-w-24 leading-none';

export const Default: Story = {
  render: ({ children, ...args }) => (
    <Tooltip>
      <TooltipTrigger
        render={<Button className={triggerButtonClassName} variant="outline" />}
      >
        Hover me
      </TooltipTrigger>
      <TooltipContent {...args}>{children}</TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  parameters: {
    controls: {
      include: [],
    },
  },
  render: ({ children: _children, side: _side, ...args }) => (
    <div className="grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-4">
      {(['left', 'top', 'bottom', 'right'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger
            render={
              <Button className={triggerButtonClassName} variant="outline" />
            }
          >
            <span className="capitalize">{side}</span>
          </TooltipTrigger>
          <TooltipContent {...args} side={side}>
            <span className="capitalize">{side}</span> Tooltip
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const SupplementalInfo: Story = {
  name: 'Supplemental info',
  parameters: { controls: { include: [] } },
  render: ({ children: _children, ...args }) => (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">Workspace settings</span>
      <Tooltip>
        <TooltipTrigger
          aria-label="Workspace settings details"
          render={
            <Button size="icon" variant="ghost">
              <CircleHelpIcon />
            </Button>
          }
        />
        <TooltipContent {...args}>
          Configure compute, access, and notifications.
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithShortcut: Story = {
  name: 'With shortcut',
  parameters: { controls: { include: [] } },
  render: ({ children: _children, ...args }) => (
    <Tooltip>
      <TooltipTrigger
        render={<Button className={triggerButtonClassName} variant="outline" />}
      >
        <CopyIcon />
        Copy
      </TooltipTrigger>
      <TooltipContent {...args}>
        Copy link
        <kbd data-slot="kbd">Ctrl+C</kbd>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Focus: Story = {
  parameters: { controls: { include: [] } },
  render: ({ children: _children, ...args }) => (
    <Tooltip>
      <TooltipTrigger
        render={<Button className={triggerButtonClassName} variant="outline" />}
      >
        <CircleHelpIcon />
        Focus me
      </TooltipTrigger>
      <TooltipContent {...args}>
        Tooltips are available from keyboard focus, not only pointer hover.
      </TooltipContent>
    </Tooltip>
  ),
};
