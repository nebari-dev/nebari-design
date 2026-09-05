import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockCopyButton,
  CodeBlockHeader,
  useCodeBlockContext,
} from '@/components/ui/code-block';

const SNIPPETS = {
  install: 'pnpm dlx shadcn@latest add @nebari/code-block',
  usage: `import { CodeBlock, CodeBlockBody } from '@/components/ui/code-block';

export function Example() {
  return (
    <CodeBlock code="echo hi" showLineNumbers>
      <CodeBlockBody />
    </CodeBlock>
  );
}`,
} as const;

type SnippetKey = keyof typeof SNIPPETS;

const SNIPPET_LABELS: Record<SnippetKey, string> = {
  install: 'install.sh',
  usage: 'Example.tsx',
};

interface UseCodeBlockContextDemoProps {
  /** Documentation-only row for the `useCodeBlockContext` parameter. */
  component?: string;
  /** Documentation-only row for the `useCodeBlockContext` return value. */
  code?: string;
  /** Documentation-only row for the `useCodeBlockContext` return value. */
  showLineNumbers?: boolean;
  /** Documentation-only row for the `useCodeBlockContext` return value. */
  hasFloatingCopyButton?: boolean;
}

/**
 * A custom part that exists only in this story: it reads the snippet straight
 * from context to derive counts, so no `code` prop has to be threaded to it.
 */
function CodeBlockInsights() {
  const { code, showLineNumbers, hasFloatingCopyButton } =
    useCodeBlockContext('CodeBlockInsights');
  const lineCount = code.split('\n').length;

  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 border-border border-t bg-muted px-4 py-2 font-sans text-muted-foreground-strong text-xs">
      <div className="flex items-center gap-1.5">
        <dt>lines</dt>
        <dd>
          <code data-testid="context-line-count">{lineCount}</code>
        </dd>
      </div>
      <div className="flex items-center gap-1.5">
        <dt>characters</dt>
        <dd>
          <code data-testid="context-character-count">{code.length}</code>
        </dd>
      </div>
      <div className="flex items-center gap-1.5">
        <dt>showLineNumbers</dt>
        <dd>
          <code data-testid="context-show-line-numbers">
            {String(showLineNumbers)}
          </code>
        </dd>
      </div>
      <div className="flex items-center gap-1.5">
        <dt>hasFloatingCopyButton</dt>
        <dd>
          <code data-testid="context-has-floating-copy-button">
            {String(hasFloatingCopyButton)}
          </code>
        </dd>
      </div>
    </dl>
  );
}

function UseCodeBlockContextDemo(_props: UseCodeBlockContextDemoProps) {
  const [snippet, setSnippet] = useState<SnippetKey>('install');
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <section
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground"
        aria-labelledby="code-block-context-controls"
      >
        <div>
          <h2 id="code-block-context-controls" className="font-semibold">
            Root props
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            These set props on <code>CodeBlock</code>. The footer below is a
            custom part reading the resulting context.
          </p>
        </div>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Snippet</legend>
          {(Object.keys(SNIPPETS) as SnippetKey[]).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={snippet === key ? 'default' : 'outline'}
              aria-pressed={snippet === key}
              onClick={() => setSnippet(key)}
            >
              {SNIPPET_LABELS[key]}
            </Button>
          ))}
          <Button
            size="sm"
            variant={showLineNumbers ? 'default' : 'outline'}
            aria-pressed={showLineNumbers}
            onClick={() => setShowLineNumbers((previous) => !previous)}
          >
            Line numbers
          </Button>
          <Button
            size="sm"
            variant={showCopyButton ? 'default' : 'outline'}
            aria-pressed={showCopyButton}
            onClick={() => setShowCopyButton((previous) => !previous)}
          >
            Floating copy
          </Button>
        </fieldset>
      </section>

      <CodeBlock
        code={SNIPPETS[snippet]}
        showLineNumbers={showLineNumbers}
        showCopyButton={showCopyButton}
      >
        <CodeBlockHeader>
          <span>{SNIPPET_LABELS[snippet]}</span>
          {showCopyButton ? null : <CodeBlockCopyButton size="sm" />}
        </CodeBlockHeader>
        <CodeBlockBody maxLines={10} />
        <CodeBlockInsights />
      </CodeBlock>
    </div>
  );
}

