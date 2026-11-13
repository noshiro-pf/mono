import { Linter } from 'eslint';
import { eslintPluginTsUiRestrictions } from 'eslint-plugin-ts-ui-restrictions';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginTsUiRestrictions;

assert.deepStrictEqual(Object.keys(plugin.rules).toSorted(), [
  'jsx-boolean-logical-operands',
  'require-ime-guard',
]);
assert.equal(typeof plugin.configs.recommended, 'object');

// Both rules read type information, which this project has no TypeScript
// parser to give. Importing the package has already loaded both rule modules,
// so a missing dependency fails above; running one here checks that a rule
// asks for that information rather than reporting nothing. The pattern is
// typescript-eslint's wording: without a TypeScript parser there is no signal
// of our own to match, and a rewording fails here, naming this package.
assert.throws(
  () =>
    new Linter({ configType: 'flat' }).verify(
      "export const onKeyDown = (e) => e.key === 'Enter';\n",
      [
        {
          plugins: { 'ts-ui-restrictions': plugin },
          rules: { 'ts-ui-restrictions/require-ime-guard': 'error' },
        },
      ],
      { filename: 'on-key-down.mjs' },
    ),
  /requires type information/u,
);

console.info('eslint-plugin-ts-ui-restrictions ok');
