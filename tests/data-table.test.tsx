import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/ui/button';
import { DataTable, type DataTableColumnDef } from '@/ui/data-table';

type Project = {
  id: string;
  name: string;
  owner: string;
};

const projects: Project[] = [
  { id: 'beta', name: 'Beta', owner: 'Grace' },
  { id: 'alpha', name: 'Alpha', owner: 'Ada' },
  { id: 'charlie', name: 'Charlie', owner: 'Katherine' },
];

const columns: DataTableColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    filterFn: 'includesString',
    sortFn: 'text',
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    enableSorting: false,
  },
];

function createColumnsWithActions(onAction?: () => void) {
  return [
    ...columns,
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          aria-label={`Open actions for ${row.original.name}`}
          className="focus-visible:ring-offset-0"
          onClick={onAction}
          size="icon-xs"
          variant="ghost"
        >
          ⋯
        </Button>
      ),
    } satisfies DataTableColumnDef<Project>,
  ];
}

function TestDataTable(
  props: Partial<React.ComponentProps<typeof DataTable<Project>>> = {},
) {
  return (
    <DataTable
      ariaLabel="Projects"
      columns={columns}
      data={projects}
      filterColumnId="name"
      getRowId={(project) => project.id}
      initialPageSize={2}
      pageSizeOptions={[2, 3]}
      {...props}
    />
  );
}

