import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginTsTypeForge;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

console.info('eslint-plugin-ts-type-forge ok');
