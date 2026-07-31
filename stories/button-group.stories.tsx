import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bold,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Italic,
  Minus,
  Plus,
  Rocket,
  Underline,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '@/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

type SplitButtonProps = {
  groupLabel: string;
  icon?: ReactNode;
  label: string;
  menuLabel: string;
  options: string[];
};

/** Split action composed from Button Group and Dropdown Menu. */
function SplitButton({
  groupLabel,
  icon,
  label,
  menuLabel,
  options,
}: SplitButtonProps) {
  return (
    <DropdownMenu>
      <ButtonGroup aria-label={groupLabel}>
        <Button variant="outline">
          {icon}
          {label}
        </Button>
        <DropdownMenuTrigger
          aria-label={menuLabel}
          className="size-8 px-0"
          title={menuLabel}
          variant="outline"
        >
          <ChevronDown />
        </DropdownMenuTrigger>
      </ButtonGroup>
      <DropdownMenuPortal>
        <DropdownMenuContent
          aria-label={`${label} options`}
          align="end"
          className="min-w-48"
        >
          {options.map((option) => (
            <DropdownMenuItem key={option}>{option}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

const meta = {
  title: 'Components/Button Group',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button Group visually joins related actions into a segmented unit with shared seams, unified outer corners, and squared inner corners. For mutually exclusive state, use controls that communicate their selected or pressed state.',
      },
    },
  },
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      control: 'select',
      description: 'Sets the direction in which the grouped controls flow.',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-10">
      <div className="grid gap-2">
        <span className="text-xs">Two</span>
        <ButtonGroup {...args} aria-label="Two related actions">
          <Button variant="outline">Left</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </div>
      <div className="grid gap-2">
        <span className="text-xs">Three</span>
        <ButtonGroup {...args} aria-label="Three related actions">
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </div>
      <div className="grid gap-2">
        <span className="text-xs">Split</span>
        <SplitButton
          groupLabel="Split action"
          label="Button"
          menuLabel="More button actions"
          options={['First action', 'Second action']}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'More button actions',
    });
    const restingRadius = getComputedStyle(trigger).borderTopRightRadius;
    await expect(restingRadius).not.toBe('0px');

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');

    const firstItem = await page.findByRole('menuitem', {
      name: 'First action',
    });
    const secondItem = page.getByRole('menuitem', {
      name: 'Second action',
    });

    await expect(firstItem).toHaveFocus();
    await expect(getComputedStyle(trigger).borderTopRightRadius).toBe(
      restingRadius,
    );
    await userEvent.keyboard('{ArrowDown}');
    await expect(secondItem).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
    await expect(page.queryByRole('menu')).not.toBeInTheDocument();
  },
};

export const FigmaExamples: Story = {
  name: 'Examples',
  render: () => (
    <div className="flex flex-wrap items-start gap-12">
      <div className="grid gap-2">
        <span className="text-xs">Pagination</span>
        <ButtonGroup aria-label="Pagination">
          <Button variant="outline">
            <ChevronLeft />
            Previous
          </Button>
          <Button variant="outline">
            Next
            <ChevronRight />
          </Button>
        </ButtonGroup>
      </div>
      <div className="grid gap-2">
        <span className="text-xs">Split action</span>
        <SplitButton
          groupLabel="Deploy actions"
          icon={<Rocket />}
          label="Deploy"
          menuLabel="More deploy options"
          options={['Deploy to production', 'Create preview deployment']}
        />
      </div>
      <div className="grid gap-2">
        <span className="text-xs">Formatting toolbar</span>
        <ButtonGroup aria-label="Text formatting">
          <Button
            aria-label="Bold"
            size="icon-sm"
            title="Bold"
            variant="outline"
          >
            <Bold />
          </Button>
          <Button
            aria-label="Italic"
            size="icon-sm"
            title="Italic"
            variant="outline"
          >
            <Italic />
          </Button>
          <Button
            aria-label="Underline"
            size="icon-sm"
            title="Underline"
            variant="outline"
          >
            <Underline />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Orientation: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <ButtonGroup {...args} aria-label="Zoom controls">
      <Button
        aria-label="Zoom in"
        size="icon"
        title="Zoom in"
        variant="outline"
      >
        <Plus />
      </Button>
      <Button
        aria-label="Zoom out"
        size="icon"
        title="Zoom out"
        variant="outline"
      >
        <Minus />
      </Button>
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="grid gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <ButtonGroup aria-label={`${size} button group`} key={size}>
          <Button size={size} variant="outline">
            Left
          </Button>
          <Button size={size} variant="outline">
            Right
          </Button>
        </ButtonGroup>
      ))}
    </div>
  ),
};

export const SupportingContent: Story = {
  render: () => (
    <ButtonGroup aria-label="Branch actions">
      <ButtonGroupText>Branch</ButtonGroupText>
      <Button variant="ghost">main</Button>
      <ButtonGroupSeparator />
      <Button variant="ghost">Compare</Button>
    </ButtonGroup>
  ),
};

export const Nested: Story = {
  render: () => (
    <ButtonGroup aria-label="Editor actions">
      <ButtonGroup aria-label="History actions">
        <Button variant="outline">Undo</Button>
        <Button variant="outline">Redo</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Document actions">
        <Button variant="outline">Save</Button>
        <Button variant="outline">Publish</Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};