describe('DataTable', () => {
  it('renders semantic rows and stable data hooks', () => {
    const { container } = render(<TestDataTable />);
    const table = screen.getByRole('table', { name: 'Projects' });

    expect(container.querySelector('[data-slot="data-table"]')).toHaveAttribute(
      'data-state',
      'default',
    );
    expect(
      container.querySelector('[data-slot="data-table-toolbar"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="data-table-pagination"]'),
    ).toBeInTheDocument();
    expect(within(table).getByText('Beta')).toBeInTheDocument();
    expect(within(table).getByText('Alpha')).toBeInTheDocument();
    expect(within(table).queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('filters rows and clears a filtered-empty state', async () => {
    const user = userEvent.setup();
    const { container } = render(<TestDataTable />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter rows…' }),
      'missing',
    );

    expect(container.querySelector('[data-slot="data-table"]')).toHaveAttribute(
      'data-state',
      'filtered-empty',
    );
    expect(screen.getByText('No results found')).toBeInTheDocument();

    // Clearing unmounts the button that was just activated, so focus has to be
    // handed somewhere deliberate instead of falling back to <body>.
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: 'Filter rows…' }),
    ).toHaveFocus();
  });

  it('announces the result count and page through a polite status region', async () => {
    const user = userEvent.setup();
    const { container } = render(<TestDataTable />);
    const status = container.querySelector('[data-slot="data-table-status"]');

    expect(status).toHaveAttribute('role', 'status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('3 rows, page 1 of 2');

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(status).toHaveTextContent('3 rows, page 2 of 2');

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter rows…' }),
      'Alpha',
    );
    expect(status).toHaveTextContent('1 result');

    // The empty, filtered-empty, and error states carry their own status or
    // alert, so this region stays silent rather than announcing twice.
    await user.clear(screen.getByRole('searchbox', { name: 'Filter rows…' }));
    await user.type(
      screen.getByRole('searchbox', { name: 'Filter rows…' }),
      'missing',
    );
    expect(status).toBeEmptyDOMElement();
  });

  it('keeps focus on a usable pager when a page control disables itself', async () => {
    const user = userEvent.setup();
    render(<TestDataTable initialPageSize={1} pageSizeOptions={[1, 2]} />);

    // Paging to the last page disables both forward controls; focus moves back
    // to the previous-page button rather than being dropped on the document.
    await user.click(screen.getByRole('button', { name: 'Go to last page' }));
    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Go to first page' }));
    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toHaveFocus();

    // A move that lands mid-range leaves focus where the user put it.
    const nextPage = screen.getByRole('button', { name: 'Go to next page' });
    await user.click(nextPage);
    expect(nextPage).toHaveFocus();
  });

  it('cycles sortable headers through asc, desc, and none by keyboard', async () => {
    const user = userEvent.setup();
    render(<TestDataTable initialPageSize={3} />);
    const table = screen.getByRole('table', { name: 'Projects' });
    const sortButton = within(table).getByRole('button', { name: /Name/ });
    const sortHeader = sortButton.closest('th');

    sortButton.focus();
    await user.keyboard('{Enter}');
    expect(sortHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Alpha');

    await user.keyboard(' ');
    expect(sortHeader).toHaveAttribute('aria-sort', 'descending');
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Charlie');

    await user.keyboard('{Enter}');
    expect(sortHeader).toHaveAttribute('aria-sort', 'none');
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Beta');
  });

  it('uses standard keyboard activation for row selectors and actions', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <TestDataTable
        columns={createColumnsWithActions(onAction)}
        initialPageSize={3}
      />,
    );
    const rowCheckbox = screen.getByRole('checkbox', {
      name: 'Select row 1',
    });

    rowCheckbox.focus();
    await user.keyboard('{Enter}');
    expect(rowCheckbox).toHaveAttribute('aria-checked', 'false');

    await user.keyboard(' ');
    expect(rowCheckbox).toHaveAttribute('aria-checked', 'true');

    const actionButton = screen.getByRole('button', {
      name: 'Open actions for Beta',
    });
    actionButton.focus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('swaps the toolbar actions for the selection actions once a row is selected', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TestDataTable
        selectionActions={() => (
          <>
            <Button>Delete</Button>
            <Button>Export</Button>
          </>
        )}
        toolbarActions={<Button>Filter</Button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 row(s) selected.')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="data-table"]')).toHaveAttribute(
      'data-state',
      'selected',
    );

    // The selection actions replace the toolbar actions rather than joining
    // them, so the Columns menu and `toolbarActions` go away while selected.
    const selectionActions = container.querySelector(
      '[data-slot="data-table-selection-actions"]',
    );
    expect(
      within(selectionActions as HTMLElement).getByRole('button', {
        name: 'Delete',
      }),
    ).toBeInTheDocument();
    expect(
      within(selectionActions as HTMLElement).getByRole('button', {
        name: 'Export',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Filter' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Columns/ }),
    ).not.toBeInTheDocument();

    expect(screen.getByText('Beta').closest('tr')).toHaveAttribute(
      'data-state',
      'selected',
    );
  });

  it('names row checkboxes from the row itself when getRowLabel is supplied', async () => {
    const user = userEvent.setup();
    render(
      <TestDataTable
        getRowLabel={(project) => project.name}
        initialPageSize={3}
      />,
    );

    // Without getRowLabel the name is positional, which repeats across pages
    // and re-points at a different record after sorting.
    expect(
      screen.queryByRole('checkbox', { name: 'Select row 1' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Select Beta' }));
    expect(screen.getByText('Beta').closest('tr')).toHaveAttribute(
      'data-state',
      'selected',
    );

    // Sorting reorders the rows; the names travel with their record.
    await user.click(screen.getByRole('button', { name: /Name/ }));
    expect(screen.getByRole('checkbox', { name: 'Select Beta' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Select Alpha' }),
    ).not.toBeChecked();
  });

  it('marks the select-all checkbox mixed only while the page is partly selected', async () => {
    const user = userEvent.setup();
    render(<TestDataTable initialPageSize={3} />);
    const selectAll = screen.getByRole('checkbox', {
      name: 'Select all rows on this page',
    });

    expect(selectAll).toHaveAttribute('aria-checked', 'false');

    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(selectAll).toHaveAttribute('aria-checked', 'mixed');

    await user.click(selectAll);
    expect(selectAll).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('3 selected')).toBeInTheDocument();

    await user.click(selectAll);
    expect(selectAll).toHaveAttribute('aria-checked', 'false');
  });

  it('limits the selection and its actions to rows the filter still shows', async () => {
    const user = userEvent.setup();
    const selectionActions = vi.fn((_selectedRows: Project[]) => null);
    const { container } = render(
      <TestDataTable initialPageSize={3} selectionActions={selectionActions} />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(selectionActions).toHaveBeenLastCalledWith([
      { id: 'beta', name: 'Beta', owner: 'Grace' },
    ]);
    await user.type(
      screen.getByRole('searchbox', { name: 'Filter rows…' }),
      'Alpha',
    );

    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="data-table-selection-actions"]'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('0 of 1 row(s) selected.')).toBeInTheDocument();
  });

  it('renders a skeleton cell for every visible column while loading', () => {
    const wideColumns: DataTableColumnDef<Project>[] = Array.from(
      { length: 12 },
      (_, index) => ({
        accessorKey: 'name',
        header: `Column ${index + 1}`,
        id: `column-${index + 1}`,
      }),
    );
    const { container } = render(
      <TestDataTable columns={wideColumns} loading />,
    );

    const headerCells = container.querySelectorAll('thead th');
    const skeletonCells = container.querySelectorAll('tbody tr:first-child td');

    expect(headerCells).toHaveLength(13); // 12 columns + the selection column
    expect(skeletonCells).toHaveLength(headerCells.length);
  });

  it('opens the grouped Columns menu and toggles column visibility', async () => {
    const user = userEvent.setup();
    render(<TestDataTable initialPageSize={3} />);

    await user.click(screen.getByRole('button', { name: /Columns/ }));

    expect(await screen.findByText('Toggle columns')).toBeInTheDocument();
    const ownerToggle = await screen.findByRole('menuitemcheckbox', {
      name: 'Owner',
    });
    expect(ownerToggle).toHaveAttribute('aria-checked', 'true');

    await user.click(ownerToggle);

    expect(
      screen.queryByRole('columnheader', { name: 'Owner' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
  });

  it('moves between first, middle, and last pages', async () => {
    const user = userEvent.setup();
    render(<TestDataTable initialPageSize={1} pageSizeOptions={[1, 2]} />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to first page' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to last page' }));
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to next page' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to last page' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to previous page' }),
    ).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Go to last page' }));
    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' }),
    );
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to first page' }));
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('repaginates when the rows-per-page selector changes', async () => {
    const user = userEvent.setup();
    render(<TestDataTable initialPageSize={1} pageSizeOptions={[1, 3]} />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '3' }));

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('keeps selection, row actions, and pagination in the tab order', () => {
    render(
      <TestDataTable
        columns={createColumnsWithActions()}
        showColumnVisibility={false}
      />,
    );

    const tabbableControls = [
      screen.getByRole('checkbox', { name: 'Select all rows on this page' }),
      screen.getByRole('button', { name: /Name/ }),
      screen.getByRole('checkbox', { name: 'Select row 1' }),
      screen.getByRole('button', { name: 'Open actions for Beta' }),
      screen.getByRole('button', { name: 'Go to next page' }),
    ];

    for (const control of tabbableControls) {
      control.focus();
      expect(control).toHaveFocus();
      expect(control).not.toHaveAttribute('tabindex', '-1');
    }

    // Assert the stable data hooks rather than the class string, so restyling
    // a row action never breaks this test.
    const rowAction = screen.getByRole('button', {
      name: 'Open actions for Beta',
    });
    expect(rowAction).toHaveAttribute('data-slot', 'button');
    expect(rowAction).toHaveAttribute('data-variant', 'ghost');
    expect(rowAction).toHaveAttribute('data-size', 'icon-xs');
  });

  it('renders empty, loading, and error states from the design', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { container, rerender } = render(
      <TestDataTable
        data={[]}
        emptyDescription="Create a project to get started."
        emptyTitle="No projects yet"
      />,
    );

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="data-table"]')).toHaveAttribute(
      'data-state',
      'empty',
    );

    rerender(<TestDataTable loading />);
    expect(container.querySelector('[data-slot="data-table"]')).toHaveAttribute(
      'data-state',
      'loading',
    );
    expect(screen.getByRole('table', { name: 'Projects' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    rerender(
      <TestDataTable error="The service is unavailable." onRetry={onRetry} />,
    );
    // The error state is assertive (`alert`) where empty is polite
    // (`status`), and marks itself with the error variant rather than a class.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The service is unavailable.',
    );
    expect(
      container.querySelector('[data-slot="data-table-state"]'),
    ).toHaveAttribute('data-variant', 'error');
    expect(
      container.querySelector('[data-slot="data-table-error-icon"]'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();

    // `error` is a ReactNode, so a node is rendered as the description while
    // bare `true` falls back to the generic copy.
    rerender(<TestDataTable error={<span>Upstream timed out.</span>} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Upstream timed out.');

    rerender(<TestDataTable error />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'There was a problem reaching the server.',
    );
  });
});

// CSS transitions and skeleton animation are not testable in jsdom; the
// loading and interactive states are visually verified in Storybook.
