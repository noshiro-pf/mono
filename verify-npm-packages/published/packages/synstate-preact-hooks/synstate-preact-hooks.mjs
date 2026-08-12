import * as assert from 'node:assert/strict';
import * as bindings from 'synstate-preact-hooks';

assert.equal(Object.keys(bindings).length > 0, true);

console.info('synstate-preact-hooks ok');
