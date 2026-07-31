import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockCopyButton,
  CodeBlockHeader,
} from '@/ui/code-block';

const basicSnippet = `pnpm dlx shadcn@latest add @nebari/code-block`;

const multiLineSnippet = `import { CodeBlock, CodeBlockBody } from '@/ui/code-block';

export function Example() {
  return (
    <CodeBlock code="echo hi" showLineNumbers>
      <CodeBlockBody />
    </CodeBlock>
  );
}`;

const manyLinesSnippet = Array.from(
  { length: 24 },
  (_, i) => `console.log('processing step ${i + 1} of 24');`,
).join('\n');

const longLineSnippet = `export const config = { retries: 3, timeout: 30000, endpoint: 'https://api.example.com/v1/resource', headers: { 'x-api-key': 'REPLACE_ME' } };`;

const meta = {
  title: 'Components/Code Block',
  component: CodeBlock,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A formatted, monospaced code snippet with an optional header (language/filename label), a copy-to-clipboard button, and optional line numbers. Syntax highlighting is intentionally out of scope for this baseline.',
      },
    },
  },
  args: {
    code: basicSnippet,
    showLineNumbers: false,
    showCopyButton: true,
    dark: false,
  },
  argTypes: {
    code: {
      description:
        'The snippet rendered in the body and copied to the clipboard.',
      control: 'text',
    },
    showLineNumbers: {
      description: 'Render a non-selectable, aria-hidden line-number gutter.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showCopyButton: {
      description:
        'Render a floating copy button in the top-right — for header-less blocks.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    dark: {
      description:
        'Force the dark palette for this block regardless of the page theme.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'A header-less snippet with a floating copy button. Copy is the most-expected action, so the button sits in the top-right corner over the body even without a header bar.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="w-[28rem]">
      <CodeBlockBody />
    </CodeBlock>
  ),
};

export const HorizontalScroll: Story = {
  name: 'Horizontal scroll',
  args: { code: longLineSnippet },
  parameters: {
    controls: { include: ['code'] },
    docs: {
      description: {
        story:
          'A header-less block whose single line is wider than the frame, so the body scrolls horizontally. The floating copy button stays opaque (`bg-card`), so the code passes behind it and the icon remains legible at any scroll position.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="w-[28rem]">
      <CodeBlockBody />
    </CodeBlock>
  ),
};

export const WithHeader: Story = {
  name: 'With header',
  args: { showCopyButton: false },
  parameters: {
    controls: { include: ['showCopyButton'] },
    docs: {
      description: {
        story:
          'A filename header paired with a copy-to-clipboard button. Click the button to copy; it swaps to a check icon to confirm a successful copy.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="min-w-[28rem]">
      <CodeBlockHeader>
        <span>Terminal</span>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody />
    </CodeBlock>
  ),
};

export const WithLineNumbers: Story = {
  name: 'With line numbers',
  args: {
    code: multiLineSnippet,
    showLineNumbers: true,
    showCopyButton: false,
  },
  parameters: {
    controls: { include: ['code', 'showLineNumbers', 'showCopyButton'] },
    docs: {
      description: {
        story:
          'A multi-line snippet with the line-number gutter. The gutter is aria-hidden and non-selectable, so copied text stays free of line numbers. Toggle the `showLineNumbers` control to switch the gutter off.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <span>example.tsx</span>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody />
    </CodeBlock>
  ),
};

export const MaxLines: Story = {
  name: 'Max lines',
  args: {
    code: manyLinesSnippet,
    showLineNumbers: true,
    showCopyButton: false,
  },
  parameters: {
    controls: { include: ['code', 'showLineNumbers', 'showCopyButton'] },
    docs: {
      description: {
        story:
          'The body’s `maxLines` prop caps the height in whole code lines (via the CSS `lh` unit), so the block always crops at a line boundary — never through the middle of a line — and scrolls vertically for the rest.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <span>steps.ts — 24 lines, capped at 8</span>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody maxLines={8} />
    </CodeBlock>
  ),
};

export const Dark: Story = {
  name: 'Dark',
  args: {
    code: multiLineSnippet,
    showLineNumbers: true,
    showCopyButton: false,
    dark: true,
  },
  parameters: {
    controls: {
      include: ['code', 'showLineNumbers', 'showCopyButton', 'dark'],
    },
    docs: {
      description: {
        story:
          'The `dark` prop forces the dark palette for this block via the theme’s `.dark` class — useful for a dark code surface on an otherwise light page. Colors come from the theme tokens, with no `dark:` utilities on the component.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <span>example.tsx</span>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody />
    </CodeBlock>
  ),
};
