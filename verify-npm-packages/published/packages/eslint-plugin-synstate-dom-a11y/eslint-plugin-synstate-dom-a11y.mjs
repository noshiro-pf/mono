// cspell:ignore buton

import { Linter } from 'eslint';
import { eslintPluginSynstateDomA11y } from 'eslint-plugin-synstate-dom-a11y';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginSynstateDomA11y;

assert.equal(Object.keys(plugin.rules).includes('aria-role'), true);
assert.equal(typeof plugin.configs.recommended, 'object');

// Run the preset on JSX, so that jsx-a11y and the wrapper's own dependencies
// are loaded and a misspelt role bound through `constant` is still reported.
const messages = new Linter({ configType: 'flat' }).verify(
  [
    "import { constant } from 'synstate-dom';",
    '',
    "export const C = () => <div role={constant('buton')} />;",
    '',
  ].join('\n'),
  [{ files: ['**/*.jsx'] }, plugin.configs.recommended],
  { filename: 'component.jsx' },
);

assert.deepStrictEqual(
  messages.map((m) => m.ruleId),
  ['synstate-dom-a11y/aria-role'],
);

console.info('eslint-plugin-synstate-dom-a11y ok');
