import {
  type CellData,
  type ColumnDef,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  type RowSelectionState,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleAlertIcon,
  Columns3Icon,
  InboxIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  XIcon,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Input } from '@/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

/**
 * The TanStack feature set every {@link DataTable} is built from. Exported so
 * callers can build a matching table instance or column definition outside the
 * component.
 */
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { text: sortFn_text },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
});

/**
 * A TanStack `ColumnDef` bound to the feature set above, so `filterFn`,
 * `sortFn`, and the other feature-specific keys type-check against the
 * features {@link DataTable} actually enables.
 */
type DataTableColumnDef<
  TData extends Record<string, unknown>,
  TValue extends CellData = CellData,
> = ColumnDef<typeof dataTableFeatures, TData, TValue>;

/**
 * The table instance {@link DataTable} builds internally. Exported so callers
 * can type a helper that receives one without restating the feature set.
 */
type DataTableInstance<TData extends Record<string, unknown>> = ReturnType<
  typeof useTable<typeof dataTableFeatures, TData>
>;

type DataTableProps<TData extends Record<string, unknown>> = {
  /**
   * Accessible name for the table. {@link Table} also derives the name of its
   * horizontal scroll container from it.
   */
  ariaLabel: string;
  /** TanStack Table v9 column definitions. */
  columns: ReadonlyArray<DataTableColumnDef<TData>>;
  /** Stable data array rendered, filtered, sorted, selected, and paginated. */
  data: TData[];
  /** Returns a stable application id for each row. */
  getRowId?: (row: TData, index: number) => string;
  /**
   * Names the row in its selection checkbox, as `Select {label}`. Without it
   * the checkboxes fall back to the row's position ("Select row 1"), which
   * repeats on every page and points at a different record after sorting, so
   * pass something drawn from the row itself wherever one exists.
   */
  getRowLabel?: (row: TData, index: number) => string;
  /** Column id the toolbar search filters. Omit to hide the search input. */
  filterColumnId?: string;
  /**
   * Accessible name for the toolbar search input. When omitted, it is derived
   * from `filterPlaceholder` without a trailing ellipsis.
   */
  filterLabel?: string;
  /** Visible placeholder for the toolbar search input. */
  filterPlaceholder?: string;
  /** Search value the table starts with; it owns the value from then on. */
  initialFilterValue?: string;
  /** Zero-based page the table starts on; it owns the page from then on. */
  initialPageIndex?: number;
  /** Rows per page until the rows-per-page selector changes it. */
  initialPageSize?: number;
  /** Page sizes offered by the rows-per-page selector. */
  pageSizeOptions?: number[];
  /**
   * Rows selected on first render, keyed by `getRowId` — or by row index when
   * `getRowId` is omitted, which is how TanStack keys rows by default.
   */
  initialRowSelection?: RowSelectionState;
  /** Adds the selection column and selection count. */
  selectable?: boolean;
  /** Shows the column-visibility menu while no rows are selected. */
  showColumnVisibility?: boolean;
  /** Shows selection count, page size, page information, and page controls. */
  showPagination?: boolean;
  /**
   * Extra toolbar controls, shown while no rows are selected —
   * `selectionActions` takes over the toolbar once a selection exists.
   */
  toolbarActions?: ReactNode;
  /**
   * Actions shown in place of `toolbarActions` once one or more rows are
   * selected. Receives only the selected rows the active filter still shows.
   */
  selectionActions?: (selectedRows: TData[]) => ReactNode;
  /**
   * Replaces the rows with skeleton placeholders, marks the table `aria-busy`,
   * disables the search and selection controls, and hides the pagination
   * footer until loading finishes.
   */
  loading?: boolean;
  /**
   * Any truthy value replaces the rows with the error state: pass a node to
   * describe the failure, or `true` for the generic connection message.
   */
  error?: ReactNode;
  /** Retry callback shown in the error state. */
  onRetry?: () => void;
  /** Empty-state heading when the unfiltered dataset has no rows. */
  emptyTitle?: string;
  /** Empty-state supporting copy. */
  emptyDescription?: string;
  /** Optional empty-state call to action. */
  emptyAction?: ReactNode;
  /** Heading shown when active filters return no rows. */
  filteredEmptyTitle?: string;
  /** Supporting copy shown when active filters return no rows. */
  filteredEmptyDescription?: string;
  /** Additional classes for the data-table root. */
  className?: string;
};

