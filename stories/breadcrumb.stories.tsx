import {
  Description,
  Primary,
  Stories,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
} from '@/ui/breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    controls: { disable: true },
    layout: 'centered',
    docs: {
      description: {
        component:
          'Breadcrumb displays the path to the current resource using a hierarchy of links. Compose a full trail with BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, and BreadcrumbSeparator; use BreadcrumbDropdown when only the current route fits and previous breadcrumbs need to move into a menu.',
      },
      page: () => (
        <>
          <Title />
          <Description />
          <Primary />
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'A basic hierarchy with two navigable ancestors and the current page.',
      },
    },
  },
  render: () => (
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
    </Breadcrumb>
  ),
};

export const Collapsed: Story = {
  name: 'Collapsed',
  parameters: {
    docs: {
      description: {
        story:
          'BreadcrumbEllipsis represents omitted middle segments in long paths.',
      },
    },
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
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
    </Breadcrumb>
  ),
};

export const Dropdown: Story = {
  name: 'Dropdown',
  parameters: {
    docs: {
      description: {
        story:
          'When the full trail cannot fit, show the current route as a dropdown trigger and move previous breadcrumb links into the menu.',
      },
    },
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbDropdown>
            <BreadcrumbDropdownTrigger>Breadcrumb</BreadcrumbDropdownTrigger>
            <BreadcrumbDropdownContent>
              <BreadcrumbDropdownItem render={<a href="/" />}>
                Home
              </BreadcrumbDropdownItem>
              <BreadcrumbDropdownItem render={<a href="/components" />}>
                Components
              </BreadcrumbDropdownItem>
              <BreadcrumbDropdownItem render={<a href="/components/base" />}>
                Base
              </BreadcrumbDropdownItem>
            </BreadcrumbDropdownContent>
          </BreadcrumbDropdown>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const RenderAsLink: Story = {
  name: 'Render as link',
  parameters: {
    docs: {
      description: {
        story:
          'Use Base UI render-prop composition to swap BreadcrumbLink to the link element from a routing library.',
      },
    },
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="/" data-router-link="" />}>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="/components" data-router-link="" />}>
            Components
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const LongTrail: Story = {
  name: 'Long trail',
  parameters: {
    docs: {
      description: {
        story:
          'The list wraps instead of overflowing when a breadcrumb contains long labels.',
      },
    },
  },
  render: () => (
    <div className="w-[min(calc(100vw-3rem),28rem)]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/environments">Environments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/environments/nebari-production-cluster">
              nebari-production-cluster
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Jupyter server settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};
