<img alt="Nebari horizontal logo mark - black text" src="./logo-mark/horizontal/Nebari-Logo-Horizontal-Lockup.svg#gh-light-mode-only" height="150" />

<img alt="Nebari horizontal logo mark - white text" src="./logo-mark/horizontal/Nebari-Logo-Horizontal-Lockup-White-text.svg#gh-dark-mode-only" height="150" />

# Nebari design assets

🎨 This repository contains the design assets for the Nebari project

The assets are available in two formats (PNG & SVG) and in three layouts --
[horizontal (also known as landscape format)](./logo-mark/), [stacked (which is closer to square)](./logo-mark/),
and [symbol (which does not include the name and is square)](./symbol/), and at least 3 versions (color, white text, & colored background).

You can find the assets in the following locations:

- [Nebari Symbol](./symbol/)
- [Nebari horizontal logo mark](./logo-mark/horizontal/)
- [Nebari stacked logo mark](./logo-mark/stacked/)
- [Nebari logo mark with colored backgrounds](./logo-mark/colored-background/)

## Component registry

This repository is also a [shadcn](https://ui.shadcn.com/) component registry. Components
are styled with the Nebari brand and can be installed into any shadcn-based project.

### Install

```sh
npx shadcn add @nebari/<name>
```

For example, to install the shared `cn()` utility and the Nebari theme tokens:

```sh
npx shadcn add @nebari/utils
npx shadcn add @nebari/theme
```

### Registry layout

| Path                          | Purpose                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `registry.json`               | Registry manifest — the source of truth for installable items.      |
| `registry/nebari/ui/`         | UI components (`registry:ui`).                                       |
| `registry/nebari/lib/`        | Shared library code, including the `cn()` helper (`registry:lib`).   |
| `registry/nebari/globals.css` | Tailwind v4 `@theme` token mapping.                                  |
| `public/r/`                   | Built, installable JSON artifacts produced by `build:registry`.     |

### Development

This project uses [Bun](https://bun.sh/), [TypeScript](https://www.typescriptlang.org/),
and [Tailwind CSS v4](https://tailwindcss.com/). The `@/*` path alias resolves to
`registry/nebari`.

```sh
bun install          # install dependencies
bun run build:registry   # build the registry into public/r
```

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