/**
 * Centered icon/title/description block that stands in for the rows when the
 * table has nothing to show. `variant="error"` colors the icon and promotes
 * the block from a polite `status` to an assertive `alert`.
 */
function DataTableState({
  action,
  description,
  icon,
  title,
  variant = 'default',
}: {
  action?: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  title: ReactNode;
  variant?: 'default' | 'error';
}) {
  return (
    <div
      className="flex min-h-60 flex-col items-center justify-center gap-2 px-6 py-10 text-center"
      data-slot="data-table-state"
      data-variant={variant}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mb-1 text-muted-foreground',
          variant === 'error' && 'text-destructive-foreground',
        )}
      >
        {icon}
      </span>
      <p className="font-medium text-foreground text-sm">{title}</p>
      <div className="max-w-sm text-muted-foreground text-sm leading-5">
        {description}
      </div>
      {action == null ? null : <div className="mt-1">{action}</div>}
    </div>
  );
}

/**
 * Placeholder rows shown while `loading`. They are `aria-hidden` because the
 * table already advertises the wait through `aria-busy`, and the varying bar
 * widths only exist to keep the block from reading as a grid of identical
 * boxes.
 */
function DataTableSkeleton({
  columnIds,
  rowCount,
  selectable,
}: {
  columnIds: string[];
  rowCount: number;
  selectable: boolean;
}) {
  const rowKeys = Array.from(
    { length: rowCount },
    (_, index) => `skeleton-row-${index}`,
  );

  return rowKeys.map((rowKey) => (
    <TableRow aria-hidden="true" key={rowKey}>
      {selectable ? (
        <TableCell className="h-10 w-11 px-3 py-2">
          <span className="block size-4 rounded bg-muted motion-safe:animate-pulse" />
        </TableCell>
      ) : null}
      {columnIds.map((columnId, columnIndex) => (
        <TableCell className="h-10 px-3 py-2" key={columnId}>
          <span
            className={cn(
              'block h-3 rounded bg-muted motion-safe:animate-pulse',
              columnIndex % 3 === 0
                ? 'w-24'
                : columnIndex % 3 === 1
                  ? 'w-36'
                  : 'w-16',
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

/**
 * Reusable TanStack Table v9 renderer matching Nebari's Figma data-table
 * states. It combines the existing Table, Input, Checkbox, Button, Select, and
 * DropdownMenu registry primitives without hiding TanStack column definitions.
 */
function DataTable<TData extends Record<string, unknown>>({
  ariaLabel = 'Data table',
  className,
  columns = [],
  data = [],
  emptyAction,
  emptyDescription = 'Add data to see it here.',
  emptyTitle = 'No data yet',
  error,
  filteredEmptyDescription = 'Try a different search or clear your filters.',
  filteredEmptyTitle = 'No results found',
  filterColumnId,
  filterLabel,
  filterPlaceholder = 'Filter rows…',
  getRowId,
  getRowLabel,
  initialFilterValue = '',
  initialPageIndex = 0,
  initialPageSize = 10,
  initialRowSelection = {},
  loading = false,
  onRetry,
  pageSizeOptions = [10, 20, 30, 40, 50],
  selectable = true,
  selectionActions,
  showColumnVisibility = true,
  showPagination = true,
  toolbarActions,
}: DataTableProps<TData>) {
  const initialState = useMemo(
    () => ({
      columnFilters:
        filterColumnId === undefined || initialFilterValue === ''
          ? []
          : [{ id: filterColumnId, value: initialFilterValue }],
      pagination: {
        pageIndex: initialPageIndex,
        pageSize: initialPageSize,
      },
      rowSelection: initialRowSelection,
    }),
    [
      filterColumnId,
      initialFilterValue,
      initialPageIndex,
      initialPageSize,
      initialRowSelection,
    ],
  );
  const table = useTable({
    columns,
    data,
    enableRowSelection: selectable,
    enableSortingRemoval: true,
    features: dataTableFeatures,
    getRowId,
    initialState,
  });
  const filterColumn =
    filterColumnId === undefined ? undefined : table.getColumn(filterColumnId);
  const filterValue =
    (filterColumn?.getFilterValue() as string | undefined) ?? '';
  const resolvedFilterLabel =
    filterLabel ?? filterPlaceholder.replace(/(?:…|\.{3})\s*$/, '');
  const rows = table.getRowModel().rows;
  // Selection is read from the filtered model so bulk actions never receive a
  // row the active filter has hidden from the user.
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .flatRows.map((row) => row.original);
  const selectedCount = selectedRows.length;
  const filteredRowCount = table.getFilteredRowModel().flatRows.length;
  const isFiltered = table.state.columnFilters.length > 0;
  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = visibleColumns.length + (selectable ? 1 : 0);
  const pageCount = table.getPageCount();
  const pageIndex = table.state.pagination.pageIndex;
  const pageSize = table.state.pagination.pageSize;
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  const state = error
    ? 'error'
    : loading
      ? 'loading'
      : filteredRowCount === 0 && isFiltered
        ? 'filtered-empty'
        : data.length === 0
          ? 'empty'
          : selectedCount > 0
            ? 'selected'
            : 'default';

  // Filtering, sorting, and paging swap the rows out silently — nothing about
  // that reaches a screen reader on its own (WCAG 2.1 SC 4.1.3). This region
  // narrates the result set instead. The states that already announce
  // themselves are left out so nothing is said twice: the error state is an
  // `alert`, and the empty and filtered-empty states are their own `status`.
  const countMessage = `${filteredRowCount} ${isFiltered ? 'result' : 'row'}${
    filteredRowCount === 1 ? '' : 's'
  }`;
  const statusMessage = error
    ? null
    : loading
      ? 'Loading data'
      : rows.length === 0
        ? null
        : showPagination && pageCount > 1
          ? `${countMessage}, page ${pageIndex + 1} of ${pageCount}`
          : countMessage;

  const searchRef = useRef<HTMLInputElement>(null);
  const previousPageRef = useRef<HTMLButtonElement>(null);
  const nextPageRef = useRef<HTMLButtonElement>(null);
  // A pager button that reaches the end of its travel disables itself, and a
  // disabled button cannot hold focus — the browser drops it to <body> and the
  // keyboard user loses their place. Record which way the press was headed,
  // then hand focus to the opposite-direction button, which is necessarily
  // enabled: a press could only happen with two or more pages in that
  // direction's travel.
  // `pageIndex` is in the dependency list on purpose even though the body does
  // not read it: it is what changes on *every* page move, so the effect always
  // runs and clears the flag. Without it a press that leaves both edges
  // untouched would strand the flag and misfire on some later render.
  const pressedPagerDirection = useRef<'backward' | 'forward' | undefined>(
    undefined,
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    const direction = pressedPagerDirection.current;
    pressedPagerDirection.current = undefined;
    if (direction === 'backward' && !canPreviousPage) {
      nextPageRef.current?.focus();
    } else if (direction === 'forward' && !canNextPage) {
      previousPageRef.current?.focus();
    }
  }, [pageIndex, canPreviousPage, canNextPage]);

  function goToPage(direction: 'backward' | 'forward', go: () => void) {
    pressedPagerDirection.current = direction;
    go();
  }

  return (
    <div
      className={cn('flex w-full flex-col gap-4', className)}
      data-slot="data-table"
      data-state={state}
    >
      {/* Stays mounted even when it has nothing to say: a live region has to
          exist before its content changes for assistive tech to announce it. */}
      <p
        aria-live="polite"
        className="sr-only"
        data-slot="data-table-status"
        role="status"
      >
        {statusMessage}
      </p>

      <div
        className="flex min-h-8 flex-wrap items-center gap-2"
        data-slot="data-table-toolbar"
      >
        {filterColumn === undefined ? null : (
          <div className="relative w-full sm:w-[280px]">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 z-10 size-[18px] -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label={resolvedFilterLabel}
              className="h-8 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
              disabled={loading}
              onChange={(event) =>
                filterColumn.setFilterValue(event.target.value)
              }
              placeholder={filterPlaceholder}
              ref={searchRef}
              type="search"
              value={filterValue}
            />
            {filterValue === '' ? null : (
              <Button
                aria-label="Clear search"
                className="absolute top-1/2 right-1 z-10 -translate-y-1/2 focus-visible:ring-offset-0"
                disabled={loading}
                onClick={() => {
                  filterColumn.setFilterValue('');
                  searchRef.current?.focus();
                }}
                size="icon-xs"
                variant="ghost"
              >
                <XIcon />
              </Button>
            )}
          </div>
        )}

        {selectedCount > 0 ? (
          <div
            className="ml-auto flex flex-wrap items-center justify-end gap-2"
            data-slot="data-table-selection-actions"
          >
            <span
              className="font-medium text-foreground text-sm"
              data-slot="data-table-toolbar-selection-count"
            >
              {selectedCount} selected
            </span>
            {selectionActions?.(selectedRows)}
          </div>
        ) : (
          <>
            {toolbarActions}
            {showColumnVisibility ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-8"
                  expandIcon={<ChevronDownIcon />}
                  showExpandIcon
                  variant="outline"
                >
                  <Columns3Icon />
                  Columns
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuGroupLabel>
                        Toggle columns
                      </DropdownMenuGroupLabel>
                      {table
                        .getAllLeafColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => (
                          <DropdownMenuCheckboxItem
                            checked={column.getIsVisible()}
                            closeOnClick={false}
                            key={column.id}
                            onCheckedChange={(checked) =>
                              column.toggleVisibility(checked)
                            }
                          >
                            {typeof column.columnDef.header === 'string'
                              ? column.columnDef.header
                              : column.id}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            ) : null}
          </>
        )}
      </div>

      <Table aria-busy={loading || undefined} aria-label={ariaLabel}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {selectable ? (
                <TableHead className="w-11 px-3" scope="col">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={table.getIsAllPageRowsSelected()}
                    disabled={loading || rows.length === 0}
                    indeterminate={
                      table.getIsSomePageRowsSelected() &&
                      !table.getIsAllPageRowsSelected()
                    }
                    onCheckedChange={(checked) =>
                      table.toggleAllPageRowsSelected(checked)
                    }
                  />
                </TableHead>
              ) : null}
              {headerGroup.headers.map((header) => {
                const sort = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <TableHead
                    aria-sort={
                      sort === 'asc'
                        ? 'ascending'
                        : sort === 'desc'
                          ? 'descending'
                          : canSort
                            ? 'none'
                            : undefined
                    }
                    className="px-3 [&_[data-slot=table-head-button]]:px-3"
                    key={header.id}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    scope="col"
                  >
                    {header.isPlaceholder ? null : (
                      <span className="flex w-full items-center gap-1">
                        <span className="flex-1">
                          <table.FlexRender header={header} />
                        </span>
                        {canSort ? (
                          sort === 'asc' ? (
                            <ArrowUpIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          ) : sort === 'desc' ? (
                            <ArrowDownIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          ) : (
                            <ArrowUpDownIcon
                              aria-hidden="true"
                              className="size-3.5 text-muted-foreground"
                            />
                          )
                        ) : null}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <DataTableSkeleton
              columnIds={visibleColumns.map((column) => column.id)}
              rowCount={Math.min(initialPageSize, 5)}
              selectable={selectable}
            />
          ) : error ? (
            <TableRow className="hover:bg-transparent">
              <TableCell className="h-auto p-0" colSpan={columnCount}>
                <DataTableState
                  action={
                    onRetry === undefined ? null : (
                      <Button onClick={onRetry} variant="outline">
                        <RefreshCwIcon />
                        Retry
                      </Button>
                    )
                  }
                  // `error` is a ReactNode, so anything the caller passes is
                  // rendered as the description; `true` is the "just show the
                  // error state" shorthand and falls back to generic copy.
                  description={
                    error === true
                      ? 'There was a problem reaching the server. Check your connection and try again.'
                      : error
                  }
                  icon={
                    <CircleAlertIcon
                      className="size-6"
                      data-slot="data-table-error-icon"
                      strokeWidth={1.5}
                    />
                  }
                  title="Couldn’t load data"
                  variant="error"
                />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell className="h-auto p-0" colSpan={columnCount}>
                {isFiltered ? (
                  <DataTableState
                    action={
                      <Button
                        // Clearing the filter unmounts this button, so send
                        // focus back to the search input that produced the
                        // empty result rather than letting it fall to <body>.
                        onClick={() => {
                          table.resetColumnFilters(true);
                          searchRef.current?.focus();
                        }}
                        variant="outline"
                      >
                        <SearchXIcon />
                        Clear filters
                      </Button>
                    }
                    description={filteredEmptyDescription}
                    icon={<SearchXIcon className="size-6" />}
                    title={filteredEmptyTitle}
                  />
                ) : (
                  <DataTableState
                    action={emptyAction}
                    description={emptyDescription}
                    icon={<InboxIcon className="size-6" />}
                    title={emptyTitle}
                  />
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() ? 'selected' : undefined}
                key={row.id}
              >
                {selectable ? (
                  <TableCell className="h-10 w-11 px-3 py-2">
                    <Checkbox
                      aria-label={`Select ${
                        getRowLabel === undefined
                          ? `row ${row.getDisplayIndex() + 1}`
                          : getRowLabel(row.original, row.index)
                      }`}
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      onCheckedChange={(checked) => row.toggleSelected(checked)}
                    />
                  </TableCell>
                ) : null}
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="h-10 px-3 py-2" key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showPagination && !loading && !error && pageCount > 0 ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3"
          data-slot="data-table-pagination"
        >
          {selectable ? (
            <p className="flex-1 text-muted-foreground text-sm">
              {selectedCount} of {filteredRowCount} row(s) selected.
            </p>
          ) : null}
          <div className="ml-auto flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[11px] text-muted-foreground">
                Rows per page
              </span>
              <Select
                disabled={loading}
                onValueChange={(value) => table.setPageSize(Number(value))}
                value={String(pageSize)}
              >
                <SelectTrigger
                  aria-label="Rows per page"
                  className="h-8 w-[76px] py-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="font-medium text-foreground text-sm whitespace-nowrap">
              Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
            </p>
            <div className="flex items-center gap-1">
              <Button
                aria-label="Go to first page"
                disabled={loading || !canPreviousPage}
                onClick={() => goToPage('backward', () => table.firstPage())}
                size="icon-sm"
                variant="outline"
              >
                <ChevronsLeftIcon />
              </Button>
              <Button
                aria-label="Go to previous page"
                disabled={loading || !canPreviousPage}
                onClick={() => goToPage('backward', () => table.previousPage())}
                ref={previousPageRef}
                size="icon-sm"
                variant="outline"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                aria-label="Go to next page"
                disabled={loading || !canNextPage}
                onClick={() => goToPage('forward', () => table.nextPage())}
                ref={nextPageRef}
                size="icon-sm"
                variant="outline"
              >
                <ChevronRightIcon />
              </Button>
              <Button
                aria-label="Go to last page"
                disabled={loading || !table.getCanLastPage()}
                onClick={() => goToPage('forward', () => table.lastPage())}
                size="icon-sm"
                variant="outline"
              >
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { DataTableColumnDef, DataTableInstance, DataTableProps };
export { DataTable, dataTableFeatures };
