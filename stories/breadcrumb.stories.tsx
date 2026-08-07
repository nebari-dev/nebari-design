import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from '@storybook/addon-docs/blocks';
import type { Meta, StoryContext, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

type BreadcrumbCollapsedVariant = 'ellipsis' | 'dropdown';
type BreadcrumbPreviewVariant = 'default' | BreadcrumbCollapsedVariant;
type BreadcrumbStoryArgs = ComponentProps<typeof Breadcrumb> & {
  variant: BreadcrumbPreviewVariant;
};

const defaultBreadcrumbSource = `<Breadcrumb>
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
</Breadcrumb>`;

const ellipsisBreadcrumbSource = `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbDropdown>
        <BreadcrumbEllipsis />
        <BreadcrumbDropdownContent align="start">
          <BreadcrumbDropdownItem render={<a href="/design-system" />}>
            Design system
          </BreadcrumbDropdownItem>
          <BreadcrumbDropdownItem
            render={<a href="/design-system/components" />}
          >
            Components
          </BreadcrumbDropdownItem>
        </BreadcrumbDropdownContent>
      </BreadcrumbDropdown>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`;

const dropdownBreadcrumbSource = `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbDropdown>
        <BreadcrumbDropdownTrigger>Breadcrumb</BreadcrumbDropdownTrigger>
        <BreadcrumbDropdownContent>
          <BreadcrumbDropdownItem render={<a href="/" />}>
            Home
          </BreadcrumbDropdownItem>
          <BreadcrumbDropdownItem render={<a href="/design-system" />}>
            Design system
          </BreadcrumbDropdownItem>
          <BreadcrumbDropdownItem
            render={<a href="/design-system/components" />}
          >
            Components
          </BreadcrumbDropdownItem>
        </BreadcrumbDropdownContent>
      </BreadcrumbDropdown>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`;

function getBreadcrumbSource(variant: unknown) {
  if (variant === 'ellipsis') {
    return ellipsisBreadcrumbSource;
  }

  if (variant === 'dropdown') {
    return dropdownBreadcrumbSource;
  }

  return defaultBreadcrumbSource;
}

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Breadcrumb displays the path to the current resource using a hierarchy of links. BreadcrumbList stays on one line by default; choose an ellipsis-triggered or current-route dropdown composition when the full trail should be collapsed.',
      },
      page: () => (
        <>
          <Title />
          <Description />
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
  args: {
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: {
        type: 'select',
        labels: {
          default: 'Default',
          ellipsis: 'Ellipsis',
          dropdown: 'Dropdown',
        },
      },
      description:
        'Optionally previews the default breadcrumbs or a collapsed ellipsis or dropdown composition.',
      options: ['default', 'ellipsis', 'dropdown'],
      table: { defaultValue: { summary: 'default' } },
    },
    children: {
      description:
        'Composed content — a `BreadcrumbList` of `BreadcrumbItem`s separated by `BreadcrumbSeparator`, ending in a `BreadcrumbPage` for the current route.',
      control: false,
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<BreadcrumbStoryArgs>;

export default meta;

type Story = StoryObj<BreadcrumbStoryArgs>;

function DefaultBreadcrumb() {
  return (
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
  );
}

function CollapsedBreadcrumb({
  variant,
}: {
  variant: BreadcrumbCollapsedVariant;
}) {
  return variant === 'dropdown' ? (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbDropdown>
            <BreadcrumbDropdownTrigger>Breadcrumb</BreadcrumbDropdownTrigger>
            <BreadcrumbDropdownContent>
              <BreadcrumbDropdownItem render={<a href="/" />}>
                Home
              </BreadcrumbDropdownItem>
              <BreadcrumbDropdownItem render={<a href="/design-system" />}>
                Design system
              </BreadcrumbDropdownItem>
              <BreadcrumbDropdownItem
                render={<a href="/design-system/components" />}
              >
                Components
              </BreadcrumbDropdownItem>
            </BreadcrumbDropdownContent>
          </BreadcrumbDropdown>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ) : (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbDropdown>
            <BreadcrumbEllipsis />
            <BreadcrumbDropdownContent align="start">
              <BreadcrumbDropdownItem render={<a href="/design-system" />}>
                Design system
              </BreadcrumbDropdownItem>
              <BreadcrumbDropdownItem
                render={<a href="/design-system/components" />}
              >
                Components
              </BreadcrumbDropdownItem>
            </BreadcrumbDropdownContent>
          </BreadcrumbDropdown>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

async function verifyCollapsedMenu(
  canvasElement: HTMLElement,
  triggerName: string,
) {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);

  await userEvent.click(canvas.getByRole('button', { name: triggerName }));
  const hiddenAncestor = await page.findByRole('menuitem', {
    name: 'Design system',
  });
  await waitFor(() => expect(hiddenAncestor).toBeVisible());
  await expect(hiddenAncestor).toHaveAttribute('href', '/design-system');

  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(hiddenAncestor).not.toBeInTheDocument());
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default breadcrumb trail. Use the optional control to preview either collapsed composition.',
      },
      source: {
        language: 'tsx',
        transform: (
          _source: string,
          context: StoryContext<BreadcrumbStoryArgs>,
        ) => getBreadcrumbSource(context.args.variant),
      },
    },
  },
  render: ({ variant }) => {
    const selectedVariant = variant ?? 'default';

    return selectedVariant === 'default' ? (
      <DefaultBreadcrumb />
    ) : (
      <CollapsedBreadcrumb variant={selectedVariant} />
    );
  },
};

export const Ellipsis: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'An ellipsis trigger reveals the omitted middle segments without replacing the visible first and current breadcrumbs.',
      },
      source: {
        code: ellipsisBreadcrumbSource,
        language: 'tsx',
      },
    },
  },
  render: (_args) => <CollapsedBreadcrumb variant="ellipsis" />,
  play: async ({ canvasElement }) => {
    await verifyCollapsedMenu(canvasElement, 'Show more breadcrumbs');
  },
};

export const Dropdown: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'A current-route dropdown moves the complete ancestor trail into a menu when horizontal space is limited.',
      },
      source: {
        code: dropdownBreadcrumbSource,
        language: 'tsx',
      },
    },
  },
  render: (_args) => <CollapsedBreadcrumb variant="dropdown" />,
  play: async ({ canvasElement }) => {
    await verifyCollapsedMenu(canvasElement, 'Breadcrumb');
  },
};

export const RenderAsLink: Story = {
  name: 'Render as link',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Use Base UI render-prop composition to swap BreadcrumbLink to the link element from a routing library.',
      },
    },
  },
  render: (_args) => (
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
