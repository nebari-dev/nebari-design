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
  args: { code: basicSnippet, showLineNumbers: false, dark: false },
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

export const Basic: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'A bare snippet with no header — just the monospaced body.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="w-[28rem]">
      <CodeBlockBody />
    </CodeBlock>
  ),
};

export const WithHeaderAndCopy: Story = {
  name: 'With header + copy',
  parameters: {
    docs: {
      description: {
        story:
          'A filename header paired with a copy-to-clipboard button. Click the button to copy; it swaps to a check icon to confirm a successful copy.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="w-[28rem]">
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
  args: { code: multiLineSnippet, showLineNumbers: true },
  parameters: {
    docs: {
      description: {
        story:
          'A multi-line snippet with the line-number gutter. The gutter is aria-hidden and non-selectable, so copied text stays free of line numbers. Toggle the `showLineNumbers` control to switch the gutter off.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="w-[34rem]">
      <CodeBlockHeader>
        <span>example.tsx</span>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody />
    </CodeBlock>
  ),
};

export const Dark: Story = {
  name: 'Dark',
  args: { code: multiLineSnippet, showLineNumbers: true, dark: true },
  parameters: {
    docs: {
      description: {
        story:
          'The `dark` prop forces the dark palette for this block via the theme’s `.dark` class — useful for a dark code surface on an otherwise light page. Colors come from the theme tokens, with no `dark:` utilities on the component.',
      },
    },
  },
  render: (args) => (
    <CodeBlock {...args} className="w-[34rem]">
      <CodeBlockHeader>
        <span>example.tsx</span>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockBody />
    </CodeBlock>
  ),
};
