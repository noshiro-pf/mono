import { parseClosingIssueRefs } from './linked-issues.mjs';

const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

describe('parseClosingIssueRefs', () => {
  test('reads every keyword GitHub reads', () => {
    for (const keyword of [
      'close',
      'closes',
      'closed',
      'fix',
      'fixes',
      'fixed',
      'resolve',
      'resolves',
      'resolved',
    ]) {
      assert.deepStrictEqual(
        parseClosingIssueRefs(`${keyword} #12`, repo),
        [12],
      );
    }
  });

  test('is case-insensitive and accepts the colon form', () => {
    assert.deepStrictEqual(parseClosingIssueRefs('Closes: #12', repo), [12]);
  });

  test('reads a full URL, but only for this repository', () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/noshiro-pf/mono/issues/34',
        repo,
      ),
      [34],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/someone/else/issues/34',
        repo,
      ),
      [],
    );
  });

  test('a bare reference is not a link', () => {
    // `#12` on its own is a cross-reference; GitHub closes nothing for it,
    // and neither does this.
    assert.deepStrictEqual(parseClosingIssueRefs('see #12', repo), []);
  });

  test('ignores fenced code, like `Merge-After:` does', () => {
    const body = ['```markdown', 'Closes #12', '```', 'Closes #13'].join('\n');

    assert.deepStrictEqual(parseClosingIssueRefs(body, repo), [13]);
  });

  test('deduplicates and keeps the first occurrence order', () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs('Closes #5\nFixes #3\nResolves #5', repo),
      [5, 3],
    );
  });
});
