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
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { Button } from '@/ui/button';
import { ButtonGroup } from '@/ui/button-group';

type SplitButtonProps = {
  groupLabel: string;
  icon?: ReactNode;
  label: string;
  menuLabel: string;
  options: string[];
};

/** Accessible split action with a keyboard-navigable menu. */
function SplitButton({
  groupLabel,
  icon,
  label,
  menuLabel,
  options,
}: SplitButtonProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const openAndFocus = (index: number) => {
    setOpen(true);
    window.setTimeout(() => itemRefs.current[index]?.focus(), 0);
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = itemRefs.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }

    const nextIndex =
      event.key === 'ArrowDown'
        ? (currentIndex + 1) % options.length
        : event.key === 'ArrowUp'
          ? (currentIndex - 1 + options.length) % options.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? options.length - 1
              : null;

    if (nextIndex !== null) {
      event.preventDefault();
      itemRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="relative w-fit">
      <ButtonGroup aria-label={groupLabel}>
        <Button variant="outline">
          {icon}
          {label}
        </Button>
        <Button
          ref={triggerRef}
          aria-controls={menuId}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={menuLabel}
          size="icon"
          title={menuLabel}
          variant="outline"
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              openAndFocus(0);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              openAndFocus(0);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              openAndFocus(options.length - 1);
            }
          }}
        >
          <ChevronDown />
        </Button>
      </ButtonGroup>
      {open ? (
        <div
          aria-label={`${label} options`}
          className="absolute top-full right-0 z-20 mt-1 grid min-w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          id={menuId}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => (
            <Button
              key={option}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="w-full justify-start"
              role="menuitem"
              size="sm"
              tabIndex={index === 0 ? 0 : -1}
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              {option}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
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
          'Button Group visually joins related actions into a segmented unit with shared seams, unified outer corners, and squared inner corners. Use Toggle Group instead when the controls represent mutually exclusive state.',
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