function CodeBlockContextMisuseDemo(_props: UseCodeBlockContextDemoProps) {
  const [withRoot, setWithRoot] = useState(false);

  return (
    <div className="flex w-96 flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div>
        <h2 className="font-semibold text-lg">Missing root</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          The preview explains the failure safely, then mounts the custom part
          inside a <code>CodeBlock</code> when requested.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setWithRoot((previous) => !previous)}
      >
        {withRoot ? 'Remove CodeBlock' : 'Add CodeBlock'}
      </Button>
      {withRoot ? (
        <CodeBlock
          className="w-full min-w-0"
          code={SNIPPETS.install}
          showCopyButton={false}
        >
          <CodeBlockBody />
          <CodeBlockInsights />
        </CodeBlock>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>Render would fail</AlertTitle>
          <AlertDescription data-testid="context-error">
            &lt;CodeBlockInsights&gt; must be used within a &lt;CodeBlock&gt;.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

const meta = {
  title: 'Hooks/useCodeBlockContext',
  component: UseCodeBlockContextDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`useCodeBlockContext` reads the snippet and layout flags that the nearest ' +
          '`CodeBlock` shares with its descendants. `CodeBlockBody` and ' +
          '`CodeBlockCopyButton` use it internally, and it is exported so an app can add ' +
          'its own parts — a line counter, a download button, a language badge — without ' +
          're-threading `code` through props at every level. The footer in the demo below ' +
          'is exactly that: a custom part deriving its counts from context while the ' +
          "controls change the root's props. Pass the calling component's name as the " +
          'single argument; it appears in the error thrown when the part is rendered ' +
          'outside a `CodeBlock` — `<CodeBlockInsights> must be used within a ' +
          '<CodeBlock>.` The context has no default value, so the call throws rather than ' +
          'rendering against an empty snippet. See the **Outside Root** story.',
      },
    },
  },
  argTypes: {
    component: {
      description:
        "Name of the calling component. Interpolated into the thrown error so a missing `CodeBlock` reports which part failed; it does not affect what's returned.",
      control: false,
      table: {
        category: 'useCodeBlockContext parameter',
        type: { summary: 'string' },
      },
    },
    code: {
      description:
        'The raw snippet passed to `CodeBlock`, shared so descendants read the text instead of receiving it as a prop.',
      control: false,
      table: {
        category: 'useCodeBlockContext return',
        type: { summary: 'string' },
      },
    },
    showLineNumbers: {
      description:
        "The root's `showLineNumbers` prop, so a custom part can align with the body's line-number gutter.",
      control: false,
      table: {
        category: 'useCodeBlockContext return',
        type: { summary: 'boolean' },
      },
    },
    hasFloatingCopyButton: {
      description:
        "The root's `showCopyButton` prop. `CodeBlockBody` reads it to reserve top-right clearance; a custom overlay part should do the same to avoid colliding with the floating button.",
      control: false,
      table: {
        category: 'useCodeBlockContext return',
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof UseCodeBlockContextDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('context-line-count')).toHaveTextContent(
      /^1$/,
    );
    await expect(
      canvas.getByTestId('context-show-line-numbers'),
    ).toHaveTextContent('false');
    await expect(
      canvas.getByTestId('context-has-floating-copy-button'),
    ).toHaveTextContent('true');

    await userEvent.click(canvas.getByRole('button', { name: 'Example.tsx' }));
    await expect(canvas.getByTestId('context-line-count')).toHaveTextContent(
      /^9$/,
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Line numbers' }));
    await expect(
      canvas.getByTestId('context-show-line-numbers'),
    ).toHaveTextContent('true');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Floating copy' }),
    );
    await expect(
      canvas.getByTestId('context-has-floating-copy-button'),
    ).toHaveTextContent('false');
  },
};

export const OutsideRoot: Story = {
  name: 'Outside root',
  parameters: {
    docs: {
      description: {
        story:
          '`useCodeBlockContext` reads a context with no default value, so a custom part ' +
          'rendered above `CodeBlock` throws instead of silently returning an empty ' +
          'snippet. The name passed to the hook identifies the offending part in the ' +
          'message. The preview shows that exact error as copy rather than deliberately ' +
          'crashing the story; add the root to render the part safely.',
      },
    },
  },
  render: (args) => <CodeBlockContextMisuseDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('context-error')).toHaveTextContent(
      '<CodeBlockInsights> must be used within a <CodeBlock>.',
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Add CodeBlock' }),
    );
    await expect(canvas.getByTestId('context-line-count')).toHaveTextContent(
      /^1$/,
    );
    await expect(canvas.queryByTestId('context-error')).not.toBeInTheDocument();
  },
};
