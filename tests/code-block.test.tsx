import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockCopyButton,
  CodeBlockHeader,
  codeBlockCopyButtonVariants,
} from '@/ui/code-block';

const snippet = 'const answer = 42;\n\nconsole.log(answer);';

/** Install a controllable clipboard mock; jsdom ships none by default. */
function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
}

describe('CodeBlock', () => {
  beforeEach(() => {
    mockClipboard(vi.fn().mockResolvedValue(undefined));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the root and body with their slot attributes and the snippet text', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const root = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('font-mono', 'bg-card', 'text-foreground');

    const body = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block-body]');
    expect(body).toBeInTheDocument();
    expect(body).toHaveTextContent('console.log(answer);');
  });

  it('forces the dark palette via the dark class when the dark prop is set', () => {
    render(
      <CodeBlock code={snippet} dark>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const root = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block]');
    expect(root).toHaveClass('dark');
    expect(root).toHaveAttribute('data-dark', 'true');
  });

  it('does not apply the dark class by default', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const root = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block]');
    expect(root).not.toHaveClass('dark');
    expect(root).not.toHaveAttribute('data-dark');
  });

  it('keeps long lines unwrapped and scrolls the body horizontally', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const line = screen.getByText(/const answer = 42;/);
    // `whitespace-pre` prevents soft-wrapping; the body's `overflow-x-auto`
    // provides the sideways scroll. jsdom has no layout engine, so actual
    // scrolling is verified visually in the Horizontal scroll story.
    expect(line).toHaveClass('whitespace-pre');
    const body = line.closest('[data-slot=code-block-body]');
    expect(body).toHaveClass('overflow-x-auto');
    // The scroll container must be reachable by keyboard to be scrollable.
    expect(body).toHaveAttribute('tabindex', '0');
    expect(body).toBe(screen.getByRole('region', { name: 'Code' }));
  });

  it('gives the root a minimum width floor', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const root = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block]');
    expect(root).toHaveClass('min-w-40');
  });

  it('caps the body height in whole lines when maxLines is set', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody maxLines={2} />
      </CodeBlock>,
    );

    const body = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block-body]') as HTMLElement;
    expect(body).toHaveAttribute('data-max-lines', '2');
    expect(body).toHaveClass('overflow-y-auto');
    // The line count feeds the `lh`-based max-height calc as a custom property.
    expect(body.style.getPropertyValue('--code-block-max-lines')).toBe('2');
  });

  it('does not cap the body height by default', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const body = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block-body]') as HTMLElement;
    expect(body).not.toHaveAttribute('data-max-lines');
    expect(body).not.toHaveClass('overflow-y-auto');
    expect(body.style.getPropertyValue('--code-block-max-lines')).toBe('');
  });

  it('renders the header slot', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockHeader>script.ts</CodeBlockHeader>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const header = screen.getByText('script.ts');
    expect(header).toHaveAttribute('data-slot', 'code-block-header');
  });

  it('puts the copy button in the header instead of floating it', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockHeader>script.ts</CodeBlockHeader>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const header = screen.getByText('script.ts');
    const button = screen.getByRole('button', { name: 'Copy code' });
    expect(header).toContainElement(button);
    // A header bar is the copy button's home, so the root does not also float
    // one over the body — that is what produced two buttons.
    expect(button).not.toHaveAttribute('data-floating');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('finds a header nested in a fragment', () => {
    render(
      <CodeBlock code={snippet}>
        {/* biome-ignore lint/complexity/noUselessFragments: the fragment is the case under test */}
        <>
          <CodeBlockHeader>script.ts</CodeBlockHeader>
          <CodeBlockBody />
        </>
      </CodeBlock>,
    );

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).not.toHaveAttribute('data-floating');
  });

  it('omits the header copy button when showCopyButton is false', () => {
    render(
      <CodeBlock code={snippet} showCopyButton={false}>
        <CodeBlockHeader>script.ts</CodeBlockHeader>
        <CodeBlockBody />
      </CodeBlock>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders an aria-hidden, non-selectable line-number gutter when showLineNumbers is set', () => {
    render(
      <CodeBlock code={snippet} showLineNumbers>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const body = screen
      .getByText('const answer = 42;')
      .closest('[data-slot=code-block-body]') as HTMLElement;
    const gutter = within(body).getByText('1');
    expect(gutter).toHaveAttribute('aria-hidden', 'true');
    expect(gutter).toHaveClass('select-none');
    // Three source lines (including the blank middle line) → three gutter cells.
    expect(within(body).getByText('3')).toBeInTheDocument();
  });

  it('renders all gutter cells in a single shared grid so the column stays aligned past 9 lines', () => {
    // A per-line grid sizes its gutter column independently, so the code column
    // shifts when the count crosses 9→10. One grid for the whole snippet keeps
    // the `auto` gutter column uniform.
    const tenLines = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join(
      '\n',
    );
    render(
      <CodeBlock code={tenLines} showLineNumbers>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const one = screen.getByText('1');
    const ten = screen.getByText('10');
    const grid = one.closest('code');
    expect(grid).toHaveClass('grid', 'grid-cols-[auto_1fr]');
    // Both gutter numbers live in the same grid, so they share one column.
    expect(ten.closest('code')).toBe(grid);
  });

  it('does not render line numbers by default', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const body = screen
      .getByText(/const answer = 42;/)
      .closest('[data-slot=code-block-body]') as HTMLElement;
    expect(within(body).queryByText('1')).not.toBeInTheDocument();
  });

  it('copies the snippet and confirms with a check icon', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    render(
      <CodeBlock code={snippet}>
        <CodeBlockHeader>script.ts</CodeBlockHeader>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });
    expect(button).toHaveAttribute('data-slot', 'code-block-copy-button');
    expect(button).not.toHaveAttribute('data-copied');

    await userEvent.click(button);

    expect(writeText).toHaveBeenCalledWith(snippet);
    const confirmed = screen.getByRole('button', { name: 'Copied' });
    expect(confirmed).toHaveAttribute('data-copied', 'true');
  });

  it('stays in the resting state when the clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    mockClipboard(writeText);

    // `showCopyButton={false}` plus a hand-placed button is the escape hatch for
    // custom placement — the block renders none of its own.
    render(
      <CodeBlock code={snippet} showCopyButton={false}>
        <CodeBlockCopyButton />
      </CodeBlock>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    const button = screen.getByRole('button', { name: 'Copy code' });
    expect(button).not.toHaveAttribute('data-copied');
  });

  it('reflects the copy-button size as a data attribute and exposes its variants', () => {
    render(
      <CodeBlock code={snippet} showCopyButton={false}>
        <CodeBlockCopyButton size="sm" />
      </CodeBlock>,
    );

    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveAttribute(
      'data-size',
      'sm',
    );
    expect(codeBlockCopyButtonVariants({ size: 'sm' })).toContain('size-6');
  });

  it('renders a floating copy button from the root by default', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });
    expect(button).toHaveAttribute('data-floating', 'true');
    expect(button).toHaveClass('absolute');
  });

  it('omits the floating copy button when showCopyButton is false', () => {
    render(
      <CodeBlock code={snippet} showCopyButton={false}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('exposes the floating variant on the copy button', () => {
    expect(codeBlockCopyButtonVariants({ floating: true })).toContain(
      'absolute',
    );
  });

  it('gives the floating copy button an opaque background so overflowing code stays behind it', () => {
    // A long line scrolls horizontally *behind* the floating button; without an
    // opaque fill the icon would mix with the moving code and be hard to see.
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveClass(
      'bg-card',
    );
    expect(codeBlockCopyButtonVariants({ floating: true })).toContain(
      'bg-card',
    );
  });

  it('reserves right-edge clearance in the body for the floating copy button', () => {
    // With a floating button over a header-less block, the code must not slide
    // under it on a narrow screen; the body reserves right padding to prevent
    // the overlap.
    render(
      <CodeBlock code={snippet}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    expect(screen.getByText(/const answer = 42;/)).toHaveClass('pr-12');
  });

  it('reserves clearance on the numbered code grid too', () => {
    render(
      <CodeBlock code={snippet} showLineNumbers>
        <CodeBlockBody />
      </CodeBlock>,
    );

    expect(screen.getByText('const answer = 42;').closest('code')).toHaveClass(
      'pr-12',
    );
  });

  it('does not reserve copy-button clearance when there is no floating button', () => {
    render(
      <CodeBlock code={snippet} showCopyButton={false}>
        <CodeBlockBody />
      </CodeBlock>,
    );

    expect(screen.getByText(/const answer = 42;/)).not.toHaveClass('pr-12');
  });

  it('throws when a slot is used outside CodeBlock', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CodeBlockBody />)).toThrow(
      /must be used within a <CodeBlock>/,
    );
    expect(() => render(<CodeBlockHeader />)).toThrow(
      /must be used within a <CodeBlock>/,
    );
    spy.mockRestore();
  });
});
