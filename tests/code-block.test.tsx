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
        <CodeBlockHeader>
          <CodeBlockCopyButton />
        </CodeBlockHeader>
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

    render(
      <CodeBlock code={snippet}>
        <CodeBlockCopyButton />
      </CodeBlock>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    const button = screen.getByRole('button', { name: 'Copy code' });
    expect(button).not.toHaveAttribute('data-copied');
  });

  it('reflects the copy-button size as a data attribute and exposes its variants', () => {
    render(
      <CodeBlock code={snippet}>
        <CodeBlockCopyButton size="sm" />
      </CodeBlock>,
    );

    expect(screen.getByRole('button', { name: 'Copy code' })).toHaveAttribute(
      'data-size',
      'sm',
    );
    expect(codeBlockCopyButtonVariants({ size: 'sm' })).toContain('size-6');
  });

  it('throws when a slot is used outside CodeBlock', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CodeBlockBody />)).toThrow(
      /must be used within a <CodeBlock>/,
    );
    spy.mockRestore();
  });
});
