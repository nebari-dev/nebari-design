# AGENTS.md

Guidance for coding agents working in **`@nebari/design`** — the Nebari design
system.

## What this repo is

A <a href="https://ui.shadcn.com/docs/registry">shadcn component registry</a>, **not** a
published component library. Components are distributed as **source** that
consumers copy into their own apps via `npx shadcn add @nebari/<name>`; the
registry JSON is served from GitHub Pages (`https://nebari-dev.github.io/nebari-design/r/`).
There is no compiled package output — do not add a library build step or try to
`npm publish` components.

The repo also still holds the project's **brand assets** (`logo-mark/`,
`symbol/`). Those are licensed CC BY-NC-ND — do not edit, regenerate, or relicense
them.

## Setup &amp; commands

The package manager is **Bun** (`bun@1.3.13`). Use `bun` / `bunx`, not npm/yarn,
to match CI and the lockfile.

```sh
bun install                 # install deps (CI uses --frozen-lockfile)

bun run storybook           # dev: Storybook on :6006 (component workbench)
bun run build:registry      # build registry.json + items into public/r
bun run build:pages         # full GitHub Pages build (Storybook → /, registry → /r)

bun run check               # Biome: format + lint + import order (check:fix to apply)
bun run ci                  # Biome in CI mode (no writes) — what CI runs
bunx tsc --noEmit           # type check
bun run test                # Vitest: unit + SSR + Storybook a11y
bun run test:coverage       # same, with coverage (80% gate on registry/nebari)
bun run test:watch          # Vitest watch
```

### Verification gate — run before declaring any change done

```sh
bun run build:registry
bun run check
bunx tsc --noEmit
bun run test
```

All four must pass. Let `bun run check:fix` own formatting and import ordering —
do not hand-format. CI (`.github/workflows/ci.yml`) runs the same sequence plus a
Playwright/Chromium install for the Storybook browser tests.

## Repo structure

```
registry/nebari/
  ui/<name>.tsx        # components (kebab-case filenames)
  hooks/<name>.ts      # shared non-visual logic (registry:hook)
  lib/utils.ts         # cn() helper
  globals.css          # theme source of truth: primitives + semantic tokens (light/.dark) + @theme inline
  skills/nebari-ui/    # CONSUMER skill, shipped via the registry (claude-skill item)
stories/<name>.stories.tsx   # Storybook stories — top-level, NOT co-located
tests/<name>.test.tsx        # Vitest tests — top-level, NOT co-located
.claude/skills/nebari-component/   # CONTRIBUTOR skill: how to author a component
registry.json          # registry manifest (one item per component/theme/lib)
components.json         # shadcn config (style base-vega, lucide icons, aliases)
logo-mark/ symbol/      # brand assets — do not modify
```

### Path alias

`@/*` resolves to `registry/nebari/*` (see `tsconfig.json` and `vitest.config.ts`).
So `@/ui/button` → `registry/nebari/ui/button.tsx`, `@/lib/utils` →
`registry/nebari/lib/utils.ts`. There is no `src/`.

## Authoring a component

The canonical, detailed recipe lives in **`.claude/skills/nebari-component/SKILL.md`**
— read it before adding or changing a component. A component is **four coordinated
edits**: the component file, a `registry.json` entry, a story, and a test. The
rules that are easy to get wrong:

- **Location &amp; naming.** Component at `registry/nebari/ui/<name>.tsx`
  (kebab-case). Story at `stories/<name>.stories.tsx` (CSF3), test at
  `tests/<name>.test.tsx` — both top-level, never co-located.
