import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  avatarGroupCountVariants,
  avatarVariants,
} from '@/ui/avatar';

describe('Avatar', () => {
  it('renders the root and fallback slots with stable data hooks', () => {
    render(
      <Avatar size="lg">
        <AvatarImage alt="Ada Lovelace" src="/ada.png" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );

    const avatar = screen.getByText('AL').closest('[data-slot="avatar"]');

    expect(avatar).toHaveAttribute('data-slot', 'avatar');
    expect(avatar).toHaveAttribute('data-size', 'lg');
    expect(avatar).toHaveClass('size-10', 'rounded-full', 'border-border');
    expect(screen.getByText('AL')).toHaveAttribute(
      'data-slot',
      'avatar-fallback',
    );
  });

  it('renders initials fallback when no image is provided', () => {
    render(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('AL')).toHaveAttribute(
      'data-slot',
      'avatar-fallback',
    );
    expect(screen.getByText('AL')).toHaveClass(
      'bg-muted',
      'text-muted-foreground-strong',
      'place-items-center',
      'leading-none',
    );
  });

  it('exposes all avatar size variants', () => {
    expect(avatarVariants({ size: 'xs' })).toContain('size-5 text-xs');
    expect(avatarVariants({ size: 'sm' })).toContain('size-6 text-sm');
    expect(avatarVariants({ size: 'default' })).toContain('size-8 text-base');
    expect(avatarVariants({ size: 'lg' })).toContain('size-10 text-lg');
    expect(avatarVariants({ size: 'xl' })).toContain('size-12 text-xl');
  });

  it('renders avatar groups and count items', () => {
    render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>,
    );

    const group = screen.getByRole('list', { name: 'Collaborators' });
    const count = screen.getByText('+2');

    expect(group).toHaveClass('-space-x-2');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(count).toHaveAttribute('data-slot', 'avatar-group-count');
    expect(count).toHaveAttribute('data-variant', 'count');
    expect(count).toHaveAccessibleName('2 additional collaborators');
  });

  it('supports an interactive plus button in an avatar group', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AvatarGroupCount
        aria-label="Add teammate"
        onClick={onClick}
        render={<button type="button" />}
        variant="button"
      >
        +
      </AvatarGroupCount>,
    );

    const button = screen.getByRole('button', { name: 'Add teammate' });

    expect(button).toHaveAttribute('data-slot', 'avatar-group-count');
    expect(button).toHaveAttribute('data-variant', 'button');
    expect(button).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
    );

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('exposes group count variants', () => {
    expect(avatarGroupCountVariants({ variant: 'count' })).toContain(
      'bg-muted',
    );
    expect(avatarGroupCountVariants({ variant: 'button' })).toContain(
      'hover:bg-accent',
    );
    expect(
      avatarGroupCountVariants({ size: 'default', variant: 'count' }),
    ).toContain('text-muted-foreground-strong');
  });
});
