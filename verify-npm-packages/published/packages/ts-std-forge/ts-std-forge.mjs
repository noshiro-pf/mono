import * as assert from 'node:assert/strict';
import { Regex, SafeDate } from 'ts-std-forge';

// Only the package itself may be imported here: the check space resolves
// nothing else, so the Result values are inspected structurally.

// A dynamic pattern compiles into a working RegExp, without throwing.
const okRegex = Regex.create('^a+$', 'u');
assert.equal(
  okRegex.value instanceof RegExp && okRegex.value.test('aaa'),
  true,
);

// An invalid pattern comes back as an Err instead of a SyntaxError throw.
assert.equal(Regex.create('(').value instanceof SyntaxError, true);

// toISOString without the Invalid Date RangeError throw.
assert.equal(
  SafeDate.toISOString(new Date(0)).value,
  '1970-01-01T00:00:00.000Z',
);
assert.equal(
  SafeDate.toISOString(new Date(Number.NaN)).value instanceof RangeError,
  true,
);

console.info('ts-std-forge ok');
