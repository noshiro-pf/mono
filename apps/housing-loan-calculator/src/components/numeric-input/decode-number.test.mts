import { decodeNumber } from './decode-number.mjs';

describe(decodeNumber, () => {
  test.each([
    ['35', 35],
    ['-1.5', -1.5],
    ['1e3', 1000],
  ] as const)('reads %s as %d', (text, expected) => {
    assert.strictEqual(decodeNumber(text), expected);
  });

  test.each([
    ['1e400', '1e400', Number.POSITIVE_INFINITY],
    ['-1e400', '-1e400', Number.NEGATIVE_INFINITY],
    ['400 nines', '9'.repeat(400), Number.POSITIVE_INFINITY],
    ['0x and 300 fs', `0x${'f'.repeat(300)}`, Number.POSITIVE_INFINITY],
    ['Infinity', 'Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', '-Infinity', Number.NEGATIVE_INFINITY],
  ] as const)(
    'reads %s, a number too large for a double or Infinity itself, as an infinity',
    (_label, text, expected) => {
      assert.strictEqual(decodeNumber(text), expected);
    },
  );

  test.each(['', '-', '12px', 'NaN'])(
    'reads %s, which is no number, as NaN',
    (text) => {
      assert.isTrue(Number.isNaN(decodeNumber(text)));
    },
  );
});
