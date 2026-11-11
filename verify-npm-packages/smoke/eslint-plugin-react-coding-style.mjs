import { Linter } from 'eslint';
import { eslintPluginReactCodingStyle } from 'eslint-plugin-react-coding-style';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginReactCodingStyle;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

// Run one rule, so that a rule module whose dependencies did not install fails
// here rather than in a consumer's lint.
const messages = new Linter({ configType: 'flat' }).verify(
  "import React from 'react';\nexport const x = React;\n",
  [
    {
      plugins: { 'react-coding-style': plugin },
      rules: {
        'react-coding-style/import-style': [
          'error',
          { importStyle: 'namespace' },
        ],
      },
    },
  ],
  { filename: 'src/file.mjs' },
);

assert.deepStrictEqual(
  messages.map((m) => m.ruleId),
  ['react-coding-style/import-style'],
);

console.info('eslint-plugin-react-coding-style ok');
