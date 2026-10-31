import dedent from 'dedent';
import { formatLineRanges, parseAddedLines } from './diff-lines.mjs';

describe('parseAddedLines', () => {
  test('reads the new side of each -U0 hunk', () => {
    const diff = dedent`
      diff --git a/src/a.mts b/src/a.mts
      index 1111111..2222222 100644
      --- a/src/a.mts
      +++ b/src/a.mts
      @@ -3 +3 @@ export const a = 1;
      -old
      +new
      @@ -10,0 +11,3 @@
      +x
      +y
      +z
      @@ -20,2 +23,0 @@
      -gone
      -gone
    `;

    assert.deepStrictEqual(
      parseAddedLines(diff),
      new Map<string, readonly number[]>([['src/a.mts', [3, 11, 12, 13]]]),
    );
  });

  test('a new file counts from line 1; a deleted or binary file has no lines', () => {
    const diff = dedent`
      diff --git a/new.mts b/new.mts
      new file mode 100644
      --- /dev/null
      +++ b/new.mts
      @@ -0,0 +1,2 @@
      +a
      +b
      diff --git a/old.mts b/old.mts
      deleted file mode 100644
      --- a/old.mts
      +++ /dev/null
      @@ -1,2 +0,0 @@
      -a
      -b
      diff --git a/img.png b/img.png
      Binary files a/img.png and b/img.png differ
    `;

    assert.deepStrictEqual(
      parseAddedLines(diff),
      new Map<string, readonly number[]>([['new.mts', [1, 2]]]),
    );
  });

  test('an added line that reads like a header is not one', () => {
    const diff = dedent`
      diff --git a/a.md b/a.md
      --- a/a.md
      +++ b/a.md
      @@ -1 +1,2 @@
      --- a/x.md
      +++ b/elsewhere.md
      +@@ -1 +1 @@
    `;

    assert.deepStrictEqual(
      parseAddedLines(diff),
      new Map<string, readonly number[]>([['a.md', [1, 2]]]),
    );
  });

  test('drops the tab git ends a path holding a space with', () => {
    const diff = [
      'diff --git a/my file.mts b/my file.mts',
      '--- a/my file.mts\t',
      '+++ b/my file.mts\t',
      '@@ -1 +1 @@',
      '-a',
      '+b',
    ].join('\n');

    assert.deepStrictEqual(
      parseAddedLines(diff),
      new Map<string, readonly number[]>([['my file.mts', [1]]]),
    );
  });

  test('nothing in, nothing out', () => {
    assert.deepStrictEqual(
      parseAddedLines(''),
      new Map<string, readonly number[]>(),
    );
  });
});

describe('formatLineRanges', () => {
  test('collapses runs, in order, whatever order they came in', () => {
    assert.strictEqual(formatLineRanges([9, 3, 5, 4, 12, 13]), '3-5, 9, 12-13');
  });

  test('ignores duplicates', () => {
    assert.strictEqual(formatLineRanges([1, 1, 2]), '1-2');
  });

  test('counts the ranges past the limit instead of listing them', () => {
    assert.strictEqual(
      formatLineRanges([1, 3, 4, 6, 8], 2),
      '1, 3-4 … (2 more ranges)',
    );

    assert.strictEqual(formatLineRanges([1, 3], 2), '1, 3');
  });

  test('an empty list is an empty string', () => {
    assert.strictEqual(formatLineRanges([]), '');
  });
});
