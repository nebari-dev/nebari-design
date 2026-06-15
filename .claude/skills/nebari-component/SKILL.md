---
name: nebari-component
description: >-
  House recipe for adding a new component to the nebari-design shadcn registry.
  Use when adding, creating, or scaffolding a registry component — e.g. "add a
  Button component to the registry", "create a new nebari component", "scaffold
  <X> in registry/nebari/ui". Covers the component file pattern (cva variants,
  data-slot/data-variant/data-size attributes, cn() merging, Base UI render-prop
  composition), the registry.json entry shape (dependencies vs
  registryDependencies), story and test templates, and the verification gate.
---

# Authoring a nebari-design registry component

This repo is a [shadcn component registry](https://ui.shadcn.com/docs/registry).
A component is **four coordinated edits**: the component file, a `registry.json`
entry, a Storybook story, and a Vitest test — then a verification gate.

Conventions that are easy to get wrong, encoded once here:

- Components live in `registry/nebari/ui/<name>.tsx` (kebab-case file name).
- The `@/*` path alias resolves to `registry/nebari/*`; `@/ui` → `registry/nebari/ui`,
  `@/lib` → `registry/nebari/lib`.
- Composition uses **Base UI's `render` prop** (`@base-ui-components/react`), not
  Radix `asChild`.
- Stories live in top-level `stories/<name>.stories.tsx`, tests in top-level
  `tests/<name>.test.tsx` — **not** co-located with the component.
- Styling uses semantic theme tokens (`bg-primary`, `text-muted-foreground`, …),
  never raw hex or `dark:` variants — the theme handles light/dark.

## Step 0 (optional) — pull the design from Figma

If the request references a Figma frame or URL, build from the real frame rather
than guessing. Use the Figma MCP (`get_design_context`, `get_screenshot`,
`get_variable_defs`) to read the layout, variants, and token names, then map
Figma variables onto the existing Nebari theme tokens in
`registry/nebari/globals.css`. Do not invent new tokens unless the design needs one.

## Step 1 — the component file

Create `registry/nebari/ui/<name>.tsx`. The canonical pattern (Button shown):

```tsx
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends useRender.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant,
  size,
  render = <button type="button" />,
  ...props
}: ButtonProps) {
  return useRender({
    render,
    props: {
      'data-slot': 'button',
      'data-variant': variant ?? 'default',
      'data-size': size ?? 'default',
      className: cn(buttonVariants({ variant, size }), className),
      ...props,
    },
  });
}

export { Button, buttonVariants };
```

The rules this encodes:

- **`cva` for variants.** Define `variants` and `defaultVariants`; export the
  `*Variants` function alongside the component so consumers can reuse the class
  string. Type the public props with `VariantProps<typeof xVariants>`.
- **`data-slot` / `data-variant` / `data-size` attributes.** Every component sets
  `data-slot="<name>"` on its root. When it has variants, also emit `data-variant`
  and `data-size`. These give consumers stable styling/test hooks independent of
  class names.
- **`cn()` merging.** Always merge with `cn(componentVariants(...), className)`
  so a caller's `className` wins over the defaults. Import from `@/lib/utils`.
- **Base UI `render`-prop composition.** Use `useRender` from
  `@base-ui-components/react/use-render` to let callers swap the rendered element
  (e.g. `<Button render={<a href="…" />}>`). Give `render` a sensible default
  element, type props with `useRender.ComponentProps<'tag'>`, and spread the
  merged `props` into `useRender`. This replaces Radix's `asChild`.
- **Named exports**, function components (no `React.forwardRef` — React 19 passes
  `ref` as a normal prop and Base UI threads it through).
- **Semantic tokens only.** Use theme tokens; never hard-code brand hex values or
  add `dark:` utilities — the `.dark` class on an ancestor remaps the tokens.

For a component that is purely a styled wrapper with no element swapping, a plain
`React.ComponentProps<'tag'>` + `<tag data-slot=… className={cn(...)} {...props} />`
is fine — reach for `useRender` only when composition matters.

## Step 2 — wire it into `registry.json`

Add an item to the `items` array:

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "Button with variant and size options, composable via Base UI's render prop.",
  "dependencies": ["@base-ui-components/react", "class-variance-authority"],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "registry/nebari/ui/button.tsx",
      "type": "registry:ui"
    }
  ]
}
```

**`dependencies`** = npm packages the component imports.

- List `@base-ui-components/react`, `class-variance-authority`, `lucide-react`,
  etc. — anything resolved from `node_modules`.
- Do **not** list `react` / `react-dom` (assumed peers), nor `clsx` /
  `tailwind-merge` (those are dependencies of the `utils` item, not the
  component), nor `tailwindcss`.

**`registryDependencies`** = other items the component needs from a registry.

- Any component that calls `cn()` imports `@/lib/utils`, so it **must** list
  `"utils"`.
- Reference items in *this* registry by bare name (`"utils"`, `"theme"`); reference
  the upstream shadcn registry by URL or `@scope/name`.
- If the component relies on tokens that aren't guaranteed present, list `"theme"`
  too.

## Step 3 — the story

Create `stories/<name>.stories.tsx` (CSF3, one story per meaningful variant):

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Small: Story = { args: { size: 'sm' } };
```

To preview dark mode, wrap a story in `<div className="dark bg-background p-8">`
(see `stories/Welcome.stories.tsx`).

## Step 4 — the test

Create `tests/<name>.test.tsx`. Test behavior, the variant/size data attributes,
and `render`-prop composition:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/ui/button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('reflects the variant and size as data attributes', () => {
    render(
      <Button variant="secondary" size="sm">
        Hi
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Hi' });
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('composes with the render prop', () => {
    // biome-ignore lint/a11y/useAnchorContent: Button injects the children
    render(<Button render={<a href="/home" />}>Home</Button>);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveAttribute('data-slot', 'button');
  });
});
```

Coverage of `registry/nebari` is enforced at **80%** (see `vitest.config.ts`), so
exercise every variant branch you add.

## Step 5 — verification gate (run before declaring done)

```sh
bun run build:registry   # registry.json is valid and the item builds into public/r
bun run check            # biome lint + format (use check:fix to auto-fix)
bunx tsc --noEmit        # types pass
bun run test             # vitest suite passes, coverage ≥ 80%
```

All four must pass. `bun run check:fix` will auto-organize imports and apply
formatting (single quotes, semicolons, trailing commas, 2-space indent), so don't
hand-fuss the import order — write the code and let Biome sort it.
