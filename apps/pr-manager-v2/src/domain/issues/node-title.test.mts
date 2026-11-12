import { fitTitle } from './node-title.mjs';

describe(fitTitle, () => {
  test('keeps a short title on one line', () => {
    assert.deepStrictEqual(fitTitle('Fix the zoom', 20), ['Fix the zoom']);
  });

  test('breaks at a space and ends a title too long with an ellipsis', () => {
    assert.deepStrictEqual(
      fitTitle('Draw the issue graph left to right with curved edges', 20),
      ['Draw the issue graph', 'left to right with…'],
    );
  });

  test('counts a wide character as two', () => {
    assert.deepStrictEqual(fitTitle('日本語の題名がとても長い場合', 10), [
      '日本語の題',
      '名がとて…',
    ]);
  });
});
