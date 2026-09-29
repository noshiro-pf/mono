import { closingIssuesIn, closingKeywordIssuesIn } from './closing-issues.mjs';

describe(closingIssuesIn, () => {
  const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

  const issue = (number: number, nameWithOwner: string, state: string) =>
    ({
      number,
      title: `Issue ${number}`,
      url: `https://github.com/${nameWithOwner}/issues/${number}`,
      state,
      repository: { nameWithOwner },
    }) as const;

  test('keeps the issues of this repository', () => {
    assert.deepStrictEqual(
      closingIssuesIn(repo, [issue(12, 'noshiro-pf/mono', 'OPEN')]),
      [
        {
          number: 12,
          title: 'Issue 12',
          url: 'https://github.com/noshiro-pf/mono/issues/12',
          state: 'open',
        },
      ],
    );
  });

  test("leaves out another repository's issue, which `#N` would misname", () => {
    assert.deepStrictEqual(
      closingIssuesIn(repo, [
        issue(13, 'noshiro-pf/other', 'CLOSED'),
        issue(14, 'noshiro-pf/mono', 'CLOSED'),
      ]).map(({ number }) => number),
      [14],
    );
  });

  test('matches the repository the way GitHub does, whatever the case', () => {
    assert.strictEqual(
      closingIssuesIn(repo, [issue(12, 'Noshiro-PF/Mono', 'OPEN')]).length,
      1,
    );
  });

  test('skips an issue the token may not see', () => {
    assert.deepStrictEqual(
      closingIssuesIn(repo, [null, issue(12, 'noshiro-pf/mono', 'CLOSED')]).map(
        ({ state }) => state,
      ),
      ['closed'],
    );
  });

  test('says unknown for a state it does not know', () => {
    assert.strictEqual(
      closingIssuesIn(repo, [issue(12, 'noshiro-pf/mono', 'DRAFT')])[0]?.state,
      'unknown',
    );
  });
});

describe(closingKeywordIssuesIn, () => {
  const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

  // #1962, whose base is another pull request's branch: GitHub marks the
  // keyword, and `closingIssuesReferences` is empty.
  test('reads a keyword GitHub marked in a pull request on another base', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesIn(
        repo,
        `<p dir="auto"><span class="issue-keyword">Closes</span> ${link('noshiro-pf/mono', 2043)}.</p>`,
      ),
      [2043],
    );
  });

  // #2126, on `main`: the same mark with a tooltip.
  test('reads a keyword GitHub marked in a pull request on the default branch', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesIn(
        repo,
        `<p dir="auto"><span class="issue-keyword tooltipped tooltipped-se" aria-label="This pull request closes issue #2122.">Closes</span> ${link('noshiro-pf/mono', 2122)}.</p>`,
      ),
      [2122],
    );
  });

  test('reads past text between the keyword and the reference', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesIn(
        repo,
        `<p dir="auto"><span class="issue-keyword">Fixes</span>: ${link('noshiro-pf/mono', 12)}</p>`,
      ),
      [12],
    );
  });

  test('lists each issue once, in the order the body gives them', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesIn(
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
      closingKeywordIssuesIn(
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
      closingKeywordIssuesIn(
        repo,
        `<p dir="auto"><span class="issue-keyword">Closes</span> ${link('noshiro-pf/mono-security', 13)}, <span class="issue-keyword">closes</span> ${link('Noshiro-PF/Mono', 14)}.</p>`,
      ),
      [14],
    );
  });

  test('leaves out a pull request, which no keyword closes', () => {
    assert.deepStrictEqual(
      closingKeywordIssuesIn(
        repo,
        `<p dir="auto"><span class="issue-keyword">Fixes</span> ${link('noshiro-pf/mono', 1962, 'pull_request')}</p>`,
      ),
      [],
    );
  });
});

/**
 * A reference as GitHub renders it in a pull request's `bodyHTML`, with
 * the attributes in the order GitHub writes them.
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
