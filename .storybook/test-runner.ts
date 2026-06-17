import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';

/**
 * Runs axe-core against every story headlessly via the Storybook test runner,
 * failing the run on any accessibility violation. Mirrors the interactive
 * `@storybook/addon-a11y` panel and respects the same per-story `a11y`
 * parameters (`disable`, `config.rules`, `element`), so a story can opt out or
 * tune rules in one place for both the UI and CI.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    // Honor a story-level opt-out: `parameters: { a11y: { disable: true } }`.
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });

    const element = storyContext.parameters?.a11y?.element ?? '#storybook-root';
    await checkA11y(page, element, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
