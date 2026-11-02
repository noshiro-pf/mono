import { asSafeUint } from 'ts-data-forge';
import { calcExpected } from './calc-expected.mjs';
import { countSuccess } from './count-success.mjs';

describe(calcExpected, () => {
  test('4-7-10, whose ratio is exactly 9, gives 8', () => {
    const count = countSuccess(4, 7, 10);

    assert.deepStrictEqual(count, {
      noLine: 160,
      oneLine: 832,
      twoLine: 304,
    });

    // -9 * 160 + 832 + 2 * 304 = 0, so the gain at N = 9 is not positive.
    assert.strictEqual(calcExpected(count), 8);
  });

  test('2-7-12 takes the largest integer below the ratio', () => {
    // (864 + 2 * 148) / 284 = 4.08...
    assert.strictEqual(
      calcExpected({
        noLine: asSafeUint(284),
        oneLine: asSafeUint(864),
        twoLine: asSafeUint(148),
      }),
      4,
    );
  });

  test.each([
    [0, 1000, 148],
    [1296, 0, 0],
  ] as const)(
    'returns 0 for noLine %d, oneLine %d, twoLine %d',
    (noLine, oneLine, twoLine) => {
      assert.strictEqual(
        calcExpected({
          noLine: asSafeUint(noLine),
          oneLine: asSafeUint(oneLine),
          twoLine: asSafeUint(twoLine),
        }),
        0,
      );
    },
  );
});
