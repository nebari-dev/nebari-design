import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from '@/ui/button-group';

describe('ButtonGroup', () => {
  it('renders a labeled horizontal group by default', () => {
    render(
      <ButtonGroup aria-label="Document actions">
        <Button variant="outline">Save</Button>
        <Button variant="outline">Publish</Button>
      </ButtonGroup>,
    );

    const group = screen.getByRole('group', { name: 'Document actions' });
    expect(group).toHaveAttribute('data-slot', 'button-group');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group).toHaveClass('flex-row');
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('applies the vertical orientation', () => {
    render(
      <ButtonGroup aria-label="Zoom controls" orientation="vertical">
        <Button variant="outline">Zoom in</Button>
        <Button variant="outline">Zoom out</Button>
      </ButtonGroup>,
    );

    const group = screen.getByRole('group', { name: 'Zoom controls' });
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveClass('flex-col');
  });

  it('keeps every grouped button keyboard-focusable and activatable', async () => {
    const onRun = vi.fn();
    const onCancel = vi.fn();
    render(
      <ButtonGroup aria-label="Actions">
        <Button onClick={onRun}>Run</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </ButtonGroup>,
    );

    const user = userEvent.setup();
    const run = screen.getByRole('button', { name: 'Run' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });

    await user.tab();
    expect(run).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRun).toHaveBeenCalledOnce();

    await user.tab();
    expect(cancel).toHaveFocus();
    await user.keyboard(' ');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('merges a caller className after the group variants', () => {
    render(<ButtonGroup aria-label="Custom group" className="w-full" />);

    expect(screen.getByRole('group', { name: 'Custom group' })).toHaveClass(
      'w-full',
    );
  });

  it('renders supporting text and composes through the render prop', () => {
    render(
      <ButtonGroup aria-label="Branch information">
        <ButtonGroupText render={<span />}>Branch</ButtonGroupText>
        <Button variant="outline">main</Button>
      </ButtonGroup>,
    );

    const text = screen.getByText('Branch');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveAttribute('data-slot', 'button-group-text');
  });

  it('renders vertical and horizontal semantic separators', () => {
    const { rerender } = render(<ButtonGroupSeparator />);

    let separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('data-slot', 'button-group-separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveClass('w-px');

    rerender(<ButtonGroupSeparator orientation="horizontal" />);
    separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveClass('h-px');
  });

  it('exposes buttonGroupVariants for external composition', () => {
    const horizontalClasses = buttonGroupVariants({
      orientation: 'horizontal',
    });
    expect(horizontalClasses).toContain('-ml-px');
    expect(horizontalClasses).toContain(':not(:has(~[data-slot]))');
    expect(horizontalClasses).toContain('*:focus-visible:z-10');
    expect(buttonGroupVariants({ orientation: 'vertical' })).toContain(
      '-mt-px',
    );
  });
});
