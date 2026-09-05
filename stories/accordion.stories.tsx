import type { Meta, StoryContext, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs, useEffect } from 'storybook/preview-api';
import { expect, within } from 'storybook/test';
import {
  Accordion,
  AccordionContent,
  type AccordionHeadingLevel,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** Maps readable control labels to the item values expanded on first render. */
const OPEN_ITEMS_BY_KEY = {
  none: [],
  'first item': ['item-1'],
  'second item': ['item-2'],
  'first two items': ['item-1', 'item-2'],
} as const;

type AccordionStoryArgs = Pick<
  ComponentProps<typeof Accordion>,
  'className' | 'disabled' | 'multiple' | 'onValueChange' | 'value'
> & {
  defaultValue?: keyof typeof OPEN_ITEMS_BY_KEY;
  headingLevel: AccordionHeadingLevel;
};

const STORY_WIDTH = 'w-[min(460px,calc(100vw-2rem))]';

/** Returns whether the story should allow multiple open items. */
function resolvesMultiple(
  defaultValue: AccordionStoryArgs['defaultValue'],
  multiple: AccordionStoryArgs['multiple'],
) {
  return multiple || defaultValue === 'first two items';
}

const items = [
  {
    value: 'item-1',
    trigger: 'Is it accessible?',
    content:
      'Yes. Each trigger is a button in a semantic heading, and every panel is labelled by its trigger.',
  },
  {
    value: 'item-2',
    trigger: 'Is it styled?',
    content:
      'Yes. It uses Nebari semantic tokens and matches the spacing, typography, borders, and states in the design system.',
  },
  {
    value: 'item-3',
    trigger:
      'Can a longer accordion title wrap onto multiple lines without colliding with the chevron?',
    content:
      'Yes. The title wraps naturally while the decorative chevron remains aligned to the top of the trigger.',
  },
];

/** Builds the consumer-facing source shown for the current playground state. */
function getAccordionSource({
  defaultValue,
  disabled,
  headingLevel,
  multiple,
}: AccordionStoryArgs) {
  const openItems = OPEN_ITEMS_BY_KEY[defaultValue ?? 'none'];
  const resolvedMultiple = resolvesMultiple(defaultValue, multiple);
  const rootProps = [
    openItems.length > 0
      ? `defaultValue={[${openItems.map((value) => `'${value}'`).join(', ')}]}`
      : undefined,
    disabled ? 'disabled' : undefined,
    resolvedMultiple ? 'multiple' : undefined,
  ].filter((prop): prop is string => prop !== undefined);
  const rootOpening =
    rootProps.length > 0
      ? `<Accordion\n${rootProps.map((prop) => `  ${prop}`).join('\n')}\n>`
      : '<Accordion>';
  const resolvedHeadingLevel = headingLevel ?? 3;
  const triggerProps =
    resolvedHeadingLevel === 3 ? '' : ` headingLevel={${resolvedHeadingLevel}}`;

  return `${rootOpening}
  <AccordionItem value="item-1">
    <AccordionTrigger${triggerProps}>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. Each trigger is a button in a semantic heading, and every panel is
      labelled by its trigger.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger${triggerProps}>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It uses Nebari semantic tokens and matches the design system.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger${triggerProps}>Can accordion titles wrap?</AccordionTrigger>
    <AccordionContent>
      Yes. The title wraps while the decorative chevron remains aligned.
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
}

/**
 * Defines custom story args because the readable `defaultValue` options map to
 * the string arrays accepted by Accordion.
 */
const meta = {
  title: 'Components/Accordion',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accordion organizes related content into sections that users can expand and collapse. Each trigger is a button within a configurable semantic heading and is programmatically associated with its panel. Disabled triggers are skipped during keyboard navigation.',
      },
    },
  },
  args: {
    defaultValue: 'first item',
    disabled: false,
    headingLevel: 3,
    multiple: false,
  },
  argTypes: {
    defaultValue: {
      description:
        'Sets which items are expanded when the accordion first renders.',
      control: 'select',
      options: Object.keys(OPEN_ITEMS_BY_KEY),
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '[]' },
      },
    },
    multiple: {
      description:
        'Allows more than one item to remain expanded at the same time.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description:
        'Disables every trigger in the accordion. Reaches each trigger as the native `disabled` attribute, so Tab skips the whole set. Set `disabled` on a single `AccordionItem` to disable just that one.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    headingLevel: {
      description:
        'Semantic heading level wrapping each trigger. Match it to the surrounding page hierarchy so screen-reader users can skim the set; it intentionally does not change the visual styling.',
      control: 'select',
      options: [2, 3, 4, 5, 6],
      table: { defaultValue: { summary: '3' } },
    },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  decorators: [
    /**
     * Enables `multiple` when the selected default contains two items. The key
     * remounts the story after either arg changes so the mount-only
     * `defaultValue` is applied under the matching selection mode.
     */
    (Story, { args }) => {
      const [, updateArgs] = useArgs<AccordionStoryArgs>();

      useEffect(() => {
        if (args.defaultValue === 'first two items' && !args.multiple) {
          updateArgs({ multiple: true });
        }
      }, [args.defaultValue, args.multiple, updateArgs]);

      return (
        <Story key={`${String(args.defaultValue)}:${String(args.multiple)}`} />
      );
    },
  ],
} satisfies Meta<AccordionStoryArgs>;

export default meta;

type Story = StoryObj<AccordionStoryArgs>;

/** Renders the shared interactive accordion used by the default story. */
function ExampleAccordion({
  defaultValue,
  disabled,
  headingLevel,
  multiple,
  onValueChange,
}: AccordionStoryArgs) {
  const openItems = OPEN_ITEMS_BY_KEY[defaultValue ?? 'none'];
  const resolvedMultiple = resolvesMultiple(defaultValue, multiple);

  return (
    <Accordion
      className={STORY_WIDTH}
      defaultValue={[...openItems]}
      disabled={disabled}
      multiple={resolvedMultiple}
      onValueChange={onValueChange}
    >
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger headingLevel={headingLevel}>
            {item.trigger}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An accordion with one section expanded on first render.',
      },
      source: {
        language: 'tsx',
        transform: (
          _source: string,
          context: StoryContext<AccordionStoryArgs>,
        ) => getAccordionSource(context.args),
      },
    },
  },
  render: (args) => <ExampleAccordion {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Is it accessible?',
    });

    await expect(getComputedStyle(trigger).cursor).toBe('pointer');
  },
};

export const Disabled: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The second item is disabled through `disabled` on its `AccordionItem`. The trigger renders with the native `disabled` attribute, so it cannot be activated and Tab skips over it; the item is dimmed to match. Set `disabled` on the `Accordion` root instead to disable every item at once.',
      },
    },
  },
  render: (_args) => (
    <Accordion className={STORY_WIDTH} defaultValue={['item-1']}>
      {items.map((item, index) => (
        <AccordionItem
          disabled={index === 1}
          key={item.value}
          value={item.value}
        >
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Is it styled?',
    });

    await expect(trigger).toBeDisabled();
    await expect(getComputedStyle(trigger).cursor).toBe('not-allowed');
  },
};

export const Card: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story: 'Accordion items presented within a bordered card surface.',
      },
    },
  },
  render: (_args) => (
    <div
      className={`${STORY_WIDTH} rounded-md border border-border bg-card px-4 text-card-foreground`}
    >
      <Accordion defaultValue={['item-1']}>
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};
