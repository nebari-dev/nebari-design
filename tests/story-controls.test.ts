import type { Meta, StoryObj } from '@storybook/react-vite';
import { describe, expect, it } from 'vitest';

/**
 * Guards the Storybook controls convention documented in
 * `.claude/skills/nebari-component/SKILL.md` Step 3.
 *
 * This matters because Storybook's react-docgen surfaces nothing beyond what a
 * story declares — meta `argTypes` *is* the props table. Without this test, a
 * new prop, a story missing `controls.include`, or a typo in an `include` list
 * all fail silently.
 *
 * Not covered here:
 * - **cva variant drift, and omitted props generally.** `cva()` does not expose
 *   its config at runtime and docgen yields nothing, so there is no source of
 *   truth for "the full prop surface" to diff against. A prop that is simply
 *   never declared cannot be detected. The uncontrolled/controlled pairing
 *   check below closes the one sub-case that has a derivable expectation.
 * - **Whether a render actually *uses* the args it receives.** Arity is
 *   checkable (below); use is not. A render taking `args` and ignoring them
 *   stays a review-time concern.
 * - **The inverse — a fixed showcase reading args it cannot expose.** Not
 *   separable from the legitimate case: a `controls.include: []` showcase may
 *   still spread baseline meta args into each hardcoded instance (see
 *   `Variants` in `stories/button.stories.tsx`), which is the documented
 *   pattern. Arity cannot distinguish the two.
 * - **Rule 7 (mount-only props keyed to force a remount).** Not detectable
 *   statically; verified by hand in the Storybook UI.
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
    // Rule 4: baseline meta args are fine, per-story args are not — they would
    // pin a knob the playground is supposed to leave live.
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
    // Rule 7: if `defaultChecked` is a knob, `checked` must at least be a
    // docs-only row — consumers need to know the controlled prop exists.
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
