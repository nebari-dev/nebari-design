import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbDropdown,
  BreadcrumbDropdownContent,
  BreadcrumbDropdownItem,
  BreadcrumbDropdownTrigger,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

describe('Breadcrumb', () => {
  it('renders a labelled breadcrumb navigation landmark', () => {
    render(<Breadcrumb aria-label="Project path" />);

    const breadcrumb = screen.getByRole('navigation', {
      name: 'Project path',
    });
    expect(breadcrumb).toHaveAttribute('data-slot', 'breadcrumb');
    expect(breadcrumb).toHaveClass('min-w-0');
  });

  it('renders the composed breadcrumb hierarchy', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveAttribute(
      'data-slot',
      'breadcrumb-list',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'href',
      '/components',
    );
    expect(screen.getByText('Breadcrumb')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('keeps the list on one line by default and permits explicit wrapping', () => {
    const { rerender } = render(<BreadcrumbList>Trail</BreadcrumbList>);

    expect(screen.getByRole('list')).toHaveClass(
      'flex',
      'flex-nowrap',
      'whitespace-nowrap',
      'text-muted-foreground',
      'text-sm',
    );

    rerender(
      <BreadcrumbList className="flex-wrap whitespace-normal">
        Trail
      </BreadcrumbList>,
    );
    expect(screen.getByRole('list')).toHaveClass(
      'flex-wrap',
      'whitespace-normal',
    );
    expect(screen.getByRole('list')).not.toHaveClass(
      'flex-nowrap',
      'whitespace-nowrap',
    );
  });

  it('styles breadcrumb links and composes via the render prop', () => {
    render(
      <BreadcrumbLink render={<a href="/docs" data-router-link="" />}>
        Docs
      </BreadcrumbLink>,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-router-link', '');
    expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
    expect(link).toHaveClass(
      'hover:text-foreground',
      'hover:underline',
      'rounded-[4px]',
      'focus-visible:ring-2',
      'motion-safe:duration-(--duration-fast)',
    );
  });

  it('marks the current page as disabled and current', () => {
    render(<BreadcrumbPage>Current</BreadcrumbPage>);

    const page = screen.getByText('Current');
    expect(page).toHaveAttribute('data-slot', 'breadcrumb-page');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).toHaveAttribute('aria-disabled', 'true');
    expect(page).toHaveClass('text-foreground');
  });

  it('renders the default separator as decorative', () => {
    const { container } = render(<BreadcrumbSeparator />);

    const separator = container.querySelector(
      '[data-slot="breadcrumb-separator"]',
    );
    expect(separator).toHaveAttribute('role', 'presentation');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(separator?.querySelector('svg')).toBeInTheDocument();
  });

  it('opens hidden ancestor links from the collapsed-path ellipsis', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumbDropdown>
        <BreadcrumbEllipsis />
        <BreadcrumbDropdownContent>
          <BreadcrumbDropdownItem render={<a href="/design-system" />}>
            Design system
          </BreadcrumbDropdownItem>
        </BreadcrumbDropdownContent>
      </BreadcrumbDropdown>,
    );

    const ellipsis = screen.getByRole('button', {
      name: 'Show more breadcrumbs',
    });
    expect(ellipsis).toHaveAttribute('data-slot', 'breadcrumb-ellipsis');
    expect(ellipsis).toHaveAttribute('type', 'button');
    expect(ellipsis).toHaveClass(
      'size-5',
      'rounded-[4px]',
      'text-muted-foreground',
      'focus-visible:ring-2',
    );

    await user.click(ellipsis);
    const hiddenAncestor = await screen.findByRole('menuitem', {
      name: 'Design system',
    });
    expect(ellipsis).toHaveAttribute('aria-expanded', 'true');
    expect(hiddenAncestor).toHaveAttribute('href', '/design-system');
  });

  it('renders a dropdown breadcrumb for the current route and previous links', async () => {
    const user = userEvent.setup();
    render(
      <BreadcrumbDropdown>
        <BreadcrumbDropdownTrigger>Current route</BreadcrumbDropdownTrigger>
        <BreadcrumbDropdownContent>
          <BreadcrumbDropdownItem render={<a href="/" />}>
            Home
          </BreadcrumbDropdownItem>
          <BreadcrumbDropdownItem render={<a href="/components" />}>
            Components
          </BreadcrumbDropdownItem>
        </BreadcrumbDropdownContent>
      </BreadcrumbDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Current route' });
    expect(trigger).toHaveAttribute('data-slot', 'breadcrumb-dropdown-trigger');
    expect(trigger).toHaveAttribute('aria-current', 'page');
    expect(trigger).toHaveClass('rounded-[4px]', 'hover:underline');

    await user.click(trigger);

    const home = await screen.findByText('Home');
    const components = await screen.findByText('Components');
    expect(home.closest('[data-slot="breadcrumb-dropdown-item"]')).toHaveClass(
      'hover:bg-accent',
      'cursor-pointer',
    );
    expect(components.closest('a')).toHaveAttribute('href', '/components');
  });
});
