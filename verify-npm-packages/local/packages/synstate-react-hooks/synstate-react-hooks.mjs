import * as assert from 'node:assert/strict';
import * as bindings from 'synstate-react-hooks';

// The hooks need a renderer to call, so this checks the module loads under
// its peer dependency and exposes what it advertises.
assert.equal(typeof bindings.useObservableValue, 'function');

console.info('synstate-react-hooks ok');
