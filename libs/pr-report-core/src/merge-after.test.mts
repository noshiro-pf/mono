import {
  findMergeAfterCycles,
  parseMergeAfter,
  parseStartAfter,
} from './merge-after.mjs';

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

  // The fence markers and the column they sit in are what these two are about,
  // so the fixtures are arrays of lines rather than a template literal: what
  // `dedent` would remove is what is being tested.
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

  test('does not read a reference to another repository as this one’s', () => {
    assert.deepStrictEqual(parseMergeAfter('Merge-After: other/repo#5\n'), []);
  });

  test('does not read this repository written out by name either', () => {
    assert.deepStrictEqual(
      parseMergeAfter('Merge-After: noshiro-pf/mono#5\n'),
      [],
    );
  });

  test('reads the plain references beside one to another repository', () => {
    assert.deepStrictEqual(
      parseMergeAfter('Merge-After: #4, other/repo#5, #6,#7 (#8)\n'),
      [4, 6, 7, 8],
    );
  });

  test('does not read a number that runs on into a word', () => {
    assert.deepStrictEqual(parseMergeAfter('Merge-After: #5a, #6\n'), [6]);
  });
});

describe(parseStartAfter, () => {
  test('reads its own trailer as Merge-After is read', () => {
    assert.deepStrictEqual(
      parseStartAfter(
        'Waits for the parser.\n\nStart-After: #2162 #2207\nstart-after: other/repo#5, #2162\n',
      ),
      [2162, 2207],
    );
  });

  test('and not the other one’s', () => {
    assert.deepStrictEqual(parseStartAfter('Merge-After: #1901\n'), []);

    assert.deepStrictEqual(parseMergeAfter('Start-After: #1901\n'), []);
  });

  test('ignores a declaration inside a fenced code block', () => {
    assert.deepStrictEqual(
      parseStartAfter(['```md', 'Start-After: #2113', '```', ''].join('\n')),
      [],
    );
  });
});

describe(findMergeAfterCycles, () => {
  test('finds nothing in a chain', () => {
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map<number, readonly number[]>([
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
        new Map<number, readonly number[]>([
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
        new Map<number, readonly number[]>([
          [2, [1]],
          [1, [2]],
        ]),
      ),
      [[1, 2]],
    );
  });

  test('finds a pull request that declares itself', () => {
    assert.deepStrictEqual(
      findMergeAfterCycles(new Map<number, readonly number[]>([[7, [7]]])),
      [[7]],
    );
  });

  test('reports a cycle once however it is entered', () => {
    // 9 and 10 both lead into the same cycle, and the walk enters it from a
    // different node each time.
    assert.deepStrictEqual(
      findMergeAfterCycles(
        new Map<number, readonly number[]>([
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
        new Map<number, readonly number[]>([
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
    assert.deepStrictEqual(
      findMergeAfterCycles(new Map<number, readonly number[]>([[1, [2]]])),
      [],
    );
  });
});
