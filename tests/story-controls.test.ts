import type { Meta, StoryObj } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';

/**
 * Guards the Storybook controls convention documented in
 * `.claude/skills/nebari-component/SKILL.md` Step 3. Storybook's react-docgen
 * surfaces nothing beyond what a story declares — meta `argTypes` *is* the props
 * table — so without this test a missing `controls.include` or a typo in an
 * `include` list fails silently.
 *
 * Review-time concerns, not statically derivable: an omitted prop (`cva()` does
 * not expose its config at runtime, so there is no full prop surface to diff
 * against), whether a render *uses* the args it takes, whether an `include` list
 * is the right set, and rule 8's remount keying.
 */

type StoryModule = {
  default?: Meta<unknown>;
  [name: string]: unknown;
};

const modules = import.meta.glob<StoryModule>('../stories/*.stories.tsx', {
  eager: true,
});

/** Only `Components/*` stories follow the convention; Foundations pages don't. */
const componentStories = Object.entries(modules)
  .map(([path, mod]) => ({ path: path.replace('../', ''), mod }))
  .filter(({ mod }) => mod.default?.title?.startsWith('Components/'))
  .sort((a, b) => a.path.localeCompare(b.path));

type Story = StoryObj<unknown> & {
  args?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
  render?: (...args: unknown[]) => unknown;
  parameters?: { controls?: { include?: unknown } };
};

/**
 * A `render` declared as `() => …` cannot receive args, so any control the story
 * exposes is unreachable. `undefined` means the component renders with args
 * directly, which is always fine.
 */
function renderArity(story: Story): number | undefined {
  return typeof story.render === 'function' ? story.render.length : undefined;
}

function getStories(mod: StoryModule): [string, Story][] {
  return Object.entries(mod).filter(
    ([name, value]) =>
      name !== 'default' &&
      name !== '__namedExportsOrder' &&
      typeof value === 'object' &&
      value !== null,
  ) as [string, Story][];
}

/**
 * Controls that render a click-to-reveal setter button ("Set boolean", "Set
 * number", "Set object") instead of a widget when their arg is `undefined`.
 * Meta must seed these so every panel opens with populated controls.
 */
const SETTER_BUTTON_CONTROLS = new Set(['boolean', 'number', 'object']);

/** `control` is either a shorthand string, an object with a `type`, or `false`. */
function controlType(argType: unknown): string | undefined {
  const { control } = (argType ?? {}) as { control?: unknown };

  if (typeof control === 'string') {
    return control;
  }

  if (control && typeof control === 'object') {
    const { type } = control as { type?: unknown };
    return typeof type === 'string' ? type : undefined;
  }

  return undefined;
}

/**
 * `controls.include` is matched by Storybook against `argType.name || key`. No
 * story sets a custom `name`, so comparing keys is correct — revisit if one does.
 */
function documentedProps(mod: StoryModule, story: Story): Set<string> {
  return new Set([
    ...Object.keys(mod.default?.argTypes ?? {}),
    ...Object.keys(story.argTypes ?? {}),
  ]);
}

it('finds every component story', () => {
  // Fails loudly if the glob breaks rather than silently asserting nothing.
  expect(componentStories.length).toBeGreaterThanOrEqual(23);
});

describe.each(componentStories)('$path', ({ mod }) => {
  const stories = getStories(mod);

  it('exports a Default playground', () => {
    expect(stories.map(([name]) => name)).toContain('Default');
  });

  it('leaves the Default playground controls unnarrowed', () => {
    const [, story] = stories.find(([name]) => name === 'Default') ?? [];
    expect(story?.parameters?.controls).toBeUndefined();
  });

  it('fixes no props in the Default playground args', () => {
    // Baseline meta args are fine; per-story args would pin a live knob.
    const [, story] = stories.find(([name]) => name === 'Default') ?? [];
    expect(Object.keys(story?.args ?? {})).toEqual([]);
  });

  it('routes every exposed control into the render', () => {
    const unreachable = stories
      .filter(([, story]) => {
        const include = story.parameters?.controls?.include;
        return Array.isArray(include) && include.length > 0;
      })
      .filter(([, story]) => renderArity(story) === 0)
      .map(([name]) => name);

    expect(unreachable).toEqual([]);
  });

  it('seeds every knob whose control would otherwise need a click', () => {
    // Where `undefined` is itself a meaningful state, the knob models it as an
    // explicit `auto` option — see `showSwipeHandle` in drawer, `role` in alert.
    const argTypes = mod.default?.argTypes ?? {};
    const args = (mod.default?.args ?? {}) as Record<string, unknown>;

    const unseeded = Object.entries(argTypes)
      .filter(([, argType]) =>
        SETTER_BUTTON_CONTROLS.has(controlType(argType) ?? ''),
      )
      .filter(([prop]) => args[prop] === undefined)
      .map(([prop]) => prop);

    expect(unseeded).toEqual([]);
  });

  it('exposes every prop a story pins in its own args', () => {
    // Otherwise the reader cannot tell what makes the story different.
    const offenders = stories
      .filter(([name]) => name !== 'Default')
      .flatMap(([name, story]) => {
        const include = story.parameters?.controls?.include;

        if (!Array.isArray(include)) {
          return [];
        }

        return Object.keys(story.args ?? {})
          .filter((prop) => !include.includes(prop))
          .map((prop) => `${name}: ${prop}`);
      });

    expect(offenders).toEqual([]);
  });

  it('leaves no args-consuming story without a control', () => {
    // A story that genuinely fixes everything should take no args at all.
    const dead = stories
      .filter(([name]) => name !== 'Default')
      .filter(([, story]) => (renderArity(story) ?? 0) > 0)
      .filter(([, story]) => {
        const include = story.parameters?.controls?.include;
        return Array.isArray(include) && include.length === 0;
      })
      .map(([name]) => name);

    expect(dead).toEqual([]);
  });

  it('narrows controls on every non-Default story', () => {
    const offenders = stories
      .filter(([name]) => name !== 'Default')
      .filter(
        ([, story]) => !Array.isArray(story.parameters?.controls?.include),
      )
      .map(([name]) => name);

    expect(offenders).toEqual([]);
  });

  it('only includes props that are documented in argTypes', () => {
    const unknownProps = stories.flatMap(([name, story]) => {
      const include = story.parameters?.controls?.include;
      if (!Array.isArray(include)) {
        return [];
      }

      const documented = documentedProps(mod, story);
      return include
        .filter((prop): prop is string => typeof prop === 'string')
        .filter((prop) => !documented.has(prop))
        .map((prop) => `${name}: ${prop}`);
    });

    expect(unknownProps).toEqual([]);
  });

  it('documents the controlled counterpart of every uncontrolled default', () => {
    // Consumers need to know the controlled prop exists.
    const argTypes = mod.default?.argTypes ?? {};
    const missing = Object.keys(argTypes)
      .map((key) => /^default([A-Z]\w*)$/.exec(key))
      .filter((match): match is RegExpExecArray => match !== null)
      .map(([, suffix]) => suffix[0].toLowerCase() + suffix.slice(1))
      .filter((counterpart) => !(counterpart in argTypes));

    expect(missing).toEqual([]);
  });

  it('describes every prop left visible in the props table', () => {
    const argTypes = (mod.default?.argTypes ?? {}) as Record<
      string,
      { description?: string; table?: { disable?: boolean } }
    >;

    const undocumented = Object.entries(argTypes)
      .filter(([, argType]) => argType?.table?.disable !== true)
      .filter(([, argType]) => !argType?.description?.trim())
      .map(([prop]) => prop);

    expect(undocumented).toEqual([]);
  });
});
