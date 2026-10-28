import { sameLabel, withLabelsAdded } from './labels.mjs';

describe(withLabelsAdded, () => {
  test('adds each label not there yet', () => {
    assert.deepStrictEqual(withLabelsAdded(['a'], ['ui', 'b']), [
      'a',
      'ui',
      'b',
    ]);

    assert.deepStrictEqual(withLabelsAdded(['a'], ['a']), ['a']);

    assert.deepStrictEqual(withLabelsAdded(['a'], []), ['a']);
  });

  test('adds once two labels that differ only in case', () => {
    assert.deepStrictEqual(withLabelsAdded([], ['foo', 'FOO', 'x']), [
      'foo',
      'x',
    ]);

    assert.deepStrictEqual(withLabelsAdded(['UI'], ['ui']), ['UI']);
  });
});

describe(sameLabel, () => {
  test('ignores case and width', () => {
    assert.isTrue(sameLabel('UI', 'ui'));

    assert.isTrue(sameLabel('ＵＩ', 'ui'));

    assert.isFalse(sameLabel('ui', 'ux'));

    assert.isTrue(sameLabel('ﾃﾞｻﾞｲﾝ', 'デザイン'));

    assert.isFalse(sameLabel('v²', 'v2'));
  });
});
