import { Linter } from 'eslint';
import { eslintPluginTsRestrictions } from 'eslint-plugin-ts-restrictions';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginTsRestrictions;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

// The two rules that wrap another plugin's stay in eslint-config-typed, so
// that this package does not depend on that plugin.
assert.equal('prefer-catch' in plugin.rules, false);
assert.equal('prefer-global-this' in plugin.rules, false);

// Run one rule that needs no type information, so that a rule module whose
// dependencies did not install fails here rather than in a consumer's lint.
const messages = new Linter({ configType: 'flat' }).verify(
  'export const inRange = (x) => x >= 0 && 10 >= x;\n',
  [
    {
      plugins: { 'ts-restrictions': plugin },
      rules: { 'ts-restrictions/prefer-range-in-number-line-order': 'error' },
    },
  ],
  { filename: 'in-range.mjs' },
);

assert.deepStrictEqual(
  messages.map((m) => m.ruleId),
  ['ts-restrictions/prefer-range-in-number-line-order'],
);

console.info('eslint-plugin-ts-restrictions ok');
