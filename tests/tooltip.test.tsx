import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function TestTooltip({
  defaultOpen,
  showArrow,
}: {
  defaultOpen?: boolean;
  showArrow?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip defaultOpen={defaultOpen}>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipContent showArrow={showArrow}>Helpful context</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe('Tooltip', () => {
  it('renders open tooltip content with stable data hooks', async () => {
    render(<TestTooltip defaultOpen />);

    const trigger = screen.getByRole('button', { name: 'Help' });
    const tooltip = await screen.findByRole('tooltip');

    expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
    expect(tooltip).toHaveAttribute('data-slot', 'tooltip-content');
    expect(tooltip).toHaveAttribute('id');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveTextContent('Helpful context');
    expect(tooltip).toHaveClass(
      'rounded-sm',
      'bg-foreground',
      'text-background',
      'motion-safe:transition-[opacity,transform]',
    );
    const arrow = document.querySelector('[data-slot="tooltip-arrow"]');

    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveClass('size-2.5', 'rotate-45', 'bg-foreground');
    expect(arrow).not.toHaveClass('rounded-[2px]');
  });

  it('supports hiding the arrow', async () => {
    render(<TestTooltip defaultOpen showArrow={false} />);

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="tooltip-arrow"]'),
    ).not.toBeInTheDocument();
  });

  it('opens from keyboard focus and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<TestTooltip />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Helpful context',
    );

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus();
  });

  it('keeps existing descriptions on the trigger', async () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger aria-describedby="external-description">
            Custom trigger
          </TooltipTrigger>
          <TooltipContent>Custom content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Custom trigger' });
    const tooltip = await screen.findByRole('tooltip');
    const describedBy = trigger.getAttribute('aria-describedby')?.split(' ');

    expect(describedBy).toContain('external-description');
    expect(describedBy).toContain(tooltip.id);
  });

  it('preserves data hooks when the trigger renders another element', async () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<button type="button" />}>
            Custom trigger
          </TooltipTrigger>
          <TooltipContent>Custom content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(
      screen.getByRole('button', { name: 'Custom trigger' }),
    ).toHaveAttribute('data-slot', 'tooltip-trigger');
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Custom content',
    );
  });

  it('forwards positioning props to the popup', async () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Positioned</TooltipTrigger>
          <TooltipContent align="start" side="right" sideOffset={12}>
            Positioned content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-side', 'right');
    expect(tooltip).toHaveAttribute('data-align', 'start');
  });

  it('does not disable hoverable tooltip content by default', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hoverable</TooltipTrigger>
          <TooltipContent>Hoverable content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const user = userEvent.setup();

    await user.hover(screen.getByRole('button', { name: 'Hoverable' }));
    const tooltip = await screen.findByRole('tooltip');

    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(
      document.querySelectorAll('[data-slot="tooltip-content"]'),
    ).toHaveLength(1);

    await user.hover(tooltip);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Hoverable content');
  });
});
