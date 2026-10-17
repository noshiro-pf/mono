import { eslintPluginSynstate } from 'eslint-plugin-synstate';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginSynstate;

assert.equal(typeof plugin.rules['no-unbounded-counter-pipe'], 'object');
assert.equal(typeof plugin.configs.recommended, 'object');

console.info('eslint-plugin-synstate ok');