- **Storybook controls.** `Default` is the interactive playground: define the
  documented prop surface in meta `argTypes`, keep its knobs live, and do not
  narrow its controls. Seed every knob in meta `args` — boolean, number, and
  object controls render a click-to-reveal "Set …" button while their arg is
  `undefined`. Seed the component's own default unless that makes a dull
  playground, in which case seed the better opening state and let
  `table.defaultValue` carry the real one; where an unset prop is itself
  meaningful, model it as an explicit `auto` option mapped back to `undefined`
  (see drawer's `showSwipeHandle`).
  Every other story sets `parameters.controls.include` to the props that apply to
  it: express its subject through its own `args` rather than hardcoding it in the
  render, add the knobs the render leaves live, and drop what it fixes per
  instance or makes inert. `include: []` is for stories where nothing is
  adjustable — those take no `args` in their render either. Document consumer
  APIs that cannot be a knob — Base UI's `render`, `children` on a composed
  component, controlled-state props — with `control: false` plus a description,
  so they stay in the props table. Reserve `table: { disable: true }` for
  implementation plumbing and callbacks (`className`, `style`, `id`,
  `portalProps`, `onValueChange`, …). Composite stories use a local story-args
  type for props and story-only toggles spanning multiple subcomponents. No knob
  may be a no-op: args changes re-render without remounting, so key the story on
  any mount-only prop (`defaultChecked`, `defaultValue`, `defaultOpen`) you
  expose — via a meta decorator, not a `key` in every `render` — and leave its
  controlled counterpart (`checked`, `value`, `open`) as a docs-only row with
  `control: false`.
- **Variants via `cva`.** Define `variants` + `defaultVariants` and export the
  `*Variants` function alongside the component. Type props with
  `VariantProps<typeof xVariants>`.
- **Stable data hooks.** Set `data-slot="<name>"` on the root; when the component
  has variants, also emit `data-variant` and `data-size`. These are the
  consumer/test contract, independent of class names.
- **`cn()` merging.** Always `cn(xVariants({...}), className)` so a caller's
  `className` wins. Import `cn` from `@/lib/utils`.
- **Composition uses Base UI's `render` prop**, via `useRender` from
  `@base-ui/react/use-render` — this is the project's equivalent of
  Radix `asChild`. Do **not** introduce Radix or an `asChild` API. Give `render`
  a sensible default element and type with `useRender.ComponentProps<'tag'>`.
  Plain styled wrappers with no element-swapping can skip `useRender` and use
  `React.ComponentProps<'tag'>`.
- **Function components, named exports, no `forwardRef`.** React 19 passes `ref`
  as a normal prop and Base UI threads it through.
- **Must be SSR-safe** — there's a dedicated SSR test project (Node, no DOM) that
  renders every `registry:ui` item and imports every `registry:hook` file.

### `registry.json` entry

- `dependencies` = npm packages the component imports (e.g.
  `@base-ui/react`, `class-variance-authority`, `lucide-react`). Do
  **not** list `react`/`react-dom`, `tailwindcss`, or `clsx`/`tailwind-merge`
  (those belong to the `utils` item).
- `registryDependencies` = other registry items. Anything that calls `cn()` must
  list `"@nebari/utils"`; if it depends on tokens that may be absent, also list
  `"@nebari/theme"`. **Reference in-repo items by their `@nebari/<name>`
  namespace, not by bare name** — the shadcn CLI resolves a bare `"theme"`
  against the default registry's `styles/<style>/theme.json` (a 404 that aborts
  `shadcn add` for consumers), whereas `"@nebari/theme"` resolves through the
  `@nebari` registry the consumer already has configured.

## Styling &amp; theming

- **Semantic tokens only.** Style with theme tokens via Tailwind utilities
  (`bg-primary`, `text-muted-foreground`, `border-input`, `ring-ring`, plus
  `info` / `success` / `warning` / `destructive`, chart, and sidebar tokens).
- **Surface stack.** Four distinct background layers, in stacking order:
  `--canvas` (page) → `--header` (app chrome — top bar, sidebar, toolbars, table
  headers; `--sidebar` is the same layer) → `--card` / `--popover` (raised;
  popovers share the card fill and read as raised via elevation) → `--muted`
  (recessed — only *inside* a card or chrome: input fills, zebra rows,
  slider/progress tracks, disabled states). Keep adjacent layers distinct — a
  fill that matches the surface under it is invisible. Muted text on `--muted`
  must use `text-muted-foreground-strong`, not `text-muted-foreground`.
  `--background` mirrors Figma's deprecated `background/default` and is kept for
  backwards compatibility; prefer `bg-canvas` for new page shells.
- **Never hard-code brand hex values, and never add `dark:` variants.** Tokens
  are defined for `:root` and `.dark` in `registry/nebari/globals.css`; toggling
  the `.dark` class on an ancestor re-themes every component automatically.
- **New tokens** go in `globals.css` as semantic CSS variables for *both* light
  and dark — don't invent a token unless a design genuinely needs one. The OKLCH
  brand scale mirrors the Figma variables; keep code and Figma in sync rather
  than free-handing colors. Semantic values are literal oklch with the primitive
  named in a trailing comment (the shadcn CLI can only ship literals), exposed to
  Tailwind via `--color-<name>: var(--<name>)` in `@theme inline`.
