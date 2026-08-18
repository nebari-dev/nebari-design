import type { Meta, StoryContext, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import {
  Accordion,
  AccordionContent,
  type AccordionHeadingLevel,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';

// `defaultValue` is an array of item values, which as a knob would mean editing
// raw JSON. These labels map onto the real arrays instead, following the same
// lookup pattern as `showSwipeHandle` in the drawer stories.
const OPEN_ITEMS_BY_KEY = {
  none: [],
  'first item': ['item-1'],
  'second item': ['item-2'],
  'first two items': ['item-1', 'item-2'],
} as const;

type AccordionStoryArgs = Pick<
  ComponentProps<typeof Accordion>,
  | 'children'
  | 'className'
  | 'disabled'
  | 'hiddenUntilFound'
  | 'keepMounted'
  | 'multiple'
  | 'onValueChange'
  | 'render'
  | 'value'
> & {
  defaultValue?: keyof typeof OPEN_ITEMS_BY_KEY;
  headingLevel: AccordionHeadingLevel;
};

const STORY_WIDTH = 'w-[min(460px,calc(100vw-2rem))]';

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

function getAccordionSource({
  defaultValue,
  disabled,
  headingLevel,
  multiple,
}: AccordionStoryArgs) {
  const openItems = OPEN_ITEMS_BY_KEY[defaultValue ?? 'none'];
  const rootProps = [
    openItems.length > 0
      ? `defaultValue={[${openItems.map((value) => `'${value}'`).join(', ')}]}`
      : undefined,
    disabled ? 'disabled' : undefined,
    multiple ? 'multiple' : undefined,
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

const meta = {
  // No `component`: the `defaultValue` knob is remapped to friendly labels, so
  // the args type intentionally diverges from Accordion's real props. The
  // argTypes below are the props table, as in the drawer stories.
  title: 'Components/Accordion',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accordion reveals related sections of content. Base UI supplies the button, the heading, the panel region, the keyboard behavior, and the hidden-panel lifecycle; Nebari supplies the Figma-aligned presentation, the semantic heading level, the trigger/panel id association, and native `disabled` triggers that Tab skips.',
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
        'Which items start expanded, then the accordion owns the state. Story-only shorthand: each label maps to the real `defaultValue` array of item values; clearing “Choose Option” maps back to the empty default.',
      control: 'select',
      options: Object.keys(OPEN_ITEMS_BY_KEY),
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '[]' },
      },
    },
    multiple: {
      description: 'Allows more than one item to remain expanded.',
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
        'Heading level wrapping each trigger, passed through to `AccordionTrigger`. Match it to the surrounding page hierarchy so screen-reader users can skim the set.',
      control: 'select',
      options: [2, 3, 4, 5, 6],
      table: { defaultValue: { summary: '3' } },
    },
    value: {
      description:
        'Controlled expanded item values. Pair with `onValueChange`. Left as a docs-only row here so the playground stays interactive.',
      control: false,
    },
    keepMounted: {
      description:
        'Keeps collapsed panels in the DOM with the native `hidden` attribute, so they are genuinely hidden (`display: none`) and out of the tab order rather than clipped to zero height. Nebari defaults this to `true` so `aria-controls` always points to a panel that exists. Pass `hiddenUntilFound` instead to use `hidden="until-found"`, letting browser page search reveal a collapsed panel.',
      control: false,
      table: { defaultValue: { summary: 'true' } },
    },
    hiddenUntilFound: {
      description:
        'Keeps collapsed panels searchable with `hidden="until-found"`, allowing browser page search to reveal matching content.',
      control: false,
      table: { defaultValue: { summary: 'false' } },
    },
    render: {
      description:
        'Base UI render-prop composition for replacing the root `<div>` while retaining accordion behavior and data attributes.',
      control: false,
      table: { defaultValue: { summary: '<div />' } },
    },
    children: {
      description:
        'Composed `AccordionItem` children. Documented here rather than exposed as a meaningless JSX control.',
      control: false,
    },
    onValueChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  decorators: [
    // `defaultValue` is mount-only, so changing it remounts the playground.
    (Story, { args }) => <Story key={String(args.defaultValue)} />,
  ],
} satisfies Meta<AccordionStoryArgs>;

export default meta;

type Story = StoryObj<AccordionStoryArgs>;

function ExampleAccordion({
  defaultValue,
  disabled,
  headingLevel,
  multiple,
  onValueChange,
}: AccordionStoryArgs) {
  // Storybook's select reset is displayed as "Choose Option" and supplies
  // `undefined`. Treat it like the component's real empty default instead of
  // indexing the lookup with a missing key.
  const openItems = OPEN_ITEMS_BY_KEY[defaultValue ?? 'none'];

  return (
    <Accordion
      className={STORY_WIDTH}
      defaultValue={[...openItems]}
      disabled={disabled}
      multiple={multiple}
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
        story:
          'The default single-open accordion. Use the controls to choose which items start open, allow multiple to stay open, disable the set, or change the heading level.',
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
};

export const Card: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Accordion items composed inside a bordered card surface, following the card example from the shadcn documentation and the Nebari design.',
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
