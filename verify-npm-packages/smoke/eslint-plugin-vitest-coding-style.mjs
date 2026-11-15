import { Linter } from 'eslint';
import { eslintPluginVitestCodingStyle } from 'eslint-plugin-vitest-coding-style';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginVitestCodingStyle;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

// Run one rule, so that a rule module whose dependencies did not install fails
// here rather than in a consumer's lint.
const messages = new Linter({ configType: 'flat' }).verify(
  'assert(x);\n',
  [
    {
      plugins: { 'vitest-coding-style': plugin },
      rules: {
        'vitest-coding-style/prefer-assert-is-true-over-assert': 'error',
      },
    },
  ],
  { filename: 'src/file.mjs' },
);

assert.deepStrictEqual(
  messages.map((m) => m.ruleId),
  ['vitest-coding-style/prefer-assert-is-true-over-assert'],
);

console.info('eslint-plugin-vitest-coding-style ok');
