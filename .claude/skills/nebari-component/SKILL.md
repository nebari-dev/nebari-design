---
name: nebari-component
description: >-
  House recipe for adding a new component to the nebari-design shadcn registry.
  Use when adding, creating, or scaffolding a registry component — e.g. "add a
  Button component to the registry", "create a new nebari component", "scaffold
  a component in registry/nebari/ui", "animate / add motion to a component", or
  "add a Storybook story for a registry hook". Covers the component file pattern
  (cva variants, data-slot/data-variant/data-size attributes, cn() merging, Base
  UI render-prop composition), the registry.json entry shape (dependencies vs
  registryDependencies), motion and animation (interaction states, overlay
  enter/exit, motion-safe gating, token usage), story and test templates
  (including Hooks/* stories for exported registry hooks), and the verification
  gate.
---

# Authoring a nebari-design registry component

This repo is a [shadcn component registry](https://ui.shadcn.com/docs/registry).
A component is **four coordinated edits**: the component file, a `registry.json`
entry, a Storybook story, and a Vitest test — then a verification gate.

Conventions that are easy to get wrong, encoded once here:

- Components live in `registry/nebari/ui/<name>.tsx` (kebab-case file name).
- The `@/*` path alias resolves to `registry/nebari/*`; the more specific
  `@/components/ui` → `registry/nebari/ui`, `@/lib` → `registry/nebari/lib`,
  `@/hooks` → `registry/nebari/hooks`.
- Import registry siblings as `@/components/ui/<name>`, never `@/ui/<name>` (Biome
  rejects it). It is the path the shadcn CLI emits for a consumer's default
  aliases, so installed files stay byte-identical to the registry source.
- Composition uses **Base UI's `render` prop** (`@base-ui/react`), not
  Radix `asChild`.
- Stories live in top-level `stories/<name>.stories.tsx`, tests in top-level
  `tests/<name>.test.tsx` — **not** co-located with the component.
- Exported hooks are documented too, under `Hooks/*` — see
  [Hook stories](#hook-stories).
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
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium motion-safe:transition-[color,background-color,border-color,opacity,transform] motion-safe:duration-(--duration-fast) motion-safe:ease-(--ease-standard) motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
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
  `@base-ui/react/use-render` to let callers swap the rendered element
  (e.g. `<Button render={<a href="…" />}>`). Give `render` a sensible default
  element, type props with `useRender.ComponentProps<'tag'>`, and spread the
  merged `props` into `useRender`. This replaces Radix's `asChild`.
- **Named exports**, function components (no `React.forwardRef` — React 19 passes
  `ref` as a normal prop and Base UI threads it through).
- **Semantic tokens only.** Use theme tokens; never hard-code brand hex values or
  add `dark:` utilities — the `.dark` class on an ancestor remaps the tokens.
- **Motion via tokens (where it makes sense).** For interactive components, add
  `motion-safe:transition-[color,background-color,border-color,opacity,transform]`,
  `motion-safe:duration-(--duration-fast)`, and `motion-safe:ease-(--ease-standard)`
  to the `cva` base class, plus `motion-safe:active:scale-[0.97]` for press
  feedback. Static structure/content components stay still. See the
  [Motion](#motion) section for when to animate, the full rules, and overlay
  patterns.

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
  "dependencies": ["@base-ui/react", "class-variance-authority"],
  "registryDependencies": ["@nebari/utils"],
  "files": [
    {
      "path": "registry/nebari/ui/button.tsx",
      "type": "registry:ui"
    }
  ]
}
```

**`dependencies`** = npm packages the component imports.

- List `@base-ui/react`, `class-variance-authority`, `lucide-react`,
  etc. — anything resolved from `node_modules`.
- Do **not** list `react` / `react-dom` (assumed peers), nor `clsx` /
  `tailwind-merge` (those are dependencies of the `utils` item, not the
  component), nor `tailwindcss`.

**`registryDependencies`** = other items the component needs from a registry.

- Any component that calls `cn()` imports `@/lib/utils`, so it **must** list
  `"@nebari/utils"`.
- **Reference items in *this* registry by their `@nebari/<name>` namespace, not
  by bare name** (`"@nebari/utils"`, `"@nebari/theme"`); reference the upstream
  shadcn registry by URL or `@scope/name`. A bare `"theme"` makes the shadcn CLI
  resolve against the default registry's `styles/<style>/theme.json` — a 404 that
  aborts `shadcn add` for consumers — whereas `"@nebari/theme"` resolves through
  the `@nebari` registry the consumer already has configured.
- If the component relies on tokens that aren't guaranteed present, list
  `"@nebari/theme"` too. **Any component that uses motion tokens (`--duration-*`,
  `--ease-*`, `--animate-*`) must list `"@nebari/theme"` in `registryDependencies`**
  so `shadcn add` installs those variables automatically.

## Motion

Motion is a first-class authoring concern, but **not every component needs it**.
Add motion where it carries meaning — communicating a state change, a press, or
an element entering/leaving — and skip it where it would be decoration. Motion
applied indiscriminately reads as noise; motion withheld where the eye expects
feedback reads as broken. Decide deliberately per component.

### When motion makes sense (and when to skip it)

Add motion when the component **changes state or position the user should
perceive**:

- **Interactive controls** that respond to hover/focus/press — `button`,
  `badge` (when actionable), `switch`, `checkbox`, `radio-group`. These get the
  token-driven interaction-state classes below baked into their `cva` base.
- **Overlays that mount/unmount** — `dialog`, `popover`, `menu`, `tooltip`,
  `select`, `sheet`/`drawer`. These wire Base UI's enter/exit transition
  attributes in their source.
- **Status / async feedback** — `spinner`, skeleton/shimmer, progress, toast.
  The motion *is* the information.

Skip motion (or keep it to inherited focus rings only) for components that are
**static structure or content**:

- Layout and text primitives — `label`, `field`, plain `input`/`textarea`
  (beyond the focus-ring transition they inherit), separators, cards used purely
  as containers, typography.
- Anything where added movement wouldn't reflect a real state change. A
  resting, non-interactive element should sit still.

When unsure, ask: *does something the user did, or something that changed,
warrant visible feedback here?* If yes, animate it with the tokens below. If no,
leave it static — that is a valid and often correct choice. Retrofitting motion
onto a component that needs it is harder than getting it right at authoring
time, so make the call deliberately rather than defaulting either way.

### Ground rules

1. **Always gate on `motion-safe:`** — Nebari targets WCAG 2.1 SC 2.3.3
   (`prefers-reduced-motion`). Every animation or transition class must carry
   the prefix: `motion-safe:transition-[…]`, `motion-safe:active:scale-[0.97]`.
2. **Use tokens, never hardcode durations or easing.** In `cva` strings, use
   Tailwind v4's CSS-variable shorthand — **parentheses, not brackets**:
   `motion-safe:duration-(--duration-fast)`, `motion-safe:ease-(--ease-standard)`.
   In hand-written CSS, use `var(--duration-fast)` / `var(--ease-standard)`.
   Tailwind v3's bracket form `duration-[--duration-fast]` compiles to
   `transition-duration: --duration-fast`, which is invalid, so the property
   resets to its initial `0s` and the transition is silently dead — no build
   error, no lint warning, no failing test. CI greps for the bracket form to
   catch a regression.
3. **Animate `opacity` and `transform` only.** Layout properties (`height`,
   `width`, `padding`, `margin`) force reflows — never animate them.
4. **Enumerate transition properties explicitly.** When `transform` or `opacity`
   is animated alongside color, `tailwind-merge` can silently drop properties if
   a bare `transition-colors` already exists in the same `cva` block. Always
   list every property you need:
   `transition-[color,background-color,border-color,opacity,transform]`.

### Interaction states (interactive components only)

For the interactive components identified above — those that respond to
hover/focus/press — add to the `cva` base class:

```
motion-safe:transition-[color,background-color,border-color,opacity,transform]
motion-safe:duration-(--duration-fast)
motion-safe:ease-(--ease-standard)
motion-safe:active:scale-[0.97]
```

This gives the component a fast, token-driven color/scale transition and a
subtle 3 % press-down effect with no additional work for the consumer. The
canonical Button example in Step 1 models this pattern exactly.

### Overlay enter/exit (dialog, popover, menu, tooltip, select)

Components that mount/unmount on state must wire Base UI's CSS-transition
lifecycle attributes **in the component source** (not in a consumer stylesheet
or a wrapper). Base UI applies these attributes automatically during the
open/close cycle:

| Attribute | Applied when | What to set |
|---|---|---|
| `data-open` | panel is fully open | resting (visible) state |
| `data-closed` | panel is closing | collapsed/hidden state |
| `data-starting-style` | first frame after mount | entering state (opacity/translate) |
| `data-ending-style` | last frame before unmount | exiting state (opacity/translate) |

Wire them in the overlay element's `cva` base class or `cn()` call:

```tsx
// Overlay panel — dropdown, tooltip, etc.
const panelVariants = cva([
  'bg-popover text-popover-foreground shadow-md rounded-md border border-border',
  // enter: fade in + slide up from 4 px below
  'data-[starting-style]:opacity-0 data-[starting-style]:translate-y-1',
  // exit: same values — Base UI reverses the transition automatically
  'data-[ending-style]:opacity-0 data-[ending-style]:translate-y-1',
  // transition — enumerate both opacity and transform
  'motion-safe:transition-[opacity,transform]',
  'motion-safe:duration-(--duration-base)',
  'motion-safe:ease-(--ease-emphasized)',
]);
```

For panels that slide in from an edge (drawer, sheet), swap `translate-y-1` for
`translate-x-full` / `-translate-x-full` and use `--duration-slow`.

### `registry.json` reminder

A component that references motion tokens (`--duration-*`, `--ease-*`,
`--animate-*`) must list `"@nebari/theme"` in `registryDependencies`:

```json
"registryDependencies": ["@nebari/utils", "@nebari/theme"]
```

## Step 3 — the story

Create `stories/<name>.stories.tsx` (CSF3, one story per meaningful variant).

### Controls convention (required)

`Default` is the interactive playground and the only story with controls; every
other story shows an empty panel unless it owns a knob outright, and every
control `Default` shows is a populated widget from first paint. Eight rules,
applied by every story under `Components/*`
(`tests/story-controls.test.ts` enforces what is statically checkable):

1. **Meta declares the full documented prop surface.** Each prop gets a
   `description`, a `control`, `options` for unions, and `table.defaultValue`
   when the component has a real default (omit it for props with none, like
   `children` or `placeholder`). Unions always use `control: 'select'` — `radio`
   and `inline-radio` are not used, whatever the option count. Consumer-facing
   props that cannot be represented by a knob, especially Base UI's `render`
   prop, stay visible with `control: false`.
2. **Depth = own props + key state props.** The component's own props and cva
   variant keys, plus the inherited Base UI/HTML props a playground needs
   (`open`/`defaultOpen`, `checked`/`defaultChecked`, `disabled`, `placeholder`,
   `aria-invalid`, …). Not the whole inherited surface.
3. **Hide plumbing; document everything else.** Two distinct tools:
   - `table: { disable: true }` — implementation plumbing and callbacks only:
     `className`, `style`, `id`, `portalProps`, `viewportClassName`,
     `overlayClassName`, `validate`, `onValueChange`, and props the component
     hardcodes (e.g. tooltip's `role`).
   - `control: false` plus a `description` — consumer APIs that cannot be a
     knob: Base UI's `render`, `children` when the component is composed from
     subcomponents (the knob would be meaningless JSX), and controlled-state
     props (see rule 8). These stay visible in the props table because
     consumers need them.

   Never use either for per-story narrowing; that always uses
   `controls.include`.
4. **`Default` is the playground.** Name it exactly `Default` and give it no
   prop-fixing per-story `args` (baseline meta `args` are fine) and no
   `parameters.controls`. Its `render` must thread `args` into the component so
   every interactive knob is live.
5. **Every knob is seeded in meta `args`.** Storybook's boolean, number, and
   object controls render a click-to-reveal "Set …" button while their value is
   `undefined`, so an unseeded knob costs a click before it can be used. Default
   to seeding with the component's own default — `false` for booleans, the
   documented default for selects, the effective default for numbers. Where that
   would make a dull playground, seed the state the playground is better off
   opening in instead (`defaultChecked: true` on checkbox and switch,
   `defaultValue: 33` on slider) and let `table.defaultValue` carry the real
   default. Seed in meta, not per story: rule 4 keeps `Default` free of own args.
   Optional free-text knobs (`loadingText`, `htmlFor`) need no seed; a text
   control always renders an input.

   Where an unset prop is itself a meaningful state, model it as an explicit
   `auto` option rather than leaving the arg undefined — a story-args union plus
   a lookup back to the real value, the pattern dialog already uses for `modal`:

   ```tsx
   // stories/drawer.stories.tsx
   const SWIPE_HANDLE_BY_KEY = { auto: undefined, shown: true, hidden: false } as const;
   // argTypes: control 'select', options ['auto', 'shown', 'hidden']
   // args: { showSwipeHandle: 'auto' }
   ```

   Without it the knob is both click-to-reveal *and* a one-way door: once
   touched, there is no way back to the automatic behavior.
6. **Every other story sets `parameters.controls.include: []`.** The full prop
   surface is adjustable in exactly one place — `Default` — and repeating a
   slice of it under every story only invites the reader to knob a story out of
   the state it exists to show.
   - A control may live on at most one non-Default story, and only if it applies
     to that story and to no other. In practice that means a story-only knob the
     story declares in its own per-story `argTypes`; see `CompleteNavbar` in
     `stories/navigation-menu.stories.tsx`. A prop that would be relevant to two
     or more stories belongs to `Default` alone.
   - **Every `render` must take an args parameter, `_args` if it ignores them.**
     Storybook computes `__isArgsStory` as `render && render.length > 0` and
     skips the `include` filter entirely when it is false, so an `() => …` render
     silently shows the whole meta surface no matter what `include` says.
   - The story's subject still goes through its own `args` when it is one prop
     on one instance (`args: { variant: 'underline' }`, not
     `<ExampleTabs variant="underline" />`) — it is simply pinned rather than
     live, and the render can keep threading `args`.
7. **Composite components use the story-args pattern.** When the knobs span
   subcomponents (tabs' `variant` lives on `TabsList`, dialog's `defaultOpen` on
   the root), declare a local `<Name>StoryArgs` type with those props plus any
   story-only toggles, use `satisfies Meta<NameStoryArgs>`, and label each
   synthetic knob "Story-only toggle" in its description. See
   `stories/card.stories.tsx`, `stories/tabs.stories.tsx`.
8. **No no-op knobs — mind mount-only and controlled props.** Storybook
   re-renders into a cached React root on an args change; it never remounts. So
   a mount-only prop (`defaultChecked`, `defaultValue`, `defaultOpen`) exposed
   as a live control would silently do nothing. Keep the control and key the
   story on that prop from a meta decorator, so every story in the file gets the
   remount for free instead of repeating a `key` in each `render`:

   ```tsx
   decorators: [(Story, { args }) => <Story key={String(args.defaultChecked)} />],
   ```

   Its controlled
   counterpart (`checked`, `value`, `open`) gets `control: false` with a
   "left as a docs-only row here so the playground stays interactive" note —
   a live controlled knob with no state wiring freezes the component the moment
   it is touched. Use `control: false`, not `table: { disable: true }`: these
   are real consumer APIs and belong in the props table.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'One paragraph on what it is and when to use it.' } },
  },
  args: { children: 'Button', disabled: false, loading: false, size: 'default', variant: 'default' },
  argTypes: {
    variant: {
      description: 'Visual style of the button. `link` uses the foreground text color and no fill.',
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      description: 'Height and padding preset. The `icon-*` sizes are square.',
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg'],
      table: { defaultValue: { summary: 'default' } },
    },
    loading: {
      description: 'Renders a `Spinner`, sets `aria-busy`, and disables the button.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      description: 'Disables the button and collapses it to the muted look.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { description: 'Button content.', control: 'text' },
    render: {
      description: 'Base UI render-prop composition for swapping the rendered element.',
      control: false,
      table: { defaultValue: { summary: '<button type="button" />' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
  parameters: { controls: { include: [] } },
};

export const Variants: Story = {
  parameters: { controls: { include: [] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
    </div>
  ),
};
```

For the one exception — a story that owns its knobs and so keeps a populated
panel — see `CompleteNavbar` in `stories/navigation-menu.stories.tsx`.

To preview dark mode, wrap a story in `<div className="dark bg-background p-8">`.

Where feasible, include a story that exercises the component's interactive or
animated states — `Default` already covers the all-props-exposed case, so add an
`Interactive` story with a `play` function that focuses, hovers, or clicks the
element. Vitest/jsdom has no layout engine and cannot assert CSS
transitions; Storybook stories are the right place to visually verify motion.
Add a comment in the test file where CSS transition coverage is intentionally
absent (e.g. `// CSS transitions are not testable in jsdom; animated states are
// verified in Storybook`).

### Hook stories

Give every hook exported to consumers its own Storybook page, whether it lives
in `registry/nebari/hooks` or is exported beside a component. Export is the
test, not category: a context reader counts once it is in a component's
`export {}` block, because consumers can then compose their own parts with it.
Do not make pages for hooks that stay module-private, or for hooks owned by Base
UI that Nebari does not re-export; their component stories cover the public
behavior.

This is a documentation-only workflow. Do not add or extract hooks, or change a
hook's signature, return shape, or behavior to make a demo easier. If an
existing hook is awkward to demonstrate, file a follow-up instead. A hook story
does not change `registry.json` and needs no test of its own. Publishing a
previously module-private hook so it can be documented is the exception: that
widens the component's public API, so cover the new export in the component's
test — the values it returns, and the named error it throws without its root.

If a task explicitly promotes an existing internal hook to public API, export
the existing function without changing its signature or behavior, export any
types consumers need to use its return value, and add focused contract tests for
the newly public surface. The owning component's existing registry item already
ships the source file, so this still does not require a `registry.json` change.

- Title the page `Hooks/<exportedHookName>` and normally name the file after the
  hook in kebab case: `useSidebar` becomes `use-sidebar.stories.tsx`. A
  provider/hook pair may use the owning provider file instead; for example,
  `theme-provider.stories.tsx` documents `Hooks/useTheme`. Keep an existing
  hook title stable when renaming a mismatched story file.
- Point Storybook's `component` at a local demo component that calls the real
  hook beneath any required provider. The demo must be interactive: let the
  reader change state through a visible control and display the live returned
  state. A prose-only page is not sufficient.
- Make the demo expose the reason to use the hook, not merely repeat its
  component's existing stories. For a component-owned hook, show an external
  consumer reading and driving state without the component's usual built-in
  trigger. For a shared provider hook, mount one provider at the demo root and
  use separate descendants to read and set the same state.
- Explain the hook, its required context, and relevant misuse behavior in
  `parameters.docs.description.component`. When the provider avoids competing
  hook instances or global side effects, explain that advantage. If misuse
  throws, show or describe the exact failure without deliberately crashing the
  Storybook preview. The established shape is a second story — `Outside
  Provider`, or `Outside Root` for a component-owned hook — rendering the exact
  message as `Alert` copy plus a button that mounts the provider and recovers.
- Document every public option, provider prop, and returned value with
  descriptive `argTypes`, explicit `table.type` summaries, and distinct
  categories such as `useThemePreference options`, `ThemeProvider props`, and
  `useTheme return`. Hook API rows are documentation rather than knobs, so set
  `control: false`; reserve `table.disable` for story-only plumbing. A local
  demo props type may add optional documentation-only fields for return values
  so the complete API table renders.
- A component-owned context reader takes the calling component's name as its
  only argument, purely to name itself in the error it throws. Document that
  parameter in its own `useXContext parameter` category, and say plainly that it
  does not change what the hook returns.
- Demonstrate a context reader with a custom part the component does not already
  ship — a counter, a summary, a badge — driven by controls that change the
  root's props. Repeating a part that already exists proves nothing the
  component's own story doesn't. Where the value is that one provider reaches
  everywhere, render the same custom part twice, including inside portaled
  content.
- Isolate demos that mutate browser-global state. Use a story-specific
  `localStorage` key and restore any toolbar-owned `<html>` class on unmount so
  the demo cannot affect another story.
- Add a `play` function that performs the documented interaction and asserts
  the visible returned state. The component control conventions and
  `tests/story-controls.test.ts` deliberately apply only to `Components/*`, not
  `Hooks/*`.

In addition to the normal verification gate, hook-story documentation must pass
`bun run build:storybook` so the published docs surface is proven to build.

## Step 4 — the test

Create `tests/<name>.test.tsx`. Test behavior, the variant/size data attributes,
and `render`-prop composition:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';

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
