import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
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

type Environment = {
  name: string;
  owner: string;
  resources: string;
  status: string;
  updated: string;
  updatedMinutes: number;
};

type SortDirection = 'ascending' | 'descending';
type SortKey = 'name' | 'updated';
type SortState = { direction: SortDirection; key: SortKey };

const sortIconClassName = 'size-3.5 shrink-0 text-muted-foreground/70';

const tableDocsDescription =
  'Nebari table primitives for building semantic data tables with responsive horizontal scrolling, captions, headers, body rows, footers, sortable headers, selected rows, and empty states.';

const environments = [
  {
    name: 'Data Science',
    owner: 'Ada Lovelace',
    resources: '4 CPUs / 16 GB',
    status: 'Running',
    updated: '3 minutes ago',
    updatedMinutes: 3,
  },
  {
    name: 'Geospatial Analysis',
    owner: 'Grace Hopper',
    resources: '2 CPUs / 8 GB',
    status: 'Stopped',
    updated: '2 hours ago',
    updatedMinutes: 120,
  },
  {
    name: 'Model Training',
    owner: 'Katherine Johnson',
    resources: '8 CPUs / 32 GB',
    status: 'Starting',
    updated: 'Yesterday',
    updatedMinutes: 1440,
  },
] satisfies Environment[];

const sortableColumnsSource = `import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

type SortDirection = 'ascending' | 'descending';
type SortKey = 'name' | 'updated';

// Keep sort state in the component that owns the table data.
const [sort, setSort] = useState<{
  direction: SortDirection;
  key: SortKey;
}>({
  direction: 'ascending',
  key: 'name',
});

// Sort the rows before rendering them.
const sortedRows = useMemo(
  () => sortEnvironments(rows, sort.key, sort.direction),
  [rows, sort],
);

function handleSort(key: SortKey) {
  setSort((current) =>
    // A new column starts ascending. Clicking the same column toggles it.
    current.key !== key
      ? { direction: 'ascending', key }
      : {
          direction:
            current.direction === 'ascending' ? 'descending' : 'ascending',
          key,
        },
  );
}

<TableHead
  // aria-sort tells assistive technology which column is sorted.
  aria-sort={sort.key === 'name' ? sort.direction : 'none'}
  // TableHead wraps sortable labels in a real button when onClick exists.
  onClick={() => {
    handleSort('name');
  }}
  scope="col"
>
  <span className="inline-flex items-center gap-1">
    Environment
    {sort.key === 'name' ? (
      sort.direction === 'ascending' ? (
        <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" />
      ) : (
        <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" />
      )
    ) : (
      <ChevronsUpDown aria-hidden="true" className="size-3.5 shrink-0" />
    )}
  </span>
</TableHead>

// A header without onClick is static and not focusable.
<TableHead scope="col">Status</TableHead>`;

function getSortValue(environment: Environment, key: SortKey) {
  if (key === 'updated') {
    return environment.updatedMinutes;
  }

  return environment[key];
}

function sortEnvironments(
  rows: Environment[],
  key: SortKey,
  direction: SortDirection,
) {
  return [...rows].sort((first, second) => {
    const firstValue = getSortValue(first, key);
    const secondValue = getSortValue(second, key);
    const comparison =
      typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue));

    return direction === 'ascending' ? comparison : -comparison;
  });
}

function getSortIcon(sort: SortState, key: SortKey) {
  if (sort.key !== key) {
    return <ChevronsUpDown aria-hidden="true" className={sortIconClassName} />;
  }

  const SortIcon = sort.direction === 'ascending' ? ArrowUp : ArrowDown;

  return <SortIcon aria-hidden="true" className={sortIconClassName} />;
}

function totalCpuCount(rows: Environment[]) {
  return rows.reduce((total, environment) => {
    const cpuMatch = environment.resources.match(/^(\d+) CPUs/);
    return total + (cpuMatch == null ? 0 : Number(cpuMatch[1]));
  }, 0);
}

function totalMemoryCount(rows: Environment[]) {
  return rows.reduce((total, environment) => {
    const memoryMatch = environment.resources.match(/\/ (\d+) GB$/);
    return total + (memoryMatch == null ? 0 : Number(memoryMatch[1]));
  }, 0);
}

