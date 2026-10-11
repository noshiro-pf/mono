import { wrapTitle } from './node-title.mjs';

describe(wrapTitle, () => {
  test('keeps a title that fits on one line', () => {
    assert.deepStrictEqual(wrapTitle('Fix the parser', 20, 2), [
      'Fix the parser',
    ]);
  });

  test('breaks after a space in the later part of the line', () => {
    assert.deepStrictEqual(
      wrapTitle('pr-report-core: read Start-After', 20, 2),
      ['pr-report-core: read', 'Start-After'],
    );
  });

  test('breaks between characters when there is no space to break at', () => {
    assert.deepStrictEqual(wrapTitle('0123456789', 4, 3), [
      '0123',
      '4567',
      '89',
    ]);
  });

  test('counts a CJK character as two', () => {
    assert.deepStrictEqual(wrapTitle('依存先の破壊的変更', 8, 2), [
      '依存先の',
      '破壊的…',
    ]);
  });

  test('cuts the last line with an ellipsis', () => {
    assert.deepStrictEqual(wrapTitle('one two three four five', 9, 2), [
      'one two',
      'three fo…',
    ]);
  });

  test('is no lines for an empty title', () => {
    assert.deepStrictEqual(wrapTitle('  ', 9, 2), []);
  });
});
