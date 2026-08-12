import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginTsFortress;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

console.info('eslint-plugin-ts-fortress ok');
