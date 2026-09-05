import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import accordionMeta, {
  Default as AccordionDefaultStory,
} from '../stories/accordion.stories';

/** Renders the common accordion fixture used by behavior tests. */
function renderAccordion({
  defaultValue = [],
}: {
  defaultValue?: string[];
} = {}) {
  return render(
    <Accordion defaultValue={defaultValue}>
      <AccordionItem value="account">
        <AccordionTrigger>Account</AccordionTrigger>
        <AccordionContent>
          <a href="#account">Manage account</a>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger headingLevel={2}>Billing</AccordionTrigger>
        <AccordionContent>Billing details</AccordionContent>
      </AccordionItem>
      <AccordionItem disabled value="advanced">
        <AccordionTrigger>Advanced</AccordionTrigger>
        <AccordionContent>Advanced settings</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe('Accordion', () => {
  it('documents the real defaultValue array in the playground source', async () => {
    const transform = AccordionDefaultStory.parameters?.docs?.source?.transform;
    const source = await transform?.('', {
      args: {
        ...accordionMeta.args,
        defaultValue: 'first two items',
        multiple: false,
      },
    } as never);

    expect(source).toContain("defaultValue={['item-1', 'item-2']}");
    expect(source).toContain('<AccordionItem value="item-1">');
    expect(source).toContain('multiple');
    expect(source).not.toContain('<ExampleAccordion');
    expect(source).not.toContain('disabled={false}');
    expect(source).not.toContain('headingLevel={3}');
  });

  it('enables multiple mode when the playground starts with two items open', () => {
    const story = AccordionDefaultStory.render?.(
      {
        ...accordionMeta.args,
        defaultValue: 'first two items',
        multiple: false,
      },
      {} as never,
    );

    render(story as ReactNode);

    expect(
      screen.getByRole('region', { name: 'Is it accessible?' }),
    ).toBeVisible();
    expect(screen.getByRole('region', { name: 'Is it styled?' })).toBeVisible();
  });

  it('handles Storybook clearing the defaultValue select', () => {
    const story = AccordionDefaultStory.render?.(
      { ...accordionMeta.args, defaultValue: undefined },
      {} as never,
    );

    expect(story).toBeDefined();
    render(story as ReactNode);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('applies the playground headingLevel control to every trigger', () => {
    const story = AccordionDefaultStory.render?.(
      { ...accordionMeta.args, headingLevel: 2 },
      {} as never,
    );

    render(story as ReactNode);

    for (const trigger of screen.getAllByRole('button')) {
      expect(trigger.closest('h2')).toBeInTheDocument();
    }
  });

  it('renders stable slots and semantic heading-wrapped buttons', () => {
    renderAccordion({ defaultValue: ['account'] });

    const account = screen.getByRole('button', { name: 'Account' });
    const billing = screen.getByRole('button', { name: 'Billing' });

    expect(account.closest('h3')).toHaveAttribute(
      'data-slot',
      'accordion-header',
    );
    expect(billing.closest('h2')).toHaveAttribute(
      'data-slot',
      'accordion-header',
    );
    expect(account).toHaveAttribute('data-slot', 'accordion-trigger');
    expect(account.closest('[data-slot="accordion-item"]')).toBeTruthy();
    expect(account.closest('[data-slot="accordion"]')).toBeTruthy();
  });

  it('associates each trigger and region in both directions', () => {
    renderAccordion({ defaultValue: ['account'] });

    const trigger = screen.getByRole('button', { name: 'Account' });
    const panel = screen.getByRole('region', { name: 'Account' });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    expect(panel).toHaveAttribute('data-slot', 'accordion-content');
  });

  it('keeps closed panels natively hidden with stable ARIA linkage', () => {
    renderAccordion();

    const trigger = screen.getByRole('button', { name: 'Account' });
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panelId).toBeTruthy();
    expect(panel).toHaveAttribute('hidden');
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    expect(
      screen.getByRole('link', { name: 'Manage account', hidden: true }),
    ).not.toBeVisible();
  });

  it('toggles with Enter and Space and hides collapsed content', async () => {
    const user = userEvent.setup();
    renderAccordion();
    const account = screen.getByRole('button', { name: 'Account' });

    account.focus();
    await user.keyboard('{Enter}');
    expect(account).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Manage account' })).toBeVisible();

    await user.keyboard(' ');
    expect(account).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('link', { name: 'Manage account', hidden: true }),
    ).not.toBeVisible();
  });

  it('keeps expanded panel controls directly after their trigger in tab order', async () => {
    const user = userEvent.setup();
    renderAccordion({ defaultValue: ['account'] });

    await user.tab();
    expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Manage account' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Billing' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus();
  });

  it('uses the disabled attribute and skips disabled triggers', () => {
    renderAccordion();

    const trigger = screen.getByRole('button', { name: 'Advanced' });
    expect(trigger).toBeDisabled();
    expect(trigger.closest('[data-slot="accordion-item"]')).toHaveAttribute(
      'data-disabled',
    );
  });

  it('propagates root disabled state to native trigger buttons', () => {
    render(
      <Accordion disabled>
        <AccordionItem value="account">
          <AccordionTrigger>Account</AccordionTrigger>
          <AccordionContent>Account details</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: 'Account' })).toBeDisabled();
  });

  it('exposes each part through a stable slot and merges caller classes', () => {
    render(
      <Accordion defaultValue={['account']}>
        <AccordionItem className="item-class" value="account">
          <AccordionTrigger className="trigger-class">Account</AccordionTrigger>
          <AccordionContent
            className="panel-class"
            contentClassName="inner-class"
          >
            Account details
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Account' });
    const panel = screen.getByRole('region', { name: 'Account' });

    expect(trigger).toHaveAttribute('data-slot', 'accordion-trigger');
    expect(panel).toHaveAttribute('data-slot', 'accordion-content');
    const inner = panel.querySelector('[data-slot="accordion-content-inner"]');
    expect(inner).toBeInTheDocument();

    expect(trigger).toHaveClass('trigger-class');
    expect(trigger.closest('[data-slot="accordion-item"]')).toHaveClass(
      'item-class',
    );
    expect(panel).toHaveClass('panel-class');
    expect(inner).toHaveClass('inner-class');
  });

  it('fails loudly when a part is used outside an AccordionItem', () => {
    expect(() => render(<AccordionTrigger>Solo</AccordionTrigger>)).toThrow(
      '<AccordionTrigger> must be used within an <AccordionItem>.',
    );
    expect(() => render(<AccordionContent>Solo</AccordionContent>)).toThrow(
      '<AccordionContent> must be used within an <AccordionItem>.',
    );
  });

  it('keeps every trigger icon out of the accessibility tree', () => {
    renderAccordion({ defaultValue: ['account'] });
    const trigger = screen.getByRole('button', { name: 'Account' });

    const icons = trigger.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    }

    expect(trigger).toHaveAccessibleName('Account');
  });

  it('supports multiple open items and root render composition', async () => {
    const user = userEvent.setup();
    render(
      <Accordion multiple render={<section aria-label="Settings" />}>
        <AccordionItem value="one">
          <AccordionTrigger>One</AccordionTrigger>
          <AccordionContent>First panel</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Two</AccordionTrigger>
          <AccordionContent>Second panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const root = screen.getByRole('region', { name: 'Settings' });
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('data-slot', 'accordion');

    await user.click(screen.getByRole('button', { name: 'One' }));
    await user.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByText('First panel')).toBeVisible();
    expect(screen.getByText('Second panel')).toBeVisible();
  });
});
