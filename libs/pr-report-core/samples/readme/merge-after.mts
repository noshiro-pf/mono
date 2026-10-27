import { findMergeAfterCycles, parseMergeAfter } from 'pr-report-core';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const body = [
      'Adds the second half of the parser.',
      '',
      'Merge-After: #12, #14',
    ].join('\n');

    assert.deepStrictEqual(parseMergeAfter(body), [12, 14]);

    // #12 waits for #14 and #14 for #12: neither can ever merge first.
    const cycles = findMergeAfterCycles(
      new Map<number, readonly number[]>([
        [12, [14]],
        [14, [12]],
      ]),
    );

    assert.deepStrictEqual(cycles, [[12, 14]]);

    // embed-sample-code-ignore-below
  });
}
