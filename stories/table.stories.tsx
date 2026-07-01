import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

const tableDocsDescription =
  'Nebari table primitives for building semantic data tables with responsive horizontal scrolling, captions, headers, body rows, footers, and empty states.';

const environments = [
  {
    name: 'Data Science',
    owner: 'Ada Lovelace',
    resources: '4 CPUs / 16 GB',
    status: 'Running',
    updated: '3 minutes ago',
  },
  {
    name: 'Geospatial Analysis',
    owner: 'Grace Hopper',
    resources: '2 CPUs / 8 GB',
    status: 'Stopped',
    updated: '2 hours ago',
  },
  {
    name: 'Model Training',
    owner: 'Katherine Johnson',
    resources: '8 CPUs / 32 GB',
    status: 'Starting',
    updated: 'Yesterday',
  },
] satisfies Environment[];

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

function EnvironmentRows({ rows }: { rows: Environment[] }) {
  return (
    <TableBody>
      {rows.map((environment) => (
        <TableRow key={environment.name}>
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
        <TableRow className="hover:bg-transparent">
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
          <TableRow className="border-b-0">
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
