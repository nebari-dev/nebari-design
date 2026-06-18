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

## Component catalog

Every component is styled with semantic theme tokens (so it follows light/dark
automatically) and sets stable `data-slot` / `data-variant` / `data-size`
attributes you can target in CSS or tests. `*Variants` (the `cva` class
function) is exported alongside each component for reuse.

| Item      | Install                          | Exports                                                       |
| --------- | -------------------------------- | ------------------------------------------------------------- |
| `utils`   | `shadcn add @nebari/utils`       | `cn()` — clsx + tailwind-merge helper                         |
| `theme`   | `shadcn add @nebari/theme`       | Brand color tokens + radius for light & dark                  |
| `spinner` | `shadcn add @nebari/spinner`     | `Spinner`, `spinnerVariants`                                  |
| `button`  | `shadcn add @nebari/button`      | `Button`, `buttonVariants`                                    |
| `badge`   | `shadcn add @nebari/badge`       | `Badge`, `badgeVariants`                                      |
| `alert`   | `shadcn add @nebari/alert`       | `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`, `alertVariants` |

### Button

- **variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **sizes:** `xs`, `sm`, `default`, `lg`, and icon-only `icon-xs`, `icon-sm`, `icon`, `icon-lg`
- **extra props:** `loading` (shows a `Spinner`, sets `aria-busy`, disables the
  button), `loadingText` (label shown beside the spinner while loading), plus all
  native `<button>` props and `render` (see [Composition](#composition-base-ui-render-prop)).

```tsx
import { Button } from '@/components/ui/button';

<Button>Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive" loading loadingText="Deleting…">Delete</Button>
<Button size="icon" aria-label="Settings"><Settings /></Button>
```

### Badge

- **variants:** `default`, `secondary`, `destructive`, `outline`, `ghost`
- A small status/label chip. Supports `render` for link/button composition.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>New</Badge>
<Badge variant="secondary">Draft</Badge>
```

### Alert

- **variants:** `default`, `info`, `success`, `warning`, `destructive`
- Compose with `Alert` + `AlertTitle` + `AlertDescription`, and optionally
  `AlertAction` (pinned top-right, e.g. a dismiss button). Drop a `lucide-react`
  icon as the **first child** of `Alert` to get the leading-icon layout.
- The root is an ARIA live region: `role="alert"` (assertive) for
  `warning`/`destructive`, `role="status"` (polite) otherwise. Override with `role`.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CircleCheck } from 'lucide-react';

<Alert variant="success">
  <CircleCheck />
  <AlertTitle>Saved</AlertTitle>
  <AlertDescription>Your changes are live.</AlertDescription>
</Alert>
```

### Spinner

- **sizes:** `xs`, `sm`, `default`, `lg`, `xl`
- **props:** `label` (accessible name, defaults to `"Loading"`), plus lucide icon props.
- `role="status"`. `Button`'s `loading` state uses it internally; size `default`
  inherits the parent's icon sizing.

```tsx
import { Spinner } from '@/components/ui/spinner';

<Spinner />
<Spinner size="lg" label="Fetching results" />
```

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
