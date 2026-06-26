import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

const meta = {
  title: 'Components/Radio Group',
  component: RadioGroupItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Radio Group implemented from the Nebari Figma spec on top of Base UI. `RadioGroup` manages mutually exclusive selection; each `RadioGroupItem` renders a labeled option in a `default` (inline) or `box` (card) layout. Compose with `Field` to add a question label, description, and validation message.',
      },
    },
  },
  // Required `RadioGroupItem` prop — each story composes its own group via
  // `render`, so this only satisfies the story arg types.
  args: { value: 'option' },
} satisfies Meta<typeof RadioGroupItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default option layout. `RadioGroup` provides mutually exclusive
 * selection — picking one option clears the others. Always give the group an
 * accessible name (here via `aria-label`, or a `Field` label — see below).
 */
export const Default: Story = {
  render: () => (
    <div className="w-72">
      <RadioGroup aria-label="Plan" defaultValue="pro">
        <RadioGroupItem value="starter">Starter</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </RadioGroup>
    </div>
  ),
};

/**
 * Pass `description` to add supplementary text beneath an option's label. It is
 * wired to the radio as its accessible description.
 */
export const WithDescription: Story = {
  name: 'With description',
  render: () => (
    <div className="w-72">
      <RadioGroup aria-label="Plan" defaultValue="pro">
        <RadioGroupItem
          description="For individuals getting started."
          value="starter"
        >
          Starter
        </RadioGroupItem>
        <RadioGroupItem
          description="For growing teams that need more."
          value="pro"
        >
          Pro
        </RadioGroupItem>
        <RadioGroupItem description="For organizations at scale." value="team">
          Team
        </RadioGroupItem>
      </RadioGroup>
    </div>
  ),
};

/**
 * The `box` variant turns each option into a bordered, fully clickable card.
 * Reach for it when options carry more content or need a larger hit target.
 */
export const Box: Story = {
  render: () => (
    <div className="w-72">
      <RadioGroup aria-label="Plan" defaultValue="pro">
        <RadioGroupItem
          description="For individuals getting started."
          value="starter"
          variant="box"
        >
          Starter
        </RadioGroupItem>
        <RadioGroupItem
          description="For growing teams that need more."
          value="pro"
          variant="box"
        >
          Pro
        </RadioGroupItem>
        <RadioGroupItem
          description="For organizations at scale."
          value="team"
          variant="box"
        >
          Team
        </RadioGroupItem>
      </RadioGroup>
    </div>
  ),
};

/**
 * Individual options can be disabled within an otherwise-interactive group, or
 * the whole group can be disabled at once.
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex w-72 flex-col gap-3">
        <p className="font-medium text-muted-foreground text-xs">
          One option disabled
        </p>
        <RadioGroup aria-label="Plan" defaultValue="pro">
          <RadioGroupItem value="starter">Starter</RadioGroupItem>
          <RadioGroupItem value="pro">Pro</RadioGroupItem>
          <RadioGroupItem disabled value="team">
            Team (coming soon)
          </RadioGroupItem>
        </RadioGroup>
      </div>

      <div className="flex w-72 flex-col gap-3">
        <p className="font-medium text-muted-foreground text-xs">
          Entire group disabled
        </p>
        <RadioGroup aria-label="Plan" defaultValue="pro" disabled>
          <RadioGroupItem value="starter">Starter</RadioGroupItem>
          <RadioGroupItem value="pro">Pro</RadioGroupItem>
          <RadioGroupItem value="team">Team</RadioGroupItem>
        </RadioGroup>
      </div>
    </div>
  ),
};

/**
 * Composed with `Field` for the standard form pattern: a question label, an
 * optional description, and the radio group — all associated for accessibility.
 */
export const WithField: Story = {
  name: 'With Field',
  render: () => (
    <Field className="w-80">
      <FieldLabel id="wf-label">Choose a plan</FieldLabel>
      <FieldDescription id="wf-desc">
        You can change this at any time.
      </FieldDescription>
      <RadioGroup
        aria-describedby="wf-desc"
        aria-labelledby="wf-label"
        defaultValue="pro"
      >
        <RadioGroupItem value="starter">Starter</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </RadioGroup>
    </Field>
  ),
};

/**
 * Error state belongs to the group (the question), not to individual radios — a
 * radio is binary and has no value of its own to be "invalid". The required-but-
 * unanswered failure is surfaced as a visible error **message** on the field,
 * which is the non-color cue a colorblind or low-vision user relies on (WCAG
 * 1.4.1 / 3.3.1).
 *
 * Here the error is shown as red `FieldError` text and associated with the group
 * via `aria-describedby`.
 *
 * The radio group container and individual options stay neutral (not red): each
 * option is a valid choice, so the visual cue belongs to the error message, not
 * the radios. The cue clears as soon as the user selects an option.
 */
export const Invalid: Story = {
  render: () => (
    <Field className="w-80" invalid>
      <FieldLabel id="inv-label">Choose a plan</FieldLabel>
      <RadioGroup
        aria-describedby="inv-error"
        aria-labelledby="inv-label"
        required
      >
        <RadioGroupItem value="starter">Starter</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </RadioGroup>
      <FieldError id="inv-error" match>
        Please select a plan to continue.
      </FieldError>
    </Field>
  ),
};
