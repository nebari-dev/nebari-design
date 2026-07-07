import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyIcon, Trash2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/ui/button';
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

const environments = [
  {
    name: 'Data Science',
    status: 'Running',
    owner: 'Ada Lovelace',
    resources: '4 CPUs / 16 GB',
  },
  {
    name: 'Geospatial Analysis',
    status: 'Stopped',
    owner: 'Grace Hopper',
    resources: '2 CPUs / 8 GB',
  },
  {
    name: 'Model Training',
    status: 'Starting',
    owner: 'Katherine Johnson',
    resources: '8 CPUs / 32 GB',
  },
];

type TableStoryArgs = {
  caption: string;
  empty: boolean;
  showActions: boolean;
  showFooter: boolean;
};

const tableStoryDefaults = {
  caption: '',
  empty: false,
  showActions: false,
  showFooter: false,
} satisfies TableStoryArgs;

function TableFrame({ children }: { children: ReactNode }) {
  return <div className="w-[44rem] max-w-[calc(100vw-3rem)]">{children}</div>;
}

function EnvironmentHeader({ actions = false }: { actions?: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]" scope="col">
          Environment
        </TableHead>
        <TableHead scope="col">Status</TableHead>
        <TableHead scope="col">Owner</TableHead>
        <TableHead className="text-right" scope="col">
          Resources
        </TableHead>
        {actions ? (
          <TableHead className="w-[104px] text-right" scope="col">
            Actions
          </TableHead>
        ) : null}
      </TableRow>
    </TableHeader>
  );
}

function EnvironmentRows({ actions = false }: { actions?: boolean }) {
  return (
    <TableBody>
      {environments.map((environment) => (
        <TableRow key={environment.name}>
          <TableCell className="font-medium">{environment.name}</TableCell>
          <TableCell>{environment.status}</TableCell>
          <TableCell>{environment.owner}</TableCell>
          <TableCell className="text-right">{environment.resources}</TableCell>
          {actions ? (
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Button
                  aria-label={`Copy ${environment.name}`}
                  size="icon-sm"
                  variant="ghost"
                >
                  <CopyIcon className="size-4" />
                </Button>
                <Button
                  aria-label={`Delete ${environment.name}`}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </TableCell>
          ) : null}
        </TableRow>
      ))}
    </TableBody>
  );
}

function EnvironmentTable({
  caption,
  empty,
  showActions,
  showFooter,
}: TableStoryArgs) {
  const columnCount = showActions ? 5 : 4;

  return (
    <Table aria-label="Nebari environments">
      {caption === '' ? null : <TableCaption>{caption}</TableCaption>}
      <EnvironmentHeader actions={showActions} />
      {empty ? (
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell
              className="h-24 text-center text-muted-foreground"
              colSpan={columnCount}
            >
              No environments found.
            </TableCell>
          </TableRow>
        </TableBody>
      ) : (
        <EnvironmentRows actions={showActions} />
      )}
      {showFooter && !empty ? (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total allocated</TableCell>
            <TableCell className="text-right">14 CPUs / 56 GB</TableCell>
            {showActions ? <TableCell /> : null}
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  );
}

const meta = {
  title: 'Components/Table',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A responsive table primitive for semantic tabular data with captions, headers, rows, and optional footers.',
      },
    },
  },
  args: tableStoryDefaults,
  argTypes: {
    caption: {
      control: 'text',
      description:
        'Optional visible `TableCaption` text. Leave empty to omit the caption.',
    },
    empty: {
      control: 'boolean',
      description: 'Shows the table empty state instead of data rows.',
    },
    showActions: {
      control: 'boolean',
      description: 'Adds a copy/delete action column.',
    },
    showFooter: {
      control: 'boolean',
      description: 'Adds a summary footer row.',
    },
  },
} satisfies Meta<TableStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <TableFrame>
      <EnvironmentTable {...tableStoryDefaults} {...args} />
    </TableFrame>
  ),
};

export const WithFooter: Story = {
  name: 'With footer',
  args: {
    showFooter: true,
  },
  render: (args) => (
    <TableFrame>
      <EnvironmentTable {...tableStoryDefaults} {...args} />
    </TableFrame>
  ),
};

export const Actions: Story = {
  args: {
    showActions: true,
  },
  render: (args) => (
    <TableFrame>
      <EnvironmentTable {...tableStoryDefaults} {...args} />
    </TableFrame>
  ),
};

export const EmptyState: Story = {
  name: 'Empty state',
  args: {
    empty: true,
  },
  render: (args) => (
    <TableFrame>
      <EnvironmentTable {...tableStoryDefaults} {...args} />
    </TableFrame>
  ),
};
