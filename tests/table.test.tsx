import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

function TestTable() {
  return (
    <Table aria-label="Environments">
      <TableCaption>Environment status</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Name</TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>Data Science</TableCell>
          <TableCell>Running</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>1 environment</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function SortableTestTable() {
  const [rows, setRows] = useState([
    { name: 'Beta', status: 'Stopped' },
    { name: 'Alpha', status: 'Running' },
  ]);

  return (
    <Table aria-label="Sortable environments">
      <TableHeader>
        <TableRow>
          <TableHead
            aria-sort="none"
            onClick={() => {
              setRows((currentRows) =>
                [...currentRows].sort((first, second) =>
                  first.name.localeCompare(second.name),
                ),
              );
            }}
            scope="col"
          >
            Name
          </TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('renders its semantic parts with stable data slots', () => {
    render(<TestTable />);

    const table = screen.getByRole('table', { name: 'Environments' });
    const scrollContainer = screen.getByRole('region', {
      name: 'Environments scroll area',
    });

    expect(table).toHaveAttribute('data-slot', 'table');
    expect(table).toHaveClass('bg-card');
    expect(scrollContainer).toHaveAttribute('data-slot', 'table-container');
    expect(scrollContainer).toHaveAttribute('tabindex', '0');
    expect(scrollContainer).toHaveClass(
      'bg-card',
      'overflow-x-auto',
      'focus-visible:ring-2',
    );
    expect(table.querySelector('[data-slot="table-header"]')).toHaveClass(
      'bg-background',
    );
    for (const header of screen.getAllByRole('columnheader')) {
      expect(header).toHaveClass('bg-background');
    }
    expect(table.querySelector('[data-slot="table-body"]')).toBeInTheDocument();
    expect(table.querySelector('[data-slot="table-footer"]')).toHaveClass(
      'bg-card',
    );
    expect(screen.getByText('Environment status')).toHaveAttribute(
      'data-slot',
      'table-caption',
    );
  });

  it('renders headers and cells with the Nebari typography', () => {
    render(<TestTable />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass(
      'bg-background',
      'text-sm',
      'leading-5',
      'font-medium',
      'text-foreground',
    );
    expect(screen.getByRole('cell', { name: 'Data Science' })).toHaveClass(
      'text-sm',
      'leading-5',
    );
  });

  it('keeps static header cells non-focusable', () => {
    render(<TestTable />);

    for (const header of screen.getAllByRole('columnheader')) {
      expect(header).not.toHaveAttribute('tabindex');
      expect(header).not.toHaveClass('hover:underline');
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders sortable header labels as real buttons', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={onSort} scope="col">
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    const header = screen.getByRole('columnheader', { name: 'Name' });
    const sortButton = screen.getByRole('button', { name: 'Name' });

    expect(header).not.toHaveAttribute('tabindex');
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(sortButton).toHaveAttribute('data-slot', 'table-head-button');
    expect(sortButton).toHaveClass(
      'hover:bg-muted-foreground/10',
      'hover:underline',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'text-sm',
      'leading-5',
    );

    await user.click(sortButton);
    expect(sortButton).toHaveFocus();
    expect(onSort).toHaveBeenCalledOnce();
  });

  it('activates sortable header buttons from the keyboard', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={onSort} scope="col">
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );

    screen.getByRole('button', { name: 'Name' }).focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onSort).toHaveBeenCalledTimes(2);
  });

  it('supports sorting rows when a sortable header is clicked', async () => {
    const user = userEvent.setup();
    render(<SortableTestTable />);

    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['Beta', 'Stopped', 'Alpha', 'Running'],
    );

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
      ['Alpha', 'Running', 'Beta', 'Stopped'],
    );
  });

  it('keeps selection and hover styling on the row', () => {
    render(<TestTable />);

    const nameCell = screen.getByRole('cell', { name: 'Data Science' });
    const statusCell = screen.getByRole('cell', { name: 'Running' });
    const row = nameCell.closest('[data-slot="table-row"]');

    expect(row).toHaveAttribute('data-state', 'selected');
    expect(row).toHaveClass('data-[state=selected]:bg-muted');
    expect(row).toHaveClass('hover:bg-muted/50');
    expect(nameCell).not.toHaveClass('hover:bg-muted/50');
    expect(statusCell).not.toHaveClass('hover:bg-muted/50');
  });

  it('merges caller classes onto the table and cells', () => {
    render(
      <Table className="min-w-96">
        <TableBody>
          <TableRow>
            <TableCell className="text-right">Value</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole('table')).toHaveClass('min-w-96');
    expect(screen.getByRole('cell', { name: 'Value' })).toHaveClass(
      'text-right',
    );
  });
});
