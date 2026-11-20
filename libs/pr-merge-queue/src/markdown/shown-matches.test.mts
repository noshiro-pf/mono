// cspell:ignore FFFC
import { shownMatches, shownOutsideMatches } from './shown-matches.mjs';

const KEYWORD = /fixes #(?<number>\d+)/gu;

describe(shownMatches, () => {
  test('reads a match over two lines, folded, with its lines', () => {
    assert.deepStrictEqual(shownMatches('A.\n\n**Fixes**\n#2', KEYWORD), [
      { groups: { number: '2' }, firstLine: 2, lastLine: 3 },
    ]);
  });
});

describe(shownOutsideMatches, () => {
  test('shows each line a match spans without it', () => {
    assert.deepStrictEqual(
      shownOutsideMatches('A.\n\nWe do `x`. Fixes\n#2 and #3.', KEYWORD),
      new Map<number, string>([
        [2, 'We do \u{FFFC}. '],
        [3, ' and #3.'],
      ]),
    );
  });

  test('shows an empty line for a line the match alone is on', () => {
    assert.deepStrictEqual(
      shownOutsideMatches('Fixes #2\n\n| Fixes #3 | #4 |\n| - | - |', KEYWORD),
      new Map<number, string>([
        [0, ''],
        [2, '#4'],
      ]),
    );
  });
});
