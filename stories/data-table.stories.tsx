import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DownloadIcon,
  EllipsisIcon,
  FilterIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumnDef } from '@/components/ui/data-table';

type Workspace = {
  id: string;
  name: string;
  path: string;
  status: 'Running' | 'Ready' | 'Stopped';
  size: number;
  created: string;
};

const workspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'analytics-prod',
    path: '/home/user/analytics-prod',
    status: 'Running',
    size: 233.4,
    created: '21/05/2026',
  },
  {
    id: 'workspace-2',
    name: 'ml-training',
    path: '/home/user/ml-training',
    status: 'Ready',
    size: 1200,
    created: '18/05/2026',
  },
  {
    id: 'workspace-3',
    name: 'data-lake',
    path: '/home/user/data-lake',
    status: 'Stopped',
    size: 88.9,
    created: '12/05/2026',
  },
  {
    id: 'workspace-4',
    name: 'sandbox-dev',
    path: '/home/user/sandbox-dev',
    status: 'Ready',
    size: 12.4,
    created: '09/05/2026',
  },
  {
    id: 'workspace-5',
    name: 'viz-staging',
    path: '/home/user/viz-staging',
    status: 'Running',
    size: 640.1,
    created: '02/05/2026',
  },
  {
    id: 'workspace-6',
    name: 'research-lab',
    path: '/home/user/research-lab',
    status: 'Ready',
    size: 416.8,
    created: '30/04/2026',
  },
  {
    id: 'workspace-7',
    name: 'forecasting',
    path: '/home/user/forecasting',
    status: 'Stopped',
    size: 95.2,
    created: '27/04/2026',
  },
  {
    id: 'workspace-8',
    name: 'etl-pipeline',
    path: '/home/user/etl-pipeline',
    status: 'Running',
    size: 782.3,
    created: '23/04/2026',
  },
  {
    id: 'workspace-9',
    name: 'geo-analysis',
    path: '/home/user/geo-analysis',
    status: 'Ready',
    size: 330.6,
    created: '19/04/2026',
  },
  {
    id: 'workspace-10',
    name: 'notebook-demo',
    path: '/home/user/notebook-demo',
    status: 'Stopped',
    size: 18.7,
    created: '14/04/2026',
  },
  {
    id: 'workspace-11',
    name: 'feature-store',
    path: '/home/user/feature-store',
    status: 'Running',
    size: 925.5,
    created: '08/04/2026',
  },
  {
    id: 'workspace-12',
    name: 'archive',
    path: '/home/user/archive',
    status: 'Ready',
    size: 2048,
    created: '01/04/2026',
  },
];

const columns: DataTableColumnDef<Workspace>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    filterFn: 'includesString',
    sortFn: 'text',
  },
  {
    accessorKey: 'path',
    header: 'Path',
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) =>
      row.original.size >= 1000
        ? `${(row.original.size / 1000).toFixed(1)} GB`
        : `${row.original.size.toFixed(1)} MB`,
  },
  {
    accessorKey: 'created',
    header: 'Created',
    sortFn: 'text',
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        aria-label={`Open actions for ${row.original.name}`}
        // The offset ring paints a 2px band of `--background` between the
        // button and the ring, which reads as a stray rounded rectangle
        // against the row's `--card` surface. Collapsing the offset keeps the
        // ring flush with the button.
        className="focus-visible:ring-offset-0"
        size="icon-xs"
        variant="ghost"
      >
        <EllipsisIcon />
      </Button>
    ),
  },
];

type DataTableStoryState = 'default' | 'empty' | 'loading' | 'error';

type DataTableStoryArgs = {
  fixture: DataTableStoryState;
  selectable: boolean;
  showColumnVisibility: boolean;
  showFilterAction: boolean;
  showPagination: boolean;
};

function WorkspaceDataTable({
  selectable,
  showColumnVisibility,
  showFilterAction,
  showPagination,
  fixture,
}: DataTableStoryArgs) {
  const data = fixture === 'empty' ? [] : workspaces;

  return (
    <div className="w-[55rem] max-w-[calc(100vw-3rem)]">
      <DataTable
        ariaLabel="Nebari workspaces"
        columns={columns}
        data={data}
        emptyAction={
          <Button>
            <PlusIcon />
            New workspace
          </Button>
        }
        emptyDescription="Create a workspace to start running notebooks and jobs."
        emptyTitle="No workspaces yet"
        error={
          fixture === 'error'
            ? 'There was a problem reaching the server. Check your connection and try again.'
            : undefined
        }
        filterColumnId="name"
        filterLabel="Filter workspaces"
        filterPlaceholder="Filter workspaces…"
        getRowId={(workspace) => workspace.id}
        getRowLabel={(workspace) => workspace.name}
        initialPageSize={5}
        loading={fixture === 'loading'}
        onRetry={() => undefined}
        pageSizeOptions={[5, 10]}
        selectable={selectable}
        selectionActions={() => (
          <>
            <Button variant="destructive">
              <Trash2Icon />
              Delete
            </Button>
            <Button variant="outline">
              <DownloadIcon />
              Export
            </Button>
          </>
        )}
        showColumnVisibility={showColumnVisibility}
        showPagination={showPagination}
        toolbarActions={
          showFilterAction ? (
            <Button variant="outline">
              <FilterIcon />
              Filter
            </Button>
          ) : null
        }
      />
    </div>
  );
}

const meta = {
  title: 'Components/Data Table',
  component: WorkspaceDataTable,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reusable TanStack Table v9 renderer styled to the Nebari Figma specification. It composes the registry Table, Input, Checkbox, Button, Select, and DropdownMenu primitives and includes sorting, filtering, selection, column visibility, pagination, loading, empty, filtered-empty, and error states.',
      },
    },
  },
  args: {
    fixture: 'default',
    selectable: true,
    showColumnVisibility: true,
    showFilterAction: true,
    showPagination: true,
  },
  argTypes: {
    fixture: { table: { disable: true } },
    selectable: {
      description: 'Shows row checkboxes and selection-aware toolbar actions.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showColumnVisibility: {
      description: 'Shows the Columns menu for toggling hideable columns.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showFilterAction: {
      description:
        'Story-only toggle. Adds the Figma Filter action to the toolbar slot.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    showPagination: {
      description: 'Shows row count, page-size selection, and page navigation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
  },
} satisfies Meta<DataTableStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <WorkspaceDataTable {...args} />,
};

export const Empty: Story = {
  args: { fixture: 'empty' },
  parameters: { controls: { include: [] } },
  render: (args) => <WorkspaceDataTable {...args} />,
};

export const Loading: Story = {
  args: { fixture: 'loading' },
  parameters: { controls: { include: [] } },
  render: (args) => <WorkspaceDataTable {...args} />,
};

export const ErrorState: Story = {
  name: 'Error',
  args: { fixture: 'error' },
  parameters: { controls: { include: [] } },
  render: (args) => <WorkspaceDataTable {...args} />,
};
