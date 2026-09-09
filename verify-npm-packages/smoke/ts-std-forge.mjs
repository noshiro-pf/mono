// cspell:ignore ababab
import * as assert from 'node:assert/strict';
import {
  Optional,
  pipe,
  Regex,
  Result,
  SafeDate,
  SafeNumber,
  SafeString,
} from 'ts-std-forge';

// Only the package itself may be imported here: the check space resolves
// nothing else. That is no longer a limitation for the Result values — the
// algebraic data types ship from this package since the D-49 port — but the
// structural assertions are kept as they are, because they also pin the
// runtime shape the tags give. The number formatters are total (their digit /
// radix parameters are literal-range typed), so they return plain strings;
// the remaining fallible wrappers return plain tagged errors.

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

// Number formatting: total via literal-range parameter types.
assert.equal(SafeNumber.toFixed(1.005, 2), '1.00');
assert.equal(SafeNumber.toExponential(123456, 2), '1.23e+5');
assert.equal(SafeNumber.toPrecision(123.456, 4), '123.5');
assert.equal(SafeNumber.toStringWithRadix(255, 16), 'ff');

// Constructor-call alternatives (D-15): Number(str) without the NaN sentinel,
// String(x) for the primitives a template literal cannot take.
assert.equal(SafeNumber.parse(' 0x10 ').value, 16);
assert.deepEqual(SafeNumber.parse('Infinity').value, {
  kind: 'invalid-number',
  input: 'Infinity',
});
assert.equal(SafeNumber.parseInteger('-12.9').value, -12);
assert.deepEqual(SafeNumber.parseInteger('123abc').value, {
  kind: 'invalid-integer',
  input: '123abc',
});
assert.equal(SafeString.fromPrimitive(Symbol('tag')), 'Symbol(tag)');
assert.equal(SafeString.fromPrimitive(10n), '10');

// String building: invalid code points come back as tagged errors.
assert.equal(SafeString.fromCodePoint(0x61, 0x1f600).value, 'a\u{1f600}');
assert.deepEqual(SafeString.fromCodePoint(0x110000).value, {
  kind: 'invalid-code-point',
  codePoint: 0x110000,
  index: 0,
});
// NFD decomposes U+00C5 into U+0041 + U+030A (written as escapes, because
// source literals in the two normalization forms look identical). normalize
// is total and returns the string directly.
assert.equal(SafeString.normalize('\u00C5', 'NFD'), 'A\u030A');
assert.equal(SafeString.repeat('ab', 3).value, 'ababab');
assert.deepEqual(SafeString.repeat('ab', -1).value, {
  kind: 'invalid-count',
  count: -1,
});

// The ported ADT core (D-49 stage 1): the same package now provides the
// Result / Optional / pipe the wrappers above return into.
assert.equal(Result.isOk(SafeNumber.parse('1.5')), true);
assert.equal(Result.unwrapOkOr(SafeNumber.parse('x'), 0), 0);
assert.equal(Optional.unwrapOr(Optional.some(1), 0), 1);
assert.equal(Optional.unwrapOr(Optional.fromNullable(undefined), 0), 0);
assert.equal(
  pipe(' 2 ')
    .map((s) => s.trim())
    .map((s) => Result.unwrapOkOr(SafeNumber.parse(s), 0)).value,
  2,
);

console.info('ts-std-forge ok');
