import { formatLabels, parseLabels } from './labels.mjs';

describe(parseLabels, () => {
  test('splits on ASCII and Japanese commas, and trims', () => {
    assert.deepStrictEqual(parseLabels(' docs, ui、設計，バグ '), [
      'docs',
      'ui',
      '設計',
      'バグ',
    ]);
  });

  test('drops empty entries and repeats', () => {
    assert.deepStrictEqual(parseLabels('a,, a ,b,'), ['a', 'b']);

    assert.deepStrictEqual(parseLabels(' '.repeat(3)), []);
  });
});

describe(formatLabels, () => {
  test('joins with a comma, which parseLabels reads back', () => {
    assert.strictEqual(formatLabels(['a', 'b']), 'a, b');

    assert.deepStrictEqual(parseLabels(formatLabels(['x', 'y z'])), [
      'x',
      'y z',
    ]);
  });
});
