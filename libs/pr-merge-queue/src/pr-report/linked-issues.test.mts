import { parseClosingIssueRefs } from './linked-issues.mjs';

const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

describe(parseClosingIssueRefs, () => {
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

    assert.deepStrictEqual(parseClosingIssueRefs('FIXES #12', repo), [12]);

    assert.deepStrictEqual(
      parseClosingIssueRefs('RESOLVED https://github.com/X/Y/issues/7', {
        owner: 'x',
        name: 'y',
      }),
      [7],
    );
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

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/noshiro-pf/mono-extra/issues/34',
        repo,
      ),
      [],
    );
  });

  test('folds ASCII alone', () => {
    for (const body of [
      'clo\u{017F}es #12',
      'Fixes http\u{017F}://github.com/noshiro-pf/mono/issues/5',
      'Fixes https://github.com/noshiro-pf/mono/i\u{017F}\u{017F}ues/5',
    ]) {
      assert.deepStrictEqual(parseClosingIssueRefs(body, repo), []);
    }

    assert.deepStrictEqual(
      parseClosingIssueRefs('Fixes https://github.com/\u{212A}it/x/issues/7', {
        owner: 'kit',
        name: 'x',
      }),
      [],
    );
  });

  // GitHub's owner and repository names are case-insensitive, as
  // `closingKeywordIssuesIn` and `closingIssuesIn` read them.
  test("matches this repository's URL whatever its case", () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/Noshiro-PF/Mono/issues/34',
        repo,
      ),
      [34],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/noshiro-pf/mono/issues/34',
        {
          owner: 'Noshiro-PF',
          name: 'Mono',
        },
      ),
      [34],
    );
  });

  test('a bare reference is not a link', () => {
    // `#12` on its own is a cross-reference; GitHub closes nothing for it, and
    // neither does this.
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
