import { Avatar as AvatarPrimitive } from '@base-ui-components/react/avatar';
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'group/avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-medium text-muted-foreground-strong uppercase select-none',
  {
    variants: {
      size: {
        xs: 'size-5 text-xs leading-none',
        sm: 'size-6 text-sm leading-none',
        default: 'size-8 text-base leading-none',
        lg: 'size-10 text-lg leading-none',
        xl: 'size-12 text-xl leading-none',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const avatarGroupCountVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full border border-border font-medium uppercase ring-2 ring-background [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        count: 'bg-muted text-muted-foreground-strong',
        button:
          'bg-background text-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] motion-safe:active:scale-[0.97]',
      },
      size: {
        xs: 'size-5 text-xs leading-none [&_svg:not([class*="size-"])]:size-3',
        sm: 'size-6 text-sm leading-none [&_svg:not([class*="size-"])]:size-3',
        default:
          'size-8 text-base leading-none [&_svg:not([class*="size-"])]:size-3.5',
        lg: 'size-10 text-lg leading-none [&_svg:not([class*="size-"])]:size-4',
        xl: 'size-12 text-xl leading-none [&_svg:not([class*="size-"])]:size-5',
      },
    },
    defaultVariants: {
      variant: 'count',
      size: 'default',
    },
  },
);

type AvatarProps = AvatarPrimitive.Root.Props &
  VariantProps<typeof avatarVariants>;

type AvatarImageProps = AvatarPrimitive.Image.Props;

type AvatarFallbackProps = AvatarPrimitive.Fallback.Props;

type AvatarGroupProps = React.ComponentProps<'ul'>;

type AvatarGroupCountProps = useRender.ComponentProps<'span'> &
  VariantProps<typeof avatarGroupCountVariants>;

/**
 * Avatar displays a user image with an initials fallback. Base UI owns image
 * loading state so {@link AvatarFallback} appears when the image is missing or
 * fails to load.
 */
function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size ?? 'default'}
      className={(state) =>
        cn(
          avatarVariants({ size }),
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

/** Image rendered inside an {@link Avatar}. */
function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={(state) =>
        cn(
          'aspect-square size-full rounded-full object-cover',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

/** Initials or fallback content shown when the avatar image is unavailable. */
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={(state) =>
        cn(
          'grid size-full place-items-center rounded-full bg-muted text-muted-foreground-strong leading-none',
          typeof className === 'function' ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

/** Overlapped, collectively labelled group of avatars. */
function AvatarGroup({
  'aria-label': ariaLabel = 'Collaborators',
  className,
  children,
  ...props
}: AvatarGroupProps) {
  return (
    <ul
      aria-label={ariaLabel}
      data-slot="avatar-group"
      className={cn(
        'm-0 flex list-none items-center -space-x-2 p-0 *:inline-flex [&_[data-slot=avatar-group-count]]:ring-2 [&_[data-slot=avatar-group-count]]:ring-background [&_[data-slot=avatar-group-count]]:focus-visible:ring-ring [&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-background',
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <li>{child}</li>
      ))}
    </ul>
  );
}

/**
 * Count or add button used at the end of an {@link AvatarGroup}. Use
 * `variant="button"` with `render={<button />}` for an interactive plus item.
 */
function AvatarGroupCount({
  'aria-label': ariaLabel,
  className,
  children,
  size,
  variant,
  ref,
  render = <span />,
  ...props
}: AvatarGroupCountProps) {
  const additionalCount =
    variant !== 'button' && typeof children === 'string'
      ? children.match(/^\+(\d+)$/)?.[1]
      : undefined;

  return useRender({
    render,
    ref,
    props: {
      'data-slot': 'avatar-group-count',
      'data-size': size ?? 'default',
      'data-variant': variant ?? 'count',
      'aria-label':
        ariaLabel ??
        (additionalCount
          ? `${additionalCount} additional collaborators`
          : undefined),
      className: cn(avatarGroupCountVariants({ size, variant }), className),
      children,
      ...props,
    },
  });
}

export type {
  AvatarFallbackProps,
  AvatarGroupCountProps,
  AvatarGroupProps,
  AvatarImageProps,
  AvatarProps,
};
export {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  avatarGroupCountVariants,
  avatarVariants,
};
