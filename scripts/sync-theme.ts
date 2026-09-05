/**
 * Regenerates the `theme` item's `css` and `cssVars` in `registry.json` from
 * `registry/nebari/globals.css`. Run `bun run sync:theme` after editing tokens;
 * `tests/theme.test.ts` fails when the two are out of sync.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveThemeItem } from './derive-theme-item';

const root = resolve(import.meta.dirname, '..');
const registryPath = resolve(root, 'registry.json');
const globals = readFileSync(
  resolve(root, 'registry/nebari/globals.css'),
  'utf8',
);
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

const item = registry.items.find((i: { name: string }) => i.name === 'theme');
if (!item) throw new Error('registry.json has no `theme` item');

const derived = deriveThemeItem(globals);
item.css = derived.css;
item.cssVars = derived.cssVars;

writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log('registry.json: theme item synced from globals.css');
