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
    render: { table: { disable: true } },
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
  render: () => (
    <div className="grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-4">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button className={triggerButtonClassName} variant="outline" />
          }
        >
          Left
        </TooltipTrigger>
        <TooltipContent side="left">Left Tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button className={triggerButtonClassName} variant="outline" />
          }
        >
          Top
        </TooltipTrigger>
        <TooltipContent side="top">Top Tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button className={triggerButtonClassName} variant="outline" />
          }
        >
          Bottom
        </TooltipTrigger>
        <TooltipContent side="bottom">Bottom Tooltip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button className={triggerButtonClassName} variant="outline" />
          }
        >
          Right
        </TooltipTrigger>
        <TooltipContent side="right">Right Tooltip</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const SupplementalInfo: Story = {
  name: 'Supplemental info',
  render: () => (
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
        <TooltipContent>
          Configure compute, access, and notifications.
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithShortcut: Story = {
  name: 'With shortcut',
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={<Button className={triggerButtonClassName} variant="outline" />}
      >
        <CopyIcon />
        Copy
      </TooltipTrigger>
      <TooltipContent>
        Copy link
        <kbd data-slot="kbd">Ctrl+C</kbd>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Focus: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={<Button className={triggerButtonClassName} variant="outline" />}
      >
        <CircleHelpIcon />
        Focus me
      </TooltipTrigger>
      <TooltipContent>
        Tooltips are available from keyboard focus, not only pointer hover.
      </TooltipContent>
    </Tooltip>
  ),
};