- **`globals.css` is the CLI's canonical output.** Keep exactly one `:root`,
  one `.dark`, and one `@theme inline` (which also holds fonts, radius steps,
  motion tokens, and `@keyframes`) — that is the shape `shadcn add` writes, so
  re-applying `@nebari/theme` to it is a no-op (#151). The `theme` item in
  `registry.json` is *derived* from this file: after editing tokens run
  `bun run sync:theme`. `tests/theme.test.ts` fails on drift and runs the real
  CLI against a throwaway consumer to prove the apply is idempotent.
- **Fonts** (`Geist`, `IBM Plex Mono`) are referenced by tokens but not shipped
  to consumers; the consumer skill documents installing the `@fontsource`
  packages.
- Tailwind is **v4** via `@tailwindcss/vite` (no `tailwind.config` — config is in
  CSS). Note: Biome does **not** format `.css` or `.svg` files (they're excluded).

## Motion &amp; animation

Motion tokens (`--duration-*`, `--ease-*`) and entrance animation utilities
(`--animate-*` / `@keyframes`) are shipped as part of the `theme` item in
`registry.json` and defined in `globals.css`.

**Add motion where it carries meaning, not everywhere.** Animate components that
change state or position the user should perceive — interactive controls
(hover/focus/press feedback), overlays that mount/unmount (enter/exit), and
status/async indicators (spinner, skeleton, progress). Leave static structure
and content primitives (`label`, `field`, separators, typography, plain
containers) still, beyond any focus-ring transition they inherit. When unsure,
ask whether something the user did — or something that changed — warrants
visible feedback; if not, no motion is the right answer. The `nebari-component`
skill's Motion section has the full per-component rubric.

Once you've decided a component should move, follow these rules:

- **Always gate on `motion-safe:`.** Every animation or transition class must
  be prefixed: `motion-safe:animate-fade-in`, `motion-safe:transition-transform`.
  This respects the `prefers-reduced-motion` media query (WCAG 2.1 SC 2.3.3).
- **Use tokens, never hardcode durations or easing.** Reference
  `var(--duration-fast/base/slow)` and `var(--ease-standard/emphasized)` in
  custom CSS. Use the pre-built Tailwind `animate-*` utilities where possible.
- **Reference motion tokens with Tailwind v4 paren syntax.** In class names it
  is `motion-safe:duration-(--duration-fast)` and
  `motion-safe:ease-(--ease-standard)` — parentheses, not brackets. Tailwind v3's
  `duration-[--duration-fast]` compiles to an invalid value in v4, so
  `transition-duration` silently computes to `0s` and the transition is dead. The
  failure produces no build error, lint warning, or test failure, so CI greps for
  the bracket form; see `.github/workflows/ci.yml`.
- **Animate `opacity` and `transform` only.** Layout properties (`height`,
  `width`, `padding`, `margin`) force reflows — never animate them.
- **`cn()` / tailwind-merge gotcha.** When adding `transition-*` classes via
  `className`, tailwind-merge deduplicates against classes already in the
  component's `cva` block. Re-enumerate every transition property explicitly
  (e.g. `transition-[color,background-color,transform]`) so nothing is
  silently dropped.
- **Adding new motion tokens.** New `@keyframes` and timing variables go in
  `globals.css` **inside `@theme inline`** — the shadcn CLI writes keyframes
  there and deduplicates only there — then run `bun run sync:theme` to
  regenerate the `theme` item so `shadcn add @nebari/theme` ships them.
- **JS animation.** Use the Motion library via Base UI's `render` prop as the
  escape hatch when CSS transitions are insufficient. Do not add Motion as a
  default `dependency` in any `registry.json` entry.

## Testing

Vitest runs three projects (`vitest.config.ts`):

1. **unit** (jsdom) — `tests/**/*.test.tsx`, excluding the SSR test.
2. **ssr** (Node, no jsdom) — renders every `registry:ui` component to catch
   browser-only access at import/render time, and imports every `registry:hook`
   file to catch it at module scope. Hooks also get a hand-written render probe
   there; a new `registry:hook` item must add its own.
3. **storybook** (real Chromium via Playwright) — runs every story with the a11y
   addon; **axe violations fail the run**.

Coverage threshold is **80%** (lines/functions/branches/statements) over
`registry/nebari/**`. Exercise every variant branch you add. Test behavior, the
`data-variant`/`data-size` attributes, and `render`-prop composition (assert
`data-slot` is preserved on the swapped element).

## Code style (Biome 2.5)

Enforced by `biome.json` — don't fight it, run `bun run check:fix`:

- 2-space indent, LF, 80-col line width.
- JS: single quotes, **double quotes in JSX**, semicolons always, trailing commas
  everywhere, always-parenthesized arrow params.
- Imports are auto-organized — write them in any order and let Biome sort.

## Two skills, two audiences

- `.claude/skills/nebari-component` — **contributor** recipe for authoring
  registry components (the source of truth for the conventions above).
- `registry/nebari/skills/nebari-ui` — **consumer** skill, shipped as the
  `claude-skill` registry item, covering install, discovery, composition, and
  theming for apps adopting Nebari.

When you change a convention (a new data attribute, a composition rule, a token),
update the relevant skill so it doesn't drift from the code.

## Don'ts

- Don't add a library/bundle build or publish components to npm — they ship as
  registry source.
- Don't use Radix or `asChild`; use Base UI `useRender`.
- Don't hard-code colors or add `dark:` variants; use semantic tokens.
- Don't hard-code animation durations or easing — use `--duration-*` / `--ease-*` token vars and always gate with `motion-safe:`.
- Don't write `duration-[--token]` / `ease-[--token]`; Tailwind v4 needs the paren form `duration-(--token)` / `ease-(--token)` or the transition silently dies.
- Don't co-locate stories/tests with components.
- Don't hand-format or manually order imports; Biome owns that.
- Don't edit `logo-mark/` or `symbol/` brand assets.
- Don't use npm/yarn; use Bun.
