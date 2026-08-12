import * as assert from 'node:assert/strict';
import * as bindings from 'synstate-preact-signals';

assert.equal(Object.keys(bindings).length > 0, true);

console.info('synstate-preact-signals ok');
