<!-- <img alt="Nebari horizontal logo mark - black text" src="./logo-mark/horizontal/Nebari-Logo-Horizontal-Lockup.svg#gh-light-mode-only" height="150" />

<img alt="Nebari horizontal logo mark - white text" src="./logo-mark/horizontal/Nebari-Logo-Horizontal-Lockup-White-text.svg#gh-dark-mode-only" height="150" /> -->

# Nebari design

🎨 This repository is a [shadcn](https://ui.shadcn.com/) component registry styled
with the Nebari brand, and the home of the Nebari project's design assets.

## Component registry

Components are styled with the Nebari brand and can be installed into any
shadcn-based project.

### Install

Register the `@nebari` namespace once in your project's `components.json` so the
`shadcn` CLI knows where to resolve `@nebari/<name>` items:

```json
{
  "registries": {
    "@nebari": "https://nebari-dev.github.io/nebari-design/r/{name}.json"
  }
}
```

Then add any item:

```sh
npx shadcn add @nebari/<name>
```

For example, to install the shared `cn()` utility and the Nebari theme tokens:

```sh
npx shadcn add @nebari/utils
npx shadcn add @nebari/theme
```

### Fonts

The theme tokens in `registry/nebari/globals.css` set `--font-sans` to
[**Geist**](https://vercel.com/font) and `--font-mono` to
[**IBM Plex Mono**](https://www.ibm.com/plex/). The theme only _references_ these
families — install the webfonts in your app so they actually load:

```sh
npm i @fontsource-variable/geist @fontsource/ibm-plex-mono
```

Then import them once at your app's entry point:

```ts
import '@fontsource-variable/geist';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
```

Skip this and the tokens gracefully fall back to the system `sans-serif` /
`monospace` stacks.

### Claude Code skill for consumers

If you build your app with [Claude Code](https://docs.claude.com/en/docs/claude-code/skills),
install the Nebari UI skill into your project so the assistant knows how to set
up the registry, which components exist, and how to use and theme them:

```sh
npx shadcn add @nebari/claude-skill
```

This drops a skill at `.claude/skills/nebari-ui/SKILL.md` in your repo (distinct
from the contributor authoring skill below, which lives in _this_ repo). Once
installed it auto-triggers on requests like "add the nebari button" or "build a
form with nebari components", and stays current through the same `shadcn add`
flow as the components themselves.

### Registry layout

| Path                          | Purpose                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `registry.json`               | Registry manifest — the source of truth for installable items.      |
| `registry/nebari/ui/`         | UI components (`registry:ui`).                                       |
| `registry/nebari/lib/`        | Shared library code, including the `cn()` helper (`registry:lib`).   |
| `registry/nebari/globals.css` | Tailwind v4 `@theme` token mapping.                                  |
| `registry/nebari/skills/`     | Consumer-facing Claude Code skills (`registry:file`).               |
| `public/r/`                   | Built, installable JSON artifacts produced by `build:registry`.     |

### Authoring components

This repo ships a [Claude Code skill](https://docs.claude.com/en/docs/claude-code/skills)
at `.claude/skills/nebari-component/` that encodes the house recipe for adding a
component to the registry — the component file pattern (`cva` variants,
`data-slot` attributes, `cn()` merging, Base UI `render`-prop composition), the
`registry.json` entry shape, story and test templates, and the verification gate.
Any contributor using Claude Code gets it automatically; invoke it with
`/nebari-component` or just ask to "add a `<X>` component to the registry".

### Design-to-code with Figma

Because the Nebari brand and components originate in design, we recommend
installing the [Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
when working on registry components with an AI coding assistant. It lets the
assistant read a Figma frame's layout, styles, and design tokens directly,
so generated components stay faithful to the source design and aligned with
the Nebari brand colors and fonts. Pair it with the `/nebari-component` skill
above: pull the design context from Figma, then scaffold the component using
the house recipe.

### Development

This project uses [Bun](https://bun.sh/), [TypeScript](https://www.typescriptlang.org/),
and [Tailwind CSS v4](https://tailwindcss.com/). The `@/*` path alias resolves to
`registry/nebari`.

```sh
bun install          # install dependencies
bun run build:registry   # build the registry into public/r
```

### Storybook

Storybook is the local workbench for registry components and the published docs
site for this repo. Run it with Bun:

```sh
bun run storybook
```

The dev server runs at <http://localhost:6006>. Stories live in the top-level
`stories/` directory, including MDX docs pages and component stories named
`*.stories.tsx`. Storybook uses the same Tailwind v4 setup and `@/*` alias as the
registry source, so imports resolve the same way they do in tests and builds.

The preview loads the Nebari theme tokens and webfonts, enables autodocs for
every component, and includes a toolbar switcher for light and dark themes.
The a11y addon runs axe checks in the UI and fails the Storybook Vitest project
when violations are found.

```sh
bun run test:storybook   # render every story in Chromium with a11y checks
bun run build:storybook  # build the static Storybook site into public/
bun run build:pages      # build Storybook plus registry JSON for GitHub Pages
```

The deployed Storybook site is served from
<https://nebari-dev.github.io/nebari-design/>. The installable registry JSON is
served from the same Pages build under `/r/`.

### Testing

Components are tested with [Vitest](https://vitest.dev/),
[Testing Library](https://testing-library.com/docs/react-testing-library/intro/),
and `jsdom`. Vitest reuses the same `@vitejs/plugin-react`, Tailwind, and `@` →
`registry/nebari` alias setup as the registry and Storybook, so tests resolve
imports exactly like the app does.

```sh
bun run test            # run the suite once
bun run test:watch      # watch mode
bun run test:coverage   # run with a coverage report
```

Test files live in the top-level `tests/` directory (mirroring `stories/`),
named `*.test.ts` / `*.test.tsx`. Coverage of `registry/nebari` is enforced at a
minimum of 80%.

## Design assets

This repository also contains the design assets for the Nebari project.

The assets are available in two formats (PNG & SVG) and in three layouts --
[horizontal (also known as landscape format)](./logo-mark/), [stacked (which is closer to square)](./logo-mark/),
and [symbol (which does not include the name and is square)](./symbol/), and at least 3 versions (color, white text, & colored background).

You can find the assets in the following locations:

- [Nebari Symbol](./symbol/)
- [Nebari horizontal logo mark](./logo-mark/horizontal/)
- [Nebari stacked logo mark](./logo-mark/stacked/)
- [Nebari logo mark with colored backgrounds](./logo-mark/colored-background/)

## Nebari brand

The Nebari brand uses the following primary colors:

- Yellow: #EAB54E
- Green: #20AAA1
- Purple: #BA18DA
- Black: #0F1015

And, the following fonts:

- [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible)
- [Poppins](https://fonts.google.com/specimen/Poppins)

## Software used

The application used to create this artwork is Adobe Illustrator.

## Acknowledgements

The original designs were created by the very talented [Irina Fumarel](https://irinafumarel.ro/) 💜.

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/StillImage" property="dct:title" rel="dct:type">All Nebari design assets </span> by the <a xmlns:cc="http://creativecommons.org/ns#" href="https://nebari.dev" property="cc:attributionName" rel="cc:attributionURL">Nebari dev team</a> are licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>.<br /> Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="https://github.com/nebari-dev/nebari-design" rel="dct:source">https://github.com/nebari-dev/nebari-design</a>.
