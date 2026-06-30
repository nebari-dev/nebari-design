import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, CopyIcon } from 'lucide-react';
import type * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockContextValue {
  /** The raw snippet, shared so descendants don't re-thread the text. */
  code: string;
  /** Whether the body renders a line-number gutter. */
  showLineNumbers: boolean;
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

function useCodeBlockContext(component: string): CodeBlockContextValue {
  const context = useContext(CodeBlockContext);
  if (!context) {
    throw new Error(`<${component}> must be used within a <CodeBlock>.`);
  }
  return context;
}

type CodeBlockProps = React.ComponentProps<'div'> & {
  /** Snippet rendered by {@link CodeBlockBody} and copied by the copy button. */
  code: string;
  /** Render a non-selectable, aria-hidden line-number gutter in the body. */
  showLineNumbers?: boolean;
  /**
   * Force the dark palette for this block regardless of the surrounding theme.
   * Applies the theme's `.dark` class to the root so its semantic tokens
   * (`bg-card`, `text-foreground`, …) resolve against the dark collection.
   */
  dark?: boolean;
};

/**
 * CodeBlock frames a formatted, monospaced snippet. It shares the snippet with
 * its descendants via context, so {@link CodeBlockBody} and
 * {@link CodeBlockCopyButton} read the text without it being re-threaded.
 * Compose it with an optional {@link CodeBlockHeader} (language/filename label),
 * a {@link CodeBlockBody}, and a {@link CodeBlockCopyButton}.
 *
 * Syntax highlighting is intentionally out of scope — the body renders plain
 * monospaced text.
 */
function CodeBlock({
  className,
  code,
  showLineNumbers = false,
  dark = false,
  children,
  ...props
}: CodeBlockProps) {
  return (
    <CodeBlockContext.Provider value={{ code, showLineNumbers }}>
      <div
        data-slot="code-block"
        data-dark={dark || undefined}
        className={cn(
          // `dark` remaps the semantic tokens below to the dark palette for
          // this subtree, so the block can be dark on an otherwise light page.
          dark && 'dark',
          'overflow-hidden rounded-md border border-border bg-card font-mono text-sm text-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CodeBlockContext.Provider>
  );
}

/**
 * Header bar for a {@link CodeBlock}, typically holding a language/filename
 * label and a {@link CodeBlockCopyButton}.
 */
function CodeBlockHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        'flex items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground-strong',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Renders the snippet from context inside a scrollable `pre`/`code`. When the
 * root's `showLineNumbers` is set, a right-aligned gutter is rendered per line;
 * the gutter is `aria-hidden` and non-selectable so copied or selected text
 * stays free of line numbers.
 */
function CodeBlockBody({ className, ...props }: React.ComponentProps<'div'>) {
  const { code, showLineNumbers } = useCodeBlockContext('CodeBlockBody');
  const lines = code.split('\n');

  return (
    <div
      data-slot="code-block-body"
      className={cn('overflow-x-auto', className)}
      {...props}
    >
      <pre className="py-4 leading-relaxed">
        <code className="grid">
          {showLineNumbers ? (
            lines.map((line, index) => (
              <span
                className="grid grid-cols-[auto_1fr] gap-4 px-4"
                // biome-ignore lint/suspicious/noArrayIndexKey: source lines have no stable id and never reorder
                key={index}
              >
                <span
                  aria-hidden="true"
                  className="select-none text-right tabular-nums text-muted-foreground"
                >
                  {index + 1}
                </span>
                <span className="whitespace-pre">{line || ' '}</span>
              </span>
            ))
          ) : (
            <span className="whitespace-pre px-4">{code}</span>
          )}
        </code>
      </pre>
    </div>
  );
}

const codeBlockCopyButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none motion-safe:transition-[color,background-color,opacity,transform] motion-safe:duration-[--duration-fast] motion-safe:ease-[--ease-standard] motion-safe:active:scale-[0.97] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:pointer-events-none',
  {
    variants: {
      size: {
        sm: "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        default: "size-7 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

type CodeBlockCopyButtonProps = Omit<
  React.ComponentProps<'button'>,
  'children'
> &
  VariantProps<typeof codeBlockCopyButtonVariants> & {
    /** Accessible label in the resting state. */
    copyLabel?: string;
    /** Accessible label while the confirmed state is showing. */
    copiedLabel?: string;
  };

/**
 * Copies the {@link CodeBlock}'s snippet to the clipboard and briefly swaps to a
 * check icon to confirm. Failure paths (insecure context, denied permission)
 * leave the button in its resting state rather than showing a false confirm.
 */
function CodeBlockCopyButton({
  className,
  size,
  onClick,
  copyLabel = 'Copy code',
  copiedLabel = 'Copied',
  ...props
}: CodeBlockCopyButtonProps) {
  const { code } = useCodeBlockContext('CodeBlockCopyButton');
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Insecure context or a denied permission rejects writeText — keep the
        // button resting rather than flashing a false confirmation.
        setCopied(false);
      }
    },
    [code, onClick],
  );

  return (
    <button
      type="button"
      data-slot="code-block-copy-button"
      data-size={size ?? 'default'}
      data-copied={copied || undefined}
      aria-label={copied ? copiedLabel : copyLabel}
      className={cn(codeBlockCopyButtonVariants({ size }), className)}
      onClick={handleClick}
      {...props}
    >
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
    </button>
  );
}

export type { CodeBlockCopyButtonProps, CodeBlockProps };
export {
  CodeBlock,
  CodeBlockBody,
  CodeBlockCopyButton,
  CodeBlockHeader,
  codeBlockCopyButtonVariants,
};
