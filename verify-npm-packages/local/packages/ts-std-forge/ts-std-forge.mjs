// cspell:ignore ababab
import * as assert from 'node:assert/strict';
import { Regex, SafeDate, SafeNumber, SafeString } from 'ts-std-forge';

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

// Number formatting without the RangeError throws on out-of-range digits.
assert.equal(SafeNumber.toFixed(1.005, 2).value, '1.00');
assert.equal(SafeNumber.toFixed(1, 101).value instanceof RangeError, true);
assert.equal(SafeNumber.toExponential(123456, 2).value, '1.23e+5');
assert.equal(
  SafeNumber.toExponential(1, 101).value instanceof RangeError,
  true,
);
assert.equal(SafeNumber.toPrecision(123.456, 4).value, '123.5');
assert.equal(SafeNumber.toPrecision(1, 0).value instanceof RangeError, true);
assert.equal(SafeNumber.toStringWithRadix(255, 16).value, 'ff');
assert.equal(
  SafeNumber.toStringWithRadix(1, 37).value instanceof RangeError,
  true,
);

// String building without the RangeError throws on invalid arguments.
assert.equal(SafeString.fromCodePoint(0x61, 0x1f600).value, 'a😀');
assert.equal(
  SafeString.fromCodePoint(0x110000).value instanceof RangeError,
  true,
);
// NFD decomposes U+00C5 into U+0041 + U+030A (written as escapes, because
// source literals in the two normalization forms look identical).
assert.equal(SafeString.normalize('\u00C5', 'NFD').value, 'A\u030A');
assert.equal(SafeString.repeat('ab', 3).value, 'ababab');
assert.equal(SafeString.repeat('ab', -1).value instanceof RangeError, true);

console.info('ts-std-forge ok');
