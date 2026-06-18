---
name: nebari-ui
description: >-
  Add and use components from the Nebari design system (the @nebari shadcn
  registry) in this app. Use when asked to "add a nebari component", "use the
  nebari button/badge/alert/spinner", "install the nebari theme", or "build
  <something> with nebari components". Covers registry setup (the @nebari
  namespace in components.json + the shadcn add command), the component catalog
  (variants, sizes, props), the Base UI render-prop composition convention, and
  theming (the @nebari/theme tokens, CSS variables, and light/dark).
---

# Using the Nebari design system

[Nebari design](https://github.com/nebari-dev/nebari-design) is a
[shadcn component registry](https://ui.shadcn.com/docs/registry) styled with the
Nebari brand. You install its components into this app with the `shadcn` CLI —
they're copied into your codebase as source you own, exactly like any other
shadcn component. This skill covers setup, the catalog, the composition
convention, and theming.

## Step 1 — register the `@nebari` namespace (once)

Add the `@nebari` registry to the consumer's `components.json` so
`shadcn add @nebari/<name>` resolves. The items are served as JSON from the
project's GitHub Pages site:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "@nebari": "https://nebari-dev.github.io/nebari-design/r/{name}.json"
  }
}
```

`{name}` is the placeholder shadcn substitutes per item. This block sits
alongside the app's existing `style` / `tailwind` / `aliases` config — it does
not replace them. A standard shadcn-initialized project (run `npx shadcn init`
first if `components.json` doesn't exist yet) is the only prerequisite.

## Step 2 — install components

```sh
npx shadcn add @nebari/<name>
```

Most components depend on the shared `cn()` helper (the `utils` item) and the
theme tokens, and shadcn pulls those `registryDependencies` in automatically —
you don't list them yourself. Install the theme explicitly the first time (see
[Theming](#theming)):

```sh
npx shadcn add @nebari/theme
npx shadcn add @nebari/button
```

Installed files land under the app's configured aliases (`@/ui`, `@/lib`), so
imports look like `import { Button } from '@/components/ui/button'` — match the
host app's existing alias resolution.

## Discovering what's available

The registry is the source of truth for the catalog — don't rely on a
hard-coded list here, which would drift as components are added. To see what
exists and learn a component's exact API:

- **List every item** — fetch the registry index, which names and describes each
  installable item (components, the `utils` helper, the `theme`, this skill):

  ```sh
  curl -s https://nebari-dev.github.io/nebari-design/r/registry.json
  ```

- **Inspect one before installing** — `shadcn view` prints an item's
  description, dependencies, and its full source:

  ```sh
  npx shadcn view @nebari/button
  ```

- **After installing, read the source** — components are copied into your repo
  as source you own. The exact `variant`/`size` names and props live in the
  component's `cva` block and its props type; open the installed `.tsx` (e.g.
  `@/components/ui/button.tsx`) — that file, not any doc, is authoritative.

## How Nebari components are built

Every component follows the same shape, so once you've seen one you can use any:

- Styled with **semantic theme tokens** (`bg-primary`, `text-muted-foreground`,
  …), so it follows light/dark automatically — never restyle with raw hex or
  `dark:` variants.
- Sets stable `data-slot` / `data-variant` / `data-size` attributes you can
  target in CSS or tests.
- Exports its `cva` class function (`buttonVariants`, `badgeVariants`, …)
  alongside the component for reuse.
- `variant` / `size` (where present) select the look; read the source for the
  exact set a given component offers.

`Button` is a representative example — variants, sizes, a `loading` state, and
`render`-prop composition:

```tsx
import { Button } from '@/components/ui/button';

<Button>Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive" loading loadingText="Deleting…">Delete</Button>
<Button size="icon" aria-label="Settings"><Settings /></Button>
```

Composed components (e.g. `Alert` with `AlertTitle` / `AlertDescription` /
`AlertAction`) export their parts as named exports from the same module — the
installed source and `shadcn view` show how the pieces fit together.

## Composition (Base UI `render` prop)

Polymorphic components (`Button`, `Badge`) use **Base UI's `render` prop** to
change the rendered element while keeping their styling — this is Nebari's
equivalent of Radix's `asChild`. Pass an element and the component merges its
classes, `data-*` attributes, and props onto it:

```tsx
// Render a Button as a link
<Button render={<a href="/docs" />}>Docs</Button>

// Render a Badge as a link
<Badge variant="outline" render={<a href="/tag/new" />}>new</Badge>
```

The component's `data-slot` and styling are preserved on the swapped element, so
a `<Button render={<a />}>` is still a fully-styled button that's semantically a
link.

## Theming

Install the theme once; it writes the Nebari brand color tokens and radius into
the app's global stylesheet as CSS variables for both light and dark modes:

```sh
npx shadcn add @nebari/theme
```

- Tokens are **semantic** (`--primary`, `--muted-foreground`, `--destructive`,
  `--info`, `--success`, `--warning`, `--border`, `--ring`, chart + sidebar
  tokens, …) and consumed in components via Tailwind utilities like
  `bg-primary` / `text-muted-foreground`. **Never** hard-code brand hex values or
  add `dark:` variants — the tokens flip automatically.
- **Light/dark:** the theme defines a `light` set on `:root` and a `dark` set;
  toggle by adding/removing the `.dark` class on an ancestor (typically `<html>`).
  Every Nebari component re-themes from the active token set with no per-component
  changes.
- **Fonts:** the tokens reference `Geist` (sans) and `IBM Plex Mono` (mono) but
  don't ship the webfonts. To actually load them, install and import them at the
  app entry point (otherwise they fall back to the system stacks):

  ```sh
  npm i @fontsource-variable/geist @fontsource/ibm-plex-mono
  ```

  ```ts
  import '@fontsource-variable/geist';
  import '@fontsource/ibm-plex-mono/400.css';
  import '@fontsource/ibm-plex-mono/500.css';
  ```

## Conventions when building with Nebari components

- Prefer composing the existing components and variants over restyling them; pass
  extra classes via `className` (it's merged with `cn()`, so your classes win).
- Reach for `render` when you need a different element (link button, etc.) rather
  than rewrapping.
- Use the semantic tokens for any custom styling so the result stays
  light/dark-correct and on-brand.
- Need a component that isn't in the catalog yet? Fall back to the upstream
  shadcn component, then style it with the same semantic tokens.
