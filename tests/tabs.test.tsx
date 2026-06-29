import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
  tabsIndicatorVariants,
  tabsListVariants,
  tabsTabVariants,
} from '@/ui/tabs';

function renderTabs(variant: 'pill' | 'underline' = 'pill') {
  return render(
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project sections" variant={variant}>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
        <TabsTab disabled value="logs">
          Logs
        </TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="overview">Overview panel</TabsPanel>
      <TabsPanel value="settings">Settings panel</TabsPanel>
      <TabsPanel value="logs">Logs panel</TabsPanel>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('renders the root, list, tabs, indicator, and active panel', () => {
    renderTabs();

    expect(
      screen.getByRole('tablist').closest('[data-slot="tabs"]'),
    ).toHaveAttribute('data-slot', 'tabs');
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'data-slot',
      'tabs-list',
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'data-slot',
      'tabs-tab',
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Overview panel')).toHaveAttribute(
      'data-slot',
      'tabs-panel',
    );
    expect(screen.getByText('Overview panel')).toBeVisible();
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute(
      'data-slot',
      'tabs-indicator',
    );
  });

  it('switches panels when a tab is selected', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: 'Settings' }));

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Settings panel')).toBeVisible();
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
  });

  it('does not select disabled tabs', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: 'Logs' }));

    expect(screen.getByRole('tab', { name: 'Logs' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByText('Logs panel')).not.toBeInTheDocument();
    expect(screen.getByText('Overview panel')).toBeVisible();
  });

  it('inherits the pill variant from TabsList', () => {
    renderTabs('pill');

    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'pill');
    expect(screen.getByRole('tablist')).toHaveClass('rounded-md');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'data-variant',
      'pill',
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'rounded-sm',
    );
    expect(
      screen.getByRole('tab', { name: 'Overview' }).getAttribute('class'),
    ).toContain('data-[active]:shadow-[0_1px_1.5px_rgb(0_0_0_/_0.1)]');
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute(
      'data-variant',
      'pill',
    );
  });

  it('exposes cva helpers for external composition', () => {
    expect(tabsListVariants({ variant: 'underline' })).toContain('border-b');
    expect(tabsListVariants({ variant: 'pill' })).toContain('h-9');
    expect(tabsListVariants({ variant: 'pill' })).toContain('gap-1');
    expect(tabsListVariants({ variant: 'pill' })).toContain('rounded-md');
    expect(tabsListVariants({ variant: 'pill' })).toContain('bg-background');
    expect(tabsListVariants({ variant: 'pill' })).toContain('p-[3px]');
    expect(tabsTabVariants({ variant: 'pill' })).toContain(
      'h-[calc(100%-1px)]',
    );
    expect(tabsTabVariants({ variant: 'pill' })).toContain('rounded-sm');
    expect(tabsTabVariants({ variant: 'pill' })).toContain('border-border');
    expect(tabsTabVariants({ variant: 'pill' })).toContain('bg-card');
    expect(tabsTabVariants({ variant: 'pill' })).toContain('px-2');
    expect(tabsTabVariants({ variant: 'pill' })).toContain('py-1');
    expect(tabsTabVariants({ variant: 'pill' })).toContain(
      'data-[active]:shadow-[0_1px_1.5px_rgb(0_0_0_/_0.1)]',
    );
    expect(tabsTabVariants({ variant: 'pill' })).toContain(
      'data-[disabled]:bg-muted',
    );
    expect(tabsIndicatorVariants({ variant: 'underline' })).toContain(
      'bg-primary',
    );
    expect(tabsIndicatorVariants({ variant: 'pill' })).toContain('hidden');
  });

  it('keeps line and toggle as compatibility aliases', () => {
    expect(tabsListVariants({ variant: 'line' })).toContain('border-b');
    expect(tabsListVariants({ variant: 'toggle' })).toContain('bg-background');
    expect(tabsTabVariants({ variant: 'toggle' })).toContain('rounded-sm');
    expect(tabsTabVariants({ variant: 'toggle' })).toContain('bg-card');
    expect(tabsTabVariants({ variant: 'toggle' })).toContain(
      'data-[active]:shadow-[0_1px_1.5px_rgb(0_0_0_/_0.1)]',
    );
  });
});
