import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { createContext, createElement, useContext, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Root props. `orientation` is omitted: the design is a vertical stack and the
 * root hard-codes `flex-col`, so accepting `orientation="horizontal"` would
 * switch Base UI's arrow-key handling without switching the layout to match.
 */
type AccordionProps = Omit<AccordionPrimitive.Root.Props, 'orientation'>;
type AccordionItemProps = AccordionPrimitive.Item.Props;
/**
 * Panel props. `aria-labelledby` and `id` are omitted because the component
 * owns both sides of the trigger/panel association (see {@link AccordionItem}).
 */
type AccordionContentProps = Omit<
  AccordionPrimitive.Panel.Props,
  'aria-labelledby' | 'id'
> & {
  /** Classes for the inner content wrapper that carries the panel padding. */
  contentClassName?: string;
};
type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;
/**
 * Trigger props. `id`, `aria-controls`, `nativeButton`, and `render` are all
 * omitted: the trigger must stay a real `<button>` that takes the native
 * `disabled` attribute so focus skips disabled items, and the component owns
 * the id it advertises through `aria-controls`.
 */
type AccordionTriggerProps = Omit<
  AccordionPrimitive.Trigger.Props,
  'aria-controls' | 'id' | 'nativeButton' | 'render'
> & {
  /** Semantic heading level for the trigger wrapper. */
  headingLevel?: AccordionHeadingLevel;
};

const AccordionDisabledContext = createContext(false);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
);

type AccordionItemContextValue = {
  disabled: boolean;
  panelId: string;
  triggerId: string;
};

/**
 * Reads the ids and resolved disabled state minted by {@link AccordionItem}.
 * Throws instead of degrading to `undefined` ids: a missing provider would
 * otherwise silently drop `aria-controls` and `aria-labelledby`, leaving the
 * trigger and its panel unassociated with nothing to show it.
 */
function useAccordionItemContext(component: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`<${component}> must be used within an <AccordionItem>.`);
  }
  return context;
}

/** Builds the bare heading element that wraps a trigger, e.g. `<h3 />`. */
function headingElement(level: AccordionHeadingLevel) {
  return createElement(`h${level}`);
}

/**
 * Groups a set of collapsible accordion items.
 *
 * One item opens at a time by default; pass `multiple` to allow several. Pass
 * `disabled` to disable every trigger at once — it reaches each trigger as the
 * native `disabled` attribute, so focus skips the whole set.
 *
 * `keepMounted` defaults to `true`, which is a deliberate departure from Base
 * UI's `false`. Collapsed panels stay in the DOM carrying the native `hidden`
 * attribute, which keeps them genuinely hidden (`display: none`) and out of the
 * tab order while leaving each trigger's `aria-controls` pointing at a panel
 * that actually exists. Unmounting instead would leave that reference dangling.
 */
function Accordion({
  className,
  disabled = false,
  keepMounted = true,
  ...props
}: AccordionProps) {
  return (
    <AccordionDisabledContext.Provider value={disabled}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn('flex w-full flex-col', className)}
        disabled={disabled}
        keepMounted={keepMounted}
        {...props}
      />
    </AccordionDisabledContext.Provider>
  );
}

/**
 * Groups one heading and its associated panel.
 *
 * Base UI generates its own trigger and panel ids, but drops `aria-controls`
 * from the trigger whenever the panel is closed. The design calls for that
 * reference at all times, so this item mints both ids and shares them with
 * {@link AccordionTrigger} and {@link AccordionContent}, which apply them to
 * both sides of the relationship. Keep the two in step: overriding only one
 * side would silently desync the association from Base UI's own ids.
 */
function AccordionItem({
  className,
  disabled = false,
  ...props
}: AccordionItemProps) {
  const rootDisabled = useContext(AccordionDisabledContext);
  const isDisabled = rootDisabled || disabled;
  const generatedId = useId();
  const itemContext = {
    disabled: isDisabled,
    panelId: `accordion-panel-${generatedId}`,
    triggerId: `accordion-trigger-${generatedId}`,
  };

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        className={cn(
          'border-b border-border last:border-b-0 data-[disabled]:opacity-50',
          className,
        )}
        disabled={isDisabled}
        {...props}
      />
    </AccordionItemContext.Provider>
  );
}

/**
 * Button that toggles its panel. The button is wrapped in an `h3` by default;
 * set `headingLevel` to preserve the surrounding page's heading hierarchy.
 *
 * Base UI soft-disables its trigger with `aria-disabled`, leaving it focusable.
 * The design asks for focus to skip disabled items instead, so the trigger is
 * rendered with the native `disabled` attribute.
 */
function AccordionTrigger({
  children,
  className,
  disabled = false,
  headingLevel = 3,
  ...props
}: AccordionTriggerProps) {
  // The item's disabled state already folds in the root's, so there is no need
  // to read the root context a second time here.
  const {
    disabled: itemDisabled,
    panelId,
    triggerId,
  } = useAccordionItemContext('AccordionTrigger');
  const isDisabled = itemDisabled || disabled;

  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      render={headingElement(headingLevel)}
      className="flex"
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex w-full flex-1 items-start justify-between gap-2 overflow-hidden rounded-sm px-2 py-4 text-left font-medium text-sm leading-5 text-foreground outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:no-underline',
          className,
        )}
        aria-controls={panelId}
        disabled={isDisabled}
        id={triggerId}
        render={(triggerProps) => (
          <button {...triggerProps} disabled={isDisabled} />
        )}
        {...props}
      >
        {/* `break-words` so a long unbroken title wraps instead of being
            clipped by the trigger's `overflow-hidden`. */}
        <span className="min-w-0 flex-1 break-words">{children}</span>
        <ChevronDownIcon
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          focusable="false"
          className="pointer-events-none mt-0.5 size-4 shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          focusable="false"
          className="pointer-events-none mt-0.5 hidden size-4 shrink-0 group-aria-expanded/accordion-trigger:block"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Panel associated with an {@link AccordionTrigger}.
 *
 * The open/close height transition is gated behind `motion-safe:`, so under
 * `prefers-reduced-motion: reduce` the content appears instantly instead of
 * animating. Height is the one layout property this registry animates: a
 * collapse has no transform-based equivalent, and Base UI supplies the
 * `--accordion-panel-height` variable specifically to drive it.
 */
function AccordionContent({
  children,
  className,
  contentClassName,
  ...props
}: AccordionContentProps) {
  const { panelId, triggerId } = useAccordionItemContext('AccordionContent');

  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      aria-labelledby={triggerId}
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden text-sm leading-5 text-muted-foreground data-[ending-style]:h-0 data-[starting-style]:h-0 motion-safe:transition-[height] motion-safe:duration-[--duration-base] motion-safe:ease-[--ease-emphasized]',
        className,
      )}
      id={panelId}
      {...props}
    >
      <div
        data-slot="accordion-content-inner"
        className={cn(
          'px-2 pb-4 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          contentClassName,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export type {
  AccordionContentProps,
  AccordionHeadingLevel,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
};
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
