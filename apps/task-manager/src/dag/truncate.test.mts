import { textWidthUnits, truncateToUnits } from './truncate.mjs';

describe(textWidthUnits, () => {
  test('counts a wide character as two units and others as one', () => {
    assert.strictEqual(textWidthUnits('abc'), 3);

    assert.strictEqual(textWidthUnits('設計'), 4);

    assert.strictEqual(textWidthUnits('UI設計'), 6);

    assert.strictEqual(textWidthUnits('ｶﾀｶﾅ'), 4);
  });
});

describe(truncateToUnits, () => {
  test('leaves text that fits alone', () => {
    assert.strictEqual(truncateToUnits('設計', 4), '設計');
  });

  test('cuts text that does not fit, ending it with an ellipsis', () => {
    assert.strictEqual(truncateToUnits('abcdefgh', 5), 'abcd…');

    assert.strictEqual(truncateToUnits('設計と実装', 6), '設計…');
  });

  test('does not split a surrogate pair', () => {
    assert.strictEqual(truncateToUnits('😀😀😀', 5), '😀😀…');
  });
});
