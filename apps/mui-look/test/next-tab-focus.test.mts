import { nextTabFocus } from '../src/index.mjs';

describe(nextTabFocus, () => {
  test('moves right and left, wrapping around at either end', () => {
    assert.strictEqual(nextTabFocus('ArrowRight', 0, 3), 1);

    assert.strictEqual(nextTabFocus('ArrowRight', 2, 3), 0);

    assert.strictEqual(nextTabFocus('ArrowLeft', 1, 3), 0);

    assert.strictEqual(nextTabFocus('ArrowLeft', 0, 3), 2);
  });

  test('jumps to the first tab on Home and the last on End', () => {
    assert.strictEqual(nextTabFocus('Home', 2, 3), 0);

    assert.strictEqual(nextTabFocus('End', 0, 3), 2);
  });

  test('moves nothing for another key, or when there is no tab', () => {
    assert.isUndefined(nextTabFocus('Enter', 0, 3));

    assert.isUndefined(nextTabFocus('ArrowDown', 0, 3));

    assert.isUndefined(nextTabFocus('ArrowRight', 0, 0));
  });
});
