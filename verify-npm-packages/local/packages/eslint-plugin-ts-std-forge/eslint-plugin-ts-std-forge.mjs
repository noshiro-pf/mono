import { eslintPluginTsStdForge } from 'eslint-plugin-ts-std-forge';
import * as assert from 'node:assert/strict';

const plugin = eslintPluginTsStdForge;

assert.equal(typeof plugin.rules, 'object');
assert.equal(Object.keys(plugin.rules).length > 0, true);
assert.equal(typeof plugin.configs.recommended, 'object');

console.info('eslint-plugin-ts-std-forge ok');
