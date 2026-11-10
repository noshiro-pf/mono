import {
  closingKeywordIssuesInHtml,
  closingKeywordIssuesInText,
} from './closing-keywords.mjs';

const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

describe(closingKeywordIssuesInHtml, () => {
  // #1962, whose base is another pull request's branch: GitHub marks the
  // keyword, and `closingIssuesReferences` is empty.
  test('reads a keyword GitHub marked in a pull request on another base', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        `<p dir="auto"><span class="issue-keyword">Closes</span> ${link('noshiro-pf/mono', 2043)}.</p>`,
      ),
      [2043],
    );
  });

  // #2126, on `main`: the same mark with a tooltip.
  test('reads a keyword GitHub marked in a pull request on the default branch', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        `<p dir="auto"><span class="issue-keyword tooltipped tooltipped-se" aria-label="This pull request closes issue #2122.">Closes</span> ${link('noshiro-pf/mono', 2122)}.</p>`,
      ),
      [2122],
    );
  });

  test('reads past text between the keyword and the reference', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        `<p dir="auto"><span class="issue-keyword">Fixes</span>: ${link('noshiro-pf/mono', 12)}</p>`,
      ),
      [12],
    );
  });

  test('lists each issue once, in the order the body gives them', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        [
          `<p dir="auto"><span class="issue-keyword">Closes</span> ${link('noshiro-pf/mono', 20)}, <span class="issue-keyword">closes</span> ${link('noshiro-pf/mono', 10)}.</p>`,
          `<p dir="auto"><span class="issue-keyword">Resolves</span> ${link('noshiro-pf/mono', 20)}</p>`,
        ].join('\n'),
      ),
      [20, 10],
    );
  });

  test('leaves out a reference GitHub did not mark as closed by a keyword', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        [
          `<p dir="auto">See ${link('noshiro-pf/mono', 12)}.</p>`,
          '<p dir="auto"><code class="notranslate">Closes #13</code></p>',
        ].join('\n'),
      ),
      [],
    );
  });

  // #2022 closes an issue in a private repository.
  test("leaves out another repository's issue, which `#N` would misname", () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        `<p dir="auto"><span class="issue-keyword">Closes</span> ${link('noshiro-pf/mono-security', 13)}, <span class="issue-keyword">closes</span> ${link('Noshiro-PF/Mono', 14)}.</p>`,
      ),
      [14],
    );
  });

  test('leaves out a pull request, which no keyword closes', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInHtml(
        repo,
        `<p dir="auto"><span class="issue-keyword">Fixes</span> ${link('noshiro-pf/mono', 1962, 'pull_request')}</p>`,
      ),
      [],
    );
  });
});

/**
 * A reference as GitHub renders it in a pull request's `bodyHTML`, with the
 * attributes in the order GitHub writes them.
 */
const link = (
  nameWithOwner: string,
  number: number,
  hovercardType: string = 'issue',
): string =>
  [
    '<a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="5550641953" data-permission-text="Title is private"',
    ` data-url="https://github.com/${nameWithOwner}/issues/${number}"`,
    ` data-hovercard-type="${hovercardType}"`,
    ` data-hovercard-url="/${nameWithOwner}/issues/${number}/hovercard"`,
    ` href="https://github.com/${nameWithOwner}/issues/${number}">#${number}</a>`,
  ].join('');

describe(closingKeywordIssuesInText, () => {
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
        closingKeywordIssuesInText(repo, `${keyword} #12`),
        [12],
      );
    }
  });

  test('is case-insensitive and accepts the colon form', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInText(repo, 'Closes: #12'),
      [12],
    );
  });

  test('reads a full URL, but only for this repository', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInText(
        repo,
        'Fixes https://github.com/noshiro-pf/mono/issues/34',
      ),
      [34],
    );

    assert.deepStrictEqual(
      closingKeywordIssuesInText(
        repo,
        'Fixes https://github.com/someone/else/issues/34',
      ),
      [],
    );
  });

  test('a bare reference is not a link', () => {
    // `#12` on its own is a cross-reference; GitHub closes nothing for it, and
    // neither does this.
    assert.deepStrictEqual(closingKeywordIssuesInText(repo, 'see #12'), []);
  });

  test('ignores fenced code, like `Merge-After:` does', () => {
    const body = ['```markdown', 'Closes #12', '```', 'Closes #13'].join('\n');

    assert.deepStrictEqual(closingKeywordIssuesInText(repo, body), [13]);
  });

  test('deduplicates and keeps the first occurrence order', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInText(repo, 'Closes #5\nFixes #3\nResolves #5'),
      [5, 3],
    );
  });

  test('reads a URL of this repository whatever its case', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesInText(
        repo,
        'Fixes https://github.com/Noshiro-PF/Mono/issues/34',
      ),
      [34],
    );
  });
});
