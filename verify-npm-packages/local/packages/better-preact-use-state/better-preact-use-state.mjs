import * as bindings from 'better-preact-use-state';
import * as assert from 'node:assert/strict';

// The hooks need a renderer to call, so this checks the module loads under
// its peer dependency and exposes what it advertises.
assert.equal(typeof bindings.useState, 'function');
assert.equal(typeof bindings.useBoolState, 'function');

console.info('better-preact-use-state ok');
