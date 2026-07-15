import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/ui/avatar';

const avatarImage = svgAvatarImage();

type AvatarPreviewProps = ComponentProps<typeof Avatar> & {
  /** Accessible name for the image when `imageUrl` is provided. */
  alt: string;
  /** Initials shown when no image URL is provided or the image cannot load. */
  fallback: string;
  /** Optional image URL to preview an image avatar. */
  imageUrl?: string;
};

function svgAvatarImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#eeeeef"/><circle cx="48" cy="36" r="18" fill="#b7b7bb"/><path d="M18 96c4-22 16-34 30-34s26 12 30 34H18Z" fill="#b7b7bb"/><path d="M30 78c5-7 11-10 18-10s13 3 18 10" fill="none" stroke="#9d9da6" stroke-width="4" stroke-linecap="round"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function AvatarPreview({
  alt,
  fallback,
  imageUrl,
  ...props
}: AvatarPreviewProps) {
  return (
    <Avatar {...props}>
      {imageUrl ? <AvatarImage alt={alt} src={imageUrl} /> : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

const meta = {
  title: 'Components/Avatar',
  component: AvatarPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Avatar displays a user image with initials fallback, size options, group stacking, and count or add-button group items.',
      },
    },
  },
  args: {
    alt: 'Ada Lovelace',
    fallback: 'AL',
    imageUrl: '',
    size: 'default',
  },
  argTypes: {
    alt: {
      control: 'text',
      description: 'Accessible image text used when `imageUrl` is provided.',
    },
    fallback: {
      control: 'text',
      description: 'Initials shown when the avatar has no loaded image.',
    },
    imageUrl: {
      control: 'text',
      description:
        'Optional image URL. Leave empty to preview the gray initials fallback.',
    },
    size: {
      control: 'select',
      description: 'Controls the avatar diameter and fallback text size.',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
      table: { defaultValue: { summary: 'default' } },
    },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof AvatarPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'The default avatar shows the gray initials fallback. Paste an image URL into the control to preview an image avatar.',
      },
    },
  },
};

export const Image: Story = {
  name: 'Image',
  args: {
    imageUrl: avatarImage,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Image avatars render `AvatarImage` with the same initials fallback for loading and error states.',
      },
    },
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  parameters: {
    docs: {
      description: {
        story: 'All avatar sizes, from `xs` through `xl`.',
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4">
      {(['xs', 'sm', 'default', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const PlusButton: Story = {
  name: 'Plus button',
  parameters: {
    docs: {
      description: {
        story:
          'Use `AvatarGroupCount` with `variant="button"` and `render={<button />}` for an interactive add item.',
      },
    },
  },
  render: () => (
    <AvatarGroupCount
      aria-label="Add teammate"
      render={<button type="button" />}
      variant="button"
    >
      <PlusIcon aria-hidden="true" />
    </AvatarGroupCount>
  ),
};

export const GroupCount: Story = {
  name: 'Group count',
  parameters: {
    docs: {
      description: {
        story: 'An avatar group ending with the number of additional people.',
      },
    },
  },
  render: () => (
    <AvatarGroup aria-label="6 collaborators">
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>KJ</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const GroupWithIcon: Story = {
  name: 'Group with icon',
  parameters: {
    docs: {
      description: {
        story: 'An avatar group ending with an interactive add button.',
      },
    },
  },
  render: () => (
    <AvatarGroup aria-label="3 collaborators">
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>KJ</AvatarFallback>
      </Avatar>
      <AvatarGroupCount
        aria-label="Add teammate"
        render={<button type="button" />}
        variant="button"
      >
        <PlusIcon aria-hidden="true" />
      </AvatarGroupCount>
    </AvatarGroup>
  ),
};
