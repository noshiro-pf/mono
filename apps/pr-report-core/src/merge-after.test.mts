import { findMergeAfterCycles, parseMergeAfter } from './merge-after.mjs';

describe(parseMergeAfter, () => {
  test('reads one reference from a trailer', () => {
    assert.deepStrictEqual(
      parseMergeAfter('Adds the parser.\n\nMerge-After: #1901\n'),
      [1901],
    );
  });

  test('reads several references from one line and from several lines', () => {
    assert.deepStrictEqual(
      parseMergeAfter(
        'Merge-After: #1901, #1903\nmerge-after:#1899 and #1900\n',
      ),
      [1901, 1903, 1899, 1900],
    );
  });

  test('is case-insensitive and tolerates surrounding whitespace', () => {
    assert.deepStrictEqual(
      parseMergeAfter('   MERGE-AFTER  :   #1901   \n'),
      [1901],
    );
  });

  test('drops duplicates', () => {
    assert.deepStrictEqual(
      parseMergeAfter('Merge-After: #1901\nMerge-After: #1901, #1902\n'),
      [1901, 1902],
    );
  });

  test('reads only the trailer, not a mention of a pull request in prose', () => {
    assert.deepStrictEqual(
      parseMergeAfter(
        'This supersedes #1800 and should land after #1901.\n\nSee also #1902.\n',
      ),
      [],
    );
  });

  test('ignores a trailer that is not at the start of a line', () => {
    assert.deepStrictEqual(
      parseMergeAfter('Do not write Merge-After: #1901 in a sentence.\n'),
      [],
    );
  });

  // The fence markers and the column they sit in are what these two are
  // about, so the fixtures are arrays of lines rather than a template
  // literal: what `dedent` would remove is what is being tested.
  test('ignores a trailer inside a fenced code block', () => {
    assert.deepStrictEqual(
      parseMergeAfter(
        [
          'Write the order like this:',
          '',
          '```markdown',
          'Merge-After: #1901',
          '```',
          '',
          'Merge-After: #1903',
          '',
        ].join('\n'),
      ),
      [1903],
    );
  });

  test('ignores a trailer inside a tilde-fenced block', () => {
    assert.deepStrictEqual(
      parseMergeAfter(['~~~', 'Merge-After: #1901', '~~~', ''].join('\n')),
      [],
    );
  });

  test('reads a body with the CRLF line endings GitHub returns', () => {
    assert.deepStrictEqual(
      parseMergeAfter('Adds the parser.\r\n\r\nMerge-After: #1901\r\n'),
      [1901],
    );
  });

  test('is empty for a body with nothing in it', () => {
    assert.deepStrictEqual(parseMergeAfter(''), []);
  });
});

describe(findMergeAfterCycles, () => {
  test('finds nothing in a chain', () => {
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map([
          [3, [2]],
          [2, [1]],
          [1, []],
        ]),
      ),
      [],
    );
  });

  test('finds nothing in a diamond', () => {
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map([
          [4, [2, 3]],
          [3, [1]],
          [2, [1]],
          [1, []],
        ]),
      ),
      [],
    );
  });

  test('finds a two-node cycle, starting at its lowest number', () => {
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map([
          [2, [1]],
          [1, [2]],
        ]),
      ),
      [[1, 2]],
    );
  });

  test('finds a pull request that declares itself', () => {
    assert.deepStrictEqual(findMergeAfterCycles(new Map([[7, [7]]])), [[7]]);
  });

  test('reports a cycle once however it is entered', () => {
    // 9 and 10 both lead into the same cycle, and the walk enters it from a
    // different node each time.
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map([
          [9, [1]],
          [10, [2]],
          [1, [2]],
          [2, [3]],
          [3, [1]],
        ]),
      ),
      [[1, 2, 3]],
    );
  });

  test('finds two independent cycles', () => {
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map([
          [1, [2]],
          [2, [1]],
          [5, [6]],
          [6, [5]],
        ]),
      ),
      [
        [1, 2],
        [5, 6],
      ],
    );
  });

  test('follows an edge to a pull request that declared nothing', () => {
    assert.deepStrictEqual(findMergeAfterCycles(new Map([[1, [2]]])), []);
  });
});
