import { defineKnownRules, eslintConfigForNodeJs } from 'eslint-config-typed';
import * as assert from 'node:assert/strict';

// The config factories return flat-config objects a consumer can spread.
const nodeConfig = eslintConfigForNodeJs(['scripts/**']);

assert.equal(Array.isArray(nodeConfig) || typeof nodeConfig === 'object', true);

// `defineKnownRules` is the typed passthrough that rejects unknown rule names.
assert.deepStrictEqual(defineKnownRules({ 'no-await-in-loop': 'off' }), {
  'no-await-in-loop': 'off',
});

console.info('eslint-config-typed ok');
