// cspell:ignore ababab
import * as assert from 'node:assert/strict';
import { Regex, SafeDate, SafeNumber, SafeString } from 'ts-std-forge';

// Only the package itself may be imported here: the check space resolves
// nothing else, so the Result values are inspected structurally. Failures
// are plain tagged errors (validate-first design), so the assertions match
// on `kind` rather than on Error classes.

// A dynamic pattern compiles into a working RegExp, without throwing.
const okRegex = Regex.create('^a+$', 'u');
assert.equal(
  okRegex.value instanceof RegExp && okRegex.value.test('aaa'),
  true,
);

// An invalid pattern comes back as a tagged Err carrying the SyntaxError.
const errRegex = Regex.create('(');
assert.equal(errRegex.value.kind, 'invalid-regexp');
assert.equal(errRegex.value.cause instanceof SyntaxError, true);

// toISOString without the Invalid Date RangeError throw.
assert.equal(
  SafeDate.toISOString(new Date(0)).value,
  '1970-01-01T00:00:00.000Z',
);
assert.deepEqual(SafeDate.toISOString(new Date(Number.NaN)).value, {
  kind: 'invalid-date',
});

// Number formatting: out-of-range arguments come back as tagged errors.
assert.equal(SafeNumber.toFixed(1.005, 2).value, '1.00');
assert.deepEqual(SafeNumber.toFixed(1, 101).value, {
  kind: 'fraction-digits-out-of-range',
  fractionDigits: 101,
});
assert.equal(SafeNumber.toExponential(123456, 2).value, '1.23e+5');
assert.deepEqual(SafeNumber.toExponential(1, 101).value, {
  kind: 'fraction-digits-out-of-range',
  fractionDigits: 101,
});
assert.equal(SafeNumber.toPrecision(123.456, 4).value, '123.5');
assert.deepEqual(SafeNumber.toPrecision(1, 0).value, {
  kind: 'precision-out-of-range',
  precision: 0,
});
assert.equal(SafeNumber.toStringWithRadix(255, 16).value, 'ff');
assert.deepEqual(SafeNumber.toStringWithRadix(1, 37).value, {
  kind: 'radix-out-of-range',
  radix: 37,
});

// String building: invalid arguments come back as tagged errors.
assert.equal(SafeString.fromCodePoint(0x61, 0x1f600).value, 'a\u{1f600}');
assert.deepEqual(SafeString.fromCodePoint(0x110000).value, {
  kind: 'invalid-code-point',
  codePoint: 0x110000,
  index: 0,
});
// NFD decomposes U+00C5 into U+0041 + U+030A (written as escapes, because
// source literals in the two normalization forms look identical). normalize
// is total — its form parameter's union type excludes the only failure — so
// it returns the string directly.
assert.equal(SafeString.normalize('\u00C5', 'NFD'), 'A\u030A');
assert.equal(SafeString.repeat('ab', 3).value, 'ababab');
assert.deepEqual(SafeString.repeat('ab', -1).value, {
  kind: 'invalid-count',
  count: -1,
});

console.info('ts-std-forge ok');
