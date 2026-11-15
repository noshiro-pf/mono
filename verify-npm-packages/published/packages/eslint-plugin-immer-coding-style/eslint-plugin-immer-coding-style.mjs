import { Linter } from 'eslint';
import { eslintPluginImmerCodingStyle } from 'eslint-plugin-immer-coding-style';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginImmerCodingStyle;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

// Run one rule, so that a rule module whose dependencies did not install fails
// here rather than in a consumer's lint.
const messages = new Linter({ configType: 'flat' }).verify(
  "import { produce } from 'immer';\nexport const next = produce({ a: 1 }, (draft) => {\n  draft.a = 2;\n});\n",
  [
    {
      plugins: { 'immer-coding-style': plugin },
      rules: { 'immer-coding-style/mut-prefixed-draft': 'error' },
    },
  ],
  { filename: 'src/file.mjs' },
);

assert.deepStrictEqual(
  messages.map((m) => m.ruleId),
  ['immer-coding-style/mut-prefixed-draft'],
);

console.info('eslint-plugin-immer-coding-style ok');