function EnvironmentRows({
  rows,
  selectedName,
}: {
  rows: Environment[];
  selectedName?: string;
}) {
  return (
    <TableBody>
      {rows.map((environment) => (
        <TableRow
          data-state={
            environment.name === selectedName ? 'selected' : undefined
          }
          key={environment.name}
        >
          <TableCell className="font-medium">{environment.name}</TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-primary"
              />
              {environment.status}
            </span>
          </TableCell>
          <TableCell>{environment.owner}</TableCell>
          <TableCell className="text-muted-foreground">
            {environment.updated}
          </TableCell>
          <TableCell className="text-right">{environment.resources}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function EnvironmentFooter({ rows }: { rows: Environment[] }) {
  return (
    <TableFooter>
      <TableRow>
        <TableCell className="font-medium" colSpan={4}>
          Total allocated
        </TableCell>
        <TableCell className="text-right">
          {totalCpuCount(rows)} CPUs / {totalMemoryCount(rows)} GB
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}

function StaticEnvironmentsTable() {
  return (
    <Table aria-label="Nebari environments">
      <TableCaption className="sr-only">
        Nebari environments and their current status
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Environment</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Owner</TableHead>
          <TableHead scope="col">Last updated</TableHead>
          <TableHead className="text-right" scope="col">
            Resources
          </TableHead>
        </TableRow>
      </TableHeader>
      <EnvironmentRows rows={environments} />
    </Table>
  );
}

function DefaultEnvironmentsTable() {
  return (
    <Table aria-label="Environment resource allocation">
      <TableCaption>
        Environment resource allocation across active Nebari workspaces.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Environment</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Owner</TableHead>
          <TableHead scope="col">Last updated</TableHead>
          <TableHead className="text-right" scope="col">
            Resources
          </TableHead>
        </TableRow>
      </TableHeader>
      <EnvironmentRows rows={environments} />
      <EnvironmentFooter rows={environments} />
    </Table>
  );
}

function EmptyEnvironmentsTable() {
  return (
    <Table aria-label="Environment search results">
      <TableCaption>No environments match the current filters.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Environment</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Owner</TableHead>
          <TableHead scope="col">Last updated</TableHead>
          <TableHead className="text-right" scope="col">
            Resources
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            className="h-24 text-center text-muted-foreground"
            colSpan={5}
          >
            No environments found.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function SortEnabledHeaderPreview() {
  const [sort, setSort] = useState<SortState>({
    direction: 'ascending',
    key: 'name',
  });

  function handleSort(key: SortKey) {
    setSort((current) => {
      if (current.key !== key) {
        return { direction: 'ascending', key };
      }

      return {
        direction:
          current.direction === 'ascending' ? 'descending' : 'ascending',
        key,
      };
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            aria-sort={sort.key === 'name' ? sort.direction : 'none'}
            onClick={() => {
              handleSort('name');
            }}
            scope="col"
          >
            <span className="inline-flex items-center gap-1">
              Environment
              {getSortIcon(sort, 'name')}
            </span>
          </TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Owner</TableHead>
          <TableHead
            aria-sort={sort.key === 'updated' ? sort.direction : 'none'}
            onClick={() => {
              handleSort('updated');
            }}
            scope="col"
          >
            <span className="inline-flex items-center gap-1">
              Last updated
              {getSortIcon(sort, 'updated')}
            </span>
          </TableHead>
          <TableHead className="text-right" scope="col">
            Resources
          </TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  );
}

function SortableEnvironmentsTable() {
  const [sort, setSort] = useState<SortState>({
    direction: 'ascending',
    key: 'name',
  });
  const sortedEnvironments = useMemo(
    () => sortEnvironments(environments, sort.key, sort.direction),
    [sort],
  );

  function handleSort(key: SortKey) {
    setSort((current) => {
      if (current.key !== key) {
        return { direction: 'ascending', key };
      }

      return {
        direction:
          current.direction === 'ascending' ? 'descending' : 'ascending',
        key,
      };
    });
  }

  return (
    <Table>
      <TableCaption className="sr-only">
        Nebari environments and their current status. Environment and Last
        updated columns are sortable.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead
            aria-sort={sort.key === 'name' ? sort.direction : 'none'}
            onClick={() => {
              handleSort('name');
            }}
            scope="col"
          >
            <span className="inline-flex items-center gap-1">
              Environment
              {getSortIcon(sort, 'name')}
            </span>
          </TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Owner</TableHead>
          <TableHead
            aria-sort={sort.key === 'updated' ? sort.direction : 'none'}
            onClick={() => {
              handleSort('updated');
            }}
            scope="col"
          >
            <span className="inline-flex items-center gap-1">
              Last updated
              {getSortIcon(sort, 'updated')}
            </span>
          </TableHead>
          <TableHead className="text-right" scope="col">
            Resources
          </TableHead>
        </TableRow>
      </TableHeader>
      <EnvironmentRows rows={sortedEnvironments} />
    </Table>
  );
}

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component: tableDocsDescription,
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[56rem] max-w-[calc(100vw-3rem)]">
      <DefaultEnvironmentsTable />
    </div>
  ),
};

export const Header: Story = {
  render: () => (
    <div className="w-[44rem] max-w-[calc(100vw-3rem)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Environment</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Owner</TableHead>
            <TableHead className="text-right" scope="col">
              Resources
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </div>
  ),
};

export const SortEnabledHeader: Story = {
  name: 'Sort enabled header',
  parameters: {
    docs: {
      description: {
        story:
          'A header-only example with two sortable columns. Click Environment or Last updated to change the active sort state.',
      },
    },
  },
  render: () => (
    <div className="w-[44rem] max-w-[calc(100vw-3rem)]">
      <SortEnabledHeaderPreview />
    </div>
  ),
};

export const Cell: Story = {
  render: () => (
    <div className="w-[44rem] max-w-[calc(100vw-3rem)]">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Data Science</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const WithFooter: Story = {
  name: 'With footer',
  render: () => (
    <div className="w-[56rem] max-w-[calc(100vw-3rem)]">
      <Table aria-label="Environment totals">
        <TableCaption className="sr-only">
          Nebari environments with total allocated resources
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Environment</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Owner</TableHead>
            <TableHead scope="col">Last updated</TableHead>
            <TableHead className="text-right" scope="col">
              Resources
            </TableHead>
          </TableRow>
        </TableHeader>
        <EnvironmentRows rows={environments} />
        <EnvironmentFooter rows={environments} />
      </Table>
    </div>
  ),
};

export const SelectedRow: Story = {
  name: 'Selected row',
  render: () => (
    <div className="w-[56rem] max-w-[calc(100vw-3rem)]">
      <Table aria-label="Selected environment">
        <TableCaption className="sr-only">
          Nebari environments with the selected row highlighted
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Environment</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Owner</TableHead>
            <TableHead scope="col">Last updated</TableHead>
            <TableHead className="text-right" scope="col">
              Resources
            </TableHead>
          </TableRow>
        </TableHeader>
        <EnvironmentRows rows={environments} selectedName="Model Training" />
      </Table>
    </div>
  ),
};

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => (
    <div className="w-[56rem] max-w-[calc(100vw-3rem)]">
      <EmptyEnvironmentsTable />
    </div>
  ),
};

export const ExamplePage: Story = {
  name: 'Example page',
  render: () => (
    <main className="w-[56rem] max-w-[calc(100vw-3rem)] space-y-6 rounded-lg bg-background p-6">
      <header className="space-y-1">
        <h2 className="font-semibold text-foreground text-xl">Environments</h2>
        <p className="text-muted-foreground text-sm">
          Manage shared development and data science environments.
        </p>
      </header>

      <StaticEnvironmentsTable />
    </main>
  ),
};

export const SortableColumns: Story = {
  name: 'Sortable columns',
  parameters: {
    docs: {
      description: {
        story:
          'Use `TableHead` with `onClick` and `aria-sort` for sortable columns. Leave non-sortable headers as plain `TableHead` cells.',
      },
      source: {
        code: sortableColumnsSource,
      },
    },
  },
  render: () => (
    <main className="w-[56rem] max-w-[calc(100vw-3rem)] space-y-6 rounded-lg bg-background p-6">
      <header className="space-y-1">
        <h2 className="font-semibold text-foreground text-xl">
          Sortable environments
        </h2>
        <p className="text-muted-foreground text-sm">
          Only the Environment and Last updated headers are sortable; the other
          columns remain static.
        </p>
      </header>

      <SortableEnvironmentsTable />
    </main>
  ),
};
