import { selected3List } from '../constants/index.mjs';
import { countSuccess } from './count-success.mjs';

describe('countSuccess', () => {
  test('the three counters partition all 6^4 rolls', () => {
    const offBy = selected3List().filter((triple) => {
      const { noLine, oneLine, twoLine } = countSuccess(...triple);

      return noLine + oneLine + twoLine !== 6 ** 4;
    });

    assert.deepStrictEqual(offBy, []);
  });

  test('a known triple', () => {
    assert.deepStrictEqual(countSuccess(2, 7, 12), {
      oneLine: 864,
      twoLine: 148,
      noLine: 284,
    });
  });

  test('the widest spread of adjacent columns beats the narrowest', () => {
    // 6, 7 and 8 are the likeliest two-dice sums, 2, 3 and 4 the least likely.
    expect(countSuccess(6, 7, 8).noLine).toBeLessThan(
      countSuccess(2, 3, 4).noLine,
    );
  });
});
